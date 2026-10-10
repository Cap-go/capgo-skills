---
name: capacitor-best-practices
description: Review and set up Capacitor apps against current best practices (Capacitor 8.5 stable, 9 alpha via `@next`). Use for a Capacitor codebase review, `capacitor.config.ts` audit, new project setup, aligning `@capacitor/core`/`cli`/`ios`/`android` and plugin majors, plugin patterns (availability checks, `checkPermissions`/`requestPermissions`, error `code` handling, web fallbacks), or release prep; or on `"<Plugin>" plugin is not implemented on ios`, `Could not find the web assets directory`, `platform has not been added yet`, a dev `server.url` shipped to production, lost edits in `android/app/src/main/assets/public`, SPM vs CocoaPods, or AppDelegate/UIScene drift. Do not use for security audits (capacitor-security), performance (capacitor-performance), tests (capacitor-testing), crashes (debugging-capacitor), major upgrades (capacitor-app-upgrades), SPM migration (cocoapods-to-spm), UIScene adoption (capacitor-uiscene-migration), or live updates (capgo-live-updates).
---

# Capacitor Best Practices

Review a Capacitor app for structural mistakes that cause broken builds, lost edits, production leaks, and plugin crashes. Route deep topics to the sibling skill that owns them.

## When to Use

TRIGGER when:
- The user asks for a general code/architecture review of a Capacitor or Ionic + Capacitor app.
- Setting up a new Capacitor project or adding iOS/Android to an existing web app.
- `capacitor.config.ts|json` review: `webDir`, `server.url`, `cleartext`, plugin config, env-specific config.
- Version drift between `@capacitor/core`, `@capacitor/cli`, `@capacitor/ios`, `@capacitor/android`, or plugin majors that do not match Capacitor's major.
- Plugin usage review: missing `npx cap sync`, no availability check, no permission flow, matching on error message strings.
- Errors such as `"<Plugin>" plugin is not implemented on ios`, `Could not find the web assets directory`, `ios platform has not been added yet`.
- Pre-release sanity checklist across config, native projects, and live updates.

Do not use:
- Security audit, secrets, storage, pinning, CSP -> `capacitor-security`; Xcode hardening -> `capacitor-ios-security-hardening`.
- Bundle size, startup time, memory, bridge profiling -> `capacitor-performance`.
- Unit/E2E test setup and plugin mocking -> `capacitor-testing`.
- Crashes, white screen, native logs -> `debugging-capacitor`, `ios-android-logs`.
- Major upgrades -> `capacitor-app-upgrades` (8 -> 9: `capacitor-app-upgrade-v8-to-v9`).
- CocoaPods -> SPM -> `cocoapods-to-spm`; UIScene adoption -> `capacitor-uiscene-migration`.
- Finding or installing a specific plugin -> `capacitor-plugins`.
- Store submission and review -> `capacitor-app-store`, `capacitor-apple-review-preflight`; CI -> `capacitor-ci-cd`; live updates -> `capgo-live-updates`.

## Current baseline (October 2026)

| | Capacitor 8 (stable, `latest` 8.5.x) | Capacitor 9 (`next`, alpha) |
|---|---|---|
| Node | 22+ | 24+ |
| iOS min / Xcode | iOS 15 / Xcode 26 (8.5 adopts UIScene so Xcode 27 builds work) | iOS 16 / Xcode 27+ |
| Android | minSdk 24, compile/target 36, AGP 8.13, Gradle 8.14.3 | minSdk 26, compile/target 37, AGP 9.2.1, Gradle 9.5.1 |
| iOS deps | SPM default for new projects | SPM default |

CocoaPods Trunk is expected to go read-only on December 2, 2026. Recommend SPM for every app still on CocoaPods. Install Capacitor 9 only with `@next` until it reaches GA, and do not recommend it for production apps.

## Review workflow

1. **Inventory (read-only).**
   ```bash
   npx cap doctor          # installed vs latest Capacitor packages
   npx cap ls              # plugins Capacitor detects per platform
   cat capacitor.config.ts 2>/dev/null || cat capacitor.config.json
   ls ios/App/Podfile ios/App/CapApp-SPM 2>/dev/null   # CocoaPods or SPM
   grep -nE "minSdkVersion|compileSdkVersion|targetSdkVersion" android/variables.gradle
   ```
2. **For large codebases, write a TODO list** of areas (config, versions, plugins, native iOS, native Android, live updates, release) and review one at a time.
3. **Report findings before editing**, grouped by severity, each with file:line and the fix. Ask before invasive changes (upgrading a major, migrating to SPM, enabling R8, changing `appId`).
4. **Fix**, loading the matching reference.
5. **Run Verification.**

## Rules that matter most

