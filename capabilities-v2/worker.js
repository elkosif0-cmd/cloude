import {runClaudeSummary} from "./claude-summary.mjs";
/* S.kosif Capabilities v2 — port of kosif-stable-capabilities-v2 governance/runtime capabilities.
   Server capabilities: Cloudflare Access verification, RBAC, multi-tenant workspace revisions,
   optimistic concurrency, append-only integrity chain, provider registry and secure headers. */

const providerDefinitions = [
  { id: "kosif-local", name: "KOSIF المحلي", execution: "browser", providerType: "deterministic", model: "SKOSIF-CAP-V2" },
  { id: "jev", name: "Jev", execution: "server", providerType: "decision", keyName: "JEV_SERVICE", modelName: "JEV_MODEL" },
  { id: "gemini", name: "Gemini", execution: "server", providerType: "llm", keyName: "GEMINI_API_KEY", modelName: "GEMINI_MODEL" },
  { id: "openai", name: "OpenAI", execution: "server", providerType: "llm", keyName: "OPENAI_API_KEY", modelName: "OPENAI_MODEL" },
  { id: "claude", name: "Claude", execution: "server", providerType: "llm", keyName: "ANTHROPIC_API_KEY", modelName: "ANTHROPIC_MODEL" },
];

const GENESIS_HASH = "0".repeat(64);
const CANONICAL_VERSION = "SKOSIF-C14N-v2";
const WORKSPACE_MAX_BYTES = 131_072;
const ACCESS_ASSERTION_MAX_BYTES = 16_384;
const AUTH_HEADER = "oai-authenticated-user-email";
const ACCESS_ASSERTION_HEADER = "cf-access-jwt-assertion";
const DOCUMENT_MAX_BYTES = 25 * 1024 * 1024;
const DOCUMENT_TYPES = new Set(["trial-balance","general-ledger","bank-statement","aging","inventory","fixed-assets-register","payroll","sales","purchases","tax-document","financial-statements","contract","invoice","audit-evidence","other"]);
const DOCUMENT_MIMES = new Set(["application/pdf","text/plain","text/csv","text/tab-separated-values","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet","application/msword","application/vnd.openxmlformats-officedocument.wordprocessingml.document","image/jpeg","image/png","image/webp","application/octet-stream"]);

const WORKSPACE_ALLOWED_KEYS = Object.freeze([
  "version","company","period","ui","theme","layout","preferences","inventorySummary",
  "financeSummary","reporting","approvals","notes","alerts","jev","sourceRefs"
]);
const WORKSPACE_FORBIDDEN_KEYS = new Set([
  "customers","customerPhones","phones","emails","orders","rawTransactions","bankDetails",
  "attachments","fileBytes","evidenceBytes","apiKey","apiKeys","secret","secrets","password",
  "token","tokens","accessToken","refreshToken","cardNumbers","iban","ibans"
]);

export const ROLE_PERMISSIONS = Object.freeze({
  owner: Object.freeze(["providers:read","session:read","workspace:create","workspace:list","workspace:read","workspace:write","workspace:archive","workspace:share","document:list","document:read","document:write","document:delete","integrity:read","ai:run"]),
  partner: Object.freeze(["providers:read","session:read","workspace:create","workspace:list","workspace:read","workspace:write","workspace:archive","workspace:share","document:list","document:read","document:write","document:delete","integrity:read","ai:run"]),
  manager: Object.freeze(["providers:read","session:read","workspace:create","workspace:list","workspace:read","workspace:write","document:list","document:read","document:write","integrity:read","ai:run"]),
  senior: Object.freeze(["providers:read","session:read","workspace:list","workspace:read","workspace:write","document:list","document:read","document:write","integrity:read","ai:run"]),
  viewer: Object.freeze(["providers:read","session:read","workspace:list","workspace:read","document:list","document:read","integrity:read"]),
});

export function authorizeRole(role, permission) {
  return Boolean(ROLE_PERMISSIONS[role]?.includes(permission));
}

function jsonResponse(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store, max-age=0",
      "x-content-type-options": "nosniff",
      "referrer-policy": "no-referrer",
      "permissions-policy": "camera=(), geolocation=(), microphone=(self)",
      ...extraHeaders,
    },
  });
}

function corsHeaders(request, env) {
  const allowed = String(env?.ALLOWED_ORIGINS || "").split(",").map(x => x.trim()).filter(Boolean);
  const origin = request.headers.get("origin") || "";
  if (!origin || !allowed.includes(origin)) return {};
  return {
    "access-control-allow-origin": origin,
    "access-control-allow-credentials": "true",
    "access-control-allow-headers": "content-type, authorization, cf-access-jwt-assertion",
    "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
    "vary": "Origin",
  };
}

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    const output = {};
    for (const key of Object.keys(value).sort()) if (value[key] !== undefined) output[key] = canonicalize(value[key]);
    return output;
  }
  return typeof value === "string" ? value.normalize("NFC") : value;
}
function canonicalJSON(value) { return JSON.stringify(canonicalize(value)); }

function findForbiddenWorkspaceKey(value, path = []) {
  if (!value || typeof value !== "object") return null;
  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index += 1) {
      const found = findForbiddenWorkspaceKey(value[index], [...path, String(index)]);
      if (found) return found;
    }
    return null;
  }
  for (const [key, nested] of Object.entries(value)) {
    if (WORKSPACE_FORBIDDEN_KEYS.has(key)) return [...path, key].join(".");
    const found = findForbiddenWorkspaceKey(nested, [...path, key]);
    if (found) return found;
  }
  return null;
}

