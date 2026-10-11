---
name: capacitor-plugin-upgrade-v6-to-v7
description: Upgrades a Capacitor plugin library from v6 to v7 using `npx @capacitor/plugin-migration-v6-to-v7@latest`, then the manual checklist - dev deps `^7.0.0` and peer `@capacitor/core` `>=7.0.0`, tooling bumps (eslint, swiftlint, prettier 3 with prettier-plugin-java, rollup 4 with `rollup.config.mjs`, rimraf 6, docgen 0.3), minSdk 23 and compile/target SDK 35 defaults, AGP 8.7.2, Gradle 8.11.1, Java 21, Kotlin 1.9.25, iOS 14 in podspec and `Package.swift`, pinned `capacitor-swift-pm` `from: "7.0.0"`, plus removed APIs - `call.success()` / `call.error()` (use `resolve` / `reject`), `registerWebPlugin`, `Capacitor.platform` / `isNative`, Android `BridgeFragment`. Use when a plugin targets Capacitor 6 and must support 7. Do not use for app upgrades, other major versions, or non-Capacitor libraries.
allowed-tools:
  - Bash(node -e *)
  - Bash(find *)
---

# Capacitor Plugin Upgrade v6 to v7

Move a plugin library to Capacitor 7. Source of truth: https://capacitorjs.com/docs/updating/plugins/7-0

## When to Use

- Snapshot shows `@capacitor/core` 6.x and the plugin must work in Capacitor 7 apps.
- Plugin code still calls `call.success()`, `call.error()`, `registerWebPlugin`, `Capacitor.platform`, `Capacitor.isNative`, or uses `BridgeFragment`.
- `Package.swift` points `capacitor-swift-pm` at `branch: "main"`.

Do not use:

- Upgrading an app -> `capacitor-app-upgrade-v6-to-v7`.
- Plugin on 5.x -> `capacitor-plugin-upgrade-v5-to-v6` first; on 7.x -> `capacitor-plugin-upgrade-v7-to-v8`. Multi-hop -> `capacitor-plugin-upgrades`.
- Adding SPM from scratch -> `capacitor-plugin-spm-support`.

## Live Project Snapshot

Plugin and Capacitor package snapshot:
!`node -e "const fs=require('fs');if(!fs.existsSync('package.json'))process.exit(0);const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));const out=['package.name='+(pkg.name||''),'package.version='+(pkg.version||'')];for(const section of ['peerDependencies','dependencies','devDependencies']){for(const [name,version] of Object.entries(pkg[section]||{})){if(name.startsWith('@capacitor/'))out.push(section+'.'+name+'='+version)}}console.log(out.join('\n'))"`

Example and native project paths:
!`find . -maxdepth 3 \( -path './example-app' -o -path './ios' -o -path './android' \)`

## References

| File | Load when |
| --- | --- |
| `references/android.md` | Applying Gradle, Java, or Kotlin changes by hand |
| `references/ios.md` | Raising the iOS target in podspec / `Package.swift` / old-structure Xcode project, pinning `capacitor-swift-pm` |
| `references/tooling.md` | Updating eslint, swiftlint, prettier, rollup, rimraf, docgen |

## Preflight

| Tool | Minimum |
| --- | --- |
| Node.js | 20+ |
| Xcode | 16.0+ |
| iOS deployment target | 14.0 |
| Java | 21 |
| AGP / Gradle | 8.7.2 / 8.11.1 |
| Android SDK defaults | minSdk 23, compileSdk 35, targetSdk 35 |

## Procedure

1. Confirm 6.x and a clean tree.
2. From the plugin root:

   ```bash
   npx @capacitor/plugin-migration-v6-to-v7@latest
   ```

   Review `git diff`.
3. **package.json**: dev deps `@capacitor/cli`, `core`, `android`, `ios` to `^7.0.0`; peer `@capacitor/core` to `>=7.0.0`. Tooling per `references/tooling.md` (note the `rollup.config.js` -> `rollup.config.mjs` rename and the `--plugin=prettier-plugin-java` script flag).
4. **Android** per `references/android.md`: SDK defaults 23/35/35, AGP 8.7.2, Gradle 8.11.1, Java 21, Kotlin 1.9.25.
5. **iOS** per `references/ios.md`: podspec `s.ios.deployment_target = '14.0'`, `Package.swift` `.iOS(.v14)`, `capacitor-swift-pm` `from: "7.0.0"` instead of `branch: "main"`.
6. **Removed APIs** - search and replace:
   - `call.success(...)` -> `call.resolve(...)`; `call.error(...)` -> `call.reject(...)` (Java/Kotlin and Swift).
   - `registerWebPlugin` and other v2-era definitions are gone; use `registerPlugin` (see the Capacitor 3 plugin upgrade guide).
   - `Capacitor.platform` -> `Capacitor.getPlatform()`; `Capacitor.isNative` -> `Capacitor.isNativePlatform()`.
   - Android `BridgeFragment` is removed. If the plugin presents a fragment through it, copy the needed logic into a plugin-owned `Fragment` class.
7. Upgrade the example app via `capacitor-app-upgrade-v6-to-v7`, bump the plugin major, note "Requires Capacitor 7".

## Verification

```bash
grep -n "\"@capacitor/\|rollup\|prettier\"" package.json
grep -rnE "\.success\(|\.error\(" android/src/main ios/ 2>/dev/null | grep -i call     # expect none
grep -rnE "registerWebPlugin|Capacitor\.platform\b|Capacitor\.isNative\b|BridgeFragment" src/ android/ ios/   # expect none
grep -n "deployment_target" *.podspec                       # '14.0'
grep -n "iOS(\|capacitor-swift-pm" Package.swift 2>/dev/null    # .v14, from: "7.0.0"
grep -n "VERSION_21\|gradle:8.7.2\|: 35\|: 23" android/build.gradle
npm run build
npm run verify        # if the repo has the template verify scripts
```

Run the example app on both platforms.

## Error Handling

| Error | Fix |
| --- | --- |
| `cannot find symbol ... success(` / `error(` on `PluginCall` | Use `resolve` / `reject`. |
| `invalid source release: 21` | Gradle JDK must be 21. |
| SPM: target `requires minimum platform version` higher than the plugin declares | Set `platforms: [.iOS(.v14)]` in `Package.swift` and pin `capacitor-swift-pm` `from: "7.0.0"`. |
| Rollup 4 fails to load `rollup.config.js` (ESM config) | Rename to `rollup.config.mjs` and update the `build` script. |
| `Property 'platform' does not exist on type 'CapacitorGlobal'` | Use `Capacitor.getPlatform()`. |
