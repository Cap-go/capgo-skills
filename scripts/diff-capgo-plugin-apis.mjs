/**
 * Diff src/definitions.ts between last tag before CUTOFF and latest tag per Cap-go capacitor-* repo.
 */
import { spawnSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
  configKeyFromPackage,
  diffLists,
  extractConfigKeys,
  extractListenerEvents,
  extractMethods,
} from './lib/parse-definitions.mjs';

const CUTOFF = '2026-09-11T00:00:00Z';
const ORG = 'Cap-go';
const OUT = path.join(process.cwd(), 'scripts/.cache/capgo-api-diffs.json');

function ghApi(pathname) {
  const r = spawnSync('gh', ['api', pathname], {
    encoding: 'utf8',
    maxBuffer: 80 * 1024 * 1024,
    env: { ...process.env, GH_TOKEN: process.env.GITHUB_TOKEN || process.env.GH_TOKEN },
  });
  if (r.status !== 0) throw new Error(`${pathname}: ${r.stderr || r.stdout}`);
  return JSON.parse(r.stdout || 'null');
}

function ghJson(args) {
  const r = spawnSync('gh', args, { encoding: 'utf8', maxBuffer: 80 * 1024 * 1024 });
  if (r.status !== 0) throw new Error(r.stderr || r.stdout);
  return JSON.parse(r.stdout);
}

async function rawAt(repo, tag, filePath, pkgPath = '') {
  const rel = pkgPath ? `${pkgPath}/${filePath}` : filePath;
  try {
    const data = ghApi(`repos/${ORG}/${repo}/contents/${rel}?ref=${encodeURIComponent(tag)}`);
    return { status: 'ok', text: Buffer.from(data.content, 'base64').toString('utf8') };
  } catch (e) {
    const msg = e.message || String(e);
    if (/\b404\b/.test(msg)) return { status: 'missing', text: null };
    return { status: 'error', error: msg };
  }
}

async function tagCommitDate(repo, tag) {
  try {
    const ref = ghApi(`repos/${ORG}/${repo}/git/ref/tags/${encodeURIComponent(tag)}`);
    const sha = ref.object.sha;
    let commit = ghApi(`repos/${ORG}/${repo}/commits/${sha}`);
    if (commit.url?.includes('/git/tags/')) {
      const tagObj = ghApi(`repos/${ORG}/${repo}/git/tags/${sha}`);
      commit = ghApi(`repos/${ORG}/${repo}/commits/${tagObj.object.sha}`);
    }
    return commit.commit?.committer?.date;
  } catch {
    return null;
  }
}

function majorFromTag(tag) {
  const m = String(tag).match(/^(\d+)\./);
  return m ? Number.parseInt(m[1], 10) : 0;
}

async function resolveTags(repo) {
  const releases = ghApi(`repos/${ORG}/${repo}/releases?per_page=100`);
  const withDates = [];
  for (const rel of releases) {
    if (!rel.tag_name || !rel.published_at) continue;
    withDates.push({ tag: rel.tag_name, date: rel.published_at });
  }
  if (withDates.length === 0) {
    const tags = ghApi(`repos/${ORG}/${repo}/tags?per_page=30`);
    for (const t of tags.slice(0, 15)) {
      const date = await tagCommitDate(repo, t.name);
      if (date) withDates.push({ tag: t.name, date });
    }
  }
  withDates.sort((a, b) => (a.date < b.date ? -1 : 1));
  if (!withDates.length) return null;
  const latest = withDates[withDates.length - 1];
  if (latest.date < CUTOFF) return null;
  const beforeCutoff = withDates.filter((t) => t.date < CUTOFF);
  const latestMajor = majorFromTag(latest.tag);
  const sameMajorBefore = beforeCutoff.filter((t) => majorFromTag(t.tag) === latestMajor);
  const before = sameMajorBefore.length
    ? sameMajorBefore[sameMajorBefore.length - 1]
    : beforeCutoff.length
      ? beforeCutoff[beforeCutoff.length - 1]
      : withDates[0];
  return {
    fromTag: before.tag,
    fromDate: before.date,
    toTag: latest.tag,
    toDate: latest.date,
  };
}

