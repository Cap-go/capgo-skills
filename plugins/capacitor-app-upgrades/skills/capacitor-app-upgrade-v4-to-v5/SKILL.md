---
name: capacitor-app-upgrade-v4-to-v5
description: Upgrades a Capacitor app from v4 to v5 using `npx cap migrate` from `@capacitor/cli@latest-5`, then the manual checklist - Node 16+, Xcode 14.1+, Android Studio Flamingo with JDK 17, AGP 8.0.0, Gradle 8.0.2, compile/target SDK 33, `package` moved from AndroidManifest.xml to `namespace` in build.gradle, Jetifier removal, pinning `androidScheme` to `http`, and official plugin breaking changes (Device `uuid` to `identifier`, Android 13 notification permissions, READ_MEDIA_IMAGES). Use when `@capacitor/core` is 4.x and the target is 5.x, or on errors like "Namespace not specified" or "Android Gradle plugin requires Java 17". Do not use for other major versions, plugin library upgrades, or non-Capacitor apps.
allowed-tools:
  - Bash(node -e *)
---

# Capacitor App Upgrade v4 to v5

Move a Capacitor 4 app to Capacitor 5. Source of truth: https://capacitorjs.com/docs/updating/5-0

## When to Use

- `@capacitor/core` in the snapshot below is `4.x` and the user wants `5.x`.
- Android build fails after bumping to Capacitor 5 with `Namespace not specified`, a Java 11 vs 17 mismatch, or AGP 8 errors.
- The user asks for the exact 4 -> 5 checklist for iOS, Android, or official plugins.

Do not use:

- App on 5.x or later -> `capacitor-app-upgrade-v5-to-v6` (then v6-to-v7, v7-to-v8). Multi-hop planning -> `capacitor-app-upgrades`.
- Upgrading a plugin library -> `capacitor-plugin-upgrade-v4-to-v5`.
- App on 3.x -> upgrade to 4 first (`npx cap migrate` in 5.x refuses projects below 4).

## Live Project Snapshot

Current Capacitor packages from `package.json`:
!`node -e "const fs=require('fs');if(!fs.existsSync('package.json'))process.exit(0);const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));const out=[];for(const section of ['dependencies','devDependencies']){for(const [name,version] of Object.entries(pkg[section]||{})){if(name.startsWith('@capacitor/'))out.push(section+'.'+name+'='+version)}}console.log(out.sort().join('\n'))"`

## References

Only load a reference when its topic is in play.

| File | Load when |
| --- | --- |
| `references/android.md` | Editing `variables.gradle`, `build.gradle`, wrapper, manifest, or Kotlin by hand |
| `references/plugins.md` | The app uses official `@capacitor/*` plugins (Camera, Device, Push, Local Notifications, Google Maps, ...) |

## Preflight

Check and report before touching files. Ask the user to upgrade tooling if any minimum is missing.

| Tool | Minimum for Capacitor 5 |
| --- | --- |
| Node.js | 16+ (latest LTS recommended) |
| Xcode | 14.1+ |
| Android Studio | Flamingo 2022.2.1+ (bundles JDK 17) |
| Java (Gradle JDK) | 17 |
| AGP / Gradle | 8.0.0 / 8.0.2 |
| Android SDK | minSdk 22, compileSdk 33, targetSdk 33 |
| iOS deployment target | 13.0 (unchanged from v4) |

```bash
node -v
xcodebuild -version
java -version
git status --short   # start from a clean tree so the migration diff is reviewable
```

## Procedure

1. Confirm `@capacitor/core` is 4.x from the snapshot. If below 4, stop and route to a 3 -> 4 upgrade first.
2. Run the automated migration:

   ```bash
   npm i -D @capacitor/cli@latest-5
   npx cap migrate
   ```

   It bumps `@capacitor/*` packages, updates `variables.gradle`, AGP, the Gradle wrapper, moves `package` to `namespace`, trims the iOS app icon set, and runs `cap sync`. Read the output: every step it could not complete is printed and must be done by hand.
3. Review `git diff`. Then finish anything the CLI skipped:
   - **iOS**: in `ios/.gitignore` replace `App/Podfile.lock` with `App/output` (commit `Podfile.lock` from now on). Optionally reduce `AppIcon.appiconset` to a single 1024x1024 icon.
   - **Android**: apply the variable table and diffs in `references/android.md` (AGP 8.0.0, Gradle 8.0.2, google-services 4.3.15, `namespace`, Jetifier, Kotlin 1.8.20).
   - **Config**: if `server.androidScheme` is not set, add `androidScheme: "http"` to `capacitor.config.*`. Capacitor 6 flips the default to `https`, which changes the WebView origin and wipes localStorage, IndexedDB and cookies. Pinning now prevents data loss later. Ask the user before choosing `https` instead.
4. Update every official plugin to `^5.0.0` and community plugins to their Capacitor 5 release. Apply code changes from `references/plugins.md`.
5. In Android Studio, run `Tools -> AGP Upgrade Assistant` if the Gradle files still show AGP 7 leftovers.
6. Run verification below.

## Traps

- Removing `android.enableJetifier=true` breaks builds if any dependency still uses the old `android.support.*` libraries. Grep `node_modules` and native deps first; keep Jetifier if unsure.
- `namespace` must equal the old manifest `package` value, not the `applicationId` if they differ.
- Device plugin: `getId()` now returns `{ identifier }`; `uuid` is gone. On iOS 16+, `DeviceInfo.name` returns a generic name without the user-assigned-device-name entitlement.
- Android 13 (targetSdk 33): Push and Local Notifications need `checkPermissions()` / `requestPermissions()` at runtime or nothing is shown.

## Verification

```bash
grep -rn "package=" android/app/src/main/AndroidManifest.xml          # expect no package attribute
grep -n "namespace" android/app/build.gradle                          # expect namespace "<id>"
grep -n "gradle:8.0.0\|google-services" android/build.gradle
grep -n "distributionUrl" android/gradle/wrapper/gradle-wrapper.properties  # gradle-8.0.2
grep -n "SdkVersion" android/variables.gradle                         # 22 / 33 / 33
grep -rn "androidScheme" capacitor.config.*                           # explicit value present
grep -rn "\.uuid\b" src/                                              # no Device uuid leftovers
npx cap sync
cd android && ./gradlew assembleDebug
```

Then build iOS in Xcode 14.1+ (or `npx cap run ios`) and launch both platforms. Confirm stored data (login, localStorage) survived the upgrade.

## Error Handling

| Error | Fix |
| --- | --- |
| `Migrate can only be used on capacitor 4 and above, please use the CLI in Capacitor 4 to upgrade to 4 first` | Project is on 3.x. Upgrade to 4 first. |
| `Capacitor 5 requires JDK 17 or higher. Some steps may fail.` | Set Gradle JDK to 17 (Android Studio Settings -> Build Tools -> Gradle) and rerun. |
| `Unable to find <file>. Try updating it manually` | Apply the matching diff from `references/android.md`. |
| `Found namespace in build.gradle already, skipping migration` | Informational. Just confirm the manifest no longer has `package=`. |
| `Namespace not specified` (Gradle) | Add `namespace "<package id>"` to the `android {}` block of the failing module. For a third-party plugin, update it to its Capacitor 5 release. |
| `Android Gradle plugin requires Java 17 to run. You are currently using Java 11.` | Switch Gradle JDK to 17. |
| Data loss / logged out after upgrade on Android | `androidScheme` changed. Set it back to the scheme the installed app used (`http` for v4 defaults). |
