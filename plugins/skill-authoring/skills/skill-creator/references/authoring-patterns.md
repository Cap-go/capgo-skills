# Authoring Patterns

These patterns are distilled from high-quality vendor skills, such as the agent skills Apple ships with Xcode 27, and adapted for this repo. Write original prose. Do not copy vendor text.

## 1. Trigger design

The description has three parts:

1. **What it does**, starting with a verb: "Sets up...", "Migrates...", "Diagnoses...".
2. **Use when**: concrete symptoms the user will actually type or paste:
   - APIs and config keys (`notifyAppReady`, `plugins.CapacitorUpdater.autoUpdate`)
   - Files (`Info.plist`, `SceneDelegate.swift`, `capacitor.config.ts`)
   - Exact error strings ("No credentials found for this app and platform")
   - Product or device names users say in plain words ("foldable iPhone", "skip app store review")
3. **Do not use for**: each overlapping case with the sibling skill named in parentheses.

Mirror the same split in the body: `TRIGGER when:` bullets and a `Do not use when:` list. A request does not have to be technical to match. If users say it in plain language, list the plain phrase.

## 2. Reference index with load conditions

```markdown
## Reference Index

Only load a reference when its topic is in play.

| File | Load when |
| --- | --- |
| `references/configuration.md` | Editing plugin config or choosing modes |
| `references/troubleshooting.md` | A device does not update or an error code appears |
```

- One topic per file. Name each file after the decision it supports, not "misc".
- Large codebases: tell the agent to build a TODO list of areas (targets, modules, platforms) and work through it item by item.

## 3. Traps over basics

Keep a line only if it changes what a capable model would do:

- Good: "A global `~/.capgo` key wins over a project `./.capgo` key."
- Good: "`set()` destroys the JS context. Code after it never runs."
- Cut: "Make sure to test your app", "Capacitor is a cross-platform runtime".

Include "commands that do not exist" lists when models commonly hallucinate commands (for example `channel create` vs the real `channel add`).

## 4. Procedures

- Number the steps. Inspect before you edit (read the config, the lockfile, the native project).
- Report findings and ask before invasive or irreversible changes (deleting data, enforcing org policy, store submission).
- An empty diff is a failure when the skill's target pattern exists in a file. Either apply the change or tell the user why not.

## 5. Verification section

List the exact commands and expected outputs:

```markdown
## Verification
1. `npx cap sync ios` succeeds with no warnings about <x>.
2. `grep -rn "UIScreen.main" ios/App` returns nothing.
3. Build and run on device: <observable behavior>.
```

Prefer checks the agent can run itself. Name the ones that need a human or a device.

## 6. Error handling

Use a table that maps the exact string to the fix. Copy strings from the tool's source or real output, not paraphrases. Add a row for "symptom without an error" cases too.

## 7. Version tagging

- Add a header line: "Checked against <tool> <version> (<Month Year>)."
- Tag individual facts: "Capacitor 8.5+ adopts UIScene", "Xcode 27 requires the scene lifecycle", "CLI 8.77 adds `channel promote`".
- When targets can be older, gate the fact: feature detection in JS, `if #available(iOS 17, *)` in Swift, `Build.VERSION.SDK_INT` in Kotlin.
- For prerelease platforms (`@next`), state the tag and tell the agent to re-check the registry (`npm view <pkg> dist-tags`).

## 8. Subagent-oriented skills

Use this pattern for skills that do long, noisy, or tool-heavy work (device interaction, log capture, large audits). Split the body into two sections:

```markdown
# For the Main Agent

This is a subagent skill. Delegate it with the Agent tool and pass:
- the goal and the acceptance check
- any session or device identifier, for the subagent's exclusive use
- the paths to inspect

Example prompt: "Using the <skill> skill, verify <feature> on <device id>. Report pass/fail with evidence."

# For the Subagent

- Steps to run, tools to use, and what to capture (screenshots, logs, file:line).
- Always report: <issues the main agent must hear about>.
- Return a short structured result, not raw dumps.
```

The main agent keeps the conclusion, and the subagent absorbs the noisy output. Tell the subagent to clean up long-lived sessions when it is done.

## 9. Inline snapshots

```markdown
!`node -e "const fs=require('fs');if(!fs.existsSync('package.json'))process.exit(0);..."`
```

- Guard every path. Exit 0 silently when the file is missing.
- Print a few deterministic lines (versions, matching deps), not whole files.
- Declare the matching `allowed-tools` entry (for example `Bash(node -e *)`) and keep it read-only.

## 10. Optional `when_to_use`

Claude Code appends an optional `when_to_use:` frontmatter field to `description` in its skill listing. The combined text is truncated at 1,536 characters. Use it for long trigger lists that would bloat `description`. Keep it on one line, because this repo's lint parser only reads `key: value` lines. Other agents ignore it, so the description must still trigger on its own.
