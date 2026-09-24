/* S.kosif V32 — الكتالوج والعروض الفاخرة
   تصميم مستوحى من أسلوب متجر Eataly للمأكولات الفاخرة والعروض الشهرية:
   - واجهة عروض تحريرية فاخرة (Editorial Gourmet Layout)
   - شبكة مرنة مع مبدل أعمدة العرض (2 / 3 / 4 أعمدة)
   - بطاقات منتجات بشارات الخصم ونسب التوفير، السعر المشطوب، سعر الكيلو، ومنشأ السلالة
   - نافذة تفاعلية راقية لضبط نسبة العرض مع معاينة فورية للهامش والتكلفة
   - شريط تصفية وتصنيف علوي سلس
   - مشاركة العروض بتنسيق تسويقي راقٍ على واتساب
   - قراءة حية من محرك التسعير عبر SKosifCore.catalog() */
(()=>{
  "use strict";
  const OFFERS_KEY="skosif_v32_offers", BIZ="أغنام الوادي", SUBLINE="مختارات الذواقة واللحوم البلدية الفاخرة";
  const $=id=>document.getElementById(id);
  const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
  const nf2=new Intl.NumberFormat("ar-SA",{minimumFractionDigits:2,maximumFractionDigits:2});
  const sar=v=>nf2.format(Number(v)||0);
  const pct=v=>new Intl.NumberFormat("ar-SA",{maximumFractionDigits:1}).format((Number(v)||0)*100)+"٪";
  const load=(k,d)=>{try{const v=JSON.parse(localStorage.getItem(k));return v??d}catch{return d}};
  const save=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true}catch{return false}};
  
  const ui={
    q:"",
    sort:"featured",
    offersOnly:false,
    kind:"all",
    cat:"",
    band:"",
    sheet:null,
    cols: load("skosif_v32_cols", 3),
    modalItem: null
  };

  function toast(msg){
    let t=$("sk-toast");
    if(!t){
      document.body.insertAdjacentHTML("beforeend",'<div id="sk-toast" class="sk-toast"></div>');
      t=$("sk-toast");
    }
    t.textContent=msg;
    t.classList.add("show");
    clearTimeout(t._tm);
    t._tm=setTimeout(()=>t.classList.remove("show"),3200);
  }

  function data(){
    try{
      if(window.SKosifCore&&window.SKosifCore.catalog)return window.SKosifCore.catalog();
    }catch(e){
      console.warn("catalog bridge",e);
    }
    return {vat:0.15,netBase:true,items:[]};
  }

  function withOffer(it,d,offers){
    const off=Number(offers[it.id])||0;
    if(!(off>0)||!(it.price>0))return {...it,off:0,now:it.price};
    const now=Math.round(it.price*(1-off)*100)/100;
    const base=d.netBase?now/(1+d.vat):now;
    const profit=now/(1+d.vat)-(it.cost||0);
    return {
      ...it,
      off,
      now,
      nowMargin:base>0?profit/base:null,
      belowCost:it.cost!=null&&now<it.cost*(1+d.vat)
    };
  }

  const ICON=(it)=>{
    if(it.kind==="box")return "📦";
    const t=(it.cat+" "+it.name).toLowerCase();
    if(/بقر|عجل/.test(t))return "🐄";
    if(/ماعز|تيس|عارضي/.test(t))return "🐐";
    if(/حاشي|جمل|قعود/.test(t))return "🐪";
    if(/دجاج|طيور|دواجن/.test(t))return "🐔";
    if(/شحم|دهن/.test(t))return "🧈";
    if(/كبد|معلاق|كوارع|مقادم|فشة/.test(t))return "🍖";
    return "🐑";
  };

  /* أصل وسلالة المنتج بأسلوب Eataly Gourmet */
  const ORIGIN=(it)=>{
    const t=it.cat+" "+it.name;
    if(/نجدي/.test(t))return "سلالة نجدية";
    if(/نعيمي/.test(t))return "مراعي الشمال";
    if(/حري/.test(t))return "حري بلدي فاخر";
    if(/عارضي/.test(t))return "عارضي أصيل";
    if(/حاشي|قعود/.test(t))return "حاشي بلدي طازج";
    if(/عجل/.test(t))return "عجل بلدي مبرد";
    if(it.kind==="box")return "تشكيلة مختارة";
    return "مزارع الوادي";
  };

  const PRODUCER = "أغنام الوادي • ذبح وإعداد طازج";

  const BAND={
    ex:["ممتاز","ex"],
    good:["جيد","good"],
    low:["ضعيف","low"],
    loss:["خسارة","loss"],
    by:["منتج ثانوي","na"],
    na:["بلا تسعير","na"]
  };

  function listItems(){
    const d=data(), offers=load(OFFERS_KEY,{});
    let items=d.items.filter(it=>it.status!=="archived").map(it=>withOffer(it,d,offers));
    const q=ui.q.trim().toLowerCase();
    if(q)items=items.filter(it=>(it.name+" "+it.cat+" "+ORIGIN(it)).toLowerCase().includes(q));
    if(ui.offersOnly)items=items.filter(it=>it.off>0);
    if(ui.kind!=="all")items=items.filter(it=>it.kind===ui.kind);
    if(ui.cat)items=items.filter(it=>it.cat===ui.cat);
    if(ui.band)items=items.filter(it=>it.band===ui.band);

    const m=x=>x.off>0?(x.nowMargin??-9):(x.margin??-9);
    const p=x=>x.now??x.price??0;
    const offPct=x=>x.off||0;
    const grp=x=>x.kind==="box"?0:x.byProduct?2:1;

    const S={
      "featured":(a,b)=>grp(a)-grp(b)||(offPct(b)-offPct(a))||(m(b)-m(a)),
      "discount-desc":(a,b)=>(offPct(b)-offPct(a))||(p(b)-p(a)),
      "margin-desc":(a,b)=>m(b)-m(a),
      "margin-asc":(a,b)=>m(a)-m(b),
      "price-asc":(a,b)=>p(a)-p(b),
      "price-desc":(a,b)=>p(b)-p(a),
      "name":(a,b)=>a.name.localeCompare(b.name,"ar")
    };
    items.sort(S[ui.sort]||S.featured);
    return {d,items,all:d.items.filter(it=>it.status!=="archived"),offers};
  }

  function card(it){
    const b=BAND[it.band]||BAND.na;
    const marg=it.off>0?it.nowMargin:it.margin;
    const hasOffer=it.off>0;
    const originTag=ORIGIN(it);

    return '<article class="k32-card" data-id="'+esc(it.id)+'">'+
      '<div class="k32-img">'+
        '<span aria-hidden="true">'+ICON(it)+'</span>'+
        (hasOffer?'<em class="k32-badge">عرض −'+pct(it.off)+'</em>':'')+
        '<i class="k32-kind">'+(it.kind==="box"?"بوكس فاخر":"صنف بلدي")+'</i>'+
        '<span class="k32-origin">'+esc(originTag)+'</span>'+
      '</div>'+
      '<div class="k32-producer">'+esc(PRODUCER)+'</div>'+
      '<h4>'+esc(it.name)+'</h4>'+
      '<span class="k32-cat-tag">'+esc(it.cat||"منتجات طازجة")+'</span>'+
      '<div class="k32-margin k32-'+b[1]+'">'+
        (it.byProduct||marg==null?b[0]:'هامش '+pct(marg))+
        (it.belowCost?' · تنبيه: تحت التكلفة':'')+
      '</div>'+
      '<div class="k32-price">'+
        '<div class="k32-unit">'+
          (it.kind==="box"&&it.pricePerKg
            ?'<span>'+sar(hasOffer?it.pricePerKg*(1-it.off):it.pricePerKg)+' ر.س/كجم</span>'+
             (it.weight?'<span>وزن: '+new Intl.NumberFormat("ar-SA",{maximumFractionDigits:2}).format(it.weight)+' كجم</span>':'')
            :(it.kind==="raw"?'<span>سعر الكيلو</span>':'<span>للوحدة</span>'))+
        '</div>'+
        '<div class="k32-now">'+
          (hasOffer?'<s>'+sar(it.price)+' ر.س</s>':'')+
          (it.now!=null?'<b>'+sar(it.now)+'</b><small>ر.س</small>':'<b>—</b>')+
        '</div>'+
      '</div>'+
      '<button class="k32-btn'+(hasOffer?' has-offer':'')+'" type="button" data-k32-offer="'+esc(it.id)+'">'+
        (hasOffer?'<span>🏷️ تعديل العرض ('+pct(it.off)+')</span>':'<span>+ إضافة عرض موسمي</span>')+
      '</button>'+
    '</article>';
  }

  function sheetHTML(all){
    if(ui.sheet==="sort"){
      const opts=[
        ["featured","المقترح للذواقة (Featured)"],
        ["discount-desc","الأعلى تخفيضاً (Biggest Discount)"],
        ["margin-desc","الأعلى هامشاً ربحياً"],
        ["margin-asc","الأقل هامشاً ربحياً"],
        ["price-asc","السعر: من الأقل للأعلى"],
        ["price-desc","السعر: من الأعلى للأقل"],
        ["name","الترتيب الأبجدي"]
      ];
      return '<div class="k32-sheet">'+opts.map(o=>
        '<button type="button" class="'+(ui.sort===o[0]?'on':'')+'" data-k32-sort="'+o[0]+'">'+
          '<span>'+o[1]+'</span>'+
        '</button>'
      ).join("")+'</div>';
    }
    if(ui.sheet==="filter"){
      const cats=[...new Set(all.map(x=>x.cat).filter(Boolean))];
      const chip=(attr,val,label,on)=>'<button type="button" class="k32-chip'+(on?' on':'')+'" '+attr+'="'+esc(val)+'">'+esc(label)+'</button>';
      return '<div class="k32-sheet k32-filter">'+
        '<label class="k32-toggle">'+
          '<span>عروض الشهر والتخفيضات فقط (On Sale)</span>'+
          '<input type="checkbox" id="k32-offers-only"'+(ui.offersOnly?' checked':'')+'>'+
          '<i></i>'+
        '</label>'+
        '<div class="k32-group"><b>نوع المنتج</b>'+
          [["all","الكل"],["raw","أصناف ولحوم"],["box","بوكسات عائلية"]].map(o=>chip("data-k32-kind",o[0],o[1],ui.kind===o[0])).join("")+
        '</div>'+
        '<div class="k32-group"><b>مستوى الهامش</b>'+
          chip("data-k32-band","","الكل",!ui.band)+
          [["ex","ممتاز"],["good","جيد"],["low","ضعيف"],["loss","خسارة"]].map(o=>chip("data-k32-band",o[0],o[1],ui.band===o[0])).join("")+
        '</div>'+
        '<div class="k32-group"><b>التصنيف والقطع</b>'+
          chip("data-k32-cat","","جميع التصنيفات",!ui.cat)+
          cats.map(c=>chip("data-k32-cat",c,c,ui.cat===c)).join("")+
        '</div>'+
        '<button type="button" class="k32-reset" data-k32-reset="1">إعادة تعيين كافة الفلاتر</button>'+
      '</div>';
    }
    return "";
  }

  function modalHTML(){
    if(!ui.modalItem)return "";
    const it=ui.modalItem;
    const curPct=Math.round((it.off||0)*100);
    const presets=[5, 10, 15, 20, 25, 30, 40, 50];

    return '<div class="k32-modal-wrap" id="k32-modal">'+
      '<div class="k32-modal">'+
        '<div class="k32-modal-head">'+
          '<div>'+
            '<h4>عرض خاص: '+esc(it.name)+'</h4>'+
            '<small style="color:var(--k32-mute)">'+esc(ORIGIN(it))+'</small>'+
          '</div>'+
          '<button type="button" class="k32-modal-close" id="k32-modal-x">✕</button>'+
        '</div>'+
        '<p style="font-size:13px;line-height:1.6;color:var(--k32-ink-light);margin:0 0 12px">'+
          'اختر نسبة الخصم المرغوبة للمنتج في كتالوج العروض الشهرية:'+
        '</p>'+
        '<div class="k32-preset-btns">'+
          presets.map(p=>'<button type="button" class="k32-preset-btn" data-preset="'+p+'">−'+p+'٪</button>').join("")+
        '</div>'+
        '<label style="display:block;font-size:12.5px;font-weight:700;margin-bottom:6px">نسبة الخصم المخصصة (٪):</label>'+
        '<div style="display:flex;gap:8px">'+
          '<input type="number" id="k32-modal-input" min="0" max="90" step="1" value="'+(curPct||"")+'" placeholder="مثلاً: 15" style="flex:1;height:44px;border:1px solid var(--k32-line);border-radius:10px;padding:0 12px;font:inherit;font-size:16px;background:var(--k32-card-subtle);color:inherit">'+
          '<button type="button" id="k32-modal-apply" style="border:0;background:var(--k32-wine);color:#fff;border-radius:10px;padding:0 20px;font:inherit;font-weight:700;cursor:pointer">تطبيق</button>'+
        '</div>'+
        '<div class="k32-preview-box">'+
          '<div class="k32-preview-row"><span>السعر الأساسي:</span><b>'+sar(it.price)+' ر.س</b></div>'+
          '<div class="k32-preview-row"><span>سعر التكلفة:</span><b>'+(it.cost?sar(it.cost)+' ر.س':'—')+'</b></div>'+
          '<div class="k32-preview-row"><span>السعر بعد العرض:</span><b id="k32-prev-price" style="color:var(--k32-wine)">'+sar(it.now||it.price)+' ر.س</b></div>'+
        '</div>'+
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:14px">'+
          '<button type="button" id="k32-modal-clear" style="border:0;background:transparent;color:var(--k32-wine);font:inherit;font-size:12.5px;font-weight:700;cursor:pointer">إلغاء العرض تماماً</button>'+
          '<button type="button" id="k32-modal-close-btn" style="border:1px solid var(--k32-line);background:var(--k32-card-subtle);border-radius:8px;padding:8px 16px;font:inherit;font-size:13px;cursor:pointer;color:inherit">إغلاق</button>'+
        '</div>'+
      '</div>'+
    '</div>';
  }

  function html(){
    const {items,all,offers}=listItems();
    const nOffers=Object.keys(offers).filter(id=>all.some(x=>x.id===id)).length;
    const filtered=ui.offersOnly||ui.kind!=="all"||ui.cat||ui.band;
    const cats=[...new Set(all.map(x=>x.cat).filter(Boolean))];

    return '<div class="k32">'+
      /* Hero Banner */
      '<section class="k32-hero">'+
        '<div class="k32-hero-top">'+
          '<div class="k32-hero-brand"><span>'+esc(BIZ)+'</span> • Eataly Inspired Selections</div>'+
          '<div class="k32-hero-actions">'+
            '<button type="button" class="k32-share" id="k32-share"'+(nOffers?'':' disabled')+'>'+
              '<span>📤 مشاركة العروض ('+nOffers+')</span>'+
            '</button>'+
          '</div>'+
        '</div>'+
        '<div class="k32-hero-content">'+
          '<h3>'+(ui.offersOnly?'عروض الشهر الحصرية • Monthly Offers':'الكتالوج ومختارات الذواقة')+'</h3>'+
          '<p>'+esc(SUBLINE)+' — تجربة استثنائية من المراعي الطبيعية تُجهز وتُقطع وفق أرقى معايير الجودة.</p>'+
        '</div>'+
        '<div class="k32-hero-meta">'+
          '<div class="k32-meta-pill">إجمالي الأصناف: <b>'+items.length+'</b></div>'+
          '<div class="k32-meta-pill">العروض النشطة: <b>'+nOffers+' عرض خاص</b></div>'+
          '<div class="k32-meta-pill">الضريبة: <b>شامل 15٪</b></div>'+
        '</div>'+
      '</section>'+

      /* Search & Layout Controls Bar */
      '<div class="k32-search-row">'+
        '<label class="k32-search">'+
          '<input id="k32-q" type="search" placeholder="ابحث بالاسم، السلالة، أو التصنيف (مثل: نعيمي، بوكس، حري)..." value="'+esc(ui.q)+'">'+
          '<span class="k32-search-icon">🔍</span>'+
        '</label>'+
      '</div>'+

      /* Quick Category Filter Pills (Eataly Navigation Style) */
      '<nav class="k32-cat-nav" aria-label="أقسام الكتالوج">'+
        '<button type="button" class="k32-cat-chip'+(!ui.cat&&!ui.offersOnly&&ui.kind==="all"?' on':'')+'" data-k32-quick="all">جميع المختارات</button>'+
        '<button type="button" class="k32-cat-chip'+(ui.offersOnly?' on':'')+'" data-k32-quick="offers" style="color:var(--k32-wine)">🔥 عروض الشهر</button>'+
        '<button type="button" class="k32-cat-chip'+(ui.kind==="box"?' on':'')+'" data-k32-quick="box">📦 البوكسات العائلية</button>'+
        '<button type="button" class="k32-cat-chip'+(ui.kind==="raw"&&!ui.cat?' on':'')+'" data-k32-quick="raw">🥩 الأصناف والذبائح</button>'+
        cats.slice(0,5).map(c=>'<button type="button" class="k32-cat-chip'+(ui.cat===c?' on':'')+'" data-k32-quick-cat="'+esc(c)+'">'+esc(c)+'</button>').join("")+
      '</nav>'+

      /* Sticky Action & Filter Bar */
      '<div class="k32-bar">'+
        '<div class="k32-bar-actions">'+
          '<button type="button" data-k32-sheet="sort" class="k32-btn-toggle '+(ui.sheet==="sort"?'on':'')+'">'+
            '<span>⇅ ترتيب</span>'+
          '</button>'+
          '<button type="button" data-k32-sheet="filter" class="k32-btn-toggle '+(ui.sheet==="filter"||filtered?'on':'')+'">'+
            '<span>⚲ تصفية</span>'+
            (filtered?'<span class="badge-dot"></span>':'')+
          '</button>'+
        '</div>'+
        '<div class="k32-grid-layout-selector">'+
          '<span style="font-size:12px;color:var(--k32-mute)">عرض:</span>'+
          '<button type="button" class="k32-layout-btn '+(ui.cols===2?'on':'')+'" data-k32-cols="2" title="عمودين">⚏</button>'+
          '<button type="button" class="k32-layout-btn '+(ui.cols===3?'on':'')+'" data-k32-cols="3" title="3 أعمدة">☰</button>'+
          '<button type="button" class="k32-layout-btn '+(ui.cols===4?'on':'')+'" data-k32-cols="4" title="4 أعمدة">▦</button>'+
        '</div>'+
      '</div>'+

      /* Drawers */
      sheetHTML(all)+

      /* Product Grid */
      (items.length
        ? '<div class="k32-grid" data-cols="'+ui.cols+'">'+items.map(card).join("")+'</div>'
        : '<div class="sk-empty">'+(all.length?'لا توجد منتجات مطابقة لمعايير البحث الحالية.':'الكتالوج فارغ حالياً.')+'</div>')+

      /* Modal */
      modalHTML()+
    '</div>';
  }

  function openOfferModal(id){
    const {all}=listItems();
    const it=all.find(x=>x.id===id);
    if(!it)return;
    ui.modalItem=it;
    render();
  }

  function applyOffer(id, percentage){
    const {all}=listItems();
    const it=all.find(x=>x.id===id);
    if(!it)return;
    const offers=load(OFFERS_KEY,{});
    const n=Number(percentage);

    if(!isFinite(n)||n<0||n>90){
      toast("الرجاء إدخال نسبة صحيحة بين 0 و 90٪");
      return;
    }

    if(n===0){
      delete offers[id];
    } else {
      offers[id]=n/100;
    }
    save(OFFERS_KEY,offers);

    const d=data(), w=withOffer(it,d,offers);
    if(w.belowCost){
      toast("تنبيه: سعر العرض الجديد أصبح أقل من تكلفة صنف «"+it.name+"»");
    } else {
      toast(n>0 ? "تم تطبيق عرض −"+n+"٪ على «"+it.name+"» بنجاح" : "تم إلغاء العرض بنجاح");
    }
    ui.modalItem=null;
    render();
  }

  function setOffer(id){
    openOfferModal(id);
  }

  function shareOffers(){
    const {d,all,offers}=listItems();
    const list=all.map(it=>withOffer(it,d,offers)).filter(it=>it.off>0&&it.now!=null);
    if(!list.length){
      toast("لا توجد عروض نشطة لمشاركتها حالياً.");
      return;
    }

    const lines=[
      "🌿 *قائمة عروض ومختارات "+BIZ+"*",
      "✨ *Gourmet Monthly Selections*",
      "─────────────────",
      ""
    ];

    list.forEach(it=>{
      const unitTxt = it.kind==="box"&&it.pricePerKg
        ? " ("+sar(it.pricePerKg*(1-it.off))+" ر.س/كجم)"
        : (it.kind==="raw" ? " (سعر الكيلو)" : "");
      lines.push("• *"+it.name+"* ("+ORIGIN(it)+")");
      lines.push("  سعر العرض: *"+sar(it.now)+" ر.س* بدل ~"+sar(it.price)+" ر.س~ (توفير "+pct(it.off)+")"+unitTxt);
      lines.push("");
    });

    lines.push("─────────────────");
    lines.push("🥩 اللحوم تُذبح طازجة وتُقطع وتُغلف حسب الطلب");
    lines.push("🚚 التوصيل مبرد ومعقم حتى باب منزلك");
    lines.push("📲 للطلب والاستفسار يرجى الرد على هذه الرسالة 🌿");

    const text=lines.join("\n");
    window.open("https://wa.me/?text="+encodeURIComponent(text),"_blank","noopener");
  }

  let active=false;
  function render(){
    const body=$("sk-body");
    if(!body)return;
    active=true;
    document.querySelectorAll("[data-sk-tab],[data-sk31-tab]").forEach(b=>b.classList.remove("active"));
    const tab=document.querySelector('[data-k32-tab]');
    if(tab){
      tab.classList.add("active");
      tab.scrollIntoView&&tab.scrollIntoView({block:"nearest",inline:"nearest"});
    }
    const y=body.closest(".sk-panel")?.scrollTop||0;
    body.innerHTML=html();
    bind();
    const panel=body.closest(".sk-panel");
    if(panel)panel.scrollTop=y;
  }

  function bind(){
    const q=$("k32-q");
    if(q){
      q.oninput=()=>{
        ui.q=q.value;
        clearTimeout(q._t);
        q._t=setTimeout(()=>{
          render();
          const n=$("k32-q");
          if(n){
            n.focus();
            n.setSelectionRange(n.value.length,n.value.length);
          }
        },200);
      };
    }

    document.querySelectorAll("[data-k32-sheet]").forEach(b=>b.onclick=()=>{
      ui.sheet=ui.sheet===b.dataset.k32Sheet?null:b.dataset.k32Sheet;
      render();
    });

    document.querySelectorAll("[data-k32-sort]").forEach(b=>b.onclick=()=>{
      ui.sort=b.dataset.k32Sort;
      ui.sheet=null;
      render();
    });

    document.querySelectorAll("[data-k32-kind]").forEach(b=>b.onclick=()=>{
      ui.kind=b.dataset.k32Kind;
      render();
    });

    document.querySelectorAll("[data-k32-band]").forEach(b=>b.onclick=()=>{
      ui.band=b.dataset.k32Band;
      render();
    });

    document.querySelectorAll("[data-k32-cat]").forEach(b=>b.onclick=()=>{
      ui.cat=b.dataset.k32Cat;
      render();
    });

    document.querySelectorAll("[data-k32-quick]").forEach(b=>b.onclick=()=>{
      const v=b.dataset.k32Quick;
      if(v==="all"){
        Object.assign(ui,{offersOnly:false,kind:"all",cat:""});
      } else if(v==="offers"){
        ui.offersOnly=!ui.offersOnly;
      } else if(v==="box"){
        ui.kind=ui.kind==="box"?"all":"box";
        ui.offersOnly=false;
      } else if(v==="raw"){
        ui.kind=ui.kind==="raw"?"all":"raw";
        ui.offersOnly=false;
      }
      render();
    });

    document.querySelectorAll("[data-k32-quick-cat]").forEach(b=>b.onclick=()=>{
      const c=b.dataset.k32QuickCat;
      ui.cat=ui.cat===c?"":c;
      render();
    });

    document.querySelectorAll("[data-k32-cols]").forEach(b=>b.onclick=()=>{
      const c=Number(b.dataset.k32Cols)||3;
      ui.cols=c;
      save("skosif_v32_cols",c);
      render();
    });

    const oo=$("k32-offers-only");
    if(oo)oo.onchange=()=>{
      ui.offersOnly=oo.checked;
      render();
    };

    const rs=document.querySelector("[data-k32-reset]");
    if(rs)rs.onclick=()=>{
      Object.assign(ui,{offersOnly:false,kind:"all",cat:"",band:"",sheet:null,q:""});
      render();
    };

    document.querySelectorAll("[data-k32-offer]").forEach(b=>b.onclick=()=>setOffer(b.dataset.k32Offer));
    const sh=$("k32-share");
    if(sh)sh.onclick=shareOffers;

    /* Modal Events */
    const modalX=$("k32-modal-x"), modalCloseBtn=$("k32-modal-close-btn");
    const closeModal=()=>{ui.modalItem=null;render()};
    if(modalX)modalX.onclick=closeModal;
    if(modalCloseBtn)modalCloseBtn.onclick=closeModal;

    document.querySelectorAll(".k32-preset-btn").forEach(b=>b.onclick=()=>{
      const p=b.dataset.preset;
      const input=$("k32-modal-input");
      if(input)input.value=p;
      if(ui.modalItem){
        const base=ui.modalItem.price||0;
        const now=Math.round(base*(1-Number(p)/100)*100)/100;
        const prev=$("k32-prev-price");
        if(prev)prev.textContent=sar(now)+" ر.س";
      }
    });

    const modalInput=$("k32-modal-input");
    if(modalInput){
      modalInput.oninput=()=>{
        const p=Number(modalInput.value)||0;
        if(ui.modalItem){
          const base=ui.modalItem.price||0;
          const now=Math.round(base*(1-p/100)*100)/100;
          const prev=$("k32-prev-price");
          if(prev)prev.textContent=sar(now)+" ر.س";
        }
      };
    }

    const modalApply=$("k32-modal-apply");
    if(modalApply&&ui.modalItem){
      modalApply.onclick=()=>{
        const val=$("k32-modal-input")?.value;
        applyOffer(ui.modalItem.id, val);
      };
    }

    const modalClear=$("k32-modal-clear");
    if(modalClear&&ui.modalItem){
      modalClear.onclick=()=>{
        applyOffer(ui.modalItem.id, 0);
      };
    }
  }

  function attach(){
    const tabs=document.querySelector(".sk-tabs");
    if(!tabs||tabs.querySelector("[data-k32-tab]"))return !!tabs;
    tabs.insertAdjacentHTML("afterbegin",'<button type="button" data-k32-tab="1">الكتالوج والعروض</button>');
    tabs.querySelector("[data-k32-tab]").onclick=render;
    tabs.addEventListener("click",e=>{
      const b=e.target.closest("button");
      if(b&&!b.hasAttribute("data-k32-tab")){
        active=false;
        tabs.querySelector("[data-k32-tab]")?.classList.remove("active");
      }
    });
    return true;
  }

  function open(){
    if(window.SKosif&&typeof window.SKosif.open==="function")window.SKosif.open("overview");
    attach();
    render();
  }

  function init(){
    let tries=0;
    const t=setInterval(()=>{
      if(attach()||++tries>40)clearInterval(t);
    },250);
    window.SKosifCatalog={open,version:"32.5"};
  }

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});
  else init();
})();