export function normalizeWorkspaceState(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return { error: "invalid_workspace_state" };
  const forbidden = findForbiddenWorkspaceKey(value);
  if (forbidden) return { error: "forbidden_workspace_key", key: forbidden };
  const retained = {};
  for (const key of WORKSPACE_ALLOWED_KEYS) if (value[key] !== undefined) retained[key] = value[key];
  const stateJson = canonicalJSON(retained);
  const byteLength = new TextEncoder().encode(stateJson).byteLength;
  if (byteLength > WORKSPACE_MAX_BYTES) return { error: "workspace_too_large", byteLength };
  return { state: JSON.parse(stateJson), stateJson, byteLength };
}

async function sha256(value) {
  const bytes = new TextEncoder().encode(String(value));
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, "0")).join("");
}
async function stableId(prefix, value) {
  return `${prefix}_${(await sha256(`${CANONICAL_VERSION}:${canonicalJSON(value)}`)).slice(0,26)}`;
}

function normalizeSitesSubject(request) {
  const raw = request.headers.get(AUTH_HEADER);
  if (!raw) return null;
  const subject = raw.trim().toLowerCase();
  return subject && subject.length <= 320 ? subject : null;
}
function normalizeAccessConfig(env) {
  const audience = String(env?.POLICY_AUD || "").trim();
  const rawTeamDomain = String(env?.TEAM_DOMAIN || "").trim();
  if (!audience || audience.length > 256 || !/^[A-Za-z0-9._:-]+$/.test(audience)) return null;
  if (!rawTeamDomain || rawTeamDomain.length > 253) return null;
  try {
    const url = new URL(rawTeamDomain);
    const hostname = url.hostname.toLowerCase();
    if (url.protocol !== "https:" || url.username || url.password || url.port || url.pathname !== "/" || url.search || url.hash) return null;
    if (!/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.cloudflareaccess\.com$/.test(hostname)) return null;
    return { audience, teamDomain: `https://${hostname}` };
  } catch { return null; }
}
function decodeBase64Url(segment) {
  if (!segment || segment.length > ACCESS_ASSERTION_MAX_BYTES || !/^[A-Za-z0-9_-]+$/.test(segment)) throw new Error("invalid_jwt_segment");
  const normalized = segment.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, c => c.charCodeAt(0));
}
function decodeJwtJson(segment) { return JSON.parse(new TextDecoder().decode(decodeBase64Url(segment))); }
function validAccessEmail(value) {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  if (!email || email.length > 320 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  return email;
}

export async function verifyCloudflareAccessSubject(request, env, options = {}) {
  const config = normalizeAccessConfig(env);
  const assertion = request.headers.get(ACCESS_ASSERTION_HEADER);
  if (!config || !assertion || assertion.length > ACCESS_ASSERTION_MAX_BYTES) return null;
  const parts = assertion.split(".");
  if (parts.length !== 3 || parts.some(part => !part)) return null;
  try {
    const header = decodeJwtJson(parts[0]);
    const payload = decodeJwtJson(parts[1]);
    if (!header || typeof header !== "object" || Array.isArray(header)) return null;
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) return null;
    if (header.alg !== "RS256" || typeof header.kid !== "string" || !header.kid || header.kid.length > 256) return null;
    if (payload.iss !== config.teamDomain) return null;
    const audiences = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
    if (!audiences.includes(config.audience)) return null;
    const nowSeconds = Number.isFinite(options.nowSeconds) ? options.nowSeconds : Math.floor(Date.now()/1000);
    if (!Number.isFinite(payload.exp) || payload.exp <= nowSeconds) return null;
    if (payload.nbf !== undefined && (!Number.isFinite(payload.nbf) || payload.nbf > nowSeconds)) return null;
    if (payload.iat !== undefined && (!Number.isFinite(payload.iat) || payload.iat > nowSeconds + 60)) return null;
    const email = validAccessEmail(payload.email);
    if (!email) return null;

    const fetchImpl = options.fetchImpl || fetch;
    const cryptoImpl = options.cryptoImpl || crypto;
    const response = await fetchImpl(`${config.teamDomain}/cdn-cgi/access/certs`, { headers: { accept:"application/json" } });
    if (!response?.ok) return null;
    const keySet = await response.json();
    const keys = Array.isArray(keySet?.keys) ? keySet.keys : [];
    if (!keys.length || keys.length > 32) return null;
    const jwk = keys.find(candidate => candidate?.kid === header.kid);
    if (!jwk || jwk.kty !== "RSA" || !jwk.n || !jwk.e) return null;
    if (jwk.alg && jwk.alg !== "RS256") return null;
    if (jwk.use && jwk.use !== "sig") return null;
    const publicKey = await cryptoImpl.subtle.importKey("jwk", jwk, {name:"RSASSA-PKCS1-v1_5",hash:"SHA-256"}, false, ["verify"]);
    const valid = await cryptoImpl.subtle.verify("RSASSA-PKCS1-v1_5", publicKey, decodeBase64Url(parts[2]), new TextEncoder().encode(`${parts[0]}.${parts[1]}`));
    return valid ? email : null;
  } catch { return null; }
}

