---
name: ionic-appflow-migration
description: Migrates an Ionic or Capacitor project off Ionic Appflow (access ends Dec 31, 2027). Use when the repo contains @capacitor/live-updates, cordova-plugin-ionic, a plugins.LiveUpdates block (appId, channel, autoUpdateMethod, maxVersions), LiveUpdates.sync()/reload() calls, ionic deploy or appflow CLI commands, .io-config.json, or Appflow build/store-deploy workflows, and the user wants Capgo live updates, Capgo Cloud Build or repo-owned CI builds, and repo-owned store publishing. Maps Appflow channels, update strategies, and API calls to @capgo/capacitor-updater. Do not use for Ionic Enterprise plugins such as Identity Vault, Auth Connect, or Secure Storage (ionic-enterprise-sdk-migration), Capawesome live updates (capawesome-live-update-migration), or a fresh Capgo setup with no Appflow history (capgo-live-updates).
allowed-tools:
  - Bash(node -e *)
  - Bash(find *)
---

# Ionic Appflow Migration

Replace each Appflow feature the project uses - Live Updates, native cloud builds, store deployment - and remove Appflow only after each replacement is verified.

Context: Ionic stopped selling Appflow in February 2025; existing customers keep access until December 31, 2027 with no new features. Plan the migration well before that date.

## When to Use

TRIGGER when:
- `package.json` has `@capacitor/live-updates` or `cordova-plugin-ionic`.
- `capacitor.config.*` has `plugins.LiveUpdates`, or `config.xml` / `Info.plist` / `strings.xml` hold Appflow deploy keys (`APP_ID`, `CHANNEL_NAME`, `UPDATE_METHOD`, `IonAppId`, `IonChannelName`).
- CI calls `ionic deploy`, `appflow`, `ionic package build`, or the Appflow dashboard triggers builds and store uploads.

Do not use for:
- `@ionic-enterprise/*` plugins -> `ionic-enterprise-sdk-migration`.
- Capawesome Cloud -> `capawesome-live-update-migration`.
- Greenfield Capgo setup -> `capgo-live-updates`.

## Live Project Snapshot

Detected Appflow-related packages and scripts:
!`node -e "const fs=require('fs');if(!fs.existsSync('package.json'))process.exit(0);const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));const out=[];for(const section of ['dependencies','devDependencies']){for(const [name,version] of Object.entries(pkg[section]||{})){if(name==='@capacitor/live-updates'||name==='cordova-plugin-ionic'||name.includes('appflow')||name==='@ionic/cli'||name==='@capgo/capacitor-updater'||name==='@capacitor/core')out.push(section+'.'+name+'='+version)}}for(const [name,cmd] of Object.entries(pkg.scripts||{})){if(/appflow|ionic deploy|ionic package|live-updates/i.test(cmd))out.push('scripts.'+name+'='+cmd)}console.log(out.join('\n'))"`

Possible Appflow config and workflow paths:
!`find . -maxdepth 4 -not -path '*/node_modules/*' \( -name '.io-config.json' -o -name 'ionic.config.json' -o -name 'config.xml' -o -name 'capacitor.config.json' -o -name 'capacitor.config.ts' -o -name 'capacitor.config.js' -o -path './.github/workflows/*' -o -name '.gitlab-ci.yml' -o -name 'appflow.config.json' \)`

## Procedure

### Step 1: Inventory (report before editing)

```bash
rg -n "@capacitor/live-updates|cordova-plugin-ionic|LiveUpdates|IonAppId|IonChannelName|UPDATE_METHOD|CHANNEL_NAME|ionic deploy|appflow|dashboard.ionicframework.com|ionic.io/appflow" \
  -g '!node_modules' .
```

Record per feature:
- Live Updates: SDK in use, Appflow app ID, channels and which binaries point at them, update method (`background`, `none`, always-latest on resume, force update), `maxVersions`, any code calling `sync()`, `download()`, `extract()`, `reload()`.
- Native builds: build stack, signing certificates/profiles and keystores stored in Appflow, environment variables, native config overrides.
- Store deploys: TestFlight / Play destinations and tracks.

Ask the user to export signing credentials from Appflow (or confirm they have originals) before deleting anything there.

### Step 2: Live Updates -> Capgo

```bash
npm uninstall @capacitor/live-updates   # or: npm uninstall cordova-plugin-ionic
npm install @capgo/capacitor-updater
npx cap sync
```

For `cordova-plugin-ionic`, also remove its `<plugin>`/`<variable>` entries from `config.xml` and any `Ion*` keys from native files.

Replace the config block:

