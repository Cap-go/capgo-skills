/**
 * Parse Capacitor plugin src/definitions.ts for API surface.
 */

const PLUGIN_IFACE_RE =
  /export interface (\w+Plugin)(?:\s+extends\s+[\w.]+)?\s*\{([\s\S]*?)^\}/gm;
const EXTENDS_PLUGIN_RE = /export interface (\w+)\s+extends\s+Plugin\s*\{([\s\S]*?)^\}/gm;
const EXTRA_PLUGIN_IFACE_RES = [
  /export interface NativeAudio\s*\{([\s\S]*?)^\}/gm,
  /export interface StripePlugin\s+extends\s+StripeDefinitions\s*\{([\s\S]*?)^\}/gm,
];

function collectPluginInterfaceBodies(definitionsText) {
  const bodies = [];
  for (const re of [PLUGIN_IFACE_RE, EXTENDS_PLUGIN_RE, ...EXTRA_PLUGIN_IFACE_RES]) {
    re.lastIndex = 0;
    if (!re.global) {
      const match = re.exec(definitionsText);
      if (match) bodies.push(match[match.length - 1]);
      continue;
    }
    let match;
    while ((match = re.exec(definitionsText))) {
      bodies.push(match[match.length - 1]);
    }
  }
  return bodies;
}

function extractMethodsFromBlock(block) {
  const methods = [];
  const lines = block.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const head = lines[i].match(/^\s{2,4}([a-zA-Z]\w*)\??\(/);
    if (!head) continue;
    const name = head[1];
    const parts = [lines[i]];
    let j = i + 1;
    let foundPromise = false;
    while (j < lines.length) {
      const next = lines[j];
      if (/^\s{2,4}[a-zA-Z]\w*\??\(/.test(next)) break;
      if (/^}\s*$/.test(next.trim()) && foundPromise) break;
      parts.push(next);
      if (next.includes('): Promise') || next.includes('): Promise<')) foundPromise = true;
      if (foundPromise && /;\s*$/.test(next.trim())) break;
      j++;
    }
    const body = parts.join('\n');
    if (!/:\s*Promise/.test(body)) continue;
    if (name === 'addListener' || name === 'removeAllListeners') continue;
    methods.push(name);
    i = j - 1;
  }
  return methods;
}

const FALLBACK_IFACE_RE =
  /export interface (\w+Interface)(?:\s+extends\s+[\w.]+)?\s*\{([\s\S]*?)^\}/gm;

function collectFallbackInterfaceBodies(definitionsText) {
  const bodies = [];
  FALLBACK_IFACE_RE.lastIndex = 0;
  let match;
  while ((match = FALLBACK_IFACE_RE.exec(definitionsText))) {
    bodies.push(match[2]);
  }
  return bodies;
}