async function authenticatedSubject(request, env) {
  return normalizeSitesSubject(request) || await verifyCloudflareAccessSubject(request, env);
}
async function tenantIdFor(subject) {
  return `ten_${(await sha256(`SKOSIF-TENANT-v2:${subject}`)).slice(0,26)}`;
}
function requireDatabase(env) {
  if (!env?.DB?.prepare || !env?.DB?.batch) throw new Error("database_unavailable");
  return env.DB;
}
function requireDocumentBucket(env) {
  const bucket=env?.DOCUMENTS;
  if(!bucket?.put||!bucket?.get||!bucket?.delete)throw new Error("document_vault_unavailable");
  return bucket;
}
async function sha256Bytes(buffer) {
  const digest=await crypto.subtle.digest("SHA-256",buffer);
  return [...new Uint8Array(digest)].map(byte=>byte.toString(16).padStart(2,"0")).join("");
}
function documentMime(request) {
  return String(request.headers.get("content-type")||"application/octet-stream").split(";")[0].trim().toLowerCase();
}
function documentName(url) {
  return String(url.searchParams.get("name")||"").replace(/[\u0000-\u001f\u007f]/g,"").trim().slice(0,180);
}
async function ensureTenant(db, tenantId, subject, at) {
  await db.batch([
    db.prepare("INSERT OR IGNORE INTO tenants (id,name,created_at) VALUES (?1,?2,?3)").bind(tenantId,"مساحة S.kosif",at),
    db.prepare("INSERT OR IGNORE INTO tenant_members (tenant_id,subject,role,created_at) VALUES (?1,?2,'owner',?3)").bind(tenantId,subject,at),
  ]);
}
async function memberRole(db, tenantId, subject) {
  const row = await db.prepare("SELECT role FROM tenant_members WHERE tenant_id=?1 AND subject=?2").bind(tenantId,subject).first();
  return row?.role || null;
}

function providerRegistry(env) {
  const checkedAt = new Date().toISOString();
  return {
    schemaVersion:2,
    policyVersion:"SKOSIF-SUMMARY-ONLY-v2",
    checkedAt,
    providers: providerDefinitions.map(provider => {
      if (provider.id === "kosif-local") return {...provider,status:"ready",configured:true,canRun:true,dataPolicy:"local-only",lastCheckedAt:checkedAt};
      if (provider.id === "jev") {
        const configured = Boolean(env?.JEV_SERVICE || env?.JEV_MODEL);
        return {id:provider.id,name:provider.name,execution:"server",providerType:"decision",status:configured?"configured":"unconfigured",configured,canRun:configured,model:env?.JEV_MODEL||null,dataPolicy:"summary-only",lastCheckedAt:checkedAt};
      }
      const configured = Boolean(env?.[provider.keyName] && env?.[provider.modelName]);
      return {id:provider.id,name:provider.name,execution:provider.execution,providerType:provider.providerType,status:configured?"configured":"unconfigured",configured,canRun:false,model:configured?String(env[provider.modelName]).slice(0,120):null,dataPolicy:"summary-only",lastCheckedAt:checkedAt};
    }),
    limitation:"LLM execution stays disabled here until a separately authenticated and rate-limited execution route is configured.",
  };
}

function validateWorkspaceInput(input) {
  const name = String(input?.name || input?.client_name_ar || "").trim();
  const businessYear = Number(input?.business_year ?? input?.fiscal_year ?? new Date().getFullYear());
  const currency = String(input?.currency || "SAR").toUpperCase();
  const schemaVersion = String(input?.schema_version || input?.ruleset_version || "skosif-v2").trim();
  const effectiveAt = String(input?.effective_at || new Date().toISOString());
  if (name.length < 2 || name.length > 200) return {error:"invalid_name"};
  if (!Number.isInteger(businessYear) || businessYear < 2000 || businessYear > 2200) return {error:"invalid_business_year"};
  if (!/^[A-Z]{3}$/.test(currency)) return {error:"invalid_currency"};
  if (!/^[A-Za-z0-9._-]{3,80}$/.test(schemaVersion)) return {error:"invalid_schema_version"};
  if (!Number.isFinite(Date.parse(effectiveAt))) return {error:"invalid_effective_at"};
  const sensitive = input?.sensitive === true || name.replace(/\s+/g,"") === "تصيف";
  return {name,businessYear,currency,schemaVersion,effectiveAt:new Date(effectiveAt).toISOString(),sensitive};
}

async function appendLogValues({workspaceId,actor,action,payload,at,prevHash=GENESIS_HASH}) {
  const canonicalPayload={workspace_id:workspaceId,actor,action,payload,at};
  const entryHash=await sha256(`${prevHash}${canonicalJSON(canonicalPayload)}`);
  return {payloadJson:canonicalJSON(payload),prevHash,entryHash};
}
async function workspaceForTenant(db,id,tenantId) {
  return db.prepare("SELECT id,tenant_id,name,business_year,currency,status,schema_version,created_by,created_at,archived_at FROM workspaces WHERE id=?1 AND tenant_id=?2").bind(id,tenantId).first();
}
async function workspaceById(db,id) {
  return db.prepare("SELECT id,tenant_id,name,business_year,currency,status,schema_version,created_by,created_at,archived_at FROM workspaces WHERE id=?1").bind(id).first();
}
async function workspaceSecurity(db,id,tenantId) {
  return db.prepare("SELECT access_mode,sensitivity,created_at FROM workspace_security WHERE workspace_id=?1 AND tenant_id=?2").bind(id,tenantId).first();
}
async function workspaceAccessContext(db,id,auth) {
  const workspace=await workspaceById(db,id);
  if(!workspace)return null;
  const tenantRole=workspace.tenant_id===auth.tenantId?await memberRole(db,workspace.tenant_id,auth.subject):null;
  const security=await workspaceSecurity(db,id,workspace.tenant_id);
  if((!security||security.access_mode==="tenant")&&tenantRole)return {workspace,tenantId:workspace.tenant_id,role:tenantRole,security};
  const access=await db.prepare("SELECT role FROM workspace_access WHERE workspace_id=?1 AND tenant_id=?2 AND subject=?3").bind(id,workspace.tenant_id,auth.subject).first();
  return access?{workspace,tenantId:workspace.tenant_id,role:access.role,security}:null;
}
async function latestRevision(db,id,tenantId) {
  return db.prepare("SELECT revision,state_json,state_hash,saved_by,saved_at FROM workspace_revisions WHERE workspace_id=?1 AND tenant_id=?2 ORDER BY revision DESC LIMIT 1").bind(id,tenantId).first();
}
function revisionResponse(row) {
  if (!row) return {revision:0,state:null,state_hash:null,saved_by:null,saved_at:null};
  return {revision:Number(row.revision),state:JSON.parse(row.state_json),state_hash:row.state_hash,saved_by:row.saved_by,saved_at:row.saved_at};
}

