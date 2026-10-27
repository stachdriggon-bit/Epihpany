/* EPIPHANY card collection prototype. Local-only until secure cross-device transactions are added. */
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
  const cardArt = (card, compact=false) => '<div class="collectible-art art-'+esc(card.palette)+(card.art?' has-portrait':'')+'" aria-hidden="true">'+(card.art?'<svg class="collectible-portrait" viewBox="0 0 240 300" focusable="false"><use href="assets/cards/epiphany-portraits.svg#'+esc(card.art)+'"></use></svg>':'<span>'+esc(card.symbol)+'</span><i></i><b></b>')+'</div>';
  const cardMarkup = (card, count=0, featured=false) => {const level=Math.max(1,Number(state.cardLevels[card.id])||1);return '<article class="collectible-card rarity-'+card.rarity.toLowerCase()+(featured?' is-featured':'')+' level-'+level+'">'+cardArt(card)+'<div class="collectible-card-copy"><span class="collectible-rarity">'+esc(card.rarity)+' · Lv. '+level+'</span><h3>'+esc(card.name)+'</h3><p class="collectible-card-title">'+esc(card.title)+'</p><p class="collectible-description">'+esc(card.description)+'</p><div class="collectible-card-foot"><code>'+esc(card.id)+'</code><span>'+(count>0?'Collected':'Not collected')+'</span></div>'+(count>0&&!featured?'<button type="button" class="cards-upgrade-button" data-card-upgrade="'+esc(card.id)+'" '+(level>=MAX_CARD_LEVEL||state.shards<UPGRADE_COST?'disabled':'')+'>'+(level>=MAX_CARD_LEVEL?'Max level': 'Upgrade · '+UPGRADE_COST+' shards')+'</button>':'')+'</div></article>';};
  const ownedCount = () => Object.values(state.owned).reduce((sum,n)=>sum+Math.max(0,Number(n)||0),0);
  const addHistory = (entry) => {state.history.unshift({...entry,at:new Date().toISOString()});state.history=state.history.slice(0,30);};
  const updateCounts = () => {
    const token = $('chip-tokens-value'), shelf = $('cards-token-count'), shards = $('cards-shard-count'), total = $('cards-owned-count'), daily = $('cards-daily-pull');
    if (token) token.textContent = String(state.tokens);
    if (shelf) shelf.textContent = String(state.tokens);
    if (shards) shards.textContent = String(state.shards);
    const portalTokens = $('cards-summon-token-count'), portalShards = $('cards-summon-shard-count');
    if (portalTokens) portalTokens.textContent = String(state.tokens);
    if (portalShards) portalShards.textContent = String(state.shards);
    if (total) total.textContent = String(ownedCount());
    if (daily) {
      const used = state.dailyDate === today();
      daily.disabled = used;
      const label = daily.querySelector('[data-daily-label]');
      const note = daily.querySelector('[data-daily-note]');
      if (label) label.textContent = used ? 'Daily pull claimed' : 'Daily discovery';
      else daily.textContent = used ? 'Daily free pull used' : 'Claim daily free pull';
      if (note) note.textContent = used ? 'Come back tomorrow' : 'Free · 1 character card';
      daily.setAttribute('aria-label', used ? 'Daily free character pull already claimed' : 'Claim your free daily character card');
    }
    for (const [id,count,cost] of [['cards-pull-one',1,ONE_COST],['cards-pull-three',3,THREE_COST],['cards-pull-five',5,FIVE_COST],['cards-pull-ten',10,TEN_COST]]) {
      const button=$(id);
      if(button){
        button.disabled=state.tokens<cost;
        button.setAttribute('aria-label','Open '+count+' card'+(count===1?'':'s')+' for '+cost+' Tokens');
        const costLabel=button.querySelector('[data-pull-cost]');
        if(costLabel) costLabel.textContent='✦ '+cost;
        else button.textContent='Open '+count+' · '+cost+' tokens';
      }
    }
    const pullsLeft=Math.max(0,LEGENDARY_PITY-state.sinceLegendary);
    const pity=$('cards-pity-count'); if(pity)pity.textContent=String(pullsLeft);
    const pityBar=$('cards-pity-progress'); if(pityBar)pityBar.style.width=(Math.min(LEGENDARY_PITY,state.sinceLegendary)/LEGENDARY_PITY*100)+'%';
    const upgradeHint=$('cards-upgrade-balance');if(upgradeHint)upgradeHint.textContent='Upgrade a collected card for '+UPGRADE_COST+' shards · '+MAX_CARD_LEVEL+' levels max';
    renderHistory();
  };
  // Roll rarity first, then choose within that rarity. Otherwise a rarity with
  // many cards accidentally becomes more common just because its catalog is larger.
  const rarityWeight = {Common:58,Uncommon:25,Rare:12,Epic:4,Legendary:1};
  const chooseCard = (pack='mixed') => {
    const all=data();
    const cards=pack==='mixed'?all:all.filter(card=>card.category===pack);
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
  const renderHistory = () => {const root=$('cards-history-list');if(!root)return;root.innerHTML=state.history.length?state.history.map(item=>'<li><span class="cards-history-mark">'+(item.kind==='upgrade'?'✧':item.kind==='achievement'?'✓':'✦')+'</span><div><strong>'+esc(item.title)+'</strong><small>'+esc(item.detail||'')+'</small></div></li>').join(''):'<li class="cards-history-empty">Your discoveries and upgrades will appear here.</li>';};
  const renderGallery = () => {
    const root=$('cards-gallery'); if(!root)return;
    const cards=data().filter(c=>(Number(state.owned[c.id])||0)>0);
    root.innerHTML=cards.length?cards.map(c=>cardMarkup(c,Number(state.owned[c.id])||0)).join(''):'<div class="cards-empty"><span>✦</span><h3>Your collection starts here</h3><p>Open your first pack to discover a character. Collected cards stay here.</p><button type="button" class="btn btn-primary" data-view="summon">Explore packs</button></div>';
    root.querySelectorAll('[data-cards-tab]').forEach(b=>b.addEventListener('click',()=>switchTab('summon')));
    root.querySelectorAll('[data-card-upgrade]').forEach(button=>button.addEventListener('click',()=>upgradeCard(button.dataset.cardUpgrade)));
    const count=$('cards-collection-count'); if(count) count.textContent=cards.length+' / '+data().length+' discovered';
  };
  const showResults = (cards, title) => {
    const modal=$('cards-reveal-modal'), body=$('cards-reveal-results'), heading=$('cards-reveal-title');
    if(!modal||!body)return;
    if(heading)heading.textContent=title;
    const tierRank={Common:0,Uncommon:1,Rare:2,Epic:3,Legendary:4};
    const highestTier=cards.reduce((best,card)=>Math.max(best,tierRank[card.rarity]??0),0);
    modal.dataset.revealTier=Object.keys(tierRank).find(rarity=>tierRank[rarity]===highestTier)?.toLowerCase()||'common';
    modal.dataset.resultCount=String(cards.length);
    body.innerHTML=cards.map((c,i)=>'<div class="reveal-result rarity-'+c.rarity.toLowerCase()+'" style="--reveal-delay:'+Math.min(i,9)*65+'ms">'+cardArt(c,true)+'<div><strong>'+esc(c.name)+'</strong><span>'+esc(c.rarity)+(c.duplicate?' · Duplicate → +2 shards':'')+'</span></div></div>').join('');
    modal.hidden=false; document.body.classList.add('cards-modal-open');
    const close=$('cards-reveal-close'); if(close)close.focus();
    updateCounts(); renderGallery(); save();
  };
  const closeResults = () => { const m=$('cards-reveal-modal'); if(m){m.hidden=true;delete m.dataset.revealTier;delete m.dataset.resultCount;} document.body.classList.remove('cards-modal-open'); };
  const upgradeCard = (id) => {const card=data().find(c=>c.id===id);if(!card||(Number(state.owned[id])||0)<1)return;const level=Math.max(1,Number(state.cardLevels[id])||1);if(level>=MAX_CARD_LEVEL||state.shards<UPGRADE_COST)return;state.shards-=UPGRADE_COST;state.cardLevels[id]=level+1;addHistory({kind:'upgrade',title:card.name+' upgraded',detail:'Level '+level+' → '+(level+1)+' · −'+UPGRADE_COST+' shards'});save();updateCounts();renderGallery();};
  const checkAchievementRewards = (achievements) => {if(!achievements||typeof achievements!=='object')return;for(const reward of ACHIEVEMENT_REWARDS){if(!state.achievementRewards[reward.id]&&reward.test(achievements)){state.achievementRewards[reward.id]=true;state.tokens+=reward.tokens;addHistory({kind:'achievement',title:'Achievement reward: '+reward.label,detail:'+'+reward.tokens+' tokens'});}}save();updateCounts();};
  const grantAdminTestTokens = (email) => {
    const normalized=String(email||'').trim().toLowerCase();
    if(!normalized||state.adminGrantFor===normalized)return;
    state.tokens=Math.max(state.tokens,ADMIN_TEST_TOKENS);
    state.adminGrantFor=normalized;
    save();updateCounts();
  };
  const pull = (count, free=false, pack='characters') => {
    if(![1,3,5,10].includes(count))return;
    if(free){if(state.dailyDate===today())return;state.dailyDate=today();}
    else {const cost=({1:ONE_COST,3:THREE_COST,5:FIVE_COST,10:TEN_COST})[count];if(state.tokens<cost)return;state.tokens-=cost;}
    const results=[];
    for(let i=0;i<count;i++){
      const available=pack==='mixed'?data():data().filter(card=>card.category===pack);
      let card=null;
      if(state.sinceLegendary>=LEGENDARY_PITY-1)card=chooseRarityCard(available,'Legendary');
      if(!card)card=chooseCard(pack);
      if(!card)continue;
      if(card.rarity==='Legendary')state.sinceLegendary=0;else state.sinceLegendary++;
      results.push(award(card));
    }
    const packNames={characters:'Character pack',words:'Word & phrase pack',artifacts:'Artifact pack',mixed:'Mixed pack'};
    const title=free?'Your daily discovery':count+'-card '+(packNames[pack]||'Mixed pack');
    addHistory({kind:'pull',title,detail:results.map(card=>card.name+(card.duplicate?' (duplicate)':'')).join(', ')||'No cards available'});
    showResults(results,title);
  };
  const selectedPack = () => document.querySelector('[data-card-pack].is-active')?.dataset.cardPack || 'characters';
  function switchTab(tab) {
    document.querySelectorAll('[data-cards-panel]').forEach(p=>p.hidden=p.dataset.cardsPanel!==tab);
    document.querySelectorAll('[data-cards-tab]').forEach(b=>{const active=b.dataset.cardsTab===tab;b.classList.toggle('is-active',active);if(b.matches('button'))b.setAttribute('aria-pressed',String(active));});
    if(tab==='collection')renderGallery();
  }
  const init = () => {
    if(!$('cards-hub'))return;
    document.querySelectorAll('[data-cards-tab]').forEach(b=>b.addEventListener('click',()=>switchTab(b.dataset.cardsTab)));
    $('cards-daily-pull')?.addEventListener('click',()=>pull(1,true));
    $('cards-pull-one')?.addEventListener('click',()=>pull(1,false,selectedPack()));
    $('cards-pull-three')?.addEventListener('click',()=>pull(3,false,selectedPack()));
    $('cards-pull-five')?.addEventListener('click',()=>pull(5,false,selectedPack()));
    $('cards-pull-ten')?.addEventListener('click',()=>pull(10,false,selectedPack()));
    document.querySelectorAll('[data-card-pack]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('[data-card-pack]').forEach(item=>{const active=item===button;item.classList.toggle('is-active',active);item.setAttribute('aria-pressed',String(active));});const label=$('cards-pack-selected');if(label)label.textContent=button.dataset.cardPackLabel||button.textContent.trim();const art=$('cards-pack-art');if(art){art.dataset.pack=button.dataset.cardPack;art.setAttribute('aria-label','Selected collectible pack: '+(button.dataset.cardPackLabel||button.textContent.trim()));}const badge=$('cards-pack-type');if(badge)badge.textContent=(button.dataset.cardPackLabel||button.textContent.trim()).toUpperCase();}));
    $('cards-reveal-close')?.addEventListener('click',closeResults);
    $('cards-reveal-modal')?.addEventListener('click',e=>{if(e.target===$('cards-reveal-modal'))closeResults();});
    document.addEventListener('keydown',e=>{if(e.key==='Escape')closeResults();});
    const first=data()[0]; const featured=$('cards-featured-card');
    if(first&&featured)featured.innerHTML=cardMarkup(first,Number(state.owned[first.id])||0,true);
    renderGallery();updateCounts();switchTab('collection');
    $('cards-history-clear')?.addEventListener('click',()=>{state.history=[];save();renderHistory();});
    window.addEventListener('epiphany:achievements-updated',()=>checkAchievementRewards(window.EPIPHANY_PROFILE_ACHIEVEMENTS));
    if(window.EPIPHANY_PROFILE_ACHIEVEMENTS)checkAchievementRewards(window.EPIPHANY_PROFILE_ACHIEVEMENTS);
    const adminEmail=window.EpiphanyAuth?.getDeveloperEmail?.();
    if(adminEmail)grantAdminTestTokens(adminEmail);
    save();
  };
  document.addEventListener('epiphany-auth-changed',event=>{if(event.detail?.isDeveloper&&event.detail?.email)grantAdminTestTokens(event.detail.email);});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
  window.EpiphanyCards={getState:()=>({...state,owned:{...state.owned},cardLevels:{...state.cardLevels},history:[...state.history]}),awardAchievementTokens:(amount=5)=>{const n=Math.max(0,Math.floor(Number(amount)||0));state.tokens+=n;save();updateCounts();return state.tokens;}};
})();