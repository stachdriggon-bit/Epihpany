/* EPIPHANY card collection prototype. Local-only until secure cross-device transactions are added. */
(() => {
  'use strict';
  const STORE = 'epiphany-card-prototype-v1';
  const DAILY_COST = 5;
  const TEN_COST = 45;
  const STARTER_TOKENS = 15;
  const ADMIN_TEST_TOKENS = 100000;
  const $ = (id) => document.getElementById(id);
  const data = () => Array.isArray(window.EPIPHANY_CARD_DATA) ? window.EPIPHANY_CARD_DATA : [];
  const today = () => { const d = new Date(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); };
  const safeState = () => {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORE) || 'null');
      if (parsed && typeof parsed === 'object') return {
        tokens: Math.max(0, Number(parsed.tokens) || 0),
        shards: Math.max(0, Number(parsed.shards) || 0),
        owned: parsed.owned && typeof parsed.owned === 'object' ? parsed.owned : {},
        dailyDate: typeof parsed.dailyDate === 'string' ? parsed.dailyDate : '',
        adminGrantFor: typeof parsed.adminGrantFor === 'string' ? parsed.adminGrantFor : '',
        initialized: true
      };
    } catch (_) {}
    return {tokens:STARTER_TOKENS, shards:0, owned:{}, dailyDate:'', adminGrantFor:'', initialized:true};
  };
  let state = safeState();
  const save = () => { try { localStorage.setItem(STORE, JSON.stringify(state)); } catch (_) {} };
  const esc = (value) => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const cardArt = (card, compact=false) => '<div class="collectible-art art-'+esc(card.palette)+'" aria-hidden="true"><span>'+esc(card.symbol)+'</span><i></i><b></b></div>';
  const cardMarkup = (card, count=0, featured=false) => '<article class="collectible-card rarity-'+card.rarity.toLowerCase()+(featured?' is-featured':'')+'">'+cardArt(card)+'<div class="collectible-card-copy"><span class="collectible-rarity">'+esc(card.rarity)+'</span><h3>'+esc(card.name)+'</h3><p class="collectible-card-title">'+esc(card.title)+'</p><p class="collectible-description">'+esc(card.description)+'</p><div class="collectible-card-foot"><code>'+esc(card.id)+'</code><span>'+(count>0?'×'+count:'Not collected')+'</span></div></div></article>';
  const ownedCount = () => Object.values(state.owned).reduce((sum,n)=>sum+Math.max(0,Number(n)||0),0);
  const updateCounts = () => {
    const token = $('chip-tokens-value'), shelf = $('cards-token-count'), shards = $('cards-shard-count'), total = $('cards-owned-count'), daily = $('cards-daily-pull');
    if (token) token.textContent = String(state.tokens);
    if (shelf) shelf.textContent = String(state.tokens);
    if (shards) shards.textContent = String(state.shards);
    if (total) total.textContent = String(ownedCount());
    if (daily) { const used = state.dailyDate === today(); daily.disabled = used; daily.textContent = used ? 'Daily free pull used' : 'Claim daily free pull'; }
    const one = $('cards-pull-one'); if (one) { one.disabled = state.tokens < DAILY_COST; one.textContent = 'Open 1 · '+DAILY_COST+' tokens'; }
    const ten = $('cards-pull-ten'); if (ten) { ten.disabled = state.tokens < TEN_COST; ten.textContent = 'Open 10 · '+TEN_COST+' tokens'; }
  };
  // Roll rarity first, then choose within that rarity. Otherwise a rarity with
  // many cards accidentally becomes more common just because its catalog is larger.
  const rarityWeight = {Common:58,Uncommon:25,Rare:12,Epic:4,Legendary:1};
  const chooseCard = () => {
    const cards=data(); if(!cards.length) return null;
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
  const award = (card) => {
    const previous=Number(state.owned[card.id])||0;
    if(previous>0) state.shards+=2;
    else state.owned[card.id]=1;
    return {...card,duplicate:previous>0};
  };
  const renderGallery = () => {
    const root=$('cards-gallery'); if(!root)return;
    const cards=data().filter(c=>(Number(state.owned[c.id])||0)>0);
    root.innerHTML=cards.length?cards.map(c=>cardMarkup(c,Number(state.owned[c.id])||0)).join(''):'<div class="cards-empty"><span>✦</span><h3>Your collection starts here</h3><p>Open your first pack to discover a character. Collected cards stay here.</p><button type="button" class="btn btn-primary" data-cards-tab="summon">Explore packs</button></div>';
    root.querySelectorAll('[data-cards-tab]').forEach(b=>b.addEventListener('click',()=>switchTab('summon')));
    const count=$('cards-collection-count'); if(count) count.textContent=cards.length+' / '+data().length+' discovered';
  };
  const showResults = (cards, title) => {
    const modal=$('cards-reveal-modal'), body=$('cards-reveal-results'), heading=$('cards-reveal-title');
    if(!modal||!body)return;
    if(heading)heading.textContent=title;
    const tierRank={Common:0,Uncommon:1,Rare:2,Epic:3,Legendary:4};
    const highestTier=cards.reduce((best,card)=>Math.max(best,tierRank[card.rarity]??0),0);
    modal.dataset.revealTier=Object.keys(tierRank).find(rarity=>tierRank[rarity]===highestTier)?.toLowerCase()||'common';
    body.innerHTML=cards.map((c,i)=>'<div class="reveal-result rarity-'+c.rarity.toLowerCase()+'" style="--reveal-delay:'+Math.min(i,9)*65+'ms">'+cardArt(c,true)+'<div><strong>'+esc(c.name)+'</strong><span>'+esc(c.rarity)+(c.duplicate?' · Duplicate → +2 shards':'')+'</span></div></div>').join('');
    modal.hidden=false; document.body.classList.add('cards-modal-open');
    const close=$('cards-reveal-close'); if(close)close.focus();
    updateCounts(); renderGallery(); save();
  };
  const closeResults = () => { const m=$('cards-reveal-modal'); if(m){m.hidden=true;delete m.dataset.revealTier;} document.body.classList.remove('cards-modal-open'); };
  const grantAdminTestTokens = (email) => {
    const normalized=String(email||'').trim().toLowerCase();
    if(!normalized||state.adminGrantFor===normalized)return;
    state.tokens=Math.max(state.tokens,ADMIN_TEST_TOKENS);
    state.adminGrantFor=normalized;
    save();updateCounts();
  };
  const pull = (count, free=false) => {
    if(free){if(state.dailyDate===today())return;state.dailyDate=today();}
    else {const cost=count===10?TEN_COST:DAILY_COST;if(state.tokens<cost)return;state.tokens-=cost;}
    const results=[];
    for(let i=0;i<count;i++){const card=chooseCard();if(card)results.push(award(card));}
    showResults(results,free?'Your daily discovery':count===10?'A ten-card discovery':'A new discovery');
  };
  function switchTab(tab) {
    document.querySelectorAll('[data-cards-panel]').forEach(p=>p.hidden=p.dataset.cardsPanel!==tab);
    document.querySelectorAll('[data-cards-tab]').forEach(b=>{const active=b.dataset.cardsTab===tab;b.classList.toggle('is-active',active);if(b.matches('button'))b.setAttribute('aria-pressed',String(active));});
    if(tab==='collection')renderGallery();
  }
  const init = () => {
    if(!$('cards-hub'))return;
    document.querySelectorAll('[data-cards-tab]').forEach(b=>b.addEventListener('click',()=>switchTab(b.dataset.cardsTab)));
    $('cards-daily-pull')?.addEventListener('click',()=>pull(1,true));
    $('cards-pull-one')?.addEventListener('click',()=>pull(1,false));
    $('cards-pull-ten')?.addEventListener('click',()=>pull(10,false));
    $('cards-reveal-close')?.addEventListener('click',closeResults);
    $('cards-reveal-modal')?.addEventListener('click',e=>{if(e.target===$('cards-reveal-modal'))closeResults();});
    document.addEventListener('keydown',e=>{if(e.key==='Escape')closeResults();});
    const first=data()[0]; const featured=$('cards-featured-card');
    if(first&&featured)featured.innerHTML=cardMarkup(first,Number(state.owned[first.id])||0,true);
    renderGallery();updateCounts();switchTab('collection');
    const adminEmail=window.EpiphanyAuth?.getDeveloperEmail?.();
    if(adminEmail)grantAdminTestTokens(adminEmail);
    save();
  };
  document.addEventListener('epiphany-auth-changed',event=>{if(event.detail?.isDeveloper&&event.detail?.email)grantAdminTestTokens(event.detail.email);});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
  window.EpiphanyCards={getState:()=>({...state,owned:{...state.owned}}),awardAchievementTokens:(amount=5)=>{const n=Math.max(0,Math.floor(Number(amount)||0));state.tokens+=n;save();updateCounts();return state.tokens;}};
})();