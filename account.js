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
  function showWelcomeModalIfNeeded(force = false) {
    const modal = $('account-welcome-modal');
    if (!modal || currentUser) return;
    let dismissed = false;
    try { dismissed = localStorage.getItem('epiphany-account-welcome-dismissed') === '1'; } catch {}
    modal.hidden = dismissed && !force;
    document.body.classList.toggle('account-modal-open', !modal.hidden);
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
        options: {redirectTo: new URL('/auth-callback.html', window.location.origin).href}
      });
      if (error) throw error;
    } catch (error) {
      status(error && error.message ? error.message : 'Social sign-in could not start.', 'error');
      showWelcomeModalIfNeeded(true);
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

  let selectedAvatar = '🦊';
  let selectedAvatarColor = '#FFE08A';
  let uploadedAvatarUrl = '';
  function profileStatus(message, kind) {
    const el = $('player-profile-status');
    if (!el) return;
    el.textContent = message;
    el.dataset.state = kind || 'info';
  }
  function escapeProfileText(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  }
  function renderPlayerAvatar() {
    const preview = $('player-avatar-preview');
    const emoji = $('player-avatar-emoji');
    const wrap = document.querySelector('.player-avatar-wrap');
    if (!preview || !emoji || !wrap) return;
    wrap.style.setProperty('--avatar-color', selectedAvatarColor);
    if (uploadedAvatarUrl) {
      preview.src = uploadedAvatarUrl;
      preview.hidden = false;
      emoji.hidden = true;
    } else {
      preview.removeAttribute('src');
      preview.hidden = true;
      emoji.hidden = false;
      emoji.textContent = selectedAvatar;
    }
    document.querySelectorAll('[data-avatar]').forEach(button => {
      const active = button.dataset.avatar === selectedAvatar && !uploadedAvatarUrl;
      button.classList.toggle('is-selected', active);
      button.setAttribute('aria-pressed', String(active));
    });
    const color = $('avatar-color');
    if (color && color.value !== selectedAvatarColor) color.value = selectedAvatarColor;
  }
  function renderPlayerProfile(profile) {
    const name = profile && profile.display_name || (currentUser && (currentUser.user_metadata && (currentUser.user_metadata.full_name || currentUser.user_metadata.name)) ) || (currentUser && currentUser.email ? currentUser.email.split('@')[0] : 'English learner');
    const bio = profile && profile.bio || 'Learning English one day at a time ✨';
    const privacy = $('player-profile-private');
    if (privacy) privacy.checked = profile && typeof profile.is_private === 'boolean' ? profile.is_private : true;
    selectedAvatar = profile && profile.avatar_emoji || '🦊';
    selectedAvatarColor = profile && /^#[0-9a-f]{6}$/i.test(profile.avatar_color || '') ? profile.avatar_color : '#FFE08A';
    uploadedAvatarUrl = profile && profile.avatar_url || '';
    if ($('player-display-name')) $('player-display-name').value = name;
    if ($('player-bio')) $('player-bio').value = bio;
    if ($('player-profile-display-name')) $('player-profile-display-name').textContent = name;
    if ($('player-profile-bio-preview')) $('player-profile-bio-preview').textContent = bio;
    if ($('player-profile-level')) {
      const level = document.querySelector('#home-level');
      $('player-profile-level').textContent = level ? level.textContent : 'A1';
    }
    renderPlayerAvatar();
  }
  async function loadPlayerProfile() {
    if (!client || !currentUser) return;
    try {
      const {data, error} = await client.from('player_profiles').select('display_name,bio,avatar_url,avatar_emoji,avatar_color,is_private').eq('user_id', currentUser.id).maybeSingle();
      if (error) throw error;
      renderPlayerProfile(data || {});
      profileStatus(data ? 'Your player profile is loaded.' : 'Choose a name and avatar, then save your profile.', 'success');
      await loadPlayerPosts();
      await loadCommunityPosts();
    } catch (error) {
      console.error('Epiphany profile load failed:', error);
      renderPlayerProfile({});
      profileStatus('Profile storage is not ready yet. Run the player profile setup SQL in Supabase, then refresh.', 'error');
      renderPostsMessage('Posts will appear here after profile storage is enabled.');
    }
  }
  function renderPostsMessage(message) {
    const list = $('player-post-list');
    if (list) list.innerHTML = '<div class="profile-empty-posts">' + escapeProfileText(message) + '</div>';
    if ($('player-post-count')) $('player-post-count').textContent = '0 posts';
  }
  async function loadPlayerPosts() {
    if (!client || !currentUser || !$('player-post-list')) return;
    const {data, error} = await client.from('player_posts').select('id,body,created_at').eq('user_id', currentUser.id).order('created_at', {ascending:false}).limit(30);
    if (error) throw error;
    const posts = data || [];
    $('player-post-count').textContent = posts.length + (posts.length === 1 ? ' post' : ' posts');
    $('player-post-list').innerHTML = posts.length ? posts.map(post => {
      const date = post.created_at ? new Date(post.created_at).toLocaleDateString(undefined,{year:'numeric',month:'short',day:'numeric'}) : '';
      return '<article class="player-post"><div class="player-post-top"><span class="player-post-date">' + escapeProfileText(date) + '</span><button type="button" class="player-post-delete" data-delete-post="' + escapeProfileText(post.id) + '">Delete</button></div><p class="player-post-body">' + escapeProfileText(post.body) + '</p></article>';
    }).join('') : '<div class="profile-empty-posts">Your English corner is ready. Share your first little thought above ✨</div>';
  }
  async function loadCommunityPosts() {
    const list = $('community-post-list');
    if (!client || !list) return;
    const {data, error} = await client.from('player_posts').select('id,user_id,body,created_at').order('created_at',{ascending:false}).limit(20);
    if (error) throw error;
    const posts = data || [];
    if (!posts.length) {
      list.innerHTML = '<div class="profile-empty-posts">No posts yet. Be the first to share a little English moment ✨</div>';
      return;
    }
    const userIds = [...new Set(posts.map(post => post.user_id))];
    const {data:profiles, error:profileError} = await client.from('player_profiles').select('user_id,display_name,avatar_url,avatar_emoji,avatar_color,is_private').in('user_id',userIds);
    if (profileError) throw profileError;
    const byUser = new Map((profiles || []).map(profile => [profile.user_id,profile]));
    const visiblePosts = posts.filter(post => byUser.has(post.user_id) && byUser.get(post.user_id).is_private === false);
    if (!visiblePosts.length) {
      list.innerHTML = '<div class="profile-empty-posts">No public posts yet. Private players stay private ✨</div>';
      return;
    }
    list.innerHTML = visiblePosts.map(post => {
      const profile = byUser.get(post.user_id) || {};
      const name = profile.display_name || 'English learner';
      const date = post.created_at ? new Date(post.created_at).toLocaleDateString(undefined,{year:'numeric',month:'short',day:'numeric'}) : '';
      const avatar = profile.avatar_url
        ? '<img class="community-avatar-image" src="' + escapeProfileText(profile.avatar_url) + '" alt="">'
        : '<span>' + escapeProfileText(profile.avatar_emoji || '🦊') + '</span>';
      return '<article class="community-post"><div class="community-post-avatar" style="--avatar-color:' + escapeProfileText(/^#[0-9a-f]{6}$/i.test(profile.avatar_color || '') ? profile.avatar_color : '#FFE08A') + '">' + avatar + '</div><div class="community-post-content"><div class="community-post-meta"><strong>' + escapeProfileText(name) + '</strong><time>' + escapeProfileText(date) + '</time></div><p class="player-post-body">' + escapeProfileText(post.body) + '</p></div></article>';
    }).join('');
  }
  async function persistPlayerProfile() {
    if (!client || !currentUser) {
      profileStatus('Sign in to save your profile.', 'error');
      return;
    }
    const displayName = ($('player-display-name')?.value || '').trim();
    const bio = ($('player-bio')?.value || '').trim();
    if (!displayName) {
      profileStatus('Please choose a display name first.', 'error');
      $('player-display-name')?.focus();
      return;
    }
    const saveButton = $('player-profile-save');
    if (saveButton) saveButton.disabled = true;
    profileStatus('Saving your profile…', 'loading');
    try {
      const privacy = $('player-profile-private');
      const payload = {user_id:currentUser.id,display_name:displayName,bio,avatar_url:uploadedAvatarUrl || null,avatar_emoji:selectedAvatar,avatar_color:selectedAvatarColor,is_private:privacy ? privacy.checked : true,updated_at:new Date().toISOString()};
      const {error} = await client.from('player_profiles').upsert(payload,{onConflict:'user_id'});
      if (error) throw error;
      if ($('player-profile-display-name')) $('player-profile-display-name').textContent = displayName;
      if ($('player-profile-bio-preview')) $('player-profile-bio-preview').textContent = bio || 'Learning English one day at a time ✨';
      renderPlayerAvatar();
      profileStatus((privacy && privacy.checked ? 'Profile saved as private. Only you can see your profile and posts.' : 'Profile saved as public. Other learners can see your profile and shared posts.') + ' ✨', 'success');
    } catch (error) {
      console.error('Epiphany profile save failed:', error);
      profileStatus('Could not save the profile. Check that the Supabase profile setup SQL has been run.', 'error');
    } finally {
      if (saveButton) saveButton.disabled = false;
    }
  }
  async function uploadPlayerAvatar(file) {
    if (!client || !currentUser) { profileStatus('Sign in before uploading a picture.', 'error'); return; }
    if (!file) return;
    if (!/^image\/(png|jpeg|webp)$/.test(file.type)) { profileStatus('Please choose a PNG, JPG or WebP image.', 'error'); return; }
    if (file.size > 3 * 1024 * 1024) { profileStatus('Please use an image smaller than 3 MB.', 'error'); return; }
    const input = $('player-avatar-upload');
    if (input) input.disabled = true;
    profileStatus('Uploading your picture…', 'loading');
    try {
      const safeName = file.name.toLowerCase().replace(/[^a-z0-9._-]+/g,'-').slice(-80) || 'avatar-image';
      const path = currentUser.id + '/' + Date.now() + '-' + safeName;
      const {error} = await client.storage.from('player-avatars').upload(path,file,{cacheControl:'3600',upsert:true,contentType:file.type});
      if (error) throw error;
      const {data} = client.storage.from('player-avatars').getPublicUrl(path);
      uploadedAvatarUrl = data.publicUrl;
      renderPlayerAvatar();
      await persistPlayerProfile();
    } catch (error) {
      console.error('Epiphany avatar upload failed:', error);
      profileStatus('Picture upload failed. Make sure the player-avatars storage bucket was created in Supabase.', 'error');
    } finally {
      if (input) { input.disabled = false; input.value = ''; }
    }
  }
  function setPlayerProfileAccess() {
    const form = $('player-profile-form');
    const postForm = $('player-post-form');
    if (!form || !postForm) return;
    const locked = !currentUser;
    form.querySelectorAll('input,textarea,button').forEach(el => { el.disabled = locked; });
    postForm.querySelectorAll('textarea,button').forEach(el => { el.disabled = locked; });
    if (locked) {
      profileStatus('Sign in to create your profile and share English posts. Your game progress is still available as a guest.', 'info');
      renderPostsMessage('Sign in to start your own English corner.');
    }
  }
  function wirePlayerProfile() {
    const form = $('player-profile-form');
    const postForm = $('player-post-form');
    if (!form || form.dataset.wired === '1') return;
    form.dataset.wired = '1';
    setPlayerProfileAccess();
    document.querySelectorAll('[data-avatar]').forEach(button => button.addEventListener('click', () => {
      selectedAvatar = button.dataset.avatar;
      uploadedAvatarUrl = '';
      renderPlayerAvatar();
    }));
    $('avatar-color')?.addEventListener('input', event => {
      selectedAvatarColor = event.target.value;
      renderPlayerAvatar();
    });
    $('player-avatar-upload')?.addEventListener('change', event => uploadPlayerAvatar(event.target.files && event.target.files[0]));
    form.addEventListener('submit', async event => { event.preventDefault(); await persistPlayerProfile(); });
    postForm.addEventListener('submit', async event => {
      event.preventDefault();
      if (!client || !currentUser) { profileStatus('Sign in to share a post.', 'error'); return; }
      const input = $('player-post-text');
      const body = (input.value || '').trim();
      if (!body) return;
      const submit = $('player-post-submit');
      submit.disabled = true;
      try {
        const {error} = await client.from('player_posts').insert({user_id:currentUser.id,body});
        if (error) throw error;
        input.value = '';
        await loadPlayerPosts();
        await loadCommunityPosts();
        profileStatus('Post shared in your English corner.', 'success');
      } catch (error) {
        console.error('Epiphany post create failed:', error);
        profileStatus('Could not share the post. Check the player profile setup SQL in Supabase.', 'error');
      } finally { submit.disabled = false; }
    });
    $('community-refresh')?.addEventListener('click', async () => {
      const button = $('community-refresh');
      button.disabled = true;
      try { await loadCommunityPosts(); } catch (error) { profileStatus('Could not refresh community posts.', 'error'); }
      finally { button.disabled = false; }
    });
    $('player-post-list')?.addEventListener('click', async event => {
      const button = event.target.closest('[data-delete-post]');
      if (!button || !client || !currentUser) return;
      if (!window.confirm('Delete this post?')) return;
      button.disabled = true;
      try {
        const {error} = await client.from('player_posts').delete().eq('id',button.dataset.deletePost).eq('user_id',currentUser.id);
        if (error) throw error;
        await loadPlayerPosts();
        await loadCommunityPosts();
        profileStatus('Post deleted.', 'success');
      } catch (error) {
        profileStatus('Could not delete this post. Please try again.', 'error');
        button.disabled = false;
      }
    });
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
    wirePlayerProfile();
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
          const {data, error} = await client.auth.signUp({email, password, options:{emailRedirectTo:new URL('/auth-callback.html', window.location.origin).href}});
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
        } else if (currentMode === 'reset') {
          const {error} = await client.auth.resetPasswordForEmail(email, {
            redirectTo: new URL('/auth-callback.html', window.location.origin).href
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
        setPlayerProfileAccess();
        if (event === 'SIGNED_OUT') status('Signed out. Your progress remains on this device.', 'info');
        return;
      }
      renderAccount();
      setPlayerProfileAccess();
      hideWelcomeModal(true);
      loadPlayerProfile().catch(error => console.error('Profile refresh failed:', error));
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
        setPlayerProfileAccess();
        hideWelcomeModal(true);
        loadPlayerProfile().catch(error => console.error('Profile refresh failed:', error));
        if (lastSyncedUser !== currentUser.id) {
          lastSyncedUser = currentUser.id;
          syncUserProgress(currentUser);
        }
      } else {
        renderAccount();
        setPlayerProfileAccess();
        status('Not signed in. Your progress is saved only on this device until you create an account.', 'info');
      }
    }).catch(error => {
      console.error('Epiphany session check failed:', error);
      status('Could not check your account session. You can still play offline.', 'error');
    });
  });
})();
