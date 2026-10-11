# Capgo MCP Servers

Capgo ships two MCP servers. Use both together when the agent needs account access and local project files.

| | Hosted | Local CLI |
| --- | --- | --- |
| Endpoint | `https://api.capgo.app/mcp` | `npx @capgo/cli@latest mcp` (stdio) |
| Install | none | Capgo CLI via `npx` |
| Auth | OAuth 2.1 (PKCE) or `Authorization: Bearer <Capgo API key>` | `npx @capgo/cli@latest login` |
| Upload bundle from build folder | no | yes |
| Request native build | no (status, logs, cancel only) | yes |
| `doctor`, `probe`, compatibility check | no | yes |

`https://capgo.app/mcp` is a public docs-discovery server (manifest at `https://capgo.app/.well-known/mcp.json`); it cannot access an account.

No account yet: https://console.capgo.app (14-day free trial).

## Hosted: client setup

Claude Code:

```bash
claude mcp add --transport http capgo https://api.capgo.app/mcp
```

Then run `/mcp` and pick `capgo` to sign in.

Claude.ai: Settings > Connectors > Add custom connector, name `Capgo`, URL `https://api.capgo.app/mcp`, Connect.

ChatGPT: Apps & Connectors > enable Developer mode (advanced) > new connector with the URL, OAuth.

Cursor (`~/.cursor/mcp.json` or `.cursor/mcp.json`), then click "Needs login":

```json
{
  "mcpServers": {
    "capgo": { "url": "https://api.capgo.app/mcp" }
  }
}
```

VS Code (`.vscode/mcp.json`, or "MCP: Add Server" > HTTP):

```json
{
  "servers": {
    "capgo": { "type": "http", "url": "https://api.capgo.app/mcp" }
  }
}
```

Lovable: connectors > custom MCP server > URL > OAuth (or API key).

Clients without OAuth (n8n, scripts, CI):

```json
{
  "mcpServers": {
    "capgo": {
      "url": "https://api.capgo.app/mcp",
      "headers": { "Authorization": "Bearer <your Capgo API key>" }
    }
  }
}
```

### Sign-in behavior

- Consent page at `console.capgo.app/oauth/authorize`; the user picks which organizations the client may access.
- Capgo creates a key named `MCP · <client name>`, valid at most 90 days (shorter if the org enforces a stricter policy). Delete that key in the console to revoke.
- Tools call the Capgo public API with that key; RBAC, rate limits and audit logs apply as for REST calls.

### Coverage (about 50 tools)

Account and organizations (members, invitations, audit logs, API keys), apps, bundles, channels and progressive rollouts (pause, promote, roll back, auto-pause), devices and channel overrides, statistics and Observe update health, native build status/logs/cancel, webhooks (deliveries, retries), push notifications. Destructive tools are annotated so clients ask for confirmation.

## Local CLI MCP

Log in once, then register:

```bash
npx @capgo/cli@latest login
claude mcp add --transport stdio capgo-cli -- npx @capgo/cli@latest mcp
```

Claude Desktop / Cursor JSON:

```json
{
  "mcpServers": {
    "capgo-cli": {
      "command": "npx",
      "args": ["@capgo/cli@latest", "mcp"]
    }
  }
}
```

Tools: `capgo_list_apps`, `capgo_add_app`, `capgo_update_app`, `capgo_delete_app`, `capgo_upload_bundle`, `capgo_list_bundles`, `capgo_delete_bundle`, `capgo_cleanup_bundles`, `capgo_list_channels`, `capgo_add_channel`, `capgo_update_channel`, `capgo_delete_channel`, `capgo_get_current_bundle`, `capgo_check_compatibility`, `capgo_list_organizations`, `capgo_add_organization`, `capgo_get_account_id`, `capgo_doctor`, `capgo_get_stats`, `capgo_request_build`, `capgo_generate_encryption_keys`, `capgo_probe`, `capgo_star_repository`, `capgo_star_all_repositories`.

For what to do with these tools (release flows, channels, builds) load the `capgo-cloud` or `capgo-cli-usage` skill.

Docs: https://capgo.app/docs/ai/mcp/ and https://capgo.app/docs/cli/reference/mcp/