1. **Keep Capacitor packages on one version.** `@capacitor/core`, `cli`, `ios`, `android` must match. Plugin majors must match the Capacitor major (official and `@capgo/*` plugins follow it: v8 plugins for Capacitor 8).
2. **`npx cap sync` after every plugin install/removal and every config change.** Missing sync produces `"<Plugin>" plugin is not implemented on <platform>`.
3. **Never edit generated web assets.** `android/app/src/main/assets/public/` and `ios/App/App/public/` are overwritten by `cap copy`/`sync`. Edit `src/` and rebuild.
4. **Commit `ios/` and `android/`.** They are source code with your native customizations, not build output. Do commit `capacitor.config.*`; do not commit `node_modules`, `Pods/`, build dirs.
5. **No dev settings in release config.** `server.url`, `server.cleartext`, `allowNavigation` to dev hosts, `webContentsDebuggingEnabled: true`. Gate them on an env var (see references/config-and-project.md). On Capacitor 9, use `npx cap run <platform> --url <dev-url>` for live reload.
6. **Feature-detect before calling plugins.** `Capacitor.isNativePlatform()`, `Capacitor.getPlatform()`, `Capacitor.isPluginAvailable('Name')`. Provide a web fallback or hide the feature.
7. **Use the permission API.** Call `checkPermissions()` then `requestPermissions()` for official plugins that expose them, and handle `denied` with a path to Settings. Add the matching `NS*UsageDescription` keys / Android permissions.
8. **Branch on `error.code`, not `error.message`.** Messages change between versions and platforms. Official plugins expose structured codes (for example `OS-PLUG-CAMR-0006` for a cancelled camera capture in `@capacitor/camera` 8.1+ new APIs); Capacitor core uses `UNIMPLEMENTED` / `UNAVAILABLE`.
9. **Move large binary data as files, not base64.** Pass file paths/URIs across the bridge and render with `Capacitor.convertFileSrc()`.
10. **iOS lifecycle is scene-based from Capacitor 8.5.** After adopting UIScene, AppDelegate `application(_:open:options:)`, `continue userActivity`, and foreground/background callbacks stop firing. Move custom native code to `SceneDelegate` (`capacitor-uiscene-migration`). Avoid `UIScreen.main` and idiom-based layout for resizable windows.
11. **Live updates: call `CapacitorUpdater.notifyAppReady()` on every launch**, and apply manual updates with `next()` (on background/relaunch) rather than `set()` mid-session. Details in `capgo-live-updates`.
12. **Secrets never go in the app.** Anything in the bundle or `capacitor.config` is extractable. Hand off to `capacitor-security` for anything beyond this rule.

## References

Only load a reference when its topic is in play.

| Reference | Load when |
|-----------|-----------|
| [references/config-and-project.md](references/config-and-project.md) | Reviewing `capacitor.config`, env-specific builds, repo layout, `.gitignore`, version alignment |
| [references/plugins.md](references/plugins.md) | Plugin install/sync, availability checks, permissions, error codes, web fallbacks, lazy loading, mocking |
| [references/native-projects.md](references/native-projects.md) | iOS SPM vs CocoaPods, UIScene, deployment targets; Android `variables.gradle`, R8, Capacitor 9 Gradle changes |
| [references/release-checklist.md](references/release-checklist.md) | Preparing a release build or reviewing release readiness |

## Verification

```bash
# Versions aligned (all @capacitor/* core packages show the same version)
npm ls @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android
npx cap doctor

# Web build exists where webDir points, then sync succeeds without errors
npm run build && npx cap sync

# No dev server or debug flags in the synced native config
grep -nE "\"url\"|cleartext|webContentsDebuggingEnabled" \
  android/app/src/main/assets/capacitor.config.json ios/App/App/capacitor.config.json

# No hand edits in generated web assets (should show nothing)
git status --porcelain android/app/src/main/assets/public ios/App/App/public

# Error handling does not depend on message text
grep -rnE "error\.message\s*(===|==|\.includes)" src/

# Native builds
cd android && ./gradlew assembleRelease && cd ..
xcodebuild -project ios/App/App.xcodeproj -scheme App -configuration Release -destination 'generic/platform=iOS' build CODE_SIGNING_ALLOWED=NO
```

With CocoaPods, build `ios/App/App.xcworkspace` with `-workspace` instead of `-project`. Finally run on a real device and exercise each plugin-backed feature, including permission denial.

## Error handling

| Error | Cause | Fix |
|-------|-------|-----|
| `"<Plugin>" plugin is not implemented on ios` (or `android`) | Plugin installed but not synced, plugin has no implementation for that platform, or plugin major does not match Capacitor | `npx cap sync`; check `npx cap ls`; install the plugin version matching your Capacitor major; rebuild the native app |
| `"<Plugin>.<method>()" is not implemented on web` | Calling a native-only method in the browser | Guard with `Capacitor.isNativePlatform()` or `isPluginAvailable`, provide a web fallback |
| `Could not find the web assets directory: ./dist.` | `webDir` wrong or web app not built | Build first; set `webDir` to the real output folder (`dist`, `www`, `build`, `out`) |
| `ios platform has not been added yet.` | Native project missing | `npx cap add ios` (SPM default) or restore the committed `ios/` folder |
| `Invalid App ID "<id>"` | `appId` not reverse-domain or contains invalid characters | Use `com.company.app` style; changing it on a published app creates a new store listing |
| App loads a LAN IP or blank screen in production | `server.url` shipped from a dev config | Remove it, rebuild, `npx cap sync`, rebuild the native app |
| `net::ERR_CLEARTEXT_NOT_PERMITTED` | HTTP request on Android | Use HTTPS; `cleartext` only in dev config (see `capacitor-security`) |
| `pod install` fails / CocoaPods spec errors | CocoaPods trunk deprecation, outdated specs | Migrate with `cocoapods-to-spm` |
| Deep links or `resume` handling stopped on iOS after 8.5 | Custom code still in AppDelegate after UIScene adoption | Move it to `SceneDelegate` (`capacitor-uiscene-migration`) |

## Resources

- Capacitor docs: https://capacitorjs.com/docs
- Config reference: https://capacitorjs.com/docs/config
- Environment-specific configurations: https://capacitorjs.com/docs/guides/environment-specific-configurations
- Updating to 8.5 (UIScene): https://capacitorjs.com/docs/updating/8-5
- Capgo docs: https://capgo.app/docs/
