---
name: capacitor-mcp
description: Connect AI agents (Claude Code, Claude Desktop, Cursor, VS Code, Cline, Codex) to Capacitor and Ionic tooling over Model Context Protocol. Covers the awesome-ionic-mcp server (Ionic component APIs, Capacitor plugin docs, Ionic/Capacitor CLI tools), the Capgo hosted MCP at https://api.capgo.app/mcp, the local Capgo CLI MCP (npx @capgo/cli@latest mcp), and Xcode's MCP bridge (xcrun mcpbridge) for building the iOS app from an agent. Use when the user wants to add, configure, verify, or troubleshoot an MCP server for a Capacitor project, or sees errors like "GitHub API rate limit exceeded", "unable to find utility \"mcpbridge\"", or an MCP server that connects with no tools. Do not use for Capgo account operations themselves (capgo-cloud, capgo-cli-usage), app debugging (debugging-capacitor), device logs (ios-android-logs), choosing plugins (capacitor-plugins), or Ionic UI work (ionic-design).
---

# Capacitor MCP Servers

Wire MCP servers into an agent so it can read Ionic/Capacitor docs, run Capacitor CLI commands, manage Capgo, and drive Xcode.

## When to Use

TRIGGER when the user:
- asks to "add an MCP server" / "connect Claude/Cursor to Capacitor, Ionic, Capgo or Xcode"
- mentions `awesome-ionic-mcp`, `api.capgo.app/mcp`, `@capgo/cli mcp`, `xcrun mcpbridge`, `claude mcp add`, `.cursor/mcp.json`, `.vscode/mcp.json`, `claude_desktop_config.json`
- has an MCP server that fails to start, shows no tools, asks to sign in, or hits a rate limit

Do not use for:
- uploading bundles, channels, rollouts, native builds as a task: `capgo-cloud`, `capgo-cli-usage`, `capgo-live-updates`, `capgo-native-builds`
- finding or installing a plugin: `capacitor-plugins`
- runtime bugs and crashes: `debugging-capacitor`; device logs: `ios-android-logs`
- Ionic component design and theming: `ionic-design`

## Pick the Server

| Need | Server | Transport |
| --- | --- | --- |
| Ionic component APIs/demos, Capacitor plugin docs, run `ionic`/`cap` commands | `awesome-ionic-mcp` (community, npm) | stdio via `npx` |
| Capgo account: apps, bundles, channels, rollouts, devices, stats, build status/logs, webhooks, push | Capgo hosted MCP `https://api.capgo.app/mcp` | streamable HTTP, OAuth or API key |
| Upload a bundle from `dist/`, request a native build, `doctor`, `probe`, compatibility check | Capgo local CLI MCP `npx @capgo/cli@latest mcp` | stdio |
| Build/run the iOS project, read Xcode issues, Xcode tools | Xcode MCP `xcrun mcpbridge` (Xcode 26.3+, verified on Xcode 27.1) | stdio |

The Capgo hosted and local servers are complementary: hosted cannot read local files; local needs `npx @capgo/cli@latest login` first. `https://capgo.app/mcp` is a separate public docs-discovery server with no account access.

## Procedure

1. Inspect first: identify the client (Claude Code, Claude Desktop, Cursor, VS Code, Cline, Codex) and read its existing MCP config before editing. Do not overwrite other servers.
2. Choose scope: project config (`.cursor/mcp.json`, `.vscode/mcp.json`, `claude mcp add --scope project`) when the team should share it; user/global config otherwise. Ask the user if unclear.
3. Add the server. Claude Code one-liners:

   ```bash
   claude mcp add --transport stdio awesome-ionic-mcp -- npx -y awesome-ionic-mcp@latest
   claude mcp add --transport http capgo https://api.capgo.app/mcp
   claude mcp add --transport stdio capgo-cli -- npx @capgo/cli@latest mcp
   claude mcp add --transport stdio xcode -- xcrun mcpbridge
   ```

   Other clients: load the matching reference below.
4. Authenticate:
   - Capgo hosted: run `/mcp` in Claude Code and pick `capgo` to sign in (OAuth 2.1). Clients without OAuth send `Authorization: Bearer <Capgo API key>`.
   - Capgo local: `npx @capgo/cli@latest login` once on the machine.
   - Xcode: enable external agents in Xcode Settings > Intelligence, keep the project open, approve the agent in Xcode's prompt.
   - awesome-ionic-mcp: optional `GITHUB_TOKEN` env var for plugin catalog fetches.
5. Restart or reload the client, then run Verification.

## Traps

