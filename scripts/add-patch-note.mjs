import { existsSync, readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const DRAFT_PATH = 'PATCH_NOTES_NEXT.md';
const OUT_PATH = 'src/assets/patch-notes.json';

function nowDate() {
  return new Date().toISOString().slice(0, 10);
}

function ensureDir(p) {
  try { mkdirSync(dirname(p), { recursive: true }); } catch {}
}

function parseDraft(md) {
  // Expect a line starting with "Title:" then description lines
  const lines = md.split(/\r?\n/);
  let title = '';
  const details = [];
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    if (!title && /^title\s*:/i.test(line)) {
      title = line.replace(/^title\s*:/i, '').trim();
      continue;
    }
    // treat remaining non-empty lines as detail bullets
    details.push(line.replace(/^[-*]\s*/, ''));
  }
  return { title, details };
}

function loadJson(path) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return null;
  }
}

function saveJson(path, data) {
  ensureDir(path);
  writeFileSync(path, JSON.stringify(data, null, 2));
}

function main() {
  if (!existsSync(DRAFT_PATH)) {
    console.log(`[patch-notes] No draft found at ${DRAFT_PATH}; skipping.`);
    return;
  }

  const draftRaw = readFileSync(DRAFT_PATH, 'utf8');
  const { title, details } = parseDraft(draftRaw);

  if (!title) {
    console.log('[patch-notes] Draft missing Title:. Skipping.');
    return;
  }

  const existing = loadJson(OUT_PATH) || { version: process.env.npm_package_version || '0.0.0', updatedAt: nowDate(), entries: [] };

  const nextNum = (existing.entries?.length || 0) + 1;
  const entry = {
    title: `Update #${nextNum} ${title}`.trim(),
    details: details && details.length ? details : undefined
  };

  const entries = [entry, ...(existing.entries || [])];
  const doc = {
    version: existing.version || process.env.npm_package_version || '0.0.0',
    updatedAt: nowDate(),
    entries
  };

  saveJson(OUT_PATH, doc);
  try { unlinkSync(DRAFT_PATH); } catch {}
  console.log(`[patch-notes] Added: ${entry.title}`);
}

main();

