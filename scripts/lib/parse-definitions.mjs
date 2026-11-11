/**
 * Parse Capacitor plugin src/definitions.ts for API surface.
 */

const PLUGIN_IFACE_RE = /export interface (\w+Plugin)\s*\{([\s\S]*?)^\}/gm;

/** @returns {string[]} method names on *Plugin interfaces */
export function extractMethods(definitionsText) {
  if (!definitionsText) return [];
  const methods = [];
  const lines = definitionsText.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const head = lines[i].match(/^\s{2,4}([a-zA-Z]\w*)\(/);
    if (!head) continue;
    const name = head[1];
  const parts = [lines[i]];
  let j = i + 1;
  let foundPromise = false;
  while (j < lines.length) {
    const next = lines[j];
    if (/^\s{2,4}[a-zA-Z]\w*\(/.test(next)) break;
    if (/^}\s*$/.test(next.trim()) && foundPromise) break;
    parts.push(next);
    if (next.includes('): Promise') || next.includes('): Promise<')) foundPromise = true;
    if (foundPromise && /;\s*$/.test(next.trim())) break;
    j++;
  }
    const block = parts.join('\n');
    if (!/:\s*Promise/.test(block)) continue;
    if (name === 'addListener' || name === 'removeAllListeners') continue;
    methods.push(name);
    i = j;
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
  const keys = [];
  const re = /^\s{6,8}(\w+)\??:\s/gm;
  let m;
  while ((m = re.exec(block))) keys.push(m[1]);
  return [...new Set(keys)].sort();
}

export function diffLists(before, after) {
  return {
    added: after.filter((x) => !before.includes(x)),
    removed: before.filter((x) => !after.includes(x)),
  };
}

/** Guess PluginsConfig key from package name */
export function configKeyFromPackage(pkgName) {
  const slug = pkgName.replace(/^@capgo\/(capacitor-|cordova-)?/, '');
  const parts = slug.split('-').map((p) => p.charAt(0).toUpperCase() + p.slice(1));
  return parts.join('');
}
