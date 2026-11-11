/* EPIPHANY Card Image Editor — developer-only framing controls for character card portraits. */
(() => {
  'use strict';
  const TABLE='epiphany_card_image_views';
  const $=id=>document.getElementById(id);
  const root=()=>$('card-image-editor');
  const client=()=>window.EpiphanyAuth?.getAssetManagerClient?.()||null;
  const isDeveloper=()=>!!window.EpiphanyAuth?.isDeveloper?.();
  const cards=()=>Array.isArray(window.EPIPHANY_CARD_DATA)?window.EPIPHANY_CARD_DATA.filter(card=>card?.id&&card.category==='characters'):[];
  const clamp=(value,min,max)=>Math.max(min,Math.min(max,Number(value)));
  const defaults=()=>({position_x:50,position_y:32,zoom:1,fit:'cover'});
  let selectedId='', settings={}, draft=defaults(), dirty=false, dragging=null, busy=false;
  const setStatus=(message,kind='info')=>{const el=$('card-image-editor-status');if(el){el.textContent=message;el.dataset.state=kind;}};
  const currentCard=()=>cards().find(card=>card.id===selectedId)||null;
  const safeView=value=>({
    position_x:clamp(value?.position_x??50,0,100),
    position_y:clamp(value?.position_y??32,0,100),
    zoom:clamp(value?.zoom??1,.5,2),
    fit:value?.fit==='contain'?'contain':'cover'
  });
  function imageUrl(card){
    const published=window.EPIPHANY_CARD_ASSET_MAP?.[card.id],base=window.EPIPHANY_SUPABASE_CONFIG?.url;
    if(published?.published_bucket&&published?.published_thumbnail_path&&base)
      return base.replace(/\/$/,'')+'/storage/v1/object/public/'+encodeURIComponent(published.published_bucket)+'/'+String(published.published_thumbnail_path).split('/').map(encodeURIComponent).join('/');
    if(!base)return '';
    const raw=card.thumb||card.image;if(!raw)return '';
    const filename=String(raw).split('/').pop().replace(/[^A-Za-z0-9._-]/g,ch=>'-u'+ch.codePointAt(0).toString(16)+'-').replace(/-+/g,'-').replace(/^-|-$/g,'');
    return base.replace(/\/$/,'')+'/storage/v1/object/public/character-art/'+(card.thumb?'thumbs/':'originals/')+encodeURIComponent(filename);
  }
  function renderOptions(){
    const select=$('card-image-editor-character'),query=String($('card-image-editor-search')?.value||'').trim().toLocaleLowerCase();
    if(!select)return;
    const list=cards().filter(card=>[card.name,card.id,window.EPIPHANY_CARD_PROFILES?.[card.id]?.name?.ar].some(value=>String(value||'').toLocaleLowerCase().includes(query)));
    select.innerHTML='<option value="">Choose a character…</option>'+list.map(card=>'<option value="'+String(card.id).replace(/[&<>"]/g,'')+'">'+String(card.name||card.id).replace(/[&<>"]/g,'')+' · '+String(card.id).replace(/[&<>"]/g,'')+'</option>').join('');
    if(selectedId&&list.some(card=>card.id===selectedId))select.value=selectedId;
  }
  function renderDraft(){
    const stage=$('card-image-editor-stage'),image=$('card-image-editor-preview'),zoom=$('card-image-editor-zoom'),output=$('card-image-editor-zoom-value');
    if(stage){stage.style.setProperty('--preview-x',draft.position_x+'%');stage.style.setProperty('--preview-y',draft.position_y+'%');stage.style.setProperty('--preview-zoom',draft.zoom);stage.style.setProperty('--preview-fit',draft.fit);}
    if(image){image.style.objectPosition=draft.position_x+'% '+draft.position_y+'%';image.style.objectFit=draft.fit;image.style.transform='scale('+draft.zoom+')';}
    if(zoom)zoom.value=String(Math.round(draft.zoom*100));
    if(output)output.textContent=Math.round(draft.zoom*100)+'%';
    root()?.classList.toggle('has-unsaved-changes',dirty);
  }
  function loadSelected(){
    const card=currentCard(),image=$('card-image-editor-preview'),stage=$('card-image-editor-stage');
    draft=safeView(settings[selectedId]);dirty=false;renderDraft();
    if(!card){if(image){image.removeAttribute('src');image.hidden=true;}if(stage)stage.classList.add('is-empty');return;}
    const url=imageUrl(card);
    if(image&&url){image.src=url;image.hidden=false;}else if(image){image.removeAttribute('src');image.hidden=true;}
    if(stage)stage.classList.toggle('is-empty',!url);
    if(image){image.onerror=()=>{image.hidden=true;stage?.classList.add('is-empty');setStatus('The current character image could not be loaded. Check its artwork reference first.','error');};image.onload=()=>{image.hidden=false;stage?.classList.remove('is-empty');};}
    setStatus(dirty?'Unsaved changes.':'Adjust the portrait, then save your changes.');
  }
  async function loadSettings(){
    const host=root(),loader=window.EpiphanyAuth?.loadCardImageViews;
    if(!loader){if(isDeveloper())setStatus('The shared image settings service is not available yet.','error');return;}
    if(host)host.hidden=!isDeveloper();
    if(isDeveloper())setStatus('Loading saved image framing…');
    const data=await loader();
    settings=Object.fromEntries((data||[]).map(row=>[row.character_id,safeView(row)]));
    window.EPIPHANY_CARD_IMAGE_VIEWS=settings;
    renderOptions();
    const select=$('card-image-editor-character');
    if(!selectedId)selectedId=cards()[0]?.id||'';
    if(select)select.value=selectedId;
    loadSelected();
    window.dispatchEvent(new CustomEvent('epiphany:card-image-views-updated'));
    if(isDeveloper())setStatus(cards().length+' character portraits ready.','success');
  }
  function updateDraft(patch){draft=safeView({...draft,...patch});dirty=true;renderDraft();setStatus('Unsaved changes. Save to publish this framing.');}
  async function save(){
    if(busy)return;
    const card=currentCard(),api=client();
    if(!isDeveloper()||!api||!card){setStatus('Choose a character while signed in with developer access.','error');return;}
    busy=true;const button=$('card-image-editor-save');if(button)button.disabled=true;
    try{
      const payload={character_id:card.id,position_x:Number(draft.position_x.toFixed(2)),position_y:Number(draft.position_y.toFixed(2)),zoom:Number(draft.zoom.toFixed(3)),fit:draft.fit,updated_at:new Date().toISOString()};
      const {data,error}=await api.from(TABLE).upsert(payload,{onConflict:'character_id'}).select('character_id,position_x,position_y,zoom,fit').single();
      if(error)throw error;
      settings[card.id]=safeView(data);window.EPIPHANY_CARD_IMAGE_VIEWS=settings;draft=safeView(data);dirty=false;renderDraft();
      window.dispatchEvent(new CustomEvent('epiphany:card-image-views-updated'));
      setStatus('Image framing saved and published for all players.','success');
    }catch(error){setStatus((error?.message||'Could not save image framing.')+' The previous published framing remains unchanged.','error');}
    finally{busy=false;if(button)button.disabled=false;}
  }
  function reset(){updateDraft(defaults());}
  function autoFit(){updateDraft({position_x:50,position_y:50,zoom:1,fit:'contain'});}
  function bind(){
    $('card-image-editor-character')?.addEventListener('change',event=>{if(dirty&&!window.confirm('Discard unsaved image framing changes?')){event.target.value=selectedId;return;}selectedId=event.target.value;loadSelected();});
    $('card-image-editor-search')?.addEventListener('input',renderOptions);
    $('card-image-editor-zoom')?.addEventListener('input',event=>updateDraft({zoom:Number(event.target.value)/100}));
    $('card-image-editor-auto')?.addEventListener('click',autoFit);
    $('card-image-editor-reset')?.addEventListener('click',reset);
    $('card-image-editor-save')?.addEventListener('click',save);
    const stage=$('card-image-editor-stage');
    stage?.addEventListener('pointerdown',event=>{if(!currentCard()||!$('card-image-editor-preview')?.naturalWidth)return;dragging={id:event.pointerId,x:event.clientX,y:event.clientY,px:draft.position_x,py:draft.position_y,rect:stage.getBoundingClientRect()};stage.setPointerCapture?.(event.pointerId);});
    stage?.addEventListener('pointermove',event=>{if(!dragging||dragging.id!==event.pointerId)return;updateDraft({position_x:clamp(dragging.px+(event.clientX-dragging.x)/dragging.rect.width*100,0,100),position_y:clamp(dragging.py+(event.clientY-dragging.y)/dragging.rect.height*100,0,100)});});
    const stop=event=>{if(dragging&&dragging.id===event.pointerId)dragging=null;};
    stage?.addEventListener('pointerup',stop);stage?.addEventListener('pointercancel',stop);
    window.addEventListener('epiphany:published-assets-updated',()=>{if(currentCard())loadSelected();});
    window.addEventListener('epiphany:supabase-ready',()=>loadSettings().catch(error=>setStatus(error.message,'error')));
    document.addEventListener('epiphany-auth-changed',()=>loadSettings().catch(error=>setStatus(error.message,'error')));
  }
  function init(){
    if(!root())return;bind();renderOptions();
    loadSettings().catch(error=>setStatus((error?.message||'Could not load saved image framing.'),'error'));
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();