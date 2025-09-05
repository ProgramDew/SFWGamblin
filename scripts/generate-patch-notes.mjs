import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

const OUT_PATH = 'src/assets/patch-notes.json';

function nowDate() {
  return new Date().toISOString().slice(0, 10);
}

function ensureDir(p) {
  try { mkdirSync(dirname(p), { recursive: true }); } catch {}
}

function readExisting() {
  try {
    if (existsSync(OUT_PATH)) {
      return JSON.parse(readFileSync(OUT_PATH, 'utf8'));
    }
  } catch {}
  return null;
}

function fromGit() {
  try {
    const raw = execFileSync('git', ['log', '--pretty=format:%h|%ad|%s', '--date=short', '-n', '20'], { encoding: 'utf8' });
    const lines = raw.split(/\r?\n/).filter(Boolean);
    const entries = lines.map(l => {
      const [hash, date, subject] = l.split('|');
      return { title: subject?.trim() || '(no subject)', details: [`Commit ${hash} on ${date}`] };
    });
    return entries.slice(0, 10);
  } catch {
    return null;
  }
}

function main() {
  const pkgVersion = process.env.npm_package_version || '0.0.0';
  const existing = readExisting();
  const gitEntries = fromGit();

  const doc = {
    version: pkgVersion,
    updatedAt: nowDate(),
    entries: gitEntries && gitEntries.length ? gitEntries : existing?.entries || []
  };

  ensureDir(OUT_PATH);
  writeFileSync(OUT_PATH, JSON.stringify(doc, null, 2));
  console.log(`Wrote ${OUT_PATH} with ${doc.entries.length} entries.`);
}

main();
