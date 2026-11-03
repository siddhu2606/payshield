import React, { useState, useEffect } from 'react';
import { 
  Shield, AlertTriangle, Phone, Users, CheckCircle, XCircle, 
  Clock, ArrowRight, RefreshCw, BarChart2, Eye, ShieldAlert, Check
} from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState('hub'); // 'hub', 'roles', 'member', 'guardian', 'child', 'admin'
  const [adminTab, setAdminTab] = useState('overview'); // 'overview', 'kyc', 'cases', 'policy'
  
  // Real-time synced state
  const [activeCases, setActiveCases] = useState([
    {
      id: 'case-aarav',
      user: 'Aarav Mehta',
      initials: 'AM',
      amount: 85000,
      payee: 'Rakesh Verma (··4471)',
      timeAgo: '4m ago',
      riskScore: 0.98,
      status: 'Held',
      onCall: true,
      amountMultiplier: 21,
      story: 'Government verification penalty under CBI notice',
      contradiction: 'Recipient is a 2-day-old personal account with 14 incoming deposits today.'
    },
    {
      id: 'case-kavita',
      user: 'Kavita Joshi',
      initials: 'KJ',
      amount: 32000,
      payee: 'FastKYC Services (··9012)',
      timeAgo: '18m ago',
      riskScore: 0.84,
      status: 'Held',
      onCall: true,
      amountMultiplier: 8,
      story: 'SIM card deactivation warning fee',
      contradiction: 'Account registered to private individual Suresh Patil.'
    },
    {
      id: 'case-nitin',
      user: 'Nitin Rao',
      initials: 'NR',
      amount: 9500,
      payee: 'Airtel Broadband Official',
      timeAgo: '1h ago',
      riskScore: 0.22,
      status: 'Released',
      onCall: false,
      amountMultiplier: 1.2,
      story: 'Yearly office internet subscription',
      contradiction: null
    }
  ]);

  // Member flow state
  const [memberFlow, setMemberFlow] = useState({
    step: 'form', // 'form', 'questions', 'held', 'success'
    amount: 85000,
    payee: 'Inspector R. Sharma (CBI Verification)',
    upiId: 'cbi.verification@okaxis',
    whyText: 'Government verification penalty under CBI arrest order',
    activeCall: true,
    answers: { pressure: true, secret: true, caller: true, verified: false },
    score: 98
  });

  const [toast, setToast] = useState(null);

  const showToast = (title, msg) => {
    setToast({ title, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const heldCount = activeCases.filter(c => c.status === 'Held').length;

  // Guardian actions
  const handleGuardianAction = (action) => {
    setActiveCases(prev => prev.map(c => {
      if (c.id === 'case-aarav') {
        return { ...c, status: action === 'approve' ? 'Approved by Guardian' : 'Denied by Guardian' };
      }
      return c;
    }));

    if (action === 'deny') {
      setMemberFlow(prev => ({ ...prev, step: 'form' }));
      showToast('Guardian Blocked Coercion', 'Transfer stopped. ₹85,000 saved.');
    } else {
      setMemberFlow(prev => ({ ...prev, step: 'success' }));
      showToast('Guardian Approved', 'Transfer authorized by parent.');
    }
  };

  // Member submission
  const handleMemberSubmit = () => {
    let score = 5;
    if (memberFlow.amount > 40000) score += 40;
    if (memberFlow.activeCall) score += 30;
    if (memberFlow.answers.pressure) score += 15;
    if (memberFlow.answers.secret) score += 15;
    
    score = Math.min(100, score);
    setMemberFlow(prev => ({ ...prev, score, step: score >= 75 ? 'held' : 'success' }));

    if (score >= 75) {
      setActiveCases(prev => prev.map(c => c.id === 'case-aarav' ? { ...c, status: 'Held', amount: memberFlow.amount } : c));
      showToast('🚨 COERCION DETECTED', 'Payment held across all synced nodes.');
    }
  };

  return (
    <div className="min-h-screen bg-[#080C14] text-slate-100 flex flex-col">
      {/* Top Bar */}
      <header className="border-b border-slate-800 bg-[#0B0F19]/90 backdrop-blur sticky top-0 z-50 px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
              <Shield className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-base">Pay<span className="text-emerald-400">Shield</span></span>
                <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-slate-700">FIN-11 · VIT PUNE</span>
              </div>
              <p className="text-[10px] text-slate-400">Between Pay and Paid, a pause that saves life savings</p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            <button onClick={() => setCurrentView('hub')} className={`px-3 py-1.5 rounded-lg transition ${currentView === 'hub' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400'}`}>
              Live Sync Hub
            </button>
            <button onClick={() => setCurrentView('roles')} className={`px-3 py-1.5 rounded-lg transition ${currentView === 'roles' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400'}`}>
              Roles
            </button>
            <button onClick={() => setCurrentView('guardian')} className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${currentView === 'guardian' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400'}`}>
              Guardian {heldCount > 0 && <span className="bg-rose-500 text-white text-[9px] px-1.5 py-0.2 rounded-full font-bold">{heldCount}</span>}
            </button>
            <button onClick={() => setCurrentView('admin')} className={`px-3 py-1.5 rounded-lg transition ${currentView === 'admin' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400'}`}>
              Console
            </button>
          </div>

          <button onClick={() => {
            setMemberFlow(prev => ({ ...prev, step: 'held', activeCall: true }));
            showToast('Simulation Triggered', 'Scam call + held payment injected.');
          }} className="text-xs bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            Simulate Scam Call
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6">
        
        {/* VIEW: LIVE SYNC HUB */}
        {currentView === 'hub' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-white">Live Tri-Node Synchronization Arena</h2>
                <p className="text-xs text-slate-400">Trigger payments in Member Phone &rarr; Instant alert in Guardian Phone &rarr; Live triage in Risk Console.</p>
              </div>
              <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full font-mono">
                Synced ({heldCount} Held)
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Member Phone Frame */}
              <div className="lg:col-span-4 flex flex-col items-center">
                <span className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Victim: Aarav Mehta</span>
                <div className="w-[340px] h-[680px] bg-[#090D16] border-8 border-slate-800 rounded-[40px] overflow-hidden flex flex-col p-4 shadow-2xl relative">
                  <div className="flex justify-between items-center text-xs text-slate-400 mb-3">
                    <span className="font-bold text-white">9:41</span>
                    <span className="text-[10px] font-mono text-emerald-400">PROTECTED</span>
                  </div>

                  {memberFlow.activeCall && (
                    <div className="bg-rose-500/20 border border-rose-500/40 p-2 rounded-xl text-xs text-rose-300 flex justify-between items-center mb-3 animate-pulse">
                      <span className="font-mono">📞 ACTIVE CALL: 24:18</span>
                      <button onClick={() => setMemberFlow(f => ({ ...f, activeCall: !f.activeCall }))} className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded">End</button>
                    </div>
                  )}

                  {memberFlow.step === 'form' && (
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="space-y-3">
                        <h3 className="font-bold text-white text-base">Send Money</h3>
                        <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800">
                          <label className="text-[10px] text-slate-400">Payee</label>
                          <input value={memberFlow.payee} onChange={e => setMemberFlow(f => ({ ...f, payee: e.target.value }))} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-1 text-xs text-white" />
                        </div>
                        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 text-center">
                          <label className="text-[10px] text-slate-400">Amount</label>
                          <div className="text-3xl font-extrabold text-white">₹{memberFlow.amount}</div>
                          <span className="text-[10px] text-rose-400">21x monthly avg (₹4,000)</span>
                        </div>
                        <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800">
                          <label className="text-[10px] text-slate-400">Purpose</label>
                          <textarea value={memberFlow.whyText} onChange={e => setMemberFlow(f => ({ ...f, whyText: e.target.value }))} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white" rows="2" />
                        </div>
                      </div>
                      <button onClick={handleMemberSubmit} className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-2xl text-xs">
                        Review &amp; Pay
                      </button>
                    </div>
                  )}

                  {memberFlow.step === 'held' && (
                    <div className="flex-1 flex flex-col justify-between bg-rose-950/20 p-2 rounded-2xl">
                      <div className="space-y-3 text-center">
                        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto animate-bounce mt-2" />
                        <h3 className="font-extrabold text-white text-lg">Payment Held</h3>
                        <p className="text-xs text-rose-300">Coercion signals detected. Sits between Pay and Paid.</p>
                        <div className="bg-slate-900 p-3 rounded-2xl border border-rose-500/30 text-left text-xs space-y-1">
                          <div className="text-rose-400 font-bold">Contradiction:</div>
                          <div className="text-slate-300">User stated: "CBI order penalty"</div>
                          <div className="text-rose-300">Registry: Individual account opened 2 days ago.</div>
                        </div>
                        <div className="p-2 bg-purple-500/10 border border-purple-500/30 rounded-xl text-[11px] text-purple-300 text-left">
                          🛡️ Dispatched to Guardian: Rajiv Mehta
                        </div>
                      </div>
                      <button onClick={() => setMemberFlow(f => ({ ...f, step: 'form' }))} className="w-full py-3 bg-slate-800 text-white rounded-2xl text-xs font-semibold">
                        Cancel Transfer
                      </button>
                    </div>
                  )}

                  {memberFlow.step === 'success' && (
                    <div className="flex-1 flex flex-col justify-center items-center text-center">
                      <CheckCircle className="w-16 h-16 text-emerald-400 mb-3" />
                      <h3 className="text-lg font-bold text-white">Payment Safe</h3>
                      <button onClick={() => setMemberFlow(f => ({ ...f, step: 'form' }))} className="mt-4 px-4 py-2 bg-slate-800 rounded-xl text-xs">Back</button>
                    </div>
                  )}
                </div>
              </div>

              {/* Guardian Phone Frame (Screenshot 2 1:1) */}
              <div className="lg:col-span-4 flex flex-col items-center">
                <span className="text-xs font-bold text-purple-400 mb-2 uppercase tracking-wider">Guardian: Rajiv Mehta</span>
                <div className="w-[340px] h-[680px] bg-[#090D16] border-8 border-purple-900/40 rounded-[40px] overflow-hidden flex flex-col p-4 shadow-2xl relative">
                  <div className="flex justify-between items-center text-xs text-slate-400 mb-3">
                    <span className="font-bold text-white">9:41</span>
                    <span className="text-[10px] font-mono text-slate-500">SIMULATED</span>
                  </div>

                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-extrabold text-white">Alerts</h2>
                    <span className="bg-rose-500/20 text-rose-400 text-xs font-bold px-2 py-0.5 rounded-full border border-rose-500/30">
                      {heldCount > 0 ? '1 needs you' : '0 pending'}
                    </span>
                  </div>

                  <div className="flex-1 flex flex-col justify-between overflow-y-auto">
                    {heldCount > 0 ? (
                      <div className="bg-[#111624] rounded-3xl p-4 border border-rose-500/30 space-y-3">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-white">Aarav wants to pay</span>
                          <span className="text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full font-mono text-[10px]">risk 0.98</span>
                        </div>
                        <div className="text-3xl font-extrabold text-white">₹85,000</div>
                        <p className="text-xs text-slate-400">New payee ··4471, while on a call. The payment is held.</p>
                        <div className="flex flex-wrap gap-1 text-[10px]">
                          <span className="bg-slate-900 border border-slate-700 px-2 py-0.5 rounded-lg">Amount 21x usual</span>
                          <span className="bg-slate-900 border border-slate-700 px-2 py-0.5 rounded-lg">On a call</span>
                          <span className="bg-slate-900 border border-slate-700 px-2 py-0.5 rounded-lg">New payee</span>
                        </div>
                        <button onClick={() => showToast('Calling Aarav...', 'Breaking coercion isolation.')} className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold">
                          Call Aarav first
                        </button>
                        <div className="grid grid-cols-2 gap-2">
                          <button onClick={() => handleGuardianAction('deny')} className="py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl text-xs">
                            Deny
                          </button>
                          <button onClick={() => handleGuardianAction('approve')} className="py-2.5 bg-[#A78BFA] hover:bg-[#906CF5] text-slate-950 font-bold rounded-xl text-xs">
                            Approve
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 text-center">
                        <Check className="w-8 h-8 text-emerald-400 mx-auto mb-1" />
                        <span className="text-xs font-bold text-white">No Emergency Holds</span>
                      </div>
                    )}

                    <div className="mt-4 pt-3 border-t border-slate-800">
                      <div className="text-[10px] font-mono text-slate-500 mb-2">EARLIER</div>
                      <div className="space-y-2 text-xs">
                        <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800 flex justify-between items-center">
                          <div>
                            <div className="font-semibold text-white">Anaya · ₹600</div>
                            <div className="text-[10px] text-slate-500">books · Yesterday</div>
                          </div>
                          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">Approved</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Admin Risk Console Mini Widget (Screenshot 3) */}
              <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    Risk Console Overview
                  </span>
                  <span className="text-emerald-400 font-mono text-[10px]">Meera Iyer (Risk Ops)</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <div className="text-2xl font-extrabold text-white">18</div>
                    <div className="text-[10px] text-slate-400">KYC pending</div>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-rose-500/20">
                    <div className="text-2xl font-extrabold text-rose-500">{heldCount}</div>
                    <div className="text-[10px] text-rose-400">Payments held</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Needs Attention Queue</div>
                  {activeCases.map(c => (
                    <div key={c.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                      <div>
                        <div className="font-bold text-white">{c.user}</div>
                        <div className="text-[10px] text-slate-400">₹{c.amount.toLocaleString()} · {c.timeAgo}</div>
                      </div>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${c.status === 'Held' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400'}`}>
                        {c.status}
                      </span>
                    </div>
                  ))}
                </div>

                <button onClick={() => setCurrentView('admin')} className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-xs text-white rounded-xl font-semibold">
                  Open Full Desktop Console &rarr;
                </button>
              </div>

            </div>
          </div>
        )}

        {/* VIEW: ROLE SELECTOR HUB (Screenshot 1) */}
        {currentView === 'roles' && (
          <div className="max-w-4xl mx-auto py-10 text-center">
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 uppercase tracking-widest">
              CHOOSE A VIEW
            </span>
            <h1 className="text-4xl font-extrabold text-white mt-3 mb-2">Who is signing in?</h1>
            <p className="text-sm text-slate-400 mb-8 max-w-md mx-auto">Each person gets the screens they need. Pick one to explore.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
              <div onClick={() => setCurrentView('admin')} className="bg-slate-900/80 hover:border-blue-500/40 border border-slate-800 p-5 rounded-2xl cursor-pointer transition">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4">
                  <BarChart2 className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-lg">Admin</h3>
                <p className="text-xs text-slate-400 mb-4">Risk and KYC team</p>
                <div className="text-[10px] font-mono text-blue-400 uppercase">DESKTOP CONSOLE</div>
              </div>

              <div onClick={() => setCurrentView('member')} className="bg-slate-900/80 hover:border-emerald-500/40 border border-slate-800 p-5 rounded-2xl cursor-pointer transition">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-lg">Member</h3>
                <p className="text-xs text-slate-400 mb-4">Account holder who pays</p>
                <div className="text-[10px] font-mono text-emerald-400 uppercase">MOBILE APP</div>
              </div>

              <div onClick={() => setCurrentView('child')} className="bg-slate-900/80 hover:border-amber-500/40 border border-slate-800 p-5 rounded-2xl cursor-pointer transition">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-lg">Child</h3>
                <p className="text-xs text-slate-400 mb-4">Under 18, linked to guardian</p>
                <div className="text-[10px] font-mono text-amber-400 uppercase">MOBILE APP</div>
              </div>

              <div onClick={() => setCurrentView('guardian')} className="bg-slate-900/80 hover:border-purple-500/40 border border-slate-800 p-5 rounded-2xl cursor-pointer transition">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-lg">Guardian</h3>
                <p className="text-xs text-slate-400 mb-4">Trusted contact &amp; family limits</p>
                <div className="text-[10px] font-mono text-purple-400 uppercase">MOBILE APP</div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 bg-slate-900 border border-slate-700 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-3 z-50">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">✓</div>
          <div>
            <div className="font-bold text-xs">{toast.title}</div>
            <div className="text-[11px] text-slate-400">{toast.msg}</div>
          </div>
        </div>
      )}
    </div>
  );
}
