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
 id:'road-out',tab:'🚗 До Модліна · 05.01',title:'Дорога до Modlin · 5 січня',
 intro:'Київ, Оболонь → Устилуг–Зосін → Люблін → WMI. Жодної ночівлі до рейсу.',
 schedule:[['06:30 EET','Старт із Києва. Рекомендований коридор 06:00–07:00, уточнення за погодою і чергою.'],['09:15–09:45 EET','Звягель: кава, санвузол, відпочинок/зміна водія.'],['12:00–12:50 EET','Луцьк: основний гарячий обід 35–45 хв, пальне до кордону.'],['≈14:00–14:45 EET','Устилуг–Зосін: прибуття до черги, два контролі, резерв 2–5+ год.'],['Далі, CET','Зосін → Грубешів → Люблін → Modlin, польський час на годину позаду.'],['≈20:00–00:30 CET','Широкий сценарій прибуття до аеропорту (може бути раніше/пізніше).'],['06.01 04:05 CET','Орієнтир початку check-in; виліт WMI о 07:05 CET. Кілька годин чекаємо у терміналі, без готелю.']],
 stops:[['Звягель','Zviahel, Ukraine','Кава / санвузол'],['Луцьк','Lutsk, Ukraine','Гаряча їжа до кордону'],['Устилуг · КПП','Ustyluh border crossing, Ukraine','Основний пункт пропуску'],['Зосін · польський контроль','Zosin border crossing, Poland','Окремий контроль Польщі'],['Люблін','Lublin, Poland','Перерва за потреби'],['Warsaw Modlin · термінал','Warsaw Modlin Airport WMI, Nowy Dwor Mazowiecki, Poland','Паркінг P1/P3/P6 обрати до виїзду']],
 full:map('Warsaw Modlin Airport WMI, Nowy Dwor Mazowiecki, Poland','Obolon, Kyiv, Ukraine','Ustyluh border crossing, Ukraine|Zosin border crossing, Poland|Lublin, Poland')
};
const home={
 id:'road-home',tab:'🚗 Додому · 16.01',title:'Дорога додому · 16 січня',
 intro:'16 січня: приліт уночі, відпочинок у Варшаві, виїзд вранці та ціль прибути до Києва пізно ввечері того самого дня.',
 schedule:[['01:05 CET','WMI: приліт 16 січня, багаж, забрати Renault із паркінгу.'],['02:00–03:00 CET','Заїзд Szyszkowa 39 на ніч 15→16.01, відпочинок.'],['≈09:00–10:00 CET','Ранковий виїзд із Варшави після достатнього відпочинку та сніданку. Це орієнтир для повернення 16-го, не підтверджений час.'],['≈12:00–13:30 CET','Люблін: обід 35–45 хв, пальне й санвузол. Орієнтир залежить від старту та трафіку.'],['Після Любліна','Зосін–Устилуг: перевірити чергу легкових PL→UA, врахувати два контролі та зміну часових поясів.'],['Пізній вечір 16.01 EET · ціль','Устилуг → Луцьк → Рівне → Звягель → Київ. Прибуття додому плануємо саме 16 січня; це залежить від черги, зимової дороги та відпочинку водіїв.']],
 stops:[['Szyszkowa 39 · Варшава','Szyszkowa 39, 02-285 Warszawa, Poland','Після ночівлі'],['Люблін','Lublin, Poland','Гарячий обід до кордону'],['Зосін · PL→UA','Zosin border crossing, Poland','Польська черга легкових'],['Устилуг','Ustyluh border crossing, Ukraine','Українська сторона'],['Луцьк','Lutsk, Ukraine','Перерва/зміна водія'],['Київ, Оболонь','Obolon, Kyiv, Ukraine','Домашню адресу не публікуємо']],
 full:map('Obolon, Kyiv, Ukraine','Szyszkowa 39, Warszawa, Poland','Lublin, Poland|Zosin border crossing, Poland|Ustyluh border crossing, Ukraine')
};
function page(data){
 islands.push({id:data.id,tab:data.tab,title:data.title,img:'',intro:data.intro,sections:''});
 const btn=el('button','',data.tab);btn.id='tab-'+data.id;btn.setAttribute('aria-selected','false');btn.onclick=()=>show(data.id);
 (document.getElementById(data.id==='road-out'?'tab-overview':'tab-warsaw16')).after(btn);
 const panel=el('section','panel');panel.id='panel-'+data.id;
 panel.append(el('h2','',data.title),el('p','muted',data.intro));
 const intro=box('Без платних доріг · Renault Megane III','Google Maps: avoid=tolls; Waze: avoid_tolls=true. Безкоштовні швидкісні дороги залишаємо. Оцінка в русі 11–12 год плюс перерви 1–1,5 год і кордон. Усі часи приблизні.');
 const whole=el('div','fd-actions');whole.append(link(data.full,'🗺️ Повний маршрут Google Maps · без платних доріг'));intro.append(whole);panel.append(intro);
 const times=box('Графік і харчування');const timeline=el('div','fd-timeline');
 for(const [time,description] of data.schedule){const line=el('div','');line.append(el('b','',time),el('span','',description));timeline.append(line)}
 times.append(timeline);panel.append(times);
 const places=box('Точки Google Maps і Waze');const nav=el('div','nav-jump-list');
 for(const [label,dest,note] of data.stops){
  const stop=el('div','nav-jump');stop.append(el('div','nav-jump-title',label));
  const actions=el('div','nav-jump-links');actions.append(link(map(dest),'🗺️ Карти','nav-mini-btn nav-maps'),link(waze(dest),'🚙 Waze','nav-mini-btn nav-waze'));stop.append(actions,el('small','',note));nav.append(stop);
 }
 places.append(nav);panel.append(places);
 const extras=data.id==='road-out'?
 'Страхування: «Зелена картка» для Megane III на 05–19.01 (15 днів), купувати заздалегідь; медичний поліс Європа для 4 людей 05–17.01, від €50 000/особу, включно з репатріацією та активними розвагами. Паркінг Modlin 05–16.01: P1/P3 асфальтовані, P6 трав’яний, P7 тимчасово недоступний. Пільга І групи: ст.23 Закону про прикордонний контроль (супровідні особи та за необхідності родичі першої лінії), але не гарантована нульова черга. Звірити документи кожного з чотирьох.' :
 'Після рейсу 16 січня о 01:05 забираємо Megane з WMI, їдемо на Szyszkowa 39, відпочиваємо й того ж ранку вирушаємо до Києва. Ціль — пізній вечір 16.01. Кордон може затримати нас, але 17.01 не є запланованим дорожнім днем. Медичне покриття до 17.01 залишається лише страховим запасом; зворотна черга PL→UA може відрізнятися.';
 const policy=box('Контроль перед дорогою',extras);const actions=el('div','fd-actions');
 if(data.id==='road-out'){actions.append(link('https://modlinairport.apcoa.pl/','Паркінги Modlin'),link('https://mtsbu.ua/index.php/greencard/elektronnij-dogovir','МТСБУ · Зелена картка'),link('https://nakordoni.eu/en/stat/1/2/4','Черги UA→PL'))}
 else {actions.append(link('https://granica.gov.pl/index_wait.php?p=u&v=pl','Польські черги'),link('https://nakordoni.eu/en/stat/2/1/4','Черги PL→UA'))}
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