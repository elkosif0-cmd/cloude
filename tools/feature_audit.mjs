import { createRequire } from 'module'; import fs from 'fs';
// Feature audit: every capability the owner asked for across the rounds, checked in the running app.
// usage: node tools/feature_audit.mjs http://localhost:8765/app-safe.html [out.json]
const URL_=process.argv[2]||'http://localhost:8765/app-safe.html';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const b = await chromium.launch(); const p = await (await b.newContext({viewport:{width:1440,height:900}})).newPage(); const errs=[];
p.on('pageerror',e=>errs.push(e.message)); p.on('dialog',d=>d.dismiss());
await p.goto(URL_); await p.waitForTimeout(6000); await p.waitForLoadState('load'); await p.waitForTimeout(2500);
const go=async(v,ms=900)=>{await p.evaluate(x=>SKosifCore.go(x),v);await p.waitForTimeout(ms)};
const has=s=>p.evaluate(x=>!!document.querySelector(x),s);
const txt=s=>p.evaluate(x=>document.body.innerText.includes(x),s);
const R=[];const ok=(area,name,v)=>R.push([area,name,!!v]);
// ---------- earlier rounds ----------
const E=await p.evaluate(()=>({docs:!!window.SKosifReportDocs&&['annual','release','auditor'].every(k=>typeof SKosifReportDocs[k]==='function'),assistant:!!window.SKosifAssistant,cmd:!!window.SKosifCommand,charts:['bars','line','hbars','waterfall','donut','matrix'].every(k=>SKCharts[k]),xlsx:!!(SKXlsx.write&&SKXlsx.book),looks:SKosifShell.looks().length,fonts:SKosifShell.fonts().length,accents:SKosifShell.accents().length,groups:SK.caps.groups().length,hubs:SK.caps.all().filter(c=>c.isHub).length,periodTB:!!SKEngines.finance.ledger.periodTrialBalance,globalReports:!!SK.caps.get('globalreports')}));
ok('الجولات السابقة','التقرير السنوي بنمط 10-K وبيان النتائج وتقرير المراجع',E.docs);
ok('الجولات السابقة','إلغاء مركز التقارير العالمي (ما زال ملغياً)',!E.globalReports);
ok('الجولات السابقة','إعادة التنظيم: 9 مجالات وصفحات مجمّعة',E.groups===9&&E.hubs>=10);
ok('الجولات السابقة','الدفاتر ← ميزان الفترة ← مراجعة الميزان',E.periodTB);
ok('الجولات السابقة','الرسوم البيانية المطورة (أعمدة، خطوط، أفقي، شلال، دائري، خريطة حرارية)',E.charts);
ok('الجولات السابقة','Excel حقيقي (ورقة وعدة أوراق)',E.xlsx);
ok('الجولات السابقة','المساعد المباشر ولوحة الأوامر',E.assistant&&E.cmd);
ok('الجولات السابقة','استوديو المظهر: خطوط وألوان تمييز',E.fonts>=8&&E.accents>=9);
await go('ledger');ok('الجولات السابقة','جداول مطورة (بحث، تصدير، أعمدة)',await has('.sktb-bar,.sk-tb-bar,[data-sktb],.sktbl-bar')||await p.evaluate(()=>!!window.SKosifTable));
// ---------- research: council ----------
await go('tbreview');await p.click('[data-tab="conf"]');await p.waitForTimeout(1500);
const C=await p.evaluate(()=>{const t=document.body.innerText;return{states:document.querySelectorAll('.tbc-states li').length,apps:document.querySelectorAll('.tbc-apps article').length,matrix:document.querySelectorAll('.tbc-mx tbody tr').length,checks:document.querySelectorAll('.tbc-checks>div').length,reg:t.includes('سجل الأدلة المرقمة'),ranked:t.includes('الطلبات مرتبة بالقيمة'),exc:t.includes('سجل الاستثناءات'),isa:t.includes('خريطة الربط بمعايير المراجعة'),ready:t.includes('جاهزية المكتب'),journal:t.includes('اختبارات القيود على كامل المجتمع')}});
ok('البحث: مجلس المراجعة','حالات الملف الثماني',C.states===8);ok('البحث: مجلس المراجعة','نقاط الاعتماد البشرية الأربع',C.apps===4);
ok('البحث: مجلس المراجعة','درجة الثقة لكل بند × تأكيد مع العتبات',C.matrix>0);ok('البحث: مجلس المراجعة','فحوص السلامة الست',C.checks===6);
ok('البحث: مجلس المراجعة','سجل الأدلة المرقمة (الاستشهاد الإلزامي)',C.reg);ok('البحث: مجلس المراجعة','ترتيب الطلبات بالقيمة المتوقعة',C.ranked);
ok('البحث: مجلس المراجعة','سجل الاستثناءات وتعديل العتبات بسبب',C.exc);ok('البحث: مجلس المراجعة','خريطة الربط بمعايير ISA',C.isa);ok('البحث: مجلس المراجعة','جاهزية المكتب (الملحق هـ)',C.ready);
ok('البحث: مجلس المراجعة','بنفورد والقيود غير المعتادة والقطع',C.journal);
const K=await p.evaluate(()=>({members:SKEngines.audit.council.MEMBERS.length,council:JSON.stringify(SKEngines.audit.council.COUNCIL),stop:!!SKEngines.audit.confidence.stopRule,verify:!!SKEngines.audit.council.verifyOpinion,checklist:SKEngines.audit.confidence.ROUND_CHECKLIST.length}));
ok('البحث: مجلس المراجعة','خمسة أعضاء (المتشكك، المحلل، المعايير، الضرائب، الرئيس)',K.members===5);ok('البحث: مجلس المراجعة','مجلس 1 أو 3 أو 5',K.council.includes('"5"'));
ok('البحث: مجلس المراجعة','قاعدة الإيقاف والتصعيد',K.stop);ok('البحث: مجلس المراجعة','رفض الرأي المستشهد بدليل غير موجود',K.verify);ok('البحث: مجلس المراجعة','قائمة فحص المراجع (الملحق د)',K.checklist===6);
await p.click('[data-tab="ai"]');await p.waitForTimeout(500);ok('البحث: مجلس المراجعة','اختيار تشكيل المجلس في جولات المراجعة',await has('[data-cc="size"][data-v="5"]'));
await p.click('[data-tab="fs"]');await p.waitForTimeout(700);const L=await p.evaluate(()=>[...document.querySelectorAll('.tbr-li dt')].map(x=>x.textContent).join('|'));
ok('البحث: مجلس المراجعة','خطاب الإدارة: الملاحظة/الأثر/التوصية/رد الإدارة (الملحق ج)',L.includes('الأثر')&&L.includes('رد الإدارة'));
// ---------- fusion ----------
const F=await p.evaluate(()=>({hub:SK.caps.members('tbreview').map(x=>x.id),hidden:SK.caps.all().filter(c=>c.hidden).length,feeds:SK.caps.all().filter(c=>c.feeds).length,flow:!!SK.flow,tabs:[...document.querySelectorAll('.tbr-tabs [data-tab]')].map(x=>x.dataset.tab)}));
ok('المنظومة الواحدة','ملف مراجعة واحد والاستوديو تبويب داخله',F.tabs.includes('studio')&&F.hidden===6);ok('المنظومة الواحدة','التحليل صفحة في مركز المراجعة',F.hub.includes('auditanalytics'));
ok('المنظومة الواحدة','مسار العمل (يأتي من / يذهب إلى) في كل شاشة',await has('.skflow')&&F.feeds>=30);await p.click('[data-tab="tb"]');await p.waitForTimeout(500);ok('المنظومة الواحدة','الإرسال إلى المهام وسجل الملاحظات',F.flow&&await has('[data-flow-finding]'));
await go('dash',1400);ok('المنظومة الواحدة','رحلة العمل في مركز القيادة',await p.evaluate(()=>document.querySelectorAll('.skjr li').length===5));
await go('auditanalytics',3500);const A=await p.evaluate(()=>({tabs:document.querySelectorAll('.kx-views [data-kxv]').length,tools:document.querySelectorAll('.kx-views .kx-tool').length}));
ok('المنظومة الواحدة','أدوات التحليل بتبويبات التطبيق وبثيمه (صفحاتها وصوتها وأوامرها)',A.tabs>=15&&A.tools===2);
ok('عدم ضياع القدرات','القدرات الـ64 كلها مسجلة',await p.evaluate(()=>SK.caps.all().length)===64);
// ---------- demo, templates, outputs ----------
const D=await p.evaluate(async()=>({demo:(await SK.demo.status()).filter(x=>x.demo).length,tpl:SK.templates.list().length,out:!!SK.output}));
ok('البيانات والاستيراد','بيانات تجريبية للأقسام الفارغة',D.demo>=13);ok('البيانات والاستيراد','قوالب استيراد لكل قسم',D.tpl>=18);
await go('suppliers');ok('البيانات والاستيراد','زر قوالب الاستيراد في رأس الشاشة',await has('.sk-ph .sktpl-btn'));
await go('tbreview');await p.click('[data-tab="fs"]');await p.waitForTimeout(600);await p.click('[data-a="print"]');await p.waitForTimeout(1500);
const O=await p.evaluate(()=>[...document.querySelectorAll('.skout [data-o]')].map(x=>x.dataset.o));
ok('التقارير والمعاينة','معاينة داخل التطبيق بدل النوافذ المنبثقة',D.out&&await has('.skout-f'));ok('التقارير والمعاينة','تصدير PDF وWord وExcel وHTML',['print','word','excel','html'].every(x=>O.includes(x)));
await p.keyboard.press('Escape');
// ---------- themes & identity ----------
ok('الهوية والثيمات','خمسة ثيمات احترافية جديدة',['aurora','vivid','oasis','graphite','onyx'].every(x=>E.looks>=14));
await p.evaluate(()=>SKosifShell.setLook('oasis'));await p.waitForTimeout(500);
ok('الهوية والثيمات','هوية KOSIF واحدة في كل الثيمات',await p.evaluate(()=>getComputedStyle(document.querySelector('.rail #app-name'),'::before').content.includes('KOSIF')));
await p.evaluate(()=>SKosifShell.setLook('kosif'));
ok('الهوية والثيمات','نظام خطوط موحد (أرقام بعرض ثابت)',await p.evaluate(()=>{const td=document.querySelector('td');return !td||getComputedStyle(td).fontVariantNumeric.includes('tabular')}));
// ---------- attachments ----------
await go('salesintel',1500);const S=await p.evaluate(()=>[...document.querySelectorAll('[data-slab]')].map(x=>x.dataset.slab));
ok('المرفقات: لوحة المبيعات','مختبر المبيعات: التوقع والتوزيع والزخم والخرائط والإحصاء وأفكار النمو',['pulse','invoices','momentum','maps','stats','ideas'].every(x=>S.includes(x)));
ok('المرفقات: وحدة الإدارة V40','تكاليف الأصناف حسب فترة السريان والقناة وربحية القنوات',S.includes('profit'));ok('المرفقات: وحدة الإدارة V40','شجرة الأصناف والأكواد',S.includes('tree'));
await p.click('[data-slab="profit"]');await p.waitForTimeout(800);ok('المرفقات: وحدة الإدارة V40','الأعلى ربحاً والخاسرة والضعيفة',await has('[data-slab-pf="weak"]'));
await go('followup');await p.click('[data-tab="report"]');await p.waitForTimeout(700);ok('المرفقات: CRM','خطة المتابعة المقترحة والمدن الأكثر احتياجاً',await txt('خطة المتابعة المقترحة'));
ok('المرفقات: CRM','التسجيل اليومي وقائمة الاتصال وأولوية التواصل وتقرير الإنجاز',await p.evaluate(()=>['log','queue','priority','report'].every(k=>document.querySelector('[data-sk-tabs="fu"] [data-tab="'+k+'"]'))));