async function session(env, auth) {
  const db=requireDatabase(env),at=new Date().toISOString();
  await ensureTenant(db,auth.tenantId,auth.subject,at);
  const role=await memberRole(db,auth.tenantId,auth.subject);
  if (!authorizeRole(role,"session:read")) return jsonResponse({error:"permission_denied"},403);
  return jsonResponse({session:{subject:auth.subject,tenant_id:auth.tenantId,role,capabilities:[...(ROLE_PERMISSIONS[role]||[])]}});
}
async function listWorkspaces(env,auth) {
  const db=requireDatabase(env);
  await ensureTenant(db,auth.tenantId,auth.subject,new Date().toISOString());
  const tenantRole=await memberRole(db,auth.tenantId,auth.subject);
  if (!authorizeRole(tenantRole,"workspace:list")) return jsonResponse({error:"permission_denied"},403);
  const own=await db.prepare("SELECT id,tenant_id,name,business_year,currency,status,schema_version,created_by,created_at,archived_at FROM workspaces WHERE tenant_id=?1 ORDER BY created_at DESC,id DESC LIMIT 100").bind(auth.tenantId).all();
  const shared=await db.prepare("SELECT w.id,w.tenant_id,w.name,w.business_year,w.currency,w.status,w.schema_version,w.created_by,w.created_at,w.archived_at FROM workspace_access a JOIN workspaces w ON w.id=a.workspace_id AND w.tenant_id=a.tenant_id WHERE a.subject=?1 AND w.tenant_id<>?2 ORDER BY w.created_at DESC,w.id DESC LIMIT 100").bind(auth.subject,auth.tenantId).all();
  const candidates=new Map();
  for(const row of [...(own.results||[]),...(shared.results||[])])if(!candidates.has(row.id))candidates.set(row.id,row);
  const workspaces=[];
  for(const row of candidates.values()){
    const ctx=await workspaceAccessContext(db,row.id,auth);
    if(!ctx)continue;
    const security=ctx.security;
    workspaces.push({...row,workspace_role:ctx.role,sensitivity:security?.sensitivity||"standard",access_mode:security?.access_mode||"tenant",shared_from_tenant:row.tenant_id===auth.tenantId?null:row.tenant_id});
  }
  return jsonResponse({workspaces});
}
async function createWorkspace(request,env,auth) {
  const contentLength=Number(request.headers.get("content-length")||"0");
  if (contentLength>32768) return jsonResponse({error:"payload_too_large"},413);
  let input; try{input=await request.json()}catch{return jsonResponse({error:"invalid_json"},400)}
  const v=validateWorkspaceInput(input); if(v.error)return jsonResponse({error:v.error},422);
  const db=requireDatabase(env); await ensureTenant(db,auth.tenantId,auth.subject,v.effectiveAt);
  const role=await memberRole(db,auth.tenantId,auth.subject);
  if(!authorizeRole(role,"workspace:create"))return jsonResponse({error:"permission_denied"},403);
  const id=await stableId("wsp",{tenantId:auth.tenantId,name:v.name,businessYear:v.businessYear,schemaVersion:v.schemaVersion,effectiveAt:v.effectiveAt});
  const existing=await workspaceForTenant(db,id,auth.tenantId); if(existing)return jsonResponse({workspace:existing,idempotent:true});
  const log=await appendLogValues({workspaceId:id,actor:auth.subject,action:"workspace.created",payload:{schema_version:v.schemaVersion},at:v.effectiveAt});
  await db.batch([
    db.prepare("INSERT INTO workspaces (id,tenant_id,name,business_year,currency,status,schema_version,created_by,created_at) VALUES (?1,?2,?3,?4,?5,'active',?6,?7,?8)").bind(id,auth.tenantId,v.name,v.businessYear,v.currency,v.schemaVersion,auth.subject,v.effectiveAt),
    db.prepare("INSERT INTO workspace_security (workspace_id,tenant_id,access_mode,sensitivity,created_at) VALUES (?1,?2,?3,?4,?5)").bind(id,auth.tenantId,v.sensitive?"explicit":"tenant",v.sensitive?"sensitive":"standard",v.effectiveAt),
    db.prepare("INSERT INTO workspace_access (workspace_id,tenant_id,subject,role,created_at) VALUES (?1,?2,?3,'owner',?4)").bind(id,auth.tenantId,auth.subject,v.effectiveAt),
    db.prepare("INSERT INTO audit_log (workspace_id,actor,action,payload_json,at,canonical_version,prev_hash,entry_hash) VALUES (?1,?2,'workspace.created',?3,?4,?5,?6,?7)").bind(id,auth.subject,log.payloadJson,v.effectiveAt,CANONICAL_VERSION,log.prevHash,log.entryHash),
  ]);
  const security=await workspaceSecurity(db,id,auth.tenantId);
  return jsonResponse({workspace:{...(await workspaceForTenant(db,id,auth.tenantId)),workspace_role:"owner",sensitivity:security?.sensitivity||"standard",access_mode:security?.access_mode||"tenant"},idempotent:false},201);
}
async function getWorkspaceMeta(env,auth,id) {
  const tenantId=auth.workspaceTenantId||auth.tenantId;
  const row=await workspaceForTenant(requireDatabase(env),id,tenantId);
  return row?jsonResponse({workspace:{...row,workspace_role:auth.workspaceRole||auth.role}}):jsonResponse({error:"not_found"},404);
}
async function getWorkspaceState(env,auth,id) {
  const db=requireDatabase(env),tenantId=auth.workspaceTenantId||auth.tenantId;
  if(!await workspaceForTenant(db,id,tenantId))return jsonResponse({error:"not_found"},404);
  return jsonResponse({workspace:revisionResponse(await latestRevision(db,id,tenantId))});
}
async function saveWorkspaceState(request,env,auth,id) {
  const len=Number(request.headers.get("content-length")||"0"); if(len>196608)return jsonResponse({error:"payload_too_large"},413);
  let input;try{input=await request.json()}catch{return jsonResponse({error:"invalid_json"},400)}
  if(!Number.isInteger(input?.base_revision)||input.base_revision<0)return jsonResponse({error:"invalid_base_revision"},422);
  const normalized=normalizeWorkspaceState(input.state);
  if(normalized.error==="workspace_too_large")return jsonResponse({error:normalized.error,byte_length:normalized.byteLength},413);
  if(normalized.error)return jsonResponse({error:normalized.error,key:normalized.key||null},422);
  const db=requireDatabase(env),tenantId=auth.workspaceTenantId||auth.tenantId,meta=await workspaceForTenant(db,id,tenantId);
  if(!meta)return jsonResponse({error:"not_found"},404);
  if(meta.archived_at)return jsonResponse({error:"workspace_archived"},409);
  const current=await latestRevision(db,id,tenantId),currentRevision=Number(current?.revision||0);
  if(currentRevision!==input.base_revision)return jsonResponse({error:"workspace_revision_conflict",current_revision:currentRevision},409);
  const revision=currentRevision+1,savedAt=new Date().toISOString(),stateHash=await sha256(normalized.stateJson);
  const head=await db.prepare("SELECT entry_hash FROM audit_log WHERE workspace_id=?1 ORDER BY seq DESC LIMIT 1").bind(id).first();
  const log=await appendLogValues({workspaceId:id,actor:auth.subject,action:"workspace.saved",payload:{revision,state_hash:stateHash},at:savedAt,prevHash:head?.entry_hash||GENESIS_HASH});
  try{
    await db.batch([
      db.prepare("INSERT INTO workspace_revisions (workspace_id,tenant_id,revision,state_json,state_hash,saved_by,saved_at) VALUES (?1,?2,?3,?4,?5,?6,?7)").bind(id,tenantId,revision,normalized.stateJson,stateHash,auth.subject,savedAt),
      db.prepare("INSERT INTO audit_log (workspace_id,actor,action,payload_json,at,canonical_version,prev_hash,entry_hash) VALUES (?1,?2,'workspace.saved',?3,?4,?5,?6,?7)").bind(id,auth.subject,log.payloadJson,savedAt,CANONICAL_VERSION,log.prevHash,log.entryHash),
    ]);
  }catch(error){
    const refreshed=await latestRevision(db,id,tenantId),rr=Number(refreshed?.revision||0);
    if(rr!==input.base_revision)return jsonResponse({error:"workspace_revision_conflict",current_revision:rr},409);
    if(String(error?.message||"").includes("archived_workspace_is_read_only"))return jsonResponse({error:"workspace_archived"},409);
    throw error;
  }
  return jsonResponse({workspace:{revision,state:normalized.state,state_hash:stateHash,saved_by:auth.subject,saved_at:savedAt}},201);
}
async function shareWorkspace(request,env,auth,id) {
  const db=requireDatabase(env),tenantId=auth.workspaceTenantId||auth.tenantId,meta=await workspaceForTenant(db,id,tenantId);
  if(!meta)return jsonResponse({error:"not_found"},404);
  if(!["owner","partner"].includes(auth.workspaceRole))return jsonResponse({error:"permission_denied"},403);
  let input;try{input=await request.json()}catch{return jsonResponse({error:"invalid_json"},400)}
  const subject=String(input?.subject||"").trim().toLowerCase(),role=String(input?.role||"viewer").trim();
  if(!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(subject)||subject.length>320)return jsonResponse({error:"invalid_subject"},422);
  if(!["partner","manager","senior","viewer"].includes(role))return jsonResponse({error:"invalid_workspace_role"},422);
  const at=new Date().toISOString();
  await db.prepare("INSERT INTO workspace_access (workspace_id,tenant_id,subject,role,created_at) VALUES (?1,?2,?3,?4,?5) ON CONFLICT(workspace_id,subject) DO UPDATE SET role=excluded.role").bind(id,tenantId,subject,role,at).run();
  const head=await db.prepare("SELECT entry_hash FROM audit_log WHERE workspace_id=?1 ORDER BY seq DESC LIMIT 1").bind(id).first();
  const log=await appendLogValues({workspaceId:id,actor:auth.subject,action:"workspace.shared",payload:{subject,role},at,prevHash:head?.entry_hash||GENESIS_HASH});
  await db.prepare("INSERT INTO audit_log (workspace_id,actor,action,payload_json,at,canonical_version,prev_hash,entry_hash) VALUES (?1,?2,'workspace.shared',?3,?4,?5,?6,?7)").bind(id,auth.subject,log.payloadJson,at,CANONICAL_VERSION,log.prevHash,log.entryHash).run();
  return jsonResponse({shared:true,workspace_id:id,subject,role});
}

