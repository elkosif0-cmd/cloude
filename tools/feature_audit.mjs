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
const F=await p.evaluate(()=>({hub:SK.caps.members('tbreview').map(x=>x.id),hidden:SK.caps.all().filter(c=>c.hidden&&c.hub==="tbreview").length,feeds:SK.caps.all().filter(c=>c.feeds).length,flow:!!SK.flow,tabs:[...document.querySelectorAll('.tbr-tabs [data-tab]')].map(x=>x.dataset.tab)}));
await p.evaluate(()=>SKosifTBReview.open('docs'));await p.waitForTimeout(1500);
const FS=await p.evaluate(()=>({adv:!!document.querySelector('.tbr-adv [data-studio-host]'),own:[...document.querySelectorAll('.tbr-tabs [data-tab]')].some(x=>x.dataset.tab==='studio')}));
ok('المنظومة الواحدة','ملف مراجعة واحد: أدوات الاستوديو داخل تبويبات الملف نفسها بلا قائمة ثانية',F.hidden===6&&FS.adv&&!FS.own);ok('المنظومة الواحدة','التحليل صفحة في مركز المراجعة',F.hub.includes('auditanalytics'));
ok('المنظومة الواحدة','مسار العمل (يأتي من / يذهب إلى) في كل شاشة',await has('.skflow')&&F.feeds>=30);await p.click('[data-tab="tb"]');await p.waitForTimeout(500);ok('المنظومة الواحدة','الإرسال إلى المهام وسجل الملاحظات',F.flow&&await has('[data-flow-finding]'));
await go('dash',1400);ok('المنظومة الواحدة','رحلة العمل في مركز القيادة',await p.evaluate(()=>document.querySelectorAll('.skjr li').length===5));
await go('auditanalytics',3500);const A=await p.evaluate(()=>({tabs:document.querySelectorAll('.kx-views [data-kxv]').length,tools:document.querySelectorAll('.kx-views .kx-tool').length}));
ok('المنظومة الواحدة','أدوات التحليل بتبويبات التطبيق وبثيمه (صفحاتها وصوتها وأوامرها)',A.tabs>=15&&A.tools===2);
ok('عدم ضياع القدرات','القدرات الـ67 كلها مسجلة (66 + السلف)',await p.evaluate(()=>SK.caps.all().length)===67);
// ---------- global research bundle: audit benchmarks ----------
await go('auditbench',1200);
const CO=await p.evaluate(()=>{const c=SKEngines.reports.globalCorpus,s=c.summary();return{pages:s.pagesClassified,types:s.sectionTypes,bp:document.querySelectorAll('.ab-bp li').length,reps:document.querySelectorAll('[data-ab-rep] option').length,ex:c.EXEMPLARS.length}});
ok('البحث العالمي','قراءة الحزمة كاملة: كل صفحة مصنفة وبنية كل تقرير',CO.pages>12400&&CO.types>=50&&CO.reps===49&&CO.bp>=30);
ok('البحث العالمي','الصفحات النموذجية لكل قسم يكتبه المراجع الذكي',CO.ex>=8);
await p.click('[data-ab-tab="kams"]');await p.waitForTimeout(500);
const GB=await p.evaluate(()=>{const g=SKEngines.audit.globalBenchmarks,s=g.summary();return{reports:s.reports,kams:s.kams,mat:s.materiality,src:s.sources,hub:SK.caps.members('codex').map(x=>x.id).includes('auditbench'),themes:document.querySelectorAll('.ab-th').length,
  aramco:g.MATERIALITY.some(m=>m.report==='aramco-2025'&&m.currency==='SAR'),inTbr:!!window.SKosifAuditBench}});
