import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const base=process.cwd();
const files=new Set(['index.html','family.html','family-choices-guide.html','mobile-layout.css','mobile-tables.js','contact-actions.css','contact-ui.js','family-entry.js','family-context.js','family-usability.js']);
const types={'.html':'text/html;charset=utf-8','.css':'text/css;charset=utf-8','.js':'application/javascript;charset=utf-8'};
const server=createServer(async(req,res)=>{
  const file=decodeURIComponent((req.url||'/').split('?')[0]).replace(/^\//,'')||'index.html';
  if(!files.has(file)){res.writeHead(404);res.end('not found');return}
  try{const bytes=await readFile(path.join(base,file));res.writeHead(200,{'Content-Type':types[path.extname(file)]||'text/plain'});res.end(bytes)}
  catch(e){res.writeHead(500);res.end(String(e))}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const url='http://127.0.0.1:'+server.address().port;
let browser;
try {
  browser=await chromium.launch({headless:true,args:['--no-sandbox']});
  const errors=[];
  const widths=[320,360,390,430,600,768,1024,1280];
  const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});
  // Ignore remote photography during structural QA; cover photo sizing with CSS.
  await page.route('**/*',route=>{
    if(new URL(route.request().url()).hostname==='127.0.0.1')return route.continue();
    return route.abort();
  });
  await page.goto(url+'/',{waitUntil:'domcontentloaded'});
  const tabs=await page.locator('#tabs button').count();
  if(tabs!==13)errors.push('Expected 13 itinerary sections, got '+tabs);
  const ids=await page.locator('#tabs button').evaluateAll(nodes=>nodes.map(n=>n.id.replace(/^tab-/,'')));
  const scan=async(label)=>{
    return await page.evaluate(()=>{
      const width=document.documentElement.clientWidth;
      const root=document.querySelector('.panel.active')||document.querySelector('#survey-app:not(.hidden)')||document.querySelector('#access-gate:not(.hidden)')||document.body;
      const candidates=[document.body,...document.querySelectorAll('header,header *,nav#tabs,nav#tabs *,footer,footer *'),root,...root.querySelectorAll('*')];
      const failures=[];
      for(const el of candidates){
        if(!(el instanceof HTMLElement))continue;
        const style=getComputedStyle(el),r=el.getBoundingClientRect();
        if(style.display==='none'||style.position==='fixed'||!r.width||!r.height)continue;
        let p=el.parentElement,internal=false;
        while(p){
          const st=getComputedStyle(p);
          if((st.overflowX==='auto'||st.overflowX==='scroll')&&p.scrollWidth>p.clientWidth+2){internal=true;break}
          p=p.parentElement;
        }
        if(internal)continue;
        if(r.right>width+2||r.left < -2)failures.push({tag:el.tagName,cls:String(el.className||'').slice(0,55),left:Math.round(r.left),right:Math.round(r.right)});
        if(failures.length>=7)break;
      }
      return {width,scrollWidth:document.documentElement.scrollWidth,failures};
    });
  };
  // Full itinerary navigation audit: validate actual rendered Google Maps/Waze pairs.
  const navigation=await page.evaluate(()=>{
    const issues=[];
    const anchors=[...document.querySelectorAll('#content a[href]')];
    const maps=anchors.filter(a=>{
      try{const u=new URL(a.href);return (u.hostname==='www.google.com'&&u.pathname.startsWith('/maps'))||['waze.com','www.waze.com'].includes(u.hostname)}
      catch(_){return false}
    });
    const provider=u=>u.hostname.includes('waze.com')?'waze':'google';
    const dest=u=>provider(u)==='waze'?(u.searchParams.get('q')||u.searchParams.get('ll')):(u.searchParams.get('destination')||u.searchParams.get('query'));
    const comparable=x=>String(x||'').normalize('NFKC').toLowerCase().replace(/\s+/g,' ').trim();
    const seenPages={};
    for(const a of maps){
      const u=new URL(a.href),kind=provider(u);
      const day=a.closest('.panel')?.id?.replace('panel-','')||'unknown';
      seenPages[day]=(seenPages[day]||0)+1;
      if(kind==='google'&&u.searchParams.get('api')!=='1')issues.push(day+': Google Maps missing api=1: '+u.href);
      if(!dest(u))issues.push(day+': empty navigation destination: '+u.href);
      if(kind==='waze'&& (u.pathname!=='/ul'||u.searchParams.get('navigate')!=='yes'))issues.push(day+': malformed Waze deep link: '+u.href);
    }
    const stops=[...document.querySelectorAll('#content .nav-jump')];
    for(const stop of stops){
      const title=stop.querySelector('.nav-jump-title')?.textContent?.trim()||'(no label)';
      const pageName=stop.closest('.panel')?.id?.replace('panel-','')||'unknown';
      const links=[...stop.querySelectorAll('a[href]')].map(a=>new URL(a.href));
      const google=links.filter(u=>provider(u)==='google'&&u.pathname.startsWith('/maps')&&u.searchParams.get('travelmode')!=='walking');
      const waze=links.filter(u=>provider(u)==='waze');
      if(!google.length||!waze.length){issues.push(pageName+' / '+title+': missing driving Google Maps or Waze button');continue}
      const gd=comparable(dest(google[0])),wd=comparable(dest(waze[0]));
      if(gd!==wd)issues.push(pageName+' / '+title+': Google/Waze mismatch: '+gd+' != '+wd);
      const gButton=stop.querySelector('.nav-maps'),wButton=stop.querySelector('.nav-waze');
      if(!gButton||!wButton)issues.push(pageName+' / '+title+': missing recognizable map navigation buttons');
    }
    const contacts=document.querySelector('#panel-contacts');
    // Hidden tabs have zero geometry; temporarily expose contacts for touch-target measurement.
    const oldContactDisplay=contacts?.style.display||'';
    if(contacts)contacts.style.display='block';
    const chips=[...(contacts?.querySelectorAll('.contact-link')||[])];
    const providers=['fb','wa','site','mail'];
    if(chips.length<10)issues.push('Contact page: too few branded action chips ('+chips.length+')');
    for(const a of chips){
      if(!providers.some(t=>a.querySelector('.contact-icon.'+t)))issues.push('Contact chip icon missing: '+a.textContent.trim());
      if(a.getBoundingClientRect().height<40)issues.push('Contact chip touch target too small: '+a.textContent.trim());
      try{const u=new URL(a.href);
        if(u.hostname==='wa.me'&&!/^\/[0-9]{8,15}$/.test(u.pathname))issues.push('Invalid WhatsApp number: '+a.href);
        if(a.querySelector('.contact-icon.fb')&&!u.hostname.endsWith('facebook.com'))issues.push('Facebook badge links elsewhere: '+a.href);
      }catch(_){issues.push('Invalid contact URL: '+a.getAttribute('href'))}
    }
    if(contacts)contacts.style.display=oldContactDisplay;
    return {mapLinks:maps.length,stops:stops.length,contactChips:chips.length,byDay:seenPages,issues};
  });
  console.log('Navigation QA: '+navigation.mapLinks+' Google/Waze links in '+navigation.stops+' stops; contact chips: '+navigation.contactChips);
  if(navigation.issues.length)errors.push(...navigation.issues.map(t=>'NAV: '+t));
  for(const width of widths){
    await page.setViewportSize({width,height:844});
    for(const id of ids){
      await page.evaluate(id=>document.getElementById('tab-'+id).click(),id);
      const result=await scan(id);
      if(result.failures.length||result.scrollWidth>width+2){
        errors.push(JSON.stringify({page:id,viewport:width,...result}));
      }
    }
  }
  await page.setViewportSize({width:390,height:844});
  await page.evaluate(()=>document.getElementById('tab-overview').click());
  const pill=await page.locator('header .pill').evaluate(el=>{
    const s=getComputedStyle(el);return {color:s.color,bg:s.backgroundColor};
  });
  const parse=c=>(c.match(/[\d.]+/g)||[]).slice(0,3).map(Number).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4});
  const lum=rgb=>{const a=parse(rgb);return a[0]*.2126+a[1]*.7152+a[2]*.0722};
  const aa=lum(pill.color),bb=lum(pill.bg);const ratio=(Math.max(aa,bb)+.05)/(Math.min(aa,bb)+.05);
  if(ratio<4.5)errors.push('Header pill contrast below WCAG AA: '+ratio.toFixed(2));
  for(const file of ['family.html','family-choices-guide.html']){
    await page.goto(url+'/'+file,{waitUntil:'domcontentloaded'});
    const widthsToCheck=file==='family-choices-guide.html'?widths:widths.filter(x=>x<=768);
    for(const width of widthsToCheck){
      await page.setViewportSize({width,height:844});
      const result=await scan(file);
      if(result.failures.length||result.scrollWidth>width+2)errors.push(JSON.stringify({page:file,viewport:width,...result}));
    }
    if(file==='family.html'){
      // Exercise the long post-login questionnaire without contacting Supabase.
      // Reuse its real markup, sourced photos and form styling.
      await page.evaluate(()=>{
        document.getElementById('access-gate')?.classList.add('hidden');
        document.getElementById('survey-app')?.classList.remove('hidden');
        document.getElementById('profile-view')?.classList.remove('hidden');
        document.getElementById('survey-content')?.classList.remove('hidden');
      });
      for(const width of widths.filter(x=>x<=768)){
        await page.setViewportSize({width,height:844});
        const result=await scan('family.html (full form)');
        if(result.failures.length||result.scrollWidth>width+2)errors.push(JSON.stringify({page:'family.html (full form)',viewport:width,...result}));
      }
    }
  }
  console.log('Mobile QA: '+ids.length+' itinerary tabs × '+widths.length+' widths + both family survey states + photo guide; pill contrast '+ratio.toFixed(2)+':1');
  if(errors.length)throw new Error(errors.slice(0,20).join('\n')+'\nTotal failures: '+errors.length);
  console.log('PASS: no horizontal page overflow in evaluated views');
} finally {
  if(browser)await browser.close();
  await new Promise(resolve=>server.close(resolve));
}
