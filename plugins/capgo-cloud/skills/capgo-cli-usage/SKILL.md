---
name: capgo-cli-usage
description: Entry point for the Capgo CLI (`npx @capgo/cli@latest`). Maps the full command surface (init, login, doctor, probe, app, bundle, channel, key, account, organization, build, observe, get-qr, notifications, run device, mcp), explains API-key precedence (--apikey, CAPGO_TOKEN, ~/.capgo, ./.capgo), connects agents to Capgo through the hosted MCP (https://api.capgo.app/mcp) or the local CLI MCP, and routes to the narrower Capgo skill. Use when the user asks generally how to use the Capgo CLI, which command to run, how to authenticate it, how to connect Claude or another agent to Capgo, or gets "No Capgo API key found". Do not use when a specific Capgo skill already matches (capgo-live-updates, capgo-release-management, capgo-native-builds, capgo-organization-management).
---

# Capgo CLI Usage

Route Capgo CLI requests, authenticate the CLI, and connect agents to Capgo.

Facts below were checked against `@capgo/cli` 8.77 (October 2026). Always run `npx @capgo/cli@latest <command> --help` before you rely on a rarely used flag.

## When to Use

TRIGGER when:

- The user asks "how do I use the Capgo CLI", "which Capgo command does X", or asks about CLI login or auth.
- The user wants Claude, Cursor, ChatGPT, or another agent connected to their Capgo account (MCP).
- The request spans several Capgo areas and the right sub-skill is not clear yet.
- The CLI fails before doing any work (auth, wrong directory, missing `appId`).

Do not use when one of these already fits. Switch to it as soon as the scope is clear:

- App updater wiring, `notifyAppReady`, or `autoUpdate`: `capgo-live-updates`
- Bundle uploads, channels, rollouts, rollback, or encryption keys: `capgo-release-management`
- Native cloud builds and signing: `capgo-native-builds`
- Organizations, members, 2FA, or security policy: `capgo-organization-management`
- Multi-product Capgo plans (builds, OTA, and store): `capgo-cloud`
- Ionic or Capacitor's own MCP tooling, not Capgo: `capacitor-mcp`

## Command Surface

| Group | Commands | Skill |
| --- | --- | --- |
| Setup | `init [apikey] [appId]`, `login [apikey] [--local]`, `doctor`, `probe --platform ios\|android` | this skill / `capgo-live-updates` |
| App | `app add\|list\|set\|delete\|debug\|setting\|todo` | this skill |
| Bundles | `bundle upload\|list\|delete\|cleanup\|compatibility\|releaseType\|zip\|encrypt\|decrypt` | `capgo-release-management` |
| Channels | `channel add\|list\|set\|promote\|currentBundle\|delete` | `capgo-release-management` |
| Keys | `key create\|save\|delete_old` | `capgo-release-management` |
| Previews | `get-qr [appId] --bundle\|--channel` | `capgo-release-management` |
| Native builds | `build init\|request\|prescan\|needed\|last-output\|sync-ios-version\|credentials ...` | `capgo-native-builds` |
| Account / orgs | `account whoami`, `organization list\|add\|members\|set\|delete` | `capgo-organization-management` |
| Observe | `observe summary\|metrics\|events\|device\|versions\|routes` | this skill |
| Push | `notifications setup [appId]` | `capacitor-push-notifications` |
| Devices | `run device [ios\|android] [--no-launch]` | this skill |
| Agents | `mcp` | this skill |

These commands do not exist. Do not suggest them: `capgo upload` (use `bundle upload`), `channel create` (use `channel add`), `bundle revert` (use `channel set --bundle`), `key verify`, `upload --sign`.

## Authentication

```bash
npx @capgo/cli@latest login YOUR_API_KEY          # saves to ~/.capgo
npx @capgo/cli@latest login YOUR_API_KEY --local  # saves to ./.capgo (git-ignored)
```

The CLI picks the key in this order:

1. `-a, --apikey <key>` on the command
2. The `CAPGO_TOKEN` environment variable (use this in CI)
3. `~/.capgo` (global)
4. `./.capgo` (project)

Trap: the global key wins over the project key. Pass `-a` or set `CAPGO_TOKEN` to force a different account. Keys are created at https://console.capgo.app/dashboard/apikeys. If the user already supplied a key, use it as-is and do not echo it.

Self-hosted backends: add `--supa-host <url> --supa-anon <key>` on supported commands.

## Connect the Agent to Capgo (MCP)

Capgo has two MCP servers. Use both when available.

- Hosted MCP: `https://api.capgo.app/mcp` (streamable HTTP). Nothing to install. The client signs in with OAuth, or sends `Authorization: Bearer <Capgo API key>`. The hosted MCP includes destructive tools, so use an API key with the smallest role the task needs (read-only for reporting). It covers apps, bundles, channels, progressive rollouts, devices, stats, Observe update health, native build status and logs, webhooks, and push notifications. Example for Claude Code: `claude mcp add --transport http capgo https://api.capgo.app/mcp`, then `/mcp` to sign in. Each OAuth client gets its own `MCP · <client name>` API key, which expires after at most 90 days. Revoke a client by deleting that key in the console.
- Local CLI MCP: `npx @capgo/cli@latest mcp` (stdio, authenticated by `login`). Use it to upload a bundle from the build folder, request a native build, or run `doctor`, `probe`, or compatibility checks against local project files. The hosted MCP cannot read local files.

Claude Desktop config for the local server:

```json
{ "mcpServers": { "capgo": { "command": "npx", "args": ["@capgo/cli@latest", "mcp"] } } }
```

`https://capgo.app/mcp` is a different server: public docs discovery only, with no account access.

No Capgo account yet: sign up at https://console.capgo.app (14-day free trial, no credit card). Docs: https://capgo.app/docs/ai/mcp/

## Diagnostics Quick Path

```bash
npx @capgo/cli@latest doctor                         # versions + setup problems (add --package-json for monorepos)
npx @capgo/cli@latest app todo com.example.app       # onboarding checklist: done, skipped, pending
npx @capgo/cli@latest probe --platform android       # would the backend serve an update to this config?
npx @capgo/cli@latest app debug com.example.app      # live update events from a device
npx @capgo/cli@latest observe summary --days 7       # launch, crash, WebView findings, each with a next view
```

`observe` has no session ID. Use `observe device DEVICE_ID --json` to get one device's timeline.

## Monorepos

Use `--package-json`, `--node-modules`, and, for dynamic root configs, `--capacitor-config <path>`. Keep the env selector active, for example `CAP_APP=web npx @capgo/cli@latest init --capacitor-config ./env-configs/capacitor.config.web.ts`.

## Verification

- `npx @capgo/cli@latest account whoami` prints the expected account ID and email, which proves auth works.
- `npx @capgo/cli@latest app list` shows the app. If it is missing, run `app add`.
- MCP: in Claude Code, `/mcp` lists `capgo` as connected, and a read-only prompt ("list my Capgo apps") returns data.

## Error Handling

| String | Fix |
| --- | --- |
| `No Capgo API key found. Run \`...\` first, then retry this command.` | `npx @capgo/cli@latest login <key>`, set `CAPGO_TOKEN`, or pass `-a` |
| `Missing argument, you need to provide a appId, or be in a capacitor project` | Pass the `appId` positionally or run from the folder containing `capacitor.config.*` |
| `Insufficient permissions for <key>` | The key's role is too low for this app or org. Use a key with the needed role |
| `🔐 Access Denied: Two-Factor Authentication Required` | The org enforces 2FA. See `capgo-organization-management` |
| `App <id> not found in database` | Run `npx @capgo/cli@latest app add <id>` or check the active account |
| Wrong account used | A global `~/.capgo` overrides a local `.capgo`. Use `-a` or `CAPGO_TOKEN` |

## Resources

- CLI commands: https://capgo.app/docs/cli/commands/
- Hosted MCP: https://capgo.app/docs/ai/mcp/
- Local MCP: https://capgo.app/docs/cli/reference/mcp/
