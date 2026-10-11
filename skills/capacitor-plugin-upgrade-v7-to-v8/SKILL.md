---
name: capacitor-plugin-upgrade-v7-to-v8
description: Upgrades a Capacitor plugin library from v7 to v8 using `npx @capacitor/plugin-migration-v7-to-v8@latest`, then the manual checklist - dev deps `^8.0.0` and peer `@capacitor/core` `>=8.0.0`, minSdk 24 and compile/target SDK 36 defaults, AndroidX dependency defaults, AGP 8.13.0, Gradle 8.14.3, Gradle `=` property assignment syntax, Java 21, Kotlin 2.2.20 (`kotlinOptions` to `compilerOptions`, no `kotlin-android-extensions`), google-services 4.4.4, iOS 15 in podspec and `Package.swift`, `capacitor-swift-pm` `from: "8.0.0"`, and the renamed `capacitor_bridge_layout_main` resource. Use when a plugin targets Capacitor 7 and must support 8, or on Kotlin 2 / Gradle space-assignment errors. Points to the v8-to-v9 next step. Do not use for app upgrades, other major versions, or non-Capacitor libraries.
allowed-tools:
  - Bash(node -e *)
  - Bash(find *)
---

# Capacitor Plugin Upgrade v7 to v8

Move a plugin library to Capacitor 8. Source of truth: https://capacitorjs.com/docs/updating/plugins/8-0

## When to Use

- Snapshot shows `@capacitor/core` 7.x and the plugin must work in Capacitor 8 apps.
- Building the plugin against Kotlin 2.2 fails on `kotlinOptions` or `kotlin-android-extensions`.
- Gradle warns `Properties should be assigned using the 'propName = value' syntax`.

Do not use:

- Upgrading an app -> `capacitor-app-upgrade-v7-to-v8`.
- Plugin on 6.x -> `capacitor-plugin-upgrade-v6-to-v7` first. Multi-hop -> `capacitor-plugin-upgrades`.
- Plugin already on 8.x -> `capacitor-plugin-upgrade-v8-to-v9`.
- Adding SPM -> `capacitor-plugin-spm-support`.

## Live Project Snapshot

Plugin and Capacitor package snapshot:
!`node -e "const fs=require('fs');if(!fs.existsSync('package.json'))process.exit(0);const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));const out=['package.name='+(pkg.name||''),'package.version='+(pkg.version||'')];for(const section of ['peerDependencies','dependencies','devDependencies']){for(const [name,version] of Object.entries(pkg[section]||{})){if(name.startsWith('@capacitor/'))out.push(section+'.'+name+'='+version)}}console.log(out.join('\n'))"`

Example and native project paths:
!`find . -maxdepth 3 \( -path './example-app' -o -path './ios' -o -path './android' \)`

## References

| File | Load when |
| --- | --- |
| `references/android.md` | Dependency defaults, SDK, AGP/Gradle, `=` syntax, Java 21, Kotlin 2.2 changes |
| `references/ios.md` | iOS 15 in podspec / `Package.swift` / old-structure project, `capacitor-swift-pm` 8 |

## Preflight

| Tool | Minimum |
| --- | --- |
| Node.js | 22+ |
| Xcode | 26.0+ |
| iOS deployment target | 15.0 |
| Java | 21 recommended (17+ supported by AGP 8.13) |
| AGP / Gradle | 8.13.0 / 8.14.3 |
| Android SDK defaults | minSdk 24, compileSdk 36, targetSdk 36 |
| Kotlin (if used) | 2.2.20 |

## Procedure

1. Confirm 7.x and a clean tree.
2. From the plugin root:

   ```bash
   npx @capacitor/plugin-migration-v7-to-v8@latest
   ```

   Review `git diff`.
3. **package.json**: dev deps `@capacitor/cli`, `core`, `android`, `ios` to `^8.0.0`; peer `@capacitor/core` to `>=8.0.0`.
4. **Android** per `references/android.md`:
   - Only add/update the `ext {}` dependency defaults the plugin actually uses.
   - SDK defaults 24/36/36, AGP 8.13.0, Gradle 8.14.3, google-services 4.4.4 (if used).
   - Convert every property assignment to `=` (`namespace = ...`, `compileSdk = ...`, `url = ...`, `abortOnError = ...`). Method calls such as `mavenCentral()` stay unchanged.
   - Java 21 `compileOptions`.
   - Kotlin plugins: `kotlin_version` 2.2.20, replace `kotlinOptions {}` with `kotlin { compilerOptions { jvmTarget = JvmTarget.JVM_21 } }`, drop `kotlin-android-extensions` (use `kotlin-parcelize` / view binding).
   - Code referencing `R.layout.bridge_layout_main` must use `capacitor_bridge_layout_main`.
5. **iOS** per `references/ios.md`: podspec `15.0`, `Package.swift` `.iOS(.v15)`, `capacitor-swift-pm` `from: "8.0.0"`. If the plugin posted `.capacitorViewDidAppear` / `.capacitorViewWillTransition` itself, remove that code; Capacitor 8 emits them.
6. Upgrade the example app via `capacitor-app-upgrade-v7-to-v8`, bump the plugin major, note "Requires Capacitor 8".

## After 8.x: next steps

- Capacitor 8.5 apps adopt the iOS UIScene lifecycle (required by Xcode 27). Plugins that hook AppDelegate methods (`application(_:open:options:)`, `continue userActivity`, `applicationDidBecomeActive`, ...) or use `UIApplication.shared.windows` / `keyWindow` must handle scene-based apps; see `capacitor-uiscene-migration`.
- Then `capacitor-plugin-upgrade-v8-to-v9` (Capacitor 9 is on `next`, not GA).

## Verification

```bash
grep -n "\"@capacitor/" package.json                                    # ^8.0.0 / >=8.0.0
grep -nE "^\s*(namespace|compileSdk|url|abortOnError|minSdkVersion|targetSdkVersion) [^=]" android/build.gradle   # expect none
grep -n "kotlinOptions\|kotlin-android-extensions" android/build.gradle # expect none
grep -n "VERSION_21\|gradle:8.13.0" android/build.gradle
grep -n "distributionUrl" android/gradle/wrapper/gradle-wrapper.properties   # gradle-8.14.3
grep -rn "bridge_layout_main" android/src | grep -v capacitor_bridge   # expect none
grep -n "deployment_target" *.podspec                                  # '15.0'
grep -n "iOS(\|capacitor-swift-pm" Package.swift 2>/dev/null           # .v15, from: "8.0.0"
npm run build
npm run verify         # if the repo has the template verify scripts
cd android && ./gradlew build --warning-mode all
```

Run the example app on both platforms.

## Error Handling

| Error | Fix |
| --- | --- |
| `Properties should be assigned using the 'propName = value' syntax` | Add `=` to the property assignment. |
| Kotlin: `kotlinOptions` deprecated / error under Kotlin 2.2 | Use `kotlin { compilerOptions { jvmTarget = JvmTarget.JVM_21 } }` with `import org.jetbrains.kotlin.gradle.dsl.JvmTarget`. |
| `Plugin [id: 'kotlin-android-extensions'] was not found` | Remove it; use `kotlin-parcelize` and view binding. |
| `Inconsistent JVM-target compatibility detected for tasks` | Make Java `compileOptions` and Kotlin `jvmTarget` the same version (21). |
| `cannot find symbol` on `R.layout.bridge_layout_main` | Use `capacitor_bridge_layout_main`. |
| SPM resolution picks Capacitor 7 | Set `capacitor-swift-pm` `from: "8.0.0"`. |
