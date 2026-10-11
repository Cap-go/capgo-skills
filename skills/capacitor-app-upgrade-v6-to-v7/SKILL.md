---
name: capacitor-app-upgrade-v6-to-v7
description: Upgrades a Capacitor app from v6 to v7 using `npx cap migrate` from `@capacitor/cli@latest-7`, then the manual checklist - Node 20+, Xcode 16+, iOS deployment target 14.0 (Xcode project and Podfile), Android Studio Ladybug with JDK 21, AGP 8.7.2, Gradle 8.11.1, minSdk 23, compile/target SDK 35, removed `bundledWebRuntime` and `cordova.staticPlugins` config, `navigation` in configChanges, and official plugin breaking changes (removed deprecated types like `AppUrlOpen`, `HapticsImpactStyle`, `DeviceBatteryInfo`; Device no longer returns disk sizes). Use when `@capacitor/core` is 6.x and the target is 7.x, or on errors like "Capacitor 7 requires JDK 21" or "Module 'X' has no exported member 'AppUrlOpen'". Do not use for other major versions, plugin library upgrades, or non-Capacitor apps.
allowed-tools:
  - Bash(node -e *)
---

# Capacitor App Upgrade v6 to v7

Move a Capacitor 6 app to Capacitor 7. Source of truth: https://capacitorjs.com/docs/updating/7-0

## When to Use

- `@capacitor/core` in the snapshot below is `6.x` and the user wants `7.x`.
- Build fails after bumping to 7 with JDK 21 / AGP 8.7 errors, iOS deployment target 13 errors, or TypeScript errors on removed deprecated plugin types.
- The user asks for the exact 6 -> 7 checklist.

Do not use:

- App on 5.x -> `capacitor-app-upgrade-v5-to-v6` first. On 7.x -> `capacitor-app-upgrade-v7-to-v8`. Multi-hop planning -> `capacitor-app-upgrades`.
- Plugin library upgrade -> `capacitor-plugin-upgrade-v6-to-v7`.
- CocoaPods to SPM -> `cocoapods-to-spm`.

## Live Project Snapshot

Current Capacitor packages from `package.json`:
!`node -e "const fs=require('fs');if(!fs.existsSync('package.json'))process.exit(0);const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));const out=[];for(const section of ['dependencies','devDependencies']){for(const [name,version] of Object.entries(pkg[section]||{})){if(name.startsWith('@capacitor/'))out.push(section+'.'+name+'='+version)}}console.log(out.sort().join('\n'))"`

## References

Only load a reference when its topic is in play.

| File | Load when |
| --- | --- |
| `references/android.md` | Editing `variables.gradle`, `build.gradle`, wrapper, manifest, or Kotlin by hand |
| `references/plugins.md` | The app uses official `@capacitor/*` plugins (App, Device, Haptics, Splash Screen, Status Bar, ...) |

## Preflight

| Tool | Minimum for Capacitor 7 |
| --- | --- |
| Node.js | 20+ (latest LTS recommended) |
| Xcode | 16.0+ |
| iOS deployment target | 14.0 |
| Android Studio | Ladybug 2024.2.1+ (bundles JDK 21) |
| Java (Gradle JDK) | 21 |
| AGP / Gradle | 8.7.2 / 8.11.1 |
| Android SDK | minSdk 23, compileSdk 35, targetSdk 35 |

```bash
node -v && xcodebuild -version && java -version
git status --short
grep -rn "bundledWebRuntime\|staticPlugins" capacitor.config.*
```

## Procedure

1. Confirm 6.x from the snapshot. Note: dropping minSdk to 23 and iOS to 14 removes support for older devices; tell the user.
2. Run the automated migration:

   ```bash
   npm i -D @capacitor/cli@latest-7
   npx cap migrate
   ```

   It bumps packages, raises the iOS deployment target and Podfile to 14.0, updates Gradle files and the wrapper, and runs `cap sync`. Finish every step it reports as skipped or failed.