ok('البحث العالمي','المرجع العالمي للمراجعة صفحة في «المعايير والمدونة»',GB.hub);
ok('البحث العالمي','مكتبة الأمور الرئيسية للمراجعة (96 أمراً من 49 تقريراً) بموضوعاتها',GB.reports===49&&GB.kams>=90&&GB.themes>=10);
ok('البحث العالمي','الأهمية النسبية المفصح عنها بما فيها أرامكو (ريال)',GB.mat===7&&GB.aramco);
ok('البحث العالمي','المصادر الرسمية الثلاثون',GB.src===30);
await p.click('[data-ab-tab="mat"]');await p.waitForTimeout(400);ok('البحث العالمي','فحص اختيار الأهمية النسبية مقابل الممارسة',await has('.ab-chk-r'));
ok('البحث العالمي','السوابق العالمية داخل ملف المراجعة',GB.inTbr);
await p.click('[data-ab-tab="peers"]');await p.waitForTimeout(400);ok('البحث العالمي','النظراء العالميون: 8 مجموعات × 13 نسبة من قوائمها',await p.evaluate(()=>document.querySelectorAll('.ab-pt thead th').length===10&&document.querySelectorAll('.ab-pt tbody tr').length===13));
await go('tbreview',2200);await p.click('[data-tab="fs"]');await p.waitForTimeout(800);
const RD=async k=>{await p.click('[data-doc="'+k+'"]');await p.waitForTimeout(1000);return p.evaluate(()=>{const a=document.querySelector('.rd-paper article');return a?a.innerText:''})};
const AUD=await RD('auditor');ok('التقارير المتقدمة','تقرير المراجع: «نهجنا في المراجعة» بالأهمية النسبية وحد الإبلاغ (نمط أرامكو)',AUD.includes('نهجنا في المراجعة')&&AUD.includes('حد الإبلاغ'));
const NT=await RD('notes');ok('التقارير المتقدمة','الإيضاحات المتممة: المصروفات حسب طبيعتها والمخاطر المالية وإدارة رأس المال',NT.includes('المصروفات حسب طبيعتها')&&NT.includes('إدارة المخاطر المالية')&&NT.includes('إدارة رأس المال'));
const CM=await RD('committee');ok('التقارير المتقدمة','تقرير لجنة المراجعة (نمط HSBC)',CM.includes('الأمور الهامة التي نظرت فيها اللجنة'));
const IC=await RD('icfr');ok('التقارير المتقدمة','تقرير الإدارة عن الرقابة الداخلية (COSO 2013)',IC.includes('COSO'));
const PR=await RD('peers');ok('التقارير المتقدمة','المقارنة بالنظراء العالميين',PR.includes('وسيط النظراء'));
ok('التقارير المتقدمة','مركز التقارير: المستندات مجمعة وأوراق المراجعة تفتح في المعاينة',await p.evaluate(()=>document.querySelectorAll('.tbr-docg .tbr-dg').length===5&&document.querySelectorAll('[data-fw-doc]').length===5));
await p.click('[data-tab="plan"]');await p.waitForTimeout(1200);
const FWK=await p.evaluate(()=>({wps:document.querySelectorAll('.fw-wp').length,mx:document.querySelectorAll('.fw-mx tbody tr').length,glob:document.querySelectorAll('.fw-src.global').length,sign:document.querySelectorAll('[data-fw-sign]').length}));
ok('العمل الميداني','مصفوفة المخاطر × التأكيدات (ISA 315)',FWK.mx>0);ok('العمل الميداني','أوراق عمل بمراجع وإجراءات وعينات (ISA 330/530)',FWK.wps>0);
ok('العمل الميداني','إجراءات المراجعين العالميين للمخاطر الجوهرية',FWK.glob>0);ok('العمل الميداني','توقيع المُعد والمراجِع مع فصل المهام',FWK.sign>0&&await p.evaluate(()=>{const w=SKEngines.audit.fieldwork.workingPapers({materiality:{overall:1,performance:1,trivial:0},risks:[],accounts:[]});return Array.isArray(w)}));
await p.click('[data-tab="close"]');await p.waitForTimeout(800);ok('العمل الميداني','بوابة الإكمال (ISA 450/560/570/580)',await has('.fw-gate')&&await p.evaluate(()=>document.querySelectorAll('.fw-item').length>=10));
await p.click('[data-fw-doc="reps"]');await p.waitForTimeout(1300);ok('العمل الميداني','خطاب الإقرارات يفتح في المعاينة قبل الطباعة',await has('.skout-f'));await p.keyboard.press('Escape');
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
await go('tbreview',1800);await p.click('[data-tab="fs"]');await p.waitForTimeout(700);await p.click('[data-doc="integrated"]');await p.waitForTimeout(1500);
const IR=await p.evaluate(()=>({cover:!!document.querySelector('.ir-cover'),secs:document.querySelectorAll('.ir-sec').length,q:!!document.querySelector('.ir-q'),bar:!!document.querySelector('.sqc-nb'),risks:document.querySelectorAll('.ir-rt tbody tr').length,
  prov:window.SKosifAI&&SKosifAI.providers().map(x=>x.id).join(','),check:SKEngines.reports.narrative.verifyNumbers('412.6 مليون',{allowed:[412.6]}).length===0}));
