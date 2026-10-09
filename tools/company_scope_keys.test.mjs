// R15 (docs/rebuild/CODE_REVIEW_20261008_ar.md C1): a company's data must follow the company. helper-space swaps the
// storage keys HELPER_KEY matches when the open company changes; a key it misses is shared by every company. Its pattern
// once read «erp_[a-z_]+» (no digit), so the cash log, supplier payables and the inventory card leaked between companies.
// This test reads every storage key the UI uses and requires each to be either per company or declared device/user level.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const hs = read('ui/core/helper-space.js');
const HELPER_KEY = new Function('k', 'return ' + hs.match(/const HELPER_KEY=k=>([\s\S]*?); \/\* the original CRM/)[1]);

/* a company's own records — these must swap with the company */
const COMPANY_DATA = ['aghnam-pricing-v3', 'aghnam-v12-manual-sales', 'aghnam_v29_inventory', 'skosif_ledger_v1', 'skosif_advances_v1',
  'skosif_purchasing_v1', 'skosif_followup_v1', 'skosif_erp_finance_v1', 'skosif_erp_payables_v1', 'skosif_erp_inventory_v1',
  'skosif_risks_v1', 'skosif_tasks_v1', 'skosif_council_v1', 'skosif_v31_supplier_batches', 'skosif_v38_batches',
  'skosif_company_profile_v1', 'skosif_company_definitions_v1', 'skosif_cost_rules_v1', 'skosif_channel_lines_v1', 'skosif_inv_expiry_batches', 'skosif_ar_paste', 'skosif_company_platform_v1'];

/* deliberately shared by the device or the user, not by a company (preferences, the companies' own registry, sessions,
   the audit files' registry, error and audit logs, the user's own AI keys and profile) */
const DEVICE = new Set(['aghnam_v29_jev_log', 'aghnam-v12-theme', 'aghnam-v21-density', 'aghnam-v21-pins', 'kosif-earth-intro-seen-v1', 'kosif-night', 'kosif-operating-model',
  'kosif-think', 'kosif-v5-safety', 'skosif_ai_keys', 'skosif_audit_trail', 'skosif_autolock_min', 'skosif_cap_v2_config',
  'skosif_cap_v2_local_workspace', 'skosif_cap_v2_preview_role', 'skosif_codex_updates_v1', 'skosif_companies_v1', 'skosif_customer_flow_v1',
  'skosif_engagements_v1', 'skosif_error_log', 'skosif_jev_draft', 'skosif_legacy_v1', 'skosif_nav_v1', 'skosif_notify_v1',
  'skosif_palette_recent', 'skosif_prefs', 'skosif_print_v1', 'skosif_probe', 'skosif_profile_v1', 'skosif_role_mode', 'skosif_tables_v1',
  'skosif_tbreview_v1', 'skosif_theme', 'skosif-backup', 'skosif-company-documents-v1', 'skosif-transfer', 'sqc_bench_v1',
  'sqc_chat_scope_generation_v1', 'sqc_company_after_open', 'sqc_company_intent', 'sqc_dash_tab', 'sqc_flow_open', 'sqc_gate',
  'sqc_gate_audit_new', 'sqc_gate_corpus', 'sqc_gate_pin', 'sqc_helper_space_v1', 'sqc_helper_user_chosen', 'sqc_helper_users_v1',
  'sqc_last_company', 'sqc_private_space', 'sqc_salesintel_v1', 'sqc_space_chosen', 'sqc_world_slow']);

function storageKeys() {
  const files = [];
  const walk = (d) => { for (const f of fs.readdirSync(path.join(root, d))) { const p = d + '/' + f; if (fs.statSync(path.join(root, p)).isDirectory()) { if (!/legacy|vendor|data|audit/.test(f)) walk(p); } else if (/\.js$/.test(f) && !/^engines(-sources)?\.js$/.test(f)) files.push(p); } };
  walk('ui');
  const keys = new Map();
  const add = (k, f) => { if (!keys.has(k)) keys.set(k, new Set()); keys.get(k).add(f); };
  const lit = `["'\`]((?:skosif|aghnam|sqc|kosif)[-_][A-Za-z0-9_\\-]*[A-Za-z0-9])["'\`]`;
  const calls = new RegExp(`(?:\\b(?:save|load|S|L|getItem|setItem|removeItem)\\(\\s*)${lit}`, 'g');
  const consts = new RegExp(`\\b[A-Z_]*(?:KEY|STORE|K[A-Z]{2,})[A-Z_0-9]*\\s*=\\s*${lit}`, 'g');
  for (const f of files) { const s = read(f); for (const re of [calls, consts]) for (const m of s.matchAll(re)) add(m[1], f); }
  return keys;
}

test('every company record is swapped with the company', () => {
  for (const k of COMPANY_DATA) assert.equal(HELPER_KEY(k), true, k + ' must be per company (HELPER_KEY)');
});

test('every storage key the UI uses is either per company or declared device/user level', () => {
  const keys = storageKeys();
  assert.ok(keys.size > 60, 'the scan found the UI storage keys (' + keys.size + ')');
  const unknown = [...keys].filter(([k]) => !HELPER_KEY(k) && !DEVICE.has(k)).map(([k, f]) => k + ' (' + [...f].join(', ') + ')');
  assert.deepEqual(unknown, [], 'a new key that is neither per company nor declared device level — company data must match HELPER_KEY, a preference goes in DEVICE');
});