function isChangelogBoilerplate(line) {
  const t = line.replace(/^[\+\-@]\s*/, '').trim();
  if (!t) return true;
  if (/^#+\s*\[/.test(t)) return true;
  if (/^#+\s*(Added|Changed|Deprecated|Removed|Fixed|Security)\s*$/i.test(t)) return true;
  if (/keep a changelog/i.test(t)) return true;
  if (/notable changes to this project/i.test(t)) return true;
  if (/any breaking changes or migration notes/i.test(t)) return true;
  if (/soon-to-be removed features/i.test(t)) return true;
  if (/removed features.*breaking changes or migration/i.test(t)) return true;
  if (/^\*\*Removed\*\*:\s*Removed features\s*$/i.test(t)) return true;
  if (/^-\s*\*\*Removed\*\*:\s*Removed features\s*$/i.test(t)) return true;
  if (/^Removed features\s*$/i.test(t)) return true;
  if (/^#{1,6}\s*$/.test(t)) return true;
  if (/^@@\s/.test(t)) return true;
  return false;
}

function isChangelogSignalLine(line) {
  const t = line.replace(/^[\+\-]\s*/, '').trim();
  if (isChangelogBoilerplate(t)) return false;
  if (/BREAKING/i.test(t)) return true;
  if (/\bbreaking\b/i.test(t)) return true;
  if (/\bdeprecated\b/i.test(t) && !/^#+\s*Deprecated\s*$/i.test(t)) return true;
  if (/\bmigration\b/i.test(t)) return true;
  if (/\bremoved\b/i.test(t) && !/^#+\s*Removed\s*$/i.test(t)) return true;
  return false;
}

function parseChangelogBreaking(text) {
  if (!text) return [];
  if (!/breaking|removed|deprecated|migration/i.test(text)) return [];
  const lines = [];
  for (const line of text.split('\n')) {
    if (!isChangelogSignalLine(line)) continue;
    const t = line.replace(/^[\+\-]\s*/, '').trim();
    if (t) lines.push(t);
  }
  return lines.slice(0, 20);
}

async function compareChangelog(repo, fromTag, toTag) {
  try {
    const cmp = ghApi(
      `repos/${ORG}/${repo}/compare/${encodeURIComponent(fromTag)}...${encodeURIComponent(toTag)}`,
    );
    const notes = [];
    for (const f of cmp.files || []) {
      if (f.filename.toLowerCase().includes('changelog') && f.patch) {
        notes.push(...parseChangelogBreaking(f.patch));
      }
    }
    return [...new Set(notes)];
  } catch {
    return [];
  }
}

async function discoverPkgName(repo, branch = 'main') {
  try {
    const data = ghApi(`repos/${ORG}/${repo}/contents/package.json?ref=${branch}`);
    const pkg = JSON.parse(Buffer.from(data.content, 'base64').toString('utf8'));
    return pkg.name;
  } catch {
    return `@capgo/${repo}`;
  }
}

async function mapPool(items, n, fn) {
  const out = new Array(items.length);
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      out[idx] = await fn(items[idx], idx);
    }
  }
  await Promise.all(Array.from({ length: n }, () => worker()));
  return out;
}

async function main() {
  const repos = ghJson([
    'repo',
    'list',
    ORG,
    '--limit',
    '500',
    '--json',
    'name,isArchived,latestRelease',
  ]).filter((r) => !r.isArchived && r.name.startsWith('capacitor-'));

  const results = await mapPool(repos, 6, async (r) => {
    const repo = r.name;
    try {
      const tags = await resolveTags(repo);
      if (!tags) return { repo, skipped: true, reason: 'no tags in window' };

      const pkgName = await discoverPkgName(repo);
      const configKey = configKeyFromPackage(pkgName);

      const oldDef = await rawAt(repo, tags.fromTag, 'src/definitions.ts');
      const newDef = await rawAt(repo, tags.toTag, 'src/definitions.ts');
      if (oldDef.status === 'error') {
        return { repo, error: `definitions at ${tags.fromTag}: ${oldDef.error}` };
      }
      if (newDef.status === 'error') {
        return { repo, error: `definitions at ${tags.toTag}: ${newDef.error}` };
      }
      const oldText = oldDef.text ?? '';
      const newText = newDef.text ?? '';

      const oldMethods = extractMethods(oldText);
      const newMethods = extractMethods(newText);
      const methodDiff = diffLists(oldMethods, newMethods);

      const oldEvents = extractListenerEvents(oldText);
      const newEvents = extractListenerEvents(newText);
      const eventDiff = diffLists(oldEvents, newEvents);

      const oldConfig = extractConfigKeys(oldText, configKey);
      const newConfig = extractConfigKeys(newText, configKey);
      const configDiff = diffLists(oldConfig, newConfig);

      const breaking = await compareChangelog(repo, tags.fromTag, tags.toTag);

      let platformNotes = [];
      const oldPkg = await rawAt(repo, tags.fromTag, 'package.json');
      const newPkgRaw = await rawAt(repo, tags.toTag, 'package.json');
      const oldPkgText = oldPkg.status === 'ok' ? oldPkg.text : null;
      const newPkgText = newPkgRaw.status === 'ok' ? newPkgRaw.text : null;
      if (oldPkgText && newPkgText) {
        try {
          const oldPkgJson = JSON.parse(oldPkgText);
          const newPkgJson = JSON.parse(newPkgText);
          if (JSON.stringify(oldPkgJson.files || []) !== JSON.stringify(newPkgJson.files || [])) {
            platformNotes.push(
              `package files: ${(oldPkgJson.files || []).join(',')} -> ${(newPkgJson.files || []).join(',')}`,
            );
          }
          if (oldPkgJson.description !== newPkgJson.description) {
            platformNotes.push(`description: ${newPkgJson.description}`);
          }
        } catch {
          /* ignore */
        }
      }

      const hasApiChange =
        methodDiff.added.length ||
        methodDiff.removed.length ||
        eventDiff.added.length ||
        eventDiff.removed.length ||
        configDiff.added.length ||
        configDiff.removed.length;

      return {
        repo,
        package: pkgName,
        ...tags,
        methods: { current: newMethods, ...methodDiff },
        events: { current: newEvents, ...eventDiff },
        config: { key: configKey, current: newConfig, ...configDiff },
        breakingNotes: breaking,
        platformNotes,
        hasApiChange:
          hasApiChange || breaking.length > 0 || platformNotes.length > 0,
        noDefinitions: newDef.status === 'missing' || !newText,
      };
    } catch (e) {
      return { repo, error: e.message };
    }
  });

  const failures = results.filter((r) => r.error);
  if (failures.length) {
    console.error('Diff failures:');
    for (const f of failures) console.error(`- ${f.repo}: ${f.error}`);
    process.exit(1);
  }

  await mkdir(path.dirname(OUT), { recursive: true });
  await writeFile(OUT, JSON.stringify(results, null, 2));
  const changed = results.filter((r) => r.hasApiChange).length;
  const skipped = results.filter((r) => r.skipped).length;
  console.log(`Repos: ${results.length}, API changes: ${changed}, skipped: ${skipped}`);
  console.log(`Wrote ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
