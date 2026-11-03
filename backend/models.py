from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from enum import Enum

class ResponseTier(str, Enum):
    LOW = "LOW"             # 0 - 24: Normal flow, silent log
    MEDIUM = "MEDIUM"       # 25 - 49: Contextual caution, verification nudge
    HIGH = "HIGH"           # 50 - 74: Prominent warning, cooling off delay
    CRITICAL = "CRITICAL"   # 75 - 100: Mandatory pause, guardian & risk ops triage

class SafetyCheckAnswers(BaseModel):
    is_under_pressure: bool = Field(False, description="Victim feels rushed or threatened with arrest/legal action")
    is_secrecy_demanded: bool = Field(False, description="Told not to contact bank, family, or police")
    is_active_call_directing: bool = Field(False, description="Caller is actively instructing the user on what to tap")
    is_independently_verified: bool = Field(False, description="User verified beneficiary via external legitimate channel")
    payment_reason_text: str = Field("", description="User free-form reason e.g. 'CBI verification penalty'")

class TransactionAssessRequest(BaseModel):
    user_id: str
    user_name: str
    amount: float
    user_monthly_avg_transfer: float = 4000.0
    payee_upi: str
    payee_name: str
    is_on_phone_call: bool = False
    call_duration_seconds: int = 0
    safety_check: Optional[SafetyCheckAnswers] = None

class SignalDetail(BaseModel):
    code: str
    points: int
    description: str

class RiskAssessmentResponse(BaseModel):
    assessment_id: str
    score: int # 0 to 100
    tier: ResponseTier
    is_held: bool
    recommended_action: str
    reasons: List[SignalDetail]
    story_vs_facts_contradiction: Optional[str] = None
    guardian_alert_dispatched: bool = False
    cooling_off_seconds: int = 0