async function archiveWorkspace(request,env,auth,id) {
  const db=requireDatabase(env),tenantId=auth.workspaceTenantId||auth.tenantId,meta=await workspaceForTenant(db,id,tenantId);
  if(!meta)return jsonResponse({error:"not_found"},404);
  if(meta.archived_at)return jsonResponse({workspace:meta,idempotent:true});
  let body;try{body=await request.json()}catch{return jsonResponse({error:"invalid_json"},400)}
  const rationale=String(body?.rationale_ar||body?.rationale||"").trim(), atRaw=String(body?.effective_at||new Date().toISOString());
  if(rationale.length<10||!Number.isFinite(Date.parse(atRaw)))return jsonResponse({error:"archive_rationale_and_effective_at_required"},422);
  const at=new Date(atRaw).toISOString(),head=await db.prepare("SELECT entry_hash FROM audit_log WHERE workspace_id=?1 ORDER BY seq DESC LIMIT 1").bind(id).first();
  const log=await appendLogValues({workspaceId:id,actor:auth.subject,action:"workspace.archived",payload:{rationale_ar:rationale},at,prevHash:head?.entry_hash||GENESIS_HASH});
  await db.batch([
    db.prepare("UPDATE workspaces SET status='archived',archived_at=?1 WHERE id=?2 AND tenant_id=?3 AND archived_at IS NULL").bind(at,id,tenantId),
    db.prepare("INSERT INTO audit_log (workspace_id,actor,action,payload_json,at,canonical_version,prev_hash,entry_hash) VALUES (?1,?2,'workspace.archived',?3,?4,?5,?6,?7)").bind(id,auth.subject,log.payloadJson,at,CANONICAL_VERSION,log.prevHash,log.entryHash),
  ]);
  return jsonResponse({workspace:await workspaceForTenant(db,id,tenantId),idempotent:false});
}
async function integrityStatus(env,auth,id) {
  const db=requireDatabase(env),tenantId=auth.workspaceTenantId||auth.tenantId;
  if(!await workspaceForTenant(db,id,tenantId))return jsonResponse({error:"not_found"},404);
  const r=await db.prepare("SELECT seq,actor,action,payload_json,at,prev_hash,entry_hash FROM audit_log WHERE workspace_id=?1 ORDER BY seq ASC").bind(id).all();
  let prevHash=GENESIS_HASH;
  for(const row of r.results||[]){
    const expected=await sha256(`${prevHash}${canonicalJSON({workspace_id:id,actor:row.actor,action:row.action,payload:JSON.parse(row.payload_json),at:row.at})}`);
    if(row.prev_hash!==prevHash||row.entry_hash!==expected)return jsonResponse({valid:false,broken_seq:row.seq,head_hash:prevHash});
    prevHash=row.entry_hash;
  }
  return jsonResponse({valid:true,broken_seq:null,entries:r.results?.length||0,head_hash:prevHash});
}