3. **Config** (`capacitor.config.*`):
   - `bundledWebRuntime` is removed. `false` -> delete it. `true` -> the app must bundle `@capacitor/core` with a bundler (Vite, webpack, ...) instead of loading `capacitor.js`.
   - `cordova.staticPlugins` is removed. Cordova plugins that need static linking must use a `podspec` tag with `use-framework` (cordova-ios 7+ does not support the `framework` tag).
4. **iOS**: set **iOS Deployment Target = 14.0** on the Project and every Target in Build Settings, and `platform :ios, '14.0'` in `ios/App/Podfile`. For SPM apps, check `CapApp-SPM/Package.swift` platforms.
5. **Android**: apply `references/android.md` (AGP 8.7.2, Gradle 8.11.1, google-services 4.4.2, Kotlin 1.9.25, optional `navigation` in `configChanges`).
6. Update `@capacitor/*` plugins to `^7.0.0` and community plugins to their Capacitor 7 releases. Fix removed types per `references/plugins.md`.
7. Telemetry is opt-out for new CLI users; it never runs in CI. Disable with `npx cap telemetry off` if the user wants.
8. Run verification.

## Traps

- JDK 21 is required: Capacitor 7 Android modules compile with Java 21 source/target, so a JDK 17 Gradle runtime fails with `invalid source release: 21`. Fix the Gradle JDK (IDE and CI), not the code.
- Community plugins still declaring `minSdkVersion 22` or iOS 13 compile, but plugins that declare `@capacitor/core` peer `^6` cause npm `ERESOLVE`. Upgrade or replace them; avoid `--legacy-peer-deps` unless the user accepts the risk.
- Device `getInfo()` no longer returns `diskFree`, `diskTotal`, `realDiskFree`, `realDiskTotal`. Remove the matching `PrivacyInfo.xcprivacy` disk-space entries only if no other code reads disk space.

## Verification

```bash
grep -rn "bundledWebRuntime\|staticPlugins" capacitor.config.*         # expect none
grep -rn "IPHONEOS_DEPLOYMENT_TARGET" ios/App/App.xcodeproj/project.pbxproj | sort -u   # 14.0
grep -n "platform :ios" ios/App/Podfile 2>/dev/null                     # '14.0'
grep -n "gradle:8.7.2\|google-services:4.4.2" android/build.gradle
grep -n "distributionUrl" android/gradle/wrapper/gradle-wrapper.properties   # gradle-8.11.1
grep -n "SdkVersion" android/variables.gradle                           # 23 / 35 / 35
grep -rnE "AppUrlOpen|AppRestoredResult|DeviceBatteryInfo|DeviceLanguageCodeResult|Haptics(Impact|Notification)(Options|Type|Style)|SplashScreen(Show|Hide)Options|diskFree|diskTotal" src/
npx cap sync
cd android && ./gradlew assembleDebug
```

Then build iOS in Xcode 16+ and launch both platforms.

## Error Handling

| Error | Fix |
| --- | --- |
| `Migrate can only be used on Capacitor 6, please use the CLI in Capacitor 6 to upgrade to 6 first` | Run `capacitor-app-upgrade-v5-to-v6` first. |
| `Capacitor 7 requires JDK 21 or higher. Some steps may fail.` / `invalid source release: 21` | Set Gradle JDK to 21 (Android Studio Ladybug bundles it) and in CI. |
| `Skipped updating deployment target` | Set iOS 14.0 manually in Xcode and Podfile (step 4). |
| `Unable to find "<text>" in <file>. Try updating it manually` | Apply the diff from `references/android.md`. |
| `Module '"@capacitor/app"' has no exported member 'AppUrlOpen'` (or similar) | Rename to the replacement type in `references/plugins.md`. |
| `ERESOLVE unable to resolve dependency tree` on `@capacitor/core` | A plugin still peers on v6; upgrade it to its v7 release. |
