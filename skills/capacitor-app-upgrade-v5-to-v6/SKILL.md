---
name: capacitor-app-upgrade-v5-to-v6
description: Upgrades a Capacitor app from v5 to v6 using `npx cap migrate` from `@capacitor/cli@latest-6`, then the manual checklist - Node 18+, Xcode 15+, Android Studio Hedgehog, AGP 8.2.1, Gradle 8.2.1, compile/target SDK 34, `compileSdkVersion` to `compileSdk`, the `androidScheme` default flipping to `https` (data loss risk), iOS local plugins no longer auto-registered, iOS zoom disabled by default, and official plugin breaking changes (`addListener` returns only a Promise, Camera Photo Picker, Filesystem ctime/mtime numbers). Use when `@capacitor/core` is 5.x and the target is 6.x, or after the upgrade users are logged out on Android, a custom iOS plugin is "not implemented", or `addListener(...).remove` no longer compiles. Do not use for other major versions, plugin library upgrades, or non-Capacitor apps.
allowed-tools:
  - Bash(node -e *)
---

# Capacitor App Upgrade v5 to v6

Move a Capacitor 5 app to Capacitor 6. Source of truth: https://capacitorjs.com/docs/updating/6-0

## When to Use

- `@capacitor/core` in the snapshot below is `5.x` and the user wants `6.x`.
- After upgrading: Android users lose localStorage/cookies, a local (non-npm) iOS plugin reports `"<Name>" plugin is not implemented on ios`, pinch-zoom stopped working on iOS, or TypeScript errors around `addListener`.
- The user asks for the exact 5 -> 6 checklist.

Do not use:

- App on 4.x -> `capacitor-app-upgrade-v4-to-v5` first. On 6.x -> `capacitor-app-upgrade-v6-to-v7`. Multi-hop planning -> `capacitor-app-upgrades`.
- Plugin library upgrade -> `capacitor-plugin-upgrade-v5-to-v6`.
- Moving iOS from CocoaPods to SPM (experimental in 6) -> `cocoapods-to-spm`.

## Live Project Snapshot

Current Capacitor packages from `package.json`:
!`node -e "const fs=require('fs');if(!fs.existsSync('package.json'))process.exit(0);const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));const out=[];for(const section of ['dependencies','devDependencies']){for(const [name,version] of Object.entries(pkg[section]||{})){if(name.startsWith('@capacitor/'))out.push(section+'.'+name+'='+version)}}console.log(out.sort().join('\n'))"`

## References

Only load a reference when its topic is in play.

| File | Load when |
| --- | --- |
| `references/android.md` | Editing `variables.gradle`, `build.gradle`, wrapper, or Kotlin by hand |
| `references/plugins.md` | The app uses official `@capacitor/*` plugins or stores `addListener` results |

## Preflight

| Tool | Minimum for Capacitor 6 |
| --- | --- |
| Node.js | 18+ (latest LTS recommended) |
| Xcode | 15.0+ |
| Android Studio | Hedgehog 2023.1.1+ |
| Java (Gradle JDK) | 17 |
| AGP / Gradle | 8.2.1 / 8.2.1 |
| Android SDK | minSdk 22, compileSdk 34, targetSdk 34 |
| iOS deployment target | 13.0 (unchanged) |

```bash
node -v && xcodebuild -version && java -version
git status --short
grep -rn "androidScheme" capacitor.config.*   # decide the scheme BEFORE migrating
```

## Procedure

1. Confirm 5.x from the snapshot.
2. **Decide `androidScheme` first** (judgement call, ask the user if unclear). Capacitor 6 defaults existing apps to `https`. Changing scheme changes the WebView origin, so localStorage, IndexedDB, cookies and service workers from the installed app are no longer readable.
   - No `androidScheme` set today -> add `server: { androidScheme: "http" }` to keep user data.
   - Already `"https"` -> the entry can be removed.
3. Run the automated migration:

   ```bash
   npm i -D @capacitor/cli@latest-6
   npx cap migrate
   ```

   Read the output and finish every step it reports as failed.
4. **iOS**:
   - Plugin classes are no longer auto-registered. npm plugins are handled by the CLI-generated list. Local plugins written in the app target (custom code guide) need a `CAPBridgeViewController` subclass that overrides `capacitorDidLoad()` and calls `bridge?.registerPluginInstance(MyPlugin())`, and `Main.storyboard` must use that subclass as the view controller's custom class.
   - Zoom is disabled by default. If the app relied on pinch zoom, set `zoomEnabled: true` in the Capacitor config.
5. **Android**: apply `references/android.md` (AGP 8.2.1, Gradle 8.2.1, google-services 4.4.0, `compileSdk`, Kotlin 1.9.10).
6. Update all `@capacitor/*` plugins to `^6.0.0` and community plugins to their Capacitor 6 releases. Fix code per `references/plugins.md`.
7. Run verification.

## Traps

- `addListener` now returns only `Promise<PluginListenerHandle>`. `const h = Plugin.addListener(...); h.remove()` no longer compiles; use `const h = await Plugin.addListener(...)`.
- Camera now uses the Android Photo Picker. Gallery cancel rejects with `"User cancelled photos app"` on Android, like other platforms; update error matching.
- Filesystem `stat()` on iOS returns `ctime` / `mtime` as numbers, not strings.
- Do not remove `READ_MEDIA_IMAGES` / storage permissions if `saveToGallery: true` or another plugin needs them.

## Verification

```bash
grep -rn "androidScheme" capacitor.config.*                 # explicit decision recorded
grep -n "compileSdkVersion rootProject" android/app/build.gradle   # expect none (now compileSdk)
grep -n "gradle:8.2.1\|google-services:4.4.0" android/build.gradle
grep -n "distributionUrl" android/gradle/wrapper/gradle-wrapper.properties   # gradle-8.2.1
grep -n "SdkVersion" android/variables.gradle                # 22 / 34 / 34
grep -rnE "= *[A-Za-z]+\.addListener\(" src/                 # each must be awaited
grep -rn "registerPluginInstance" ios/App/App/               # present if the app has local plugins
npx cap sync
cd android && ./gradlew assembleDebug
```

Build and launch iOS in Xcode 15+. On a device that had the v5 build installed, upgrade in place and confirm login/localStorage survived.

## Error Handling

| Error | Fix |
| --- | --- |
| `Migrate can only be used on capacitor 5 and above, please use the CLI in Capacitor 5 to upgrade to 5 first` | Run `capacitor-app-upgrade-v4-to-v5` first. |
| `Capacitor 6 requires JDK 17 or higher. Some steps may fail.` | Set Gradle JDK to 17+. |
| `Unable to find "<text>" in <file>. Try updating it manually` | Apply the diff from `references/android.md`. |
| `"<Plugin>" plugin is not implemented on ios` (local plugin) | Register it in a `CAPBridgeViewController` subclass (step 4). |
| `Property 'remove' does not exist on type 'Promise<PluginListenerHandle>'` | `await` the `addListener` call. |
| Users logged out / data gone on Android | Scheme changed. Restore the previous `androidScheme` value. |
