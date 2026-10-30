/* EPIPHANY Artwork Manager — one-step, developer-only image replacement. */
(() => {
  'use strict';
  const PRIVATE_BUCKET='epiphany-assets-private',PUBLIC_BUCKET='epiphany-assets',MAX_BYTES=12*1024*1024;
  const MIME_TYPES=new Set(['image/png','image/jpeg','image/webp']);
  const $=id=>document.getElementById(id),root=()=>$('artwork-manager');
  let characters=[],cloudAssets=[],usages=[],busy=false,selectedPreviewUrl='';
  const client=()=>window.EpiphanyAuth?.getAssetManagerClient?.()||null;
  const activeUser=()=>window.EpiphanyAuth?.getAssetManagerUser?.()||null;
  const isDeveloper=()=>!!window.EpiphanyAuth?.isDeveloper?.();
  const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const extensionFor=mime=>mime==='image/jpeg'?'jpg':mime==='image/webp'?'webp':'png';

  function setStatus(message,kind='info'){
    const node=$('artwork-manager-status');if(!node)return;
    node.textContent=message;node.dataset.state=kind;
  }
  function setBusy(value){
    busy=!!value;const button=$('artwork-replace-submit');
    if(button){button.disabled=busy;button.textContent=busy?'Replacing artwork…':'Replace artwork';}
    root()?.classList.toggle('is-busy',busy);
  }
  function characterData(){
    const cards=Array.isArray(window.EPIPHANY_CARD_DATA)?window.EPIPHANY_CARD_DATA:[];
    const profiles=window.EPIPHANY_CARD_PROFILES||{};
    return cards.filter(card=>card?.id&&card.category==='characters').map(card=>{
      const profile=profiles[card.id]||{};
      return {id:String(card.id),name:String(profile.name?.en||card.name||card.id),arabic:String(profile.name?.ar||''),title:String(card.title||''),image:String(card.image||''),thumb:String(card.thumb||'')};
    }).sort((a,b)=>a.name.localeCompare(b.name));
  }
  function publishedUsagesForAsset(assetId){return usages.filter(item=>item.asset_id===assetId&&item.is_published);}
  function targetKind(){return $('artwork-target-kind')?.value||'character';}
  function targetList(){return targetKind()==='asset'?cloudAssets:characters;}
  function selectedTarget(){const id=$('artwork-target-select')?.value||'';return targetList().find(item=>item.id===id)||null;}
  function renderTargetOptions(){
    const select=$('artwork-target-select'),query=String($('artwork-target-search')?.value||'').trim().toLocaleLowerCase();
    if(!select)return;
    const previous=select.value;
    const matches=targetList().filter(item=>{
      const values=targetKind()==='asset'?[item.original_name,item.category,item.id]:[item.name,item.arabic,item.title,item.id];
      return !query||values.some(value=>String(value||'').toLocaleLowerCase().includes(query));
    });
    select.innerHTML='<option value="">Choose…</option>'+matches.map(item=>{
      const label=targetKind()==='asset'?item.original_name+' · '+item.category+' · '+publishedUsagesForAsset(item.id).length+' links':item.name+(item.arabic?' · '+item.arabic:'')+(item.title?' — '+item.title:'');
      return '<option value="'+escapeHtml(item.id)+'">'+escapeHtml(label)+'</option>';
    }).join('');
    if(matches.some(item=>item.id===previous))select.value=previous;
    renderTargetPreview();
  }
  function publicUrl(bucket,path){return bucket&&path?client()?.storage?.from(bucket).getPublicUrl(path).data?.publicUrl||'':'';}
  function legacyCharacterUrl(card){
    const base=window.EPIPHANY_SUPABASE_CONFIG?.url,raw=card.thumb||card.image;
    if(!base||!raw)return '';
    const filename=String(raw).split('/').pop().replace(/[^A-Za-z0-9._-]/g,ch=>'-u'+ch.codePointAt(0).toString(16)+'-').replace(/-+/g,'-').replace(/^-|-$/g,'');
    return base.replace(/\/$/,'')+'/storage/v1/object/public/character-art/'+(card.thumb?'thumbs/':'originals/')+filename;
  }
  function currentTargetImage(target){
    if(!target)return '';
    if(targetKind()==='asset'){
      const usage=publishedUsagesForAsset(target.id)[0];
      return usage?publicUrl(usage.published_bucket,usage.published_thumbnail_path||usage.published_original_path):'';
    }
    const usage=usages.find(item=>item.owner_type==='character'&&item.owner_id===target.id&&item.role==='portrait'&&item.is_published);
    return usage?publicUrl(usage.published_bucket,usage.published_thumbnail_path||usage.published_original_path):legacyCharacterUrl(target);
  }
  function renderTargetPreview(){
    const target=selectedTarget(),image=$('artwork-current-image'),empty=$('artwork-current-empty');
    const name=$('artwork-current-name'),note=$('artwork-current-note');
    if(!target){
      if(image){image.hidden=true;image.removeAttribute('src');}
      if(empty)empty.hidden=false;
      if(name)name.textContent='No item selected';
      if(note)note.textContent='Choose an item to see its current artwork.';
      return;
    }
    const url=currentTargetImage(target);
    if(image&&url){image.src=url;image.hidden=false;}else if(image){image.hidden=true;image.removeAttribute('src');}
    if(empty)empty.hidden=!!url;
    if(name)name.textContent=targetKind()==='asset'?target.original_name:target.name;
    if(note)note.textContent=targetKind()==='asset'?'This replaces the image for all '+publishedUsagesForAsset(target.id).length+' published references to this library asset.':target.id+' · Character portrait';
  }
  async function loadTargets(){
    const host=root();if(!host)return;
    if(!isDeveloper()||!client()||!activeUser()?.id){host.hidden=true;setStatus('Developer access required.');return;}
    host.hidden=false;setStatus('Loading characters and published cloud assets…');characters=characterData();
    const api=client();
    const [assetResult,usageResult]=await Promise.all([
      api.from('epiphany_assets').select('*').order('created_at',{ascending:false}).limit(500),
      api.from('epiphany_asset_usages').select('asset_id,owner_type,owner_id,role,is_published,published_bucket,published_original_path,published_thumbnail_path').limit(1500)
    ]);
    const failure=assetResult.error||usageResult.error;
    if(failure){setStatus('Could not load artwork targets: '+failure.message,'error');return;}
    usages=usageResult.data||[];
    const publishedIds=new Set(usages.filter(item=>item.is_published).map(item=>item.asset_id));
    cloudAssets=(assetResult.data||[]).filter(asset=>publishedIds.has(asset.id));
    renderTargetOptions();
    setStatus(characters.length+' characters and '+cloudAssets.length+' published cloud assets ready.','success');
  }
  function previewSelectedFile(file){
    const host=$('artwork-new-preview'),image=$('artwork-new-image'),name=$('artwork-new-name');
    if(selectedPreviewUrl)URL.revokeObjectURL(selectedPreviewUrl);selectedPreviewUrl='';
    if(!file){if(host)host.hidden=true;if(image)image.removeAttribute('src');if(name)name.textContent='';return;}
    selectedPreviewUrl=URL.createObjectURL(file);if(image)image.src=selectedPreviewUrl;
    if(name)name.textContent=file.name+' · '+(file.size/1024/1024).toFixed(2)+' MB';if(host)host.hidden=false;
  }
  function imageDimensions(file){
    return new Promise((resolve,reject)=>{
      const url=URL.createObjectURL(file),image=new Image();
      image.onload=()=>{const result={width:image.naturalWidth,height:image.naturalHeight};URL.revokeObjectURL(url);resolve(result);};
      image.onerror=()=>{URL.revokeObjectURL(url);reject(new Error('The selected file is not a readable image.'));};image.src=url;
    });
  }
  async function makeThumbnail(file,category){
    const profiles={characters:{width:560,height:560,quality:.84},stories:{width:1280,height:720,quality:.84},world:{width:1280,height:960,quality:.84},cards:{width:640,height:900,quality:.84},interface:{width:1440,height:1440,quality:.86},other:{width:640,height:640,quality:.82}};
    const profile=profiles[category]||profiles.other,bitmap=await createImageBitmap(file);
    try{
      const scale=Math.min(1,profile.width/bitmap.width,profile.height/bitmap.height),width=Math.max(1,Math.round(bitmap.width*scale)),height=Math.max(1,Math.round(bitmap.height*scale));
      const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
      const context=canvas.getContext('2d',{alpha:false});if(!context)throw new Error('Could not prepare the image thumbnail.');
      context.drawImage(bitmap,0,0,width,height);
      const blob=await new Promise((resolve,reject)=>canvas.toBlob(result=>result?resolve(result):reject(new Error('Thumbnail generation failed.')),'image/webp',profile.quality));
      const mimeType=blob.type==='image/webp'?'image/webp':'image/png';
      return {blob,width,height,mimeType,extension:mimeType==='image/webp'?'webp':'png'};
    }finally{bitmap.close?.();}
  }
  async function verifyPublicImage(url){
    if(!url)throw new Error('Could not create a public URL for the new image.');
    const response=await fetch(url,{method:'GET',headers:{Range:'bytes=0-31'},cache:'no-store'});
    const type=String(response.headers.get('content-type')||'').toLowerCase();
    if(!response.ok||!type.startsWith('image/'))throw new Error('The new cloud image could not be verified (HTTP '+response.status+').');
  }
  async function removeUploaded(api,pathsByBucket){
    const failures=[];
    for(const [bucket,paths] of pathsByBucket.entries()){
      if(!paths.length)continue;
      const {error}=await api.storage.from(bucket).remove(paths);
      if(error)failures.push(bucket+': '+error.message);
    }
    return failures;
  }
  async function replaceArtwork(event){
    event.preventDefault();if(busy)return;
    const api=client(),user=activeUser(),target=selectedTarget(),kind=targetKind(),file=$('artwork-file')?.files?.[0];
    if(!isDeveloper()||!api||!user?.id){setStatus('Sign in with an approved developer account before replacing artwork.','error');return;}
    if(!target){setStatus('Choose a character or a published cloud asset first.','error');return;}
    if(!file){setStatus('Choose the new image from your device first.','error');return;}
    if(!MIME_TYPES.has(file.type)){setStatus('Only PNG, JPG and WEBP images are accepted.','error');return;}
    if(file.size<=0||file.size>MAX_BYTES){setStatus('The image must be smaller than 12 MB.','error');return;}
    setBusy(true);
    const isNewAsset=kind==='character',assetId=isNewAsset?crypto.randomUUID():target.id,category=isNewAsset?'characters':target.category,extension=extensionFor(file.type);
    const uploaded=new Map([[PRIVATE_BUCKET,[]],[PUBLIC_BUCKET,[]]]),objectPaths=[];
    let fileRowsInserted=false,assetCreated=false,assetMetadataChanged=false,committed=false,oldMetadata=null;
    try{
      setStatus('Preparing image and thumbnail…');
      const size=await imageDimensions(file),thumbnail=await makeThumbnail(file,category);
      const versionFolder=category+'/'+assetId+'/'+crypto.randomUUID()+'/',originalPath=versionFolder+'original.'+extension,thumbnailPath=versionFolder+'thumbnail.'+thumbnail.extension;
      const privateOriginal='published/'+originalPath,privateThumbnail='published/'+thumbnailPath;
      objectPaths.push(originalPath,thumbnailPath,privateOriginal,privateThumbnail);
      if(isNewAsset){
        const {error}=await api.from('epiphany_assets').insert({
          id:assetId,asset_type:'image',category,original_name:file.name.slice(0,255),mime_type:file.type,size_bytes:file.size,
          width:size.width,height:size.height,status:'linked',created_by:user.id,metadata:{source:'artwork-manager',target_character:target.id}
        });
        if(error)throw error;assetCreated=true;
      }
      setStatus('Uploading original and thumbnail…');
      const uploads=[
        [PRIVATE_BUCKET,privateOriginal,file,file.type],[PRIVATE_BUCKET,privateThumbnail,thumbnail.blob,thumbnail.mimeType],
        [PUBLIC_BUCKET,originalPath,file,file.type],[PUBLIC_BUCKET,thumbnailPath,thumbnail.blob,thumbnail.mimeType]
      ];
      for(const [bucket,path,body,mimeType] of uploads){
        const {error}=await api.storage.from(bucket).upload(path,body,{cacheControl:'31536000',upsert:false,contentType:mimeType});
        if(error)throw error;uploaded.get(bucket).push(path);
      }
      setStatus('Checking that the new public images load…');
      await Promise.all([verifyPublicImage(publicUrl(PUBLIC_BUCKET,originalPath)),verifyPublicImage(publicUrl(PUBLIC_BUCKET,thumbnailPath))]);
      const rows=[
        {asset_id:assetId,variant:'original',bucket_id:PRIVATE_BUCKET,object_path:privateOriginal,visibility:'private',mime_type:file.type,size_bytes:file.size,width:size.width,height:size.height},
        {asset_id:assetId,variant:'thumbnail',bucket_id:PRIVATE_BUCKET,object_path:privateThumbnail,visibility:'private',mime_type:thumbnail.mimeType,size_bytes:thumbnail.blob.size,width:thumbnail.width,height:thumbnail.height},
        {asset_id:assetId,variant:'original',bucket_id:PUBLIC_BUCKET,object_path:originalPath,visibility:'public',mime_type:file.type,size_bytes:file.size,width:size.width,height:size.height},
        {asset_id:assetId,variant:'thumbnail',bucket_id:PUBLIC_BUCKET,object_path:thumbnailPath,visibility:'public',mime_type:thumbnail.mimeType,size_bytes:thumbnail.blob.size,width:thumbnail.width,height:thumbnail.height}
      ];
      const {error:fileError}=await api.from('epiphany_asset_files').insert(rows);
      if(fileError)throw fileError;fileRowsInserted=true;
      if(!isNewAsset){
        oldMetadata={original_name:target.original_name,mime_type:target.mime_type,size_bytes:target.size_bytes,width:target.width,height:target.height,status:target.status,metadata:target.metadata||{}};
        const {error}=await api.from('epiphany_assets').update({
          original_name:file.name.slice(0,255),mime_type:file.type,size_bytes:file.size,width:size.width,height:size.height,
          status:'published',metadata:{...(target.metadata||{}),last_replaced_at:new Date().toISOString()}
        }).eq('id',assetId);
        if(error)throw error;assetMetadataChanged=true;
      }else{
        const {error}=await api.from('epiphany_assets').update({status:'published'}).eq('id',assetId);
        if(error)throw error;
      }
      setStatus('Updating the game artwork reference…');
      if(isNewAsset){
        const {data:publishedRows,error:lookupError}=await api.from('epiphany_asset_usages')
          .select('id')
          .eq('owner_type','character')
          .eq('owner_id',target.id)
          .eq('role','portrait')
          .eq('is_published',true)
          .limit(1);
        if(lookupError)throw lookupError;
        const publication={
          asset_id:assetId,is_published:true,published_bucket:PUBLIC_BUCKET,
          published_original_path:originalPath,published_thumbnail_path:thumbnailPath
        };
        if(publishedRows?.length){
          const {data,error}=await api.from('epiphany_asset_usages')
            .update(publication).eq('id',publishedRows[0].id).select('id');
          if(error)throw error;
          if(!data?.length)throw new Error('The existing published character reference could not be updated. Reload and try again.');
        }else{
          const {error}=await api.from('epiphany_asset_usages').insert({
            ...publication,owner_type:'character',owner_id:target.id,role:'portrait',created_by:user.id
          });
          if(error)throw error;
        }
      }else{
        const {data,error}=await api.from('epiphany_asset_usages').update({
          published_bucket:PUBLIC_BUCKET,published_original_path:originalPath,published_thumbnail_path:thumbnailPath
        }).eq('asset_id',assetId).eq('is_published',true).select('id');
        if(error)throw error;if(!data?.length)throw new Error('This cloud asset no longer has a published reference. Reload the list and try again.');
      }
      committed=true;
      $('artwork-replace-form')?.reset();previewSelectedFile(null);
      window.dispatchEvent(new CustomEvent('epiphany:published-assets-updated'));
      try{await loadTargets();const select=$('artwork-target-select');if(select)select.value=target.id;renderTargetPreview();}catch{}
      setStatus('Artwork replaced and published successfully. The previous image is still preserved.','success');
    }catch(error){
      if(!committed){
        const cleanupFailures=await removeUploaded(api,uploaded);
        if(fileRowsInserted&&!cleanupFailures.length)await api.from('epiphany_asset_files').delete().eq('asset_id',assetId).in('object_path',objectPaths);
        if(assetMetadataChanged&&oldMetadata)await api.from('epiphany_assets').update(oldMetadata).eq('id',assetId);
        if(assetCreated){
          if(cleanupFailures.length)await api.from('epiphany_assets').update({status:'issue',metadata:{source:'artwork-manager',cleanup_errors:cleanupFailures}}).eq('id',assetId);
          else await api.from('epiphany_assets').delete().eq('id',assetId);
        }
        const suffix=cleanupFailures.length?' Some temporary files need developer review: '+cleanupFailures.join(' · '):' The previous published image was not changed.';
        setStatus((error?.message||'Image replacement failed.')+suffix,'error');
      }
    }finally{setBusy(false);}
  }
  function init(){
    if(!root())return;
    $('artwork-target-kind')?.addEventListener('change',()=>{if($('artwork-target-search'))$('artwork-target-search').value='';renderTargetOptions();});
    $('artwork-target-search')?.addEventListener('input',renderTargetOptions);
    $('artwork-target-select')?.addEventListener('change',renderTargetPreview);
    $('artwork-file')?.addEventListener('change',event=>previewSelectedFile(event.target.files?.[0]||null));
    $('artwork-replace-form')?.addEventListener('submit',replaceArtwork);
    document.addEventListener('epiphany-auth-changed',()=>loadTargets().catch(error=>setStatus(error.message,'error')));
    loadTargets().catch(error=>setStatus(error.message,'error'));
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();