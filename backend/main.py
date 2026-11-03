"""
PayShield Core API - FastAPI Backend
Implements the 4-stage pipeline: Validate -> Context -> Risk Engine -> Intervention
Provides real-time event synchronization for Member App, Guardian App, and Admin Console.
"""
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any
import datetime
import uuid

from models import TransactionAssessRequest, RiskAssessmentResponse, ResponseTier
from risk_engine import assess_coercion_risk
from payee_registry import SYNTHETIC_PAYEE_DATABASE, lookup_payee
from scenarios import BENCHMARK_SCENARIOS

app = FastAPI(
    title="PayShield API",
    description="Interrupting Coerced Payments Before They Complete (FIN-11 · Vishwakarandak '26)",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-Memory State store for synchronization
SYNC_STORE = {
    "active_cases": [
        {
            "id": "case-aarav",
            "user_name": "Aarav Mehta",
            "initials": "AM",
            "amount": 85000.0,
            "payee_name": "Rakesh Verma (··4471)",
            "payee_upi": "cbi.verification@okaxis",
            "status": "Held",
            "time_ago": "4m ago",
            "risk_score": 0.98,
            "on_call": True,
            "amount_multiplier": 21.2,
            "is_new_payee": True,
            "story": "Government verification penalty under CBI notice",
            "contradiction": "Recipient is a 2-day-old personal account with 14 incoming deposits today.",
            "created_at": datetime.datetime.now().isoformat()
        },
        {
            "id": "case-kavita",
            "user_name": "Kavita Joshi",
            "initials": "KJ",
            "amount": 32000.0,
            "payee_name": "FastKYC Services (··9012)",
            "payee_upi": "fastkyc.update@paytm",
            "status": "Held",
            "time_ago": "18m ago",
            "risk_score": 0.84,
            "on_call": True,
            "amount_multiplier": 8.0,
            "is_new_payee": True,
            "story": "SIM card deactivation warning fee",
            "contradiction": "Account registered to private individual Suresh Patil.",
            "created_at": datetime.datetime.now().isoformat()
        },
        {
            "id": "case-nitin",
            "user_name": "Nitin Rao",
            "initials": "NR",
            "amount": 9500.0,
            "payee_name": "Airtel Broadband Official",
            "payee_upi": "airtel.pay@airtel",
            "status": "Released",
            "time_ago": "1h ago",
            "risk_score": 0.22,
            "on_call": False,
            "amount_multiplier": 1.2,
            "is_new_payee": False,
            "story": "Yearly office internet subscription",
            "contradiction": None,
            "created_at": datetime.datetime.now().isoformat()
        }
    ],
    "metrics": {
        "kyc_pending": 18,
        "false_block_rate": "1.4%",
        "median_review_time": "46s",
        "ladder": {
            "pass": 92,
            "nudge": 41,
            "question": 22,
            "cooling_off_hold": 9,
            "trusted_contact": 3
        }
    }
}

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "project": "PayShield",
        "team": "V/Slash - VIT Pune",
        "track": "FIN-11",
        "timestamp": datetime.datetime.now().isoformat()
    }

@app.post("/api/assess", response_model=RiskAssessmentResponse)
def assess_transaction(req: TransactionAssessRequest):
    """
    Core Scored Server-Side Endpoint:
    1. Validates simulated transaction
    2. Retrieves Payee Context & User Baseline
    3. Runs Deterministic Risk Engine
    4. Issues Graduated Intervention & Updates Sync Store
    """
    result = assess_coercion_risk(req)
    
    # If Held or Critical, register in sync store for Guardian and Risk Ops
    if result.is_held:
        case_id = f"case-{req.user_name.lower().replace(' ', '-')}"
        existing = next((c for c in SYNC_STORE["active_cases"] if c["id"] == case_id), None)
        
        case_record = {
            "id": case_id,
            "user_name": req.user_name,
            "initials": "".join([part[0] for part in req.user_name.split()]).upper(),
            "amount": req.amount,
            "payee_name": req.payee_name,
            "payee_upi": req.payee_upi,
            "status": "Held",
            "time_ago": "Just now",
            "risk_score": round(result.score / 100.0, 2),
            "on_call": req.is_on_phone_call,
            "amount_multiplier": round(req.amount / max(req.user_monthly_avg_transfer, 1.0), 1),
            "is_new_payee": True,
            "story": req.safety_check.payment_reason_text if req.safety_check else "Not stated",
            "contradiction": result.story_vs_facts_contradiction,
            "created_at": datetime.datetime.now().isoformat()
        }
        
        if existing:
            existing.update(case_record)
        else:
            SYNC_STORE["active_cases"].insert(0, case_record)

        if result.tier == ResponseTier.CRITICAL:
            SYNC_STORE["metrics"]["ladder"]["trusted_contact"] += 1
        elif result.tier == ResponseTier.HIGH:
            SYNC_STORE["metrics"]["ladder"]["cooling_off_hold"] += 1
    else:
        if result.tier == ResponseTier.LOW:
            SYNC_STORE["metrics"]["ladder"]["pass"] += 1
        elif result.tier == ResponseTier.MEDIUM:
            SYNC_STORE["metrics"]["ladder"]["nudge"] += 1

    return result

@app.get("/api/cases")
def list_cases():
    """Returns the synced queue of held transactions for Risk Ops and Guardians."""
    held_count = sum(1 for c in SYNC_STORE["active_cases"] if c["status"] == "Held")
    return {
        "cases": SYNC_STORE["active_cases"],
        "held_count": held_count,
        "metrics": SYNC_STORE["metrics"]
    }

@app.post("/api/cases/{case_id}/action")
def update_case_action(case_id: str, action: str):
    """
    Admin or Guardian Action:
    action: 'approve', 'deny', 'release'
    """
    case = next((c for c in SYNC_STORE["active_cases"] if c["id"] == case_id), None)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    if action == "approve" or action == "release":
        case["status"] = "Released"
    elif action == "deny" or action == "block":
        case["status"] = "Prevented Coercion"
    else:
        raise HTTPException(status_code=400, detail="Invalid action")

    return {"status": "success", "updated_case": case}

@app.get("/api/payees")
def list_payees():
    """Lists the synthetic registry database for inspection."""
    return [{"upi": k, **v} for k, v in SYNTHETIC_PAYEE_DATABASE.items()]

@app.get("/api/scenarios")
def list_benchmark_scenarios():
    """Returns the 20 benchmark test cases (10 coerced + 10 normal)."""
    return {
        "total_scenarios": len(BENCHMARK_SCENARIOS),
        "coerced_count": sum(1 for s in BENCHMARK_SCENARIOS if s["ground_truth"] == "COERCED"),
        "normal_count": sum(1 for s in BENCHMARK_SCENARIOS if s["ground_truth"] == "NORMAL"),
        "scenarios": BENCHMARK_SCENARIOS
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
