# Xcode MCP Bridge

Xcode (26.3+, verified on Xcode 27.1) exposes its tools to external agents through `xcrun mcpbridge`, a stdio bridge between an MCP client and Xcode's MCP tool service. Useful for Capacitor apps to build the iOS target, read build issues and use Xcode capabilities on `ios/App`.

## Setup

1. Make sure the full Xcode is selected: `xcode-select -p` must point inside `Xcode.app`, not `/Library/Developer/CommandLineTools`. Fix with `sudo xcode-select -s /Applications/Xcode.app/Contents/Developer`.
2. In Xcode Settings > Intelligence, allow external agents to use Xcode tools.
3. Register the bridge:

   ```bash
   claude mcp add --transport stdio xcode -- xcrun mcpbridge
   codex mcp add xcode -- xcrun mcpbridge
   ```

   Generic JSON clients: `"command": "xcrun", "args": ["mcpbridge"]`.
4. Open the Capacitor iOS project in Xcode (`npx cap open ios`), then prompt the agent.
5. Approve the agent in the dialog Xcode shows. Approval is per process; a restarted client asks again.

## Bridge options

- `MCP_XCODE_PID`: connect to a specific Xcode process when several are running (default: the Xcode chosen by `xcode-select`).
- `MCP_XCODE_SESSION_ID`: UUID of an Xcode tool session.
- `xcrun mcpbridge run-agent claude`: launch Claude Code with Xcode-provided config. `--dry-run` prints the resolved command; `--no-xcode-tools` omits Xcode MCP tools.
- `xcrun agent skills export [--replace-existing] [dir]`: export Xcode-provided agent skills.

## Headless server (`mcp-server`)

`/Applications/Xcode.app/Contents/Developer/usr/bin/mcp-server` manages the Xcode MCP server process:
- `status`, `show-logs`, `open <workspace>`, `stop`
- sudo: `enable` / `disable` (headless mode), `approve <id>`, `deny <id>`, `allow-folder <path>`, `clear-permissions`, `reset-all`

Use `status` first when tools are missing; it reports whether permission is enabled and the server is running.

## Capacitor workflow

1. `npm run build && npx cap sync ios` (terminal or awesome-ionic-mcp `capacitor_sync`).
2. `npx cap open ios`.
3. Ask the agent to build the `App` scheme through Xcode tools and fix reported issues in native files only; web code fixes go back through `npx cap sync ios`.

Source: https://developer.apple.com/documentation/xcode/giving-external-agents-access-to-xcode and `xcrun mcpbridge --help`.
