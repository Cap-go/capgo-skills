---
name: capacitor-plugin-upgrade-v8-to-v9
description: Upgrades a Capacitor plugin library from v8 to v9 (prerelease, @next until GA). Runs `npx @capacitor/plugin-migration-v8-to-v9@latest`, then the manual checklist - peer/dev dependency ranges, removed Android APIs (@NativePlugin, saveCall, pluginRequestPermission, int-code startActivityForResult, CapConfig getters, PluginCall.save/isSaved/hasOption), removed iOS APIs (CAPBridge class, getWebView, isSimulator, presentVC, CAPNotifications), AGP 9.2.1 / Gradle 9.5.1 build.gradle edits (compileSdk 37, minSdk 26, no targetSdk, built-in Kotlin, core-ktx to core, unique namespace, no jcenter, proguard-android-optimize.txt), iOS 16 in podspec and Package.swift, dropping the Cordova SPM product, and UIScene lifecycle observers. Use for "update my plugin to Capacitor 9", "Cannot find 'CAPBridge' in scope", NativePlugin compile errors, AGP 9 namespace collisions. Do not use for apps (use capacitor-app-upgrade-v8-to-v9), the 8.5 UIScene app step (use capacitor-uiscene-migration), or older majors.
allowed-tools:
  - Bash(node -e *)
  - Bash(find *)
---

# Capacitor Plugin Upgrade v8 to v9

Capacitor 9 is a prerelease (`next` dist-tag, 9.0.0-alpha.x as of October 2026). Dependency ranges below target the prerelease; after 9.0.0 GA use `^9.0.0` / `from: "9.0.0"`. Tell the user before publishing a stable plugin release that only supports a prerelease core; a common choice is to publish it under an npm `next` tag.

Canonical source: https://capacitorjs.com/docs/updating/plugins/9-0

## When to Use

TRIGGER when:
- Plugin repo with `peerDependencies["@capacitor/core"]` at `^8` or `>=8` and the user wants Capacitor 9 support
- Plugin fails to compile against Capacitor 9 on removed APIs (`CAPBridge`, `@NativePlugin`, `saveCall`, `getWebView()`, `isSimulator()`)
- Plugin's `android/build.gradle` fails under AGP 9 / Gradle 9 (`jcenter()`, `kotlin-android`, `proguard-android.txt`, namespace collision)
- A consuming app without Cordova plugins fails on the plugin's `Cordova` SPM product or `com.getcapacitor.cordova` imports

Do not use:
- App projects -> `capacitor-app-upgrade-v8-to-v9`
- Plugin still on 7 or older -> `capacitor-plugin-upgrades` (chain majors)
- Adding SPM to a CocoaPods-only plugin -> `capacitor-plugin-spm-support`
- Only checking a plugin against the 8.5 UIScene lifecycle -> `capacitor-uiscene-migration` (`references/plugin-audit.md`)

## Live Project Snapshot

!`node -e "const fs=require('fs');if(!fs.existsSync('package.json'))process.exit(0);const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));const out=['package.name='+(pkg.name||''),'package.version='+(pkg.version||'')];for(const section of ['peerDependencies','dependencies','devDependencies']){for(const [name,version] of Object.entries(pkg[section]||{})){if(name.startsWith('@capacitor/'))out.push(section+'.'+name+'='+version)}}out.push('Package.swift='+fs.existsSync('Package.swift'));out.push('podspec='+fs.readdirSync('.').filter(f=>f.endsWith('.podspec')).join(','));console.log(out.join('\n'))"`

!`find . -maxdepth 3 \( -path './example-app' -o -path './example' -o -path './ios' -o -path './android' \) -not -path './node_modules/*'`

## Procedure

1. **Inspect.** Read the snapshot, `android/build.gradle`, `android/gradle.properties`, the `.podspec`, `Package.swift`, and list native sources (`android/src/main`, `ios/Sources` or `ios/Plugin`). Note the example app path. Confirm the tree is clean (`git status`).
2. **Run the migrator** from the plugin root:
   ```bash
   npx @capacitor/plugin-migration-v8-to-v9@latest
   ```
   Review the diff (`git diff`). It covers most file edits, not API removals in your code.
