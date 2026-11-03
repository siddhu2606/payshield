/**
 * PayShield Shared Real-Time Bus & State Synchronizer
 * Enables zero-backend, multi-tab, multi-device synchronization via BroadcastChannel & localStorage
 */
(function() {
  const STORAGE_KEY = 'payshield_global_state';
  const EVENT_KEY = 'payshield_sync_event';
  const CHANNEL_NAME = 'payshield_live_bus';

  const defaultState = {
    activeCall: true,
    held: true,
    currentCase: {
      id: 'CASE-8841',
      user: 'Aarav Mehta',
      phone: '+91 98201 44109',
      amount: 85000,
      baselineAmount: 4000,
      multiplier: 21.2,
      payee: 'Inspector R. Sharma (CBI Verification)',
      account: '••4471',
      upi: 'cbi.verification@okaxis',
      bankName: 'Axis Bank',
      riskScore: 0.98,
      riskTier: 'CRITICAL',
      status: 'HELD', // 'HELD' | 'APPROVED' | 'DENIED' | 'FROZEN'
      tags: ['Amount 21x usual', 'On a call', 'New payee'],
      contradiction: 'Story claims CBI law enforcement penalty, but synthetic facts reveal individual savings account opened 2 days ago with 14 micro-deposits.',
      scenario: 'digital-arrest',
      timestamp: Date.now()
    },
    childAccount: {
      name: 'Anaya Mehta',
      guardian: 'Rajiv Mehta',
      balance: 1400,
      dailyLimit: 1000,
      pendingRequest: null,
      sosActive: false
    },
    adminStats: {
      kycPending: 18,
      paymentsHeld: 2,
      falseBlockRate: '1.4%',
      medianReviewTime: '46s'
    },
    cases: [
      {
        id: 'CASE-8841',
        user: 'Aarav Mehta',
        amount: 85000,
        riskScore: 0.98,
        tier: 'CRITICAL',
        status: 'HELD',
        reason: 'Digital arrest coercion / Active call',
        time: 'Just now'
      },
      {
        id: 'CASE-8839',
        user: 'Kavita Sen',
        amount: 142000,
        riskScore: 0.94,
        tier: 'CRITICAL',
        status: 'HELD',
        reason: 'Customs parcel courier fraud',
        time: '12m ago'
      },
      {
        id: 'CASE-8834',
        user: 'Rohan Gupta',
        amount: 32000,
        riskScore: 0.72,
        tier: 'HIGH',
        status: 'COOLING_OFF',
        reason: 'Immediate SIM deactivation threat',
        time: '34m ago'
      },
      {
        id: 'CASE-8829',
        user: 'Sunil Deshmukh',
        amount: 250000,
        riskScore: 0.89,
        tier: 'CRITICAL',
        status: 'HELD',
        reason: 'Stock investment impersonation',
        time: '1h ago'
      }
    ],
    history: [
      { user: 'Anaya Mehta', amount: 600, item: 'Books', status: 'Approved', time: 'Yesterday' },
      { user: 'Aarav Mehta', amount: 8500, item: 'Groceries', status: 'Approved', time: '3 days ago' }
    ]
  };

  let state = loadState();
  const listeners = new Set();
  let channel = null;

  try {
    if (typeof BroadcastChannel !== 'undefined') {
      channel = new BroadcastChannel(CHANNEL_NAME);
      channel.onmessage = (event) => {
        if (event && event.data) {
          handleIncomingEvent(event.data);
        }
      };
    }
  } catch (e) {
    console.warn('BroadcastChannel not supported, falling back to storage events only', e);
  }

  window.addEventListener('storage', (e) => {
    if (e.key === EVENT_KEY && e.newValue) {
      try {
        const payload = JSON.parse(e.newValue);
        handleIncomingEvent(payload);
      } catch (err) {
        console.error('Failed to parse sync event', err);
      }
    }
  });

  function loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...defaultState, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Error reading localStorage', e);
    }
    return JSON.parse(JSON.stringify(defaultState));
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Error saving state', e);
    }
  }

  function broadcast(type, data = {}) {
    const eventPayload = {
      type,
      data,
      state: state,
      sender: window.location.pathname,
      time: Date.now()
    };
    saveState();
    if (channel) {
      channel.postMessage(eventPayload);
    }
    try {
      localStorage.setItem(EVENT_KEY, JSON.stringify(eventPayload));
    } catch (e) {}
    notifyListeners(type, data);
  }

  function handleIncomingEvent(eventPayload) {
    if (eventPayload && eventPayload.state) {
      state = eventPayload.state;
      saveState();
      notifyListeners(eventPayload.type, eventPayload.data);
    }
  }

  function notifyListeners(type, data) {
    listeners.forEach((fn) => {
      try {
        fn({ type, data, state: getState() });
      } catch (err) {
        console.error('Error in sync listener', err);
      }
    });
  }

  function getState() {
    return JSON.parse(JSON.stringify(state));
  }

  const PayShieldSync = {
    getState,
    subscribe(callback) {
      listeners.add(callback);
      // Immediately call with current state
      callback({ type: 'INIT', data: {}, state: getState() });
      return () => listeners.delete(callback);
    },
    
    toggleCall(active) {
      state.activeCall = typeof active === 'boolean' ? active : !state.activeCall;
      broadcast('CALL_TOGGLED', { activeCall: state.activeCall });
    },

    triggerPaymentHeld(params = {}) {
      state.held = true;
      state.currentCase.status = 'HELD';
      state.currentCase.amount = params.amount || 85000;
      state.currentCase.payee = params.payee || 'Inspector R. Sharma (CBI Verification)';
      state.currentCase.upi = params.upi || 'cbi.verification@okaxis';
      state.currentCase.riskScore = params.riskScore || 0.98;
      state.currentCase.riskTier = 'CRITICAL';
      state.currentCase.user = params.user || 'Aarav Mehta';
      state.currentCase.tags = params.tags || ['Amount 21x usual', 'On a call', 'New payee'];
      state.currentCase.timestamp = Date.now();
      
      // Update admin cases list
      const existing = state.cases.find(c => c.id === state.currentCase.id);
      if (existing) {
        existing.status = 'HELD';
        existing.amount = state.currentCase.amount;
      } else {
        state.cases.unshift({
          id: state.currentCase.id,
          user: state.currentCase.user,
          amount: state.currentCase.amount,
          riskScore: state.currentCase.riskScore,
          tier: 'CRITICAL',
          status: 'HELD',
          reason: 'Digital arrest coercion / Active call',
          time: 'Just now'
        });
      }
      state.adminStats.paymentsHeld = state.cases.filter(c => c.status === 'HELD').length;
      broadcast('PAYMENT_HELD', { currentCase: state.currentCase });
    },

    guardianApprove(approvedBy = 'Guardian Priya') {
      state.held = false;
      state.currentCase.status = 'APPROVED';
      const c = state.cases.find(item => item.id === state.currentCase.id);
      if (c) c.status = 'APPROVED';
      state.history.unshift({
        user: state.currentCase.user,
        amount: state.currentCase.amount,
        item: 'Held payment authorized by Guardian',
        status: 'Approved',
        time: 'Just now'
      });
      state.adminStats.paymentsHeld = state.cases.filter(c => c.status === 'HELD').length;
      broadcast('PAYMENT_APPROVED', { approvedBy, currentCase: state.currentCase });
    },

    guardianDeny(deniedBy = 'Guardian Priya') {
      state.held = false;
      state.currentCase.status = 'DENIED';
      const c = state.cases.find(item => item.id === state.currentCase.id);
      if (c) c.status = 'DENIED';
      state.history.unshift({
        user: state.currentCase.user,
        amount: state.currentCase.amount,
        item: 'Coerced transfer intercepted & blocked',
        status: 'Denied',
        time: 'Just now'
      });
      state.adminStats.paymentsHeld = state.cases.filter(c => c.status === 'HELD').length;
      broadcast('PAYMENT_DENIED', { deniedBy, currentCase: state.currentCase });
    },

    adminFreezeAccount(user = 'Aarav Mehta') {
      state.held = true;
      state.currentCase.status = 'FROZEN';
      const c = state.cases.find(item => item.id === state.currentCase.id);
      if (c) c.status = 'FROZEN';
      broadcast('ACCOUNT_FROZEN', { user, currentCase: state.currentCase });
    },

    adminReleaseHold(caseId) {
      state.held = false;
      const target = state.cases.find(c => c.id === caseId) || state.currentCase;
      target.status = 'RELEASED';
      state.adminStats.paymentsHeld = state.cases.filter(c => c.status === 'HELD').length;
      broadcast('PAYMENT_RELEASED', { caseId, target });
    },

    childRequest(item, amount) {
      state.childAccount.pendingRequest = {
        item,
        amount,
        time: 'Just now',
        id: 'REQ-' + Math.floor(Math.random() * 9000 + 1000)
      };
      broadcast('CHILD_REQUEST', { request: state.childAccount.pendingRequest });
    },

    childSOS() {
      state.childAccount.sosActive = true;
      broadcast('CHILD_SOS', { child: state.childAccount.name, time: Date.now() });
    },

    clearSOS() {
      state.childAccount.sosActive = false;
      broadcast('CHILD_SOS_CLEARED', {});
    },

    resetAll() {
      state = JSON.parse(JSON.stringify(defaultState));
      state.timestamp = Date.now();
      saveState();
      broadcast('DEMO_RESET', {});
    }
  };

  window.PayShieldSync = PayShieldSync;
})();
