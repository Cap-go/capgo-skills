---
name: cocoapods-to-spm
description: Guide to migrating an existing Capacitor iOS app from CocoaPods to Swift Package Manager (SPM). Use this skill when users want Capacitor 8-style SPM projects, need to run or recover from spm-migration-assistant, replace Podfile/Pods/App.xcworkspace with CapApp-SPM, add debug.xcconfig, verify plugin SPM support, or remove CocoaPods from an app project.
---

# CocoaPods to Swift Package Manager Migration

Migrate a Capacitor iOS app from CocoaPods to Swift Package Manager without losing native project customizations.

## When to Use This Skill

- User wants to migrate a Capacitor app from CocoaPods to SPM
- User asks about `npx cap spm-migration-assistant`
- User asks about `CapApp-SPM`, generated `Package.swift`, or `debug.xcconfig`
- User has Capacitor 8 and wants the iOS app to use the default SPM template
- User wants to remove `ios/App/Podfile`, `Pods`, `Podfile.lock`, or `App.xcworkspace`
- User has SPM migration errors caused by plugins without SPM support

Do not use this for adding SPM support to a plugin package. Use `capacitor-plugin-spm-support` for plugin repositories.

## Key Rules

- Capacitor 8 creates new iOS projects with SPM by default.
- Existing CocoaPods apps are not changed automatically just because Capacitor is upgraded.
- In an SPM-based Capacitor app, plugin dependencies are referenced through `ios/App/CapApp-SPM`.
- Do not edit `CapApp-SPM` by hand. The Capacitor CLI rewrites it during `npx cap sync`.
- Do not mix CocoaPods and SPM in the same Capacitor app migration. All Capacitor and Cordova plugins in `package.json` need SPM support before the app can fully move.
- Commit or otherwise preserve the current project before deleting, regenerating, or deintegrating the iOS project.

## Command Policy

- Use the target repo's package manager for dependency installs and package scripts.
- For Capacitor CLI commands in this skill, use `npx cap ...` so the project-local Capacitor CLI is used.
- In Capgo repos, use Bun for local development commands when repo instructions require it, but keep Capacitor CLI examples as `npx cap ...`.

## Live Project Snapshot

Detected Capacitor, iOS, Cordova, and plugin dependencies:
!`node -e "const fs=require('fs');if(!fs.existsSync('package.json'))process.exit(0);const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));const out=[];for(const section of ['dependencies','devDependencies']){for(const [name,version] of Object.entries(pkg[section]||{})){if(name.startsWith('@capacitor/')||name.startsWith('@capgo/')||name.startsWith('@capacitor-community/')||name.startsWith('@awesome-cordova-plugins/')||name.startsWith('cordova-')||name.includes('capacitor'))out.push(section+'.'+name+'='+version)}}console.log(out.sort().join('\n'))"`

Relevant iOS dependency files:
!`find ios -maxdepth 5 \( -name 'Podfile' -o -name 'Podfile.lock' -o -name 'Pods' -o -name 'App.xcworkspace' -o -name 'Package.swift' -o -name 'Package.resolved' -o -name 'CapApp-SPM' -o -name 'debug.xcconfig' -o -name 'project.pbxproj' -o -name 'Info.plist' -o -name '*.entitlements' -o -name 'GoogleService-Info.plist' \) 2>/dev/null`

## Migration Procedure

### Step 1: Confirm Scope and Prerequisites

Inspect:

- `package.json` for Capacitor major version and installed plugins
- `ios/App/Podfile` and `ios/App/Podfile.lock` for current CocoaPods dependencies
- `ios/App/App.xcodeproj/project.pbxproj` for custom build settings, package references, entitlements, signing, and native source files
- `ios/App/App/` for app customizations

Before changing files, verify:

- The app is on a Capacitor version that supports SPM migration.
- The working tree is clean or the user accepts that local changes are being preserved.
- Every Capacitor/Cordova plugin has SPM support or a replacement plan.

If the migration is part of a Capacitor 8 upgrade, combine this skill with `capacitor-app-upgrade-v7-to-v8`.

### Step 2: Preserve Native Customizations

Record and preserve anything under `ios/` that a fresh template would overwrite:

- `ios/App/App/Info.plist`
- `ios/App/App/AppDelegate.swift`
- `ios/App/App/SceneDelegate.swift`, if present
- `ios/App/App/Assets.xcassets/`
- `ios/App/App/Base.lproj/`
- `ios/App/App/*.entitlements`
- `ios/App/App/GoogleService-Info.plist`, if Firebase is used
- custom `.xcconfig` files
- custom Swift or Objective-C source files
- custom frameworks, SDK files, extension targets, build phases, schemes, and signing settings

Prefer preserving through git and explicit diffs. Do not rely on memory.

### Step 3: Choose the Migration Path

Use the safest path for the project:

