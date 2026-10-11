# `plugins.CapacitorUpdater` Configuration

Source of truth: `src/definitions.ts` in `@capgo/capacitor-updater` 8.52. Most keys only affect Android and iOS. Run `npx cap sync` after changing config, then rebuild the native app, because config is read at native launch.

## Update behavior

| Key | Default | Notes |
| --- | --- | --- |
| `autoUpdate` | `true` | `true` = `"atBackground"`, `false` = `"off"`. String modes are listed below |
| `appReadyTimeout` | `10000` (ms) | Time allowed for `notifyAppReady()` before rollback. Minimum 1000 |
| `responseTimeout` | `20` (s) | HTTP timeout for checks and downloads |
| `periodCheckDelay` | `0` (disabled) | Repeat check interval in seconds while the app is open. Values under 600 become 600 |
| `resetWhenUpdate` | `true` | Drops downloaded bundles when a newer native build is installed |
| `autoDeleteFailed` | `true` | Removes failed bundles |
| `autoDeletePrevious` | `true` | Removes the previous bundle after a successful update |
| `keepUrlPathAfterReload` | `false` | Keep the route after reload. `window.history` is still cleared |
| `version` | native version | Baseline version sent on the first check. Set it when channel strategies compare against it |
| `directUpdate` | `false` | **Deprecated**: use the `autoUpdate` string modes |

### `autoUpdate` string modes

| Mode | Behavior |
| --- | --- |
| `"off"` | No automatic checks |
| `"atBackground"` | Check and download on foreground, apply on the next background (default) |
| `"atInstall"` | Apply immediately only after a fresh install or store update, otherwise `atBackground` |
| `"onLaunch"` | Apply immediately on cold start, otherwise `atBackground` |
| `"always"` | Apply immediately on every foreground when an update exists |
| `"onlyDownload"` | Download and emit `updateAvailable`, but never set or apply. Your code decides |

Instant modes (`atInstall`, `onLaunch`, `always`) apply while the user waits. They require:

```typescript
plugins: {
  SplashScreen: { launchAutoHide: false },
  CapacitorUpdater: {
    autoUpdate: 'onLaunch',
    autoSplashscreen: true,          // required for instant modes
    autoSplashscreenLoader: true,    // optional native spinner
    autoSplashscreenTimeout: 10000,  // default; 0 disables
  },
},
```

Also install `@capacitor/splash-screen` and upload with `--delta`. A full zip over about 10 MB is slow for users.

## Channels

| Key | Default | Notes |
| --- | --- | --- |
| `defaultChannel` | unset | Case sensitive. Overrides the cloud default, but cloud device overrides still win. The channel must allow self-assignment |
| `allowSetDefaultChannel` | `true` | When `false`, `setChannel()` returns `disabled_by_config` |
| `persistDefaultChannelOnReinstall` | `true` | Keeps the `setChannel` choice across reinstall where possible |

## Security

| Key | Default | Notes |
| --- | --- | --- |
| `publicKey` | unset | Encryption v2 public key. Written by `npx @capgo/cli@latest key save` / `key create` |
| `allowHttpsToHttpRedirect` | `false` | Keep it off unless a self-hosted CDN really redirects to HTTP |
| `allowModifyUrl` | `false` | Required for `setUpdateUrl` / `setStatsUrl` / `setChannelUrl` |
| `persistModifyUrl` | `false` | Persist runtime URL overrides |
| `allowModifyAppId` | `false` | Required for `setAppId` |
| `allowManualBundleError` | `false` | Required for `setBundleError` |
| `allowPreview` | `false` | Trusted container/preview apps only |

There is no `privateKey` config key. Never put the private key in the app.

## Endpoints (self-hosted or custom)

| Key | Default |
| --- | --- |
| `updateUrl` | `https://plugin.capgo.app/updates` |
| `statsUrl` | `https://plugin.capgo.app/stats` (set `""` to disable stats) |
| `channelUrl` | `https://plugin.capgo.app/channel_self` |
| `appId` | native bundle id. Override when the Capgo app id differs |

Self-hosting guide: https://capgo.app/docs/plugins/updater/self-hosted/getting-started/. For a fully self-hosted backend, the CLI takes `--supa-host` and `--supa-anon` on supported commands. Do not invent a Docker image. Point users to the documented guide.

## Logging and debug UI

| Key | Default | Notes |
| --- | --- | --- |
| `osLogging` | `true` | Native system log, readable in TestFlight and production builds |
| `disableJSLogging` | `false` | Silence plugin console logs |
| `allowShakeChannelSelector` | `false` | Gesture opens a channel picker (internal/QA builds) |
| `shakeMenu` / `shakeMenuGesture` | `false` / `'shake'` | Preview-session menu |

## Changing config from the CLI

```bash
npx @capgo/cli@latest app setting plugins.CapacitorUpdater.defaultChannel --string "beta"
npx @capgo/cli@latest app setting plugins.CapacitorUpdater.autoUpdate --bool true
```

In dynamic monorepo configs, add `--capacitor-config <path>`.
