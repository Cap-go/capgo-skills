import { lstat, readFile, readdir, realpath } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const root = process.cwd();
const skillsDir = path.join(root, 'skills');

function parseFrontmatter(text) {
  const match = text.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;

  const frontmatter = {};
  for (const line of match[1].split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const colon = trimmed.indexOf(':');
    if (colon === -1) continue;
    const key = trimmed.slice(0, colon).trim();
    const value = trimmed.slice(colon + 1).trim().replace(/^["']|["']$/g, '');
    frontmatter[key] = value;
  }

  return frontmatter;
}

async function pathExists(filePath) {
  try {
    await lstat(filePath);
    return true;
  } catch {
    return false;
  }
}

function pathIsInside(parent, child) {
  const relativePath = path.relative(parent, child);
  return relativePath === '' || (!relativePath.startsWith('..') && !path.isAbsolute(relativePath));
}

function valuesMatch(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

async function validateClaudeMarketplace(skillDirs, errors) {
  const marketplacePath = path.join(root, '.claude-plugin', 'marketplace.json');
  if (!(await pathExists(marketplacePath))) return;

  let marketplace;
  try {
    marketplace = JSON.parse(await readFile(marketplacePath, 'utf8'));
  } catch {
    errors.push('claude marketplace: invalid .claude-plugin/marketplace.json');
    return;
  }

  if (!marketplace.name) errors.push('claude marketplace: missing name');
  if (!marketplace.owner?.name) errors.push('claude marketplace: missing owner.name');
  if (!Array.isArray(marketplace.plugins)) {
    errors.push('claude marketplace: plugins must be an array');
    return;
  }

  const skillSet = new Set(skillDirs);
  const exposedSkills = new Set();
  const pluginsRoot = path.resolve(root, 'plugins');
  const resolvedPluginsRoot = await realpath(pluginsRoot).catch(() => pluginsRoot);

  for (const plugin of marketplace.plugins) {
    if (!plugin.name) {
      errors.push('claude marketplace: plugin missing name');
      continue;
    }

    if (typeof plugin.source !== 'string' || !plugin.source.startsWith('./')) {
      errors.push(`${plugin.name}: source must be a relative path starting with ./`);
      continue;
    }

    if (plugin.source.split(/[\\/]+/).includes('..')) {
      errors.push(`${plugin.name}: source must not contain parent-directory traversal`);
      continue;
    }

    const pluginDir = path.resolve(root, plugin.source);
    if (!pathIsInside(pluginsRoot, pluginDir)) {
      errors.push(`${plugin.name}: source must resolve under ./plugins`);
      continue;
    }

    const resolvedPluginDir = await realpath(pluginDir).catch(() => null);
    const pluginJsonPath = path.join(pluginDir, '.claude-plugin', 'plugin.json');
    const skillsPath = path.join(pluginDir, 'skills');

    if (!resolvedPluginDir) {
      errors.push(`${plugin.name}: source path does not exist`);
      continue;
    }

    if (!pathIsInside(resolvedPluginsRoot, resolvedPluginDir)) {
      errors.push(`${plugin.name}: source must resolve under ./plugins`);
      continue;
    }

    if (!(await pathExists(pluginJsonPath))) {
      errors.push(`${plugin.name}: missing .claude-plugin/plugin.json`);
    } else {
      try {
        const pluginJson = JSON.parse(await readFile(pluginJsonPath, 'utf8'));
        if (pluginJson.name !== plugin.name) {
          errors.push(`${plugin.name}: plugin.json name "${pluginJson.name ?? ''}" does not match marketplace entry`);
        }

        const sharedFields = ['description', 'version', 'author', 'license', 'keywords', 'category'];
        for (const field of sharedFields) {
          if (!valuesMatch(pluginJson[field], plugin[field])) {
            errors.push(`${plugin.name}: plugin.json ${field} does not match marketplace entry`);
          }
        }

        for (const field of ['homepage', 'repository']) {
          if (!valuesMatch(pluginJson[field], marketplace[field])) {
            errors.push(`${plugin.name}: plugin.json ${field} does not match marketplace ${field}`);
          }
        }
      } catch {
        errors.push(`${plugin.name}: invalid .claude-plugin/plugin.json`);
      }
    }

    let entries = [];
    try {
      entries = await readdir(skillsPath, { withFileTypes: true });
    } catch {
      errors.push(`${plugin.name}: missing skills directory`);
      continue;
    }

    for (const entry of entries) {
      if (!entry.isDirectory() && !entry.isSymbolicLink()) continue;
      if (!skillSet.has(entry.name)) {
        errors.push(`${plugin.name}: unknown skill "${entry.name}"`);
        continue;
      }

      const pluginSkillDir = path.join(skillsPath, entry.name);
      const resolvedSkillDir = await realpath(pluginSkillDir).catch(() => null);
      const relativeSkillDir = resolvedSkillDir ? path.relative(resolvedPluginDir, resolvedSkillDir) : '';
      if (!resolvedSkillDir || relativeSkillDir.startsWith('..') || path.isAbsolute(relativeSkillDir)) {
        errors.push(`${plugin.name}: skill "${entry.name}" must resolve inside the plugin directory`);
        continue;
      }

      const skillPath = path.join(pluginSkillDir, 'SKILL.md');
      if (!(await pathExists(skillPath))) {
        errors.push(`${plugin.name}: skill "${entry.name}" does not resolve to SKILL.md`);
      } else {
        exposedSkills.add(entry.name);
      }
    }
  }

  for (const skillName of skillDirs) {
    if (!exposedSkills.has(skillName)) {
      errors.push(`claude marketplace: skill "${skillName}" is not exposed by any plugin`);
    }
  }
}

async function main() {
  const entries = await readdir(skillsDir, { withFileTypes: true });
  const skillDirs = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
  const errors = [];

  for (const skillName of skillDirs) {
    const skillPath = path.join(skillsDir, skillName, 'SKILL.md');
    const metadataPath = path.join(skillsDir, skillName, 'metadata.json');
    let content;
    try {
      content = await readFile(skillPath, 'utf8');
    } catch {
      errors.push(`${skillName}: missing SKILL.md`);
      continue;
    }

    try {
      const metadata = await readFile(metadataPath, 'utf8');
      JSON.parse(metadata);
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
        errors.push(`${skillName}: missing metadata.json`);
      } else {
        errors.push(`${skillName}: invalid metadata.json`);
      }
    }

    const frontmatter = parseFrontmatter(content);
    if (!frontmatter) {
      errors.push(`${skillName}: missing YAML frontmatter`);
      continue;
    }

    if (frontmatter.name !== skillName) {
      errors.push(`${skillName}: name "${frontmatter.name ?? ''}" does not match folder name`);
    }

    if (!frontmatter.description) {
      errors.push(`${skillName}: missing description`);
    } else if (frontmatter.description.length > 1024) {
      errors.push(`${skillName}: description exceeds 1024 characters`);
    }

    if (!content.includes('## When to Use') && !content.includes('## When to Use This Skill')) {
      errors.push(`${skillName}: missing usage guidance`);
    }
  }

  await validateClaudeMarketplace(skillDirs, errors);

  if (errors.length > 0) {
    console.error('Skill lint failed:');
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }

  const shouldRunSkillgrade = process.env.ENABLE_SKILLGRADE === '1';
  const hasSkillgradeKey = Boolean(process.env.ANTHROPIC_API_KEY);
  if (shouldRunSkillgrade && hasSkillgradeKey) {
    const result = spawnSync('bunx', ['skillgrade', '--ci', '--provider=local', '--smoke'], {
      cwd: path.join(skillsDir, 'skill-creator'),
      encoding: 'utf8',
      stdio: 'pipe',
    });

    if (result.status !== 0) {
      process.stdout.write(result.stdout || '');
      process.stderr.write(result.stderr || '');
      process.exit(result.status ?? 1);
    }
  } else {
    console.log('Skipping skillgrade eval: set ENABLE_SKILLGRADE=1 with ANTHROPIC_API_KEY to run it.');
  }

  console.log(`Validated ${skillDirs.length} skills.`);
}

main().catch((error) => {
  console.error(error?.stack || String(error));
  process.exit(1);
});
