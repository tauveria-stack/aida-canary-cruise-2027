/* Contact page: branded action chips and evidence tiers. No external API calls. */
(() => {
 'use strict';
 const panel=document.getElementById('panel-contacts');
 const original=panel&&panel.querySelector('.cols');
 if(!original)return;

 const icons={
   fb:'<span class="contact-icon fb" aria-hidden="true"><span>f</span></span>',
   wa:'<span class="contact-icon wa" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M20 11.5a8.1 8.1 0 0 1-12 7.1L4 20l1.4-4a8.1 8.1 0 1 1 14.6-4.5z"/><path d="M9 8.5c.1 2.5 3.2 5.7 6.2 6.4l1.2-1.4-2.2-1.1-.9 1c-1.4-.6-2.2-1.6-2.8-2.8l.9-1-1.2-2.2z"/></svg></span>',
   site:'<span class="contact-icon site" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c-5 5-5 13 0 18M12 3c5 5 5 13 0 18"/></svg></span>',
   mail:'<span class="contact-icon mail" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></svg></span>'
 };
 const entries=[
  {name:'Canarygid · команда',area:'Фуертевентура',source:'професійний сайт',desc:'Екскурсії українською заявлені публічно. На 7 січня необхідно уточнити кінцеву вартість, транспорт для чотирьох і повернення до круїзного порту.',status:'Мова заявлена · дата й умови не підтверджені',links:[['wa','https://wa.me/34652530901','WhatsApp'],['site','https://canarygid.com/','Сайт'],['mail','mailto:anacanarygid@gmail.com','Email']]},
  {name:'SVOYA Madeira',area:'Мадейра',source:'професійний сайт',desc:'Приватні екскурсії українською заявлені на сайті. Є розбіжності у тарифах; дата 11 січня, авто й портова зустріч не підтверджені.',status:'Мова заявлена · бронювання немає',links:[['site','https://svoyamadeira.com/guide-madeira-uk','Сайт українською']]},
  {name:'Canary Mandry',area:'Канарські острови',source:'професійний сайт',desc:'Команда рекламує екскурсії та трансфери. Мову конкретного туру, острів, дату й умови треба підтвердити безпосередньо.',status:'Мова туру й дата не підтверджені',links:[['wa','https://wa.me/34642388018','WhatsApp'],['site','https://canarymandry.com/','Сайт'],['mail','mailto:oevaeva@gmail.com','Email']]},
  {name:'Diana Dragan',area:'Гран-Канарія · FB-GC-001',source:'Facebook · самопрезентація',desc:'Авторка допису 20 листопада пропонує екскурсії островом. Невідомі мова, ціна, авто для чотирьох, портове отримання та можливість 9 січня. Посилання відкриває допис, а не приватний чат.',status:'Неперевірений кандидат',links:[['fb','https://www.facebook.com/groups/4021183727931699/permalink/30302945039328876/','Facebook · допис']]},
  {name:'Yuliia Kalchenko',area:'Мадейра · FB-MD-001',source:'Facebook · коментар',desc:'У коментарях заявляє індивідуальні та групові тури, ліцензію й мінівен. Документи, місткість, мова туру, ціна та доступність 11 січня не перевірені.',status:'Неперевірений кандидат',links:[['fb','https://www.facebook.com/groups/uaguides/posts/30286352550988125/','Facebook · допис']]},
  {name:'Daniel Malysh',area:'Тенеріфе',source:'професійний сайт',desc:'На сайті заявлено українські екскурсії. Актуальні дати, портовий трансфер, місткість і кінцева вартість потребують уточнення.',status:'Пропозиція без нашого бронювання',extra:true,links:[['site','https://daniltenerife.com/ua','Сайт']]},
  {name:'Ilona Partala',area:'Тенеріфе',source:'каталог екскурсій',desc:'Є пропозиції турів українською в каталозі; незалежні відгуки, машина та наявність на наші дні не перевірені.',status:'Бронювання й умови не підтверджені',extra:true,links:[['site','https://tripvenue.com/host/ilona','Сторінка турів']]},
  {name:'Valerio the Guide',area:'Мадейра',source:'платформа турів',desc:'У лістингу вказана українська мова й формат до чотирьох осіб. Наявність саме на 11 січня та призначений гід не підтверджені.',status:'Пропозиція платформи · дата невідома',extra:true,links:[['site','https://www.getyourguide.com/funchal-l1026/madeira-private-full-day-tour-with-pick-up-t443579/','Екскурсія']]},
  {name:'Island Escape Tours',area:'Мадейра',source:'професійний сайт',desc:'Оператор заявляє українську мову і круїзні програми. Конкретний маршрут, ціна та виконавець не підтверджені.',status:'Мова заявлена · дата невідома',extra:true,links:[['site','https://islandescapetours.com/','Сайт']]},
  {name:'Віктор і Тетяна',area:'Фуертевентура',source:'архівний контакт',desc:'Архівний контакт зі старого матеріалу. Мова екскурсії, актуальна робота, ціна та умови не перевірені.',status:'Архівний · не пріоритетний',extra:true,links:[['wa','https://wa.me/34655245574','WhatsApp']]}
 ];
 function link(item,channel){
   const [type,url,label]=channel;
   const a=document.createElement('a');a.className='contact-link';a.href=url;
   if(type!=='mail'){a.target='_blank';a.rel='noopener noreferrer'}
   a.setAttribute('aria-label',(type==='fb'?'Facebook-допис':type==='wa'?'Чат WhatsApp':type==='mail'?'Email':'Вебсайт')+' — '+item.name);
   a.innerHTML=icons[type]+'<span></span>';
   a.lastChild.textContent=label;
   return a;
 }
 function card(item){
   const article=document.createElement('article');article.className='card contact-card';
   const meta=document.createElement('span');meta.className='contact-meta';meta.textContent=item.area+' · '+item.source;
   const h=document.createElement('h3');h.textContent=item.name;
   const p=document.createElement('p');p.textContent=item.desc;
   const status=document.createElement('span');status.className='contact-status'+(item.status.includes('Неперевірений')?' to-check':'');status.textContent=item.status;
   const actions=document.createElement('div');actions.className='contact-links';
   for(const channel of item.links)actions.append(link(item,channel));
   article.append(meta,h,p,status,actions);return article;
 }
 const intro=document.createElement('p');intro.className='contact-intro';
 intro.textContent='Натисни плашку: відкриється WhatsApp, Facebook, сайт або лист. Номер чи адресу вводити не потрібно. Кандидат у базі не означає перевірений або заброньований тур.';
 const heading=document.createElement('h3');heading.className='contact-section-title';heading.textContent='Гіди та служби · основні контакти';
 const grid=document.createElement('div');grid.className='cols contact-grid';
 for(const item of entries.filter(x=>!x.extra))grid.append(card(item));
 const more=document.createElement('details');more.className='card contact-disclosure';
 const summary=document.createElement('summary');summary.textContent='Ще 5 контактів із нашої бази';
 const note=document.createElement('p');note.className='contact-guidance';
 note.textContent='Резервні варіанти для порівняння; жоден не підтвердив вільну дату чи бронювання.';
 const extra=document.createElement('div');extra.className='cols contact-grid';
 for(const item of entries.filter(x=>x.extra))extra.append(card(item));
 more.append(summary,note,extra);
 original.replaceWith(intro,heading,grid,more);
})();