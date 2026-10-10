---
name: capgo-live-updates
description: Sets up and debugs Capgo live (OTA) updates in a Capacitor app with @capgo/capacitor-updater. Use when the user wants to ship web-layer fixes without app store review, install or configure the updater plugin, choose an autoUpdate mode, call notifyAppReady, wire manual download/next/set flows, set channels from the app, or debug updates that never apply, roll back, or report codes such as no_new_version_available, disable_auto_update_to_major, cannot_update_via_private_channel, or on_premise_app. Do not use for CLI-only bundle/channel operations (capgo-release-management), Capgo Cloud native builds (capgo-native-builds), or migrations from another OTA vendor.
---

# Capgo Live Updates

Wire `@capgo/capacitor-updater` into a Capacitor app, ship the first bundle, and keep rollback safe.

Facts below were checked against `@capgo/capacitor-updater` 8.52 and `@capgo/cli` 8.77 (October 2026).

## When to Use

TRIGGER when:

- The user wants OTA / live updates, hotfixes without store review, or "Capgo" in a Capacitor app.
- The updater plugin needs installing, upgrading, or configuring in `capacitor.config.*`.
- The user asks about `notifyAppReady`, `autoUpdate` modes, `directUpdate`, `autoSplashscreen`, `setChannel`, `getLatest`, `download`, `next`, `set`, or `reset`.
- Updates upload fine but devices never get them, roll back, or loop.

Do not use when:

- The work is only CLI bundle, channel, rollout, or encryption-key commands. Use `capgo-release-management`.
- The user needs a signed IPA/APK/AAB from Capgo Cloud. Use `capgo-native-builds`.
- The user is moving from Capawesome Cloud (`capawesome-live-update-migration`) or Ionic Appflow (`ionic-appflow-migration`).
- The user wants the whole release pipeline (OTA, native builds, and store publishing). Use `capgo-release-workflows`.
- The request is about general CLI routing or MCP setup. Use `capgo-cli-usage`.

## Reference Index

Only load a reference when its topic is in play.

| File | Load when |
| --- | --- |
| `references/configuration.md` | Editing `plugins.CapacitorUpdater` in `capacitor.config.*`, choosing `autoUpdate` modes, self-hosted URLs |
| `references/js-api.md` | Writing manual update flows, listeners, channel switching, or rollback code |
| `references/channels-and-rollouts.md` | Channels, device self-assignment, progressive rollouts, version targeting |
| `references/ci-cd.md` | Uploading from GitHub Actions, GitLab CI, or another CI |
| `references/troubleshooting.md` | A device does not update, rolls back, or the backend returns an error code |

## Version Rule (read first)

The updater major version follows the Capacitor major version.

| Capacitor | Install |
| --- | --- |
| 8.x | `npm install @capgo/capacitor-updater@latest` (8.x line) |
| 7.x | `npm install @capgo/capacitor-updater@lts-v7` |
| 6.x | `npm install @capgo/capacitor-updater@lts-v6` |
| 5.x | `npm install @capgo/capacitor-updater@lts-v5` |
| 4.x | `npm install @capgo/capacitor-updater@lts-v4` |

Capacitor 9 trap: Capacitor 9 is still prerelease (`@capacitor/core@next`). As of October 2026 there is no updater line for Capacitor 9. The 8.x line declares `peerDependencies: @capacitor/core ^8.0.0`. The `@capgo/capacitor-updater@9.0.0` on npm is an old Capacitor 5 release from 2023 and is marked deprecated, so never install it for Capacitor 9. Before you advise on a Capacitor 9 project, check the current tags with `npm view @capgo/capacitor-updater dist-tags`. If no Capacitor 9 line is listed, tell the user that.

## Procedure

### 1. Inspect before editing

- Read `package.json` to get the `@capacitor/core` major and any existing `@capgo/capacitor-updater`.
- Read `capacitor.config.ts|json` to get `appId`, `webDir`, and any existing `plugins.CapacitorUpdater`.
- Find the app entry point (`main.ts`, `main.tsx`, `App.vue` setup, `app.component.ts`, and so on). That is where `notifyAppReady()` goes.
- Check for another OTA SDK. If one is present, stop and switch to the matching migration skill.

### 2. Connect the project (preferred path)

The guided onboarding registers the app, installs the plugin, patches the entry point, builds, uploads, and verifies on a device:

```bash
npx @capgo/cli@latest init YOUR_API_KEY com.example.app
```

API keys live at https://console.capgo.app/dashboard/apikeys. If the user already gave you a key, use it as-is and do not echo it back. In monorepos, add `--package-json`, `--main-file`, and `--capacitor-config`.

### 3. Manual install (when not using `init`)

```bash
npm install @capgo/capacitor-updater@latest   # pick the tag from the Version Rule table
npx cap sync
npx @capgo/cli@latest app add com.example.app
```

