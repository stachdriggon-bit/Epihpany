const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');

test('card image editor exposes drag, zoom, auto-fit, reset and shared save controls',()=>{
  const html=read('index.html'),js=read('card-image-editor.js');
  for(const id of ['card-image-editor-stage','card-image-editor-zoom','card-image-editor-auto','card-image-editor-reset','card-image-editor-save'])assert.match(html,new RegExp('id="'+id+'"'));
  for(const feature of ['pointerdown','pointermove','position_x','position_y','zoom','fit','upsert','epiphany:card-image-views-updated'])assert.ok(js.includes(feature),feature+' should be implemented');
});

test('card image framing is applied to character portrait markup without changing source images',()=>{
  const cards=read('cards.js'),css=read('cards.css');
  assert.match(cards,/EPIPHANY_CARD_IMAGE_VIEWS/);
  assert.match(cards,/data-card-image-id/);
  assert.match(css,/object-fit:var\(--card-image-fit,cover\)/);
  assert.match(css,/--card-image-zoom/);
});
