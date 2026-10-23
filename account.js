/* Epiphany account sign-in and cloud progress sync. */
(() => {
  'use strict';
  const config = window.EPIPHANY_SUPABASE_CONFIG;
  const sdk = window.supabase;
  const $ = id => document.getElementById(id);
  const statusEl = () => $('account-status');
  let client = null;
  let currentUser = null;
  let currentMode = 'signin';
  let recoveryMode = false;
  let syncing = false;
  let lastSyncedUser = null;
  let saveTimer = null;
  let lastSaveAt = 0;

  function status(message, kind) {
    const el = statusEl();
    if (!el) return;
    el.textContent = message;
    el.dataset.state = kind || 'info';
  }
  function hideWelcomeModal(remember = true) {
    const modal = $('account-welcome-modal');
    if (modal) modal.hidden = true;
    document.body.classList.remove('account-modal-open');
    if (remember) {
      try { localStorage.setItem('epiphany-account-welcome-dismissed', '1'); } catch {}
    }
  }
  function showWelcomeModalIfNeeded() {
    const modal = $('account-welcome-modal');
    if (!modal || currentUser) return;
    let dismissed = false;
    try { dismissed = localStorage.getItem('epiphany-account-welcome-dismissed') === '1'; } catch {}
    modal.hidden = dismissed;
    document.body.classList.toggle('account-modal-open', !dismissed);
  }
  function openAccountFromWelcome(mode) {
    hideWelcomeModal(true);
    setMode(mode);
    const profileButton = document.querySelector('[data-view="profile"]');
    if (profileButton) profileButton.click();
    const emailInput = $('account-email-input');
    if (emailInput) emailInput.focus({preventScroll:true});
    status(mode === 'signup' ? 'Create an account to sync your progress across devices.' : 'Sign in to load your saved progress.', 'info');
  }
  async function signInWithProvider(provider) {
    if (!client) {
      status('Account service is not configured yet. Please try again later.', 'error');
      return;
    }
    hideWelcomeModal(true);
    try {
      const {error} = await client.auth.signInWithOAuth({
        provider,
        options: {redirectTo: window.location.origin + window.location.pathname}
      });
      if (error) throw error;
    } catch (error) {
      status(error && error.message ? error.message : 'Social sign-in could not start.', 'error');
      showWelcomeModalIfNeeded();
    }
  }

  function setMode(mode) {
    currentMode = mode;
    const title = $('account-form-title');
    const submit = $('account-submit');
    const password = $('account-password');
    const toggle = $('account-mode-toggle');
    const forgot = $('account-forgot');
    if (title) title.textContent = ({signin:'Welcome back',signup:'Create your account',reset:'Reset your password',newpassword:'Choose a new password'})[mode] || 'Your account';
    if (submit) submit.textContent = ({signin:'Sign in',signup:'Create account',reset:'Send reset link',newpassword:'Update password'})[mode] || 'Continue';
    if (password) {
      password.hidden = mode === 'reset';
      password.required = mode !== 'reset';
      password.autocomplete = mode === 'signup' ? 'new-password' : mode === 'newpassword' ? 'new-password' : 'current-password';
      password.placeholder = mode === 'newpassword' ? 'New password (at least 8 characters)' : 'Password';
      password.minLength = mode === 'newpassword' || mode === 'signup' ? 8 : 1;
      password.value = '';
    }
    if (toggle) {
      toggle.hidden = mode === 'reset' || mode === 'newpassword';
      toggle.textContent = mode === 'signup' ? 'Already have an account? Sign in' : 'New here? Create an account';
    }
    if (forgot) forgot.hidden = mode !== 'signin';
  }
  function renderAccount() {
    const signedIn = $('account-signed-in');
    const signedOut = $('account-signed-out');
    const email = $('account-email');
    if (!signedIn || !signedOut) return;
    const showSignedIn = !!currentUser && !recoveryMode;
    signedIn.hidden = !showSignedIn;
    signedOut.hidden = showSignedIn;
    if (email) email.textContent = currentUser ? currentUser.email || 'Signed-in player' : '';
    if (!showSignedIn && recoveryMode) setMode('newpassword');
  }
  function mergeProgress(local, cloud) {
    if (Array.isArray(local) && Array.isArray(cloud)) {
      const items = new Map();
      [...local, ...cloud].forEach(item => {
        try { items.set(JSON.stringify(item), item); } catch {}
      });
      return [...items.values()];
    }
    if (local && cloud && typeof local === 'object' && typeof cloud === 'object' &&
        !Array.isArray(local) && !Array.isArray(cloud)) {
      const merged = {...local};
      Object.keys(cloud).forEach(key => {
        merged[key] = Object.prototype.hasOwnProperty.call(local, key)
          ? mergeProgress(local[key], cloud[key]) : cloud[key];
      });
      return merged;
    }
    if (typeof local === 'number' && typeof cloud === 'number') return Math.max(local, cloud);
    if (typeof local === 'boolean' && typeof cloud === 'boolean') return local || cloud;
    return cloud === null || cloud === undefined || cloud === '' ? local : cloud;
  }
  async function writeCloud(progress, user) {
    const {error} = await client.from('player_progress').upsert({
      user_id: user.id,
      progress,
      updated_at: new Date().toISOString()
    }, {onConflict:'user_id'});
    if (error) throw error;
  }
  async function syncUserProgress(user) {
    if (!client || !user || syncing) return;
    syncing = true;
    status('Loading your saved progress…', 'loading');
    try {
      const local = window.__epiphanyReadProgress ? window.__epiphanyReadProgress() : {};
      let owner = '';
      try { owner = localStorage.getItem('epiphany-progress-owner') || ''; } catch {}
      const {data, error} = await client.from('player_progress')
        .select('progress')
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) throw error;

      let nextProgress;
      if (data && data.progress && typeof data.progress === 'object') {
        nextProgress = owner && owner !== user.id
          ? data.progress
          : mergeProgress(local, data.progress);
      } else {
        if (owner && owner !== user.id && window.__epiphanyResetProgress) {
          window.__epiphanyResetProgress();
          nextProgress = window.__epiphanyReadProgress ? window.__epiphanyReadProgress() : {};
        } else {
          nextProgress = local;
        }
      }
      try { localStorage.setItem('epiphany-progress-owner', user.id); } catch {}
      if (window.__epiphanyApplyCloudProgress) window.__epiphanyApplyCloudProgress(nextProgress);
      await writeCloud(nextProgress, user);
      status('Your progress is synced to your account.', 'success');
      lastSaveAt = Date.now();
    } catch (error) {
      console.error('Epiphany cloud sync failed:', error);
      status('Cloud sync failed. Your progress is still saved on this device. Check your connection and Supabase setup.', 'error');
    } finally {
      syncing = false;
    }
  }
  async function flushSave(progress) {
    if (!client || !currentUser || syncing) return;
    let owner = '';
    try { owner = localStorage.getItem('epiphany-progress-owner') || ''; } catch {}
    if (owner !== currentUser.id) return;
    try {
      await writeCloud(progress, currentUser);
      lastSaveAt = Date.now();
      status('Progress saved to your account.', 'success');
    } catch (error) {
      console.error('Epiphany cloud save failed:', error);
      status('Cloud save failed; this device still has your progress.', 'error');
    }
  }

  window.EpiphanyAuth = {
    openAccountMode: openAccountFromWelcome,
    isWelcomeOpen: () => !!($('account-welcome-modal') && !$('account-welcome-modal').hidden),
    queueSave(progress) {
      if (!client || !currentUser || syncing) return;
      clearTimeout(saveTimer);
      const snapshot = JSON.parse(JSON.stringify(progress));
      saveTimer = setTimeout(() => flushSave(snapshot), 900);
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    const form = $('account-form');
    if (!form) return;
    setMode('signin');
    showWelcomeModalIfNeeded();
    $('welcome-create-account')?.addEventListener('click', () => openAccountFromWelcome('signup'));
    $('welcome-sign-in')?.addEventListener('click', () => openAccountFromWelcome('signin'));
    $('welcome-google')?.addEventListener('click', () => signInWithProvider('google'));
    $('welcome-facebook')?.addEventListener('click', () => signInWithProvider('facebook'));
    $('welcome-continue-guest')?.addEventListener('click', () => { hideWelcomeModal(true); window.__epiphanyShowPlacement?.(); });
    $('welcome-modal-close')?.addEventListener('click', () => { hideWelcomeModal(true); window.__epiphanyShowPlacement?.(); });
    $('welcome-modal-backdrop')?.addEventListener('click', () => { hideWelcomeModal(true); window.__epiphanyShowPlacement?.(); });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && $('account-welcome-modal') && !$('account-welcome-modal').hidden) {
        hideWelcomeModal(true);
        window.__epiphanyShowPlacement?.();
      }
    });
    if (!config || !config.url || !config.publishableKey || !sdk || !sdk.createClient) {
      status('Account service is not configured yet. You can still play and save on this device.', 'error');
      return;
    }
    client = sdk.createClient(config.url, config.publishableKey);
    form.addEventListener('submit', async event => {
      event.preventDefault();
      const email = $('account-email-input').value.trim();
      const password = $('account-password').value;
      const submit = $('account-submit');
      submit.disabled = true;
      try {
        if (currentMode === 'signup') {
          const {data, error} = await client.auth.signUp({email, password, options:{emailRedirectTo:window.location.origin + window.location.pathname}});
          if (error) throw error;
          if (data.session) {
            status('Account created. Preparing your saved progress…', 'success');
          } else {
            setMode('signin');
            status('Account created. Check your email to confirm it, then sign in.', 'success');
            window.__epiphanyShowPlacement?.();
          }
        } else if (currentMode === 'signin') {
          const {error} = await client.auth.signInWithPassword({email, password});
          if (error) throw error;
          status('Signed in. Loading your progress…', 'loading');
          window.__epiphanyShowPlacement?.();
        } else if (currentMode === 'reset') {
          const {error} = await client.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + window.location.pathname
          });
          if (error) throw error;
          setMode('signin');
          status('If an account exists for this email, a password reset link has been sent.', 'success');
        } else if (currentMode === 'newpassword') {
          const {error} = await client.auth.updateUser({password});
          if (error) throw error;
          recoveryMode = false;
          renderAccount();
          setMode('signin');
          status('Password updated successfully.', 'success');
        }
      } catch (error) {
        status(error && error.message ? error.message : 'Something went wrong. Please try again.', 'error');
      } finally {
        submit.disabled = false;
      }
    });
    $('account-mode-toggle').addEventListener('click', () => {
      setMode(currentMode === 'signup' ? 'signin' : 'signup');
      status(currentMode === 'signup' ? 'Create an account to save progress online.' : 'Sign in to continue your saved progress.', 'info');
    });
    $('account-forgot').addEventListener('click', () => {
      setMode('reset');
      status('Enter your account email and we will send a reset link.', 'info');
    });
    $('account-signout').addEventListener('click', async () => {
      $('account-signout').disabled = true;
      try {
        const {error} = await client.auth.signOut();
        if (error) throw error;
        status('Signed out. Your progress remains saved on this device.', 'info');
      } catch (error) {
        status(error.message || 'Could not sign out. Please try again.', 'error');
      } finally {
        $('account-signout').disabled = false;
      }
    });
    client.auth.onAuthStateChange((event, session) => {
      currentUser = session && session.user ? session.user : null;
      if (event === 'PASSWORD_RECOVERY') recoveryMode = true;
      if (!currentUser) {
        lastSyncedUser = null;
        recoveryMode = false;
        renderAccount();
        if (event === 'SIGNED_OUT') status('Signed out. Your progress remains on this device.', 'info');
        return;
      }
      renderAccount();
      hideWelcomeModal(true);
      if (event === 'PASSWORD_RECOVERY') {
        recoveryMode = true;
        renderAccount();
        status('Choose a new password for your account.', 'info');
      }
      if (event === 'SIGNED_IN') window.__epiphanyShowPlacement?.();
      if (lastSyncedUser !== currentUser.id && event !== 'PASSWORD_RECOVERY') {
        lastSyncedUser = currentUser.id;
        setTimeout(() => syncUserProgress(currentUser), 0);
      }
    });
    client.auth.getSession().then(({data, error}) => {
      if (error) throw error;
      if (data && data.session && data.session.user) {
        currentUser = data.session.user;
        renderAccount();
        hideWelcomeModal(true);
        if (lastSyncedUser !== currentUser.id) {
          lastSyncedUser = currentUser.id;
          syncUserProgress(currentUser);
        }
      } else {
        renderAccount();
        status('Not signed in. Your progress is saved only on this device until you create an account.', 'info');
      }
    }).catch(error => {
      console.error('Epiphany session check failed:', error);
      status('Could not check your account session. You can still play offline.', 'error');
    });
  });
})();
