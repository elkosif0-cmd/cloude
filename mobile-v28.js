/* Aghnam Alwadi — Mobile UX v28 */
(()=>{
  const MOBILE=()=>matchMedia('(max-width:760px)').matches;
  let scheduled=false;
  function addDrawerClose(){
    const rail=document.getElementById('rail');
    if(!rail||rail.querySelector('.v28-rail-close'))return;
    const b=document.createElement('button');
    b.type='button';b.className='v28-rail-close';b.dataset.act='rail-close';b.setAttribute('aria-label','إغلاق القائمة');b.textContent='×';
    rail.appendChild(b);
  }
  function customerCards(){
    if(!MOBILE())return;
    const wrap=document.querySelector('.customer-table');
    if(!wrap)return;
    const table=wrap.querySelector('table'),body=table&&table.tBodies&&table.tBodies[0];
    if(!body)return;
    const rows=[...body.rows].filter(r=>r.cells.length>=7);
    const parent=wrap.parentElement;
    let list=parent&&parent.querySelector(':scope > .v28-customer-list');
    if(!list){list=document.createElement('div');list.className='v28-customer-list';wrap.before(list)}
    const hint=parent.querySelector('.customer-pager .hint')?.textContent||'';
    const first=rows[0]?.innerText||'',last=rows.at(-1)?.innerText||'';
    const sig=rows.length+'|'+hint+'|'+first.slice(0,80)+'|'+last.slice(0,80);
    if(list.dataset.sig===sig)return;
    list.dataset.sig=sig;
    const frag=document.createDocumentFragment();
    rows.forEach(row=>{
      const c=row.cells;
      const card=document.createElement('article');card.className='v28-customer-card';
      card.innerHTML=`<div class="v28-customer-head"><div class="v28-customer-name">${c[0].innerHTML}</div><span class="v28-customer-orders">${c[4]?.textContent.trim()||'—'} طلب</span></div>
        <div class="v28-customer-phone"><span>الجوال</span><b dir="ltr">${c[1]?.textContent.trim()||'—'}</b></div>
        <div class="v28-customer-meta">
          <div><span class="v28-meta-label">الموقع</span><b>${c[2]?.innerHTML||'—'}</b></div>
          <div><span class="v28-meta-label">المشتريات</span><b>${c[3]?.textContent.trim()||'—'}</b></div>
          <div><span class="v28-meta-label">آخر شراء</span><b>${c[5]?.textContent.trim()||'—'}</b></div>
          <div><span class="v28-meta-label">التفاصيل</span><b>${c[6]?.innerHTML||'—'}</b></div>
        </div>
        <div class="v28-customer-actions">${c[7]?.innerHTML||''}</div>`;
      frag.appendChild(card);
    });
    list.replaceChildren(frag);
  }
  function install(){
    addDrawerClose();customerCards();
    const meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.setAttribute('content','#ffffff');
  }
  function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;install()})}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
  const obs=new MutationObserver(schedule);obs.observe(document.documentElement,{subtree:true,childList:true});
  addEventListener('resize',()=>{if(innerWidth>760){document.getElementById('rail')?.classList.remove('open')}schedule()});
  window.V28Mobile={version:'28.0',refresh:schedule};
})();
