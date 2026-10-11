---
name: cocoapods-to-spm
description: Migrates an existing Capacitor iOS app from CocoaPods to Swift Package Manager (SPM) before CocoaPods Trunk goes read-only (expected December 2, 2026). Use when the app still has ios/App/Podfile, Pods/, Podfile.lock or App.xcworkspace and the user wants CapApp-SPM, runs or recovers from `npx cap spm-migration-assistant`, needs debug.xcconfig / CAPACITOR_DEBUG wired up, sees "Some installed Capacitor plugins are not compatible with SPM" or "<plugin> does not have a Package.swift", or plans the Capacitor 9 upgrade where SPM is the default. Do not use for adding SPM support inside a plugin repository (use capacitor-plugin-spm-support), the UIScene lifecycle migration (use capacitor-uiscene-migration), full version upgrades (use capacitor-app-upgrades), or generic iOS build debugging (use debugging-capacitor).
---

# CocoaPods to Swift Package Manager Migration

Move a Capacitor iOS app from CocoaPods to SPM without losing native project customizations.

## When to Use

TRIGGER when:
- `ios/App/Podfile`, `Pods/`, `Podfile.lock`, or `App.xcworkspace` exists and the user wants SPM.
- User asks about `npx cap spm-migration-assistant`, `CapApp-SPM`, `debug.xcconfig`, or `--packagemanager SPM`.
- User worries about CocoaPods Trunk becoming read-only (expected December 2, 2026), or about pods that can no longer be published/updated.
- `npx cap sync` warns `Some installed Capacitor plugins are not compatible with SPM` or `<plugin id> does not have a Package.swift`.
- Upgrading to Capacitor 9 and wanting to drop CocoaPods at the same time.

Do not use:
- Adding `Package.swift` / `CAPBridgedPlugin` to a plugin you maintain -> `capacitor-plugin-spm-support`.
- SceneDelegate / UIScene adoption (Capacitor 8.5+, required by Xcode 27) -> `capacitor-uiscene-migration`.
- The Capacitor major upgrade itself -> `capacitor-app-upgrades`, `capacitor-app-upgrade-v8-to-v9`.
- Build or runtime failures unrelated to dependency management -> `debugging-capacitor`.

## Why Now

- CocoaPods Trunk is expected to become read-only on **December 2, 2026**. Existing pods keep resolving, but no new pod versions get published, so plugin fixes will increasingly ship SPM-only.
- Capacitor 8+ scaffolds new iOS projects with SPM by default. Upgrading Capacitor does **not** convert an existing CocoaPods app.
- Capacitor 9 (currently `next` / alpha) only adds the `Cordova` product / `CapacitorCordova` pod when a Cordova plugin is installed. Native code that imports `Cordova` without a Cordova plugin breaks in either setup.

## How the CLI Decides

- The CLI treats the project as SPM if and only if `ios/App/CapApp-SPM/` exists. Deleting or renaming it silently flips `npx cap sync` back to CocoaPods behavior.
- `ios/App/CapApp-SPM/Package.swift` is regenerated on every `npx cap sync ios` (`// DO NOT MODIFY THIS FILE - managed by Capacitor CLI commands`). Put customizations in `capacitor.config.*`, never in that file.
- A plugin is included only if its npm package root has a `Package.swift`. Others are skipped with a warning; their native code is silently missing at runtime (`"X" plugin is not implemented on ios`).
- During sync, if a plugin's `Package.swift` pins `capacitor-swift-pm` to a different major, the CLI rewrites that file inside `node_modules` and warns `<id> is built for Capacitor <N>, it might cause issues`. Treat this as "upgrade the plugin", not as success.
- Cordova plugins get a generated package under `ios/capacitor-cordova-ios-plugins/sources/<Name>`. Plain `.framework` files are not supported as SPM binary targets (warning: `custom .framework files are not supported as binaryTarget in SPM`); they need an `.xcframework`.

## Command Policy

- Use the repo's package manager for installs and scripts; keep Capacitor CLI calls as `npx cap ...` so the project-local CLI runs.
- Run commands from the directory containing `capacitor.config.*`.