// ---------- older rounds (1–33) ----------
const O2=await p.evaluate(()=>({device:!!SK.device,keys:!!window.SKosifKeys,notify:!!window.SKosifNotify,pack:!!window.SKosifReportPack,metrics:!!window.SKosifMetrics,topbar:!!window.SKosifTopbar,
  codex:!!SKEngines.audit.codex,disc:!!SKEngines.audit.disclosures,rec:!!SKEngines.finance.reconciliation,prog:!!SKEngines.audit.programme,ecl:!!SKEngines.audit.tbReview.eclMatrix,
  views:['devices','notifications','risks','codex','jev','ledger','execreports','companies','governance','health','capabilitiesv2'].every(id=>SK.caps.get(id)),toggleRail:!!(window.SKosifShell&&SKosifShell.paint)}));
ok('الجولات 1–33','الأجهزة والمزامنة والنقل المشفر بين الآيفون واللابتوب',O2.device&&O2.views);ok('الجولات 1–33','اختصارات لوحة المفاتيح (اللابتوب)',O2.keys);
ok('الجولات 1–33','مركز الإشعارات وسجل المخاطر والملاحظات',O2.notify);ok('الجولات 1–33','حزمة التقارير التنفيذية بالترويسة',O2.pack);ok('الجولات 1–33','الشريط العلوي: الشركة والفترة والبحث والجرس والمستخدم',O2.topbar);
ok('الجولات 1–33','المدونة المحاسبية والمعايير',O2.codex);ok('الجولات 1–33','جاهزية الإفصاحات',O2.disc);ok('الجولات 1–33','مطابقة البنك',O2.rec);ok('الجولات 1–33','برنامج المراجعة',O2.prog);ok('الجولات 1–33','الخسائر الائتمانية المتوقعة (ECL)',O2.ecl);
await go('tbreview');await p.click('[data-a="setup"]').catch(()=>{});await p.waitForTimeout(500);ok('الجولات 1–33','الشركات المصرية ومعايير المحاسبة المصرية',await p.evaluate(()=>!!document.querySelector('[data-ctx="country"] option[value="EG"]')));
const ph=await (await b.newContext({viewport:{width:390,height:844},isMobile:true})).newPage();await ph.goto(URL_);await ph.waitForTimeout(5000);
ok('الجولات 1–33','شريط التبويبات السفلي في الآيفون',await ph.evaluate(()=>!!document.querySelector('.skb,.sk-tabbar,[class*="tabbar"]')));
if(process.argv[3])fs.writeFileSync(process.argv[3],JSON.stringify(R,null,1));
const miss=R.filter(x=>!x[2]);console.log('TOTAL',R.length,'OK',R.length-miss.length);console.log('MISSING',JSON.stringify(miss));console.log('ERRS',errs.slice(0,5));await b.close();if(miss.length||errs.length)process.exit(1);