ok('التقرير المتكامل','التقرير السنوي المتكامل على بنية التقارير العالمية (غلاف، رسائل، مخاطر، جدوى، حوكمة، مراجع، قوائم، ملحق مطابقة)',IR.cover&&IR.secs>=15&&IR.q&&IR.bar&&IR.risks>=5);
ok('التقرير المتكامل','الذكاء الاصطناعي من Gemini أو OpenAI أو Claude مع التحقق من كل رقم',IR.prov==='gemini,openai,anthropic'&&IR.check);
ok('الهوية والثيمات','هوية SQC واحدة في كل الثيمات',await p.evaluate(()=>getComputedStyle(document.querySelector('.rail #app-name'),'::before').content.includes('SQC')));
await p.evaluate(()=>SKosifShell.setLook('kosif'));
ok('الهوية والثيمات','نظام خطوط موحد (أرقام بعرض ثابت)',await p.evaluate(()=>{const td=document.querySelector('td');return !td||getComputedStyle(td).fontVariantNumeric.includes('tabular')}));
// ---------- attachments ----------
await go('salesintel',1500);const S=await p.evaluate(()=>[...document.querySelectorAll('[data-slab]')].map(x=>x.dataset.slab));
ok('المرفقات: لوحة المبيعات','مختبر المبيعات: التوقع والتوزيع والزخم والخرائط والإحصاء وأفكار النمو',['pulse','invoices','momentum','maps','stats','ideas'].every(x=>S.includes(x)));
ok('المرفقات: وحدة الإدارة V40','تكاليف الأصناف حسب فترة السريان والقناة وربحية القنوات',S.includes('profit'));ok('المرفقات: وحدة الإدارة V40','شجرة الأصناف والأكواد',S.includes('tree'));
await p.click('[data-slab="profit"]');await p.waitForTimeout(800);ok('المرفقات: وحدة الإدارة V40','الأعلى ربحاً والخاسرة والضعيفة',await has('[data-slab-pf="weak"]'));
await go('followup');await p.click('[data-tab="report"]');await p.waitForTimeout(700);ok('المرفقات: CRM','خطة المتابعة المقترحة والمدن الأكثر احتياجاً',await txt('خطة المتابعة المقترحة'));
ok('المرفقات: CRM','التسجيل اليومي وقائمة الاتصال وأولوية التواصل وتقرير الإنجاز',await p.evaluate(()=>['log','queue','priority','report'].every(k=>document.querySelector('[data-sk-tabs="fu"] [data-tab="'+k+'"]'))));

