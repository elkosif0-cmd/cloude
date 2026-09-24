/* S.kosif — الكتالوج والعروض الفاخرة + حاسبة الطلبيات وعروض الأسعار
   تصميم وقدرات مستوحاة من متجر Eataly للمأكولات الفاخرة والعروض الشهرية:
   - واجهة عروض تحريرية فاخرة (Editorial Gourmet Layout)
   - شبكة مرنة مع مبدل أعمدة العرض (2 / 3 / 4 أعمدة)
   - حاسبة وسلة طلبيات فورية (Order & Quotation Cart Builder)
   - بطاقات منتجات بشارات الخصم، حساب التوفير بالريال، السعر المشطوب، وسعر الكيلو
   - تصدير الكتالوج والعروض إلى ملف Excel / CSV بنقرة واحدة
   - إنشاء ومشاركة عروض أسعار وفواتير أولية منسقة للعملاء عبر واتساب
   - نافذة تفاعلية راقية لضبط نسبة الخصم مع معاينة فورية للهامش والتكلفة
   - قراءة حية من محرك التسعير عبر SKosifCore.catalog() */
(()=>{
  "use strict";
  const OFFERS_KEY="skosif_v32_offers", CART_KEY="skosif_v32_cart", BIZ="أغنام الوادي", SUBLINE="مختارات الذواقة واللحوم البلدية الفاخرة";
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
    budget:"",
    sheet:null,
    cols: load("skosif_v32_cols", 3),
    modalItem: null,
    cartOpen: false,
    custName: load("skosif_v32_cust_name", ""),
    custNotes: load("skosif_v32_cust_notes", "")
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
    if(!(off>0)||!(it.price>0))return {...it,off:0,now:it.price,saving:0};
    const now=Math.round(it.price*(1-off)*100)/100;
    const saving=Math.round((it.price-now)*100)/100;
    const base=d.netBase?now/(1+d.vat):now;
    const profit=now/(1+d.vat)-(it.cost||0);
    return {
      ...it,
      off,
      now,
      saving,
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

    if(ui.budget==="low")items=items.filter(it=>(it.now||it.price)<=250);
    else if(ui.budget==="mid")items=items.filter(it=>{const p=(it.now||it.price);return p>250&&p<=500;});
    else if(ui.budget==="high")items=items.filter(it=>(it.now||it.price)>500);

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

  /* ---------- سلة الطلبات وعروض الأسعار (Cart Management) ---------- */
  function getCart(){
    return load(CART_KEY, {});
  }
  function setCart(cart){
    save(CART_KEY, cart);
  }
  function addToCart(id, qty=1){
    const cart=getCart();
    cart[id]=(cart[id]||0)+qty;
    if(cart[id]<=0)delete cart[id];
    setCart(cart);
    const {all}=listItems();
    const item=all.find(x=>x.id===id);
    if(item)toast("تمت إضافة «"+item.name+"» إلى سلة الطلب 🛒");
    render();
  }
  function updateCartQty(id, delta){
    const cart=getCart();
    const cur=cart[id]||0;
    const nxt=cur+delta;
    if(nxt<=0)delete cart[id];
    else cart[id]=nxt;
    setCart(cart);
    render();
  }
  function clearCart(){
    setCart({});
    toast("تم إفراغ سلة الطلب");
    render();
  }

  function getCartTotals(){
    const cart=getCart(), {all, d, offers}=listItems();
    let totalItems=0, subtotal=0, totalSavings=0, netTotal=0;
    const lines=[];

    for(const [id, qty] of Object.entries(cart)){
      if(qty<=0)continue;
      const raw=all.find(x=>x.id===id);
      if(!raw)continue;
      const it=withOffer(raw, d, offers);
      const originalPrice=it.price*qty;
      const actualPrice=(it.now||it.price)*qty;
      const savings=(it.saving||0)*qty;

      totalItems+=qty;
      subtotal+=originalPrice;
      netTotal+=actualPrice;
      totalSavings+=savings;

      lines.push({
        item: it,
        qty,
        originalPrice,
        actualPrice,
        savings
      });
    }
    return {totalItems, subtotal, netTotal, totalSavings, lines};
  }

  /* ---------- تصدير الكتالوج إلى ملف Excel / CSV ---------- */
  function exportCatalogCSV(){
    const {all, d, offers}=listItems();
    if(!all.length){
      toast("الكتالوج فارغ حالياً.");
      return;
    }

    const headers=["المعرف","اسم الصنف","التصنيف","السلالة/المصدر","النوع","السعر الأساسي (ر.س)","نسبة الخصم","سعر العرض (ر.س)","مقدار التوفير (ر.س)","سعر الكيلو (ر.س)","الوزن التقريبي (كجم)","حالة الهامش"];
    const rows=[headers];

    all.forEach(raw=>{
      const it=withOffer(raw, d, offers);
      rows.push([
        it.id||"",
        it.name||"",
        it.cat||"",
        ORIGIN(it),
        it.kind==="box"?"بوكس فاخر":"صنف",
        it.price!=null?it.price.toFixed(2):"",
        it.off>0?Math.round(it.off*100)+"%":"0%",
        it.now!=null?it.now.toFixed(2):"",
        it.saving>0?it.saving.toFixed(2):"0",
        it.pricePerKg!=null?it.pricePerKg.toFixed(2):"",
        it.weight!=null?it.weight:"",
        (BAND[it.band]||BAND.na)[0]
      ]);
    });

    const csvContent="\uFEFF"+rows.map(r=>r.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(",")).join("\r\n");
    const blob=new Blob([csvContent],{type:"text/csv;charset=utf-8;"});
    const url=URL.createObjectURL(blob);
    const link=document.createElement("a");
    link.href=url;
    link.download="كتالوج_وعروض_"+BIZ.replace(/\s+/g,"_")+"_"+new Date().toISOString().slice(0,10)+".csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast("تم تصدير ملف الكتالوج بصيغة Excel / CSV بنجاح 📊");
  }

  /* ---------- مشاركة عرض السعر للعميل عبر واتساب ---------- */
  function sendCustomerQuotation(){
    const {totalItems, subtotal, netTotal, totalSavings, lines}=getCartTotals();
    if(!totalItems){
      toast("سلة الطلب فارغة حالياً.");
      return;
    }

    const custName=ui.custName.trim()||"العميل الكريم";
    const notes=ui.custNotes.trim();

    const msg=[
      "🌿 *عرض سعر وطلبية — "+BIZ+"*",
      "✨ *Gourmet Order Quotation*",
      "─────────────────",
      "👤 *العميل:* "+custName,
      "📅 *التاريخ:* "+new Date().toLocaleDateString("ar-SA"),
      ""
    ];

    lines.forEach((l, idx)=>{
      const unitSpec=l.item.kind==="box"&&l.item.pricePerKg?" ("+sar(l.item.pricePerKg)+" ر.س/كجم)":"";
      msg.push((idx+1)+". *"+l.item.name+"* ("+ORIGIN(l.item)+")");
      msg.push("   الكمية: *"+l.qty+"* × "+sar(l.item.now||l.item.price)+" ر.س"+unitSpec);
      if(l.savings>0){
        msg.push("   (وفرت: "+sar(l.savings)+" ر.س)");
      }
      msg.push("   الإجمالي: *"+sar(l.actualPrice)+" ر.س*");
      msg.push("");
    });

    msg.push("─────────────────");
    if(totalSavings>0){
      msg.push("💰 *المجموع قبل الخصم:* "+sar(subtotal)+" ر.س");
      msg.push("🎁 *إجمالي الخصم والتوفير:* −"+sar(totalSavings)+" ر.س");
    }
    msg.push("💳 *المبلغ النهائي المطلوب:* *"+sar(netTotal)+" ر.س*");
    msg.push("📌 *الأسعار شاملة ضريبة القيمة المضافة (15٪)*");

    if(notes){
      msg.push("");
      msg.push("📝 *ملاحظات التقطيع والتوصيل:*");
      msg.push(notes);
    }

    msg.push("");
    msg.push("🥩 *الذبح طازج والتجهيز يومي والتوصيل مبرد ومعقم حتى باب منزلك.*");
    msg.push("📲 لتأكيد الطلب برجاء الرد على هذه الرسالة 🌿");

    const text=msg.join("\n");
    window.open("https://wa.me/?text="+encodeURIComponent(text),"_blank","noopener");
  }

  function copyQuotation(){
    const {totalItems, subtotal, netTotal, totalSavings, lines}=getCartTotals();
    if(!totalItems){
      toast("السلة فارغة.");
      return;
    }
    const linesTxt=lines.map((l,i)=>(i+1)+". "+l.item.name+" ("+l.qty+"× "+sar(l.item.now||l.item.price)+" ر.س) = "+sar(l.actualPrice)+" ر.س").join("\n");
    const summary="عرض سعر "+BIZ+"\n"+linesTxt+"\nالإجمالي: "+sar(netTotal)+" ر.س (شامل الضريبة)";
    navigator.clipboard.writeText(summary).then(()=>{
      toast("تم نسخ تفاصيل عرض السعر إلى الحافظة بنجاح 📋");
    }).catch(()=>{
      toast("تعذر النسخ التلقائي.");
    });
  }

  function card(it){
    const b=BAND[it.band]||BAND.na;
    const marg=it.off>0?it.nowMargin:it.margin;
    const hasOffer=it.off>0;
    const originTag=ORIGIN(it);
    const cart=getCart();
    const inCartQty=cart[it.id]||0;

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
        (it.saving>0?'<span class="k32-savings">وفر '+sar(it.saving)+' ر.س</span>':'')+
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
      '<div class="k32-card-actions">'+
        '<button class="k32-cart-btn" type="button" data-k32-add="'+esc(it.id)+'">'+
          (inCartQty>0?'<span>🛒 بالطلب ('+inCartQty+') +</span>':'<span>🛒 أضف للطلب</span>')+
        '</button>'+
        '<button class="k32-opt-btn'+(hasOffer?' has-offer':'')+'" type="button" data-k32-offer="'+esc(it.id)+'" title="تعديل نسبة الخصم">'+
          '🏷️'+
        '</button>'+
      '</div>'+
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
        '<div class="k32-group"><b>ميزانية السعر</b>'+
          chip("data-k32-budget","","الكل",!ui.budget)+
          chip("data-k32-budget","low","أقل من 250 ر.س",ui.budget==="low")+
          chip("data-k32-budget","mid","250 إلى 500 ر.س",ui.budget==="mid")+
          chip("data-k32-budget","high","أكثر من 500 ر.س",ui.budget==="high")+
        '</div>'+
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

  /* درج سلة الطلب وعرض الأسعار */
  function cartDrawerHTML(){
    if(!ui.cartOpen)return "";
    const {totalItems, subtotal, netTotal, totalSavings, lines}=getCartTotals();

    return '<div class="k32-drawer-wrap" id="k32-drawer">'+
      '<div class="k32-drawer">'+
        '<div class="k32-modal-head">'+
          '<div>'+
            '<h4>🛒 سلة طلبيات وعروض الأسعار</h4>'+
            '<small style="color:var(--k32-mute)">'+totalItems+' منتجات مختارة للعميل</small>'+
          '</div>'+
          '<button type="button" class="k32-modal-close" id="k32-drawer-x">✕</button>'+
        '</div>'+

        (lines.length?
          '<div>'+
            '<div style="max-height:260px;overflow-y:auto;padding-right:2px">'+
              lines.map(l=>
                '<div class="k32-cart-item">'+
                  '<div class="k32-cart-item-icon">'+ICON(l.item)+'</div>'+
                  '<div>'+
                    '<b style="display:block;font-size:13.5px">'+esc(l.item.name)+'</b>'+
                    '<span style="font-size:11.5px;color:var(--k32-mute)">'+sar(l.item.now||l.item.price)+' ر.س / الوحدة</span>'+
                  '</div>'+
                  '<div style="text-align:end">'+
                    '<div class="k32-cart-qty">'+
                      '<button type="button" class="k32-qty-btn" data-qty-id="'+esc(l.item.id)+'" data-qty-delta="-1">−</button>'+
                      '<b style="min-width:20px;text-align:center;font-size:13.5px">'+l.qty+'</b>'+
                      '<button type="button" class="k32-qty-btn" data-qty-id="'+esc(l.item.id)+'" data-qty-delta="1">+</button>'+
                    '</div>'+
                    '<b style="display:block;font-size:13px;margin-top:4px;color:var(--k32-wine)">'+sar(l.actualPrice)+' ر.س</b>'+
                  '</div>'+
                '</div>'
              ).join("")+
            '</div>'+

            '<div style="margin:16px 0;border-top:1px solid var(--k32-line);padding-top:12px">'+
              '<label style="display:block;font-size:12px;font-weight:700;margin-bottom:4px">اسم العميل / الجهة:</label>'+
              '<input type="text" id="k32-cust-name" value="'+esc(ui.custName)+'" placeholder="مثال: مطعم الأصيل، أو فلان الفلاني" style="width:100%;box-sizing:border-box;height:38px;border:1px solid var(--k32-line);border-radius:8px;padding:0 10px;font:inherit;font-size:13.5px;background:var(--k32-card-subtle);color:inherit;margin-bottom:8px">'+

              '<label style="display:block;font-size:12px;font-weight:700;margin-bottom:4px">ملاحظات التقطيع والتوصيل:</label>'+
              '<input type="text" id="k32-cust-notes" value="'+esc(ui.custNotes)+'" placeholder="مثال: تقطيع ثلاجة أرباع، تغليف سحب هواء، مفروم ناعم..." style="width:100%;box-sizing:border-box;height:38px;border:1px solid var(--k32-line);border-radius:8px;padding:0 10px;font:inherit;font-size:13.5px;background:var(--k32-card-subtle);color:inherit">'+
            '</div>'+

            '<div class="k32-preview-box">'+
              '<div class="k32-preview-row"><span>المجموع قبل الخصم:</span><b>'+sar(subtotal)+' ر.س</b></div>'+
              (totalSavings>0?'<div class="k32-preview-row" style="color:var(--k32-wine)"><span>إجمالي الخصم والتوفير:</span><b>−'+sar(totalSavings)+' ر.س</b></div>':'')+
              '<div class="k32-preview-row"><span>القيمة المضافة (15٪):</span><b>مشمولة بالسعر</b></div>'+
              '<div class="k32-preview-row" style="font-size:16px;color:var(--k32-green)"><span>الإجمالي المستحق:</span><b>'+sar(netTotal)+' ر.س</b></div>'+
            '</div>'+

            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:14px">'+
              '<button type="button" id="k32-send-quotation" style="border:0;background:#25D366;color:#FFFFFF;border-radius:12px;padding:12px;font:inherit;font-weight:800;font-size:13px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px">'+
                '<span>📲 إرسال بالواتساب</span>'+
              '</button>'+
              '<button type="button" id="k32-copy-quotation" style="border:1px solid var(--k32-line);background:var(--k32-card-subtle);color:inherit;border-radius:12px;padding:12px;font:inherit;font-weight:700;font-size:13px;cursor:pointer">'+
                '📋 نسخ عرض السعر'+
              '</button>'+
            '</div>'+

            '<div style="display:flex;justify-content:space-between;margin-top:14px">'+
              '<button type="button" id="k32-clear-cart" style="border:0;background:transparent;color:var(--k32-wine);font:inherit;font-size:12px;font-weight:700;cursor:pointer">إفراغ السلة</button>'+
              '<button type="button" id="k32-drawer-close-btn" style="border:1px solid var(--k32-line);background:var(--k32-card-subtle);border-radius:8px;padding:6px 14px;font:inherit;font-size:12.5px;cursor:pointer;color:inherit">متابعة التصفح</button>'+
            '</div>'+
          '</div>'
          : '<div class="sk-empty" style="padding:40px 10px">السلة فارغة حالياً.<br>اضغط زر «🛒 أضف للطلب» بجانب أي منتج لإضافته لعرض السعر.</div>'
        )+
      '</div>'+
    '</div>';
  }

  function html(){
    const {items,all,offers}=listItems();
    const nOffers=Object.keys(offers).filter(id=>all.some(x=>x.id===id)).length;
    const filtered=ui.offersOnly||ui.kind!=="all"||ui.cat||ui.band||ui.budget;
    const cats=[...new Set(all.map(x=>x.cat).filter(Boolean))];
    const {totalItems, netTotal, totalSavings}=getCartTotals();

    return '<div class="k32">'+
      /* Hero Banner */
      '<section class="k32-hero">'+
        '<div class="k32-hero-top">'+
          '<div class="k32-hero-brand"><span>'+esc(BIZ)+'</span> • Eataly Inspired Selections</div>'+
          '<div class="k32-hero-actions">'+
            '<button type="button" class="k32-share" id="k32-share"'+(nOffers?'':' disabled')+'>'+
              '<span>📤 عروض الشهر ('+nOffers+')</span>'+
            '</button>'+
            '<button type="button" class="k32-export-btn" id="k32-export-csv" title="تصدير الكتالوج بصيغة Excel / CSV">'+
              '<span>📊 تصدير Excel</span>'+
            '</button>'+
          '</div>'+
        '</div>'+
        '<div class="k32-hero-content">'+
          '<h3>'+(ui.offersOnly?'عروض الشهر الحصرية • Monthly Offers':'الكتالوج ومختارات الذواقة')+'</h3>'+
          '<p>'+esc(SUBLINE)+' — تجربة استثنائية من المراعي الطبيعية تُجهز وتُقطع وفق أرقى معايير الجودة مع حاسبة طلبيات وعروض أسعار متكاملة.</p>'+
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
        '<button type="button" class="k32-cat-chip'+(!ui.cat&&!ui.offersOnly&&ui.kind==="all"&&!ui.budget?' on':'')+'" data-k32-quick="all">جميع المختارات</button>'+
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

      /* Floating Cart Bar (Appears when items are in cart) */
      (totalItems>0
        ? '<div class="k32-cart-bar">'+
            '<div class="k32-cart-bar-info">'+
              '<div class="k32-cart-badge">🛒 '+totalItems+'</div>'+
              '<div class="k32-cart-summary">'+
                '<b>'+sar(netTotal)+' ر.س</b>'+
                '<span>طلب العميل '+(totalSavings>0?'(وفر '+sar(totalSavings)+' ر.س)':'')+'</span>'+
              '</div>'+
            '</div>'+
            '<button type="button" class="k32-cart-open-btn" id="k32-open-cart-bar">إتمام عرض السعر ➜</button>'+
          '</div>'
        : '')+

      /* Modals */
      modalHTML()+
      cartDrawerHTML()+
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

    document.querySelectorAll("[data-k32-budget]").forEach(b=>b.onclick=()=>{
      ui.budget=b.dataset.k32Budget;
      render();
    });

    document.querySelectorAll("[data-k32-cat]").forEach(b=>b.onclick=()=>{
      ui.cat=b.dataset.k32Cat;
      render();
    });

    document.querySelectorAll("[data-k32-quick]").forEach(b=>b.onclick=()=>{
      const v=b.dataset.k32Quick;
      if(v==="all"){
        Object.assign(ui,{offersOnly:false,kind:"all",cat:"",budget:""});
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
      Object.assign(ui,{offersOnly:false,kind:"all",cat:"",band:"",budget:"",sheet:null,q:""});
      render();
    };

    document.querySelectorAll("[data-k32-offer]").forEach(b=>b.onclick=()=>setOffer(b.dataset.k32Offer));
    document.querySelectorAll("[data-k32-add]").forEach(b=>b.onclick=()=>addToCart(b.dataset.k32Add, 1));

    const sh=$("k32-share");
    if(sh)sh.onclick=shareOffers;

    const expBtn=$("k32-export-csv");
    if(expBtn)expBtn.onclick=exportCatalogCSV;

    const openCartBtn=$("k32-open-cart-bar");
    if(openCartBtn)openCartBtn.onclick=()=>{ui.cartOpen=true;render()};

    /* Drawer Events */
    const drawerX=$("k32-drawer-x"), drawerCloseBtn=$("k32-drawer-close-btn");
    const closeDrawer=()=>{ui.cartOpen=false;render()};
    if(drawerX)drawerX.onclick=closeDrawer;
    if(drawerCloseBtn)drawerCloseBtn.onclick=closeDrawer;

    document.querySelectorAll("[data-qty-id]").forEach(b=>b.onclick=()=>{
      const id=b.dataset.qtyId, delta=Number(b.dataset.qtyDelta)||0;
      updateCartQty(id, delta);
    });

    const sendQBtn=$("k32-send-quotation");
    if(sendQBtn)sendQBtn.onclick=sendCustomerQuotation;

    const copyQBtn=$("k32-copy-quotation");
    if(copyQBtn)copyQBtn.onclick=copyQuotation;

    const clearCartBtn=$("k32-clear-cart");
    if(clearCartBtn)clearCartBtn.onclick=clearCart;

    const custNameInput=$("k32-cust-name");
    if(custNameInput){
      custNameInput.oninput=()=>{
        ui.custName=custNameInput.value;
        save("skosif_v32_cust_name", ui.custName);
      };
    }
    const custNotesInput=$("k32-cust-notes");
    if(custNotesInput){
      custNotesInput.oninput=()=>{
        ui.custNotes=custNotesInput.value;
        save("skosif_v32_cust_notes", ui.custNotes);
      };
    }

    /* Offer Modal Events */
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
    window.SKosifCatalog={open,version:"1.0",addToCart,exportCatalogCSV,getCartTotals};
  }

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});
  else init();
})();
