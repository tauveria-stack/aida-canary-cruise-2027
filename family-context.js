/* Inline visual context for family vote questions. Content comes from our own site. */
(() => {
 'use strict';
 const gran=document.getElementById('gran-votes');
 const whale=document.getElementById('whale-votes');
 if(!gran||!whale)return;
 const style=document.createElement('style');
 style.textContent='.survey-explain{background:#f5f9fa;border:1px solid #d7e7eb;border-radius:12px;padding:13px;margin:15px 0}.survey-explain .grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.survey-explain article{border:1px solid #dce8eb;background:#fff;border-radius:12px;padding:12px;min-width:0}.survey-explain h3{font-size:17px;margin:8px 0}.survey-explain p{line-height:1.5;font-size:14px}.survey-explain a{color:#076d79}.survey-explain figure{margin:8px 0}.survey-explain img{display:block;width:100%;aspect-ratio:16/10;object-fit:cover;border-radius:8px;background:#e3edf0}.survey-explain figcaption{font-size:11px;line-height:1.4;color:#52697b}.survey-explain small{font-size:11px;color:#52697b}@media(max-width:550px){.survey-explain .grid{grid-template-columns:1fr}}';
 document.head.append(style);
 function reorderDunesFirst(){
  const first=gran.querySelector('input[type="radio"]');
  if(!first||first.value==='dunes')return;
  const target=gran.querySelector('input[value="dunes"]');
  if(target&&target.closest('.vote'))gran.prepend(target.closest('.vote'));
 }
 const observer=new MutationObserver(reorderDunesFirst);
 observer.observe(gran,{childList:true});
 async function init(){
  try{
   const response=await fetch('family-choices-guide.html',{cache:'no-cache'});
   if(!response.ok)throw new Error('Guide unavailable');
   const html=await response.text();
   const doc=new DOMParser().parseFromString(html,'text/html');
   const sections=[...doc.body.querySelectorAll(':scope > section')];
   if(sections.length<2)throw new Error('Guide sections missing');
   for(const [i,target] of [[0,gran],[1,whale]]){
    const wrap=document.createElement('div');wrap.className='survey-explain';
    const copy=sections[i].cloneNode(true);
    const heading=copy.querySelector('h2');if(heading)heading.remove();
    wrap.append(...Array.from(copy.childNodes));
    target.before(wrap);
   }
  }catch(_){
   for(const target of [gran,whale]){
    const p=document.createElement('p');p.className='muted';
    p.textContent='Не вдалося завантажити ілюстрації. Можна переглянути коротке пояснення окремо: ';
    const a=document.createElement('a');a.href='family-choices-guide.html';a.textContent='пояснення та фото';
    p.append(a);target.before(p);
   }
  }
 }
 void init();
})();