/*
 * Auditable AI-Council receipts for a single company, workspace, engagement and round.
 * Advisory client-side artifact; it is NOT proof of server authorization, human approval
 * or of a live model invocation. Only authenticated server attestations can grant approval.
 */
const HEX64 = /^[a-f0-9]{64}$/i;
const ID = /^[\p{L}\p{N}_.:-]{1,128}$/u;
const FORBIDDEN = new Set(['final_opinion','approved_adjustment','posted_entry','archive_lock','calculated_materiality','authority']);
function needId(value, label) {
  if (typeof value !== 'string' || !ID.test(value)) throw new RangeError(label + '_INVALID');
  return value;
}
function scope(engagement, companyId, roundId) {
  const engId = needId(engagement?.id, 'ENGAGEMENT_ID');
  const company = needId(companyId, 'COMPANY_ID');
  if (engagement.companyId !== company) throw new Error('COMPANY_SCOPE_MISMATCH');
  const workspace = needId(engagement.workspaceId, 'WORKSPACE_ID');
  const round = needId(roundId, 'ROUND_ID');
  if (!(engagement.councilRounds || []).some(item => item.id === round)) throw new Error('ROUND_NOT_IN_ENGAGEMENT');
  return { companyId: company, workspaceId: workspace, engagementId: engId, roundId: round };
}
function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === 'object') return Object.fromEntries(
    Object.keys(value).sort().filter(key => value[key] !== undefined).map(key => [key, stable(value[key])])
  );
  if (typeof value === 'bigint') return value.toString();
  if (typeof value === 'number' && !Number.isFinite(value)) throw new TypeError('NON_FINITE_RECEIPT_VALUE');
  return value;
}
async function digest(value) {
  if (!globalThis.crypto?.subtle) throw new Error('CRYPTO_SHA256_UNAVAILABLE');
  const bytes = new TextEncoder().encode(JSON.stringify(stable(value)));
  const hash = await globalThis.crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(hash)].map(b => b.toString(16).padStart(2, '0')).join('');
}
function evidenceSnapshot(engagement, round) {
  const entries = new Map((engagement.evidence || []).map(e => [e.id, e]));
  const docs = new Map((engagement.documents || []).map(d => [d.id, d]));
  return (round.evidenceIds || []).map(id => {
    needId(id, 'EVIDENCE_ID');
    const evidence = entries.get(id);
    if (!evidence) throw new Error('EVIDENCE_NOT_IN_ENGAGEMENT');
    const documentIds = [...new Set(evidence.documentIds || [])].sort();
    const directHash = evidence.sha256 || evidence.provenance?.sha256 || null;
    const docHashes = documentIds.map(docId => {
      needId(docId, 'DOCUMENT_ID');
      const doc = docs.get(docId);
      if (!doc) throw new Error('DOCUMENT_NOT_IN_ENGAGEMENT');
      const h = doc.sha256 || doc.provenance?.sha256 || null;
      return { id: docId, sha256: h && HEX64.test(h) ? h.toLowerCase() : null };
    });
    return { id, sha256: directHash && HEX64.test(directHash) ? directHash.toLowerCase() : null, documents: docHashes };
  }).sort((a,b) => a.id.localeCompare(b.id));
}
function responseProjection(response, allowedEvidence) {
  if (!response || typeof response !== 'object' || Array.isArray(response)) throw new TypeError('RESPONSE_INVALID');
  for (const key of Object.keys(response)) if (FORBIDDEN.has(key)) throw new Error('FORBIDDEN_AI_AUTHORITY');
  const kind = response.kind;
  if (!['provider','deterministic'].includes(kind)) throw new RangeError('RESPONSE_KIND_INVALID');
  const seatId = needId(response.seatId, 'SEAT_ID');
  const status = response.status;
  if (!['completed','blocked','unavailable','error'].includes(status)) throw new RangeError('RESPONSE_STATUS_INVALID');
  const model = kind === 'provider' ? needId(response.modelId, 'MODEL_ID') : null;
  const provider = kind === 'provider' ? needId(response.providerId, 'PROVIDER_ID') : null;
  if (kind === 'deterministic' && (response.modelId || response.providerId)) throw new Error('DETERMINISTIC_PROVIDER_SPOOF');
  const claims = (response.claims || []).map(item => {
    if (typeof item.text !== 'string' || item.text.length > 3000) throw new RangeError('CLAIM_INVALID');
    const evidenceIds = [...new Set(item.evidenceIds || [])].sort();
    if (evidenceIds.some(id => !allowedEvidence.has(id))) throw new Error('CLAIM_EVIDENCE_OUTSIDE_SNAPSHOT');
    return { text: item.text, evidenceIds };
  });
  if (claims.length > 60) throw new RangeError('TOO_MANY_CLAIMS');
  return { kind, seatId, status, providerId: provider, modelId: model, claims, receivedAt: String(response.receivedAt || ''), errorCode: status === 'completed' ? null : String(response.errorCode || 'NOT_AVAILABLE').slice(0,120) };
}
/**
 * A declared model/provider identity is NOT independent proof of a live API run.
 * A repeated provider+model identity never counts as an additional source.
 * Distinct labels may still share upstream training/data/model; server provenance
 * remains a separate release gate.
 */