3. **Dependencies** in `package.json`:
   - `devDependencies`: `@capacitor/cli`, `@capacitor/core`, `@capacitor/android`, `@capacitor/ios` -> `next`.
   - `peerDependencies["@capacitor/core"]`: `>=9.0.0-alpha.6` (check `npm view @capacitor/core dist-tags` for the current prerelease). Ask whether the release should still support 8; most plugins drop it because iOS 16 / AGP 9 build changes are not backward compatible.
4. **Build files** per `references/build-files.md` (gradle.properties, `build.gradle`, podspec, `Package.swift`). Keep both podspec and `Package.swift`: apps on CocoaPods and SPM both consume the plugin.
5. **Code API removals.** Grep, then fix each hit with `references/android-api-removals.md` and `references/ios-api-removals.md`. Do not leave deprecated call paths behind `#if` or reflection.
6. **Cordova optionality.** Remove the unconditional `.product(name: "Cordova", ...)` from `Package.swift`. If the plugin's native code imports Cordova compatibility classes (`com.getcapacitor.cordova.*`, `CDV*`) it will break in apps without Cordova plugins; ask the user how to replace it.
7. **UIScene lifecycle.** Every Capacitor 9 app is scene-based. Audit iOS code for AppDelegate-method assumptions, `tmpWindow`, `keyWindow` presentation, `applicationState` (see `capacitor-uiscene-migration` -> `references/plugin-audit.md`). Since the minimum is now 9, `.capacitorScene*` notifications and `SceneDelegateProxy` are safe to use.
8. **Example app and docs.** Upgrade the example app with `capacitor-app-upgrade-v8-to-v9`. Update README install/compat tables (Capacitor 9, iOS 16, minSdk 26).
9. **Verify** with `references/verification.md`. Bump the plugin major version.

## Traps

- AGP 9 defaults `android.uniquePackageNames=true`: a scaffold default namespace (`com.mycompany.plugins.example`) or a fork that kept the upstream namespace now fails the consuming app's build. Make it unique.
- `targetSdkVersion` in a library module has no runtime effect; delete it rather than bumping.
- `CapacitorUrlRequest.setRequestHeaders([String: Any])` sets values instead of appending; repeated header keys now overwrite.
- `Package.swift` must point at `capacitor-swift-pm` `from: "9.0.0-alpha.6"` or later (earlier alphas had Cordova-optionality crashes). Use the newest alpha.
- `googleMapsUtilsVersion` 5.0.0 carries upstream breaking API changes.
- Running `npx cap sync` from the plugin root does nothing useful; sync inside the example app.

## Error Handling

| Error | Fix |
|---|---|
| `cannot find symbol` ... `class NativePlugin` | `@CapacitorPlugin(name = ..., permissions = ...)` |
| `cannot find symbol` ... `method saveCall(PluginCall)` | `call.setKeepAlive(true)` or `bridge.saveCall(call)` |
| `cannot find symbol` ... `method pluginRequestPermission(...)` | `requestPermissionForAlias(alias, call, "callbackName")` + `@PermissionCallback` |
| `Cannot find 'CAPBridge' in scope` | `ApplicationDelegateProxy.shared` / `Notification.Name.capacitorStatusBarTapped` |
| `Value of type 'CAPBridgeProtocol' has no member 'getWebView'` | `bridge?.webView` (same pattern for other getters -> properties) |
| Duplicate or conflicting Kotlin plugin error under AGP 9 | Remove standalone Kotlin plugin and stdlib |
| Namespace collision / duplicate package in consuming app | Unique `namespace` in `android/build.gradle` |
| SPM resolution or link error mentioning `Cordova` in a consuming app | Remove the Cordova product dependency |

## References

Only load a reference when its topic is in play.

| File | Load when |
|---|---|
| `references/build-files.md` | Editing gradle.properties, `build.gradle`, podspec, `Package.swift`, wrapper |
| `references/android-api-removals.md` | Any Java/Kotlin compile error or grep hit |
| `references/ios-api-removals.md` | Any Swift/ObjC compile error or grep hit |
| `references/verification.md` | After edits: greps, builds, example-app checks, publish |

Related skills: `capacitor-plugin-upgrades`, `capacitor-app-upgrade-v8-to-v9`, `capacitor-uiscene-migration`, `capacitor-plugin-spm-support`.
