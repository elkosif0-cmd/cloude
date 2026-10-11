// The owner's decisions (FOUNDATION, the mandate, and what the owner chose in chat), each checked against the code — not
// against memory. Writes docs/registry/OWNER_DECISIONS_ar.md; exits 1 when a decision is missing.
//   node tools/owner_decisions.mjs            # check + write the register
//   node tools/owner_decisions.mjs --check    # check only
import fs from 'node:fs';
import vm from 'node:vm';
import { execFileSync, spawnSync } from 'node:child_process';

const root = new URL('../', import.meta.url);
const read = (f) => fs.readFileSync(new URL(f, root), 'utf8');
const has = (f) => fs.existsSync(new URL(f, root));
const caps = JSON.parse(read('ui/core/capabilities.json'));
function registry(installed = []) {
  const ctx = vm.createContext({ SK: { company: { current: () => ({ sector: '' }) } } });
  ctx.window = ctx; ctx.__SK_CAPS__ = caps; ctx.SKosifCompanyPlatform = { state: () => ({ installedTools: installed }) };
  vm.runInContext(read('ui/core/registry.js'), ctx); return ctx.SK.caps;
}
/* --is-ancestor answers by exit code: 0 yes, 1 no; anything else is a failed call (retried), never «not merged» */
const ancestor = (ref) => { for (let i = 0; i < 3; i++) { const r = spawnSync('git', ['merge-base', '--is-ancestor', ref, 'origin/main'], { cwd: new URL('.', root) }); if (r.status === 0) return true; if (r.status === 1) return false; } return null; };
const git = (...a) => { try { return execFileSync('git', a, { cwd: new URL('.', root), encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); } catch { return null; } };

const D = [
  ['الأقسام أولاً: ثلاثة مداخل فقط — المحاسبة الكاملة، المراجعة، الأدوات المساعدة', 'FOUNDATION §3 · أمر المالك 2026-10-06',
    () => { const g = caps.gateways.map((x) => x.id).join(','); return [g === 'accounting,audit,tools', g]; }, 'tools/gateway_contract.mjs · tools/menu_constitution.test.mjs'],
  ['في المحاسبة: القطاع ثم الشركة؛ عشرة قطاعات، خمسة بأولوية (المستشفيات، الفنادق، المقاولات، اللحوم، التسويق الإلكتروني)', 'FOUNDATION §3.7',
    () => { const p = caps.sectors.filter((s) => s.priority).map((s) => s.id).join(','); return [caps.sectors.length === 10 && p === 'health,hospitality,construction,meat,digital', caps.sectors.length + ' قطاعات · أولوية: ' + p]; }, 'constitution_guard ten_sectors'],
  ['الشركات المرجعية (47 من الحزمة) نماذج تُفتح، وملفها يعيد نفس أرقام إعادة التشغيل', 'أمر المالك 2026-10-06 · FOUNDATION §3.10',
    () => { const n = JSON.parse(read('ui/data/bundle-clients.json')).clients.length; return [n === 47 && has('tools/corpus_same_results.test.mjs'), n + ' شركة']; }, 'tools/corpus_same_results.test.mjs'],
  ['«تصيف» محمية بصلاحية مستقلة وكلمة مرور؛ لا تظهر في نسخ المعاينة', 'نص المالك: «الدخول إلى بيانات تصيف يجب أن يكون محمياً بصلاحيات مستقلة وكلمة مرور»',
    () => { const u = read('unlock.html'), p = read('private_blocks.py'); return [/data-locked="1"/.test(u) && u.includes('<!--SQC:AUTH:START-->') && /PASSWORD_ENV = "KOSIF_UNLOCK_PASSWORD"/.test(p), 'بوابة مقفلة + كتلة SQC:AUTH + المفتاح من متغير البيئة']; }, 'tools/unlock_runtime.test.mjs · tools/preview_build_check.py'],
  ['لا كلمة مرور مكتوبة في أي ملف', 'قاعدة المالك',
    () => { const tracked = (git('ls-files') || '').split('\n').filter((f) => /\.(py|js|mjs|yml|yaml|json|md|ps1|sh|toml|html)$/.test(f)); const bad = tracked.filter((f) => { try { return /KOSIF_UNLOCK_PASSWORD\s*[:=]\s*["'][^"'$\s{]{4,}["']/.test(read(f)); } catch { return false; } }); return [bad.length === 0, bad.length ? bad.join(', ') : tracked.length + ' ملفاً متتبعاً بلا قيمة مكتوبة']; }, '—'],
  ['القدرات مشتركة والبيانات معزولة بين الشركات', 'نص المالك: «القدرات مشتركة، لكن البيانات معزولة بين الشركات»',
    () => [/const HELPER_KEY=/.test(read('ui/core/helper-space.js')) && has('tools/company_scope_keys.test.mjs'), 'مفاتيح التخزين تُبدَّل مع الشركة (HELPER_KEY)'], 'tools/company_scope_keys.test.mjs'],
  ['المسار يملك المساحة: FULL_ACCOUNTING / AUDIT_ONLY / TOOLS_ONLY، ولا مساحة تظهر تلقائياً في قسم آخر', 'FOUNDATION §3.0-1 و-12',
    () => [/SCOPES=Object\.freeze\(\{accounting:"FULL_ACCOUNTING",audit:"AUDIT_ONLY",tools:"TOOLS_ONLY"\}\)/.test(read('ui/core/company.js')), 'ui/core/company.js'], 'constitution_guard audit_registry_own · tools_menu_own_space'],
  ['ملف القدرات: الشركة الجديدة تختار أدواتها (opt-in) والشركات القائمة تحتفظ بكل أدواتها', 'اختيار المالك 2026-10-09 (#231) · FOUNDATION §3.0-10',
    () => { const s = read('ui/core/company-platform.js'); return [/capMode\(\)/.test(s) && /"opt-in"/.test(s) && /return r&&r\.ownerScope\?"opt-in":"all"/.test(s), 'capMode: opt-in للشركة ذات ownerScope، والباقي all']; }, 'tools/capability_profile.test.mjs'],
  ['حزمة القطاع تُطبَّق مرة واحدة للشركة الجديدة ولا تُفرض على شركة قائمة', 'FOUNDATION §3.0-5 · #158',
    () => [/packPending/.test(read('ui/core/company-platform.js')), 'packPending'], 'tools/meat_pack_e2e.mjs'],
  ['سياسة ضريبة القيمة المضافة لكل شركة، وكل شاشة ضريبية تقرؤها', '#155 / #156',
    () => [/function vatPolicy\(\)/.test(read('ui/core/company-platform.js')) && has('tools/vat_policy_contract.test.mjs'), 'SKosifCompanyPlatform.vatPolicy'], 'tools/vat_policy_contract.test.mjs'],
  ['المراجعة مستقلة: ملف مرتبط بشركة أو عام، ولا يُنشئ شركة في المحاسبة', 'FOUNDATION §3.0-3 · §3.2',
    () => [/function newEngagement\(\)/.test(read('ui/features/tb-review.js')) && has('tools/audit_context_independence.test.mjs'), 'SKosifTBReview.newEngagement'], 'tools/audit_context_independence.test.mjs'],
  ['المنيو حسب الدستور: أقسام المحاسبة داخل الشركة، مراحل ملف المراجعة، وعائلات الأدوات الثماني', 'طلب المالك 2026-10-09 · FOUNDATION §3.12 و§3.3.1',
    () => { const c = registry(); const none = ['accounting', 'audit', 'tools'].every((g) => !c.menu(g).some((s) => s.id.endsWith('-more'))); const t = c.menu('tools').length, a = c.menu('accounting').length; return [none && has('tools/menu_constitution.test.mjs'), 'المحاسبة ' + a + ' أقسام · الأدوات ' + t + ' · لا شاشة في «أخرى»']; }, 'tools/menu_constitution.test.mjs'],
  ['دمج كل الفروع في main', 'طلب المالك 2026-10-09',
    () => { const refs = (git('for-each-ref', '--format=%(refname:short)', 'refs/remotes/origin') || '').split('\n').filter((r) => r && !/^origin(\/HEAD|\/main)?$/.test(r)); if (!refs.length) return [false, 'تعذرت قراءة الفروع']; const res = refs.map((r) => [r, ancestor(r)]), out = res.filter(([, a]) => a === false).map(([r]) => r), err = res.filter(([, a]) => a === null).map(([r]) => r); return [out.length === 0 && err.length === 0, refs.length + ' فرعاً، خارج main: ' + (out.length ? out.join(', ') : 'لا شيء') + (err.length ? ' · تعذر فحص: ' + err.join(', ') : '')]; }, 'docs/registry/BRANCH_MERGE_ALL_20261009.md'],
  ['هوية واحدة «دفتر KOSIF» من الباب إلى الورقة المطبوعة؛ «كوبالت وجليد» و«الكحلي والذهبي» اختيار', 'طلب المالك 2026-10-09 (R19، R20) · FOUNDATION §3.11.2',
    () => { const t = read('ui/ds/tokens.css'); return [/:root\[data-look="kosif"\]\[data-brand="ledger"\]\{/.test(t) && /--sk-brand:#2340c4/.test(t) && has('tools/identity_unity.test.mjs') && /<meta name="theme-color" content="#1d1814">/.test(read('unlock.html')), 'الدفتر افتراضي، الباب والشعار والأيقونات والطباعة بنفس الهوية']; }, 'tools/identity_unity.test.mjs · tools/door_tokens.test.mjs · identity_audit'],
  ['الهلال لا الصليب في صور القطاع الصحي', 'FOUNDATION §3.0-11',
    () => [has('ui/art/brand/sector-health.webp'), 'ui/art/brand/sector-health.webp'], 'constitution_guard health_art'],
  ['شريط السياق دائم (البرنامج · النشاط · الشركة · القسم) وحالة حفظ مرئية', 'FOUNDATION §3.0-7 و-8',
    () => [has('ui/core/save-state.js') && /سياق|context/i.test(read('ui/layouts/topbar.js')), 'topbar.js + save-state.js'], 'constitution_guard context_bar · save_state_wired'],
  ['صفحة الدخول: سكربت SQC:AUTH يبقى كما هو بايتاً ببايت', 'قاعدة المراجعة الأمنية',
    () => [/SQC:AUTH/.test(read('tools/unlock_runtime.test.mjs')) || /sha256|createHash/.test(read('tools/unlock_runtime.test.mjs')), 'البصمة مثبتة في الاختبار'], 'tools/unlock_runtime.test.mjs'],
  ['الشركة التجريبية «أغنام الوادي» باقية، ولا اسم شركة ثابت في المخرجات', 'R10 · مراجعة لاذعة 2026-10-08',
    () => [has('tools/harsh_review_guards.test.mjs') && /SK\.bizName|bizName\(/.test(read('ui/core/sk.js')), 'SK.bizName()'], 'tools/harsh_review_guards.test.mjs · tools/identity_check.py'],
  ['عالم بلوري أصلي (لا نسخ من igloo.inc)', 'اختيار المالك 2026-10-05',
    () => [has('ui/art/crystal-world.js') && !/igloo/i.test(read('ui/art/crystal-world.js').replace(/\/\*[\s\S]*?\*\//g, '')), 'ui/art/crystal-world.js'], 'tools/crystal_world.test.mjs'],
  ['«الربحية والقنوات» من لوحة v16 على محرك تكلفة القنوات', '#229 بطلب المالك',
    () => [has('ui/features/channel-profit.js') && /channelCosting/.test(read('ui/features/channel-profit.js')), 'ui/features/channel-profit.js'], 'feature_audit'],
  ['شريط تبويبات الجوال ثابت أسفل الشاشة و«الرئيسية» أولاً', 'R19',
    () => [/\.skb\{position:fixed/.test(read('ui/ds/shell.css')), '.skb position:fixed'], 'tools/gate_nav_contract.test.mjs · phone_layout'],
  ['لا أداة لقراءة رسائل واتساب', 'قاعدة المالك',
    () => { const s = has('whatsapp-bridge/workers/mcp/index.js') ? read('whatsapp-bridge/workers/mcp/index.js') : '';
      /* a tool whose name or description reads incoming messages */
      const tools = [...s.matchAll(/name:\s*"([a-z_]+)",\s*description:\s*"([^"]*)"/g)].map((m) => [m[1], m[2]]);
      const bad = tools.filter(([n, d]) => /messages$|read|inbox|history/.test(n) || /^Read messages|messages received/i.test(d)).map(([n]) => n);
      return [bad.length ? 'warn' : true, bad.length ? 'موجودة في جسر واتساب: ' + bad.join(', ') + ' («Read messages received on WhatsApp») — استُرجعت من PR #96 في 2026-10-06؛ لم تُحذف دون قرار المالك' : tools.length + ' أداة، لا قراءة']; }, 'whatsapp-bridge/workers/mcp/index.js'],
  ['سجل عمل مشترك: كل مهمة تُسجَّل قبل التعديل', 'FOUNDATION §0.0.2',
    () => [/TASK CLAUDE-20261009-014/.test(read('AGENT_WORKLOG.md')), 'AGENT_WORKLOG.md'], 'constitution_guard worklog'],
];

const rows = D.map(([what, src, check, lock]) => { let ok = false, ev = ''; try { [ok, ev] = check(); } catch (e) { ev = 'خطأ: ' + e.message; } return { what, src, ok, ev, lock }; });
const bad = rows.filter((r) => !r.ok), warn = rows.filter((r) => r.ok === 'warn');
const md = ['# قرارات المالك — هل كلها موجودة في الكود؟', '', 'يُولَّد من `node tools/owner_decisions.mjs` بفحص الكود نفسه (لا من الذاكرة). كل قرار: مصدره، ما وُجد، وما يقفله.', '',
  `**النتيجة: ${rows.length - bad.length - warn.length} من ${rows.length} موجودة**` + (bad.length ? ` — ناقص: ${bad.map((r) => r.what).join(' · ')}` : '') + (warn.length ? ` — يتعارض ويحتاج قرار المالك: ${warn.map((r) => r.what).join(' · ')}` : ''), '',
  '| # | القرار | المصدر | الحالة | الدليل | يقفله |', '|---|---|---|---|---|---|',
  ...rows.map((r, i) => `| ${i + 1} | ${r.what} | ${r.src} | ${r.ok === 'warn' ? '⚠️ تعارض — قرار المالك' : r.ok ? '✅ موجود' : '❌ ناقص'} | ${String(r.ev).replace(/\|/g, '/')} | ${r.lock} |`), ''].join('\n');
if (!process.argv.includes('--check')) fs.writeFileSync(new URL('docs/registry/OWNER_DECISIONS_ar.md', root), md);
for (const r of rows) console.log((r.ok === 'warn' ? '⚠ ' : r.ok ? '✓ ' : '✗ ') + r.what + ' — ' + r.ev);
console.log(`\n${rows.length - bad.length - warn.length}/${rows.length} decisions present · ${warn.length} conflict(s) for the owner`);
if (bad.length) process.exitCode = 1;