Minimum config (`autoUpdate` defaults to `true`, which equals `"atBackground"`):

```typescript
plugins: {
  CapacitorUpdater: {
    autoUpdate: true,
  },
},
```

### 4. Call `notifyAppReady()` immediately

```typescript
import { CapacitorUpdater } from '@capgo/capacitor-updater';

CapacitorUpdater.notifyAppReady();
```

- Call it at the very top of the entry file, before any network call or async init. If it is not called within `appReadyTimeout` (default 10000 ms), the bundle is marked failed and the previous one is restored.
- Crashes or API errors after this call do **not** trigger a rollback.
- `bundle upload` checks for this call and fails with `notifyAppReady() is missing in the build folder (...)`. Fix the source. Only use `--ignore-notify-app-ready` / `--no-code-check` when the user accepts the rollback risk.

### 5. Ship a bundle

```bash
npm run build
npx @capgo/cli@latest bundle upload com.example.app --path ./dist --channel production
```

For instant-apply modes (`"atInstall"`, `"onLaunch"`, `"always"`), upload with `--delta` and set `autoSplashscreen: true` with `@capacitor/splash-screen` `launchAutoHide: false`. See `references/configuration.md`.

### 6. Decide OTA vs native before each release

OTA can only change web assets. A new or upgraded native plugin, a Capacitor bump, or an edit under `ios/`, `android/`, or native config needs a store build. Check with:

```bash
npx @capgo/cli@latest bundle releaseType com.example.app --channel production   # prints OTA or native
```

`releaseType` compares native package metadata only. It cannot see raw edits under `ios/` or `android/`.

## Traps

- **Store compliance:** OTA may change only interpreted web code and assets, and must not change the app's primary purpose. This comes from the interpreted-code clause in Apple's Developer Program License Agreement, App Review Guideline 2.5.2, and Google Play's Device and Network Abuse policy. Never use OTA to ship features that need review, and do not force an update to block app usage.
- **Privacy manifest:** iOS needs `NSPrivacyAccessedAPICategoryUserDefaults` with reason `CA92.1` in `PrivacyInfo.xcprivacy`.
- **Config key is `publicKey`, not `privateKey`.** The private key (`.capgo_key_v2`) stays with the uploader and must never be in the app or the repo.
- **`resetWhenUpdate` (default `true`)** clears downloaded bundles when a new native build is installed. If you disable it, a store build older than the OTA bundle can break things.
- **Testing on a dev build:** a channel blocks dev, emulator, or prod devices by flag (`disable_dev_build`, `disable_emulator`, ...). Check the channel options before you assume the plugin is broken.
- **Live reload (Ionic/Quasar):** the updater does not serve live-reload URLs. Turn live reload off when testing updates.
- **`set()` destroys the JS context.** No code after it runs. Prefer `next()` to apply on the next background.
- **Encryption is not secrecy:** an unencrypted bundle is a public web asset. Encryption protects storage and delivery, but the public key ships in the app. See `capgo-release-management` for `key create` / `key save`.

## Verification

1. `npx @capgo/cli@latest doctor` shows the installed updater version and flags anything outdated.
2. `grep -rn "notifyAppReady" src/` finds exactly one early call in the entry point.
3. `npx cap sync` succeeds, then build and install the native app once on a real device.
4. Upload a visibly changed bundle. Run `npx @capgo/cli@latest app debug com.example.app` while you background and reopen the app. The log should show the check, the download, and `set`.
5. `npx @capgo/cli@latest probe --platform ios` (or `android`) reports whether the backend would deliver an update to this config and explains why not.

## Error Handling

| Symptom / string | Fix |
| --- | --- |
| `notifyAppReady() is missing in the build folder` | Add the call to the entry point, rebuild, then upload again |
| `index.html is missing in the root folder of <dir>` | `--path` points at the wrong folder. Use the built `webDir` |
| `no_new_version_available` | Normal: the device is already current |
| `disable_auto_update_to_major` / `_minor` / `_patch` | Channel strategy blocks the jump. Align `CapacitorUpdater.version` or change `--disable-auto-update` |
| `cannot_update_via_private_channel` | Enable self-assign on the channel (`channel set <ch> --self-assign`) |
| `on_premise_app` (HTTP 429) | The `appId` is not in Capgo, the app is flagged on-prem, or the plan is cancelled |
| Update downloads then reverts on next launch | `notifyAppReady()` ran too late or not at all, or the bundle throws before it runs |

The full code list is in `references/troubleshooting.md`.

## Resources

- Getting started: https://capgo.app/docs/getting-started/add-an-app/
- Plugin settings: https://capgo.app/docs/plugins/updater/settings/
- Plugin API: https://capgo.app/docs/plugins/updater/api/
- Update behavior: https://capgo.app/docs/live-updates/update-behavior/
- Common problems: https://capgo.app/docs/plugins/updater/commonproblems/
