# CocoaPods -> SPM Troubleshooting

Load when a migration step fails or the app builds but behaves differently after migration.

## CLI messages (Capacitor CLI 8.x / 9.x)

| Message | Cause | Fix |
|---|---|---|
| `Capacitor project is already using SPM, exiting.` | `ios/App/CapApp-SPM/` exists. | Skip the assistant. Finish manual Xcode steps or repair. |
| `CocoaPods is not installed.` | Assistant runs `pod deintegrate` first. | `brew install cocoapods` (or `gem install cocoapods`) for the migration only, or use fresh scaffold. |
| `Failed to create .../CapApp-SPM with error: ...` | Partial previous run, permissions, or folder already present. | Remove the partial folder, restore from git, rerun. |
| `<id> does not have a Package.swift` | Plugin has no SPM manifest at its package root. | Upgrade, replace, or convert (`capacitor-plugin-spm-support`). |
| `Some installed Capacitor plugins are not compatible with SPM` | Summary of the above. | Same. |
| `<id> is built for Capacitor <N>, it might cause issues` | Plugin's `Package.swift` pins another `capacitor-swift-pm` major; CLI rewrote it in `node_modules`. | Upgrade the plugin to the version matching your Capacitor major. |
| `<id>: custom .framework files are not supported as binaryTarget in SPM (...)` | Cordova plugin ships a plain `.framework`. | Use an `.xcframework` build of the SDK or replace the plugin. |
| `<id>: the following compiler flags are not supported in SPM and were ignored: ...` | Cordova `compiler-flags` (for example `-fno-objc-arc`). | Check the plugin still compiles and behaves; replace if not. |
| `Unable to write to .../Package.swift. Verify it is not already open.` | File locked or read-only. | Close editors / fix permissions, re-sync. |

## Xcode / runtime

| Symptom | Cause | Fix |
|---|---|---|
| `No such module 'Capacitor'` | `CapApp-SPM` not added as local package or not linked to the App target. | Add Local... package, link library under General -> Frameworks, Libraries, and Embedded Content. |
| `Missing package product 'CapApp-SPM'` or stale plugin versions | Corrupt package cache. | File -> Packages -> Reset Package Caches, then Resolve Package Versions. CLI: `xcodebuild -resolvePackageDependencies -project ios/App/App.xcodeproj`. |
| Duplicate symbols / `Multiple commands produce` | Leftover `Pods` build phases or frameworks, or SDK linked twice (SPM + manual). | Remove `[CP]` build phases and `Pods_App.framework` references from the target, delete DerivedData, rebuild. |
| `"X" plugin is not implemented on ios` | Plugin missing from generated `Package.swift`, or its class missing from `ios/App/App/capacitor.config.json` `packageClassList`. | Re-sync, read warnings, fix plugin, clean build. |
| Debug WebView inspection or debug logging stopped | `debug.xcconfig` not attached to Debug, or `CAPACITOR_DEBUG` key missing from `Info.plist`. | Set Debug configuration file; ensure `CAPACITOR_DEBUG = $(CAPACITOR_DEBUG)` in `Info.plist`. |
| `npx cap sync` behaves like CocoaPods again | `CapApp-SPM/` was deleted or moved. | Restore the folder from git. |
| Deep links / `pause` / `resume` broken after re-scaffold | New 8.5+ template uses SceneDelegate; custom AppDelegate URL code no longer runs. | `capacitor-uiscene-migration`. |
| `Cordova` symbol errors on Capacitor 9 | Cordova product is only added when a Cordova plugin is installed. | Remove direct Cordova imports or add the Cordova plugin you actually depend on. |
| CI still runs `pod install` | Pipeline scripts not updated. | Remove pod steps; build with `-project App.xcodeproj` instead of `-workspace App.xcworkspace`; cache `~/Library/Developer/Xcode/DerivedData/*/SourcePackages` if needed. |

## Manual repair checklist (assistant ran partially)

1. `git status` / `git diff --stat ios/` to see what changed.
2. Ensure `Podfile`, `Podfile.lock`, `App.xcworkspace`, `Pods/` are gone and no `[CP]` build phases remain in `project.pbxproj`.
3. Ensure `ios/App/CapApp-SPM/` and `ios/debug.xcconfig` exist (copy from a fresh `npx cap add ios` in a temp project of the same Capacitor version if missing).
4. Add local package + debug config in Xcode.
5. `npx cap sync ios` and run the Verification block in SKILL.md.
