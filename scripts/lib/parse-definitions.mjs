/**
 * Parse Capacitor plugin src/definitions.ts for API surface.
 */

const PLUGIN_IFACE_RE = /export interface (\w+Plugin)\s*\{([\s\S]*?)^\}/gm;

/** @returns {string[]} method names on *Plugin interfaces */
export function extractMethods(definitionsText) {
  if (!definitionsText) return [];
  const methods = [];
  const re = /^\s{2,4}([a-zA-Z]\w*)\([\s\S]*?\):\s*Promise[\s\S]*?;\n/gm;
  let match;
  while ((match = re.exec(definitionsText)) !== null) {
    const name = match[1];
    if (name === 'addListener' || name === 'removeAllListeners') continue;
    methods.push(name);
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
  const mapRe = /^\s*'(\w+)':\s*/gm;
  const listenerBlock = definitionsText.match(/export interface \w+Plugin[\s\S]*$/);
  if (listenerBlock) {
    const segment = listenerBlock[0];
    const addIdx = segment.indexOf('addListener');
    if (addIdx > -1) {
      const tail = segment.slice(addIdx);
      while ((m = mapRe.exec(tail))) {
        if (m[1] !== 'addListener') events.add(m[1]);
      }
    }
  }
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

/** Guess PluginsConfig key from package name */
export function configKeyFromPackage(pkgName) {
  const slug = pkgName.replace(/^@capgo\/(capacitor-|cordova-)?/, '');
  const parts = slug.split('-').map((p) => p.charAt(0).toUpperCase() + p.slice(1));
  return parts.join('');
}

/** Interfaces and type aliases exported (for option types) */
export function extractExportedTypes(definitionsText) {
  if (!definitionsText) return [];
  const types = [];
  const re = /^export (?:interface|type) (\w+)/gm;
  let m;
  while ((m = re.exec(definitionsText))) types.push(m[1]);
  return types;
}

export function diffLists(before, after) {
  return {
    added: after.filter((x) => !before.includes(x)),
    removed: before.filter((x) => !after.includes(x)),
  };
}
