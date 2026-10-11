---
name: skill-creator
description: Guides authoring, reviewing, and validating agent skills (SKILL.md + metadata.json + references/ + scripts/) in this Capgo skills repository and similar ones. Covers trigger and negative-trigger design, lean SKILL.md with a when-to-load reference index, traps over basics, verification and error-handling sections, version tagging of facts, subagent-oriented skills (main-agent vs subagent split), optional when_to_use frontmatter, inline snapshots with allowed-tools, skillgrade evals, and this repo's canonical skills/ to plugins/ mirroring and registration. Use when creating a new skill, tightening a skill's description or triggers, splitting a long skill into references, or fixing `bun run lint-skills` failures. Do not use for app documentation, README or marketing copy, or library code that is not a skill.
---

# Skill Authoring

Write skills that load at the right moment, teach what the model does not already know, and prove their own results.

## When to Use

TRIGGER when:

- The user creates a skill directory, or asks to improve, review, or split an existing skill.
- A skill triggers too often, too rarely, or collides with a sibling skill.
- `bun run lint-skills` fails, or a skill must be registered in a plugin or the marketplace.
- The user wants a skillgrade eval for a skill.

Do not use when:

- The user is writing app docs, a README, a changelog, or marketing copy.
- The user is editing library or plugin source that is not a skill.

## Reference Index

Only load a reference when its topic is in play.

| File | Load when |
| --- | --- |
| `references/repo-layout.md` | Adding, renaming, or registering a skill in this repository, mirroring into `plugins/`, or reading lint errors |
| `references/authoring-patterns.md` | Writing the body: trigger design, reference index, traps, verification, version tags, subagent skills, inline snapshots |

## Procedure

### 1. Scope the skill

- Write one sentence: "Load this when <concrete situation>, so the agent can <outcome>."
- List the sibling skills that could also match. Each one becomes a negative trigger.
- Split the skill if it covers two unrelated workflows. Merge it if it would be a one-paragraph stub.
- Ask the user at real judgement calls (scope, audience, which product to prefer). Do not ask about things you can read from the repo.

### 2. Write the frontmatter

```yaml
---
name: my-skill                      # lowercase, hyphenated, equals the folder name
description: <what it does>. Use when <symptoms, APIs, file names, error strings>. Do not use for <case> (sibling-skill).
---
```

- The description is the only text the router sees. Put concrete triggers in it: command names, config keys, file names, exact error strings. Name the sibling skills in the negative clause.
- Keep it to one line and at most 1024 characters (lint enforces both).
- Optional `when_to_use:` is appended to `description` in Claude Code's skill listing. The combined text is truncated at 1,536 characters, so put the key use case first. Other agents ignore it, so never move the core trigger out of `description`.
- `allowed-tools:` only when the skill runs inline commands. Keep it minimal and read-only.

### 3. Write a lean body

Target fewer than about 250 lines. Use this order:

1. One-line purpose, plus a version line ("Checked against X 8.77, October 2026").
2. `## When to Use`: TRIGGER bullets and a `Do not use when` list that points to sibling skills by name. Lint requires the `## When to Use` heading.
3. `## Reference Index`: a table of each file and *when* to load it, with "Only load a reference when its topic is in play."
4. `## Procedure`: numbered steps. Inspect before you edit, and report findings before invasive changes.
5. `## Traps`: the non-obvious failures. Skip basics the model already knows.
6. `## Verification`: exact commands or checks that prove success.
7. `## Error Handling`: exact error strings mapped to fixes.

Move dense tables, long code, and per-topic depth into `references/<topic>.md`, one level deep. Put fragile or repetitive logic in `scripts/`.

### 4. Fact-check everything

- Verify every command, flag, config key, and API against source or official docs. Prefer the package's `--help`, its type definitions, or its repo over memory.
- Tag time-sensitive facts with versions ("Capacitor 8.5+", "Xcode 27", "CLI 8.77"). Gate optional behavior on feature detection when the targets can be older.
- If you cannot verify a fact, write "check current docs" and do not guess. List any commands that do not exist but are commonly hallucinated.

### 5. Match command context

- Skill prose uses standard `npm` / `npx` examples. Capacitor and Capgo CLI examples use `npx ...@latest`.
- Use `bun` / `bunx` only for this repository's own development and CI commands, or in Bun-specific skills.
- When a skill edits another repository, tell the agent to read that repository's instructions and follow its package-manager policy.

### 6. Preserve secrets

When a skill edits user files, tell the agent never to replace user-provided tokens, keys, certificates, or passwords with placeholders unless asked. Placeholders are for new generic examples only. Do not suggest rotating secrets unless the user asks.

### 7. Register and validate (this repo)

Follow `references/repo-layout.md`: canonical folder in `skills/`, `metadata.json`, an entry in `package.json` `skills`, exposure through a plugin folder plus `.claude-plugin/marketplace.json`, then `bun run sync-skills` and `bun run lint-skills`.

### 8. Add an eval when behavior must not regress

Use `skillgrade` (`eval.yaml` + `graders/`). Prefer deterministic graders for structure. Use an LLM rubric only for qualitative judgement. Run it with `bun run lint-skills-skillgrade`, or `ENABLE_SKILLGRADE=1` with an API key during lint.

## Traps

- A vague description ("Helps with X") never triggers. A greedy one ("Use for anything about mobile") steals sibling requests.
- An index entry like "see references/" with no load condition makes the agent read everything or nothing. Always say *when*.
- Stale facts age faster than structure. Put the version line at the top so reviewers know what to re-check.
- Editing a mirrored copy under `plugins/<plugin>/skills/` is wrong. Edit the canonical `skills/<name>/`, then sync.
- Inline `!`command`` snapshots run on every load. Keep them guarded (`fs.existsSync`), fast, short in output, and read-only.

## Verification

1. `bun run lint-skills` passes. It checks the name against the folder, the description length, the `## When to Use` heading, valid `metadata.json`, marketplace exposure, and byte-identical mirrors.
2. `wc -l skills/<name>/SKILL.md` is about 250 or less, and every file in `references/` is named in the Reference Index.
3. A grep for each command in the skill matches the tool's `--help` or source.
4. Mental routing test: three prompts that should trigger the skill do, and one prompt for each sibling skill does not.

## Error Handling

| Lint message | Fix |
| --- | --- |
| `<skill>: name "<x>" does not match folder name` | Make the frontmatter `name` equal the directory |
| `<skill>: description exceeds 1024 characters` | Cut filler, keep concrete triggers and the negative clause |
| `<skill>: missing usage guidance` | Add a `## When to Use` heading |
| `<skill>: missing metadata.json` / `invalid metadata.json` | Create or fix the JSON (see `references/repo-layout.md`) |
| `claude marketplace: skill "<x>" is not exposed by any plugin` | Create `plugins/<plugin>/skills/<x>/`, then `bun run sync-skills` |
| `mirrored skills: ... (run bun run sync-skills)` | Run `bun run sync-skills`. Never hand-edit the mirror |
| `<plugin>: unknown skill "<x>"` | The plugin folder has no matching `skills/<x>`. Create the canonical skill or remove the folder |
