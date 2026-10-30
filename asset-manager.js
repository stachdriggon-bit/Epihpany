/* EPIPHANY Asset Manager — private-first asset library. */
(() => {
  'use strict';

  const PRIVATE_BUCKET = 'epiphany-assets-private';
  const MAX_BYTES = 12 * 1024 * 1024;
  const MIME_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);
  const CATEGORIES = ['characters', 'stories', 'world', 'cards', 'interface', 'other'];
  const $ = (id) => document.getElementById(id);
  const root = () => $('asset-manager');
  let activeTab = 'library';
  let assets = [];
  let files = [];
  let usages = [];
  let previewUrl = '';
  let busy = false;

  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, ch => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
  }[ch]));
  const safeName = (value) => String(value || 'image')
    .normalize('NFKD')
    .replace(/[^A-Za-z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 120) || 'image';
  const client = () => window.EpiphanyAuth?.getAssetManagerClient?.() || null;
  const developer = () => !!window.EpiphanyAuth?.isDeveloper?.();
  const user = () => window.EpiphanyAuth?.getAssetManagerUser?.() || null;

  function setStatus(message, kind = 'info') {
    const node = $('asset-manager-status');
    if (!node) return;
    node.textContent = message;
    node.dataset.state = kind;
  }

  function setBusy(value) {
    busy = !!value;
    const submit = $('asset-upload-submit');
    if (submit) {
      submit.disabled = busy;
      submit.textContent = busy ? 'Uploading…' : 'Upload asset';
    }
    root()?.classList.toggle('is-busy', busy);
  }

  function showTab(tab) {
    activeTab = ['library','linked','issues','unassigned','upload'].includes(tab) ? tab : 'library';
    root()?.querySelectorAll('[data-asset-tab]').forEach(button => {
      const active = button.dataset.assetTab === activeTab;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    const upload = $('asset-upload-panel');
    const listing = $('asset-library-panel');
    if (upload) upload.hidden = activeTab !== 'upload';
    if (listing) listing.hidden = activeTab === 'upload';
    renderAssets();
  }

  function visibleAssets() {
    const query = String($('asset-search')?.value || '').trim().toLowerCase();
    const category = $('asset-category-filter')?.value || 'all';
    return assets.filter(asset => {
      const linked = usages.some(usage => usage.asset_id === asset.id);
      if (activeTab === 'linked' && !linked) return false;
      if (activeTab === 'issues' && asset.status !== 'issue') return false;
      if (activeTab === 'unassigned' && linked) return false;
      if (category !== 'all' && asset.category !== category) return false;
      if (query && ![asset.original_name, asset.id, asset.category, asset.status].some(value => String(value || '').toLowerCase().includes(query))) return false;
      return true;
    });
  }

  async function previewFor(asset) {
    const candidates = files.filter(file => file.asset_id === asset.id)
      .sort((a,b) => (a.variant === 'thumbnail' ? -1 : 0) - (b.variant === 'thumbnail' ? -1 : 0));
    const file = candidates[0];
    if (!file) return '';
    const storage = client()?.storage?.from(file.bucket_id);
    if (!storage) return '';
    if (file.visibility === 'public') {
      return storage.getPublicUrl(file.object_path).data?.publicUrl || '';
    }
    const { data, error } = await storage.createSignedUrl(file.object_path, 180);
    return error ? '' : (data?.signedUrl || '');
  }

  async function renderAssets() {
    const host = $('asset-library-grid');
    const count = $('asset-library-count');
    if (!host) return;
    const list = visibleAssets();
    if (count) count.textContent = list.length + (list.length === 1 ? ' asset' : ' assets');
    if (!list.length) {
      host.innerHTML = '<div class="asset-empty"><span aria-hidden="true">✦</span><b>No assets here yet</b><p>Upload an image to start building the library. New files remain private until they are deliberately published.</p><button type="button" class="btn btn-primary" data-asset-tab="upload">Upload an asset</button></div>';
      return;
    }
    host.innerHTML = '<div class="asset-loading">Preparing previews…</div>';
    const cards = await Promise.all(list.map(async asset => {
      const url = await previewFor(asset);
      const linked = usages.filter(usage => usage.asset_id === asset.id);
      const size = (Number(asset.size_bytes) / 1024 / 1024).toFixed(2) + ' MB';
      return '<article class="asset-card" data-asset-id="' + escapeHtml(asset.id) + '">' +
        (url ? '<img class="asset-card-preview" src="' + escapeHtml(url) + '" alt="" loading="lazy">' : '<div class="asset-card-placeholder"><span>▧</span></div>') +
        '<div class="asset-card-body"><div class="asset-card-top"><b>' + escapeHtml(asset.original_name) + '</b><span class="asset-status asset-status-' + escapeHtml(asset.status) + '">' + escapeHtml(asset.status) + '</span></div>' +
        '<p>' + escapeHtml(asset.category) + ' · ' + escapeHtml(size) + '</p>' +
        '<small>' + escapeHtml(asset.width || '—') + ' × ' + escapeHtml(asset.height || '—') + ' · ' + linked.length + (linked.length === 1 ? ' reference' : ' references') + '</small>' +
        '<code>' + escapeHtml(asset.id.slice(0, 8)) + '</code></div></article>';
    }));
    host.innerHTML = cards.join('');
  }

  async function loadAssets() {
    const api = client();
    if (!developer() || !api) {
      assets = []; files = []; usages = [];
      const host = $('asset-library-grid');
      if (host) host.innerHTML = '<div class="asset-empty"><b>Developer access required</b><p>Sign in with an approved EPIPHANY developer account to manage assets.</p></div>';
      return;
    }
    setStatus('Loading asset library…');
    const [assetResult, fileResult, usageResult] = await Promise.all([
      api.from('epiphany_assets').select('*').order('created_at', {ascending:false}).limit(500),
      api.from('epiphany_asset_files').select('*').order('created_at', {ascending:false}).limit(1500),
      api.from('epiphany_asset_usages').select('*').limit(1500)
    ]);
    const failure = assetResult.error || fileResult.error || usageResult.error;
    if (failure) {
      setStatus('Could not load the asset library: ' + failure.message, 'error');
      return;
    }
    assets = assetResult.data || [];
    files = fileResult.data || [];
    usages = usageResult.data || [];
    setStatus('Library ready · ' + assets.length + ' registered assets.', 'success');
    renderAssets();
  }

  function dimensions(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const image = new Image();
      image.onload = () => {
        const result = { width: image.naturalWidth, height: image.naturalHeight };
        URL.revokeObjectURL(url);
        resolve(result);
      };
      image.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('The selected file is not a readable image.'));
      };
      image.src = url;
    });
  }

  function previewSelectedFile(file) {
    const host = $('asset-upload-preview');
    if (!host) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrl = '';
    if (!file) {
      host.hidden = true;
      host.replaceChildren();
      return;
    }
    previewUrl = URL.createObjectURL(file);
    host.hidden = false;
    host.innerHTML = '<img src="' + escapeHtml(previewUrl) + '" alt="Selected image preview"><div><b>' + escapeHtml(file.name) + '</b><small>' + (file.size / 1024 / 1024).toFixed(2) + ' MB · ' + escapeHtml(file.type || 'Unknown type') + '</small></div>';
  }

  async function uploadAsset(event) {
    event.preventDefault();
    if (busy) return;
    const api = client();
    const activeUser = user();
    if (!developer() || !api || !activeUser?.id) {
      setStatus('Sign in with an approved developer account before uploading.', 'error');
      return;
    }
    const file = $('asset-upload-file')?.files?.[0];
    if (!file) {
      setStatus('Choose an image first.', 'error');
      return;
    }
    if (!MIME_TYPES.has(file.type)) {
      setStatus('Only PNG, JPG and WEBP images are accepted.', 'error');
      return;
    }
    if (file.size <= 0 || file.size > MAX_BYTES) {
      setStatus('The image must be smaller than 12 MB.', 'error');
      return;
    }
    const ownerType = $('asset-owner-type')?.value || '';
    const ownerId = String($('asset-owner-id')?.value || '').trim();
    const role = String($('asset-owner-role')?.value || '').trim();
    const hasAnyLinkField = !!(ownerType || ownerId || role);
    if (hasAnyLinkField && !(ownerType && ownerId && role)) {
      setStatus('To link this asset, complete the item type, item ID and usage role. Otherwise leave all three empty.', 'error');
      return;
    }

    setBusy(true);
    let assetId = '';
    let objectPath = '';
    let uploaded = false;
    try {
      const size = await dimensions(file);
      assetId = crypto.randomUUID();
      const category = $('asset-upload-category')?.value || 'other';
      const fileName = safeName(file.name);
      objectPath = (hasAnyLinkField ? 'linked/' : 'unassigned/') + assetId + '/' + fileName;

      const { data: created, error: createError } = await api.from('epiphany_assets').insert({
        id: assetId,
        asset_type: 'image',
        category,
        original_name: file.name.slice(0, 255),
        mime_type: file.type,
        size_bytes: file.size,
        width: size.width,
        height: size.height,
        status: hasAnyLinkField ? 'linked' : 'unassigned',
        created_by: activeUser.id
      }).select('id').single();
      if (createError) throw createError;

      const { error: uploadError } = await api.storage.from(PRIVATE_BUCKET).upload(objectPath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      });
      if (uploadError) throw uploadError;
      uploaded = true;

      const { error: fileError } = await api.from('epiphany_asset_files').insert({
        asset_id: created.id,
        variant: 'original',
        bucket_id: PRIVATE_BUCKET,
        object_path: objectPath,
        visibility: 'private',
        mime_type: file.type,
        size_bytes: file.size,
        width: size.width,
        height: size.height
      });
      if (fileError) throw fileError;

      if (hasAnyLinkField) {
        const { error: usageError } = await api.from('epiphany_asset_usages').insert({
          asset_id: created.id,
          owner_type: ownerType,
          owner_id: ownerId,
          role,
          is_published: false,
          created_by: activeUser.id
        });
        if (usageError) throw usageError;
      }

      $('asset-upload-form')?.reset();
      previewSelectedFile(null);
      setStatus('Uploaded successfully. The original is stored privately and is not visible in the game.', 'success');
      showTab(hasAnyLinkField ? 'linked' : 'unassigned');
      await loadAssets();
    } catch (error) {
      let cleanupMessage = '';
      if (assetId) {
        if (uploaded && objectPath) {
          const { error: removeError } = await api.storage.from(PRIVATE_BUCKET).remove([objectPath]);
          if (removeError) cleanupMessage = ' The uploaded file could not be cleaned up automatically; it needs review.';
        }
        await api.from('epiphany_asset_usages').delete().eq('asset_id', assetId);
        await api.from('epiphany_asset_files').delete().eq('asset_id', assetId);
        const { error: deleteError } = await api.from('epiphany_assets').delete().eq('id', assetId);
        if (deleteError) cleanupMessage += ' The incomplete asset record needs review.';
      }
      setStatus((error?.message || 'Upload failed.') + cleanupMessage, 'error');
      await loadAssets();
    } finally {
      setBusy(false);
    }
  }

  function init() {
    if (!root()) return;
    root().addEventListener('click', event => {
      const tab = event.target.closest('[data-asset-tab]');
      if (tab) {
        event.preventDefault();
        showTab(tab.dataset.assetTab);
      }
    });
    $('asset-search')?.addEventListener('input', renderAssets);
    $('asset-category-filter')?.addEventListener('change', renderAssets);
    $('asset-upload-file')?.addEventListener('change', event => previewSelectedFile(event.target.files?.[0] || null));
    $('asset-upload-form')?.addEventListener('submit', uploadAsset);
    document.addEventListener('epiphany-auth-changed', () => loadAssets().catch(error => setStatus(error.message, 'error')));
    showTab('library');
    if (developer()) loadAssets().catch(error => setStatus(error.message, 'error'));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
})();