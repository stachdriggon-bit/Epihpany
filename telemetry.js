/* Optional, privacy-first anonymous diagnostics for EPIPHANY.
   No analytics or error reports are sent unless the learner opts in from Settings. */
(() => {
  'use strict';
  const CONSENT_KEY = 'epiphany-anonymous-telemetry';
  const SESSION_KEY = 'epiphany-telemetry-session';
  const FIRST_SEEN_KEY = 'epiphany-telemetry-first-seen';
  const SENT_DAYS_KEY = 'epiphany-telemetry-sent-days';
  const FIRST_SESSION_KEY = 'epiphany-telemetry-first-session';
  const VERSION = '20261024k';
  const config = window.EPIPHANY_SUPABASE_CONFIG;
  const sdk = window.supabase;
  let client = null;
  let currentSection = 'home';
  let enabled = false;
  let vitalObservers = [];
  let vitalValues = {};
  let vitalSent = false;

  function consent() {
    try { return localStorage.getItem(CONSENT_KEY) === 'yes'; } catch { return false; }
  }
  function dayKey(date = new Date()) {
    return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
  }
  function sessionId() {
    try {
      let id = localStorage.getItem(SESSION_KEY);
      if (!id) {
        id = crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
          const r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 3 | 8)).toString(16);
        });
        localStorage.setItem(SESSION_KEY, id);
      }
      return id;
    } catch { return null; }
  }
  function getClient() {
    if (client) return client;
    if (!config || !config.url || !config.publishableKey || !sdk || typeof sdk.createClient !== 'function') return null;
    try {
      client = sdk.createClient(config.url, config.publishableKey, {
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
      });
      return client;
    } catch { return null; }
  }
  function send(eventName, section = null, details = {}) {
    if (!enabled || !consent()) return;
    const id = sessionId(), supabase = getClient();
    if (!id || !supabase) return;
    const safeDetails = {};
    if (eventName === 'client_error') {
      safeDetails.name = String(details.name || 'Error').replace(/[^a-zA-Z0-9 _.-]/g, '').slice(0, 50);
      safeDetails.message = 'Client-side error; raw message omitted for privacy';
    } else if (eventName === 'web_vital') {
      const metric = ['LCP', 'CLS', 'INP'].includes(details.metric) ? details.metric : null;
      const value = Number(details.value);
      if (!metric || !Number.isFinite(value) || value < 0) return;
      safeDetails.metric = metric;
      safeDetails.value = Math.round(value * 100) / 100;
    }
    try {
      Promise.resolve(supabase.from('epiphany_telemetry').insert({
        session_id: id,
        event_name: eventName,
        section: section ? String(section).replace(/[^a-z0-9_-]/gi, '').slice(0, 40) : null,
        app_version: VERSION,
        details: safeDetails
      })).catch(() => {});
    } catch {}
  }
  function stopVitals() {
    vitalObservers.forEach(observer => { try { observer.disconnect(); } catch {} });
    vitalObservers = [];
    vitalValues = {};
    vitalSent = false;
  }
  function reportVitals() {
    if (!enabled || !consent() || vitalSent) return;
    vitalSent = true;
    Object.entries(vitalValues).forEach(([metric, value]) => send('web_vital', 'performance', { metric, value }));
  }
  function startVitals() {
    if (vitalObservers.length || typeof PerformanceObserver !== 'function') return;
    const observe = (type, callback, options = {}) => {
      try {
        const observer = new PerformanceObserver(list => callback(list.getEntries()));
        observer.observe({ type, buffered: true, ...options });
        vitalObservers.push(observer);
      } catch {}
    };
    observe('largest-contentful-paint', entries => {
      entries.forEach(entry => { vitalValues.LCP = Math.max(vitalValues.LCP || 0, entry.startTime || 0); });
    });
    let clsSessionValue = 0, clsSessionStart = 0, clsLastShift = 0;
    observe('layout-shift', entries => {
      entries.forEach(entry => {
        if (entry.hadRecentInput) return;
        if (!clsSessionStart || entry.startTime - clsLastShift > 1000 || entry.startTime - clsSessionStart > 5000) {
          clsSessionValue = 0;
          clsSessionStart = entry.startTime;
        }
        clsSessionValue += entry.value || 0;
        clsLastShift = entry.startTime;
        vitalValues.CLS = Math.max(vitalValues.CLS || 0, clsSessionValue);
      });
    });
    observe('event', entries => {
      entries.forEach(entry => {
        if (entry.interactionId && entry.duration) vitalValues.INP = Math.max(vitalValues.INP || 0, entry.duration);
      });
    }, { durationThreshold: 40 });
  }
  window.addEventListener('pagehide', reportVitals);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') reportVitals();
  });
  function start() {
    enabled = consent();
    const checkbox = document.getElementById('anonymous-telemetry');
    if (checkbox) checkbox.checked = enabled;
    if (!enabled) return;
    startVitals();
    const today = dayKey();
    try {
      const firstSeen = localStorage.getItem(FIRST_SEEN_KEY) || today;
      localStorage.setItem(FIRST_SEEN_KEY, firstSeen);
      const elapsed = Math.floor((new Date(today + 'T12:00:00').getTime() - new Date(firstSeen + 'T12:00:00').getTime()) / 86400000);
      let sentDays = {};
      try { sentDays = JSON.parse(localStorage.getItem(SENT_DAYS_KEY) || '{}') || {}; } catch {}
      if (sentDays[today] !== true) {
        send('session_start');
        sentDays[today] = true;
      }
      if (elapsed >= 2 && !sentDays.return_day_2) { send('return_day_2'); sentDays.return_day_2 = true; }
      if (elapsed >= 7 && !sentDays.return_day_7) { send('return_day_7'); sentDays.return_day_7 = true; }
      localStorage.setItem(SENT_DAYS_KEY, JSON.stringify(sentDays));
    } catch {}
  }
  function setConsent(value) {
    try {
      if (value) {
        localStorage.setItem(CONSENT_KEY, 'yes');
        start();
      } else {
        localStorage.removeItem(CONSENT_KEY);
        localStorage.removeItem(SESSION_KEY);
        enabled = false;
        stopVitals();
      }
    } catch { enabled = false; }
  }
  document.addEventListener('change', event => {
    if (event.target && event.target.id === 'anonymous-telemetry') setConsent(event.target.checked);
  });
  document.addEventListener('click', event => {
    if (!enabled || !consent()) return;
    const button = event.target.closest && event.target.closest('[data-view]');
    if (!button) return;
    const nextSection = String(button.dataset.view || '').slice(0, 40);
    if (!nextSection || nextSection === currentSection) return;
    send('section_exit', currentSection);
    send('section_open', nextSection);
    currentSection = nextSection;
  }, true);
  window.addEventListener('epiphany:progress-saved', event => {
    if (!enabled || !consent()) return;
    if (event.detail && event.detail.dailySessionStep === 'done') {
      try {
        if (localStorage.getItem(FIRST_SESSION_KEY) !== 'yes') {
          send('first_session_complete');
          localStorage.setItem(FIRST_SESSION_KEY, 'yes');
        }
      } catch {}
    }
  });
  window.addEventListener('error', event => {
    send('client_error', currentSection, { name: event.error && event.error.name || 'Error', message: event.message || 'Script error' });
  });
  window.addEventListener('unhandledrejection', event => {
    const reason = event.reason;
    send('client_error', currentSection, { name: reason && reason.name || 'UnhandledRejection', message: reason && reason.message || String(reason || 'Unhandled promise rejection') });
  });
  start();
})();
