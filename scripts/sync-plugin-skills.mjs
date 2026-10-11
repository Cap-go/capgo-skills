import { cp, readdir, rm } from 'node:fs/promises';
import path from 'node:path';

// Plugin skill folders are byte-for-byte copies of the canonical skills/ folders.
// To add a skill to a plugin, create an empty plugins/<plugin>/skills/<skill>/ folder and run this script.
const root = process.cwd();
const skillsDir = path.join(root, 'skills');
const pluginsDir = path.join(root, 'plugins');

const canonical = new Set(
  (await readdir(skillsDir, { withFileTypes: true })).filter((entry) => entry.isDirectory()).map((entry) => entry.name),
);

let synced = 0;
const missing = [];
for (const plugin of await readdir(pluginsDir, { withFileTypes: true })) {
  if (!plugin.isDirectory()) continue;
  const pluginSkillsDir = path.join(pluginsDir, plugin.name, 'skills');
  const entries = await readdir(pluginSkillsDir, { withFileTypes: true }).catch(() => []);
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (!canonical.has(entry.name)) {
      missing.push(`${plugin.name}/${entry.name}`);
      continue;
    }
    const target = path.join(pluginSkillsDir, entry.name);
    await rm(target, { recursive: true, force: true });
    await cp(path.join(skillsDir, entry.name), target, { recursive: true });
    synced += 1;
  }
}

if (missing.length > 0) {
  console.error(`No canonical skill for: ${missing.join(', ')}`);
  process.exit(1);
}

console.log(`Synced ${synced} plugin skill copies from skills/.`);
