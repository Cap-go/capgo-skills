# Repository Layout (Cap-go/capgo-skills)

## Where things live

```
skills/<name>/                 # canonical source: edit only here
  SKILL.md                     # frontmatter + lean workflow
  metadata.json                # version, date, abstract, triggers, references
  references/*.md              # optional, one level deep, indexed in SKILL.md
  scripts/                     # optional deterministic helpers
  eval.yaml, graders/, fixtures/   # optional skillgrade eval
plugins/<plugin>/
  .claude-plugin/plugin.json   # name, description, version, author, license, keywords, category, homepage, repository
  skills/<name>/               # byte-for-byte mirror of skills/<name>/ (generated)
.claude-plugin/marketplace.json  # lists every plugin, with fields matching each plugin.json
package.json                   # "skills": [...] lists every published skill
```

## Mirroring

- `plugins/<plugin>/skills/<name>/` is a **copy** of `skills/<name>/`, written by `bun run sync-skills` (`scripts/sync-plugin-skills.mjs`).
- To add a skill to a plugin, create the empty folder `plugins/<plugin>/skills/<name>/`, then run `bun run sync-skills`.
- Never edit a mirror by hand. Lint fails with `mirrored skills: ... must match ... byte-for-byte (run bun run sync-skills)`.
- The sync script fails with `No canonical skill for: <plugin>/<name>` when a plugin folder has no matching skill.

## Registering a new skill

1. Create `skills/<name>/SKILL.md` and `skills/<name>/metadata.json`.
2. Add `"<name>"` to `package.json` `skills`.
3. Pick a plugin, or create a new one. A new plugin needs `plugins/<plugin>/.claude-plugin/plugin.json` and a matching entry in `.claude-plugin/marketplace.json`. The `description`, `version`, `author`, `license`, `keywords`, and `category` must be identical in both, and `homepage` and `repository` must equal the marketplace's values.
4. `mkdir -p plugins/<plugin>/skills/<name>` and run `bun run sync-skills`.
5. Update `README.md` / `CLAUDE.md` skill lists if the repo documents them.
6. Run `bun run lint-skills`.

## `metadata.json`

```json
{
  "version": "1.0.0",
  "organization": "Capgo",
  "date": "October 2026",
  "abstract": "One or two sentences on what the skill covers.",
  "triggers": ["phrases users type", "exact error strings", "command names"],
  "references": ["https://real.docs/url/"]
}
```

On every content change, bump `version` by a minor step (1.0.0 to 1.1.0) and refresh `date`. Only list reference URLs that resolve.

## What `bun run lint-skills` checks

- `SKILL.md` exists, its frontmatter parses, `name` equals the folder name, and `description` is present and at most 1024 characters.
- The body contains `## When to Use` (or `## When to Use This Skill`).
- `metadata.json` exists and is valid JSON.
- Marketplace: each plugin's `source` is `./plugins/...`, `plugin.json` matches the marketplace entry, every plugin skill folder maps to a canonical skill, and every canonical skill is exposed by at least one plugin.
- Mirrors are byte-identical to the canonical folders.
- skillgrade runs only with `ENABLE_SKILLGRADE=1` and `ANTHROPIC_API_KEY`.

The frontmatter parser reads simple `key: value` lines, so keep `description` on one line. A YAML block scalar (`>`/`|`) is not parsed.

## Command policy

- This repo's own commands use `bun`, `bun run`, and `bunx`.
- Skill prose uses `npm` / `npx`. Capacitor and Capgo CLIs use `npx ...@latest`.
