/** Verified physical-page ownership and introductory metadata, not adapter acceptance.
 * Source inspection and source-review progress are separate from the application’s
 * reviewedPublishedSource gate. This index never constructs statements or a ledger.
 */
export { REFERENCE_REPORTS, REFERENCE_METADATA, REFERENCE_DOCUMENT_GROUPS, REFERENCE_INPUT_HASHES } from './source-data/reference-index';
import { REFERENCE_REPORTS } from './source-data/reference-index';
export type ReferenceReport = typeof REFERENCE_REPORTS[number];
const byId = new Map<string, ReferenceReport>();
for (const report of REFERENCE_REPORTS) {
  byId.set(report.id, report);
  if (report.legacy_id) byId.set(report.legacy_id, report);
}
export const referenceReport = (id: string): ReferenceReport | undefined => byId.get(id);
export const canonicalReferenceId = (id: string): string => referenceReport(id)?.id ?? id;
export const legacyReferenceId = (id: string): string => referenceReport(id)?.legacy_id ?? id;
