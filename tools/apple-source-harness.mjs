import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export function harness() {
  const state = {}, bundle = JSON.parse(fs.readFileSync(path.join(root, 'ui/data/bundle-clients.json'), 'utf8'));
  const read = p => fs.readFileSync(path.join(root, p), 'utf8');
  let id = 0;
  const context = { console, Date, Intl, setTimeout, clearTimeout, structuredClone, TextEncoder, TextDecoder, URL, AbortController };
  context.window = context;
  context.SK = { esc: s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),
    load: (k, d) => state[k] === undefined ? d : structuredClone(state[k]), save: (k, v) => {state[k] = structuredClone(v); return true;},
    toast: () => {}, ui: { uid: p => p + '-' + (++id) }, view: () => {}, audit: {log: () => {}}, icon: () => '', confirm: async () => true };
  context.fetch = async url => {if (url !== './data/bundle-clients.json') throw Error('Network forbidden: ' + url); return {ok: true, json: async () => structuredClone(bundle)};};
  const documents = new Map();
  context.indexedDB = {open: () => {const r = {result: {createObjectStore: () => {}, transaction: () => {const t = {objectStore: () => ({put: (v,k) => documents.set(k,v), get: k => {const q = {}; setTimeout(() => {q.result = documents.get(k); q.onsuccess?.();},0); return q;}, openCursor: () => {const q = {}; setTimeout(() => {q.result=null; q.onsuccess?.();},0); return q;}})}; setTimeout(() => t.oncomplete?.(),0); return t;}}}; setTimeout(() => r.onsuccess?.(),0); return r;}};
  context.localStorage = {getItem: k => state[k] ?? null, setItem: (k,v) => {state[k]=v;}, removeItem: k => delete state[k]};
  vm.createContext(context);
  vm.runInContext(read('ui/core/engines.js'), context);
  vm.runInContext(read('ui/features/tb-review.js').replace(/\}\)\(\);\s*$/, 'window.__test={compute,docX,openFile,newFile,blank,fsTab,aiTab,printLetter,printPbcLetter,printReport,printDoc,sourceCsv:typeof sourceCsv===\'function\'?sourceCsv:null};\n})();'), context);
  vm.runInContext(read('ui/features/report-docs.js'), context);
  return {context, state, documents, E: context.SKEngines};
}
export const plain = o => JSON.parse(JSON.stringify(o));
