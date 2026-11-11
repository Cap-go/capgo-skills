/**
 * Build Capgo plugin catalog and index Markdown from Cap-go GitHub repositories.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import {
  configKeyFromPackage,
  extractConfigKeys,
  extractListenerEvents,
  extractMethodsFromSources,
  loadApiSources,
} from './lib/parse-definitions.mjs';

const ORG = 'Cap-go';
const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, 'skills/capacitor-plugins/references');
const INDEX_PATH = path.join(OUT_DIR, 'capgo-plugin-index.md');
const CATALOG_PATH = path.join(OUT_DIR, 'capgo-plugin-catalog.md');
const MIRROR_DIR = path.join(ROOT, 'plugins/capacitor-core/skills/capacitor-plugins/references');

const REPO_FILTER = /^(capacitor-|cordova-updater)/;

/** Call the GitHub REST API with optional retries on rate limits. */
async function gh(pathname, retries = 4) {
  const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'capgo-skills-generator' };
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await fetch(`https://api.github.com${pathname}`, { headers });
    if (res.ok) return res.json();
    if ((res.status === 403 || res.status === 429) && attempt < retries) {
      await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt));
      continue;
    }
    throw new Error(`GitHub ${pathname}: ${res.status}`);
  }
}

/** Paginate a GitHub list endpoint until all pages are fetched. */
async function ghPaginate(pathname) {
  const items = [];
  let page = 1;
  while (true) {
    const sep = pathname.includes('?') ? '&' : '?';
    const batch = await gh(`${pathname}${sep}per_page=100&page=${page}`);
    if (!Array.isArray(batch) || batch.length === 0) break;
    items.push(...batch);
    if (batch.length < 100) break;
    page += 1;
  }
  return items;
}

/** Fetch a raw file from a repository branch, or null when missing. */
async function rawText(repo, filePath, branch, retries = 4) {
  const url = `https://raw.githubusercontent.com/${ORG}/${repo}/${branch}/${filePath}`;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await fetch(url);
    if (res.ok) return res.text();
    if (res.status === 404) return null;
    if ((res.status === 403 || res.status === 429 || res.status >= 500) && attempt < retries) {
      await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt));
      continue;
    }
    return null;
  }
  return null;
}

/** Return whether a raw file exists on a repository branch. */
async function rawExists(repo, filePath, branch) {
  const url = `https://raw.githubusercontent.com/${ORG}/${repo}/${branch}/${filePath}`;
  const res = await fetch(url, { method: 'HEAD' });
  return res.ok;
}

/** Load and parse package.json from a repository path. */
async function fetchPackageJson(repo, pkgPath, branch) {
  const rel = pkgPath ? `${pkgPath}/package.json` : 'package.json';
  let text = await rawText(repo, rel, branch);
  if (!text && branch !== 'master') text = await rawText(repo, rel, 'master');
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/** List publishable @capgo packages under packages/ in a monorepo. */
async function listMonorepoPackages(repo, branch) {
  let contents;
  try {
    contents = await gh(`/repos/${ORG}/${repo}/contents/packages?ref=${branch}`);
  } catch (error) {
    const msg = String(error.message);
    if (msg.includes(': 404')) return [];
    throw error;
  }
  if (!Array.isArray(contents)) return [];
  const out = [];
  for (const entry of contents) {
    if (entry.type !== 'dir') continue;
    const pkg = await fetchPackageJson(repo, `packages/${entry.name}`, branch);
    if (pkg?.name?.startsWith('@capgo/') && !pkg.private) {
      out.push({ repo, pkgPath: `packages/${entry.name}`, pkg });
    }
  }
  return out;
}

/** Discover Capgo plugin packages exported by one GitHub repository. */
async function discoverPackages(repo, branch) {
  const rootPkg = await fetchPackageJson(repo, '', branch);
  const monorepo = await listMonorepoPackages(repo, branch);
  if (monorepo.length > 0) {
    return monorepo.map((item) => ({ ...item, branch }));
  }
  if (rootPkg?.name?.startsWith('@capgo/') && !rootPkg.private) {
    return [{ repo, pkgPath: '', pkg: rootPkg, branch }];
  }
  return [];
}

/** Build a human-readable plugin title from an npm package name. */
function titleFromPackage(name) {
  if (name === '@capgo/cordova-updater') return 'Cordova Updater';
  const base = name.replace(/^@capgo\//, '').replace(/^capacitor-/, '').replace(/^cordova-/, '');
  return base
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

const DIFF_CACHE = path.join(ROOT, 'scripts/.cache/capgo-api-diffs.json');

/** @param {Map<string, object>} diffByRepo */
function formatApiChangeBlock(repo, diffByRepo) {
  const diff = diffByRepo.get(repo);
  if (!diff?.fromTag || !diff?.toTag) return '';
  const lines = [`- **Versions reviewed**: \`${diff.fromTag}\` to \`${diff.toTag}\``];
  const { methods, events, config, breakingNotes, platformNotes } = diff;
  if (methods.added.length) {
    lines.push(`- **Methods added**: ${methods.added.map((m) => `\`${m}()\``).join(', ')}`);
  }
  if (methods.removed.length) {
    lines.push(`- **Methods removed**: ${methods.removed.map((m) => `\`${m}()\``).join(', ')}`);
  }
  if (events.added.length) {
    lines.push(`- **Events added**: ${events.added.map((e) => `\`${e}\``).join(', ')}`);
  }
  if (events.removed.length) {
    lines.push(`- **Events removed**: ${events.removed.map((e) => `\`${e}\``).join(', ')}`);
  }
  if (config.added.length) {
    lines.push(`- **Config keys added** (\`${config.key}\`): ${config.added.map((k) => `\`${k}\``).join(', ')}`);
  }
  if (config.removed.length) {
    lines.push(`- **Config keys removed**: ${config.removed.map((k) => `\`${k}\``).join(', ')}`);
  }
  if (platformNotes?.length) {
    lines.push(`- **Platform or packaging**: ${sanitize(platformNotes.join(' '))}`);
  }
  if (breakingNotes?.length) {
    lines.push(`- **Changelog notes**: ${sanitize(breakingNotes.slice(0, 6).join(' '))}`);
  }
  if (
    lines.length === 1 &&
    !methods.added.length &&
    !methods.removed.length &&
    !events.added.length &&
    !events.removed.length &&
    !config.added.length &&
    !config.removed.length
  ) {
    lines.push(`- **API delta in window**: none in \`definitions.ts\` between these tags`);
  }
  return `\n${lines.join('\n')}\n`;
}

