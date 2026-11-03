"""
PayShield Coercion Risk Scoring Engine
Deterministic, transparent, rule-based scoring (0-100) with explainable flags.
Ensures zero black-box verdicts: every point assigned maps to an audited rule.
"""
import uuid
from typing import List, Tuple, Optional
from models import TransactionAssessRequest, RiskAssessmentResponse, ResponseTier, SignalDetail
from payee_registry import lookup_payee

COERCION_KEYWORDS = [
    "cbi", "customs", "police", "arrest", "fir", "digital arrest",
    "court", "narcotics", "cyber crime", "verification fee", "penalty",
    "warrant", "ed office", "department of telecommunication", "trai"
]

def assess_coercion_risk(req: TransactionAssessRequest) -> RiskAssessmentResponse:
    points = 0
    signals: List[SignalDetail] = []
    contradiction: Optional[str] = None
    
    payee_facts = lookup_payee(req.payee_upi)
    
    # -------------------------------------------------------------
    # 1. Behavioral Signal: Active Call during Checkout (+30 pts)
    # Coercers maintain voice control to prevent independent verification.
    # -------------------------------------------------------------
    is_on_call = req.is_on_phone_call or (req.safety_check and req.safety_check.is_active_call_directing)
    if is_on_call:
        pts = 30
        points += pts
        signals.append(SignalDetail(
            code="BEHAVIOR_ACTIVE_CALL",
            points=pts,
            description="Active phone call / caller directing transfer in progress"
        ))

    # -------------------------------------------------------------
    # 2. Contextual Signal: Amount vs History Multiplier
    # (₹85,000 vs user baseline ₹4,000 -> 21x)
    # -------------------------------------------------------------
    baseline = max(req.user_monthly_avg_transfer, 500.0)
    multiplier = req.amount / baseline
    if multiplier >= 20.0:
        pts = 35
        points += pts
        signals.append(SignalDetail(
            code="AMOUNT_EXTREME_MULTIPLIER",
            points=pts,
            description=f"Transaction amount is {multiplier:.1f}x higher than usual monthly baseline"
        ))
    elif multiplier >= 10.0:
        pts = 25
        points += pts
        signals.append(SignalDetail(
            code="AMOUNT_HIGH_MULTIPLIER",
            points=pts,
            description=f"Transaction amount is {multiplier:.1f}x higher than baseline"
        ))

    # -------------------------------------------------------------
    # 3. Payee Context: New unverified recipient
    # -------------------------------------------------------------
    if not payee_facts["is_verified_entity"]:
        if payee_facts["account_age_days"] <= 7:
            pts = 20
            points += pts
            signals.append(SignalDetail(
                code="PAYEE_RECENT_UNVERIFIED",
                points=pts,
                description=f"Payee account created only {payee_facts['account_age_days']} days ago with {payee_facts['daily_incoming_txns']} incoming deposits today"
            ))

    # -------------------------------------------------------------
    # 4. Story vs Facts Contradiction Engine
    # If user mentions law enforcement/government verification, but payee
    # is a private individual account opened 2 days ago.
    # -------------------------------------------------------------
    reason_text = ""
    if req.safety_check and req.safety_check.payment_reason_text:
        reason_text = req.safety_check.payment_reason_text.lower()
    
    has_authority_claim = any(k in reason_text for k in COERCION_KEYWORDS)
    if has_authority_claim:
        pts = 25
        points += pts
        signals.append(SignalDetail(
            code="NARRATIVE_SCAM_KEYWORDS",
            points=pts,
            description="Payment purpose contains high-frequency coercion scam terminology (CBI/Customs/Arrest)"
        ))

        # Check contradiction with registry facts
        if payee_facts["account_type"] in ["INDIVIDUAL_SAVINGS", "INDIVIDUAL_CURRENT"]:
            pts_c = 40
            points += pts_c
            contradiction = (
                f"Contradiction Detected: User states payment is for official verification/penalty ('{reason_text}'), "
                f"but Synthetic Payee Registry confirms recipient is an individual account ({payee_facts['payee_name']}) "
                f"opened {payee_facts['account_age_days']} days ago. Government institutions never collect penalties in personal savings accounts."
            )
            signals.append(SignalDetail(
                code="STORY_VS_FACTS_MISMATCH",
                points=pts_c,
                description=contradiction
            ))

    # -------------------------------------------------------------
    # 5. Voluntary Safety Check Questionnaire Signals
    # -------------------------------------------------------------
    if req.safety_check:
        if req.safety_check.is_under_pressure:
            pts = 15
            points += pts
            signals.append(SignalDetail(
                code="CHECK_URGENT_PRESSURE",
                points=pts,
                description="User confirmed being pressured or threatened with severe immediate consequences"
            ))
        if req.safety_check.is_secrecy_demanded:
            pts = 15
            points += pts
            signals.append(SignalDetail(
                code="CHECK_SECRECY_DEMANDED",
                points=pts,
                description="User was instructed to maintain strict secrecy from family, friends, or bank staff"
            ))
        if not req.safety_check.is_independently_verified:
            pts = 10
            points += pts
            signals.append(SignalDetail(
                code="CHECK_UNVERIFIED_CHANNELS",
                points=pts,
                description="User has not independently verified recipient identity through official external channels"
            ))

    # -------------------------------------------------------------
    # Clamp score to 0 - 100
    # -------------------------------------------------------------
    clamped_score = min(100, max(0, points))

    # -------------------------------------------------------------
    # Response Tier Assignment
    # -------------------------------------------------------------
    if clamped_score < 25:
        tier = ResponseTier.LOW
        is_held = False
        action = "Allow payment with standard digital receipt."
        cooling_sec = 0
        guardian_alert = False
    elif clamped_score < 50:
        tier = ResponseTier.MEDIUM
        is_held = False
        action = "Display contextual caution banner and highlight payee registration age."
        cooling_sec = 0
        guardian_alert = False
    elif clamped_score < 75:
        tier = ResponseTier.HIGH
        is_held = True
        action = "Prominent coercion alert screen with 60-second reflection pause."
        cooling_sec = 60
        guardian_alert = False
    else:
        tier = ResponseTier.CRITICAL
        is_held = True
        action = "Mandatory 5-minute cooling-off hold. Real-time alert dispatched to designated Guardian and Risk Ops."
        cooling_sec = 300
        guardian_alert = True

    return RiskAssessmentResponse(
        assessment_id=f"ASSESS-{uuid.uuid4().hex[:8].upper()}",
        score=clamped_score,
        tier=tier,
        is_held=is_held,
        recommended_action=action,
        reasons=signals,
        story_vs_facts_contradiction=contradiction,
        guardian_alert_dispatched=guardian_alert,
        cooling_off_seconds=cooling_sec
    )
