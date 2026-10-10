---
name: capacitor-plugin-upgrade-v4-to-v5
description: Upgrades a Capacitor plugin library from v4 to v5 using `npx @capacitor/plugin-migration-v4-to-v5@latest`, then the manual checklist - `@capacitor/*` dev deps to `latest-5`, compile/target SDK 33 defaults, AGP 8.0.0, Gradle 8.0.2, `namespace` in build.gradle instead of manifest `package`, Java 17, Jetifier removal, Kotlin 1.8.20 with `kotlin-stdlib`, plus code changes - `CAPBridgedPlugin` requirements moved to instance level (`pluginId` -> `identifier`, `pluginMethods` typed `[CAPPluginMethod]`) and Android `PluginCall.getObject()` / `getArray()` may return null. Use when a plugin's peer dependency is Capacitor 4 and it must support 5, or apps on v5 fail with "Namespace not specified" in the plugin module. Do not use for app upgrades, other major versions, or non-Capacitor libraries.
allowed-tools:
  - Bash(node -e *)
  - Bash(find *)
---

# Capacitor Plugin Upgrade v4 to v5

Move a plugin library to Capacitor 5. Source of truth: https://capacitorjs.com/docs/updating/plugins/5-0

## When to Use

- Snapshot shows `@capacitor/core` 4.x in peer/dev deps and the plugin must work in Capacitor 5 apps.
- A Capacitor 5 app fails building this plugin with `Namespace not specified` or Java 17 errors.
- The plugin manually conforms to `CAPBridgedPlugin` or calls `getObject()` / `getArray()`.

Do not use:

- Upgrading an app -> `capacitor-app-upgrade-v4-to-v5`.
- Plugin already on 5 -> `capacitor-plugin-upgrade-v5-to-v6`. Multi-hop -> `capacitor-plugin-upgrades`.

## Live Project Snapshot

Plugin and Capacitor package snapshot:
!`node -e "const fs=require('fs');if(!fs.existsSync('package.json'))process.exit(0);const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));const out=['package.name='+(pkg.name||''),'package.version='+(pkg.version||'')];for(const section of ['peerDependencies','dependencies','devDependencies']){for(const [name,version] of Object.entries(pkg[section]||{})){if(name.startsWith('@capacitor/'))out.push(section+'.'+name+'='+version)}}console.log(out.join('\n'))"`

Example and native project paths:
!`find . -maxdepth 3 \( -path './example-app' -o -path './ios' -o -path './android' \)`

## References

| File | Load when |
| --- | --- |
| `references/android.md` | Applying Gradle, manifest, Java or Kotlin changes by hand |

## Preflight

| Tool | Minimum |
| --- | --- |
| Node.js | 16+ |
| Xcode | 14.1+ |
| Java | 17 (AGP 8) |
| AGP / Gradle | 8.0.0 / 8.0.2 |
| Android SDK defaults | compileSdk 33, targetSdk 33, minSdk 22 |
| iOS deployment target | 13.0 (unchanged) |

## Procedure

1. Confirm the plugin is on 4.x from the snapshot and the tree is clean (`git status`).
2. From the plugin root run:

   ```bash
   npx @capacitor/plugin-migration-v4-to-v5@latest
   ```

   It edits `package.json`, `android/build.gradle`, the wrapper, `gradle.properties`, and the manifest. Review `git diff`.
3. Finish manually anything not applied (`references/android.md`):
   - `@capacitor/cli`, `core`, `android`, `ios` dev deps to `latest-5`; peer `@capacitor/core` to `^5.0.0`.
   - SDK defaults 33, AGP 8.0.0, Gradle 8.0.2, `namespace` in `android {}` and no `package=` in the manifest, Java 17, Jetifier removed, Kotlin 1.8.20 with `kotlin-stdlib`.
4. **iOS code**: if the plugin conforms to `CAPBridgedPlugin` manually (no `CAP_PLUGIN` macro), move requirements to instance level, rename `pluginId` to `identifier`, type `pluginMethods` as `[CAPPluginMethod]`, and drop `getMethod(_:)`. Macro-based plugins need no change.
5. **Android code**: `call.getObject(key)` and `call.getArray(key)` can now return `null`. Add null checks and `call.reject(...)` with a clear message when required.
6. Update the example app (if present) to Capacitor 5 via `capacitor-app-upgrade-v4-to-v5`.
7. Bump the plugin major version and note "Requires Capacitor 5" in the changelog/README.

## Verification

```bash
grep -n "\"@capacitor/" package.json                         # 5.x everywhere
grep -n "package=" android/src/main/AndroidManifest.xml      # expect none
grep -n "namespace\|VERSION_17\|gradle:8.0.0" android/build.gradle
grep -rn "kotlin-stdlib-jdk" android/build.gradle            # expect none
grep -rn "getObject(\|getArray(" android/src/main/           # each result null-checked
grep -rn "pluginId\b" ios/                                   # only CAPPlugin usages remain
npm run build
npm run verify        # plugin template script: verify:ios + verify:android + verify:web, if present
cd android && ./gradlew clean build test
```

Run the example app on both platforms and exercise every method.

## Error Handling

| Error | Fix |
| --- | --- |
| `Namespace not specified` | Add `namespace "<package>"` to `android {}` in the plugin `build.gradle`. |
| `Android Gradle plugin requires Java 17 to run` | Switch the Gradle JDK to 17. |
| `NullPointerException` from `getObject`/`getArray` | Add null checks (step 5). |
| Swift: type does not conform to protocol `CAPBridgedPlugin` | Use instance-level `identifier`, `jsName`, `pluginMethods`, or switch to the macro. |
| `Duplicate class ... kotlin-stdlib-jdk8` | Replace `kotlin-stdlib-jdk7/jdk8` with `kotlin-stdlib`. |