/** Infer supported platforms from a package description when explicit. */
function platformsFromDescription(description) {
  const desc = description || '';
  if (/\(android only\)|android-only|android only/i.test(desc)) return ['Android'];
  if (/\(ios only\)|ios-only|ios only/i.test(desc)) return ['iOS'];
  return null;
}

/** Return true when the web implementation is more than a stub. */
async function hasFunctionalWeb(repo, pkgPath, branch) {
  const relBase = pkgPath ? `${pkgPath}/` : '';
  const text =
    (await rawText(repo, `${relBase}src/web.ts`, branch)) ||
    (await rawText(repo, `${relBase}src/web.tsx`, branch));
  if (!text) return false;
  if (/isSupported:\s*false/.test(text) && !/isSupported:\s*true/.test(text)) return false;
  const stubMarkers = text.match(/\.unavailable\(|\.unimplemented\(|not available on web/gi) || [];
  if (stubMarkers.length >= 2 && !/isSupported\(\)[\s\S]{0,120}true/.test(text)) return false;
  const asyncNames = [...text.matchAll(/async\s+(\w+)\s*\(/g)].map((m) => m[1]);
  if (asyncNames.length > 0) {
    let stubMethods = 0;
    for (const name of asyncNames) {
      const bodyRe = new RegExp(`async\\s+${name}\\s*\\([^)]*\\)[^{]*\\{([\\s\\S]*?)\\n\\s*\\}`);
      const body = bodyRe.exec(text)?.[1] ?? '';
      if (/unavailable\(|unimplemented\(/.test(body)) stubMethods++;
    }
    if (stubMethods === asyncNames.length) return false;
  }
  return true;
}

/** Detect iOS, Android, and Web support for a plugin package. */
async function detectPlatforms(repo, pkgPath, branch, pkg) {
  const fromDescription = platformsFromDescription(pkg.description);
  if (fromDescription) return fromDescription;

  const files = pkg.files || [];
  const relBase = pkgPath ? `${pkgPath}/` : '';
  let hasIos = files.some((f) => f.startsWith('ios/'));
  let hasAndroid = files.some((f) => f.startsWith('android/') || f.startsWith('src/android/'));
  if (!hasIos) {
    hasIos =
      (await rawExists(repo, `${relBase}Package.swift`, branch)) ||
      (await rawExists(repo, `${relBase}ios/Sources`, branch));
  }
  if (!hasAndroid) {
    hasAndroid =
      (await rawExists(repo, `${relBase}android/build.gradle`, branch)) ||
      (await rawExists(repo, `${relBase}src/android`, branch));
  }
  const hasWeb = await hasFunctionalWeb(repo, pkgPath, branch);

  const platforms = [];
  if (hasIos) platforms.push('iOS');
  if (hasAndroid) platforms.push('Android');
  if (hasWeb) platforms.push('Web');
  return platforms;
}

/** Prefer the repository whose name best matches the npm package slug. */
function repoPreferenceScore(item) {
  const pkgSlug = item.pkg.name.replace(/^@capgo\/(capacitor-|cordova-)?/, '');
  const repoSlug = item.repo.replace(/^capacitor-/, '').replace(/^cordova-/, '');
  if (repoSlug === pkgSlug) return 100;
  if (item.repo.includes(pkgSlug)) return 50;
  return 0;
}

/** Deduplicate packages that share the same npm name across repositories. */
function dedupePackages(packages) {
  const byName = new Map();
  for (const item of packages) {
    const existing = byName.get(item.pkg.name);
    if (!existing) {
      byName.set(item.pkg.name, item);
      continue;
    }
    const keep = repoPreferenceScore(item) > repoPreferenceScore(existing) ? item : existing;
    byName.set(item.pkg.name, keep);
  }
  return [...byName.values()];
}

/** Resolve the Capgo documentation URL for a plugin package. */
function docsUrl(pkg) {
  const slug = pkg.name.replace(/^@capgo\/(capacitor-|cordova-)?/, '');
  const docsFromPackage = `https://capgo.app/docs/plugins/${slug}/`;
  const homepage = pkg.homepage?.startsWith('http') ? pkg.homepage.replace(/\/$/, '') : '';
  if (homepage?.includes('/docs/plugins/')) {
    return homepage.endsWith('/') ? homepage : `${homepage}/`;
  }
  return docsFromPackage;
}

/** Normalize whitespace and replace dash characters in free text. */
function sanitize(text) {
  return (text || '')
    .replace(/\u2013|\u2014/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Escape pipe characters for markdown table cells. */
function escapeTableCell(value) {
  return sanitize(value).replace(/\|/g, ',');
}

/** Format one compact catalog table row. */
function formatCatalogRow(entry) {
  const { title, pkg, repo } = entry;
  const desc = escapeTableCell(pkg.description || '');
  const safeTitle = escapeTableCell(title);
  const source = `https://github.com/${ORG}/${repo}`;
  return `| ${safeTitle} | \`${pkg.name}\` | ${desc} | [source](${source}) |`;
}

/** Format one detailed plugin index section. */
function formatIndexEntry(entry, diffByRepo) {
  const { title, pkg, repo, platforms, methods, events, configKeys, branch } = entry;
  const desc = sanitize(pkg.description || 'Capacitor plugin from Capgo.');
  const docs = docsUrl(pkg);
  const source = `https://github.com/${ORG}/${repo}`;
  const platformStr = platforms.length ? platforms.join(', ') : 'See repository';
  const methodStr = methods.length ? methods.map((m) => `\`${m}()\``).join(', ') : 'See `src/definitions.ts` in the repository';
  const eventStr = events.length ? events.map((e) => `\`${e}\``).join(', ') : 'none';
  const configStr = configKeys.length
    ? configKeys.map((k) => `\`${k}\``).join(', ')
    : 'none in `definitions.ts`';
  const installPath = entry.pkgPath ? `${repo} (${entry.pkgPath})` : repo;
  const changeBlock = formatApiChangeBlock(repo, diffByRepo);

  return `## ${title}

- **Package**: \`${pkg.name}\`
- **Purpose**: ${desc}
- **Install**:

\`\`\`bash
npm install ${pkg.name}
npx cap sync
\`\`\`

- **Platforms**: ${platformStr}
- **API methods**: ${methodStr}
- **Events**: ${eventStr}
- **Plugin config keys** (\`${entry.configKey}\`): ${configStr}
${changeBlock}- **Docs**: ${docs}
- **Repository**: ${source}${entry.pkgPath ? ` (package path: \`${entry.pkgPath}\`, branch \`${branch}\`)` : ''}
`;
}

/** Run an async mapper over items with bounded concurrency. */
async function mapPool(items, concurrency, fn) {
  const results = [];
  let index = 0;
  async function worker() {
    while (index < items.length) {
      const i = index++;
      results[i] = await fn(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: concurrency }, () => worker()));
  return results;
}

/** Default git branch for a repository when org discovery is unavailable. */
async function resolveDefaultBranch(repo) {
  try {
    const data = await gh(`/repos/${ORG}/${repo}`);
    return data.default_branch || 'main';
  } catch {
    if (await rawText(repo, 'package.json', 'master')) return 'master';
    return 'main';
  }
}

/** Repository names from an existing catalog or index when the org list API is unavailable. */
async function reposFromExistingIndex() {
  let text;
  try {
    text = await readFile(CATALOG_PATH, 'utf8');
  } catch {
    text = await readFile(INDEX_PATH, 'utf8');
  }
  const names = [
    ...text.matchAll(new RegExp(`github\\.com/${ORG}/(capacitor-[^)\\s|]+|cordova-updater)`, 'g')),
  ].map((m) => m[1]);
  const unique = [...new Set(names)]
    .filter((name) => REPO_FILTER.test(name))
    .sort((a, b) => a.localeCompare(b));
  return mapPool(unique, 8, async (name) => ({
    name,
    branch: await resolveDefaultBranch(name),
  }));
}

/** List Cap-go plugin repositories via the org API, or from the checked-in catalog on rate limits. */
async function discoverPluginRepos() {
  try {
    const repos = await ghPaginate(`/orgs/${ORG}/repos`);
    return repos
      .filter((r) => !r.archived && REPO_FILTER.test(r.name) && !/-ghsa-/i.test(r.name))
      .map((r) => ({ name: r.name, branch: r.default_branch || 'main' }))
      .sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    if (!String(error.message).includes(': 403')) throw error;
    console.warn('GitHub org list rate limited; using repository URLs from the existing catalog.');
    return reposFromExistingIndex();
  }
}

/** Generate catalog and index files, exiting non-zero on discovery errors. */
async function main() {
  const discoveryErrors = [];
  const pluginRepos = await discoverPluginRepos();

  const allPackages = [];
  await mapPool(pluginRepos, 4, async ({ name: repo, branch }) => {
    try {
      const packages = await discoverPackages(repo, branch);
      for (const p of packages) allPackages.push(p);
    } catch (error) {
      discoveryErrors.push(`${repo}: ${error.message}`);
    }
  });

  if (discoveryErrors.length > 0) {
    console.error('Plugin discovery failed:');
    for (const message of discoveryErrors) console.error(`- ${message}`);
    process.exit(1);
  }

  const uniquePackages = dedupePackages(allPackages).sort((a, b) => a.pkg.name.localeCompare(b.pkg.name));

  let diffByRepo = new Map();
  try {
    const diffs = JSON.parse(await readFile(DIFF_CACHE, 'utf8'));
    diffByRepo = new Map(diffs.filter((d) => d.repo).map((d) => [d.repo, d]));
  } catch {
    console.warn('No API diff cache at', DIFF_CACHE, '(run node scripts/diff-capgo-plugin-apis.mjs first).');
  }

  const enriched = await mapPool(uniquePackages, 4, async (item) => {
    const relBase = item.pkgPath ? `${item.pkgPath}/` : '';
    const sources = await loadApiSources((file) => rawText(item.repo, `${relBase}${file}`, item.branch));
    const definitions = sources.join('\n');
    const methods = extractMethodsFromSources(sources);
    const events = extractListenerEvents(definitions);
    const configKey = configKeyFromPackage(item.pkg.name);
    const configKeys = extractConfigKeys(definitions, configKey);
    const platforms = await detectPlatforms(item.repo, item.pkgPath, item.branch, item.pkg);
    return {
      ...item,
      title: titleFromPackage(item.pkg.name),
      methods,
      events,
      configKeys,
      configKey,
      platforms,
    };
  });

  const generatedAt = new Date().toISOString().slice(0, 10);

  const catalogHeader = `# Capgo Plugin Catalog

Complete catalog of canonical Capgo Capacitor plugin packages from the [Cap-go](https://github.com/Cap-go) GitHub organization and [capgo.app/plugins](https://capgo.app/plugins/). Excludes archived repositories.

For install commands, platforms, key API methods, and documentation links, use \`capgo-plugin-index.md\` in this folder.

\`\`\`bash
npm install <exact-package-name>
npx cap sync
\`\`\`

Total packages: ${enriched.length} (generated ${generatedAt})

| Plugin | Package | Description | Source |
|--------|---------|-------------|--------|
`;

  const catalogBody = enriched.map(formatCatalogRow).join('\n');
  const catalog = `${catalogHeader}${catalogBody}\n`;

  const indexHeader = `# Capgo Plugin Index

Agent-facing index of every public Capgo Capacitor plugin package in the Cap-go GitHub organization (non-archived \`capacitor-*\` repositories and \`cordova-updater\`). The set should match the public [capgo.app/plugins](https://capgo.app/plugins/) catalog; regenerate after org changes.

Facts come from each repository \`package.json\` and TypeScript API sources (primarily \`src/definitions.ts\`). API method names are taken from exported plugin interfaces in those sources.

Total packages: ${enriched.length} (generated ${generatedAt})

## Plugins

`;

  const indexBody = enriched.map((e) => formatIndexEntry(e, diffByRepo)).join('\n');
  const index = `${indexHeader}${indexBody}`;

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(CATALOG_PATH, catalog);
  await writeFile(INDEX_PATH, index);
  await mkdir(MIRROR_DIR, { recursive: true });
  await writeFile(path.join(MIRROR_DIR, 'capgo-plugin-catalog.md'), catalog);
  await writeFile(path.join(MIRROR_DIR, 'capgo-plugin-index.md'), index);

  console.log(`Wrote ${enriched.length} plugins to ${INDEX_PATH}`);
  console.log(`heapUsedMB ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