function extractPluginInterfaceMethods(definitionsText) {
  const methods = [];
  for (const body of collectPluginInterfaceBodies(definitionsText)) {
    methods.push(...extractMethodsFromBlock(body));
  }
  return methods;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function collectPluginParentTypes(text) {
  const names = new Set();
  const re = /export interface (\w+)\s+extends\s+([^{]+)\{/g;
  let match;
  while ((match = re.exec(text))) {
    const iface = match[1];
    if (!/Plugin$/.test(iface) && iface !== 'NativeAudio') continue;
    for (const part of match[2].split(',')) {
      const name = part.trim();
      if (name && name !== 'Plugin' && /^\w+$/.test(name)) names.add(name);
    }
  }
  return [...names];
}

function lookupTypeMethods(typeName, sources, seen = new Set()) {
  if (!typeName || typeName === 'Plugin' || seen.has(typeName)) return [];
  seen.add(typeName);
  const nameRe = escapeRegExp(typeName);
  const ifaceRe = new RegExp(
    `export interface ${nameRe}(?:\\s+extends\\s+([^{]+))?\\s*\\{([\\s\\S]*?)^\\}`,
    'm',
  );
  const aliasRe = new RegExp(`(?:export\\s+)?type ${nameRe}\\s*=\\s*([^;]+);`, 'm');
  for (const text of sources) {
    if (!text) continue;
    const iface = ifaceRe.exec(text);
    if (iface) {
      const methods = [];
      if (iface[1]) {
        for (const part of iface[1].split(',')) {
          const parentName = part.trim();
          if (/^\w+$/.test(parentName)) {
            methods.push(...lookupTypeMethods(parentName, sources, seen));
          }
        }
      }
      methods.push(...extractMethodsFromBlock(iface[2]));
      return methods;
    }
    const alias = aliasRe.exec(text);
    if (alias) {
      const methods = [];
      for (const part of alias[1].split('&')) {
        const partName = part.trim();
        if (/^\w+$/.test(partName)) {
          methods.push(...lookupTypeMethods(partName, sources, seen));
        }
      }
      return methods;
    }
  }
  return [];
}

function extractRelativeModuleSpecs(text) {
  const specs = new Set();
  const re = /\bfrom\s+['"](\.[^'"]+)['"]/g;
  let match;
  while ((match = re.exec(text))) specs.add(match[1]);
  return [...specs];
}

function resolveTsImportCandidates(importerPath, spec) {
  if (!spec.startsWith('.')) return [];
  const parts = importerPath.split('/');
  parts.pop();
  for (const seg of spec.split('/')) {
    if (seg === '.' || seg === '') continue;
    if (seg === '..') {
      if (parts.length) parts.pop();
      continue;
    }
    parts.push(seg);
  }
  const base = parts.join('/');
  if (base.endsWith('.ts') || base.endsWith('.tsx')) return [base];
  return [`${base}.ts`, `${base}.tsx`, `${base}/index.ts`];
}

/** Source files that may declare the plugin API when definitions.ts does not. */
export const API_SOURCE_FILES = [
  'src/definitions.ts',
  'src/implementation.ts',
  'src/plugin.ts',
  'src/map.ts',
  'src/index.ts',
];

/**
 * @returns {string[]} method names on *Plugin interfaces, or *Interface as a fallback
 */
export function extractMethods(definitionsText) {
  if (!definitionsText) return [];
  return extractMethodsFromSources([definitionsText]);
}

/** Prefer *Plugin methods across all sources before falling back to *Interface. */
export function extractMethodsFromSources(sources) {
  const list = (sources || []).filter(Boolean);
  const pluginMethods = [];
  for (const text of list) {
    pluginMethods.push(...extractPluginInterfaceMethods(text));
    for (const parent of collectPluginParentTypes(text)) {
      pluginMethods.push(...lookupTypeMethods(parent, list));
    }
  }
  if (pluginMethods.length) return [...new Set(pluginMethods)].sort();
  const fallback = [];
  for (const text of list) {
    for (const body of collectFallbackInterfaceBodies(text)) {
      fallback.push(...extractMethodsFromBlock(body));
    }
  }
  return [...new Set(fallback)].sort();
}

/**
 * Load TypeScript API sources, following relative imports and stopping once methods are found.
 * @param {(relPath: string) => Promise<string|null>} fetchText
 */
export async function loadApiSources(fetchText) {
  const sources = [];
  const seen = new Set();

  async function loadFile(file) {
    if (seen.has(file)) return null;
    seen.add(file);
    const text = await fetchText(file);
    if (!text) return null;
    sources.push(text);
    for (const spec of extractRelativeModuleSpecs(text)) {
      for (const candidate of resolveTsImportCandidates(file, spec)) {
        if (await loadFile(candidate)) break;
      }
    }
    return text;
  }

  for (const file of API_SOURCE_FILES) {
    await loadFile(file);
    if (extractMethodsFromSources(sources).length > 0) return sources;
  }
  return sources;
}

/** @returns {string[]} addListener event names */
export function extractListenerEvents(definitionsText) {
  if (!definitionsText) return [];
  const events = new Set();
  const overloadRe = /addListener\s*\(\s*eventName:\s*'([^']+)'/g;
  let m;
  while ((m = overloadRe.exec(definitionsText))) events.add(m[1]);
  return [...events].sort();
}

/** Config keys under PluginsConfig for a plugin key like CapacitorUpdater */
export function extractConfigKeys(definitionsText, pluginConfigName) {
  if (!definitionsText || !pluginConfigName) return [];
  const blockRe = new RegExp(
    `${pluginConfigName}\\??:\\s*\\{([\\s\\S]*?)^\\s{4}\\}`,
    'm',
  );
  const m = definitionsText.match(blockRe);
  if (!m) {
    const alt = new RegExp(`${pluginConfigName}:\\s*\\{([\\s\\S]*?)^\\s*\\};`, 'm');
    const m2 = definitionsText.match(alt);
    if (!m2) return [];
    return extractPropsFromBlock(m2[1]);
  }
  return extractPropsFromBlock(m[1]);
}

function extractPropsFromBlock(block) {
  const lines = block.split('\n');
  let minIndent = Infinity;
  for (const line of lines) {
    const m = line.match(/^(\s+)(\w+)\??:\s/);
    if (m) minIndent = Math.min(minIndent, m[1].length);
  }
  if (!Number.isFinite(minIndent)) return [];
  const keys = [];
  const re = new RegExp(`^\\s{${minIndent}}(\\w+)\\??:\\s`);
  for (const line of lines) {
    const m = line.match(re);
    if (m) keys.push(m[1]);
  }
  return [...new Set(keys)].sort();
}

export function diffLists(before, after) {
  return {
    added: after.filter((x) => !before.includes(x)),
    removed: before.filter((x) => !after.includes(x)),
  };
}

const CONFIG_KEY_OVERRIDES = {
  '@capgo/capacitor-updater': 'CapacitorUpdater',
};

/** Guess PluginsConfig key from package name */
export function configKeyFromPackage(pkgName) {
  if (CONFIG_KEY_OVERRIDES[pkgName]) return CONFIG_KEY_OVERRIDES[pkgName];
  const slug = pkgName.replace(/^@capgo\/(capacitor-|cordova-)?/, '');
  const parts = slug.split('-').map((p) => p.charAt(0).toUpperCase() + p.slice(1));
  return parts.join('');
}
