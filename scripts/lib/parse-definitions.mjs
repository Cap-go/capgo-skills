/**
 * Parse Capacitor plugin src/definitions.ts for API surface.
 */

const PLUGIN_IFACE_RE =
  /export interface (\w+Plugin)(?:\s+extends\s+[\w.]+)?\s*\{([\s\S]*?)^\}/gm;
const EXTENDS_PLUGIN_RE = /export interface (\w+)\s+extends\s+Plugin\s*\{([\s\S]*?)^\}/gm;
const EXTRA_PLUGIN_IFACE_RES = [
  /export interface NativeAudio\s*\{([\s\S]*?)^\}/m,
  /export interface StripePlugin\s+extends\s+StripeDefinitions\s*\{([\s\S]*?)^\}/m,
];

function collectPluginInterfaceBodies(definitionsText) {
  const bodies = [];
  for (const re of [PLUGIN_IFACE_RE, EXTENDS_PLUGIN_RE, ...EXTRA_PLUGIN_IFACE_RES]) {
    re.lastIndex = 0;
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

/** @returns {string[]} method names on *Plugin interfaces */
export function extractMethods(definitionsText) {
  if (!definitionsText) return [];
  const methods = [];
  for (const body of collectPluginInterfaceBodies(definitionsText)) {
    methods.push(...extractMethodsFromBlock(body));
  }
  return [...new Set(methods)].sort();
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
    `${pluginConfigName}\\??:\\s*\\{([\\s\S]*?)^\\s{4}\\}`,
    'm',
  );
  const m = definitionsText.match(blockRe);
  if (!m) {
    const alt = new RegExp(`${pluginConfigName}:\\s*\\{([\\s\S]*?)^\\s*\\};`, 'm');
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
