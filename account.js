/* Epiphany account sign-in and cloud progress sync. */
(() => {
  'use strict';
  const config = window.EPIPHANY_SUPABASE_CONFIG;
  const sdk = window.supabase;
  const $ = id => document.getElementById(id);
  // Works on a domain root and on a sub-folder host (e.g. /Epiphany/) alike.
  const callbackUrl = () => new URL('auth-callback.html', new URL('./', window.location.href)).href;
  const statusEl = () => $('account-status');
  let client = null;
  let currentUser = null;
  let authReady = false;
  let resolveAuthReady;
  const authReadyPromise = new Promise(resolve => { resolveAuthReady = resolve; });
  function markAuthReady() {
    if (authReady) return;
    authReady = true;
    resolveAuthReady();
  }
  let currentMode = 'signin';
  let recoveryMode = false;
  let pendingVerificationEmail = '';
  let resendCooldownTimer = null;
  let syncing = false;
  let lastSyncedUser = null;
  let saveTimer = null;
  let pendingCloudProgress = null;
  let lastSaveAt = 0;

  function status(message, kind) {
    const el = statusEl();
    if (!el) return;
    el.textContent = message;
    el.dataset.state = kind || 'info';
  }
  function hideWelcomeModal() {
    const modal = $('account-welcome-modal');
    if (modal) modal.hidden = true;
    document.body.classList.remove('account-modal-open');
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
        options: {redirectTo: callbackUrl()}
      });
      if (error) throw error;
    } catch (error) {
      status(error && error.message ? error.message : 'Social sign-in could not start.', 'error');
    }
  }

  function setMode(mode) {
    currentMode = mode;
    const title = $('account-form-title');
    const submit = $('account-submit');
    const password = $('account-password');
    const toggle = $('account-mode-toggle');
    const forgot = $('account-forgot');
    const emailInput = $('account-email-input');
    const otpLabel = $('account-otp-label');
    const otpInput = $('account-otp-input');
    const otpHelp = $('account-otp-help');
    const resend = $('account-resend-code');
    const editEmail = $('account-edit-email');
    if (title) title.textContent = ({signin:'Welcome back',signup:'Create your account',verify:'Verify your email',reset:'Reset your password',newpassword:'Choose a new password'})[mode] || 'Your account';
    if (submit) submit.textContent = ({signin:'Sign in',signup:'Create account',verify:'Verify code',reset:'Send reset link',newpassword:'Update password'})[mode] || 'Continue';
    if (emailInput) emailInput.readOnly = mode === 'verify';
    if (otpLabel) otpLabel.hidden = mode !== 'verify';
    if (otpHelp) otpHelp.hidden = mode !== 'verify';
    if (otpInput) { otpInput.hidden = mode !== 'verify'; otpInput.required = mode === 'verify'; if (mode !== 'verify') otpInput.value = ''; }
    if (resend) resend.hidden = mode !== 'verify';
    if (editEmail) editEmail.hidden = mode !== 'verify';
    if (password) {
      password.hidden = mode === 'reset' || mode === 'verify';
      password.required = mode !== 'reset' && mode !== 'verify';
      password.autocomplete = mode === 'signup' ? 'new-password' : mode === 'newpassword' ? 'new-password' : 'current-password';
      password.placeholder = mode === 'newpassword' ? 'New password (at least 8 characters)' : 'Password';
      password.minLength = mode === 'newpassword' || mode === 'signup' ? 8 : 1;
      password.value = '';
    }
    if (toggle) {
      toggle.hidden = mode === 'reset' || mode === 'newpassword' || mode === 'verify';
      toggle.textContent = mode === 'signup' ? 'Already have an account? Sign in' : 'New here? Create an account';
    }
    if (forgot) forgot.hidden = mode !== 'signin';
    if (mode === 'verify' && otpInput) otpInput.focus({preventScroll:true});
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
    if (!client || !user) return;
    if (syncing) {
      // An account can change while another account is syncing; do not drop the new user's sync.
      setTimeout(() => {
        if (currentUser?.id === user.id) syncUserProgress(user);
      }, 400);
      return;
    }
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
      // Ignore stale responses if the user signed out or switched accounts during the request.
      if (currentUser?.id !== user.id) return;

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
    if (!client || !currentUser) return;
    if (progress) pendingCloudProgress = progress;
    if (syncing) {
      clearTimeout(saveTimer);
      saveTimer = setTimeout(() => flushSave(pendingCloudProgress), 400);
      return;
    }
    let owner = '';
    try { owner = localStorage.getItem('epiphany-progress-owner') || ''; } catch {}
    if (owner !== currentUser.id || !pendingCloudProgress) return;
    const user = currentUser;
    const snapshot = pendingCloudProgress;
    try {
      // Merge with the latest cloud copy before writing to reduce cross-device overwrites.
      const {data, error} = await client.from('player_progress')
        .select('progress')
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) throw error;
      if (currentUser?.id !== user.id) return;
      const latest = data && data.progress && typeof data.progress === 'object'
        ? mergeProgress(snapshot, data.progress)
        : snapshot;
      if (window.__epiphanyApplyCloudProgress) window.__epiphanyApplyCloudProgress(latest);
      await writeCloud(latest, user);
      if (pendingCloudProgress === snapshot) pendingCloudProgress = null;
      lastSaveAt = Date.now();
      status('Progress saved to your account.', 'success');
    } catch (error) {
      console.error('Epiphany cloud save failed:', error);
      status('Cloud save failed; this device still has your progress. It will retry when connection returns.', 'error');
    }
  }

  window.addEventListener('online', () => {
    if (currentUser && pendingCloudProgress) flushSave(pendingCloudProgress);
    else if (currentUser && !syncing) syncUserProgress(currentUser);
  });

  let selectedAvatar = '🦊';
  let selectedAvatarColor = '#FFE08A';
  let selectedAvatarColor2 = '#F0EDFF';
  let uploadedAvatarUrl = '';
  let selectedBannerStyle = 'aurora';
  let uploadedBannerUrl = '';
  let selectedAvatarFrame = 'none';
  let selectedProfileAccent = '#7c6cff';
  let selectedVisibility = 'private';
  let guestAvatarObjectUrl = '';
  let profileSnapshot = null;
  let profileAutoSaveTimer = null;
  let profileIsLoading = false;
  const guestProfileKey = 'epiphany-guest-profile-v1';
  let cropSourceImage = null, cropSourceUrl = '', cropScale = 1, cropOffsetX = 0, cropOffsetY = 0, cropDragging = false, cropLastPointer = null;
  function profileStatus(message, kind) {
    const el = $('player-profile-status');
    if (!el) return;
    el.textContent = message;
    el.dataset.state = kind || 'info';
  }
  function escapeProfileText(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  }
  function updateLiveProfilePreview() {
    const name=($('player-display-name')?.value||'').trim()||'English learner';
    const bio=($('player-bio')?.value||'').trim()||'Learning English one day at a time ✨';
    if($('player-profile-display-name'))$('player-profile-display-name').textContent=name;
    if($('player-profile-bio-preview'))$('player-profile-bio-preview').textContent=bio;
    if($('profile-live-name'))$('profile-live-name').textContent=name;
    if($('profile-live-bio'))$('profile-live-bio').textContent=bio;
    const liveAvatar=$('profile-live-avatar'),liveImage=$('profile-live-image'),liveEmoji=$('profile-live-emoji');
    if(liveAvatar){liveAvatar.style.setProperty('--avatar-color',selectedAvatarColor);liveAvatar.style.setProperty('--avatar-color-2',selectedAvatarColor2);liveAvatar.dataset.frame=selectedAvatarFrame;}
    if(liveImage&&liveEmoji){if(uploadedAvatarUrl){liveImage.src=uploadedAvatarUrl;liveImage.hidden=false;liveEmoji.hidden=true;}else{liveImage.removeAttribute('src');liveImage.hidden=true;liveEmoji.hidden=false;liveEmoji.textContent=selectedAvatar;}}
    const banner=$('profile-live-banner');if(banner){banner.dataset.bannerStyle=selectedBannerStyle;banner.style.backgroundImage=uploadedBannerUrl?'linear-gradient(0deg,rgba(20,25,50,.12),rgba(20,25,50,.12)),url("'+uploadedBannerUrl.replace(/["\\]/g,'')+'")':'';}
    const view=$('profile-view');if(view)view.style.setProperty('--profile-accent',selectedProfileAccent);
    const explain=$('profile-privacy-explainer');if(explain)explain.textContent=selectedVisibility==='public'?'Public: other learners can see your profile and shared posts. Your learning progress remains private.':selectedVisibility==='friends'?'Friends only: hidden from everyone for now because friend connections are not yet available.':'Private: your profile and posts are hidden from other learners. Your learning progress is always private.';
  }
  function profileSnapshotNow(){return {display_name:$('player-display-name')?.value||'',bio:$('player-bio')?.value||'',avatar:selectedAvatar,avatarColor:selectedAvatarColor,avatarColor2:selectedAvatarColor2,avatarUrl:uploadedAvatarUrl,avatarLocal:guestAvatarObjectUrl,bannerStyle:selectedBannerStyle,bannerUrl:uploadedBannerUrl,frame:selectedAvatarFrame,accent:selectedProfileAccent,visibility:selectedVisibility};}
  async function optimizeGuestImage(file,width,height){const url=URL.createObjectURL(file);try{const image=new Image();await new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=reject;image.src=url;});const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;const ctx=canvas.getContext('2d');const scale=Math.max(width/image.naturalWidth,height/image.naturalHeight);const w=image.naturalWidth*scale,h=image.naturalHeight*scale;ctx.drawImage(image,(width-w)/2,(height-h)/2,w,h);return canvas.toDataURL('image/webp',.78);}finally{URL.revokeObjectURL(url);}}
  function applyProfileSnapshot(s){if(!s)return;selectedAvatar=s.avatar||'🦊';selectedAvatarColor=s.avatarColor||'#FFE08A';selectedAvatarColor2=s.avatarColor2||'#F0EDFF';uploadedAvatarUrl=s.avatarUrl||'';guestAvatarObjectUrl=s.avatarLocal||'';selectedBannerStyle=s.bannerStyle||'aurora';uploadedBannerUrl=s.bannerUrl||'';selectedAvatarFrame=s.frame||'none';selectedProfileAccent=s.accent||'#7c6cff';selectedVisibility=s.visibility||'private';if($('player-display-name'))$('player-display-name').value=s.display_name||'';if($('player-bio'))$('player-bio').value=s.bio||'';document.querySelectorAll('[name="profile-visibility"]').forEach(el=>el.checked=el.value===selectedVisibility);renderPlayerAvatar();updateLiveProfilePreview();}
  function scheduleProfileAutoSave(){
    updateLiveProfilePreview();if(profileIsLoading)return;
    if(!currentUser){try{localStorage.setItem(guestProfileKey,JSON.stringify(profileSnapshotNow()));profileStatus('Saved on this device. Sign in to keep your profile across devices.','success');}catch{profileStatus('Preview updated. This browser could not store the guest profile.','error');}return;}
    const state=$('profile-autosave-state');if(state)state.textContent='Unsaved changes…';clearTimeout(profileAutoSaveTimer);
    profileAutoSaveTimer=setTimeout(async()=>{const stateNow=$('profile-autosave-state');if(stateNow)stateNow.textContent='Saving…';const ok=await persistPlayerProfile(true);if(stateNow)stateNow.textContent=ok?'Saved ✓':'Could not save — check connection';},700);
  }
  function renderPlayerAvatar() {
    const preview = $('player-avatar-preview');
    const emoji = $('player-avatar-emoji');
    const wrap = document.querySelector('.player-avatar-wrap');
    if (!preview || !emoji || !wrap) return;
    wrap.style.setProperty('--avatar-color', selectedAvatarColor);
    wrap.style.setProperty('--avatar-color-2', selectedAvatarColor2);
    wrap.dataset.frame = selectedAvatarFrame;
    const profileView = $('profile-view');
    if (profileView) profileView.style.setProperty('--profile-accent', selectedProfileAccent);
    const hero = document.querySelector('.player-profile-hero');
    if (hero) { hero.dataset.bannerStyle = selectedBannerStyle; hero.style.backgroundImage = uploadedBannerUrl ? 'linear-gradient(0deg,rgba(20,25,50,.12),rgba(20,25,50,.12)),url("' + uploadedBannerUrl.replace(/["\\]/g,'') + '")' : ''; }
    document.querySelectorAll('[data-banner-style]').forEach(button=>{const active=button.dataset.bannerStyle===selectedBannerStyle&&!uploadedBannerUrl;button.classList.toggle('is-selected',active);button.setAttribute('aria-pressed',String(active));});
    document.querySelectorAll('[data-avatar-frame]').forEach(button=>{const active=button.dataset.avatarFrame===selectedAvatarFrame;button.classList.toggle('is-selected',active);button.setAttribute('aria-pressed',String(active));});
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
    const color = $('avatar-color'); if (color && color.value !== selectedAvatarColor) color.value = selectedAvatarColor;
    const color2 = $('avatar-color-2'); if (color2 && color2.value !== selectedAvatarColor2) color2.value = selectedAvatarColor2;
    const accent = $('profile-accent-color'); if (accent && accent.value !== selectedProfileAccent) accent.value = selectedProfileAccent;
    const removeAvatar = $('player-avatar-remove'); if (removeAvatar) removeAvatar.hidden = !uploadedAvatarUrl;
    const removeBanner = $('player-banner-remove'); if (removeBanner) removeBanner.hidden = !uploadedBannerUrl;
    updateFrameAvailability();
  }
  function renderPlayerProfile(profile) {
    const name = profile && profile.display_name || (currentUser && (currentUser.user_metadata && (currentUser.user_metadata.full_name || currentUser.user_metadata.name)) ) || (currentUser && currentUser.email ? currentUser.email.split('@')[0] : 'English learner');
    const bio = profile && profile.bio || 'Learning English one day at a time ✨';
    selectedVisibility = profile && ['public','friends','private'].includes(profile.visibility) ? profile.visibility : (profile && profile.is_private === false ? 'public' : 'private');
    document.querySelectorAll('[name="profile-visibility"]').forEach(el=>el.checked=el.value===selectedVisibility);
    selectedAvatar = profile && profile.avatar_emoji || '🦊';
    selectedAvatarColor = profile && /^#[0-9a-f]{6}$/i.test(profile.avatar_color || '') ? profile.avatar_color : '#FFE08A';
    selectedAvatarColor2 = profile && /^#[0-9a-f]{6}$/i.test(profile.avatar_color_2 || '') ? profile.avatar_color_2 : '#F0EDFF';
    uploadedAvatarUrl = profile && profile.avatar_url || '';
    selectedBannerStyle = ['aurora','sunset','ocean','pattern'].includes(profile && profile.banner_style) ? profile.banner_style : 'aurora';
    uploadedBannerUrl = profile && profile.banner_url || '';
    selectedAvatarFrame = ['none','gold','stars'].includes(profile && profile.avatar_frame) ? profile.avatar_frame : 'none';
    selectedProfileAccent = profile && /^#[0-9a-f]{6}$/i.test(profile.accent_color || '') ? profile.accent_color : '#7c6cff';
    if ($('player-display-name')) $('player-display-name').value = name;
    if ($('player-bio')) $('player-bio').value = bio;
    if ($('player-profile-display-name')) $('player-profile-display-name').textContent = name;
    if ($('player-profile-bio-preview')) $('player-profile-bio-preview').textContent = bio;
    if ($('player-profile-level')) {
      const level = document.querySelector('#home-level');
      $('player-profile-level').textContent = level ? level.textContent : 'A1';
    }
    renderPlayerAvatar();updateLiveProfilePreview();profileSnapshot=profileSnapshotNow();
  }
  async function loadPlayerProfile() {
    if (!client || !currentUser) return;
    try {
      const {data, error} = await client.from('player_profiles').select('display_name,bio,avatar_url,avatar_emoji,avatar_color,is_private,visibility,avatar_color_2,banner_style,banner_url,avatar_frame,accent_color').eq('user_id', currentUser.id).maybeSingle();
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
  async function persistPlayerProfile(silent = false) {
    if(!client||!currentUser){try{localStorage.setItem(guestProfileKey,JSON.stringify(profileSnapshotNow()));profileStatus('Saved on this device. Sign in to keep your profile across devices.','success');return true;}catch{profileStatus('Could not save this profile on your device. Check browser storage settings.','error');return false;}}
    const displayName = ($('player-display-name')?.value || '').trim();
    const bio = ($('player-bio')?.value || '').trim();
    if (!displayName) {
      profileStatus('Please choose a display name first.', 'error');
      $('player-display-name')?.focus();
      return;
    }
    const saveButton = $('player-profile-save');
    if (saveButton) saveButton.disabled = true;
    if(!silent)profileStatus('Saving your profile…', 'loading');
    try {
      const privacy = $('player-profile-private');
      const payload = {user_id:currentUser.id,display_name:displayName,bio,avatar_url:uploadedAvatarUrl || null,avatar_emoji:selectedAvatar,avatar_color:selectedAvatarColor,avatar_color_2:selectedAvatarColor2,banner_style:selectedBannerStyle,banner_url:uploadedBannerUrl || null,avatar_frame:selectedAvatarFrame,accent_color:selectedProfileAccent,visibility:selectedVisibility,is_private:selectedVisibility!=='public',updated_at:new Date().toISOString()};
      const {error} = await client.from('player_profiles').upsert(payload,{onConflict:'user_id'});
      if (error) throw error;
      if ($('player-profile-display-name')) $('player-profile-display-name').textContent = displayName;
      if ($('player-profile-bio-preview')) $('player-profile-bio-preview').textContent = bio || 'Learning English one day at a time ✨';
      renderPlayerAvatar();
      try { await loadCommunityPosts(); } catch (refreshError) { console.warn('Community refresh after privacy change failed:', refreshError); }
      profileSnapshot=profileSnapshotNow();
      if(!silent)profileStatus((selectedVisibility==='public'?'Profile saved as public. Other learners can see your profile and shared posts.':selectedVisibility==='friends'?'Saved as friends only. Until friend connections are available, the profile remains hidden.':'Profile saved as private. Only you can see your profile and posts.')+' ✨','success');
      return true;
    } catch (error) {
      console.error('Epiphany profile save failed:', error);
      profileStatus('Could not save the profile. Check your connection and Supabase profile setup SQL.', 'error');
      return false;
    } finally {
      if (saveButton) saveButton.disabled = false;
    }
  }
  function drawAvatarCrop() {
    const canvas=$('avatar-crop-canvas'); if(!canvas||!cropSourceImage)return;
    const ctx=canvas.getContext('2d'),w=canvas.width,h=canvas.height;ctx.clearRect(0,0,w,h);ctx.save();ctx.beginPath();ctx.arc(w/2,h/2,w/2-2,0,Math.PI*2);ctx.clip();ctx.fillStyle=selectedAvatarColor;ctx.fillRect(0,0,w,h);
    const fit=Math.max(w/cropSourceImage.naturalWidth,h/cropSourceImage.naturalHeight)*cropScale,dw=cropSourceImage.naturalWidth*fit,dh=cropSourceImage.naturalHeight*fit;
    ctx.drawImage(cropSourceImage,(w-dw)/2+cropOffsetX,(h-dh)/2+cropOffsetY,dw,dh);ctx.restore();ctx.beginPath();ctx.arc(w/2,h/2,w/2-2,0,Math.PI*2);ctx.strokeStyle='rgba(255,255,255,.95)';ctx.lineWidth=4;ctx.stroke();
  }
  function openAvatarCrop(file) {
    if(!client||!currentUser){profileStatus('Sign in before uploading a picture.','error');return;} if(!file)return;
    if(!/^image\/(png|jpeg|webp)$/.test(file.type)){profileStatus('Please choose a PNG, JPG or WebP image.','error');return;}
    if(file.size>12*1024*1024){profileStatus('Please choose an image smaller than 12 MB.','error');return;}
    if(cropSourceUrl)URL.revokeObjectURL(cropSourceUrl);cropSourceUrl=URL.createObjectURL(file);cropSourceImage=new Image();
    cropSourceImage.onload=()=>{cropScale=1;cropOffsetX=0;cropOffsetY=0;$('avatar-crop-zoom').value='1';$('avatar-crop-modal').hidden=false;document.body.classList.add('avatar-crop-open');drawAvatarCrop();$('avatar-crop-save')?.focus();};
    cropSourceImage.onerror=()=>profileStatus('This picture could not be opened. Please try another image.','error');cropSourceImage.src=cropSourceUrl;
  }
  function closeAvatarCrop() {
    const modal=$('avatar-crop-modal');if(modal)modal.hidden=true;document.body.classList.remove('avatar-crop-open');if(cropSourceUrl)URL.revokeObjectURL(cropSourceUrl);cropSourceUrl='';cropSourceImage=null;
  }
  async function saveCroppedAvatar() {
    if(!cropSourceImage||!client||!currentUser)return;
    const canvas=document.createElement('canvas');canvas.width=256;canvas.height=256;const ctx=canvas.getContext('2d');
    const fit=Math.max(256/cropSourceImage.naturalWidth,256/cropSourceImage.naturalHeight)*cropScale,dw=cropSourceImage.naturalWidth*fit,dh=cropSourceImage.naturalHeight*fit;
    ctx.save();ctx.beginPath();ctx.arc(128,128,128,0,Math.PI*2);ctx.clip();ctx.fillStyle=selectedAvatarColor;ctx.fillRect(0,0,256,256);ctx.drawImage(cropSourceImage,(256-dw)/2+cropOffsetX,(256-dh)/2+cropOffsetY,dw,dh);ctx.restore();
    const button=$('avatar-crop-save');if(button)button.disabled=true;profileStatus('Optimizing your picture…','loading');
    try{const blob=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('Image compression failed')),'image/webp',.82));const path=currentUser.id+'/'+Date.now()+'-avatar.webp';const {error}=await client.storage.from('player-avatars').upload(path,blob,{cacheControl:'31536000',upsert:true,contentType:'image/webp'});if(error)throw error;uploadedAvatarUrl=client.storage.from('player-avatars').getPublicUrl(path).data.publicUrl;renderPlayerAvatar();closeAvatarCrop();await persistPlayerProfile();}
    catch(error){console.error('Epiphany avatar upload failed:',error);profileStatus('Picture upload failed. Check the player-avatars storage bucket and try again.','error');}
    finally{if(button)button.disabled=false;const input=$('player-avatar-upload');if(input){input.disabled=false;input.value='';}}
  }
  async function uploadProfileBanner(file) {
    if(!client||!currentUser){profileStatus('Sign in before uploading a cover image.','error');return;}if(!file)return;
    if(!/^image\/(png|jpeg|webp)$/.test(file.type)){profileStatus('Please choose a PNG, JPG or WebP image.','error');return;}if(file.size>12*1024*1024){profileStatus('Please choose a cover image smaller than 12 MB.','error');return;}
    const input=$('player-banner-upload');if(input)input.disabled=true;
    try{const image=new Image(),url=URL.createObjectURL(file);await new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=reject;image.src=url;});const canvas=document.createElement('canvas');canvas.width=1200;canvas.height=360;const ctx=canvas.getContext('2d'),scale=Math.max(1200/image.naturalWidth,360/image.naturalHeight),dw=image.naturalWidth*scale,dh=image.naturalHeight*scale;ctx.drawImage(image,(1200-dw)/2,(360-dh)/2,dw,dh);URL.revokeObjectURL(url);const blob=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('Cover compression failed')),'image/webp',.8));const path=currentUser.id+'/'+Date.now()+'-cover.webp';const {error}=await client.storage.from('player-avatars').upload(path,blob,{cacheControl:'31536000',upsert:true,contentType:'image/webp'});if(error)throw error;uploadedBannerUrl=client.storage.from('player-avatars').getPublicUrl(path).data.publicUrl;renderPlayerAvatar();await persistPlayerProfile();}
    catch(error){console.error('Epiphany cover upload failed:',error);profileStatus('Cover upload failed. Check the player-avatars storage bucket and try again.','error');}
    finally{if(input){input.disabled=false;input.value='';}}
  }
  function updateFrameAvailability() {
    const achievements=window.EPIPHANY_PROFILE_ACHIEVEMENTS||{};
    const streak=Math.max(Number($('home-streak')?.textContent||0),Number($('chip-streak')?.textContent||0),Number(achievements.streak||0));
    const words=Math.max(Number(achievements.masteredWords||0),...['home-words','chip-words','progress-words-mastered','profile-words-mastered'].map(id=>Number($(id)?.textContent||0)),0);
    document.querySelectorAll('[data-frame-requirement]').forEach(button=>{const req=button.dataset.frameRequirement,unlocked=req==='streak'?streak>=30:words>=100;button.disabled=!unlocked;button.classList.toggle('is-locked',!unlocked);button.setAttribute('aria-label',button.textContent.replace(/^🔒\s*/,'')+(unlocked?' unlocked':' locked'));button.textContent=(unlocked?'':'🔒 ')+(req==='streak'?'Gold · 30-day streak':'Stars · 100 words');});
    const hint=$('avatar-frame-hint');if(hint)hint.textContent='Gold frame: 30-day streak. Star frame: master 100 words. Keep learning to unlock them.';
    if(!document.querySelector('[data-avatar-frame="'+selectedAvatarFrame+'"]:not(:disabled)'))selectedAvatarFrame='none';
    const avatarWrap=document.querySelector('.player-avatar-wrap');if(avatarWrap)avatarWrap.dataset.frame=selectedAvatarFrame;
    document.querySelectorAll('[data-avatar-frame]').forEach(button=>button.classList.toggle('is-selected',button.dataset.avatarFrame===selectedAvatarFrame));
  }
  function setPlayerProfileAccess() {
    const form = $('player-profile-form');
    const postForm = $('player-post-form');
    if (!form || !postForm) return;
    form.querySelectorAll('input,textarea,button').forEach(el=>{el.disabled=false;});
    postForm.querySelectorAll('textarea,button').forEach(el=>{el.disabled=!currentUser;});
    if(!currentUser){try{const saved=JSON.parse(localStorage.getItem(guestProfileKey)||'null');if(saved)applyProfileSnapshot(saved);else updateLiveProfilePreview();}catch{updateLiveProfilePreview();}profileStatus('Guest mode: changes are saved on this device. Sign in to keep them across devices.','info');renderPostsMessage('Sign in to start your own English corner.');}
  }
  function wirePlayerProfile() {
    const form = $('player-profile-form');
    const postForm = $('player-post-form');
    if (!form || form.dataset.wired === '1') return;
    form.dataset.wired = '1';
    setPlayerProfileAccess();
    form.querySelectorAll('input,textarea').forEach(el=>{if(el.type!=='file'&&el.type!=='range')el.addEventListener('focus',()=>{profileSnapshot=profileSnapshotNow();});});
    $('player-display-name')?.addEventListener('input',scheduleProfileAutoSave);$('player-bio')?.addEventListener('input',scheduleProfileAutoSave);
    document.querySelectorAll('[name="profile-visibility"]').forEach(el=>el.addEventListener('change',()=>{selectedVisibility=el.value;scheduleProfileAutoSave();}));
    $('player-profile-undo')?.addEventListener('click',()=>{if(profileSnapshot)applyProfileSnapshot(profileSnapshot);profileStatus('Last saved state restored.','info');scheduleProfileAutoSave();});
    document.querySelectorAll('[data-avatar]').forEach(button=>button.addEventListener('click',()=>{profileSnapshot=profileSnapshotNow();selectedAvatar=button.dataset.avatar;uploadedAvatarUrl='';guestAvatarObjectUrl='';renderPlayerAvatar();scheduleProfileAutoSave();}));
    $('avatar-color')?.addEventListener('input',event=>{selectedAvatarColor=event.target.value;renderPlayerAvatar();scheduleProfileAutoSave();});
    $('avatar-color-2')?.addEventListener('input',event=>{selectedAvatarColor2=event.target.value;renderPlayerAvatar();scheduleProfileAutoSave();});
    $('profile-accent-color')?.addEventListener('input',event=>{selectedProfileAccent=event.target.value;renderPlayerAvatar();scheduleProfileAutoSave();});
    let avatarCategory='all';
    function filterAvatars(){const q=($('avatar-search')?.value||'').trim().toLowerCase();document.querySelectorAll('[data-avatar]').forEach(button=>{const text=(button.dataset.avatar+' '+button.dataset.category+' '+button.getAttribute('aria-label')).toLowerCase();button.hidden=(avatarCategory!=='all'&&button.dataset.category!==avatarCategory)||!!q&&!text.includes(q);});}
    $('avatar-search')?.addEventListener('input',filterAvatars);
    document.querySelectorAll('[data-avatar-filter]').forEach(button=>button.addEventListener('click',()=>{avatarCategory=button.dataset.avatarFilter;document.querySelectorAll('[data-avatar-filter]').forEach(item=>{const active=item===button;item.classList.toggle('is-selected',active);item.setAttribute('aria-pressed',String(active));});filterAvatars();}));
    $('player-avatar-upload')?.addEventListener('change',async event=>{const file=event.target.files&&event.target.files[0];if(!file)return;if(!/^image\/(png|jpeg|webp)$/.test(file.type)||file.size>12*1024*1024){profileStatus('Choose a PNG, JPG or WebP image smaller than 12 MB.','error');event.target.value='';return;}if(!currentUser){try{uploadedAvatarUrl=await optimizeGuestImage(file,256,256);guestAvatarObjectUrl='';renderPlayerAvatar();scheduleProfileAutoSave();profileStatus('Picture optimized and saved on this device. Sign in to keep it across devices.','info');}catch(error){profileStatus('Could not process this picture. Try a PNG, JPG or WebP under 12 MB.','error');}finally{event.target.value='';}return;}openAvatarCrop(file);});
    $('avatar-crop-zoom')?.addEventListener('input',event=>{cropScale=Number(event.target.value)||1;drawAvatarCrop();});
    const cropCanvas=$('avatar-crop-canvas');
    cropCanvas?.addEventListener('pointerdown',event=>{cropDragging=true;cropLastPointer={x:event.clientX,y:event.clientY};cropCanvas.setPointerCapture(event.pointerId);});
    cropCanvas?.addEventListener('pointermove',event=>{if(!cropDragging||!cropLastPointer)return;const rect=cropCanvas.getBoundingClientRect();cropOffsetX+=(event.clientX-cropLastPointer.x)*256/rect.width;cropOffsetY+=(event.clientY-cropLastPointer.y)*256/rect.height;cropLastPointer={x:event.clientX,y:event.clientY};drawAvatarCrop();});
    ['pointerup','pointercancel','lostpointercapture'].forEach(type=>cropCanvas?.addEventListener(type,()=>{cropDragging=false;cropLastPointer=null;}));
    $('avatar-crop-cancel')?.addEventListener('click',closeAvatarCrop);$('avatar-crop-save')?.addEventListener('click',saveCroppedAvatar);
    $('player-avatar-remove')?.addEventListener('click',async()=>{uploadedAvatarUrl='';guestAvatarObjectUrl='';renderPlayerAvatar();scheduleProfileAutoSave();});
    $('player-banner-upload')?.addEventListener('change',async event=>{const file=event.target.files&&event.target.files[0];if(!file)return;if(!/^image\/(png|jpeg|webp)$/.test(file.type)||file.size>12*1024*1024){profileStatus('Choose a PNG, JPG or WebP cover image smaller than 12 MB.','error');event.target.value='';return;}if(!currentUser){try{uploadedBannerUrl=await optimizeGuestImage(file,1200,360);renderPlayerAvatar();scheduleProfileAutoSave();profileStatus('Cover optimized and saved on this device. Sign in to keep it across devices.','info');}catch(error){profileStatus('Could not process this cover. Try a PNG, JPG or WebP under 12 MB.','error');}finally{event.target.value='';}return;}uploadProfileBanner(file);});
    $('player-banner-remove')?.addEventListener('click',async()=>{uploadedBannerUrl='';renderPlayerAvatar();scheduleProfileAutoSave();});
    document.querySelectorAll('[data-banner-style]').forEach(button=>button.addEventListener('click',()=>{profileSnapshot=profileSnapshotNow();selectedBannerStyle=button.dataset.bannerStyle;uploadedBannerUrl='';renderPlayerAvatar();scheduleProfileAutoSave();}));
    document.querySelectorAll('[data-avatar-frame]').forEach(button=>button.addEventListener('click',()=>{if(button.disabled)return;profileSnapshot=profileSnapshotNow();selectedAvatarFrame=button.dataset.avatarFrame;renderPlayerAvatar();scheduleProfileAutoSave();}));
    form.addEventListener('submit', async event => { event.preventDefault(); await persistPlayerProfile(); });
    $('avatar-crop-modal')?.addEventListener('click',event=>{if(event.target.id==='avatar-crop-modal')closeAvatarCrop();});
    document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!$('avatar-crop-modal')?.hidden)closeAvatarCrop();});
    updateFrameAvailability();window.addEventListener('epiphany:achievements-updated',updateFrameAvailability);
    $('player-profile-form')?.addEventListener('input',()=>{if(!profileIsLoading)scheduleProfileAutoSave();});
    $('player-profile-form')?.addEventListener('change',()=>{if(!profileIsLoading)scheduleProfileAutoSave();});
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
  const DEVELOPER_EMAILS = new Set([
    'abdulrahimaouadi@gmail.com',
    'crboy952@gmail.com',
    'girl32761@gmail.com'
  ]);
  const isDeveloperAccount = () => !!(currentUser && currentUser.email && DEVELOPER_EMAILS.has(String(currentUser.email).trim().toLowerCase()));
  function announceAuthAccess() {
    document.dispatchEvent(new CustomEvent('epiphany-auth-changed', { detail: { isDeveloper: isDeveloperAccount(), email: isDeveloperAccount() ? String(currentUser.email).trim().toLowerCase() : '' } }));
  }

  async function saveStoryToCloud(story, visibility = 'private') {
    if (!client || !currentUser) throw new Error('Sign in to save stories to your account.');
    const payload = {user_id:currentUser.id,title:String(story.title||'My story').slice(0,100),genre:String(story.genre||'adventure').slice(0,40),level:['A1','A2','B1','B2','C1','C2'].includes(story.level)?story.level:'A1',pages:Array.isArray(story.pages)?story.pages.map(page=>String(page).slice(0,1800)).slice(0,8):[],word_count:Math.min(10000,Math.max(0,Number(story.wordCount)||0)),problem:String(story.problem||'').slice(0,300),visibility:visibility==='public'?'public':'private',reply_to:story.replyTo||null,updated_at:new Date().toISOString()};
    let query=story.cloudId?client.from('player_stories').update(payload).eq('id',story.cloudId).eq('user_id',currentUser.id).select('id').single():client.from('player_stories').insert(payload).select('id').single();
    const {data,error}=await query;if(error)throw error;return data.id;
  }
  async function listMyCloudStories() {
    if(!client||!currentUser)throw new Error('Sign in to view your account stories.');
    const {data,error}=await client.from('player_stories').select('id,title,genre,level,pages,word_count,problem,visibility,reply_to,created_at,updated_at').eq('user_id',currentUser.id).order('updated_at',{ascending:false}).limit(30);
    if(error)throw error;return data||[];
  }
  async function listPublicCloudStories() {
    if(!client||!currentUser)throw new Error('Sign in to explore community stories.');
    const {data,error}=await client.from('player_stories').select('id,title,genre,level,pages,word_count,problem,reply_to,created_at').eq('visibility','public').order('created_at',{ascending:false}).limit(20);
    if(error)throw error;return data||[];
  }

  // Character-art migration is resumable and keeps a durable report in this browser.
  const CHARACTER_ART_REPORT_KEY = 'epiphany-character-art-migration-report-v2';
  function characterArtStorageFilename(path) {
    const filename = String(path || '').split('/').pop();
    return filename.replace(/[^A-Za-z0-9._-]/g, ch => '-u' + ch.codePointAt(0).toString(16) + '-')
      .replace(/-+/g, '-').replace(/^-|-$/g, '');
  }
  function getCharacterArtAssets() {
    const cards = Array.isArray(window.EPIPHANY_CARD_DATA) ? window.EPIPHANY_CARD_DATA : [];
    const assets = new Map();
    for (const card of cards) {
      if (card && card.image) { const source=String(card.image); assets.set('originals/'+characterArtStorageFilename(source),{source,kind:'Original'}); }
      if (card && card.thumb) { const source=String(card.thumb); assets.set('thumbs/'+characterArtStorageFilename(source),{source,kind:'Thumbnail'}); }
    }
    return [...assets.entries()].map(([target,meta])=>({target,...meta}));
  }
  function readCharacterArtReport() {
    try { const value=JSON.parse(localStorage.getItem(CHARACTER_ART_REPORT_KEY)||'null'); return value&&Array.isArray(value.assets)?value:null; } catch { return null; }
  }
  function saveCharacterArtReport(report) {
    report.updatedAt=new Date().toISOString();
    try { localStorage.setItem(CHARACTER_ART_REPORT_KEY,JSON.stringify(report)); } catch (error) { console.warn('[EPIPHANY] Could not persist artwork report',error); }
    renderCharacterArtReport(report);
  }
  function renderCharacterArtReport(report=readCharacterArtReport()) {
    const host=$('developer-art-report'); if(!host)return;
    if(!report){host.innerHTML='<p class="developer-art-empty">No migration report yet. Run a scan to inspect the cloud bucket.</p>';return;}
    const counts=report.assets.reduce((a,x)=>{a[x.status]=(a[x.status]||0)+1;return a;},{});
    const total=report.assets.length,loadOk=counts.load_ok||0,loadFailed=counts.load_failed||0,verified=report.assets.filter(x=>x.bucketStatus==='verified'||x.status==='verified'||x.status==='load_ok'||x.status==='load_failed').length,failed=counts.failed||0,missing=counts.missing||0; const cloudErrors=readCharacterArtCloudErrors();
    const pct=total?Math.round(verified/total*100):0;
    const rows=report.assets.filter(x=>['missing','failed','load_failed'].includes(x.status)).slice(0,80).map(x=>'<tr><td>'+String(x.kind).replace(/[&<>"]/g,'')+'</td><td>'+String(x.source).replace(/[&<>"]/g,'')+'</td><td><code>'+String(x.target).replace(/[&<>"]/g,'')+'</code></td><td>'+String(x.status).replace(/[&<>"]/g,'')+'</td><td>'+String(x.message||'—').replace(/[&<>"]/g,'')+'</td></tr>').join('');
    host.innerHTML='<div class="developer-art-summary"><div><b>'+verified+' / '+total+'</b><small>Found in bucket</small></div><div><b>'+loadOk+' / '+total+'</b><small>Loaded over HTTP</small></div><div><b>'+loadFailed+'</b><small>Load failures</small></div><div><b>'+cloudErrors.count+'</b><small>Cloud image errors</small></div></div><div class="developer-art-meta">Missing: '+missing+' · Failed checks: '+failed+' · Bucket coverage: '+pct+'%</div><div class="developer-art-progress"><span style="width:'+pct+'%"></span></div><p class="developer-art-meta">Last checked: '+new Date(report.updatedAt||Date.now()).toLocaleString()+' · '+(report.bucket||'character-art')+' · '+(report.mode||'scan')+'</p>'+(report.note?'<p class="developer-art-note">'+String(report.note).replace(/[&<>"]/g,'')+'</p>':'')+(rows?'<details open><summary>Items needing attention ('+(missing+failed+loadFailed)+')</summary><div class="developer-art-table-wrap"><table class="developer-art-table"><thead><tr><th>Type</th><th>Object filename</th><th>Cloud key</th><th>Status</th><th>Details</th></tr></thead><tbody>'+rows+'</tbody></table></div></details>':'<p class="developer-art-success">'+(report.mode==='HTTP image-load verification'?'All tested cloud images loaded successfully.':'All expected artwork objects are present in cloud storage.')+'</p>');
  }
  async function listCharacterArtFolder(folder) {
    const found=new Set(); let offset=0;
    while(true){
      const {data,error}=await client.storage.from('character-art').list(folder,{limit:1000,offset,sortBy:{column:'name',order:'asc'}});
      if(error)throw error;
      const items=data||[]; items.forEach(item=>{if(item&&item.name)found.add(folder+'/'+item.name);});
      if(items.length<1000)break; offset+=items.length;
    }
    return found;
  }
  const CHARACTER_ART_CLOUD_ERRORS_KEY = 'epiphany-character-art-cloud-errors-v1';
  function readCharacterArtCloudErrors() {
    try {
      const value=JSON.parse(localStorage.getItem(CHARACTER_ART_CLOUD_ERRORS_KEY)||'null');
      return value&&typeof value==='object'?{count:Number(value.count)||0,lastAt:value.lastAt||'',recent:Array.isArray(value.recent)?value.recent:[]}:{count:0,recent:[]};
    } catch { return {count:0,recent:[]}; }
  }
  async function verifyCharacterArtHttpAssets(onProgress=()=>{}) {
    if(!client||!currentUser||!isDeveloperAccount()) throw new Error('Sign in with an approved developer account first.');
    const base=window.EPIPHANY_SUPABASE_CONFIG?.url;
    if(!base) throw new Error('Supabase project URL is not configured.');
    const report=readCharacterArtReport()||{version:2,bucket:'character-art',assets:getCharacterArtAssets().map(x=>({...x,status:'unchecked',message:''}))};
    const storageBase=base.endsWith('/')?base.slice(0,-1):base;
    const queue=report.assets.slice(); let completed=0, ok=0, failed=0;
    const worker=async()=>{while(queue.length){
      const asset=queue.shift(); const file=asset.target.split('/').map(encodeURIComponent).join('/');
      const url=storageBase+'/storage/v1/object/public/character-art/'+file;
      try{
        const response=await fetch(url,{method:'GET',headers:{Range:'bytes=0-31'},cache:'no-store'});
        const type=String(response.headers.get('content-type')||'').toLowerCase();
        if(!response.ok) throw new Error('HTTP '+response.status);
        if(!type.startsWith('image/')) throw new Error('Unexpected content type: '+(type||'unknown'));
        asset.bucketStatus=asset.bucketStatus||((asset.status==='verified'||asset.status==='uploaded')?'verified':'unknown'); asset.status='load_ok'; asset.message='HTTP '+response.status+' · '+type; asset.checkedAt=new Date().toISOString(); ok++;
      }catch(error){asset.bucketStatus=asset.bucketStatus||((asset.status==='verified'||asset.status==='uploaded')?'verified':'unknown');asset.status='load_failed';asset.message=error?.message||String(error);asset.checkedAt=new Date().toISOString();failed++;}
      completed++; saveCharacterArtReport(report); onProgress({completed,total:report.assets.length,ok,failed,current:asset.source});
    }};
    await Promise.all(Array.from({length:6},worker));
    report.mode='HTTP image-load verification';
    report.note=failed===0?'Every expected cloud image responded successfully with an image content type.':'Some cloud image URLs did not load correctly; inspect the failed rows below.';
    saveCharacterArtReport(report);
    return {total:report.assets.length,ok,failed};
  }
  async function inspectCharacterArtAssets() {
    if(!client||!currentUser||!isDeveloperAccount())throw new Error('Sign in with an approved developer account first.');
    const assets=getCharacterArtAssets();
    const [originals,thumbs]=await Promise.all([listCharacterArtFolder('originals'),listCharacterArtFolder('thumbs')]);
    const report={version:2,bucket:'character-art',mode:'verification',updatedAt:new Date().toISOString(),assets:assets.map(asset=>({...asset,status:(asset.target.startsWith('originals/')?originals:thumbs).has(asset.target)?'verified':'missing',message:''}))};
    saveCharacterArtReport(report); return report;
  }


  window.EpiphanyAuth = {
    isDeveloper: isDeveloperAccount,
    inspectCharacterArtAssets,
    getCharacterArtReport: readCharacterArtReport,
    getDeveloperEmail: () => isDeveloperAccount() ? String(currentUser.email).trim().toLowerCase() : '',
    getAssetManagerClient: () => isDeveloperAccount() ? client : null,
    async loadCardImageViews() {
      if (!client) return [];
      const {data,error}=await client.from('epiphany_card_image_views').select('character_id,position_x,position_y,zoom,fit');
      if(error)throw error;
      return Array.isArray(data)?data:[];
    },
    getAssetManagerUser: () => isDeveloperAccount() && currentUser ? {id:currentUser.id} : null,
    async loadPublishedCharacterAssets() {
      if (!client) return [];
      const {data,error} = await client.from('epiphany_asset_usages')
        .select('owner_id,published_bucket,published_original_path,published_thumbnail_path')
        .eq('owner_type','character').eq('role','portrait').eq('is_published',true);
      if (error) throw error;
      return data || [];
    },
    saveStory: saveStoryToCloud,
    listMyStories: listMyCloudStories,
    listPublicStories: listPublicCloudStories,
    openAccountMode: openAccountFromWelcome,
    isWelcomeOpen: () => !!($('account-welcome-modal') && !$('account-welcome-modal').hidden),
    isSignedIn: () => !!currentUser,
    whenReady: () => authReadyPromise,
    queueSave(progress) {
      if (!client || !currentUser) return;
      clearTimeout(saveTimer);
      const snapshot = JSON.parse(JSON.stringify(progress));
      pendingCloudProgress = snapshot;
      saveTimer = setTimeout(() => flushSave(snapshot), 900);
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    renderCharacterArtReport();
    const httpButton=$('developer-test-character-art-http');
    httpButton?.addEventListener('click',async()=>{httpButton.disabled=true;const status=$('developer-art-status');if(status)status.textContent='Testing cloud image URLs (up to 6 at a time)…';try{const result=await verifyCharacterArtHttpAssets(progress=>{if(status)status.textContent='HTTP test '+progress.completed+'/'+progress.total+' · '+progress.ok+' loaded · '+progress.failed+' failed';});if(status)status.textContent='Image loading test: '+result.ok+'/'+result.total+' loaded · '+result.failed+' failed.';}catch(error){if(status)status.textContent='Image test failed: '+(error?.message||String(error));}finally{httpButton.disabled=false;}});
    const verifyButton=$('developer-verify-character-art');
    verifyButton?.addEventListener('click',async()=>{verifyButton.disabled=true;const status=$('developer-art-status');if(status)status.textContent='Checking bucket contents…';try{const report=await inspectCharacterArtAssets();const ok=report.assets.filter(x=>x.status==='verified').length;if(status)status.textContent='Verification complete: '+ok+'/'+report.assets.length+' objects found.';}catch(error){if(status)status.textContent='Verification failed: '+(error?.message||String(error));}finally{verifyButton.disabled=false;}});
    const form = $('account-form');
    if (!form) { markAuthReady(); return; }
    setMode('signin');
    wirePlayerProfile();
    if (!config || !config.url || !config.publishableKey || !sdk || !sdk.createClient) {
      status('Account service is not configured yet. You can still play and save on this device.', 'error');
      markAuthReady();
      return;
    }
    client = sdk.createClient(config.url, config.publishableKey);
    // The card gallery may initialize before this DOMContentLoaded callback creates the client.
    window.dispatchEvent(new CustomEvent('epiphany:supabase-ready'));
    form.addEventListener('submit', async event => {
      event.preventDefault();
      const email = $('account-email-input').value.trim();
      const password = $('account-password').value;
      const submit = $('account-submit');
      submit.disabled = true;
      try {
        if (currentMode === 'signup') {
          const {data, error} = await client.auth.signUp({email, password, options:{emailRedirectTo:callbackUrl()}});
          if (error) throw error;
          if (data.session) {
            status('Account created. Preparing your saved progress…', 'success');
          } else {
            pendingVerificationEmail = email;
            setMode('verify');
            status('We sent a 6-digit verification code to your email. Enter it here to activate your account.', 'success');
          }
        } else if (currentMode === 'verify') {
          const token = $('account-otp-input').value.trim();
          const verifyEmail = pendingVerificationEmail || email;
          const {error} = await client.auth.verifyOtp({email:verifyEmail, token, type:'signup'});
          if (error) throw error;
          pendingVerificationEmail = '';
          status('Email verified. Preparing your saved progress…', 'success');
        } else if (currentMode === 'signin') {
          const {error} = await client.auth.signInWithPassword({email, password});
          if (error) throw error;
          status('Signed in. Loading your progress…', 'loading');
        } else if (currentMode === 'reset') {
          const {error} = await client.auth.resetPasswordForEmail(email, {
            redirectTo: callbackUrl()
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
    $('account-otp-input')?.addEventListener('input', event => {
      event.target.value = event.target.value.replace(/\D/g, '').slice(0, 6);
    });
    $('account-resend-code')?.addEventListener('click', async () => {
      if (!client || currentMode !== 'verify') return;
      const button = $('account-resend-code');
      button.disabled = true;
      try {
        const email = pendingVerificationEmail || $('account-email-input').value.trim();
        const {error} = await client.auth.resend({type:'signup', email});
        if (error) throw error;
        status('A new verification code has been sent. Check your inbox and spam folder.', 'success');
        if (resendCooldownTimer) clearTimeout(resendCooldownTimer);
        button.textContent = 'Resend available in 60 seconds';
        resendCooldownTimer = setTimeout(() => { button.disabled = false; button.textContent = 'Resend code'; }, 60000);
      } catch (error) {
        status(error && error.message ? error.message : 'Could not resend the code. Please wait a moment and try again.', 'error');
        button.disabled = false;
      }
    });
    $('account-edit-email')?.addEventListener('click', () => {
      pendingVerificationEmail = '';
      setMode('signup');
      status('Check the email address, then create your account again.', 'info');
      $('account-email-input')?.focus({preventScroll:true});
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
      const nextUser = session && session.user ? session.user : null;
      if (currentUser?.id !== nextUser?.id) {
        // Never carry a queued snapshot from one account into another account's cloud record.
        clearTimeout(saveTimer);
        saveTimer = null;
        pendingCloudProgress = null;
      }
      currentUser = nextUser;
      markAuthReady();
      announceAuthAccess();
      if (event === 'PASSWORD_RECOVERY') recoveryMode = true;
      if (!currentUser) {
        announceAuthAccess();
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
      if (lastSyncedUser !== currentUser.id && event !== 'PASSWORD_RECOVERY') {
        lastSyncedUser = currentUser.id;
        setTimeout(() => syncUserProgress(currentUser), 0);
      }
    });
    client.auth.getSession().then(({data, error}) => {
      if (error) throw error;
      if (data && data.session && data.session.user) {
        currentUser = data.session.user;
        announceAuthAccess();
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
      markAuthReady();
    }).catch(error => {
      markAuthReady();
      console.error('Epiphany session check failed:', error);
      status('Could not check your account session. You can still play offline.', 'error');
    });
  });
})();