| Path | Use When | Tradeoff |
|------|----------|----------|
| CLI assistant | The iOS project has moderate customization and plugins mostly support SPM | Automates CocoaPods removal but still needs Xcode steps |
| Fresh SPM re-scaffold | The iOS project is close to the Capacitor template | Cleanest result, but native customizations must be restored carefully |
| Manual repair | The assistant already ran or the project is heavily customized | More control, more Xcode project editing |

If unsure, start with plugin compatibility and backup work. Do not delete `ios/` until the preservation list is complete.

### Step 4: Run the CLI Assistant

Preferred first attempt for many existing apps:

```bash
npx cap spm-migration-assistant
```

Expect it to:

- run CocoaPods deintegration
- remove `Podfile`, `Podfile.lock`, `Pods`, and `App.xcworkspace`
- create `ios/App/CapApp-SPM`
- generate a `Package.swift` from installed plugins
- generate `debug.xcconfig`
- warn about plugins that cannot be represented as SPM packages

Then open the iOS project:

```bash
npx cap open ios
```

In Xcode:

- Select the app project.
- Open the Package Dependencies tab.
- Add the local `CapApp-SPM` package.
- Add the generated `debug.xcconfig` to the project configuration as directed by the assistant output.

After Xcode changes, run:

```bash
npx cap sync ios
```

### Step 5: Fresh Re-Scaffold Alternative

Use this when the iOS project has little or no custom native configuration, or the assistant path is messier than regenerating.

Before deleting anything, preserve the native files listed in Step 2.

Then re-create iOS with SPM:

```bash
rm -rf ios
npx cap add ios --packagemanager SPM
npx cap sync ios
```

For Capacitor 8+, `npx cap add ios` uses SPM by default, but keep `--packagemanager SPM` when documenting the migration so the intent is explicit.

Restore custom files and settings deliberately:

- copy back app icons and launch storyboards
- reapply `Info.plist` keys without overwriting new template changes blindly
- restore entitlements and signing
- restore Firebase or other service configuration files
- re-add custom native source, extensions, build phases, and schemes

### Step 6: Fix Plugin Compatibility

If `npx cap sync` or the assistant warns about unsupported plugins:

- upgrade the plugin to an SPM-capable version
- replace the plugin with an official, Capgo, or maintained community alternative
- migrate the plugin itself with `capacitor-plugin-spm-support` if it is owned by the project
- postpone full SPM migration if a critical plugin cannot support SPM yet

Do not keep a plugin in CocoaPods while the app is otherwise migrated to SPM.

### Step 7: Validate the New iOS Project

Run the repo's normal web build first, then sync and build iOS:

```bash
npx cap sync ios
npx cap open ios
```

In Xcode, verify:

- `CapApp-SPM` is present as a local package dependency
- `debug.xcconfig` is attached to the debug configuration
- `Podfile`, `Pods`, `Podfile.lock`, and `App.xcworkspace` are gone for the migrated app
- `Package.resolved` is generated and committed if present
- signing team, bundle identifier, deployment target, entitlements, and capabilities survived
- app builds and launches on simulator
- native plugin flows still work on a real device when they need hardware or permissions

If using command-line verification, use the workspace/project and scheme that actually exist after migration.

## Common Failures

### Unsupported Plugin

Cause: a Capacitor or Cordova plugin does not ship SPM metadata.

Fix: upgrade, replace, or migrate the plugin. If the plugin is project-owned, use `capacitor-plugin-spm-support`.

### Missing `CapApp-SPM`

Cause: the assistant did not finish, files were deleted, or `npx cap sync` has not regenerated the package.

Fix:

```bash
npx cap sync ios
```

Then add the local package in Xcode if it is not already linked.

### Missing `debug.xcconfig`

Cause: generated config was not added to the Xcode project.

Fix: add `ios/App/debug.xcconfig` to the project configuration in Xcode, following the migration assistant output.

### Duplicate Symbols or Duplicate SDKs

Cause: the same dependency is still referenced by leftover CocoaPods artifacts and SPM.

Fix: remove CocoaPods artifacts from the app, clean derived data, reset package caches in Xcode, and rebuild.

### Lost Native Customization

Cause: a fresh iOS scaffold overwrote customized files.

Fix: recover from git or the preserved backup list, then reapply changes selectively against the new SPM template.

## Output Format

For planning tasks, return:

```markdown
## SPM Migration Plan

### Current State
- Capacitor version:
- CocoaPods files:
- Plugins needing SPM check:
- Native customizations to preserve:

### Recommended Path
- CLI assistant / fresh re-scaffold / manual repair:
- Reason:

### Steps
1. Preserve native files
2. Verify plugin SPM support
3. Run migration
4. Complete Xcode package/config setup
5. Sync and build

### Risks
- Unsupported plugins:
- Native customizations:
- Manual Xcode steps:
```

For implementation tasks, make the migration changes, run the relevant build or verification command available in the repo, and report any remaining Xcode-only or device-only checks.