- Secrets: if the user already has a `GITHUB_TOKEN` or Capgo API key in config, keep it as is. Prefer OAuth for Capgo hosted; use a key with the smallest role needed (read-only for reporting). Never commit keys in project-scoped config; use env vars or user scope.
- Capgo hosted tools include destructive ones (delete app, set channel bundle, roll back). Clients ask for confirmation; do not auto-approve them.
- OAuth sessions create a key named `MCP · <client name>` that expires after at most 90 days. Reconnect via `/mcp` when it expires; revoke by deleting that key in the console.
- awesome-ionic-mcp runs `ionic`/`npx` commands in `project_directory` (defaults to the nearest project root, then cwd). Only `ionic`, `@ionic/cli`, `@capacitor/cli` and `cap*` packages are allowed, and arguments containing `; & | $ ( ) { } [ ] < >` are rejected.
- `ionic_serve` and `capacitor_run` block or need a device; prefer running them in a terminal the user controls.
- awesome-ionic-mcp parameters are `html_tag` (not `tag`), `repo_name` for Capgo/community plugins, `plugin_name` for official plugins, `slug` for the third-party catalog. Call the `get_all_*` tool first to get exact names.
- `xcrun mcpbridge` resolves Xcode via `xcode-select`. If the active developer dir is `/Library/Developer/CommandLineTools`, it is not found.
- Xcode approves per process: restarting the agent triggers a new approval prompt.
- Without the Intelligence setting enabled, `xcrun mcpbridge` connects but exposes no tools.

## Verification

```bash
claude mcp list                  # each server shows connected / needs auth
claude mcp get capgo             # shows transport and URL
xcrun --find mcpbridge           # Xcode bridge resolvable
xcrun mcpbridge run-agent --dry-run claude   # prints the resolved Claude command with Xcode config
```

Then make one read-only tool call per server and confirm a real result:
- awesome-ionic-mcp: `get_ionic_component_definition` with `html_tag: "ion-button"`, or `get_all_capgo_plugins`
- Capgo hosted: "List my Capgo apps"
- Capgo local: `capgo_list_apps` or `capgo_doctor`
- Xcode: ask the agent to build the iOS app (`ios/App/App.xcodeproj` or `App.xcworkspace` open in Xcode)

In Cursor/VS Code/Claude Desktop, check the MCP panel shows the server enabled with a tool count above zero.

## Error Handling

| Error / symptom | Fix |
| --- | --- |
| `GitHub API rate limit exceeded. Set GITHUB_TOKEN environment variable to increase limits.` | Add `GITHUB_TOKEN` (no scopes needed for public repos) to the server `env`, restart. |
| `Plugin not found: <name>` (awesome-ionic-mcp) | Use the exact `repo_name`/`slug` returned by the matching `get_all_*` tool. |
| `Component not found: <tag>` | Pass a real Ionic tag such as `ion-modal`; list with `get_all_ionic_components`. |
| `Command '<cmd>' is not allowed` / `NPX package '<pkg>' is not allowed` / `Argument contains dangerous characters` | The server only runs Ionic/Capacitor CLIs with plain args; run other commands in a terminal. |
| `Failed to download core JSON data from Ionic.` | Network issue at startup; check connectivity/proxy and restart the server. |
| `xcrun: error: unable to find utility "mcpbridge", not a developer tool or in PATH` | `sudo xcode-select -s /Applications/Xcode.app/Contents/Developer`, or update Xcode to 26.3+. |
| Xcode server connected but zero tools | Enable external agents in Xcode Settings > Intelligence and open the project. |
| Capgo hosted shows "needs authentication" | Run `/mcp` (Claude Code) or click the client's login prompt; reconnect after the 90-day key expiry. |
| Capgo local tools fail with auth errors | Run `npx @capgo/cli@latest login` on that machine. |
| Server starts then exits in Claude Desktop | Node/`npx` not on the GUI PATH; use an absolute path to `npx` in `command`. |

## References

Only load a reference when its topic is in play.

- `references/awesome-ionic-mcp.md`: client configs (Claude Desktop, Cursor, Cline, VS Code), full tool list with verified parameters, live viewer.
- `references/capgo-mcp.md`: hosted vs local Capgo MCP, per-client setup (Claude.ai, ChatGPT, Cursor, VS Code, Lovable, API-key headers), tool coverage.
- `references/xcode-mcp.md`: Xcode MCP bridge setup for Claude Code and Codex, `run-agent`, headless `mcp-server` commands, Capacitor iOS workflow.

## Resources

- awesome-ionic-mcp: https://github.com/Tommertom/awesome-ionic-mcp
- Capgo hosted MCP: https://capgo.app/docs/ai/mcp/
- Capgo CLI MCP: https://capgo.app/docs/cli/reference/mcp/
- Xcode external agents: https://developer.apple.com/documentation/xcode/giving-external-agents-access-to-xcode
- Claude Code MCP: https://docs.anthropic.com/en/docs/claude-code/mcp
- MCP spec: https://modelcontextprotocol.io
