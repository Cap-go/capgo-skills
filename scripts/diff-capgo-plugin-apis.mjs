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
    return Buffer.from(data.content, 'base64').toString('utf8');
  } catch {
    return null;
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

function parseChangelogBreaking(text) {
  if (!text) return [];
  const lines = [];
  const lower = text.toLowerCase();
  if (/breaking|removed|deprecated|migration/i.test(text)) {
    for (const line of text.split('\n')) {
      if (/breaking|removed|deprecated|migration|BREAKING/i.test(line)) lines.push(line.trim());
    }
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
  ]).filter(
    (r) => !r.isArchived && r.name.startsWith('capacitor-') && r.latestRelease?.publishedAt >= CUTOFF,
  );

  const results = await mapPool(repos, 6, async (r) => {
    const repo = r.name;
    try {
      const tags = await resolveTags(repo);
      if (!tags) return { repo, skipped: true, reason: 'no tags in window' };

      const pkgName = await discoverPkgName(repo);
      const configKey = configKeyFromPackage(pkgName);

      const oldDef = await rawAt(repo, tags.fromTag, 'src/definitions.ts');
      const newDef = await rawAt(repo, tags.toTag, 'src/definitions.ts');

      const oldMethods = extractMethods(oldDef || '');
      const newMethods = extractMethods(newDef || '');
      const methodDiff = diffLists(oldMethods, newMethods);

      const oldEvents = extractListenerEvents(oldDef || '');
      const newEvents = extractListenerEvents(newDef || '');
      const eventDiff = diffLists(oldEvents, newEvents);

      const oldConfig = extractConfigKeys(oldDef || '', configKey);
      const newConfig = extractConfigKeys(newDef || '', configKey);
      const configDiff = diffLists(oldConfig, newConfig);

      const breaking = await compareChangelog(repo, tags.fromTag, tags.toTag);

      let platformNotes = [];
      const oldPkgText = await rawAt(repo, tags.fromTag, 'package.json');
      const newPkgText = await rawAt(repo, tags.toTag, 'package.json');
      if (oldPkgText && newPkgText) {
        try {
          const oldPkg = JSON.parse(oldPkgText);
          const newPkg = JSON.parse(newPkgText);
          if (JSON.stringify(oldPkg.files || []) !== JSON.stringify(newPkg.files || [])) {
            platformNotes.push(`package files: ${(oldPkg.files || []).join(',')} -> ${(newPkg.files || []).join(',')}`);
          }
          if (oldPkg.description !== newPkg.description) {
            platformNotes.push(`description: ${newPkg.description}`);
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
        noDefinitions: !newDef,
      };
    } catch (e) {
      return { repo, error: e.message };
    }
  });

  await mkdir(path.dirname(OUT), { recursive: true });
  await writeFile(OUT, JSON.stringify(results, null, 2));
  const changed = results.filter((r) => r.hasApiChange).length;
  const errors = results.filter((r) => r.error).length;
  console.log(`Repos: ${results.length}, API changes: ${changed}, errors: ${errors}`);
  console.log(`Wrote ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