```ts
// capacitor.config.ts
plugins: {
  // remove LiveUpdates: { appId, channel, autoUpdateMethod, maxVersions }
  CapacitorUpdater: {
    autoUpdate: true,
    autoDeletePrevious: true,
  },
},
```

| Appflow | Capgo |
|---|---|
| `appId` | Capgo app created with `npx @capgo/cli@latest init` (uses `appId` from `capacitor.config`) |
| `channel` | Capgo channel (dashboard/CLI); set default channel server-side, or `defaultChannel` in config for per-build overrides |
| `autoUpdateMethod: 'background'` | `autoUpdate: true` (default behaviour: download in background, apply on next start) |
| `autoUpdateMethod: 'none'` + manual `sync()` | Keep `autoUpdate: true` unless the product needs custom timing; otherwise `autoUpdate: false` + manual API |
| `maxVersions` | `autoDeletePrevious: true` plus server-side bundle retention |
| Binary-version targeting | Channel per native major, or `--min-update-version` / metadata strategy (`capgo-release-workflows`) |
| Force update | Mark bundle/channel behaviour in Capgo and listen for `majorAvailable` or use `directUpdate` |

Add the one required hook once the app shell renders:

```ts
import { CapacitorUpdater } from '@capgo/capacitor-updater';
void CapacitorUpdater.notifyAppReady();
```

Without it Capgo treats the bundle as broken and rolls back.

API mapping (keep manual calls only if the product needs custom UI or timing):

| Appflow (`@capacitor/live-updates`) | Capgo |
|---|---|
| `LiveUpdates.sync()` | Not needed with `autoUpdate: true`; manual: `CapacitorUpdater.getLatest()` + `download()` |
| `LiveUpdates.reload()` | `CapacitorUpdater.set({ id })` (applies and reloads) or `reload()` |
| resume listener calling `sync()` | Remove; auto-update checks on resume |
| `SplashScreen.hide()` after sync | Plain `SplashScreen.hide()` after app boot; optional `appReady` listener |

Upload the first bundle to a test channel:

```bash
npm run build
npx @capgo/cli@latest bundle upload --channel development
```

### Step 3: Native cloud builds

Two replacements; ask which the user prefers:
- Capgo Cloud Build: `npx @capgo/cli@latest build credentials save --platform ios|android ...`, then `npx @capgo/cli@latest build request <appId> --platform ios|android`. Details in `capgo-native-builds`.
- Repo-owned CI (GitHub Actions, GitLab, Fastlane): `capacitor-ci-cd`.

Carry over environment variables, build-time config, and signing inputs exactly; change one thing at a time.

### Step 4: Store publishing

Capgo Cloud Build can upload to TestFlight / Play when store credentials are saved; otherwise use CI upload steps (`capacitor-ci-cd`) or manual submission (`capacitor-app-store`). Keep bundle IDs, Play tracks, and credentials unchanged.

### Step 5: Cut over and clean up

1. Ship a native build containing `@capgo/capacitor-updater` to the stores. Devices on older binaries keep pulling from Appflow until they update - keep Appflow channels live until adoption is high enough.
2. Publish web updates to both systems during the overlap, or freeze Appflow at the last bundle shipped with the new binary.
3. Remove Appflow packages, `plugins.LiveUpdates`, `.io-config.json` references, Appflow CI jobs, and secrets once no supported binary depends on them.

## Verification

- `rg -n "@capacitor/live-updates|cordova-plugin-ionic|LiveUpdates\\." -g '!node_modules' .` returns nothing (after cleanup).
- Fresh install of the new binary: logs show `notifyAppReady` called; Capgo dashboard shows the device.
- Upload a test bundle to a non-production channel; device downloads and applies it on next start.
- Upload a deliberately broken bundle (no `notifyAppReady`) to the test channel; device rolls back.
- New native build pipeline produces signed IPA/AAB with the same bundle ID and a higher build number.

## Error Handling

| Problem | Fix |
|---|---|
| App rolls back every update | `notifyAppReady()` not reached (called too late, behind login, or code path throws); call it right after the shell renders |
| `Cannot find API key in local folder or global, please login first` from the Capgo CLI | `npx @capgo/cli@latest login <apikey>` locally, or `CAPGO_TOKEN` in CI |
| Updates never arrive | Device on a channel without the bundle, or bundle incompatible with native version; check channel and `npx @capgo/cli@latest bundle compatibility` |
| Old Appflow update overwrote Capgo bundle | Old SDK still installed in the binary; confirm `@capacitor/live-updates` / `cordova-plugin-ionic` removed and `npx cap sync` run before building |
| Build fails after removing Appflow | Appflow injected env vars or native config; recreate them in CI or Capgo Cloud Build environment |
