/* EPIPHANY Asset Manager — private-first asset library. */
(() => {
  'use strict';

  const PRIVATE_BUCKET = 'epiphany-assets-private';
  const MAX_BYTES = 12 * 1024 * 1024;
  const MIME_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);
  const THUMBNAIL_PROFILES = {
    characters:{maxWidth:560,maxHeight:560,quality:0.84},
    stories:{maxWidth:1280,maxHeight:720,quality:0.84},
    world:{maxWidth:1280,maxHeight:960,quality:0.84},
    cards:{maxWidth:640,maxHeight:900,quality:0.84},
    interface:{maxWidth:1440,maxHeight:1440,quality:0.86},
    other:{maxWidth:640,maxHeight:640,quality:0.82}
  };
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
      let url = '';
      try { url = await previewFor(asset); } catch {}
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
      api.from('epiphany_asset_usages').select('asset_id,owner_type,owner_id,role,is_published,published_bucket,published_original_path,published_thumbnail_path').limit(1500)
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
    await renderAssets();
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

  async function createThumbnail(file, category) {
    const profile = THUMBNAIL_PROFILES[category] || THUMBNAIL_PROFILES.other;
    const bitmap = await createImageBitmap(file);
    try {
      const scale = Math.min(1, profile.maxWidth / bitmap.width, profile.maxHeight / bitmap.height);
      const width = Math.max(1, Math.round(bitmap.width * scale));
      const height = Math.max(1, Math.round(bitmap.height * scale));
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d', {alpha:false});
      if (!context) throw new Error('Could not prepare the image thumbnail.');
      context.drawImage(bitmap, 0, 0, width, height);
      const blob = await new Promise((resolve, reject) => {
        canvas.toBlob(result => result ? resolve(result) : reject(new Error('Thumbnail generation failed.')), 'image/webp', profile.quality);
      });
      const mimeType = blob.type === 'image/webp' ? 'image/webp' : 'image/png';
      return {blob, width, height, mimeType, extension:mimeType === 'image/webp' ? 'webp' : 'png'};
    } finally {
      bitmap.close?.();
    }
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
    let thumbnailPath = '';
    const uploadedPaths = [];
    try {
      const size = await dimensions(file);
      assetId = crypto.randomUUID();
      const category = $('asset-upload-category')?.value || 'other';
      const thumbnail = await createThumbnail(file, category);
      const fileName = safeName(file.name);
      const folder = (hasAnyLinkField ? 'linked/' : 'unassigned/') + assetId + '/';
      objectPath = folder + fileName;
      thumbnailPath = folder + 'thumbnail.' + thumbnail.extension;

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
      uploadedPaths.push(objectPath);

      const { error: thumbnailUploadError } = await api.storage.from(PRIVATE_BUCKET).upload(thumbnailPath, thumbnail.blob, {
        cacheControl: '3600',
        upsert: false,
        contentType: thumbnail.mimeType
      });
      if (thumbnailUploadError) throw thumbnailUploadError;
      uploadedPaths.push(thumbnailPath);

      const { error: fileError } = await api.from('epiphany_asset_files').insert([
        {
          asset_id: created.id,
          variant: 'original',
          bucket_id: PRIVATE_BUCKET,
          object_path: objectPath,
          visibility: 'private',
          mime_type: file.type,
          size_bytes: file.size,
          width: size.width,
          height: size.height
        },
        {
          asset_id: created.id,
          variant: 'thumbnail',
          bucket_id: PRIVATE_BUCKET,
          object_path: thumbnailPath,
          visibility: 'private',
          mime_type: thumbnail.mimeType,
          size_bytes: thumbnail.blob.size,
          width: thumbnail.width,
          height: thumbnail.height
        }
      ]);
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
        let safeToDeleteRecord = true;
        if (uploadedPaths.length) {
          const { error: removeError } = await api.storage.from(PRIVATE_BUCKET).remove(uploadedPaths);
          if (removeError) {
            safeToDeleteRecord = false;
            cleanupMessage = ' The uploaded file could not be cleaned up automatically; its record was retained for review.';
            await api.from('epiphany_assets').update({
              status: 'issue',
              metadata: { orphaned_private_bucket: PRIVATE_BUCKET, orphaned_private_paths: uploadedPaths, cleanup_error: removeError.message || 'Storage cleanup failed.' }
            }).eq('id', assetId);
          }
        }
        if (safeToDeleteRecord) {
          await api.from('epiphany_asset_usages').delete().eq('asset_id', assetId);
          await api.from('epiphany_asset_files').delete().eq('asset_id', assetId);
          const { error: deleteError } = await api.from('epiphany_assets').delete().eq('id', assetId);
          if (deleteError) {
            cleanupMessage += ' The incomplete asset record needs review.';
            await api.from('epiphany_assets').update({status:'issue'}).eq('id', assetId);
          }
        }
      }
      setStatus((error?.message || 'Upload failed.') + cleanupMessage, 'error');
      await loadAssets();
    } finally {
      setBusy(false);
    }
  }

  function storageFilename(value) {
    const filename = String(value || '').split('/').pop();
    return filename.replace(/[^A-Za-z0-9._-]/g, ch => '-u' + ch.codePointAt(0).toString(16) + '-')
      .replace(/-+/g, '-').replace(/^-|-$/g, '');
  }

  async function listBucketFolder(api, folder) {
    const found = [];
    let offset = 0;
    while (true) {
      const { data, error } = await api.storage.from('character-art').list(folder, {
        limit: 1000,
        offset,
        sortBy: {column:'name', order:'asc'}
      });
      if (error) throw error;
      const page = data || [];
      found.push(...page.filter(item => item && item.name));
      if (page.length < 1000) break;
      offset += page.length;
    }
    return found;
  }

  function legacyMime(item, filename) {
    const detected = String(item?.metadata?.mimetype || '').toLowerCase();
    if (MIME_TYPES.has(detected)) return detected;
    const ext = String(filename || '').split('.').pop().toLowerCase();
    return ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : ext === 'webp' ? 'image/webp' : 'image/png';
  }

  function legacySize(item) {
    const value = Number(item?.metadata?.size || item?.metadata?.contentLength || 0);
    return Number.isFinite(value) && value > 0 ? Math.min(value, MAX_BYTES) : 1;
  }

  async function importLegacyCharacterArt() {
    const api = client();
    const activeUser = user();
    const button = $('asset-import-legacy');
    if (busy) return;
    if (!developer() || !api || !activeUser?.id) {
      setStatus('Sign in with an approved developer account before indexing legacy artwork.', 'error');
      return;
    }
    const cards = Array.isArray(window.EPIPHANY_CARD_DATA) ? window.EPIPHANY_CARD_DATA.filter(card => card?.id && card?.image) : [];
    if (!cards.length) {
      setStatus('Character card data is not available yet. Reload the page and try again.', 'error');
      return;
    }

    setBusy(true);
    if (button) {
      button.disabled = true;
      button.textContent = 'Indexing…';
    }
    try {
      setStatus('Scanning existing character originals and thumbnails…');
      const [originalItems, thumbnailItems] = await Promise.all([
        listBucketFolder(api, 'originals'),
        listBucketFolder(api, 'thumbs')
      ]);
      const originalMap = new Map(originalItems.map(item => ['originals/' + item.name, item]));
      const thumbnailMap = new Map(thumbnailItems.map(item => ['thumbs/' + item.name, item]));

      const existingAssetsResult = await api.from('epiphany_assets').select('id,metadata').limit(1500);
      const existingFilesResult = await api.from('epiphany_asset_files').select('bucket_id,object_path').eq('bucket_id','character-art').limit(2000);
      const existingUsagesResult = await api.from('epiphany_asset_usages').select('owner_type,owner_id,role').eq('owner_type','character').eq('role','portrait').limit(1500);
      const queryError = existingAssetsResult.error || existingFilesResult.error || existingUsagesResult.error;
      if (queryError) throw queryError;

      const existingAssets = new Map((existingAssetsResult.data || [])
        .filter(asset => asset.metadata?.legacy_source === 'character-art' && asset.metadata?.legacy_key)
        .map(asset => [asset.metadata.legacy_key, asset.id]));
      const existingFiles = new Set((existingFilesResult.data || []).map(file => file.bucket_id + ':' + file.object_path));
      const existingUsages = new Set((existingUsagesResult.data || []).map(usage => usage.owner_type + ':' + usage.owner_id + ':' + usage.role));

      const groups = new Map();
      const expectedOriginals = new Set();
      const expectedThumbnails = new Set();
      for (const card of cards) {
        const originalPath = 'originals/' + storageFilename(card.image);
        const thumbnailPath = card.thumb ? 'thumbs/' + storageFilename(card.thumb) : '';
        expectedOriginals.add(originalPath);
        if (thumbnailPath) expectedThumbnails.add(thumbnailPath);
        if (!groups.has(originalPath)) groups.set(originalPath, {originalPath, cards:[], thumbnails:new Set()});
        const group = groups.get(originalPath);
        group.cards.push(card);
        if (thumbnailPath) group.thumbnails.add(thumbnailPath);
      }

      const assetRows = [];
      const fileRows = new Map();
      const usageRows = [];
      const plannedAssets = new Map();
      const addAsset = (key, name, category, status, size, mime, metadata) => {
        const existingId = existingAssets.get(key);
        const id = existingId || crypto.randomUUID();
        plannedAssets.set(key, id);
        if (!existingId) assetRows.push({
          id,
          asset_type:'image',
          category,
          original_name:String(name || 'legacy-image').slice(0,255),
          mime_type:mime,
          size_bytes:Math.max(1,Math.min(Number(size)||1,MAX_BYTES)),
          status,
          metadata:{legacy_source:'character-art',legacy_key:key,...metadata},
          created_by:activeUser.id
        });
        return id;
      };
      const addFile = (assetId, path, variant, item) => {
        if (!path || !item || existingFiles.has('character-art:' + path) || fileRows.has(path)) return;
        fileRows.set(path, {
          asset_id:assetId,
          variant,
          bucket_id:'character-art',
          object_path:path,
          visibility:'public',
          mime_type:legacyMime(item, item.name),
          size_bytes:legacySize(item)
        });
      };

      for (const group of groups.values()) {
        const original = originalMap.get(group.originalPath);
        const firstThumbPath = [...group.thumbnails][0] || '';
        const firstThumb = firstThumbPath ? thumbnailMap.get(firstThumbPath) : null;
        const key = 'legacy:' + group.originalPath;
        const id = addAsset(
          key,
          group.cards[0]?.image,
          'characters',
          original ? 'published' : 'issue',
          original ? legacySize(original) : legacySize(firstThumb),
          legacyMime(original || firstThumb, group.cards[0]?.image),
          {legacy_card_ids:group.cards.map(card => card.id),legacy_original_path:group.originalPath,legacy_public:true}
        );
        addFile(id, group.originalPath, 'original', original);
        for (const thumbPath of group.thumbnails) addFile(id, thumbPath, 'thumbnail', thumbnailMap.get(thumbPath));
        if (original) {
          for (const card of group.cards) {
            const thumbPath = card.thumb ? 'thumbs/' + storageFilename(card.thumb) : '';
            const usageKey = 'character:' + card.id + ':portrait';
            if (existingUsages.has(usageKey)) continue;
            usageRows.push({
              asset_id:id,
              owner_type:'character',
              owner_id:String(card.id),
              role:'portrait',
              is_published:true,
              published_bucket:'character-art',
              published_original_path:group.originalPath,
              published_thumbnail_path:thumbPath && thumbnailMap.has(thumbPath) ? thumbPath : null,
              created_by:activeUser.id
            });
            existingUsages.add(usageKey);
          }
        }
      }

      for (const item of originalItems) {
        const path = 'originals/' + item.name;
        if (expectedOriginals.has(path)) continue;
        const key = 'legacy:orphan:' + path;
        const id = addAsset(key, item.name, 'characters', 'issue', legacySize(item), legacyMime(item,item.name), {legacy_orphan:true,legacy_public:true,legacy_path:path});
        addFile(id, path, 'original', item);
      }
      for (const item of thumbnailItems) {
        const path = 'thumbs/' + item.name;
        if (expectedThumbnails.has(path)) continue;
        const key = 'legacy:orphan:' + path;
        const id = addAsset(key, item.name, 'characters', 'issue', legacySize(item), legacyMime(item,item.name), {legacy_orphan:true,legacy_public:true,legacy_path:path});
        addFile(id, path, 'thumbnail', item);
      }

      if (assetRows.length) {
        const {error} = await api.from('epiphany_assets').insert(assetRows);
        if (error) throw error;
      }
      if (fileRows.size) {
        const {error} = await api.from('epiphany_asset_files').insert([...fileRows.values()]);
        if (error) throw error;
      }
      if (usageRows.length) {
        const {error} = await api.from('epiphany_asset_usages').insert(usageRows);
        if (error) throw error;
      }

      setStatus('Legacy artwork indexed without moving or deleting files · ' + assetRows.length + ' new asset records, ' + fileRows.size + ' file records and ' + usageRows.length + ' character links.', 'success');
      showTab('library');
      await loadAssets();
    } catch (error) {
      setStatus('Legacy indexing stopped: ' + (error?.message || String(error)) + '. You can safely run it again; existing records are checked before adding more.', 'error');
    } finally {
      setBusy(false);
      if (button) {
        button.disabled = false;
        button.textContent = 'Index existing artwork';
      }
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
    $('asset-import-legacy')?.addEventListener('click', importLegacyCharacterArt);
    document.addEventListener('epiphany-auth-changed', () => loadAssets().catch(error => setStatus(error.message, 'error')));
    showTab('library');
    if (developer()) loadAssets().catch(error => setStatus(error.message, 'error'));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
})();