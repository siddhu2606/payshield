"""
Synthetic Payee Registry
Simulates the verified payee fact base: account type, account creation age,
and 24-hour incoming velocity.
"""
from typing import Dict, Any, Optional

SYNTHETIC_PAYEE_DATABASE: Dict[str, Dict[str, Any]] = {
    "cbi.verification@okaxis": {
        "payee_name": "Rakesh Verma",
        "account_type": "INDIVIDUAL_SAVINGS",
        "account_age_days": 2,
        "daily_incoming_txns": 14,
        "is_verified_entity": False,
        "category": "High Risk Mule Pattern",
        "known_institution_claim": None
    },
    "fastkyc.update@paytm": {
        "payee_name": "Suresh Patil",
        "account_type": "INDIVIDUAL_SAVINGS",
        "account_age_days": 4,
        "daily_incoming_txns": 9,
        "is_verified_entity": False,
        "category": "Suspicious Velocity",
        "known_institution_claim": None
    },
    "customs.clearance.tax@icici": {
        "payee_name": "Dinesh Kumar (Proprietor)",
        "account_type": "INDIVIDUAL_CURRENT",
        "account_age_days": 1,
        "daily_incoming_txns": 23,
        "is_verified_entity": False,
        "category": "Impersonation Mule",
        "known_institution_claim": None
    },
    "bigbasket@icici": {
        "payee_name": "Innovative Retail Concepts Pvt Ltd",
        "account_type": "VERIFIED_CORPORATE",
        "account_age_days": 1820,
        "daily_incoming_txns": 4800,
        "is_verified_entity": True,
        "category": "Legitimate Merchant",
        "known_institution_claim": "BigBasket"
    },
    "iitb.fees@sbi": {
        "payee_name": "IIT Bombay Educational Trust",
        "account_type": "VERIFIED_INSTITUTION",
        "account_age_days": 3200,
        "daily_incoming_txns": 320,
        "is_verified_entity": True,
        "category": "Legitimate Educational Institution",
        "known_institution_claim": "IIT Bombay"
    }
}

def lookup_payee(upi_id: str) -> Dict[str, Any]:
    normalized = upi_id.strip().lower()
    if normalized in SYNTHETIC_PAYEE_DATABASE:
        return SYNTHETIC_PAYEE_DATABASE[normalized]
    
    # Default fallback for arbitrary new payee in demo
    return {
        "payee_name": "Unverified Payee",
        "account_type": "INDIVIDUAL_SAVINGS",
        "account_age_days": 5,
        "daily_incoming_txns": 3,
        "is_verified_entity": False,
        "category": "Unverified Recipient",
        "known_institution_claim": None
    }
