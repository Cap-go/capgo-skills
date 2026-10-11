---
name: capacitor-app-upgrade-v7-to-v8
description: Upgrades a Capacitor app from v7 to v8 using `npx cap migrate` from `@capacitor/cli@latest`, then the manual checklist - Node 22+, Xcode 26+, iOS deployment target 15.0, Android Studio Otter, AGP 8.13.0, Gradle 8.14.3, JDK 21, minSdk 24, compile/target SDK 36, Kotlin 2.2.20, Gradle `=` property assignment syntax, `density` in configChanges, removed `android.adjustMarginsForEdgeToEdge` (use the System Bars plugin and CSS env vars), `bridge_layout_main.xml` renamed, iOS `appendUserAgent` whitespace fix, and official plugin changes (Geolocation timeout, Screen Orientation/Barcode Scanner on Android 16 large screens). Use when `@capacitor/core` is 7.x and the target is 8.x. Points to the 8.5 UIScene adoption and v9 next steps. Do not use for other major versions, plugin library upgrades, or non-Capacitor apps.
allowed-tools:
  - Bash(node -e *)
---

# Capacitor App Upgrade v7 to v8

Move a Capacitor 7 app to Capacitor 8 (current stable line: 8.5.x). Source of truth: https://capacitorjs.com/docs/updating/8-0

## When to Use

- `@capacitor/core` in the snapshot below is `7.x` and the user wants `8.x`.
- After bumping to 8: content under the Android status/navigation bar (edge-to-edge), `bridge_layout_main` not found, Gradle "space-assignment syntax" deprecation warnings, Kotlin 2 `kotlinOptions` errors, or Geolocation timeouts.
- The user asks for the exact 7 -> 8 checklist.

Do not use:

- App on 6.x -> `capacitor-app-upgrade-v6-to-v7` first. Multi-hop planning -> `capacitor-app-upgrades`.
- App already on 8.x -> `capacitor-uiscene-migration` (8.5 scene lifecycle), then `capacitor-app-upgrade-v8-to-v9`.
- Plugin library upgrade -> `capacitor-plugin-upgrade-v7-to-v8`.
- CocoaPods to SPM -> `cocoapods-to-spm`.

## Live Project Snapshot

Current Capacitor packages from `package.json`:
!`node -e "const fs=require('fs');if(!fs.existsSync('package.json'))process.exit(0);const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));const out=[];for(const section of ['dependencies','devDependencies']){for(const [name,version] of Object.entries(pkg[section]||{})){if(name.startsWith('@capacitor/'))out.push(section+'.'+name+'='+version)}}console.log(out.sort().join('\n'))"`

## References

Only load a reference when its topic is in play.

| File | Load when |
| --- | --- |
| `references/android.md` | Editing `variables.gradle`, Gradle syntax, wrapper, manifest, Kotlin, or edge-to-edge |
| `references/plugins.md` | The app uses official `@capacitor/*` plugins (Geolocation, Screen Orientation, Barcode Scanner, Status Bar, ...) |

## Preflight

| Tool | Minimum for Capacitor 8 |
| --- | --- |
| Node.js | 22+ (latest LTS recommended) |
| Xcode | 26.0+ |
| iOS deployment target | 15.0 |
| Android Studio | Otter 2025.2.1+ |
| Java (Gradle JDK) | 21 |
| AGP / Gradle | 8.13.0 / 8.14.3 |
| Android SDK | minSdk 24, compileSdk 36, targetSdk 36 |
| Kotlin (if used) | 2.2.20 |

```bash
node -v && xcodebuild -version && java -version
git status --short
grep -rn "adjustMarginsForEdgeToEdge\|appendUserAgent" capacitor.config.*
grep -rn "bridge_layout_main" android/ src/ 2>/dev/null
```

## Procedure

1. Confirm 7.x from the snapshot. Tell the user minSdk 24 and iOS 15 drop older devices.
2. Run the automated migration (`latest` resolves to the newest 8.x):

   ```bash
   npm i -D @capacitor/cli@latest
   npx cap migrate            # add --noprompt in CI, --packagemanager pnpm|yarn if not npm
   ```

   It installs `^8.0.0` packages, raises the iOS target / Podfile to 15.0, runs `cap sync`, adds `density` to `configChanges`, upgrades the Gradle wrapper and Gradle files, and writes breaking changes. Finish every step it reports as failed; it ends with `Migration to Capacitor <v> is complete` or `... is incomplete. Check the log messages for more information.`
