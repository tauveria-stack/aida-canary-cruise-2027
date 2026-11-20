/* AIDAcosma family survey entry: no tracking, no authentication, no API calls. */
(() => {
 'use strict';
 const ENTRY='family.html';
 const STORAGE='aida-family-survey-v2';
 const DECLINED='aida-family-invite-declined-v1';
 const NAMES={volodymyr:'Володимир',yevheniia:'Євгенія',valerii:'Валерій',tymofii:'Тимофій'};
 const INTEREST_IDS=['nature','panorama','mountains','rural','seascape','beach','animals','whales','waterparks','rides','cable','museums','towns','food','quiet','active','walking','boat'];
 const VALID={gran:['mountains','dunes','unsure'],whale:['yes','maybe','no']};
 const header=document.querySelector('header');
 const shell=document.querySelector('main.shell');
 const tabs=document.getElementById('tabs');
 if(!header||!shell||!tabs)return;
 const read=(store,key)=>{try{return store.getItem(key)}catch(_){return null}};
 const write=(store,key,val)=>{try{store.setItem(key,val)}catch(_){}};
 const storage=()=>{try{const v=JSON.parse(read(localStorage,STORAGE)||'null');return v&&v.version===2?v:null}catch(_){return null}};
 function state(){
  const v=storage(),person=v&&Object.prototype.hasOwnProperty.call(NAMES,v.lastPerson)?v.lastPerson:'';
  const p=person&&v.profiles&&v.profiles[person];
  const d=p&&p.data;
  const interests=d&&d.interests||{};
  const votes=d&&d.votes||{};
  const total=INTEREST_IDS.filter(id=>[0,1,2].includes(interests[id])).length;
  const voted=Object.keys(VALID).filter(id=>votes[id]&&VALID[id].includes(votes[id].choice)).length;
  return {person,name:NAMES[person]||'',complete:!!(person&&total===INTEREST_IDS.length&&voted===2),started:!!(person&&(total||voted)),total,voted};
 }
 const styles=document.createElement('style');
 styles.textContent='.family-toplink{display:inline-flex;align-items:center;border:1px solid #b9eded;border-radius:999px;padding:9px 14px;color:#fff;background:#ffffff20;text-decoration:none;font-weight:700;margin:12px 0 0}.family-toplink:hover{background:#ffffff35}.family-banner{display:flex;justify-content:space-between;gap:12px;align-items:center;padding:16px 18px;margin:14px 0;background:#fff;border:1px solid #cce3e5;border-radius:14px;box-shadow:0 2px 10px #123e560b}.family-banner h2{font-size:19px;margin:0 0 5px}.family-banner p{font-size:14px;color:#466171;margin:0;line-height:1.5}.family-actions{display:flex;gap:8px;flex-wrap:wrap}.family-actions a{display:inline-block;padding:11px 14px;background:#126d76;color:white;text-decoration:none;border-radius:10px;font-weight:700;white-space:nowrap}.family-actions button{padding:10px 12px;background:white;border:1px solid #bed0d8;border-radius:10px;color:#17324a;cursor:pointer}.family-compact{margin:12px 0;font-size:14px;color:#466171}.family-compact a{font-weight:650}@media(max-width:650px){.family-banner{align-items:stretch;flex-direction:column}.family-actions{width:100%}.family-actions a{flex:1;text-align:center}}';
 document.head.append(styles);
 const top=document.createElement('a');top.className='family-toplink';top.href=ENTRY;top.textContent='♡ Сімейна анкета';
 header.append(top);
 const area=document.createElement('div');area.id='family-entry';area.setAttribute('aria-live','polite');tabs.after(area);
 const safe=document.createElement('span');
 function render(){
  const x=state();area.replaceChildren();
  top.textContent=x.complete?'✓ Переглянути мою анкету':x.started?'♡ Продовжити анкету':'♡ Сімейна анкета';
  if(x.complete){
   const p=document.createElement('p');p.className='family-compact';
   p.append('Відповіді '+x.name+' збережені на цьому пристрої. ');
   const link=document.createElement('a');link.href=ENTRY;link.textContent='Переглянути або змінити відповіді';
   p.append(link);area.append(p);return;
  }
  const declined=read(localStorage,DECLINED);
  if(declined === (x.person||'guest'))return;
  const box=document.createElement('section');box.className='family-banner';box.setAttribute('aria-label','Запрошення до сімейної анкети');
  const copy=document.createElement('div'),heading=document.createElement('h2'),desc=document.createElement('p');
  heading.textContent=x.started?'Продовжити сімейну анкету?':'Розкажи, що цікаво тобі під час подорожі';
  desc.textContent=x.started?('Остання анкета: '+x.name+'. Твій прогрес: '+x.total+' із 18 інтересів та '+x.voted+' із 2 голосувань.'):'Оціни, які місця та активності хочеш побачити. Це допоможе родині обрати маршрут.';
  copy.append(heading,desc);
  const actions=document.createElement('div');actions.className='family-actions';
  const link=document.createElement('a');link.href=ENTRY;link.textContent=x.started?'Продовжити':'Пройти анкету';
  const decline=document.createElement('button');decline.type='button';decline.textContent='Не пропонувати';decline.addEventListener('click',()=>{write(localStorage,DECLINED,x.person||'guest');render()});
  actions.append(link,decline);box.append(copy,actions);area.append(box);
 }
 render();
 window.addEventListener('pageshow',render);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)render()});
})();