async function documentRow(db,workspaceId,tenantId,documentId,includeDeleted=false) {
  const sql="SELECT id,workspace_id,tenant_id,name,mime,classification,size_bytes,sha256,source_gateway,uploaded_by,uploaded_at,deleted_at,object_key FROM workspace_documents WHERE id=?1 AND workspace_id=?2 AND tenant_id=?3"+(includeDeleted?"":" AND deleted_at IS NULL");
  return db.prepare(sql).bind(documentId,workspaceId,tenantId).first();
}
function publicDocument(row) {
  if(!row)return null;
  return {id:row.id,workspace_id:row.workspace_id,name:row.name,mime:row.mime,classification:row.classification,size_bytes:Number(row.size_bytes),sha256:row.sha256,source_gateway:row.source_gateway,uploaded_by:row.uploaded_by,uploaded_at:row.uploaded_at,deleted_at:row.deleted_at||null};
}
async function listDocuments(env,auth,id) {
  const db=requireDatabase(env),tenantId=auth.workspaceTenantId||auth.tenantId;
  const rows=await db.prepare("SELECT id,workspace_id,tenant_id,name,mime,classification,size_bytes,sha256,source_gateway,uploaded_by,uploaded_at,deleted_at FROM workspace_documents WHERE workspace_id=?1 AND tenant_id=?2 AND deleted_at IS NULL ORDER BY uploaded_at DESC,id DESC LIMIT 500").bind(id,tenantId).all();
  return jsonResponse({documents:(rows.results||[]).map(publicDocument),vault:"r2",workspace_id:id});
}
async function uploadDocument(request,env,auth,id,url) {
  const db=requireDatabase(env),tenantId=auth.workspaceTenantId||auth.tenantId,workspace=await workspaceForTenant(db,id,tenantId);
  if(!workspace)return jsonResponse({error:"not_found"},404);
  if(workspace.archived_at)return jsonResponse({error:"workspace_archived"},409);
  const bucket=requireDocumentBucket(env),length=Number(request.headers.get("content-length")||"0");
  if(length>DOCUMENT_MAX_BYTES)return jsonResponse({error:"document_too_large",max_bytes:DOCUMENT_MAX_BYTES},413);
  const name=documentName(url),classification=String(url.searchParams.get("classification")||"other").trim(),sourceGateway=String(url.searchParams.get("source_gateway")||"").trim().slice(0,60),mime=documentMime(request);
  if(!name)return jsonResponse({error:"document_name_required"},422);
  if(!DOCUMENT_TYPES.has(classification))return jsonResponse({error:"invalid_document_classification"},422);
  if(!DOCUMENT_MIMES.has(mime))return jsonResponse({error:"unsupported_document_mime"},415);
  const buffer=await request.arrayBuffer();
  if(!buffer.byteLength||buffer.byteLength>DOCUMENT_MAX_BYTES)return jsonResponse({error:buffer.byteLength?"document_too_large":"empty_document",max_bytes:DOCUMENT_MAX_BYTES},buffer.byteLength?413:422);
  const sha=await sha256Bytes(buffer),at=new Date().toISOString(),documentId=await stableId("doc",{workspaceId:id,actor:auth.subject,name,sha,at});
  const objectKey=`${tenantId}/${id}/${documentId}`;
  await bucket.put(objectKey,buffer,{httpMetadata:{contentType:mime},customMetadata:{workspace:id,document:documentId,sha256:sha}});
  const head=await db.prepare("SELECT entry_hash FROM audit_log WHERE workspace_id=?1 ORDER BY seq DESC LIMIT 1").bind(id).first();
  const log=await appendLogValues({workspaceId:id,actor:auth.subject,action:"document.uploaded",payload:{document_id:documentId,name,mime,classification,size_bytes:buffer.byteLength,sha256:sha},at,prevHash:head?.entry_hash||GENESIS_HASH});
  try{
    await db.batch([
      db.prepare("INSERT INTO workspace_documents (id,workspace_id,tenant_id,object_key,name,mime,classification,size_bytes,sha256,source_gateway,uploaded_by,uploaded_at) VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12)").bind(documentId,id,tenantId,objectKey,name,mime,classification,buffer.byteLength,sha,sourceGateway,auth.subject,at),
      db.prepare("INSERT INTO audit_log (workspace_id,actor,action,payload_json,at,canonical_version,prev_hash,entry_hash) VALUES (?1,?2,'document.uploaded',?3,?4,?5,?6,?7)").bind(id,auth.subject,log.payloadJson,at,CANONICAL_VERSION,log.prevHash,log.entryHash),
    ]);
  }catch(error){try{await bucket.delete(objectKey)}catch{}throw error}
  return jsonResponse({document:publicDocument(await documentRow(db,id,tenantId,documentId)),vault:"r2"},201);
}
async function downloadDocument(env,auth,id,documentId) {
  const db=requireDatabase(env),tenantId=auth.workspaceTenantId||auth.tenantId,row=await documentRow(db,id,tenantId,documentId);
  if(!row)return jsonResponse({error:"not_found"},404);
  const bucket=requireDocumentBucket(env),object=await bucket.get(row.object_key);
  if(!object)return jsonResponse({error:"document_object_missing"},404);
  const headers=new Headers({"content-type":row.mime,"content-length":String(row.size_bytes),"cache-control":"private, no-store, max-age=0","x-content-type-options":"nosniff","referrer-policy":"no-referrer","content-disposition":`attachment; filename*=UTF-8''${encodeURIComponent(row.name)}`,"x-sqc-document-sha256":row.sha256});
  return new Response(object.body,{status:200,headers});
}
async function deleteDocument(env,auth,id,documentId) {
  const db=requireDatabase(env),tenantId=auth.workspaceTenantId||auth.tenantId,workspace=await workspaceForTenant(db,id,tenantId);
  if(!workspace)return jsonResponse({error:"not_found"},404);
  if(workspace.archived_at)return jsonResponse({error:"workspace_archived"},409);
  const row=await documentRow(db,id,tenantId,documentId,true);if(!row)return jsonResponse({error:"not_found"},404);
  if(row.deleted_at)return jsonResponse({deleted:true,idempotent:true,document:publicDocument(row)});
  const bucket=requireDocumentBucket(env),at=new Date().toISOString();
  await bucket.delete(row.object_key);
  const head=await db.prepare("SELECT entry_hash FROM audit_log WHERE workspace_id=?1 ORDER BY seq DESC LIMIT 1").bind(id).first();
  const log=await appendLogValues({workspaceId:id,actor:auth.subject,action:"document.deleted",payload:{document_id:documentId,sha256:row.sha256},at,prevHash:head?.entry_hash||GENESIS_HASH});
  await db.batch([
    db.prepare("UPDATE workspace_documents SET deleted_at=?1 WHERE id=?2 AND workspace_id=?3 AND tenant_id=?4 AND deleted_at IS NULL").bind(at,documentId,id,tenantId),
    db.prepare("INSERT INTO audit_log (workspace_id,actor,action,payload_json,at,canonical_version,prev_hash,entry_hash) VALUES (?1,?2,'document.deleted',?3,?4,?5,?6,?7)").bind(id,auth.subject,log.payloadJson,at,CANONICAL_VERSION,log.prevHash,log.entryHash),
  ]);
  return jsonResponse({deleted:true,idempotent:false,document_id:documentId});
}

