import { readFile, readdir } from 'node:fs/promises';
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

  if (errors.length > 0) {
    console.error('Skill lint failed:');
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }

  const shouldRunSkillgrade = process.env.ENABLE_SKILLGRADE === '1';
  const hasApiKey = Boolean(process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY || process.env.GEMINI_API_KEY);
  if (shouldRunSkillgrade && hasApiKey) {
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
    console.log('Skipping skillgrade eval: set ENABLE_SKILLGRADE=1 with an API key to run it.');
  }

  console.log(`Validated ${skillDirs.length} skills.`);
}

main().catch((error) => {
  console.error(error?.stack || String(error));
  process.exit(1);
});