export function assessCouncilResponseIndependence(responses = []) {
  if (!Array.isArray(responses)) throw new TypeError('RESPONSES_INVALID');
  const byIdentity = new Map();
  let deterministicCount = 0, declaredProviderResponses = 0, unavailableCount = 0;
  for (const response of responses) {
    if (!response || typeof response !== 'object') throw new TypeError('RESPONSE_INVALID');
    if (response.status !== 'completed') { unavailableCount++; continue; }
    if (response.kind === 'deterministic') { deterministicCount++; continue; }
    if (response.kind !== 'provider') throw new RangeError('RESPONSE_KIND_INVALID');
    const providerId = needId(response.providerId,'PROVIDER_ID').toLowerCase();
    const modelId = needId(response.modelId,'MODEL_ID').toLowerCase();
    const seatId = needId(response.seatId,'SEAT_ID');
    const key = JSON.stringify([providerId,modelId]);
    if (!byIdentity.has(key)) byIdentity.set(key,{providerId,modelId,seatIds:[]});
    byIdentity.get(key).seatIds.push(seatId);
    declaredProviderResponses++;
  }
  const groups = [...byIdentity.values()].map(g=>({...g,seatIds:g.seatIds.sort()}))
    .sort((a,b)=>a.providerId.localeCompare(b.providerId)||a.modelId.localeCompare(b.modelId));
  return {
    basis:'self-declared-provider-model-only',
    independenceVerified:false,
    liveInvocationVerified:false,
    deterministicCount,
    declaredProviderResponses,
    unavailableCount,
    uniqueDeclaredProviderModelPairs:groups.length,
    potentiallyCorrelatedResponses:declaredProviderResponses-groups.length,
    duplicateProviderModelGroups:groups.filter(g=>g.seatIds.length>1)
  };
}
export async function createCouncilReceipt({ engagement, companyId, roundId, responses = [], at = new Date().toISOString() }) {
  const binding = scope(engagement, companyId, roundId);
  const round = engagement.councilRounds.find(r => r.id === roundId);
  const old = engagement.aiSessionReceipts || [];
  if (!(await verifyCouncilReceipts(engagement))) throw new Error('PREVIOUS_RECEIPT_TAMPERED');
  if (old.some(r => r.scope?.roundId === roundId)) throw new Error('COUNCIL_RECEIPT_ALREADY_EXISTS');
  if (old.some(r => r.scope?.companyId !== companyId || r.scope?.engagementId !== engagement.id || r.scope?.workspaceId !== engagement.workspaceId)) throw new Error('PREVIOUS_RECEIPT_SCOPE_MISMATCH');
  if (typeof at !== 'string' || !Number.isFinite(Date.parse(at))) throw new RangeError('RECEIPT_TIME_INVALID');
  const evidence = evidenceSnapshot(engagement, round);
  const allowedEvidence = new Set(evidence.map(e => e.id));
  const projectedResponses = responses.map(r => responseProjection(r, allowedEvidence));
  // Each council seat has exactly one answer per round, regardless of which
  // provider label it declares. Count reused model identities separately.
  const seatIds = projectedResponses.map(r => r.seatId.toLowerCase());
  if (new Set(seatIds).size !== seatIds.length) throw new Error('DUPLICATE_INDEPENDENT_SEAT');
  const responseIndependence = assessCouncilResponseIndependence(projectedResponses);
  const evidenceComplete = evidence.length > 0 && evidence.every(e => (e.sha256 || e.documents.some(d => d.sha256)) && e.documents.every(d => d.sha256));
  const previousHash = old.at(-1)?.receiptHash || null;
  const snapshotHash = await digest({ binding, evidence });
  const receipt = {
    version: 1, id: binding.engagementId + ':' + roundId, scope: binding, at,
    sourceType: 'advisory-not-authorized', humanReview: 'required',
    evidenceStatus: evidenceComplete ? 'hashes-present' : 'missing-source-hashes',
    evidenceSnapshot: evidence, snapshotHash, previousHash,
    responses: projectedResponses, responseCount: projectedResponses.length, responseIndependence
  };
  return { ...receipt, receiptHash: await digest(receipt) };
}
export async function attachCouncilReceipt(engagement, receipt) {
  if (engagement?.companyId !== receipt?.scope?.companyId ||
      engagement?.workspaceId !== receipt?.scope?.workspaceId ||
      engagement?.id !== receipt?.scope?.engagementId) throw new Error('RECEIPT_SCOPE_MISMATCH');
  if (!(engagement.councilRounds || []).some(r => r.id === receipt.scope.roundId)) throw new Error('RECEIPT_ROUND_MISSING');
  const next = structuredClone(engagement);
  next.aiSessionReceipts ||= [];
  if (next.aiSessionReceipts.some(r => r.id === receipt.id)) throw new Error('RECEIPT_DUPLICATE');
  if ((next.aiSessionReceipts.at(-1)?.receiptHash || null) !== receipt.previousHash) throw new Error('RECEIPT_CHAIN_MISMATCH');
  next.aiSessionReceipts.push(structuredClone(receipt));
  if (!(await verifyCouncilReceipts(next))) throw new Error('RECEIPT_HASH_INVALID');
  return next;
}
export async function verifyCouncilReceipts(engagement) {
  let previousHash = null;
  for (const receipt of engagement.aiSessionReceipts || []) {
    if (receipt.scope?.companyId !== engagement.companyId || receipt.scope?.workspaceId !== engagement.workspaceId ||
        receipt.scope?.engagementId !== engagement.id || receipt.previousHash !== previousHash) return false;
    if (!(engagement.councilRounds || []).some(r => r.id === receipt.scope.roundId)) return false;
    const { receiptHash, ...rest } = receipt;
    if (await digest(rest) !== receiptHash) return false;
    // Keep old v1 receipts valid; for new receipts the counted identities must
    // agree with the immutable response list, even if the summary is forged.
    if (Object.hasOwn(receipt, 'responseIndependence')) {
      let recalculated;
      try { recalculated = assessCouncilResponseIndependence(receipt.responses); }
      catch { return false; }
      if (JSON.stringify(stable(receipt.responseIndependence)) !==
          JSON.stringify(stable(recalculated))) return false;
    }
    if (await digest({ binding: receipt.scope, evidence: receipt.evidenceSnapshot }) !== receipt.snapshotHash) return false;
    previousHash = receiptHash;
  }
  return true;
}
