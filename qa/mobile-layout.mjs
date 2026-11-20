import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const base=process.cwd();
const files=new Set(['index.html','family.html','family-choices-guide.html','mobile-layout.css','mobile-tables.js','family-entry.js','family-context.js','family-usability.js']);
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
      const candidates=[...document.querySelectorAll('header,main,.shell,#content,.panel.active,.panel.active *,nav#tabs,footer')];
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
    for(const width of widths.filter(x=>x<=768)){
      await page.setViewportSize({width,height:844});
      const result=await scan(file);
      if(result.failures.length||result.scrollWidth>width+2)errors.push(JSON.stringify({page:file,viewport:width,...result}));
    }
  }
  console.log('Mobile QA: '+ids.length+' itinerary tabs × '+widths.length+' widths + 2 auxiliary pages; pill contrast '+ratio.toFixed(2)+':1');
  if(errors.length)throw new Error(errors.slice(0,20).join('\n')+'\nTotal failures: '+errors.length);
  console.log('PASS: no horizontal page overflow in evaluated views');
} finally {
  if(browser)await browser.close();
  await new Promise(resolve=>server.close(resolve));
}