const routes = [
  ["POST", /^\/api\/capabilities-v2\/workspaces\/(wsp_[a-f0-9]{26})\/ai\/claude$/, "ai:run", "ai-claude"],
  ["GET", /^\/api\/capabilities-v2\/providers$/, "providers:read", "providers"],
  ["GET", /^\/api\/capabilities-v2\/session$/, "session:read", "session"],
  ["GET", /^\/api\/capabilities-v2\/workspaces$/, "workspace:list", "list"],
  ["POST", /^\/api\/capabilities-v2\/workspaces$/, "workspace:create", "create"],
  ["GET", /^\/api\/capabilities-v2\/workspaces\/(wsp_[a-f0-9]{26})$/, "workspace:read", "meta"],
  ["GET", /^\/api\/capabilities-v2\/workspaces\/(wsp_[a-f0-9]{26})\/state$/, "workspace:read", "state"],
  ["PUT", /^\/api\/capabilities-v2\/workspaces\/(wsp_[a-f0-9]{26})\/state$/, "workspace:write", "save"],
  ["POST", /^\/api\/capabilities-v2\/workspaces\/(wsp_[a-f0-9]{26})\/archive$/, "workspace:archive", "archive"],
  ["POST", /^\/api\/capabilities-v2\/workspaces\/(wsp_[a-f0-9]{26})\/share$/, "workspace:share", "share"],
  ["GET", /^\/api\/capabilities-v2\/workspaces\/(wsp_[a-f0-9]{26})\/documents$/, "document:list", "documents-list"],
  ["POST", /^\/api\/capabilities-v2\/workspaces\/(wsp_[a-f0-9]{26})\/documents$/, "document:write", "document-upload"],
  ["GET", /^\/api\/capabilities-v2\/workspaces\/(wsp_[a-f0-9]{26})\/documents\/(doc_[a-f0-9]{26})$/, "document:read", "document-download"],
  ["DELETE", /^\/api\/capabilities-v2\/workspaces\/(wsp_[a-f0-9]{26})\/documents\/(doc_[a-f0-9]{26})$/, "document:delete", "document-delete"],
  ["GET", /^\/api\/capabilities-v2\/workspaces\/(wsp_[a-f0-9]{26})\/integrity$/, "integrity:read", "integrity"],
];