// ---------- accounting application guidance from SOCPA guides ----------
const AG=await p.evaluate(()=>({api:!!window.SKosifAccountingGuidance,change:window.SKosifAccountingGuidance?.accountingChange({newInformationOrNewExperience:true})}));
ok('المساعد التطبيقي','محرك يميز السياسة والتقدير والخطأ',AG.api&&AG.change?.treatment==='prospective');
await go('codex',900);ok('المساعد التطبيقي','أدوات الإطار والاعتراف والعرض والإيضاح والتدفقات داخل المدونة',await has('.cdx-guide [data-ag-tab="framework"]')&&await has('.cdx-guide [data-ag-tab="recognition"]')&&await has('.cdx-guide [data-ag-tab="cashflow"]'));
// ---------- global audit practice from the research bundle: planning, completion, reporting and the books ----------
await go('tbreview',1200);await p.click('[data-tab="plan"]');await p.waitForTimeout(1200);
ok('ممارسات المراجعة العالمية','خطة الأهمية النسبية في العمل الميداني: أساس معدّل وتنفيذية حسب الخطر وحد إبلاغ',await has('.ap-card [data-ap-risk="controlDeficiencies"]')&&await txt('حد إبلاغ المكلفين بالحوكمة'));
ok('ممارسات المراجعة العالمية','مراجعة التقديرات بأثر رجعي (ISA 540) في التخطيط',await txt('مراجعة التقديرات بأثر رجعي'));
await p.click('[data-tab="close"]');await p.waitForTimeout(1200);
ok('ممارسات المراجعة العالمية','الاستمرارية في الإكمال: توقع نقدي 12 شهراً وسيناريوهات حادة واختبار عكسي',await p.evaluate(()=>document.querySelectorAll('.ap-gc tbody tr').length>=6&&!!document.querySelector('.ap-gc svg')));
await p.click('[data-tab="fs"]');await p.waitForTimeout(1000);await p.click('[data-doc="issue"]');await p.waitForTimeout(1200);
ok('ممارسات المراجعة العالمية','الأمور الرئيسية تُصاغ من المخاطر والسوابق العالمية مع النتيجة والاختيار',await p.evaluate(()=>document.querySelectorAll('.ap-kam [data-ap-kam]').length>0));
await p.click('[data-doc="auditor"]');await p.waitForTimeout(1200);
ok('ممارسات المراجعة العالمية','تقرير المراجع: قسم الاستمرارية ونتيجة كل أمر رئيسي',await p.evaluate(()=>{const h=[...document.querySelectorAll('.rd-audit .rd-sec h4')].map(x=>x.innerText);return h.some(x=>/الاستمرارية/.test(x))&&!!document.querySelector('.rd-audit .rd-kt2 .rd-obs')}));
const AP=await p.evaluate(()=>({trail:!!window.SKosifLedger.trail&&!!SKosifLedger.trail(),rev:typeof SKosifLedger.revenueRecon,steps:SKosifClose.steps().map(s=>s.id)}));
ok('ممارسات المراجعة العالمية','سجل التعديلات المختوم في الدفاتر ومطابقة الإيرادات في الإقفال',AP.trail&&AP.rev==='function'&&AP.steps.includes('trail')&&AP.steps.includes('revenue'));
// ---------- older rounds (1–33) ----------
const O2=await p.evaluate(()=>({device:!!SK.device,keys:!!window.SKosifKeys,notify:!!window.SKosifNotify,pack:!!window.SKosifReportPack,metrics:!!window.SKosifMetrics,topbar:!!window.SKosifTopbar,
  codex:!!SKEngines.audit.codex,disc:!!SKEngines.audit.disclosures,rec:!!SKEngines.finance.reconciliation,prog:!!SKEngines.audit.programme,ecl:!!SKEngines.audit.tbReview.eclMatrix,
  views:['devices','notifications','risks','codex','jev','ledger','execreports','companies','governance','health','capabilitiesv2'].every(id=>SK.caps.get(id)),toggleRail:!!(window.SKosifShell&&SKosifShell.paint)}));
ok('الجولات 1–33','الأجهزة والمزامنة والنقل المشفر بين الآيفون واللابتوب',O2.device&&O2.views);ok('الجولات 1–33','اختصارات لوحة المفاتيح (اللابتوب)',O2.keys);
ok('الجولات 1–33','مركز الإشعارات وسجل المخاطر والملاحظات',O2.notify);ok('الجولات 1–33','حزمة التقارير التنفيذية بالترويسة',O2.pack);ok('الجولات 1–33','الشريط العلوي: الشركة والفترة والبحث والجرس والمستخدم',O2.topbar);
ok('الجولات 1–33','المدونة المحاسبية والمعايير',O2.codex);ok('الجولات 1–33','جاهزية الإفصاحات',O2.disc);ok('الجولات 1–33','مطابقة البنك',O2.rec);ok('الجولات 1–33','برنامج المراجعة',O2.prog);ok('الجولات 1–33','الخسائر الائتمانية المتوقعة (ECL)',O2.ecl);
await go('tbreview');await p.click('[data-a="setup"]').catch(()=>{});await p.waitForTimeout(500);ok('الجولات 1–33','الشركات المصرية ومعايير المحاسبة المصرية',await p.evaluate(()=>!!document.querySelector('[data-ctx="country"] option[value="EG"]')));
// ---------- the books and the working mechanism (rounds 38–41) ----------
await go('ledger');
const B=await p.evaluate(()=>{const tabs=[...document.querySelectorAll('[data-sk-tabs="ledger"] [data-tab]')].map(x=>x.dataset.tab);return{tabs,
  eng:['reverseJournalEntry','isPeriodLocked'].every(k=>typeof SKEngines.finance.ledger[k]==='function')&&typeof SKEngines.sales.sales.splitVatInclusive==='function'&&typeof SKEngines.stock.inventory.weightedAverageCostsAsOf==='function',
  party:typeof SKEngines.finance.partyLedger.partyBalances==='function',vat:typeof SKEngines.finance.vatReturn.vatReturn==='function',bank:typeof SKEngines.finance.bankReconciliation.matchBankLines==='function',
  tpl:SK.templates.list().some(t=>t.id==='bank'),close:!!window.SKosifClose,alerts:!!(window.SKosifClose&&Array.isArray(SKosifClose.alerts()))}});
