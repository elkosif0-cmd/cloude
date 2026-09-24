/* S.kosif V32 — الكتالوج والعروض
   شاشة بطاقات بأسلوب متاجر الطعام: شبكة من عمودين، شارة العرض، السعر القديم مشطوباً،
   سعر الكيلو، شريط ترتيب وتصفية ثابت، ومشاركة العروض على واتساب.
   الأرقام من محرك التسعير نفسه عبر SKosifCore.catalog() (قراءة فقط).
   العروض تُحفظ على الجهاز ولا تغيّر سعر الكتالوج. */
(()=>{
  "use strict";
  const OFFERS_KEY="skosif_v32_offers", BIZ="أغنام الوادي";
  const $=id=>document.getElementById(id);
  const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
  const nf2=new Intl.NumberFormat("ar-SA",{minimumFractionDigits:2,maximumFractionDigits:2});
  const sar=v=>nf2.format(Number(v)||0);
  const pct=v=>new Intl.NumberFormat("ar-SA",{maximumFractionDigits:1}).format((Number(v)||0)*100)+"٪";
  const load=(k,d)=>{try{const v=JSON.parse(localStorage.getItem(k));return v??d}catch{return d}};
  const save=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true}catch{return false}};
  const ui={q:"",sort:"featured",offersOnly:false,kind:"all",cat:"",band:"",sheet:null};

  function toast(msg){
    let t=$("sk-toast");
    if(!t){document.body.insertAdjacentHTML("beforeend",'<div id="sk-toast" class="sk-toast"></div>');t=$("sk-toast")}
    t.textContent=msg;t.classList.add("show");clearTimeout(t._tm);t._tm=setTimeout(()=>t.classList.remove("show"),3200);
  }
  function data(){
    try{if(window.SKosifCore&&window.SKosifCore.catalog)return window.SKosifCore.catalog()}catch(e){console.warn("catalog bridge",e)}
    return {vat:0.15,netBase:true,items:[]};
  }
  function withOffer(it,d,offers){
    const off=Number(offers[it.id])||0;
    if(!(off>0)||!(it.price>0))return {...it,off:0,now:it.price};
    const now=Math.round(it.price*(1-off)*100)/100;
    const base=d.netBase?now/(1+d.vat):now;
    const profit=now/(1+d.vat)-(it.cost||0);
    return {...it,off,now,nowMargin:base>0?profit/base:null,belowCost:it.cost!=null&&now<it.cost*(1+d.vat)};
  }
  const ICON=(it)=>{
    if(it.kind==="box")return "📦";
    const t=it.cat+" "+it.name;
    return /بقر|عجل/.test(t)?"🐄":/ماعز|تيس|عارضي/.test(t)?"🐐":/حاشي|جمل|قعود/.test(t)?"🐪":/دجاج|طيور/.test(t)?"🐔":/شحم|دهن/.test(t)?"🧈":/كبد|معلاق|كوارع|مقادم|فشة/.test(t)?"🍖":"🐑";
  };
  const BAND={ex:["ممتاز","ex"],good:["جيد","good"],low:["ضعيف","low"],loss:["خسارة","loss"],by:["منتج ثانوي","na"],na:["بلا سعر","na"]};

  function listItems(){
    const d=data(), offers=load(OFFERS_KEY,{});
    let items=d.items.filter(it=>it.status!=="archived").map(it=>withOffer(it,d,offers));
    const q=ui.q.trim();
    if(q)items=items.filter(it=>(it.name+" "+it.cat).includes(q));
    if(ui.offersOnly)items=items.filter(it=>it.off>0);
    if(ui.kind!=="all")items=items.filter(it=>it.kind===ui.kind);
    if(ui.cat)items=items.filter(it=>it.cat===ui.cat);
    if(ui.band)items=items.filter(it=>it.band===ui.band);
    const m=x=>x.off>0?(x.nowMargin??-9):(x.margin??-9), p=x=>x.now??x.price??0;
    /* الافتراضي: البوكسات، ثم الأصناف الرئيسية، ثم المنتجات الثانوية؛ وداخل كل مجموعة الأعلى هامشاً */
    const grp=x=>x.kind==="box"?0:x.byProduct?2:1;
    const S={"featured":(a,b)=>grp(a)-grp(b)||m(b)-m(a),"margin-desc":(a,b)=>m(b)-m(a),"margin-asc":(a,b)=>m(a)-m(b),"price-asc":(a,b)=>p(a)-p(b),"price-desc":(a,b)=>p(b)-p(a),"name":(a,b)=>a.name.localeCompare(b.name,"ar")};
    items.sort(S[ui.sort]||S.featured);
    return {d,items,all:d.items.filter(it=>it.status!=="archived"),offers};
  }

  function card(it){
    const b=BAND[it.band]||BAND.na, marg=it.off>0?it.nowMargin:it.margin;
    return '<article class="k32-card" data-id="'+esc(it.id)+'">'+
      '<div class="k32-img"><span aria-hidden="true">'+ICON(it)+'</span>'+
        (it.off>0?'<em class="k32-badge">عرض −'+pct(it.off)+'</em>':'')+
        '<i class="k32-kind">'+(it.kind==="box"?"بوكس":"صنف")+'</i></div>'+
      '<h4>'+esc(it.name)+'</h4><p class="k32-cat">'+esc(it.cat||"—")+'</p>'+
      '<div class="k32-margin k32-'+b[1]+'">'+(it.byProduct||marg==null?b[0]:'هامش '+pct(marg))+(it.belowCost?' · تحت التكلفة':'')+'</div>'+
      '<div class="k32-price">'+
        '<div class="k32-unit">'+(it.kind==="box"&&it.pricePerKg?'<span>'+sar(it.off>0?it.pricePerKg*(1-it.off):it.pricePerKg)+' ر.س/كجم</span>'+(it.weight?'<span>'+new Intl.NumberFormat("ar-SA",{maximumFractionDigits:2}).format(it.weight)+' كجم</span>':''):(it.kind==="raw"?'<span>للكيلو</span>':''))+'</div>'+
        '<div class="k32-now">'+(it.off>0?'<s>'+sar(it.price)+'</s>':'')+(it.now!=null?'<b>'+sar(it.now)+'</b><small>ر.س</small>':'<b>—</b>')+'</div>'+
      '</div>'+
      '<button class="k32-btn" type="button" data-k32-offer="'+esc(it.id)+'">'+(it.off>0?'تعديل العرض':'إضافة عرض')+'</button>'+
    '</article>';
  }

  function sheetHTML(all){
    if(ui.sheet==="sort"){
      const opts=[["featured","المقترح"],["margin-desc","الأعلى هامشاً"],["margin-asc","الأقل هامشاً"],["price-asc","السعر: من الأقل"],["price-desc","السعر: من الأعلى"],["name","الاسم"]];
      return '<div class="k32-sheet">'+opts.map(o=>'<button type="button" class="'+(ui.sort===o[0]?'on':'')+'" data-k32-sort="'+o[0]+'">'+o[1]+'</button>').join("")+'</div>';
    }
    if(ui.sheet==="filter"){
      const cats=[...new Set(all.map(x=>x.cat).filter(Boolean))];
      const chip=(attr,val,label,on)=>'<button type="button" class="k32-chip'+(on?' on':'')+'" '+attr+'="'+esc(val)+'">'+esc(label)+'</button>';
      return '<div class="k32-sheet k32-filter">'+
        '<label class="k32-toggle"><span>العروض فقط</span><input type="checkbox" id="k32-offers-only"'+(ui.offersOnly?' checked':'')+'><i></i></label>'+
        '<div class="k32-group"><b>النوع</b>'+[["all","الكل"],["raw","أصناف"],["box","بوكسات"]].map(o=>chip("data-k32-kind",o[0],o[1],ui.kind===o[0])).join("")+'</div>'+
        '<div class="k32-group"><b>الهامش</b>'+chip("data-k32-band","","الكل",!ui.band)+[["ex","ممتاز"],["good","جيد"],["low","ضعيف"],["loss","خسارة"]].map(o=>chip("data-k32-band",o[0],o[1],ui.band===o[0])).join("")+'</div>'+
        '<div class="k32-group"><b>التصنيف</b>'+chip("data-k32-cat","","الكل",!ui.cat)+cats.map(c=>chip("data-k32-cat",c,c,ui.cat===c)).join("")+'</div>'+
        '<button type="button" class="k32-reset" data-k32-reset="1">مسح التصفية</button>'+
      '</div>';
    }
    return "";
  }

  function html(){
    const {items,all,offers}=listItems();
    const nOffers=Object.keys(offers).filter(id=>all.some(x=>x.id===id)).length;
    const filtered=ui.offersOnly||ui.kind!=="all"||ui.cat||ui.band;
    return '<div class="k32">'+
      '<section class="k32-hero"><div><span>'+esc(BIZ)+'</span><h3>'+(ui.offersOnly?'عروض الشهر':'الكتالوج والعروض')+'</h3><p>('+items.length+' منتج'+(nOffers?' · '+nOffers+' عرض نشط':'')+')</p></div>'+
        '<button type="button" class="k32-share" id="k32-share"'+(nOffers?'':' disabled')+'>مشاركة العروض</button></section>'+
      '<label class="k32-search"><input id="k32-q" type="search" placeholder="ابحث عن صنف أو بوكس" value="'+esc(ui.q)+'"></label>'+
      '<div class="k32-bar"><button type="button" data-k32-sheet="sort" class="'+(ui.sheet==="sort"?'on':'')+'">⇅ ترتيب</button><button type="button" data-k32-sheet="filter" class="'+(ui.sheet==="filter"||filtered?'on':'')+'">⚲ تصفية'+(filtered?' •':'')+'</button></div>'+
      sheetHTML(all)+
      (items.length?'<div class="k32-grid">'+items.map(card).join("")+'</div>'
        :'<div class="sk-empty">'+(all.length?'لا توجد نتائج مطابقة.':'الكتالوج فارغ.')+'</div>')+
    '</div>';
  }

  function setOffer(id){
    const {all}=listItems(), it=all.find(x=>x.id===id); if(!it)return;
    const offers=load(OFFERS_KEY,{}), cur=offers[id]?Math.round(offers[id]*1000)/10:"";
    const v=window.prompt("نسبة الخصم على «"+it.name+"» (٪). اتركها فارغة أو 0 لإلغاء العرض:",String(cur));
    if(v==null)return;
    const n=Number(String(v).replace(/[٪%\s]/g,"").replace(/[٠-٩]/g,d=>"٠١٢٣٤٥٦٧٨٩".indexOf(d)));
    if(!isFinite(n)||n<0||n>=90){toast("أدخل نسبة بين 0 و 90");return}
    if(n===0)delete offers[id];else offers[id]=n/100;
    save(OFFERS_KEY,offers);
    const d=data(), w=withOffer(it,d,offers);
    if(w.belowCost)toast("تنبيه: سعر العرض أقل من تكلفة «"+it.name+"»");else toast(n?"تم حفظ العرض":"تم إلغاء العرض");
    render();
  }
  function shareOffers(){
    const {d,all,offers}=listItems();
    const list=all.map(it=>withOffer(it,d,offers)).filter(it=>it.off>0&&it.now!=null);
    if(!list.length)return;
    const lines=["🔥 عروض "+BIZ,""];
    list.forEach(it=>lines.push("• "+it.name+": "+sar(it.now)+" ر.س بدل "+sar(it.price)+(it.kind==="box"&&it.pricePerKg?" ("+sar(it.pricePerKg*(1-it.off))+" ر.س/كجم)":it.kind==="raw"?" للكيلو":"")));
    lines.push("","للطلب راسلنا 🌿");
    const text=lines.join("\n");
    window.open("https://wa.me/?text="+encodeURIComponent(text),"_blank","noopener");
  }

  let active=false;
  function render(){
    const body=$("sk-body"); if(!body)return;
    active=true;
    document.querySelectorAll("[data-sk-tab],[data-sk31-tab]").forEach(b=>b.classList.remove("active"));
    const tab=document.querySelector('[data-k32-tab]'); if(tab){tab.classList.add("active");tab.scrollIntoView&&tab.scrollIntoView({block:"nearest",inline:"nearest"})}
    const y=body.closest(".sk-panel")?.scrollTop||0;
    body.innerHTML=html(); bind();
    const panel=body.closest(".sk-panel"); if(panel)panel.scrollTop=y;
  }
  function bind(){
    const q=$("k32-q");
    if(q)q.oninput=()=>{ui.q=q.value;clearTimeout(q._t);q._t=setTimeout(()=>{render();const n=$("k32-q");if(n){n.focus();n.setSelectionRange(n.value.length,n.value.length)}},250)};
    document.querySelectorAll("[data-k32-sheet]").forEach(b=>b.onclick=()=>{ui.sheet=ui.sheet===b.dataset.k32Sheet?null:b.dataset.k32Sheet;render()});
    document.querySelectorAll("[data-k32-sort]").forEach(b=>b.onclick=()=>{ui.sort=b.dataset.k32Sort;ui.sheet=null;render()});
    document.querySelectorAll("[data-k32-kind]").forEach(b=>b.onclick=()=>{ui.kind=b.dataset.k32Kind;render()});
    document.querySelectorAll("[data-k32-band]").forEach(b=>b.onclick=()=>{ui.band=b.dataset.k32Band;render()});
    document.querySelectorAll("[data-k32-cat]").forEach(b=>b.onclick=()=>{ui.cat=b.dataset.k32Cat;render()});
    const oo=$("k32-offers-only"); if(oo)oo.onchange=()=>{ui.offersOnly=oo.checked;render()};
    const rs=document.querySelector("[data-k32-reset]"); if(rs)rs.onclick=()=>{Object.assign(ui,{offersOnly:false,kind:"all",cat:"",band:"",sheet:null});render()};
    document.querySelectorAll("[data-k32-offer]").forEach(b=>b.onclick=()=>setOffer(b.dataset.k32Offer));
    const sh=$("k32-share"); if(sh)sh.onclick=shareOffers;
  }
  function attach(){
    const tabs=document.querySelector(".sk-tabs");
    if(!tabs||tabs.querySelector("[data-k32-tab]"))return !!tabs;
    tabs.insertAdjacentHTML("afterbegin",'<button type="button" data-k32-tab="1">الكتالوج</button>');
    tabs.querySelector("[data-k32-tab]").onclick=render;
    /* أي تبويب آخر (V30 أو V31، مهما كان ترتيب تحميلها) يزيل تمييز الكتالوج */
    tabs.addEventListener("click",e=>{const b=e.target.closest("button");if(b&&!b.hasAttribute("data-k32-tab")){active=false;tabs.querySelector("[data-k32-tab]")?.classList.remove("active")}});
    return true;
  }
  function open(){
    if(window.SKosif&&typeof window.SKosif.open==="function")window.SKosif.open("overview");
    attach();render();
  }
  function init(){
    let tries=0;const t=setInterval(()=>{if(attach()||++tries>40)clearInterval(t)},250);
    window.SKosifCatalog={open,version:"32.0"};
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();
