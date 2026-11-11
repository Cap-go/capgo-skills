/**
 * Diff src/definitions.ts between last tag before CUTOFF and latest tag per Cap-go capacitor-* repo.
 */
import { spawnSync } from 'node:child_process';
import { writeSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
  configKeyFromPackage,
  diffLists,
  extractConfigKeys,
  extractListenerEvents,
  extractMethodsFromSources,
  loadApiSources,
} from './lib/parse-definitions.mjs';

const CUTOFF = '2026-09-11T00:00:00Z';
const ORG = 'Cap-go';
const OUT = path.join(process.cwd(), 'scripts/.cache/capgo-api-diffs.json');

function ghApi(pathname, jq) {
  const args = ['api', pathname];
  if (jq) args.push('--jq', jq);
  const r = spawnSync('gh', args, {
    encoding: 'utf8',
    maxBuffer: 8 * 1024 * 1024,
    env: { ...process.env, GH_TOKEN: process.env.GITHUB_TOKEN || process.env.GH_TOKEN },
  });
  if (r.status !== 0) throw new Error(`${pathname}: ${r.stderr || r.stdout}`);
  return JSON.parse(r.stdout || 'null');
}

function ghJson(args) {
  const r = spawnSync('gh', args, { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 });
  if (r.status !== 0) throw new Error(r.stderr || r.stdout);
  return JSON.parse(r.stdout);
}

async function rawAt(repo, tag, filePath, pkgPath = '', retries = 4) {
  const rel = pkgPath ? `${pkgPath}/${filePath}` : filePath;
  const url = `https://raw.githubusercontent.com/${ORG}/${repo}/${encodeURIComponent(tag)}/${rel}`;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url);
      if (res.status === 404) return { status: 'missing', text: null };
      if (res.ok) return { status: 'ok', text: await res.text() };
      if ((res.status === 403 || res.status === 429 || res.status >= 500) && attempt < retries) {
        await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt));
        continue;
      }
      return { status: 'error', error: `HTTP ${res.status} for ${rel} at ${tag}` };
    } catch (e) {
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt));
        continue;
      }
      return { status: 'error', error: e.message || String(e) };
    }
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
  let releases;
  try {
    releases = ghApi(
      `repos/${ORG}/${repo}/releases?per_page=100`,
      '[.[] | {tag_name, published_at}]',
    );
  } catch (error) {
    if (/\b404\b/.test(String(error.message))) return null;
    throw error;
  }
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

function addedChangelogLines(oldText, newText) {
  const previous = new Set((oldText || '').split('\n'));
  return (newText || '')
    .split('\n')
    .filter((line) => !previous.has(line))
    .join('\n');
}

async function compareChangelog(repo, fromTag, toTag) {
  const names = ['CHANGELOG.md', 'CHANGELOG', 'changelog.md'];
  for (const name of names) {
    const oldC = await rawAt(repo, fromTag, name);
    const newC = await rawAt(repo, toTag, name);
    if (oldC.status === 'error' || newC.status === 'error') continue;
    if (oldC.status === 'missing' && newC.status === 'missing') continue;
    return [...new Set(parseChangelogBreaking(addedChangelogLines(oldC.text, newC.text)))];
  }
  return [];
}

async function discoverPkgName(repo, branch = 'main') {
  const fetched = await rawAt(repo, branch, 'package.json');
  if (fetched.status === 'ok' && fetched.text) {
    try {
      return JSON.parse(fetched.text).name || `@capgo/${repo}`;
    } catch {
      /* fall through */
    }
  }
  return `@capgo/${repo}`;
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
    'name,isArchived',
  ]).filter((r) => !r.isArchived && r.name.startsWith('capacitor-') && !/-ghsa-/i.test(r.name));

  const results = await mapPool(repos, 2, async (r, idx) => {
    const repo = r.name;
    try {
      writeSync(2, `diff ${idx + 1}/${repos.length} ${repo}\n`);
      const tags = await resolveTags(repo);
      if (!tags) return { repo, skipped: true, reason: 'no tags in window' };

      const pkgName = await discoverPkgName(repo);
      const configKey = configKeyFromPackage(pkgName);

      const loadAt = (tag) =>
        loadApiSources(async (file) => {
          const fetched = await rawAt(repo, tag, file);
          if (fetched.status === 'error') {
            throw new Error(`${file} at ${tag}: ${fetched.error}`);
          }
          return fetched.text;
        });

      let oldSources;
      let newSources;
      try {
        oldSources = await loadAt(tags.fromTag);
        newSources = await loadAt(tags.toTag);
      } catch (e) {
        return { repo, error: e.message };
      }
      const oldText = oldSources.join('\n');
      const newText = newSources.join('\n');

      const oldMethods = extractMethodsFromSources(oldSources);
      const newMethods = extractMethodsFromSources(newSources);
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
        noDefinitions: newSources.length === 0 || !newText,
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
  console.log(`heapUsedMB ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