async function handleApi(request,env,url) {
  if(request.method==="OPTIONS")return new Response(null,{status:204,headers:corsHeaders(request,env)});
  const found=routes.find(([method,re])=>method===request.method&&re.test(url.pathname));
  if(!found)return jsonResponse({error:"route_not_authorized"},403,corsHeaders(request,env));
  const [method,re,permission,action]=found,subject=action==="ai-claude" ? await verifyCloudflareAccessSubject(request,env) : await authenticatedSubject(request,env);
  if(!subject)return jsonResponse({error:"authentication_required"},401,corsHeaders(request,env));
  const auth={subject,tenantId:await tenantIdFor(subject),permission},match=url.pathname.match(re);
  try{
    if(action==="providers"){
      if(!authorizeRole("viewer",permission))return jsonResponse({error:"permission_denied"},403,corsHeaders(request,env));
      return jsonResponse(providerRegistry(env),200,corsHeaders(request,env));
    }
    if(action==="session")return addCors(await session(env,auth),request,env);
    const db=requireDatabase(env);await ensureTenant(db,auth.tenantId,auth.subject,new Date().toISOString());
    const role=await memberRole(db,auth.tenantId,auth.subject);
    if(!authorizeRole(role,permission))return jsonResponse({error:"permission_denied"},403,corsHeaders(request,env));
    auth.role=role;
    if(action==="list")return addCors(await listWorkspaces(env,auth),request,env);
    if(action==="create")return addCors(await createWorkspace(request,env,auth),request,env);
    if(["meta","state","save","archive","share","documents-list","document-upload","document-download","document-delete","integrity","ai-claude"].includes(action)){
      const access=await workspaceAccessContext(db,match[1],auth);
      if(!access)return jsonResponse({error:"not_found"},404,corsHeaders(request,env));
      if(!authorizeRole(access.role,permission))return jsonResponse({error:"permission_denied"},403,corsHeaders(request,env));
      auth.workspaceRole=access.role;auth.workspaceTenantId=access.tenantId;
    }
    if(action==="ai-claude")return addCors(await runClaudeSummary(request,env,{subject:auth.subject,tenantId:auth.workspaceTenantId,workspaceId:match[1],workspaceRole:auth.workspaceRole}),request,env);
    if(action==="meta")return addCors(await getWorkspaceMeta(env,auth,match[1]),request,env);
    if(action==="state")return addCors(await getWorkspaceState(env,auth,match[1]),request,env);
    if(action==="save")return addCors(await saveWorkspaceState(request,env,auth,match[1]),request,env);
    if(action==="archive")return addCors(await archiveWorkspace(request,env,auth,match[1]),request,env);
    if(action==="share")return addCors(await shareWorkspace(request,env,auth,match[1]),request,env);
    if(action==="documents-list")return addCors(await listDocuments(env,auth,match[1]),request,env);
    if(action==="document-upload")return addCors(await uploadDocument(request,env,auth,match[1],url),request,env);
    if(action==="document-download")return addCors(await downloadDocument(env,auth,match[1],match[2]),request,env);
    if(action==="document-delete")return addCors(await deleteDocument(env,auth,match[1],match[2]),request,env);
    if(action==="integrity")return addCors(await integrityStatus(env,auth,match[1]),request,env);
  }catch(error){
    if(error?.message==="database_unavailable")return jsonResponse({error:"database_unavailable"},503,corsHeaders(request,env));
    if(error?.message==="document_vault_unavailable")return jsonResponse({error:"document_vault_unavailable"},503,corsHeaders(request,env));
    return jsonResponse({error:"request_failed"},500,corsHeaders(request,env));
  }
  return jsonResponse({error:"route_not_authorized"},403,corsHeaders(request,env));
}
function addCors(response,request,env){
  const h=new Headers(response.headers);for(const [k,v] of Object.entries(corsHeaders(request,env)))h.set(k,v);
  return new Response(response.body,{status:response.status,statusText:response.statusText,headers:h});
}

export default {
  async fetch(request,env){
    const url=new URL(request.url);
    if(url.pathname.startsWith("/api/capabilities-v2/"))return handleApi(request,env,url);
    if(env?.ASSETS?.fetch){
      const response=await env.ASSETS.fetch(request);
      const headers=new Headers(response.headers);
      headers.set("x-content-type-options","nosniff");
      headers.set("referrer-policy","strict-origin-when-cross-origin");
      headers.set("permissions-policy","camera=(), geolocation=(), microphone=(self)");
      headers.set("content-security-policy","default-src 'self'; img-src 'self' data: blob:; font-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'self'");
      return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
    }
    return jsonResponse({service:"S.kosif Capabilities v2",status:"ready",api:"/api/capabilities-v2/session"});
  }
};

// Named exports for contract/regression tests without data-URL module rewriting.
export {workspaceAccessContext,validateWorkspaceInput};
