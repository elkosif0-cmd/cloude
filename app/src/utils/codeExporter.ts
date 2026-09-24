import JSZip from 'jszip';
import { STORAGE_KEYS, CURRENT_SCHEMA_VERSION } from '../storage/localStorage';

const PROJECT = 'منظومة أغنام الوادي v19.10';
const VERSION = '19.10.1';

// Source files are bundled as raw text at build time.
const sources = import.meta.glob(
  ['/index.html', '/package.json', '/tsconfig.json', '/vite.config.ts', '/metadata.json', '/src/**/*.{ts,tsx,css}'],
  { query: '?raw', import: 'default', eager: true }
) as Record<string, string>;

export interface CodeExportResult {
  fileName: string;
  sizeBytes: number;
  fileCount: number;
}

function sourceFiles(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [path, text] of Object.entries(sources)) out[path.replace(/^\//, '')] = text;
  return out;
}

function liveDataSnapshot(): Record<string, unknown> {
  const snap: Record<string, unknown> = { schemaVersion: CURRENT_SCHEMA_VERSION, exportDate: new Date().toISOString() };
  for (const [name, key] of Object.entries(STORAGE_KEYS)) {
    try {
      const raw = localStorage.getItem(key as string);
      if (raw != null) snap[name] = JSON.parse(raw);
    } catch {
      /* skip unreadable keys */
    }
  }
  return snap;
}

function stamp(): string {
  return new Date().toISOString().slice(0, 10);
}

function download(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function exportEntireCodeAsZip(includeData = false): Promise<CodeExportResult> {
  const files = sourceFiles();
  const zip = new JSZip();
  for (const [path, text] of Object.entries(files)) zip.file(path, text);
  if (includeData) zip.file('data/live-database-backup.json', JSON.stringify(liveDataSnapshot(), null, 2));
  const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
  const fileName = `aghnam_alwadi_source_code_${stamp()}.zip`;
  download(blob, fileName);
  return { fileName, sizeBytes: blob.size, fileCount: Object.keys(files).length + (includeData ? 1 : 0) };
}

export function exportEntireCodeAsJson(includeData = false): CodeExportResult {
  const files = sourceFiles();
  const payload: Record<string, unknown> = {
    project: PROJECT,
    version: VERSION,
    exportedAt: new Date().toISOString(),
    totalFiles: Object.keys(files).length,
    files,
  };
  if (includeData) payload.liveDataSnapshot = liveDataSnapshot();
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const fileName = `aghnam_alwadi_full_code_${stamp()}.json`;
  download(blob, fileName);
  return { fileName, sizeBytes: blob.size, fileCount: Object.keys(files).length };
}
