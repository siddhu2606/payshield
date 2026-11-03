# PayShield · FIN-11
### Interrupting Coerced Payments Before They Complete
**Team V/Slash &bull; Vishwakarandak '26 &bull; VIT Pune**
*Team Leader: Siddhesh Mandlik | Team Members: Vidula, Isha, Samarth*

> *"Between Pay and Paid, there's a pause that can save a life savings."*
> *"A pause, not a block. A nudge, not a verdict."*

---

## 1. Problem Statement & The Fundamental Gap

In modern authorized push payment (APP) fraud—including **"Digital Arrest"**, fake CBI/Customs police extortion, urgent SIM deactivation scams, and sextortion:

- **Correct PIN** is entered
- **OTP** is verified
- **Known Device** is recognized
- **User Confirmation** is explicitly given

**The Gap**: Traditional authentication cannot detect a payment that the victim authorises under intense psychological coercion (*Authority &rarr; Fear &rarr; Isolation &rarr; Compliance*).

PayShield sits **between "Pay" and "Paid"** to detect coercion contextually without ever hard-blocking legitimate payments.

---

## 2. Core Architecture: 4-Stage Pipeline

```
[ Customer App: React + Tailwind ]
            │
            ▼  (Simulated Checkout)
┌──────────────────────────────────────────────────────────┐
│ FASTAPI BACKEND (Scored Server-Side)                     │
│                                                          │
│  1. Validate   ──► Validates simulated transaction       │
│  2. Context    ──► Payee facts, monthly baseline, calls  │
│  3. Risk Engine──► Deterministic points (0-100), reasons │
│  4. Intervene  ──► Low / Medium / High / Critical        │
└───────────────────────────┬──────────────────────────────┘
                            │
            ┌───────────────┴───────────────┐
            ▼                               ▼
 [ Synthetic Payee Registry ]    [ Guardian Mobile App & Admin Console ]
   (Story vs Facts Engine)         (Live Real-Time Event Sync)
```

### The 4 Response Tiers
- **LOW (0–24)**: Normal simulated flow, standard receipt.
- **MEDIUM (25–49)**: Contextual caution banner, highlighting new payee status.
- **HIGH (50–74)**: Prominent coercion warning, safety questionnaire, 60s reflection delay.
- **CRITICAL (75–100)**: Mandatory cooling-off hold, real-time alert dispatched to designated Guardian, triage case created in Admin Console.

---

## 3. Story vs Facts Contradiction Engine

The most defensible differentiator of PayShield:
- **What the user says**: *"Government verification penalty under CBI arrest order"*
- **What the registry shows**: *Individual savings account opened 2 days ago with 14 incoming deposits today.*
- **The Contradiction Flag**: A government law enforcement authority never accepts penalties into a newly opened private savings account.

---

## 4. Multi-Screen Architecture & Dedicated Role Links

PayShield FIN-11 features dedicated, role-specific interfaces designed for real-world devices, with zero-latency synchronization across browser tabs and mobile devices via `BroadcastChannel` and `localStorage` storage events:

| Interface | Device Target | Dedicated Link / File | Role & Core Functionality |
| :--- | :--- | :--- | :--- |
| **Admin Risk SOC Console** | Laptop / Desktop | [`admin.html`](file:///admin.html) | Institutional fraud desk with 18 KYC pending, real-time case triage, risk ladder, story vs fact contradiction breakdown & account freeze controls. |
| **Member Checkout App** | Mobile Phone | [`member.html`](file:///member.html) | Customer payment flow (Aarav Mehta) with active scam call detection, 60s reflection delay, and safety questions. |
| **Guardian Companion App** | Mobile Phone | [`guardian.html`](file:///guardian.html) | Companion guardian view (Priya Mehta) with instant push alerts, "Call Aarav first", and biometric [Deny] / [Approve] controls. |
| **Child Protected Account** | Mobile Phone | [`child.html`](file:///child.html) | Protected dependent account (Anaya Mehta) with ₹1,400 pocket allowance, daily limits, parental requests & Emergency SOS. |
| **Live Multi-Screen Arena** | Presentation / Hub | [`index.html`](file:///index.html) | Master hub with interactive triple-split real-time view syncing Member, Guardian, and Admin live on one screen. |

---

## 5. Live GitHub Pages Deployment

- **Live URL**: **`https://siddhu2606.github.io/payshield/`**
- **Admin Panel (Laptop)**: `https://siddhu2606.github.io/payshield/admin.html`
- **Member App (Phone)**: `https://siddhu2606.github.io/payshield/member.html`
- **Guardian App (Phone)**: `https://siddhu2606.github.io/payshield/guardian.html`
- **Child App (Phone)**: `https://siddhu2606.github.io/payshield/child.html`

---

## 6. How to Run Locally

### Option 1: One-Click Local Server (Node.js)
```bash
node server.js
```
or double-click `run_local_server.bat`. Open `http://localhost:3000` on your laptop, or open the local IP on your smartphone!

### Option 2: Full-Stack FastAPI + React Setup
1. **Start Backend**:
   ```bash
   cd backend
   pip install -r requirements.txt
   uvicorn main:app --reload --port 8000
   ```
2. **Start Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
