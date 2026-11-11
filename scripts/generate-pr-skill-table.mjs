/**
 * Build PR table: one row per repo in release window.
 */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();

async function main() {
const diffs = JSON.parse(await readFile(path.join(ROOT, 'scripts/.cache/capgo-api-diffs.json'), 'utf8'));

const DEDICATED_SKILL = {
  'capacitor-updater': 'capgo-live-updates',
  'capacitor-fast-sql': 'sqlite-to-fast-sql',
};

const DEEP_REF = new Set([
  'capacitor-native-audio',
  'capacitor-zebra-datawedge',
  'capacitor-background-geolocation',
  'capacitor-pdf-viewer',
  'capacitor-native-purchases',
  'capacitor-live-activities',
  'capacitor-social-login',
  'capacitor-watch',
  'capacitor-inappbrowser',
]);

function summarizeSkillChange(d) {
  const parts = [];
  if (DEDICATED_SKILL[d.repo]) {
    parts.push(`Updated dedicated skill \`${DEDICATED_SKILL[d.repo]}\``);
  }
  if (DEEP_REF.has(d.repo)) {
    parts.push('Added or updated `capacitor-plugins/references/capgo-' + d.repo.replace(/^capacitor-/, '') + '.md`');
  }
  parts.push('Full API and version block in `capgo-plugin-index.md`');
  if (!d.hasApiChange) {
    parts.push('No `definitions.ts` delta between reviewed tags');
    return parts.join('; ');
  }
  const delta = [];
  if (d.methods?.added?.length) delta.push(`methods: ${d.methods.added.join(', ')}`);
  if (d.events?.added?.length) delta.push(`events: ${d.events.added.join(', ')}`);
  if (d.config?.added?.length) delta.push(`config: ${d.config.added.join(', ')}`);
  if (d.methods?.removed?.length) delta.push(`removed methods: ${d.methods.removed.join(', ')}`);
  if (d.platformNotes?.length) delta.push(d.platformNotes.join('; '));
  if (d.breakingNotes?.length) delta.push('changelog notes in index');
  if (delta.length) parts.push(delta.join('; '));
  return parts.join('; ');
}

const rows = diffs
  .filter((d) => d.repo && !d.error && !d.skipped && d.fromTag && d.toTag)
  .sort((a, b) => a.repo.localeCompare(b.repo))
  .map((d) => ({
    plugin: d.repo,
    versions: `${d.fromTag} to ${d.toTag}`,
    change: summarizeSkillChange(d),
    hasApiChange: Boolean(d.hasApiChange),
  }));

const md = [
  '| Plugin | Versions reviewed (from to) | What was added or changed in the skill |',
  '|---|---|---|',
  ...rows.map((r) => `| ${r.plugin} | ${r.versions} | ${r.change.replace(/\|/g, ',')} |`),
].join('\n');

await writeFile(path.join(ROOT, 'scripts/.cache/pr-skill-table.md'), md);
console.log(`Rows: ${rows.length}, with API delta: ${rows.filter((r) => r.hasApiChange).length}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