## Live Project Snapshot

Detected Capacitor, iOS, Cordova, and plugin dependencies:
!`node -e "const fs=require('fs');if(!fs.existsSync('package.json'))process.exit(0);const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));const out=[];for(const section of ['dependencies','devDependencies']){for(const [name,version] of Object.entries(pkg[section]||{})){if(name.startsWith('@capacitor/')||name.startsWith('@capgo/')||name.startsWith('@capacitor-community/')||name.startsWith('@awesome-cordova-plugins/')||name.startsWith('cordova-')||name.includes('capacitor'))out.push(section+'.'+name+'='+version)}}console.log(out.sort().join('\n'))"`

Relevant iOS dependency files:
!`find ios -maxdepth 5 \( -name 'Podfile' -o -name 'Podfile.lock' -o -name 'Pods' -o -name 'App.xcworkspace' -o -name 'Package.swift' -o -name 'Package.resolved' -o -name 'CapApp-SPM' -o -name 'debug.xcconfig' -o -name 'project.pbxproj' -o -name 'Info.plist' -o -name '*.entitlements' -o -name 'GoogleService-Info.plist' \) 2>/dev/null`

## Procedure

### 1. Inspect (read-only)

1. Capacitor version in `package.json` (`@capacitor/ios`). 8.x and 9.x are supported; on 6.x/7.x, prefer upgrading first.
2. `ios/App/Podfile` and `Podfile.lock`: list every pod, and which ones are not Capacitor plugins (Firebase, analytics SDKs, custom pods added by hand).
3. For each Capacitor/Cordova plugin: does `node_modules/<pkg>/Package.swift` exist? Cordova plugins get a generated package, so only `NO` entries block:
   ```bash
   node -e "const fs=require('fs');const p=require('./package.json');for(const n of Object.keys({...p.dependencies,...p.devDependencies})){const d='node_modules/'+n;if(!fs.existsSync(d+'/ios')&&!fs.existsSync(d+'/plugin.xml'))continue;console.log((fs.existsSync(d+'/Package.swift')?'SPM     ':fs.existsSync(d+'/plugin.xml')?'CORDOVA ':'NO      ')+n)}"
   ```
4. `ios/App/App.xcodeproj/project.pbxproj`: signing, custom build settings, extra targets (widgets, notification service extensions), build phases, schemes.
5. `ios/App/App/`: `AppDelegate.swift`, `SceneDelegate.swift`, `Info.plist`, entitlements, `GoogleService-Info.plist`, custom Swift/ObjC files.

Report findings before editing: plugins without SPM, non-plugin pods that need an SPM replacement, and native customizations at risk.

### 2. Resolve blockers

For every `NO` plugin or non-plugin pod:
- Upgrade the plugin (most maintained plugins, including `@capacitor/*` and `@capgo/*`, ship `Package.swift`).
- Replace it with a maintained SPM-capable alternative.
- If the project owns the plugin, convert it with `capacitor-plugin-spm-support`.
- For third-party SDK pods added directly in the Podfile, add the vendor's SPM package to the App target in Xcode after migration.

Ask the user before proceeding if a critical plugin has no SPM path. Do not keep a hybrid Podfile + CapApp-SPM setup.

### 3. Choose a path

| Path | Use when |
|------|----------|
| `npx cap spm-migration-assistant` | Most apps; keeps the existing Xcode project and its customizations. |
| Fresh scaffold | `ios/` is close to the template (no extensions, few native edits). |
| Manual repair | The assistant ran partially or the project is heavily customized. |

### 4a. Run the migration assistant

Commit first. Requires CocoaPods (or Bundler) still installed because it runs `pod deintegrate`.

```bash
npx cap spm-migration-assistant
```

It runs `pod deintegrate`, deletes `Podfile`, `Podfile.lock`, and `App.xcworkspace`, extracts `ios/App/CapApp-SPM/`, writes `ios/debug.xcconfig` (`CAPACITOR_DEBUG = true`), adds `CAPACITOR_DEBUG = $(CAPACITOR_DEBUG)` to `Info.plist` if missing, then runs an iOS update that generates `Package.swift`. It ends with `To complete migration follow the manual steps at https://capacitorjs.com/docs/ios/spm#using-our-migration-tool`.

