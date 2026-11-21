/* Two toll-free road tabs. The private home street/number is intentionally omitted. */
(() => {
'use strict';
if(typeof islands==='undefined'||typeof show!=='function'||document.getElementById('tab-road-out'))return;
const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
const map=(to,from,via)=>{const u=new URL('https://www.google.com/maps/dir/');u.searchParams.set('api','1');u.searchParams.set('destination',to);u.searchParams.set('travelmode','driving');u.searchParams.set('avoid','tolls');if(from)u.searchParams.set('origin',from);if(via)u.searchParams.set('waypoints',via);return u.href;};
const waze=(to)=>{const u=new URL('https://waze.com/ul');u.searchParams.set('q',to);u.searchParams.set('navigate','yes');u.searchParams.set('avoid_tolls','true');return u.href;};
const link=(href,label,cls)=>{const n=el('a',cls||'fd-action',label);n.href=href;n.target='_blank';n.rel='noopener noreferrer';return n;};
const box=(title,description)=>{const n=el('div','card');n.append(el('h3','',title));if(description)n.append(el('p','',description));return n;};
const outbound={
 id:'road-out',tab:'🚗 До Модліна · 05.01',title:'Дорога до Модліна · 5 січня',
 intro:'Київ, Оболонь → Устилуг–Зосін → Люблін → аеропорт Модлін. Їдемо прямо в аеропорт, без готелю.',
 schedule:[
  ['5 січня · 06:30','Виїзд із Києва. Орієнтир — між 06:00 та 07:00; уточнюємо перед поїздкою за погодою та чергою.'],
  ['5 січня · 09:15–09:45','Звягель: кава, туалет, короткий відпочинок або зміна водія.'],
  ['5 січня · 12:00–12:50','Луцьк: гарячий обід 35–45 хвилин і заправка перед кордоном.'],
  ['5 січня · приблизно 14:00–14:45','Устилуг–Зосін: орієнтовне прибуття до пункту пропуску. На перевірки закладаємо запас 2–5 годин або більше.'],
  ['Після кордону','Зосін → Грубешів → Люблін → аеропорт Модлін. У Польщі годинник показує на годину менше, але всі години в цьому графіку — київські.'],
  ['5 січня · 21:00 — 6 січня · 01:30','Широкий орієнтир прибуття до аеропорту за київським часом. Дорога й черга можуть змінити його.'],
  ['6 січня · 05:05','Орієнтир початку реєстрації на рейс: у Варшаві в цей момент буде 04:05. До того часу чекаємо в терміналі, без готелю.'],
  ['6 січня · 08:05','Виліт із Модліна. У квитку зазначено 07:05 за місцевим часом Варшави.']],
 stops:[['Звягель','Zviahel, Ukraine','Кава / санвузол'],['Луцьк','Lutsk, Ukraine','Гаряча їжа до кордону'],['Устилуг · КПП','Ustyluh border crossing, Ukraine','Основний пункт пропуску'],['Зосін · польський контроль','Zosin border crossing, Poland','Окремий контроль Польщі'],['Люблін','Lublin, Poland','Перерва за потреби'],['Warsaw Modlin · термінал','Warsaw Modlin Airport WMI, Nowy Dwor Mazowiecki, Poland','Паркінг P1/P3/P6 обрати до виїзду']],
 full:map('Warsaw Modlin Airport WMI, Nowy Dwor Mazowiecki, Poland','Obolon, Kyiv, Ukraine','Ustyluh border crossing, Ukraine|Zosin border crossing, Poland|Lublin, Poland')
};
const home={
 id:'road-home',tab:'🚗 Додому · 16.01',title:'Дорога додому · 16 січня',
 intro:'16 січня: вночі прилітаємо до Модліна, відпочиваємо у Варшаві й зранку вирушаємо додому. Наша ціль — бути в Києві пізно ввечері 16-го.',
 schedule:[
  ['16 січня · 02:05','Приліт до Модліна, отримання багажу та Renault із парковки. У квитку зазначено 01:05 за часом Варшави.'],
  ['16 січня · 03:00–04:00','Орієнтовне заселення на Szyszkowa 39 і відпочинок. У Варшаві в цей час 02:00–03:00.'],
  ['16 січня · 10:00–11:00','Після сну та сніданку вирушаємо з Варшави. Це приблизний час, а не жорсткий дедлайн; безпека водіїв важливіша.'],
  ['16 січня · 13:00–14:30','Люблін: обід 35–45 хвилин, пальне і туалет. Час залежить від старту й дорожньої ситуації.'],
  ['Після Любліна','Зосін–Устилуг: перевіряємо чергу легкових автомобілів з Польщі в Україну та проходимо прикордонний контроль.'],
  ['16 січня · пізній вечір (ціль)','Устилуг → Луцьк → Рівне → Звягель → Київ. Прагнемо бути вдома 16-го; затримка на кордоні чи в дорозі може змінити цей план.']],
 stops:[['Szyszkowa 39 · Варшава','Szyszkowa 39, 02-285 Warszawa, Poland','Після ночівлі'],['Люблін','Lublin, Poland','Гарячий обід до кордону'],['Зосін · у бік України','Zosin border crossing, Poland','Польська черга легкових'],['Устилуг','Ustyluh border crossing, Ukraine','Українська сторона'],['Луцьк','Lutsk, Ukraine','Перерва/зміна водія'],['Київ, Оболонь','Obolon, Kyiv, Ukraine','Домашню адресу не публікуємо']],
 full:map('Obolon, Kyiv, Ukraine','Szyszkowa 39, Warszawa, Poland','Lublin, Poland|Zosin border crossing, Poland|Ustyluh border crossing, Ukraine')
};
function page(data){
 islands.push({id:data.id,tab:data.tab,title:data.title,img:'',intro:data.intro,sections:''});
 const btn=el('button','',data.tab);btn.id='tab-'+data.id;btn.setAttribute('aria-selected','false');btn.onclick=()=>show(data.id);
 (document.getElementById(data.id==='road-out'?'tab-overview':'tab-warsaw16')).after(btn);
 const panel=el('section','panel');panel.id='panel-'+data.id;
 panel.append(el('h2','',data.title),el('p','muted',data.intro));
 const intro=box('Без платних доріг · Renault Megane III','Посилання на Google Maps і Waze налаштовані так, щоб уникати платних доріг. Безплатними швидкісними трасами користуємося. Орієнтир: 11–12 годин їзди, додатково 1–1,5 години на зупинки та окремий запас часу на кордоні.');
 const timeNote=el('p','road-clock-note','🕒 УСІ години в графіку — за київським часом. У Польщі на годиннику на 1 годину менше. Час у квитках пояснюємо окремо.');
 intro.append(timeNote);
 const whole=el('div','fd-actions');whole.append(link(data.full,'🗺️ Повний маршрут Google Maps · без платних доріг'));intro.append(whole);panel.append(intro);
 const times=box('План дороги · час Києва');const timeline=el('div','fd-timeline');
 for(const [time,description] of data.schedule){const line=el('div','');line.append(el('b','',time),el('span','',description));timeline.append(line)}
 times.append(timeline);panel.append(times);
 const places=box('Куди їхати · навігація');const nav=el('div','nav-jump-list');
 for(const [label,dest,note] of data.stops){
  const stop=el('div','nav-jump');stop.append(el('div','nav-jump-title',label));
  const actions=el('div','nav-jump-links');actions.append(link(map(dest),'🗺️ Карти','nav-mini-btn nav-maps'),link(waze(dest),'🚙 Waze','nav-mini-btn nav-waze'));stop.append(actions,el('small','',note));nav.append(stop);
 }
 places.append(nav);panel.append(places);
 const extras=data.id==='road-out'?
 'Страхування: «Зелена картка» для Megane III на 05–19.01 (15 днів), купувати заздалегідь; медичний поліс Європа для 4 людей 05–17.01, від €50 000/особу, включно з репатріацією та активними розвагами. Паркінг Modlin 05–16.01: P1/P3 асфальтовані, P6 трав’яний, P7 тимчасово недоступний. Пільга І групи: ст.23 Закону про прикордонний контроль (супровідні особи та за необхідності родичі першої лінії), але не гарантована нульова черга. Звірити документи кожного з чотирьох.' :
 '16 січня прилітаємо о 02:05 за Києвом (у квитку — 01:05 за Варшавою), забираємо автомобіль, їдемо на Szyszkowa 39, відпочиваємо й вранці вирушаємо до Києва. Плануємо бути вдома пізно ввечері 16-го. Медична страховка до 17 січня — лише запас на випадок затримки. Черга в Україну може відрізнятися від черги з України.';
 const policy=box('Контроль перед дорогою',extras);const actions=el('div','fd-actions');
 if(data.id==='road-out'){actions.append(link('https://modlinairport.apcoa.pl/','Паркінги Modlin'),link('https://mtsbu.ua/index.php/greencard/elektronnij-dogovir','МТСБУ · Зелена картка'),link('https://nakordoni.eu/en/stat/1/2/4','Черги до Польщі'))}
 else {actions.append(link('https://granica.gov.pl/index_wait.php?p=u&v=pl','Польські черги'),link('https://nakordoni.eu/en/stat/2/1/4','Черги до України'))}
 policy.append(actions);panel.append(policy);
 document.getElementById('content').append(panel);
}
page(outbound);page(home);
const homepage=document.getElementById('panel-overview');
if(homepage){
 const prompt=box('🚗 Наземні маршрути','5 січня — прямо з Києва до Модліна, без готелю. 16 січня — приліт уночі, відпочинок у Варшаві, ранковий виїзд і ціль бути в Києві пізно ввечері того ж дня. Обидва маршрути без платних доріг.');
 const links=el('p','');const out=el('a','','До Модліна · 05.01');out.href='#road-out';out.onclick=e=>{e.preventDefault();show('road-out')};
 const back=el('a','','Додому · 16.01');back.href='#road-home';back.onclick=e=>{e.preventDefault();show('road-home')};
 links.append(out,document.createTextNode(' · '),back);prompt.append(links);
 homepage.insertBefore(prompt,homepage.firstElementChild?.nextSibling||null);
}
if(['road-out','road-home'].includes(location.hash.slice(1)))show(location.hash.slice(1));
})();