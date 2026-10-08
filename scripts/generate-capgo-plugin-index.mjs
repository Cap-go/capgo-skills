import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const ORG = 'Cap-go';
const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, 'skills/capacitor-plugins/references');
const INDEX_PATH = path.join(OUT_DIR, 'capgo-plugin-index.md');
const CATALOG_PATH = path.join(OUT_DIR, 'capgo-plugin-catalog.md');
const MIRROR_DIR = path.join(ROOT, 'plugins/capacitor-core/skills/capacitor-plugins/references');

const REPO_FILTER = /^(capacitor-|cordova-updater)/;

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

async function rawText(repo, filePath, branch) {
  const url = `https://raw.githubusercontent.com/${ORG}/${repo}/${branch}/${filePath}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  return res.text();
}

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

async function listMonorepoPackages(repo, branch) {
  const contents = await gh(`/repos/${ORG}/${repo}/contents/packages?ref=${branch}`).catch(() => null);
  if (!Array.isArray(contents)) return [];
  const out = [];
  for (const entry of contents) {
    if (entry.type !== 'dir') continue;
    const pkg = await fetchPackageJson(repo, `packages/${entry.name}`, branch);
    if (pkg?.name?.startsWith('@capgo/')) {
      out.push({ repo, pkgPath: `packages/${entry.name}`, pkg });
    }
  }
  return out;
}

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

function titleFromPackage(name) {
  if (name === '@capgo/cordova-updater') return 'Cordova Updater';
  const base = name.replace(/^@capgo\//, '').replace(/^capacitor-/, '').replace(/^cordova-/, '');
  return base
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function extractMethods(definitionsText) {
  if (!definitionsText) return [];
  const methods = [];
  const re = /^\s{2}([a-zA-Z]\w*)\([^;]*\):\s*Promise<[^;]+>;/gm;
  let match;
  while ((match = re.exec(definitionsText)) !== null) {
    const name = match[1];
    if (name === 'addListener' || name === 'removeAllListeners') continue;
    methods.push(name);
  }
  const unique = [...new Set(methods)];
  return unique.slice(0, 12);
}

async function detectPlatforms(repo, pkgPath, branch, pkg) {
  const files = pkg.files || [];
  const hasIos = files.some((f) => f.startsWith('ios/'));
  const hasAndroid = files.some((f) => f.startsWith('android/') || f.startsWith('src/android/'));
  const relBase = pkgPath ? `${pkgPath}/` : '';
  const webPath = `${relBase}src/web.ts`;
  let hasWeb = await rawText(repo, webPath, branch);
  if (!hasWeb) hasWeb = await rawText(repo, `${relBase}src/web.tsx`, branch);

  const platforms = [];
  if (hasIos) platforms.push('iOS');
  if (hasAndroid) platforms.push('Android');
  if (hasWeb) platforms.push('Web');
  if (platforms.length === 0) {
    if (hasIos || hasAndroid) return platforms.length ? platforms : ['iOS', 'Android'];
  }
  return platforms.length ? platforms : ['iOS', 'Android'];
}

function docsUrl(pkg, repo) {
  if (pkg.homepage && pkg.homepage.startsWith('http')) return pkg.homepage;
  const slug = repo.replace(/^capacitor-/, '').replace(/^cordova-/, '');
  return `https://capgo.app/docs/plugins/${slug}/`;
}

function sanitize(text) {
  return (text || '')
    .replace(/\u2013|\u2014/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

function formatCatalogRow(entry) {
  const { title, pkg, repo } = entry;
  const desc = sanitize(pkg.description || '');
  const source = `https://github.com/${ORG}/${repo}`;
  return `| ${title} | \`${pkg.name}\` | ${desc} | [source](${source}) |`;
}

function formatIndexEntry(entry) {
  const { title, pkg, repo, platforms, methods, branch } = entry;
  const desc = sanitize(pkg.description || 'Capacitor plugin from Capgo.');
  const docs = docsUrl(pkg, repo);
  const source = `https://github.com/${ORG}/${repo}`;
  const platformStr = platforms.join(', ') || 'See repository';
  const methodStr = methods.length ? methods.map((m) => `\`${m}()\``).join(', ') : 'See `src/definitions.ts` in the repository';
  const installPath = entry.pkgPath ? `${repo} (${entry.pkgPath})` : repo;

  return `### ${title}

- **Package**: \`${pkg.name}\`
- **Purpose**: ${desc}
- **Install**:

\`\`\`bash
npm install ${pkg.name}
npx cap sync
\`\`\`

- **Platforms**: ${platformStr}
- **Key API methods**: ${methodStr}
- **Docs**: ${docs}
- **Repository**: ${source}${entry.pkgPath ? ` (package path: \`${entry.pkgPath}\`, branch \`${branch}\`)` : ''}
`;
}

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

async function main() {
  const repos = await ghPaginate(`/orgs/${ORG}/repos`);
  const pluginRepos = repos
    .filter((r) => !r.archived && REPO_FILTER.test(r.name))
    .map((r) => ({ name: r.name, branch: r.default_branch || 'main' }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const allPackages = [];
  await mapPool(pluginRepos, 4, async ({ name: repo, branch }) => {
    try {
      const packages = await discoverPackages(repo, branch);
      for (const p of packages) allPackages.push(p);
    } catch (error) {
      console.warn(`Skip ${repo}: ${error.message}`);
    }
  });

  allPackages.sort((a, b) => a.pkg.name.localeCompare(b.pkg.name));

  const enriched = await mapPool(allPackages, 10, async (item) => {
    const relBase = item.pkgPath ? `${item.pkgPath}/` : '';
    const definitions = await rawText(item.repo, `${relBase}src/definitions.ts`, item.branch);
    const methods = extractMethods(definitions);
    const platforms = await detectPlatforms(item.repo, item.pkgPath, item.branch, item.pkg);
    return {
      ...item,
      title: titleFromPackage(item.pkg.name),
      methods,
      platforms,
    };
  });

  const generatedAt = new Date().toISOString().slice(0, 10);

  const catalogHeader = `# Capgo Plugin Catalog

Complete catalog of canonical Capgo Capacitor plugin packages from the [Cap-go](https://github.com/Cap-go) GitHub organization and [capgo.app/plugins](https://capgo.app/plugins/). Excludes archived repositories, example apps, templates, and worktrees.

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

Agent-facing index of every public Capgo Capacitor plugin package in the Cap-go GitHub organization (non-archived \`capacitor-*\` repositories and \`cordova-updater\`), cross-checked with [capgo.app/plugins](https://capgo.app/plugins/).

Facts come from each repository \`package.json\` and \`src/definitions.ts\`. API method names are taken from TypeScript definitions only.

Total packages: ${enriched.length} (generated ${generatedAt})

`;

  const indexBody = enriched.map(formatIndexEntry).join('\n');
  const index = `${indexHeader}${indexBody}`;

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(CATALOG_PATH, catalog);
  await writeFile(INDEX_PATH, index);
  await mkdir(MIRROR_DIR, { recursive: true });
  await writeFile(path.join(MIRROR_DIR, 'capgo-plugin-catalog.md'), catalog);
  await writeFile(path.join(MIRROR_DIR, 'capgo-plugin-index.md'), index);

  console.log(`Wrote ${enriched.length} plugins to ${INDEX_PATH}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