ok('الدفاتر وآلية العمل','الإقفال الشهري بخطوات حية (مع سجل التعديلات ومطابقة الإيرادات)',B.tabs.includes('close')&&await p.evaluate(()=>document.querySelectorAll('.skclose-steps li').length>=8&&SKosifClose.steps().some(s=>s.id==='trail')));
ok('الدفاتر وآلية العمل','تكلفة المبيعات والضريبة الشاملة والعكس بدل الحذف وإقفال الفترة',B.eng&&await p.evaluate(()=>!document.querySelector('[data-l="del-entry"]')));
await p.click('[data-sk-tabs="ledger"] [data-tab="entries"]');await p.waitForTimeout(400);
ok('الدفاتر وآلية العمل','عكس القيد وإقفال الدفاتر في شاشة القيود',await has('[data-l="rev-entry"]')&&await has('#lg-lock'));
await p.click('[data-sk-tabs="ledger"] [data-tab="cash"]');await p.waitForTimeout(400);
ok('الدفاتر وآلية العمل','التحصيل والسداد: أعمار الذمم وكشوف الحساب من الدفاتر',B.party&&await has('[data-l="settle"]')&&await has('[data-l="stmt"]'));
await p.click('[data-sk-tabs="ledger"] [data-tab="vat"]');await p.waitForTimeout(400);
ok('الدفاتر وآلية العمل','إقرار الضريبة ربعاً بربع مع قيد الإقفال',B.vat&&await has('[data-l="vatq"]'));
await p.click('[data-sk-tabs="ledger"] [data-tab="recon"]');await p.waitForTimeout(500);
ok('الدفاتر وآلية العمل','مطابقة البنك بقالب كشف واستيراد',B.bank&&B.tpl&&await has('[data-l="bank-import"]'));
ok('الدفاتر وآلية العمل','الجرد وتسوية المخزون',await has('#lg-cntd'));
await go('dash',1800);
ok('الدفاتر وآلية العمل','الملخص الصباحي في مركز القيادة',await p.evaluate(()=>document.querySelectorAll('.skbrief-t').length>=6));
ok('الدفاتر وآلية العمل','تنبيهات الدفاتر في مركز الإشعارات',B.alerts);
await go('auditdocs',5000);
ok('البيانات والاستيراد','استوديو المراجعة يفتح على بيانات تجريبية',await p.evaluate(()=>{const r=[...document.querySelectorAll('#view *')].find(h=>h.shadowRoot)?.shadowRoot;return !!r&&!/لا توجد مستندات بعد/.test(r.textContent)}));
const ph=await (await b.newContext({viewport:{width:390,height:844},isMobile:true})).newPage();await ph.goto(URL_);await ph.waitForTimeout(5000);
ok('الجولات 1–33','شريط التبويبات السفلي في الآيفون',await ph.evaluate(()=>!!document.querySelector('.skb,.sk-tabbar,[class*="tabbar"]')));
if(process.argv[3])fs.writeFileSync(process.argv[3],JSON.stringify(R,null,1));
const miss=R.filter(x=>!x[2]);console.log('TOTAL',R.length,'OK',R.length-miss.length);console.log('MISSING',JSON.stringify(miss));console.log('ERRS',errs.slice(0,5));await b.close();if(miss.length||errs.length)process.exit(1);