Two manual Xcode steps remain (`npx cap open ios`, which now opens `App.xcodeproj`):
1. Project `App` -> Package Dependencies -> `+` -> Add Local... -> select `ios/App/CapApp-SPM` -> Add Package, and link the `CapApp-SPM` library to the `App` target.
2. Project `App` -> Info -> Configurations -> Debug -> set the configuration file to `debug.xcconfig`.

Then `npx cap sync ios`.

### 4b. Fresh scaffold

Back up everything listed in step 1.5 first.

```bash
rm -rf ios
npx cap add ios --packagemanager SPM
npx cap sync ios
```

On Capacitor 8.5+ the new template already includes `SceneDelegate.swift` and `UIApplicationSceneManifest`. Restore icons, `Info.plist` keys, entitlements, signing, Firebase plist, custom sources, and extension targets by merging, not overwriting template files.

### 5. Optional SPM config in `capacitor.config.*`

Only when needed (all under `experimental.ios.spm`, verify the installed CLI version supports them):
- `swiftToolsVersion` (8.3+, default `'5.9'`): header of the generated `Package.swift`.
- `packageTraits` (8.3+): `{ "<plugin id>": ["TraitName", ".defaults"] }`; requires `swiftToolsVersion` >= `'6.1'`.
- `packageOptions` (8.4+): `{ "<plugin id>": { symlink: true, moduleAliases: { "Target": "Alias" } } }` for package name or module collisions.

### 6. UIScene check

The assistant changes dependency management only. If `Info.plist` lacks `UIApplicationSceneManifest`, the app is not on the scene lifecycle that Capacitor 8.5+ and Xcode 27 expect; run `npx cap migrate` or follow `capacitor-uiscene-migration`.

## Verification

```bash
# No CocoaPods leftovers
ls ios/App | grep -E 'Podfile|Pods|xcworkspace' && echo "LEFTOVERS" || echo "clean"
# CLI sees SPM and every plugin is included
npx cap sync ios 2>&1 | grep -Ei 'Package.swift|not compatible|built for Capacitor'
grep -c '.package(name:' ios/App/CapApp-SPM/Package.swift
# Plugin classes registered for runtime
node -e "console.log(require('./ios/App/App/capacitor.config.json').packageClassList)"
# Build without Xcode UI (project, not workspace)
xcodebuild -project ios/App/App.xcodeproj -scheme App -destination 'generic/platform=iOS Simulator' build
```

Also confirm in Xcode: `CapApp-SPM` linked to the App target, Debug uses `debug.xcconfig`, signing/bundle id/capabilities unchanged. On device, exercise each native plugin once (camera, push, purchases, etc.).

Commit `ios/App/CapApp-SPM/` and `ios/debug.xcconfig`. Follow `CapApp-SPM/.gitignore` for `Package.resolved` (newer templates ignore it).

## Error Handling

Load `references/troubleshooting.md` for the full table. Most common:

| Message / symptom | Fix |
|---|---|
| `Capacitor project is already using SPM, exiting.` | `CapApp-SPM/` already exists. Do manual repair, not the assistant. |
| `CocoaPods is not installed.` (assistant) | Install CocoaPods temporarily or use the fresh scaffold path. |
| `<id> does not have a Package.swift` / `Some installed Capacitor plugins are not compatible with SPM` | Upgrade, replace, or convert that plugin (step 2). |
| `"X" plugin is not implemented on ios` at runtime | Plugin skipped from `Package.swift`, or `packageClassList` missing it. Fix the plugin, re-sync, clean build. |
| `No such module 'Capacitor'` / `Missing package product 'CapApp-SPM'` | Local package not added/linked; redo manual step 1, then File -> Packages -> Reset Package Caches. |
| Debug-only features off (no WebView inspection, no debug logs) | `debug.xcconfig` not set on Debug configuration. |

## Output Format

For planning, return: current state (Capacitor version, pods, plugins without SPM, customizations at risk), chosen path and why, ordered steps, remaining Xcode/device-only checks.