3. **Config** (`capacitor.config.*`):
   - `android.adjustMarginsForEdgeToEdge` is removed. Remove it, then handle insets with the System Bars core plugin and CSS `env(safe-area-inset-*)` (see `references/android.md`, and `safe-area-handling`).
   - iOS `appendUserAgent` no longer adds two extra spaces. If a server parses the old UA, add a leading space on `ios.appendUserAgent` only (not the root key, which also affects Android).
4. **iOS**:
   - Set **iOS Deployment Target = 15.0** on the Project and every Target; `platform :ios, '15.0'` in the Podfile (CocoaPods projects).
   - Capacitor now emits `CAPBridgeViewController` notifications for `viewDidAppear` and `viewWillTransition`. Delete any app extension that posted them itself, or listeners fire twice.
5. **Android**: apply `references/android.md` (variables, `=` assignment syntax, AGP 8.13.0, Gradle 8.14.3, google-services 4.4.4, Kotlin 2.2.20, `density`). Rename any `bridge_layout_main` reference to `capacitor_bridge_layout_main`.
6. Update `@capacitor/*` plugins to `^8.0.0` and community plugins to their v8 releases. Apply `references/plugins.md`.
7. CLI note: `npx cap add ios` now generates an SPM project. Existing CocoaPods apps are unaffected; to keep Pods on re-add use `npx cap add ios --packagemanager CocoaPods`. CocoaPods Trunk becomes read-only (expected Dec 2, 2026), so recommend `cocoapods-to-spm` after the upgrade.
8. Run verification.

## After 8.x: next required steps

- Xcode 27 requires the iOS UIScene lifecycle. Capacitor 8.5 adopted it (SceneDelegate, `UIApplicationSceneManifest`). After this upgrade, run skill `capacitor-uiscene-migration` before building with Xcode 27. Once scenes are adopted, AppDelegate `application(_:open:options:)`, `continue userActivity`, and foreground/background lifecycle callbacks stop firing; deep links and custom AppDelegate code must move to the scene delegate.
- Then `capacitor-app-upgrade-v8-to-v9` (Capacitor 9 is on the `next` tag, not GA yet).

## Verification

```bash
grep -rn "adjustMarginsForEdgeToEdge\|bundledWebRuntime" capacitor.config.*   # expect none
grep -rn "bridge_layout_main" android/app/src src/ | grep -v capacitor_bridge   # expect none
grep -rn "IPHONEOS_DEPLOYMENT_TARGET" ios/App/App.xcodeproj/project.pbxproj | sort -u   # 15.0
grep -n "gradle:8.13.0\|google-services:4.4.4" android/build.gradle
grep -n "distributionUrl" android/gradle/wrapper/gradle-wrapper.properties    # gradle-8.14.3
grep -n "SdkVersion" android/variables.gradle                                 # 24 / 36 / 36
grep -nE "^\s*(namespace|compileSdk|ignoreAssetsPattern) [^=]" android/app/build.gradle   # expect none
grep -n "configChanges" android/app/src/main/AndroidManifest.xml              # includes density
npx cap sync
cd android && ./gradlew assembleDebug --warning-mode all
```

Build iOS in Xcode 26+ and run on device. On Android 15+/16 check that content is not under the status or navigation bar.

## Error Handling

| Error | Fix |
| --- | --- |
| `Migrate can only be used on Capacitor 7, please use the CLI in Capacitor 7 to upgrade to 7 first` | Run `capacitor-app-upgrade-v6-to-v7` first. |
| `Capacitor 8 requires JDK 21 or higher. Some steps may fail.` | Set Gradle JDK to 21. |
| `Unable to add 'density' to 'android:configChanges' in <file>. Try adding it manually` | Add `|density` to the main activity `configChanges`. |
| `gradle wrapper files were not updated` | Edit `distributionUrl` to `gradle-8.14.3-all.zip`, then `cd android && ./gradlew wrapper`. |
| `Unable to find "<text>" in <file>. Try updating it manually` | Apply the diff from `references/android.md`. |
| `Properties should be assigned using the 'propName = value' syntax` (Gradle deprecation) | Add `=` to property assignments. |
| `cannot find symbol` on `R.layout.bridge_layout_main` (or AAPT `resource layout/bridge_layout_main ... not found`) | Use `capacitor_bridge_layout_main`. |
| Kotlin: `kotlinOptions` / `kotlin-android-extensions` errors | Move to `kotlin { compilerOptions { jvmTarget = JvmTarget.JVM_21 } }`; replace synthetics with view binding, parcelize with `kotlin-parcelize`. |
