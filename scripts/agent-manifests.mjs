import { readFile } from 'node:fs/promises';
import path from 'node:path';

// Cursor, Codex, and Gemini manifests are generated from .claude-plugin/marketplace.json
// so every agent marketplace exposes the same plugins. Run `bun run sync-skills` after editing it.
export async function buildAgentManifests(root) {
  const marketplace = JSON.parse(await readFile(path.join(root, '.claude-plugin', 'marketplace.json'), 'utf8'));
  const pkg = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
  const files = {};
  const json = (value) => `${JSON.stringify(value, null, 2)}\n`;

  files['.cursor-plugin/marketplace.json'] = json({
    name: marketplace.name,
    owner: marketplace.owner,
    metadata: { description: marketplace.description, version: pkg.version },
    plugins: marketplace.plugins.map((plugin) => ({
      name: plugin.name,
      source: plugin.source,
      description: plugin.description,
    })),
  });

  files['.agents/plugins/marketplace.json'] = json({
    name: marketplace.name,
    interface: { displayName: 'Capgo Capacitor Skills' },
    plugins: marketplace.plugins.map((plugin) => ({
      name: plugin.name,
      source: { source: 'local', path: plugin.source },
      policy: { installation: 'AVAILABLE', authentication: 'ON_INSTALL' },
      category: 'Coding',
    })),
  });

  for (const plugin of marketplace.plugins) {
    const pluginDir = plugin.source.replace(/^\.\//, '');
    const common = {
      name: plugin.name,
      version: plugin.version,
      description: plugin.description,
      author: plugin.author,
      homepage: marketplace.homepage,
      repository: marketplace.repository,
      license: plugin.license,
      keywords: plugin.keywords,
    };
    files[`${pluginDir}/.cursor-plugin/plugin.json`] = json(common);
    files[`${pluginDir}/.codex-plugin/plugin.json`] = json({ ...common, skills: './skills/' });
  }

  files['gemini-extension.json'] = json({
    name: 'capgo-skills',
    version: pkg.version,
    description: `${pkg.description}: plugins, Capacitor 9 and Xcode 27 upgrades, UIScene, debugging, testing, security, live updates, and native builds.`,
  });

  return files;
}
