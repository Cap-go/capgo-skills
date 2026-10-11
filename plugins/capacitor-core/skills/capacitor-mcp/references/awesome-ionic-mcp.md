# awesome-ionic-mcp

Community MCP server (npm `awesome-ionic-mcp`, verified at 0.1.23). Aggregates Ionic component data, Capacitor plugin docs (official, Capgo, Capacitor Community, third-party plugin catalogs) and wraps the Ionic and Capacitor CLIs. Requires Node.js; uses Puppeteer, so a browser may download on first run.

## Client configuration

Claude Code:

```bash
claude mcp add --transport stdio awesome-ionic-mcp -- npx -y awesome-ionic-mcp@latest
```

Claude Desktop (`claude_desktop_config.json`, Settings > Developer), Cursor (`.cursor/mcp.json` or `~/.cursor/mcp.json`), Cline (`cline_mcp_settings.json`):

```json
{
  "mcpServers": {
    "awesome-ionic-mcp": {
      "command": "npx",
      "args": ["-y", "awesome-ionic-mcp@latest"],
      "env": {
        "GITHUB_TOKEN": "<your GitHub token, optional>"
      }
    }
  }
}
```

VS Code (`.vscode/mcp.json`):

```json
{
  "servers": {
    "awesome-ionic-mcp": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "awesome-ionic-mcp@latest"]
    }
  }
}
```

Environment variables read by the server:
- `GITHUB_TOKEN`: authenticates GitHub API calls used to build plugin catalogs (60 req/h unauthenticated vs 5,000 with a token). No scopes needed.
- `MCP_QUIET=true`: suppresses startup logging.

## Tools (verified from package source)

Ionic components:

| Tool | Params |
| --- | --- |
| `get_ionic_component_definition` | `html_tag` (e.g. `ion-button`) |
| `get_all_ionic_components` | none |
| `get_component_api` | `html_tag` |
| `get_component_demo` | `html_tag` |

Plugins:

| Tool | Params |
| --- | --- |
| `get_official_plugin_api` | `plugin_name` |
| `get_all_official_plugins` | none |
| `get_capgo_plugin_api` | `repo_name` (e.g. `purchases-capacitor`) |
| `get_all_capgo_plugins` | none |
| `get_capacitor_community_plugin_api` | `repo_name` |
| `get_all_capacitor_community_plugins` | none |
| `get_all_capacitor_plugins` | none (merged list across publishers) |
| `get_all_capacitor_plugin_publishers` | none |
| `get_plugin_api`, `get_all_plugins`, `get_all_free_plugins`, `get_all_insider_plugins` | `slug` for `get_plugin_api`; third-party plugin catalog |

Ionic CLI (all accept optional `project_directory`):

| Tool | Params |
| --- | --- |
| `ionic_info` | `format` |
| `ionic_config_get` / `ionic_config_set` / `ionic_config_unset` | `key`, `value` (set), `global` |
| `ionic_start` | `name`, `template`, `type`, `capacitor`, `package_id`, `no_deps`, `no_git`, `project_id` |
| `ionic_start_list` | none |
| `ionic_init` | `name`, `type`, `force`, `multi_app`, `project_id`, `default` |
| `ionic_repair` | `cordova_only` |
| `ionic_build` | `prod`, `configuration`, `platform`, `engine`, `source_map` |
| `ionic_serve` | `port`, `host`, `external`, `no_open`, `no_livereload`, `browser`, `browser_option` |
| `ionic_generate` | `type`, `name` |
| `integrations_list` / `integrations_enable` / `integrations_disable` | `integration` |

Capacitor CLI (all accept optional `project_directory`):

| Tool | Params |
| --- | --- |
| `capacitor_doctor` | `platform` |
| `capacitor_list_plugins` | `platform` |
| `capacitor_init` | `app_name`, `app_id`, `web_dir` |
| `capacitor_add` | `platform` |
| `capacitor_migrate` | none |
| `capacitor_sync` | `platform`, `deployment` |
| `capacitor_copy` | `platform` |
| `capacitor_update` | `platform` |
| `capacitor_build` | `platform`, `scheme`, `flavor` |
| `capacitor_run` | `platform`, `target`, `list` |
| `capacitor_open` | `platform` |

Server control: `set_live_viewer` (`on_off`: `"on"` / `"off"`) opens a visible browser that follows the docs pages the server reads.

Commands time out after 5 minutes. For `capacitor_run`, call it with `list: true` first to get a valid `target`.

## Typical flow

1. `get_all_capgo_plugins` / `get_all_capacitor_plugins` to find a plugin, then the matching `*_plugin_api` tool.
2. Install the plugin in a terminal (`npm install <pkg>`), then `capacitor_sync`.
3. `capacitor_doctor` to confirm the project is healthy.
