// Caller authentication for the KOSIF WhatsApp MCP Worker.
// Every tool acts as the linked WhatsApp account (it uses the BRIDGE_KEY secret), so a tool call must come from the
// account owner: an Auth0 access token issued for this Worker to a user listed in KOSIF_OWNER_SUBS, or the
// WA_MCP_TOKEN shared secret for server-to-server callers that cannot sign in. Fails closed: with neither an owner
// list nor a shared secret configured, no tool runs.
// Self-contained on purpose: a newer index.js only needs the three calls shown in its fetch handler.

const AUTH0_ISSUER = 'https://dev-zn5bwigg38b13ui8.us.auth0.com/';
const AUTH0_JWKS = AUTH0_ISSUER + '.well-known/jwks.json';
const SCOPES = ['openid', 'profile', 'email'];
const MIN_SHARED_SECRET = 32;
const enc = new TextEncoder();

/* the token audience; the Auth0 API identifier must be this exact value */
export function resourceOf(url, env) {
  return String(env.WA_RESOURCE || url.origin).replace(/\/+$/, '');
}
export function isMetadataPath(pathname) {
  return pathname === '/.well-known/oauth-protected-resource' || pathname === '/.well-known/oauth-protected-resource/mcp';
}
export function protectedResourceMetadata(url, env) {
  return {
    resource: resourceOf(url, env),
    authorization_servers: [AUTH0_ISSUER],
    scopes_supported: SCOPES,
    resource_name: 'KOSIF WhatsApp MCP',
    bearer_methods_supported: ['header'],
  };
}
export const securitySchemes = [{ type: 'oauth2', scopes: SCOPES }];

function challengeHeader(url, env, description) {
  return 'Bearer resource_metadata="' + resourceOf(url, env) + '/.well-known/oauth-protected-resource", scope="' + SCOPES.join(' ') +
    '", error="invalid_token", error_description="' + description.replace(/"/g, '') + '"';
}
/* the tool result a host turns into a sign-in prompt, plus the matching WWW-Authenticate header */
export function authChallenge(url, env, description = 'Sign in as the WhatsApp account owner to use KOSIF WhatsApp') {
  const header = challengeHeader(url, env, description);
  return {
    header,
    result: { content: [{ type: 'text', text: description }], structuredContent: { error: 'authentication_required' }, isError: true, _meta: { 'mcp/www_authenticate': [header] } },
  };
}

function bearer(req) {
  const m = /^Bearer[ \t]+([^\s]+)$/i.exec(req.headers.get('authorization') || '');
  return m ? m[1] : '';
}
function ownerSubs(env) {
  return String(env.KOSIF_OWNER_SUBS || '').split(',').map((s) => s.trim()).filter(Boolean);
}
async function sha256(v) {
  return new Uint8Array(await crypto.subtle.digest('SHA-256', enc.encode(String(v))));
}
/* both sides are hashed first, so the comparison takes the same time whatever the lengths or the first difference */
async function sameSecret(a, b) {
  const [x, y] = await Promise.all([sha256(a), sha256(b)]);
  let d = 0;
  for (let i = 0; i < x.length; i++) d |= x[i] ^ y[i];
  return d === 0;
}
function b64uBytes(s) {
  s = String(s || '').replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  const bin = atob(s), out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
const b64uJson = (s) => JSON.parse(new TextDecoder().decode(b64uBytes(s)));

let jwksCache = { at: 0, keys: [] };
async function jwks(force = false) {
  if (!force && jwksCache.keys.length && Date.now() - jwksCache.at < 300000) return jwksCache.keys;
  const r = await fetch(AUTH0_JWKS, { headers: { accept: 'application/json' } });
  if (!r.ok) throw new Error('AUTH_JWKS_UNAVAILABLE');
  const body = await r.json();
  const keys = Array.isArray(body?.keys) ? body.keys : [];
  if (!keys.length) throw new Error('AUTH_JWKS_EMPTY');
  jwksCache = { at: Date.now(), keys };
  return keys;
}
async function verifyAccessToken(token, audience) {
  try {
    const parts = String(token || '').split('.');
    if (parts.length !== 3) return null;
    const header = b64uJson(parts[0]), payload = b64uJson(parts[1]);
    if (!['RS256', 'PS256'].includes(header?.alg) || !header?.kid) return null;
    const aud = payload?.aud;
    if (payload?.iss !== AUTH0_ISSUER || !(Array.isArray(aud) ? aud.includes(audience) : aud === audience) || !payload?.sub) return null;
    const now = Math.floor(Date.now() / 1000);
    if (!Number.isFinite(Number(payload?.exp)) || Number(payload.exp) <= now) return null;
    if (payload?.nbf != null && Number(payload.nbf) > now + 60) return null;
    let jwk = (await jwks(false)).find((k) => k?.kid === header.kid && k?.kty === 'RSA');
    if (!jwk) jwk = (await jwks(true)).find((k) => k?.kid === header.kid && k?.kty === 'RSA');
    if (!jwk) return null;
    const pss = header.alg === 'PS256';
    const key = await crypto.subtle.importKey('jwk', jwk, pss ? { name: 'RSA-PSS', hash: 'SHA-256' } : { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
    const ok = await crypto.subtle.verify(pss ? { name: 'RSA-PSS', saltLength: 32 } : 'RSASSA-PKCS1-v1_5', key, b64uBytes(parts[2]), enc.encode(parts[0] + '.' + parts[1]));
    return ok ? String(payload.sub) : null;
  } catch {
    return null;
  }
}

/* {ok:true, method} for the owner; {ok:false, reason} otherwise. reason "owner_not_configured" means fail closed. */
export async function authorize(req, url, env) {
  const owners = ownerSubs(env);
  const shared = String(env.WA_MCP_TOKEN || '');
  const sharedUsable = shared.length >= MIN_SHARED_SECRET;
  if (!owners.length && !sharedUsable) return { ok: false, reason: 'owner_not_configured' };
  const presented = bearer(req);
  if (!presented) return { ok: false, reason: 'missing_token' };
  if (owners.length) {
    const sub = await verifyAccessToken(presented, resourceOf(url, env));
    if (sub && owners.includes(sub)) return { ok: true, method: 'oauth2' };
  }
  if (sharedUsable && await sameSecret(presented, shared)) return { ok: true, method: 'shared-secret' };
  return { ok: false, reason: 'invalid_token' };
}
