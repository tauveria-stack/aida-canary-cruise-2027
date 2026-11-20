/* AIDAcosma mobile table adapter and opt-in all-page layout audit.
   Use ?audit=layout on the main site to inspect every calendar tab. */
(() => {
  'use strict';
  const tables = document.querySelectorAll('#content table.cruise-table');
  for (const table of tables) {
    const headings = Array.from(table.querySelectorAll('thead tr:first-child th'), th => th.textContent.trim());
    for (const row of table.querySelectorAll('tbody tr')) {
      Array.from(row.children).forEach((cell,i) => {
        if (cell.tagName === 'TD') cell.setAttribute('data-label',headings[i]||'');
      });
    }
  }
  if (new URLSearchParams(window.location.search).get('audit')!=='layout') return;

  const panels = [...document.querySelectorAll('#content .panel')];
  const active = panels.find(p=>p.classList.contains('active'));
  const width = document.documentElement.clientWidth;
  const outside = [];
  for (const panel of panels) {
    panels.forEach(p=>{p.style.display = p===panel?'block':'none'});
    const nodes = [panel,...panel.querySelectorAll('*')];
    const issues = [];
    for (const el of nodes) {
      if (!(el instanceof HTMLElement)) continue;
      const st=window.getComputedStyle(el);
      if(st.position==='fixed'||st.visibility==='hidden'||st.display==='none')continue;
      let scroll=el.parentElement, isWithinScroll=false;
      while(scroll && scroll!==panel) {
        const ox=window.getComputedStyle(scroll).overflowX;
        if((ox==='auto'||ox==='scroll')&&scroll.scrollWidth>scroll.clientWidth+2){isWithinScroll=true;break;}
        scroll=scroll.parentElement;
      }
      if(isWithinScroll)continue;
      const rect=el.getBoundingClientRect();
      if(rect.width===0||rect.height===0)continue;
      if(rect.right>width+2 || rect.left < -2) {
        issues.push({tag:el.tagName.toLowerCase(),cls:String(el.className||'').slice(0,60),edge:Math.round(rect.right-width)});
      }
      if(issues.length>=12)break;
    }
    if(issues.length)outside.push({page:panel.id.replace('panel-',''),issues});
  }
  panels.forEach(p=>{p.style.display=''});
  const report=document.createElement('aside');
  report.setAttribute('role','status');
  report.style.cssText='position:fixed;left:8px;right:8px;bottom:8px;z-index:9999;max-height:52vh;overflow:auto;background:#fff;color:#17324a;border:2px solid #147d83;border-radius:12px;padding:12px;box-shadow:0 4px 18px #0003;font:13px/1.5 system-ui';
  const title=document.createElement('strong');
  title.textContent='Mobile layout QA · '+panels.length+' розділів · '+width+' px';
  report.append(title);
  const result=document.createElement('p');
  result.textContent=outside.length?'Проблемні розділи: '+outside.length+' / '+panels.length:'Не знайдено елементів, що виходять за ширину екрана.';
  report.append(result);
  if(outside.length){
    const details=document.createElement('pre');details.style.cssText='white-space:pre-wrap;overflow-wrap:anywhere;font-size:11px';
    details.textContent=JSON.stringify(outside,null,2);report.append(details);
  }
  const button=document.createElement('button');button.type='button';button.textContent='Закрити звіт';button.style.cssText='margin-top:8px;padding:8px 12px';
  button.addEventListener('click',()=>report.remove());report.append(button);
  document.body.append(report);
  console.info('AIDA mobile layout QA', {width,checked:panels.length,outside});
})();