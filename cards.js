/* EPIPHANY card collection — fantasy cards, cinematic summoning.
   Local-only until secure cross-device transactions are added. Rules (costs, odds, pity) live at the top;
   rendering is split into: card markup → gallery/portal UI → particle effects → the reveal sequence. */
(() => {
  'use strict';
  const STORE = 'epiphany-card-prototype-v1';
  const DAILY_COST = 5;
  const ONE_COST = 5;
  const THREE_COST = 14;
  const FIVE_COST = 22;
  const TEN_COST = 45;
  const LEGENDARY_PITY = 50;
  const UPGRADE_COST = 5;
  const MAX_CARD_LEVEL = 5;
  const ACHIEVEMENT_REWARDS = [{id:'streak-3',test:a=>Number(a.streak)>=3,tokens:10,label:'3-day learning streak'},{id:'words-10',test:a=>Number(a.masteredWords)>=10,tokens:15,label:'10 mastered words'},{id:'streak-7',test:a=>Number(a.streak)>=7,tokens:25,label:'7-day learning streak'},{id:'words-50',test:a=>Number(a.masteredWords)>=50,tokens:50,label:'50 mastered words'}];
  const STARTER_TOKENS = 15;
  const ADMIN_TEST_TOKENS = 100000;
  const PULL_COSTS = {1:ONE_COST,3:THREE_COST,5:FIVE_COST,10:TEN_COST};
  const $ = (id) => document.getElementById(id);
  const data = () => Array.isArray(window.EPIPHANY_CARD_DATA) ? window.EPIPHANY_CARD_DATA : [];
  const today = () => { const d = new Date(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); };
  const reducedMotion = () => !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const safeState = () => {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORE) || 'null');
      if (parsed && typeof parsed === 'object') return {
        tokens: Math.max(0, Number(parsed.tokens) || 0),
        shards: Math.max(0, Number(parsed.shards) || 0),
        owned: parsed.owned && typeof parsed.owned === 'object' ? parsed.owned : {},
        dailyDate: typeof parsed.dailyDate === 'string' ? parsed.dailyDate : '',
        sinceLegendary: Math.max(0, Math.floor(Number(parsed.sinceLegendary) || 0)),
        adminGrantFor: typeof parsed.adminGrantFor === 'string' ? parsed.adminGrantFor : '',
        cardLevels: parsed.cardLevels && typeof parsed.cardLevels === 'object' ? parsed.cardLevels : {},
        history: Array.isArray(parsed.history) ? parsed.history.slice(0,30) : [],
        achievementRewards: parsed.achievementRewards && typeof parsed.achievementRewards === 'object' ? parsed.achievementRewards : {},
        initialized: true
      };
    } catch (_) {}
    return {tokens:STARTER_TOKENS, shards:0, owned:{}, dailyDate:'', sinceLegendary:0, adminGrantFor:'', cardLevels:{}, history:[], achievementRewards:{}, initialized:true};
  };
  let state = safeState();
  const save = () => { try { localStorage.setItem(STORE, JSON.stringify(state)); } catch (_) {} };
  const esc = (value) => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  /* ---------- catalogue helpers ---------- */
  const ORN = 'assets/cards/card-ornaments.svg';
  const PORTRAITS = 'assets/cards/epiphany-portraits.svg?v=character-art-20261027';
  const RARITIES = ['Common','Uncommon','Rare','Epic','Legendary'];
  const TIER = {Common:0,Uncommon:1,Rare:2,Epic:3,Legendary:4};
  const TIER_COLOR = {Common:'#cdd5e6',Uncommon:'#46e0a6',Rare:'#5cb6ff',Epic:'#bf7bff',Legendary:'#ffcf5a'};
  const KIND_LABEL = {CHR:'Character',WRD:'Word',PHR:'Phrase',ART:'Artifact',SCN:'Scene',LOC:'Location'};
  const KIND_EMBLEM = {CHR:'character',WRD:'word',PHR:'word',ART:'artifact',SCN:'scene',LOC:'location'};
  const kindOf = card => String(card.id).slice(0,3);
  const isOwned = card => (Number(state.owned[card.id]) || 0) > 0;
  const levelOf = card => Math.max(1, Math.min(MAX_CARD_LEVEL, Number(state.cardLevels[card.id]) || 1));
  const packCards = pack => pack === 'mixed' ? data() : data().filter(card => card.category === pack);
  const PACK_NAMES = {characters:'Character pack',words:'Word & phrase pack',artifacts:'Artifact pack',mixed:'Mixed pack'};

  /* ---------- the card ---------- */
  const svgUse = (cls, id, box, file=ORN) => '<svg class="'+cls+'" viewBox="'+box+'" focusable="false" aria-hidden="true"><use href="'+file+'#'+id+'"></use></svg>';
  const cornersMarkup = () => '<div class="fcard-corners" aria-hidden="true">'+['c1','c2','c3','c4'].map(c => svgUse(c,'orn-corner','0 0 64 64')).join('')+'</div>';
  const starsMarkup = rank => '<span class="fcard-stars" aria-hidden="true">'+[0,1,2,3,4].map(i => svgUse(i<=rank?'on':'','orn-star','0 0 24 24')).join('')+'</span>';
  const characterArtStorageFilename = path => String(path || '').split('/').pop()
    .replace(/[^A-Za-z0-9._-]/g, ch => '-u' + ch.codePointAt(0).toString(16) + '-')
    .replace(/-+/g, '-').replace(/^-|-$/g, '');
  const characterArtUrl = (path, folder) => {
    const base = window.EPIPHANY_SUPABASE_CONFIG?.url;
    if (!base || !path) return '';
    const file = characterArtStorageFilename(path).split('/').map(encodeURIComponent).join('/');
    return base.replace(/\/$/,'') + '/storage/v1/object/public/character-art/' + folder + '/' + file;
  };
  const publishedAssetUrl = (bucket, path) => {
    const base = window.EPIPHANY_SUPABASE_CONFIG?.url;
    if (!base || !bucket || !path) return '';
    const encodedPath = String(path).split('/').map(encodeURIComponent).join('/');
    return base.replace(/\/$/,'') + '/storage/v1/object/public/' + encodeURIComponent(bucket) + '/' + encodedPath;
  };
  // Published Asset Manager references override legacy filenames; static card data remains the offline fallback.
  const cardArtSource = (card, opts={}) => {
    const published = window.EPIPHANY_CARD_ASSET_MAP?.[card.id];
    if (published?.published_bucket && published?.published_original_path) {
      const path = opts.fullImage ? published.published_original_path : (published.published_thumbnail_path || published.published_original_path);
      const url = publishedAssetUrl(published.published_bucket, path);
      if (url) return url;
    }
    const storagePath = opts.fullImage ? card.image : (card.thumb || card.image);
    const folder = opts.fullImage ? 'originals' : 'thumbs';
    return characterArtUrl(storagePath, folder);
  };
  const artMarkup = (card, opts={}) => {
    if (!card.image) return card.art
      ? '<svg class="fcard-portrait" viewBox="0 0 240 300" preserveAspectRatio="xMidYMin slice" focusable="false"><use href="'+PORTRAITS+'#'+esc(card.art)+'"></use></svg>'
      : '<div class="fcard-sigil-art">'+svgUse('ring','back-sigil','0 0 120 120')+svgUse('ring r2','back-sigil','0 0 120 120')+'<b>'+esc(card.symbol)+'</b></div>';
    const cloudPath = cardArtSource(card,opts);
    return '<img class="fcard-portrait fcard-portrait-image" src="'+esc(cloudPath)+'" data-cloud-src="'+esc(cloudPath)+'" '+(opts.fullImage?'fetchpriority="high"':'fetchpriority="low"')+' width="240" height="300" alt="" loading="'+(opts.fullImage?'eager':'lazy')+'" decoding="async">';
  };

  // opts: level, count, featured, noTilt, leveled
  const cardFace = (card, opts={}) => {
    const level = opts.level || levelOf(card), rank = TIER[card.rarity] ?? 0, kind = kindOf(card);
    const cls = ['fcard','rarity-'+card.rarity.toLowerCase(),'cat-'+card.category,'art-'+card.palette,'level-'+level];
    if (String(card.name).length > 13) cls.push('is-long');
    if (opts.leveled) cls.push('is-leveled');
    return '<article class="'+cls.join(' ')+'" style="--lv:'+level+'"'+(opts.noTilt?'':' data-tilt')+' data-card-id="'+esc(card.id)+'"><div class="fcard-tilt"><div class="fcard-frame">'
      + '<div class="fcard-body">'
      +   '<div class="fcard-window" aria-hidden="true"><i class="fcard-aura"></i>'+artMarkup(card,opts)+'<i class="fcard-motes"></i>'
      +     '<span class="fcard-emblem">'+svgUse('','emb-'+(KIND_EMBLEM[kind]||'artifact'),'0 0 24 24')+'</span><span class="fcard-lv">Lv. '+level+'</span></div>'
      +   '<div class="fcard-plate"><div class="fcard-rar">'+esc(card.rarity)+'</div><h3>'+esc(card.name)+'</h3><p class="fcard-sub">'+esc(card.title)+'</p>'
      +     '<div class="fcard-pips" aria-label="Level '+level+' of '+MAX_CARD_LEVEL+'">'+[1,2,3,4,5].map(n => '<i'+(n<=level?' class="on"':'')+'></i>').join('')+'</div></div>'
      +   '<p class="fcard-desc"><span>'+esc(card.description)+'</span></p>'
      +   '<div class="fcard-foot">'+starsMarkup(rank)+'<span class="fcard-id">'+esc(card.id)+'</span></div>'
      + '</div>'+cornersMarkup()+'</div>'
      + svgUse('fcard-crest','orn-crest','0 0 160 44')+'<i class="fcard-foil"></i><i class="fcard-glare"></i></div></article>';
  };
  // opts: hint ('epic'|'legendary'), locked, color, cls
  const cardBack = (opts={}) => '<div class="fcard is-back'+(opts.locked?' is-locked':'')+(opts.cls?' '+opts.cls:'')+'"'+(opts.hint?' data-hint="'+opts.hint+'"':'')+(opts.color?' style="--pk:'+opts.color+'"':'')+' aria-hidden="true"><div class="fcard-tilt"><div class="fcard-frame"><div class="fcard-body">'
    + svgUse('fcard-sigil','back-sigil','0 0 120 120')+'<span class="fcard-back-name">EPIPHANY</span>'+(opts.locked?'<span class="fcard-lock">?</span>':'')+'</div>'+cornersMarkup()+'</div><i class="fcard-foil"></i></div></div>';

  // 3D tilt + holo foil follow the pointer. Touch devices keep the idle shimmer only.
  const initTilt = () => {
    if (reducedMotion() || !window.matchMedia?.('(hover: hover)').matches) return;
    let active = null, frame = 0, lastEvent = null;
    const reset = card => { if (!card) return; card.classList.remove('is-hover'); ['--rx','--ry','--mx','--my'].forEach(p => card.style.removeProperty(p)); };
    const apply = () => {
      frame = 0; const e = lastEvent; if (!e) return;
      const card = e.target.closest?.('.fcard[data-tilt]');
      if (card !== active) { reset(active); active = card; }
      if (!card) return;
      const r = card.getBoundingClientRect(), x = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)), y = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
      card.classList.add('is-hover');
      card.style.setProperty('--ry', ((x - .5) * 18).toFixed(2) + 'deg');
      card.style.setProperty('--rx', ((.5 - y) * 18).toFixed(2) + 'deg');
      card.style.setProperty('--mx', (x * 100).toFixed(1));
      card.style.setProperty('--my', (y * 100).toFixed(1));
    };
    document.addEventListener('pointermove', e => { if (e.pointerType === 'touch') return; lastEvent = e; if (!frame) frame = requestAnimationFrame(apply); }, {passive:true});
    document.addEventListener('pointerleave', () => { reset(active); active = null; }, true);
    window.addEventListener('blur', () => { reset(active); active = null; });
  };

  /* ---------- odds (derived from the real weights, so the panel can never lie) ---------- */
  // Roll rarity first, then choose within that rarity. Otherwise a rarity with
  // many cards accidentally becomes more common just because its catalog is larger.
  const rarityWeight = {Common:58,Uncommon:25,Rare:12,Epic:4,Legendary:1};
  const oddsFor = pack => {
    const cards = packCards(pack), present = RARITIES.filter(r => cards.some(c => c.rarity === r));
    const total = present.reduce((sum, r) => sum + rarityWeight[r], 0);
    return RARITIES.slice().reverse().map(r => ({rarity:r, pct:present.includes(r) && total ? rarityWeight[r] / total * 100 : 0, count:cards.filter(c => c.rarity === r).length}));
  };
  const fmtPct = n => n === 0 ? '—' : (n < 10 ? n.toFixed(1) : String(Math.round(n))) + '%';
  const renderOdds = pack => {
    const list = $('cards-odds-list'); if (!list) return;
    list.innerHTML = oddsFor(pack).map(o => '<li class="rar-'+o.rarity.toLowerCase()+(o.pct?'':' is-none')+'"><i class="gem"></i><span>'+o.rarity+'</span><span class="bar"><i style="width:'+o.pct.toFixed(1)+'%"></i></span><b title="'+o.count+' card'+(o.count===1?'':'s')+'">'+fmtPct(o.pct)+'</b></li>').join('');
    const total = $('cards-odds-total'); if (total) total.textContent = packCards(pack).length + ' cards in this pack';
  };

  /* ---------- wallet, buttons, log ---------- */
  const untilMidnight = () => { const n = new Date(), m = new Date(n.getFullYear(), n.getMonth(), n.getDate() + 1), mins = Math.max(1, Math.round((m - n) / 60000)); return Math.floor(mins / 60) + 'h ' + String(mins % 60).padStart(2,'0') + 'm'; };
  const ago = iso => { const s = (Date.now() - Date.parse(iso)) / 1000; if (!isFinite(s) || s < 60) return 'just now'; if (s < 3600) return Math.floor(s / 60) + 'm ago'; if (s < 86400) return Math.floor(s / 3600) + 'h ago'; return Math.floor(s / 86400) + 'd ago'; };
  const ownedCount = () => Object.values(state.owned).reduce((sum,n)=>sum+Math.max(0,Number(n)||0),0);
  const addHistory = (entry) => {state.history.unshift({...entry,at:new Date().toISOString()});state.history=state.history.slice(0,30);};
  let lastTokens = null;
  const setNumber = (el, value) => { if (!el) return; const next = String(value); if (el.textContent !== next) { el.textContent = next; if (el.tagName === 'STRONG' && lastTokens !== null) { el.classList.remove('is-bump'); void el.offsetWidth; el.classList.add('is-bump'); } } };
  const renderHistory = () => {
    const root = $('cards-history-list'); if (!root) return;
    root.innerHTML = state.history.length ? state.history.map(item => {
      const mark = item.kind === 'upgrade' ? '✧' : item.kind === 'achievement' ? '✓' : '✦';
      const gems = Array.isArray(item.gems) ? '<span class="hist-gems" aria-hidden="true">'+item.gems.slice(0,10).map(r => '<i class="gem rar-'+esc(String(r).toLowerCase())+'"></i>').join('')+'</span>' : '';
      return '<li><span class="cards-history-mark">'+mark+'</span><div><strong>'+esc(item.title)+'</strong><small>'+esc(item.detail||'')+'</small></div>'+gems+'<span class="hist-time">'+ago(item.at)+'</span></li>';
    }).join('') : '<li class="cards-history-empty">Your discoveries and upgrades will appear here.</li>';
  };
  const updateCounts = () => {
    const token = $('chip-tokens-value'), shelf = $('cards-token-count'), shards = $('cards-shard-count'), total = $('cards-owned-count'), daily = $('cards-daily-pull');
    if (token) token.textContent = String(state.tokens);
    if (shelf) shelf.textContent = String(state.tokens);
    if (shards) shards.textContent = String(state.shards);
    setNumber($('cards-summon-token-count'), state.tokens);
    setNumber($('cards-summon-shard-count'), state.shards);
    lastTokens = state.tokens;
    if (total) total.textContent = String(ownedCount());
    if (daily) {
      const used = state.dailyDate === today();
      daily.disabled = used;
      const label = daily.querySelector('[data-daily-label]');
      const note = daily.querySelector('[data-daily-note]');
      if (label) label.textContent = used ? 'Daily pull claimed' : 'Daily discovery';
      else daily.textContent = used ? 'Daily free pull used' : 'Claim daily free pull';
      if (note) note.textContent = used ? 'Resets in ' + untilMidnight() : 'Free · 1 character card';
      daily.setAttribute('aria-label', used ? 'Daily free character pull already claimed' : 'Claim your free daily character card');
    }
    for (const [id,count,cost] of [['cards-pull-one',1,ONE_COST],['cards-pull-three',3,THREE_COST],['cards-pull-five',5,FIVE_COST],['cards-pull-ten',10,TEN_COST]]) {
      const button=$(id);
      if(button){
        const short = Math.max(0, cost - state.tokens), save = count * ONE_COST - cost;
        button.disabled = short > 0;
        button.classList.toggle('is-short', short > 0);
        button.setAttribute('aria-label','Open '+count+' card'+(count===1?'':'s')+' for '+cost+' Tokens');
        const costLabel=button.querySelector('[data-pull-cost]');
        if(costLabel) costLabel.textContent='✦ '+cost;
        else button.textContent='Open '+count+' · '+cost+' tokens';
        const note = button.querySelector('[data-pull-note]');
        if (note) note.textContent = short > 0 ? 'Need ' + short + ' more' : (save > 0 ? 'Save ✦ ' + save : '');
      }
    }
    const pullsLeft=Math.max(0,LEGENDARY_PITY-state.sinceLegendary);
    const pity=$('cards-pity-count'); if(pity)pity.textContent=String(pullsLeft);
    const pityBar=$('cards-pity-progress'); if(pityBar)pityBar.style.width=(Math.min(LEGENDARY_PITY,state.sinceLegendary)/LEGENDARY_PITY*100)+'%';
    const upgradeHint=$('cards-upgrade-balance');if(upgradeHint)upgradeHint.textContent='Upgrade a collected card for '+UPGRADE_COST+' shards · '+MAX_CARD_LEVEL+' levels max';
    document.querySelectorAll('[data-pack-owned]').forEach(el => { const cards = packCards(el.dataset.packOwned); el.textContent = cards.filter(isOwned).length + '/' + cards.length; });
    renderHistory();
  };

  /* ---------- collection gallery (profile) ---------- */
  let galleryFilter = 'all', galleryRarity = 'all', showLocked = true, lastUpgraded = '';
  const GALLERY_FILTER_STORE = 'epiphany-card-gallery-filters-v1';
  const CATEGORY_REGISTRY = [{id:'characters',label:'Characters'},{id:'words',label:'Words'},{id:'artifacts',label:'Artifacts'},{id:'mixed',label:'Places & scenes'}];
  try { const saved=JSON.parse(localStorage.getItem(GALLERY_FILTER_STORE)||'null'); if(saved&&typeof saved==='object'){if(typeof saved.category==='string')galleryFilter=saved.category;if(typeof saved.rarity==='string')galleryRarity=saved.rarity;if(typeof saved.showLocked==='boolean')showLocked=saved.showLocked;} } catch (_) {}
  const saveGalleryFilters=()=>{try{localStorage.setItem(GALLERY_FILTER_STORE,JSON.stringify({category:galleryFilter,rarity:galleryRarity,showLocked}));}catch(_){}};
  const renderGalleryFilterChips=(all)=>{
    const rarityRoot=$('cards-rarity-filters'),typeRoot=$('cards-type-filters');
    if(rarityRoot)rarityRoot.innerHTML=[{id:'all',label:'All'},...RARITIES.map(id=>({id,label:id}))].map(item=>{const total=item.id==='all'?all.length:all.filter(c=>c.rarity===item.id).length,owned=item.id==='all'?all.filter(isOwned).length:all.filter(c=>c.rarity===item.id&&isOwned(c)).length;return '<button type="button" data-gallery-rarity="'+esc(item.id)+'" aria-pressed="'+String(galleryRarity===item.id)+'" '+(item.id!=='all'?'class="rarity-chip rarity-'+item.id.toLowerCase()+'"':'')+'>'+esc(item.label)+' <span>'+owned+'/'+total+'</span></button>';}).join('');
    const present=new Set(all.map(c=>c.category));
    const types=CATEGORY_REGISTRY.filter(t=>present.has(t.id));
    if(typeRoot)typeRoot.innerHTML=[{id:'all',label:'All'},...types].map(item=>'<button type="button" data-gallery-type="'+esc(item.id)+'" aria-pressed="'+String(galleryFilter===item.id)+'">'+esc(item.label)+'</button>').join('');
    rarityRoot?.querySelectorAll('[data-gallery-rarity]').forEach(b=>b.addEventListener('click',()=>{galleryRarity=b.dataset.galleryRarity;saveGalleryFilters();renderGallery(true);}));
    typeRoot?.querySelectorAll('[data-gallery-type]').forEach(b=>b.addEventListener('click',()=>{galleryFilter=b.dataset.galleryType;saveGalleryFilters();renderGallery(true);}));
  };
  let galleryNodeCache = new Map();
  let galleryEventsBound = false;
  const makeGalleryItem = card => {
    const ownedCard=isOwned(card);
    const markup=!ownedCard
      ? '<div class="cgal-item" data-gallery-card="'+esc(card.id)+'">'+cardBack({locked:true,color:TIER_COLOR[card.rarity]})+'<div class="cgal-locked-note">'+esc(card.rarity.toUpperCase())+' · UNDISCOVERED</div></div>'
      : '<div class="cgal-item" data-gallery-card="'+esc(card.id)+'">'+cardFace(card,{level:levelOf(card)})+'<button type="button" class="cards-upgrade-button" data-card-upgrade="'+esc(card.id)+'" '+(levelOf(card)>=MAX_CARD_LEVEL||state.shards<UPGRADE_COST?'disabled':'')+'>'+(levelOf(card)>=MAX_CARD_LEVEL?'Max level':'Upgrade · '+UPGRADE_COST+' shards')+'</button></div>';
    const template=document.createElement('template');template.innerHTML=markup.trim();
    const item=template.content.firstElementChild, face=item?.querySelector('.fcard');
    if(face){face.removeAttribute('aria-hidden');face.tabIndex=0;face.setAttribute('role','button');face.setAttribute('aria-haspopup','dialog');face.setAttribute('aria-label','View '+card.name+' details');}
    return item;
  };
  const renderGallery = (preserveNodes=false) => {
    const root = $('cards-gallery'); if (!root) return;
    const all = data(), owned = all.filter(isOwned);
    renderGalleryFilterChips(all);
    let list = all.filter(c => (galleryFilter === 'all' || c.category === galleryFilter) && (galleryRarity === 'all' || c.rarity === galleryRarity));
    if (!showLocked) list = list.filter(isOwned);
    list.sort((a,b) => (isOwned(b)?1:0) - (isOwned(a)?1:0) || TIER[b.rarity] - TIER[a.rarity] || a.name.localeCompare(b.name));
    if(!preserveNodes)galleryNodeCache.clear();
    all.forEach(card=>{if(!galleryNodeCache.has(card.id))galleryNodeCache.set(card.id,makeGalleryItem(card));});
    const fragment=document.createDocumentFragment();
    if(!owned.length){
      const template=document.createElement('template');
      template.innerHTML='<div class="cards-empty"><span>✦</span><h3>Your collection starts here</h3><p>Open your first pack to discover a character. Collected cards stay here — the dark slots below are waiting for you.</p><button type="button" class="btn btn-primary" data-view="summon">Explore packs</button></div>';
      fragment.append(template.content.firstElementChild);
    }
    if(list.length)list.forEach(card=>fragment.append(galleryNodeCache.get(card.id)));
    else if(owned.length){
      const template=document.createElement('template');
      template.innerHTML='<div class="cards-empty"><h3>No matching cards</h3><p>Try another rarity or type, or clear your filters.</p><button type="button" class="btn btn-ghost" id="cards-clear-gallery-filters">Clear filters</button></div>';
      fragment.append(template.content.firstElementChild);
    }
    root.replaceChildren(fragment);
    if(!galleryEventsBound){
      galleryEventsBound=true;
      root.addEventListener('click',e=>{
        if(e.target.closest('#cards-clear-gallery-filters')){galleryFilter='all';galleryRarity='all';showLocked=true;saveGalleryFilters();renderGallery(true);return;}
        const upgrade=e.target.closest('[data-card-upgrade]');
        if(upgrade){e.stopPropagation();upgradeCard(upgrade.dataset.cardUpgrade);return;}
        const item=e.target.closest('[data-gallery-card]');
        if(item)openCardDetail(item.dataset.galleryCard,item);
      });
      root.addEventListener('keydown',e=>{
        const face=e.target.closest('.fcard[role="button"]');
        if(face&&(e.key==='Enter'||e.key===' ')){e.preventDefault();const item=face.closest('[data-gallery-card]');if(item)openCardDetail(item.dataset.galleryCard,item);}
      });
      root.addEventListener('pointerover',e=>{const item=e.target.closest('[data-gallery-card]');if(item)preloadCardArt(item.dataset.galleryCard);},{passive:true});
      root.addEventListener('pointerdown',e=>{const item=e.target.closest('[data-gallery-card]');if(item)preloadCardArt(item.dataset.galleryCard);},{passive:true});
      root.addEventListener('focusin',e=>{const item=e.target.closest('[data-gallery-card]');if(item)preloadCardArt(item.dataset.galleryCard);});
    }
    const count = $('cards-collection-count'); if (count) count.textContent = owned.length+' / '+all.length+' discovered';
    const resultCount=$('cards-filter-result-count'); if(resultCount)resultCount.textContent=list.length+' cards';
    const bar = $('cards-collection-bar'); if (bar) bar.style.width = (all.length ? owned.length / all.length * 100 : 0) + '%';
    document.querySelectorAll('[data-gallery-filter]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.galleryFilter === galleryFilter)));
    const toggle = $('cards-gallery-locked'); if (toggle) { toggle.setAttribute('aria-pressed', String(showLocked)); toggle.textContent = showLocked ? 'Hide undiscovered' : 'Show undiscovered'; }
  };
  const localized=(value,lang,fallback='')=>{
    if(value&&typeof value==='object'&&!Array.isArray(value))return value[lang]||value.en||fallback;
    return value??fallback;
  };
  const profileValueHTML=(value,lang='en')=>{
    if(value&&typeof value==='object'&&!Array.isArray(value))return profileValueHTML([value],lang);
    if(Array.isArray(value))return value.map(part=>{
      if(typeof part==='string')return esc(part);
      if(!part||typeof part!=='object')return '';
      const label=localized(part.label||part.name,lang,'');
      if(part.place)return '<button type="button" class="cards-detail-chip" data-archive-place="'+esc(part.place)+'">'+esc(label)+'</button>';
      if(part.characterId)return '<button type="button" class="cards-detail-chip" data-profile-character="'+esc(part.characterId)+'">'+esc(label)+'</button>';
      if(part.storyId)return '<button type="button" class="cards-detail-chip" data-profile-story="'+esc(part.storyId)+'">'+esc(label)+'</button>';
      return esc(localized(part.text||part.value,lang,''));
    }).join('');
    return esc(localized(value,lang,''));
  };
  const renderDetailInfo=(card,profile,owned,lang)=>{
    const ar=lang==='ar', t=(en,arText)=>ar?arText:en;
    const rarityNames={Common:['Common','شائع'],Uncommon:['Uncommon','غير شائع'],Rare:['Rare','نادر'],Epic:['Epic','ملحمي'],Legendary:['Legendary','أسطوري']};
    const rarity=rarityNames[card.rarity]?.[ar?1:0]||card.rarity;
    const kind=KIND_LABEL[kindOf(card)]||'Card';
    const kindAr={Character:'شخصية',Word:'كلمة',Phrase:'عبارة',Artifact:'أثر',Scene:'مشهد',Location:'مكان'}[kind]||'بطاقة';
    const summary=owned?(profile?(localized(profile.summary,lang,card.description)||t('Not documented yet','لم يوثّق بعد')):t('Not documented yet','لم يوثّق بعد')):t('This card has not been collected yet.','لم تُجمع هذه البطاقة بعد.');
    const sections=(profile?.sections||[]).filter(s=>{
      const text=localized(s.text,lang,'');
      return text&&text!==localized(profile?.summary,lang,'');
    }).map((s,i)=>({id:s.id||('profile-section-'+i),title:localized(s.title,lang,t('Notes','ملاحظات')),text:localized(s.text,lang,''),icon:s.icon||'✦',spoiler:!!s.spoiler}));
    const extra=[
      ['appearance',profile?.appearance,t('Appearance','المظهر'),'◉'],
      ['personality',profile?.personality,t('Personality','الشخصية'),'✧'],
      ['background',profile?.background,t('Background and history','الخلفية والتاريخ'),'◷'],
      ['relationships',profile?.relationships,t('Relationships','العلاقات'),'◈'],
      ['places',profile?.places,t('Notable places','أماكن بارزة'),'⌖'],
      ['stories',profile?.stories,t('Story appearances','الظهور في القصص'),'▤'],
      ['timeline',profile?.timeline,t('Timeline','التسلسل الزمني'),'◷'],
      ['abilities',profile?.abilities,t('Abilities and skills','القدرات والمهارات'),'✧'],
      ['beliefs',profile?.beliefs,t('Beliefs and values','المعتقدات والقيم'),'◇'],
      ['secrets',profile?.secrets,t('Secrets and mysteries','الأسرار والألغاز'),'◌',true],
      ['mysteries',profile?.mysteries,t('Mysteries','الألغاز'),'◌',true],
      ['trivia',profile?.trivia,t('Trivia','معلومات إضافية'),'✦'],
      ['quotes',profile?.quotes,t('Memorable quotes','اقتباسات مميزة'),'❝']
    ];
    extra.forEach(([id,value,title,icon,spoiler])=>{
      if(value==null||(Array.isArray(value)&&!value.length))return;
      sections.push({id,title,text:value,icon,spoiler:!!spoiler});
    });
    const sectionMarkup=sections.length?sections.map((s,i)=>{
      const content=Array.isArray(s.text)?'<div class="cards-detail-list">'+s.text.map(item=>'<p>'+profileValueHTML(item,lang)+'</p>').join('')+'</div>':'<p>'+profileValueHTML(s.text,lang)+'</p>';
      const body=s.spoiler?'<details class="cards-detail-spoiler"><summary>'+t('Reveal','كشف')+'</summary>'+content+'</details>':content;
      return '<details class="cards-detail-section" id="cards-section-'+esc(s.id)+'" '+(i===0||!window.matchMedia?.('(max-width: 720px)').matches?'open':'')+'><summary><span class="cards-detail-section-icon">'+esc(s.icon)+'</span><span>'+esc(s.title)+'</span></summary><div class="cards-detail-section-body">'+body+'</div></details>';
    }).join(''):'<p class="cards-detail-placeholder">'+t('Not documented yet','لم يوثّق بعد')+'</p>';
    const facts=(profile?.facts||[]).filter(f=>localized(f.value,lang,'')&&localized(f.label,lang,'')).map(f=>'<div class="cards-detail-fact"><span>'+esc(localized(f.label,lang,''))+'</span><strong>'+esc(localized(f.value,lang,''))+'</strong></div>').join('');
    const sectionIndex=sections.map(s=>'<a href="#cards-section-'+esc(s.id)+'">'+esc(s.title)+'</a>').join('');
    const stats=owned?'<span class="cards-detail-owned">'+t('Level','المستوى')+' '+levelOf(card)+' · '+state.shards+' '+t('shards','شظايا')+'</span>':'';
    return '<div class="cards-detail-tools"><div class="cards-detail-tags"><span class="cards-detail-id">'+esc(card.id)+'</span><span class="cards-detail-rarity">'+esc(rarity)+'</span><span class="cards-detail-kind">'+esc(ar?kindAr:kind)+'</span>'+stats+'</div><button type="button" class="cards-detail-translate" aria-pressed="'+String(ar)+'">'+(ar?'English':'العربية')+'</button></div>'
      +'<header class="cards-detail-header"><p class="cards-detail-kicker">'+t('CHARACTER DOSSIER','ملف الشخصية')+'</p><h2 id="cards-detail-name">'+esc(localized(profile?.name,lang,card.name))+'</h2><p class="cards-detail-role">'+esc(owned?localized(profile?.title,lang,card.title):card.title)+'</p><p class="cards-detail-summary">'+esc(summary)+'</p></header>'
      +(facts?'<div class="cards-detail-facts">'+facts+'</div>':'')
      +'<div class="cards-detail-ornament">'+svgUse('','orn-crest','0 0 160 44')+'</div>'
      +(sectionIndex?'<nav class="cards-detail-index" aria-label="'+t('Jump to a section','انتقل إلى قسم')+'">'+sectionIndex+'</nav>':'')
      +'<div class="cards-detail-sections">'+sectionMarkup+'</div>'
      ;
  };
  let cardDetailTrigger=null, cardDetailReturnRect=null;
  const preloadCardArt=id=>{
    const card=data().find(c=>c.id===id);if(!card?.image||!isOwned(card))return;
    const cloudPath=cardArtSource(card);
    if(!cloudPath)return;
    if(!window.__epiphanyCardPreloads)window.__epiphanyCardPreloads=new Set();
    if(window.__epiphanyCardPreloads.has(cloudPath))return;
    window.__epiphanyCardPreloads.add(cloudPath);
    const image=new Image();
    image.decoding='async';
    image.fetchPriority='low';
    image.src=cloudPath;
  };
  const openCardDetail=(id,trigger)=>{
    const card=data().find(c=>c.id===id);if(!card)return;
    cardDetailTrigger=trigger?.querySelector('.fcard')||trigger||null;
    cardDetailReturnRect=cardDetailTrigger?.getBoundingClientRect()||null;
    let modal=document.getElementById('cards-detail-modal');
    if(!modal){modal=document.createElement('div');modal.id='cards-detail-modal';modal.className='cards-detail-backdrop';document.body.appendChild(modal);}
    const initialArabic=document.body.classList.contains('ar-on');
    const owned=isOwned(card),profile=owned?window.EPIPHANY_CARD_PROFILES?.[card.id]:null;
    modal.innerHTML='<section class="cards-detail-dialog rarity-'+esc(card.rarity.toLowerCase())+'" role="dialog" aria-modal="true" aria-labelledby="cards-detail-name" tabindex="-1"><button type="button" class="cards-detail-close" aria-label="'+(initialArabic?'إغلاق تفاصيل البطاقة':'Close card details')+'">×</button><div class="cards-detail-art '+(!owned?'is-locked':'')+'">'+(owned?cardFace(card,{level:levelOf(card),fullImage:true}):cardBack({locked:true,color:TIER_COLOR[card.rarity]}))+'</div><div class="cards-detail-info" dir="'+(initialArabic?'rtl':'ltr')+'" lang="'+(initialArabic?'ar':'en')+'">'+renderDetailInfo(card,profile,owned,initialArabic?'ar':'en')+'</div></section>';
    document.body.classList.add('no-scroll');
    const dialog=modal.querySelector('[role="dialog"]'),info=modal.querySelector('.cards-detail-info');
    const syncCardFaceLanguage=lang=>{
      const face=modal.querySelector('.cards-detail-art .fcard');
      if(!face)return;
      const arabic=lang==='ar';
      face.classList.toggle('is-arabic',arabic);
      face.dir=arabic?'rtl':'ltr';
      const name=face.querySelector('.fcard-plate h3');
      const title=face.querySelector('.fcard-sub');
      const description=face.querySelector('.fcard-desc span');
      if(name)name.textContent=localized(profile?.name,lang,card.name);
      if(title)title.textContent=localized(profile?.title,lang,card.title);
      if(description)description.textContent=localized(profile?.summary,lang,card.description);
    };
    syncCardFaceLanguage(initialArabic?'ar':'en');
    if(cardDetailReturnRect&&dialog&&!reducedMotion()){
      const target=dialog.getBoundingClientRect();
      dialog.style.setProperty('--lift-x',(cardDetailReturnRect.left+cardDetailReturnRect.width/2-target.left-target.width/2)+'px');
      dialog.style.setProperty('--lift-y',(cardDetailReturnRect.top+cardDetailReturnRect.height/2-target.top-target.height/2)+'px');
      dialog.style.setProperty('--lift-scale',String(Math.max(.18,Math.min(.5,cardDetailReturnRect.width/target.width,cardDetailReturnRect.height/target.height))));
    }
    let arabic=initialArabic,closing=false;
    const close=()=>{
      if(closing||!modal.isConnected)return;closing=true;
      document.removeEventListener('keydown',keyHandler);
      const finish=()=>{if(modal.isConnected)modal.remove();document.body.classList.remove('no-scroll');cardDetailTrigger?.focus?.({preventScroll:true});};
      if(!reducedMotion()&&cardDetailReturnRect){dialog.classList.add('is-closing');dialog.addEventListener('animationend',finish,{once:true});window.setTimeout(finish,380);}else finish();
    };
    const keyHandler=e=>{
      if(e.key==='Escape'){close();return;}
      if(e.key==='Tab'){
        const f=[...dialog.querySelectorAll('button:not([hidden]):not([disabled]),a[href], [tabindex="0"]')].filter(el=>el.getClientRects().length);
        if(!f.length)return;
        if(e.shiftKey&&document.activeElement===f[0]){e.preventDefault();f[f.length-1].focus();}
        else if(!e.shiftKey&&document.activeElement===f[f.length-1]){e.preventDefault();f[0].focus();}
      }
    };
    modal.addEventListener('click',e=>{
      const translate=e.target.closest('.cards-detail-translate');
      if(translate){arabic=!arabic;const language=arabic?'ar':'en';const previousScroll=info.scrollTop;info.dir=arabic?'rtl':'ltr';info.lang=language;syncCardFaceLanguage(language);modal.querySelector('.cards-detail-close')?.setAttribute('aria-label',arabic?'إغلاق تفاصيل البطاقة':'Close card details');info.innerHTML=renderDetailInfo(card,profile,owned,language);info.scrollTop=previousScroll;info.querySelector('.cards-detail-translate')?.focus({preventScroll:true});return;}
      const place=e.target.closest('[data-archive-place]');
      if(place){const placeId=place.dataset.archivePlace;close();window.EPIPHANY_OPEN_ARCHIVE_PLACE?.(placeId);return;}
      const character=e.target.closest('[data-profile-character]');
      if(character){const nextId=character.dataset.profileCharacter;close();window.setTimeout(()=>openCardDetail(nextId,null),390);return;}
      const story=e.target.closest('[data-profile-story]');
      if(story){const storyId=story.dataset.profileStory;close();if(window.EPIPHANY_OPEN_STORY)window.EPIPHANY_OPEN_STORY(storyId);else{document.querySelector('[data-view="stories"]')?.click();}return;}
      if(e.target===modal||e.target.closest('.cards-detail-close'))close();
    });
    document.addEventListener('keydown',keyHandler);
    dialog.focus();
  };
  const renderFeatured = () => {
    const holder = $('cards-featured-card'), copy = $('cards-featured-copy'), cards = data(); if (!holder || !cards.length) return;
    const key = today(), index = [...key].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % cards.length, card = cards[index];
    holder.innerHTML = cardFace(card, {level:isOwned(card) ? levelOf(card) : 1});
    if (copy) copy.innerHTML = '<span class="summon-step-label">CARD OF THE DAY</span><h3>'+esc(card.name)+' <small style="font-weight:600;color:var(--ink-2);font-size:.55em">· '+esc(card.title)+'</small></h3><p>'+esc(card.description)+'</p><div class="summon-featured-tags"><span class="rar-'+card.rarity.toLowerCase()+'"><i class="gem"></i>'+card.rarity+'</span><span>'+(KIND_LABEL[kindOf(card)]||'Card')+'</span><span>'+(isOwned(card)?'✓ In your collection':'Not yet collected')+'</span></div>';
  };
  const upgradeCard = (id) => {const card=data().find(c=>c.id===id);if(!card||!isOwned(card))return;const level=levelOf(card);if(level>=MAX_CARD_LEVEL||state.shards<UPGRADE_COST)return;state.shards-=UPGRADE_COST;state.cardLevels[id]=level+1;lastUpgraded=id;addHistory({kind:'upgrade',title:card.name+' upgraded',detail:'Level '+level+' → '+(level+1)+' · −'+UPGRADE_COST+' shards'});playCardCue('epic');save();updateCounts();renderGallery();renderFeatured();};

  /* ---------- rules: rolling a pull ---------- */
  const chooseCard = (pack='mixed') => {
    const cards=packCards(pack);
    if(!cards.length)return null;
    const groups = new Map();
    for (const card of cards) {
      if (!groups.has(card.rarity)) groups.set(card.rarity, []);
      groups.get(card.rarity).push(card);
    }
    const available = Object.entries(rarityWeight).filter(([rarity, weight]) => weight > 0 && groups.has(rarity));
    const total = available.reduce((sum, [, weight]) => sum + weight, 0);
    if (!total) return cards[Math.floor(Math.random() * cards.length)];
    let roll = Math.random() * total;
    for (const [rarity, weight] of available) {
      roll -= weight;
      if (roll < 0) {
        const pool = groups.get(rarity);
        return pool[Math.floor(Math.random() * pool.length)];
      }
    }
    const pool = groups.get(available[available.length - 1][0]);
    return pool[Math.floor(Math.random() * pool.length)];
  };
  const chooseRarityCard = (cards, rarity) => { const pool=cards.filter(card=>card.rarity===rarity); return pool.length?pool[Math.floor(Math.random()*pool.length)]:null; };
  const award = (card) => {
    const previous=Number(state.owned[card.id])||0;
    if(previous>0) state.shards+=2;
    else state.owned[card.id]=1;
    return {...card,duplicate:previous>0};
  };
  // Commits the whole pull (tokens, cards, pity, log) *before* any animation plays,
  // so closing the tab mid-ritual can never lose a card.
  const pull = (count, free=false, pack='characters') => {
    if(!PULL_COSTS[count])return null;
    if(free){if(state.dailyDate===today())return null;state.dailyDate=today();}
    else {const cost=PULL_COSTS[count];if(state.tokens<cost)return null;state.tokens-=cost;}
    const results=[];
    for(let i=0;i<count;i++){
      const available=packCards(pack);
      let card=null;
      if(state.sinceLegendary>=LEGENDARY_PITY-1)card=chooseRarityCard(available,'Legendary');
      if(!card)card=chooseCard(pack);
      if(!card)continue;
      if(card.rarity==='Legendary')state.sinceLegendary=0;else state.sinceLegendary++;
      results.push(award(card));
    }
    const title=free?'Your daily discovery':count+'-card '+(PACK_NAMES[pack]||'Mixed pack');
    addHistory({kind:'pull',title,detail:results.map(card=>card.name+(card.duplicate?' (duplicate)':'')).join(', ')||'No cards available',gems:results.map(card=>card.rarity)});
    save();
    return {results,title};
  };
  const checkAchievementRewards = (achievements) => {if(!achievements||typeof achievements!=='object')return;for(const reward of ACHIEVEMENT_REWARDS){if(!state.achievementRewards[reward.id]&&reward.test(achievements)){state.achievementRewards[reward.id]=true;state.tokens+=reward.tokens;addHistory({kind:'achievement',title:'Achievement reward: '+reward.label,detail:'+'+reward.tokens+' tokens'});}}save();updateCounts();};
  const grantAdminTestTokens = (email) => {
    const normalized=String(email||'').trim().toLowerCase();
    if(!normalized||state.adminGrantFor===normalized)return;
    state.tokens=Math.max(state.tokens,ADMIN_TEST_TOKENS);
    state.adminGrantFor=normalized;
    save();updateCounts();
  };

  /* ---------- particles (one canvas, only runs while something is alive) ---------- */
  const Fx = (() => {
    let canvas, ctx, w = 0, h = 0, dpr = 1, raf = 0, last = 0, parts = [], spawner = null, ambient = null;
    const sprites = {};
    const sprite = color => {
      if (sprites[color]) return sprites[color];
      const c = document.createElement('canvas'); c.width = c.height = 64;
      const g = c.getContext('2d'), gr = g.createRadialGradient(32,32,0,32,32,32);
      gr.addColorStop(0,'#fff'); gr.addColorStop(.28,color); gr.addColorStop(1,'rgba(0,0,0,0)');
      g.fillStyle = gr; g.fillRect(0,0,64,64); return sprites[color] = c;
    };
    const size = () => { if (!canvas) return; dpr = Math.min(2, window.devicePixelRatio || 1); w = canvas.clientWidth; h = canvas.clientHeight; canvas.width = Math.round(w*dpr); canvas.height = Math.round(h*dpr); ctx.setTransform(dpr,0,0,dpr,0,0); };
    const run = () => { if (!raf && canvas) { last = performance.now(); raf = requestAnimationFrame(tick); } };
    const cx = () => w / 2, cy = () => h * .46;
    const spawnSpiral = color => { const a = Math.random()*Math.PI*2, r = Math.max(w,h)*(.28+Math.random()*.4); parts.push({mode:'spiral',a0:a,r0:r,spin:2.4+Math.random()*1.6,age:0,life:.9+Math.random()*.7,size:5+Math.random()*9,color}); };
    function tick(now) {
      raf = 0; if (!ctx) return;
      const dt = Math.min(.05, (now - last) / 1000); last = now;
      if (spawner) { spawner.carry += spawner.rate*dt; while (spawner.carry >= 1 && parts.length < 420) { spawner.carry -= 1; spawnSpiral(spawner.color); } if (now > spawner.until) spawner = null; }
      if (ambient && parts.length < 160 && Math.random() < .55) parts.push({mode:'free',x:Math.random()*w,y:h+10,vx:(Math.random()-.5)*14,vy:-(24+Math.random()*50),drag:0,grav:0,age:0,life:3+Math.random()*3,size:3+Math.random()*6,color:ambient});
      ctx.clearRect(0,0,w,h); ctx.globalCompositeOperation = 'lighter';
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i]; p.age += dt;
        if (p.age >= p.life) { parts.splice(i,1); continue; }
        const t = p.age / p.life; let x, y, s = p.size, alpha;
        if (p.mode === 'spiral') { const e = t*t, r = p.r0*(1-e), ang = p.a0 + p.age*p.spin*(1+e*2); x = cx() + Math.cos(ang)*r; y = cy() + Math.sin(ang)*r*.82; alpha = Math.min(1,t*5)*(1-t*.2); s = p.size*(1+t*.8); }
        else { p.vx *= 1 - p.drag*dt; p.vy = p.vy*(1 - p.drag*dt) + p.grav*dt; p.x += p.vx*dt; p.y += p.vy*dt; x = p.x; y = p.y; alpha = Math.sin(Math.PI*Math.min(1,t*1.15)); if (p.mode === 'burst') alpha = 1 - t*t; }
        ctx.globalAlpha = Math.max(0, alpha); const d = s*3.2; ctx.drawImage(sprite(p.color), x - d/2, y - d/2, d, d);
      }
      ctx.globalAlpha = 1;
      if (parts.length || spawner || ambient) raf = requestAnimationFrame(tick); else ctx.clearRect(0,0,w,h);
    }
    return {
      init(el) { canvas = el; ctx = el ? el.getContext('2d') : null; size(); },
      resize: size,
      burst(x, y, color, n, power = 1) { if (!ctx || reducedMotion()) return; for (let i = 0; i < n && parts.length < 480; i++) { const a = Math.random()*Math.PI*2, v = (60 + Math.random()*260)*power; parts.push({mode:'burst',x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v - 40*power,drag:1.6,grav:90,age:0,life:.7+Math.random()*1.1,size:3+Math.random()*7*power,color}); } run(); },
      burstCenter(color, n, power) { this.burst(cx(), cy(), color, n, power); },
      converge(color, ms) { if (!ctx || reducedMotion()) return; spawner = {color, rate:70, carry:0, until:performance.now()+ms}; run(); },
      ambient(color) { if (!ctx || reducedMotion()) return; ambient = color; run(); },
      clear() { parts = []; spawner = null; ambient = null; if (ctx) ctx.clearRect(0,0,w,h); }
    };
  })();

  /* ---------- the reveal sequence ---------- */
  const playCardCue = kind => { try { window.EpiphanyPlaySfx?.(kind); } catch (_) {} };
  let rv = null, summonInProgress = false, lastTrigger = null;
  const modalEl = () => $('cards-reveal-modal');
  const later = (fn, ms) => { const id = window.setTimeout(() => { if (rv) rv.timers.delete(id); fn(); }, ms); rv?.timers.add(id); return id; };
  const setPhase = phase => { if (!rv) return; rv.phase = phase; modalEl().dataset.phase = phase; };
  const pulse = (cls, ms) => { const m = modalEl(); m.classList.remove(cls); void m.offsetWidth; m.classList.add(cls); later(() => m.classList.remove(cls), ms); };
  const cardCenter = el => { const r = el.getBoundingClientRect(); return {x:r.left + r.width/2, y:r.top + r.height/2}; };
  const announce = text => { const hint = $('cards-reveal-hint'); if (hint) hint.textContent = text; };

  const openReveal = (cards, title) => {
    const modal = modalEl(), body = $('cards-reveal-results'), heading = $('cards-reveal-title');
    if (!modal || !body) return;
    const top = cards.reduce((best, card) => Math.max(best, TIER[card.rarity] ?? 0), 0), topName = RARITIES[top];
    const count = cards.length, cols = count <= 3 ? count : 5, rows = Math.ceil(count / cols);
    if (heading) heading.textContent = title;
    modal.dataset.revealTier = topName.toLowerCase();
    modal.dataset.resultCount=String(cards.length);
    modal.dataset.orb = 'neutral'; modal.dataset.fx = ''; modal.classList.remove('do-flash','do-shake','cards-legendary-sheen');
    if (top >= TIER.Legendary) modal.classList.add('cards-legendary-sheen');
    modal.style.removeProperty('--tier');
    body.style.setProperty('--cols', cols); body.style.setProperty('--rows', rows);
    body.innerHTML = cards.map((c,i) => {
      const rank = TIER[c.rarity] ?? 0, hint = rank >= 4 ? 'legendary' : rank === 3 ? 'epic' : '';
      return '<div class="reveal-result rarity-'+c.rarity.toLowerCase()+'" role="button" tabindex="0" data-i="'+i+'" style="--i:'+i+'" aria-label="Face-down card '+(i+1)+'. Press to reveal.">'
        + '<div class="rv-flip"><div class="rv-face rv-back">'+cardBack({hint})+'</div><div class="rv-face rv-front">'+cardFace(c,{level:levelOf(c)})+'</div></div>'
        + '<span class="rv-badge '+(c.duplicate?'is-dup':'is-new')+'">'+(c.duplicate?(count===1?'DUPLICATE · +2 ◇':'+2 ◇'):'NEW')+'</span></div>';
    }).join('');
    const stage = document.querySelector('.summon-stage'); if (stage?.dataset.pack) modal.style.setProperty('--pk', {characters:'#a98bff',words:'#5fd0e6',artifacts:'#f0b650',mixed:'#e58ad8'}[stage.dataset.pack] || '#a98bff');
    rv = {cards, els:[...body.querySelectorAll('.reveal-result')], flipped:new Set(), timers:new Set(), phase:'charge', top, reduced:reducedMotion()};
    modal.hidden = false; document.body.classList.add('cards-modal-open');
    const reveal = $('cards-reveal-all'), done = $('cards-reveal-done');
    if (reveal) { reveal.hidden = false; reveal.textContent = count === 1 ? 'Reveal' : 'Reveal all'; }
    if (done) done.hidden = true;
    const summary = $('cards-reveal-summary'); if (summary) summary.innerHTML = '';
    announce('');
    Fx.init($('cards-reveal-fx')); Fx.clear();
    $('cards-reveal-close')?.focus({preventScroll:true});
    if (rv.reduced) { setPhase('cards'); revealAll(true); return; }
    setPhase('charge');
    playCardCue('summon');
    const chargeMs = top >= 3 ? 2300 : top === 2 ? 1800 : 1500;
    Fx.converge(TIER_COLOR[topName], chargeMs);
    later(() => { if (rv?.phase === 'charge') modal.dataset.orb = 'tier'; }, chargeMs * .5);
    later(burst, chargeMs);
  };
  const burst = () => {
    if (!rv || rv.phase !== 'charge') return;
    const modal = modalEl(), color = TIER_COLOR[RARITIES[rv.top]];
    modal.dataset.orb = 'tier'; setPhase('burst'); pulse('do-flash', 900);
    if (rv.top >= TIER.Legendary) playCardCue('legendary');
    Fx.burstCenter(color, 50 + rv.top * 26, 1 + rv.top * .25);
    if (rv.top >= 3) modal.dataset.fx = RARITIES[rv.top].toLowerCase();
    later(showCards, 520);
  };
  const showCards = () => {
    if (!rv || rv.phase === 'cards' || rv.phase === 'done') return;
    const body = $('cards-reveal-results'), br = body.getBoundingClientRect(), bx = br.left + br.width/2, by = br.top + br.height/2;
    rv.els.forEach(el => { const r = el.getBoundingClientRect(); el.style.setProperty('--dx', (bx - (r.left + r.width/2)) + 'px'); el.style.setProperty('--dy', (by - (r.top + r.height/2)) + 'px'); });
    setPhase('cards');
    announce(rv.cards.length === 1 ? 'Tap the card to reveal it' : 'Tap a card to reveal it — or reveal them all');
    if (rv.top >= 3) Fx.ambient(TIER_COLOR[RARITIES[rv.top]]);
    (rv.els[0])?.focus({preventScroll:true});
  };
  const flipCard = (i, instant=false) => {
    if (!rv || rv.phase === 'charge' || rv.phase === 'burst' || rv.flipped.has(i)) return;
    const el = rv.els[i], card = rv.cards[i]; if (!el) return;
    rv.flipped.add(i);
    const rank = TIER[card.rarity] ?? 0, color = TIER_COLOR[card.rarity], modal = modalEl();
    el.classList.add('is-flipped'); el.removeAttribute('tabindex');
    el.setAttribute('aria-label', card.name + ', ' + card.rarity + (card.duplicate ? ', duplicate, plus 2 shards' : ', new card'));
    announce(card.name + ' — ' + card.rarity + (card.duplicate ? ' · duplicate (+2 shards)' : ' · new!'));
    if (!instant && !rv.reduced) {
      el.classList.add('is-pop');
      playCardCue(rank >= 4 ? 'legendary' : rank === 3 ? 'epic' : 'flip');
      later(() => { const c = cardCenter(el); Fx.burst(c.x, c.y, color, 8 + rank*18, .6 + rank*.28); }, 330);
      if (rank >= 3) {
        modal.style.setProperty('--tier', color); modal.dataset.fx = card.rarity.toLowerCase();
        later(() => { pulse('do-flash', 900); if (rank >= 4) { pulse('do-shake', 600); try { navigator.vibrate?.([30,40,60]); } catch (_) {} } banner(card); }, 300);
      }
    }
    if (rv.flipped.size === rv.cards.length) later(finish, instant || rv.reduced ? 0 : 900);
  };
  const banner = card => {
    const el = $('cards-reveal-banner'); if (!el) return;
    el.innerHTML = '<strong>'+esc(card.rarity.toUpperCase())+'</strong><span>'+esc(card.name)+' · '+esc(card.title)+'</span>';
    el.classList.remove('show'); void el.offsetWidth; el.classList.add('show');
  };
  const revealAll = (instant=false) => {
    if (!rv || rv.phase === 'charge' || rv.phase === 'burst') return;
    const pending = rv.cards.map((c,i) => i).filter(i => !rv.flipped.has(i)).sort((a,b) => (TIER[rv.cards[a].rarity]-TIER[rv.cards[b].rarity]) || (a-b));
    if (rv.reduced) instant = true;
    if (instant) { pending.forEach(i => flipCard(i, true)); if (!rv.cards.length) finish(); return; }
    const reveal = $('cards-reveal-all'); if (reveal) reveal.hidden = true;
    pending.forEach((i, n) => later(() => flipCard(i), n * 210));
  };
  const finish = () => {
    if (!rv || rv.phase === 'done') return;
    setPhase('done'); Fx.stopAmbient?.();
    const fresh = rv.cards.filter(c => !c.duplicate).length, dups = rv.cards.length - fresh;
    const top = RARITIES[rv.top], summary = $('cards-reveal-summary');
    if (summary) summary.innerHTML = '<span class="rar-'+top.toLowerCase()+'"><i class="gem"></i>Best: <b>'+top+'</b></span>'+(fresh?'<span>New <b>'+fresh+'</b></span>':'')+(dups?'<span>Duplicates <b>'+dups+'</b> · +<b>'+dups*2+'</b> ◇ shards</span>':'');
    announce('Added to your collection');
    const reveal = $('cards-reveal-all'), done = $('cards-reveal-done'); if (reveal) reveal.hidden = true; if (done) { done.hidden = false; done.focus({preventScroll:true}); }
    updateCounts(); renderGallery(); renderFeatured();
  };
  const skip = () => {
    if (!rv) return;
    if (rv.phase === 'charge') { rv.timers.forEach(clearTimeout); rv.timers.clear(); burst(); }
    else if (rv.phase === 'burst') { rv.timers.forEach(clearTimeout); rv.timers.clear(); showCards(); }
    else if (rv.phase === 'cards') { rv.timers.forEach(clearTimeout); rv.timers.clear(); const best = rv.cards.reduce((b,c,i) => (TIER[c.rarity] > TIER[rv.cards[b].rarity] ? i : b), 0); const hadFlip = rv.flipped.size; revealAll(true); if (!hadFlip && rv.top >= 3) { const modal = modalEl(); modal.style.setProperty('--tier', TIER_COLOR[rv.cards[best].rarity]); modal.dataset.fx = RARITIES[rv.top].toLowerCase(); banner(rv.cards[best]); } finish(); }
  };
  const closeResults = () => {
    const m = modalEl();
    if (rv) { rv.timers.forEach(clearTimeout); const wasDone = rv.phase === 'done'; rv = null; if (!wasDone) { updateCounts(); renderGallery(); renderFeatured(); } }
    Fx.clear(); $('cards-reveal-banner')?.classList.remove('show');
    document.querySelector('.summon-stage')?.classList.remove('is-summoning');
    if (m) { m.hidden = true; ['revealTier','resultCount','phase','orb','fx'].forEach(k => delete m.dataset[k]); m.classList.remove('do-flash','do-shake'); }
    document.body.classList.remove('cards-modal-open');
    summonInProgress = false;
    const status = $('summon-ritual-status'); if (status) status.textContent = 'The gate is quiet. Your next discovery awaits.';
    if (lastTrigger && document.contains(lastTrigger) && !lastTrigger.disabled) lastTrigger.focus({preventScroll:true}); lastTrigger = null;
  };
  Fx.stopAmbient = () => Fx.ambient(null);

  const beginPull = (count, free=false, pack='characters') => {
    if (summonInProgress) return;
    if (free && state.dailyDate === today()) return;
    if (!free && state.tokens < PULL_COSTS[count]) return;
    if (!packCards(pack).length) { const status=$('summon-ritual-status'); if(status)status.textContent='This pack is still being prepared. Choose another pack.'; return; }
    summonInProgress = true; lastTrigger = document.activeElement;
    document.querySelector('.summon-stage')?.classList.add('is-summoning');
    const outcome = pull(count, free, pack);
    if (!outcome || !outcome.results.length) { summonInProgress = false; return; }
    const status = $('summon-ritual-status'); if (status) status.textContent = 'The gate is awakening…';
    updateCounts();
    openReveal(outcome.results, outcome.title);
  };

  const selectedPack = () => document.querySelector('[data-card-pack].is-active')?.dataset.cardPack || 'characters';
  const fanMarkup = color => ['fan-l','fan-r','fan-c'].map(cls => cardBack({cls})).join('');
  const choosePack = button => {
    document.querySelectorAll('[data-card-pack]').forEach(item=>{const active=item===button;item.classList.toggle('is-active',active);item.setAttribute('aria-pressed',String(active));});
    const pack = button.dataset.cardPack, label = button.dataset.cardPackLabel || button.textContent.trim();
    const selected = $('cards-pack-selected'); if (selected) selected.textContent = label;
    const art = $('cards-pack-art'); if (art) { art.dataset.pack = pack; art.setAttribute('aria-label','Selected collectible pack: '+label); }
    document.querySelector('.summon-stage')?.setAttribute('data-pack', pack);
    const badge = $('cards-pack-type'); if (badge) badge.textContent = label.toUpperCase();
    renderOdds(pack);
  };

  const init = () => {
    if(!$('cards-hub'))return;
    // Start the profile on its Overview instead of placing the collection first.
    // Keep the section links before the content and the collection as a later section.
    const profileRoot = document.querySelector('#profile-view .page');
    const profileNav = profileRoot?.querySelector('.profile-nav');
    const profileOverview = profileRoot?.querySelector('.player-profile');
    const collectionHub = $('cards-hub');
    if(profileRoot && profileNav && profileOverview && collectionHub && collectionHub.previousElementSibling !== profileOverview){
      profileOverview.before(profileNav);
      profileOverview.after(collectionHub);
      profileNav.querySelectorAll('a').forEach(link=>{
        if(link.getAttribute('href')==='#player-profile-title') link.setAttribute('aria-current','location');
        else link.removeAttribute('aria-current');
      });
    }
    // The overlay must sit above the sticky site header, so it lives directly under <body>.
    if(modalEl()&&modalEl().parentElement!==document.body)document.body.appendChild(modalEl());
    $('cards-daily-pull')?.addEventListener('click',()=>beginPull(1,true,'characters'));
    $('cards-pull-one')?.addEventListener('click',()=>beginPull(1,false,selectedPack()));
    $('cards-pull-three')?.addEventListener('click',()=>beginPull(3,false,selectedPack()));
    $('cards-pull-five')?.addEventListener('click',()=>beginPull(5,false,selectedPack()));
    $('cards-pull-ten')?.addEventListener('click',()=>beginPull(10,false,selectedPack()));
    document.querySelectorAll('[data-card-pack]').forEach(button=>button.addEventListener('click',()=>choosePack(button)));
    const fan = document.querySelector('.summon-fan'); if (fan) fan.innerHTML = fanMarkup();
    // reveal controls
    $('cards-reveal-close')?.addEventListener('click',closeResults);
    $('cards-reveal-done')?.addEventListener('click',closeResults);
    $('cards-reveal-all')?.addEventListener('click',()=>revealAll(false));
    $('cards-reveal-skip')?.addEventListener('click',skip);
    $('cards-reveal-results')?.addEventListener('click',e=>{const el=e.target.closest('.reveal-result');if(el&&rv?.phase==='cards')flipCard(Number(el.dataset.i));});
    $('cards-reveal-results')?.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches?.('.reveal-result')){e.preventDefault();if(rv?.phase==='cards')flipCard(Number(e.target.dataset.i));}});
    $('cards-reveal-modal')?.addEventListener('click',e=>{if(e.target===$('cards-reveal-modal')&&rv?.phase==='done')closeResults();else if(e.target===$('cards-reveal-modal')&&(rv?.phase==='charge'||rv?.phase==='burst'))skip();});
    document.addEventListener('keydown',e=>{
      const m = modalEl(); if (!m || m.hidden) return;
      if (e.key === 'Escape') { if (rv && rv.phase !== 'done') skip(); else closeResults(); return; }
      if (e.key === 'Tab') { const f = [...m.querySelectorAll('button:not([hidden]):not([disabled]),.reveal-result[tabindex="0"]')].filter(el => el.offsetParent !== null || el.getClientRects().length); if (!f.length) return; const first = f[0], lastEl = f[f.length-1]; if (e.shiftKey && document.activeElement === first) { e.preventDefault(); lastEl.focus(); } else if (!e.shiftKey && document.activeElement === lastEl) { e.preventDefault(); first.focus(); } }
    });
    window.addEventListener('resize',()=>{ if (rv) Fx.resize(); });
    // collection gallery controls
    
    $('cards-gallery-locked')?.addEventListener('click',()=>{showLocked=!showLocked;saveGalleryFilters();renderGallery(true);});
    initTilt();
    document.addEventListener('load',e=>{if(e.target?.matches?.('.fcard-portrait-image'))e.target.classList.add('is-loaded');},true);
    document.addEventListener('error',e=>{
      const image=e.target;
      if(!image?.matches?.('.fcard-portrait-image')||image.dataset.cloudErrorRecorded==='1')return;
      image.dataset.cloudErrorRecorded='1';
      image.classList.add('is-art-unavailable');
      try{
        const key='epiphany-character-art-cloud-errors-v1';
        const stats=JSON.parse(localStorage.getItem(key)||'{"count":0,"recent":[]}');
        stats.count=(Number(stats.count)||0)+1;
        stats.lastAt=new Date().toISOString();
        stats.recent=Array.isArray(stats.recent)?stats.recent:[];
        stats.recent.unshift({at:stats.lastAt,cloud:image.dataset.cloudSrc||image.currentSrc||image.src});
        stats.recent=stats.recent.slice(0,30);
        localStorage.setItem(key,JSON.stringify(stats));
        window.dispatchEvent(new CustomEvent('epiphany:character-art-cloud-error',{detail:{cloud:image.dataset.cloudSrc||image.currentSrc||image.src}}));
      }catch(_){}
    },true);
    const refreshPublishedCharacterAssets = async () => {
      try {
        const rows = await window.EpiphanyAuth?.loadPublishedCharacterAssets?.();
        if (!Array.isArray(rows)) return;
        window.EPIPHANY_CARD_ASSET_MAP = Object.fromEntries(rows.map(row => [row.owner_id, row]));
        renderFeatured();
        renderGallery();
      } catch (error) {
        console.warn('[EPIPHANY] Published character asset references could not be refreshed:', error);
      }
    };
    renderFeatured();renderGallery();updateCounts();renderOdds(selectedPack());
    refreshPublishedCharacterAssets();
    window.addEventListener('epiphany:published-assets-updated', refreshPublishedCharacterAssets);
    window.addEventListener('epiphany:supabase-ready', refreshPublishedCharacterAssets);
    document.addEventListener('epiphany-auth-changed', refreshPublishedCharacterAssets);
    $('cards-history-clear')?.addEventListener('click',()=>{state.history=[];save();renderHistory();});
    window.addEventListener('epiphany:achievements-updated',()=>checkAchievementRewards(window.EPIPHANY_PROFILE_ACHIEVEMENTS));
    if(window.EPIPHANY_PROFILE_ACHIEVEMENTS)checkAchievementRewards(window.EPIPHANY_PROFILE_ACHIEVEMENTS);
    const adminEmail=window.EpiphanyAuth?.getDeveloperEmail?.();
    if(adminEmail)grantAdminTestTokens(adminEmail);
    window.setInterval(()=>{ if (state.dailyDate === today()) updateCounts(); }, 60000);
    save();
  };
  document.addEventListener('epiphany-auth-changed',event=>{if(event.detail?.isDeveloper&&event.detail?.email)grantAdminTestTokens(event.detail.email);});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
  window.EpiphanyCards={getState:()=>({...state,owned:{...state.owned},cardLevels:{...state.cardLevels},history:[...state.history]}),awardAchievementTokens:(amount=5)=>{const n=Math.max(0,Math.floor(Number(amount)||0));state.tokens+=n;save();updateCounts();return state.tokens;}};
})();
