---
name: capacitor-plugin-spm-support
description: Adds Swift Package Manager support to an existing Capacitor plugin repository so apps using CapApp-SPM can consume it after CocoaPods Trunk goes read-only (expected December 2, 2026). Covers root Package.swift naming rules the Capacitor CLI depends on, CAPBridgedPlugin conversion (identifier, jsName, pluginMethods), removing the ObjC CAP_PLUGIN bridge (.m/.h), Sources/Tests layout, podspec and package.json files updates, third-party pod to SPM dependency mapping, resources/PrivacyInfo.xcprivacy, binary xcframeworks, and Capacitor 9 removal of the unconditional Cordova product. Use when app sync warns "<plugin> does not have a Package.swift" for a plugin you own, or "plugin is not implemented on ios" only in SPM apps. Do not use for migrating an app project (use cocoapods-to-spm), version bumps of plugins (use capacitor-plugin-upgrades / capacitor-plugin-upgrade-v8-to-v9), or choosing plugins (use capacitor-plugins).
---

# Add Swift Package Manager Support to a Capacitor Plugin

Make a plugin installable in SPM-based Capacitor apps while keeping its podspec for CocoaPods apps.

## When to Use

TRIGGER when:
- A plugin repo has `ios/Plugin/*.swift` + `*.m`/`*.h` with `CAP_PLUGIN(...)` and no root `Package.swift`.
- An app's `npx cap sync ios` prints `<plugin id> does not have a Package.swift` for a plugin the user maintains.
- A plugin works with CocoaPods but JS gets `"X" plugin is not implemented on ios` in SPM apps.
- Preparing a plugin for Capacitor 9 / CocoaPods Trunk read-only.

Do not use:
- App-side CocoaPods removal -> `cocoapods-to-spm`.
- Capacitor major bumps of a plugin -> `capacitor-plugin-upgrades`, `capacitor-plugin-upgrade-v8-to-v9`.
- Android-only plugin work, or non-Capacitor (pure Cordova, React Native) plugins.

## Rules the CLI Enforces (non-obvious)

- `Package.swift` must be at the **npm package root** (next to `package.json`), not under `ios/`. The app CLI only checks `<plugin root>/Package.swift`.
- The CLI references the plugin in the app's `CapApp-SPM/Package.swift` as `.package(name: "<Name>", path: ...)` and `.product(name: "<Name>", package: "<Name>")`, where `<Name>` is derived from the npm name: drop `@`, turn `/` and `-` into word breaks, PascalCase. `@capgo/capacitor-updater` -> `CapgoCapacitorUpdater`, `@acme/capacitor-foo-bar` -> `AcmeCapacitorFooBar`. The `Package(name:)` **and** the `.library(name:)` product must both equal `<Name>`, or app builds fail to resolve the product.
- Runtime registration uses `ios/App/App/capacitor.config.json` -> `packageClassList`, filled by scanning the plugin's iOS sources (`capacitor.ios.src` in package.json, default `ios`) for `@objc(ClassName)`. Keep `@objc(<Class>Plugin)` on the class; without it the plugin is never registered.
- The `capacitor-swift-pm` dependency must use `from: "<major>.0.0"`. If the major differs from the app's Capacitor, app sync rewrites it in `node_modules` and warns `<id> is built for Capacitor <N>, it might cause issues`.
- Capacitor 9: depend only on `.product(name: "Capacitor", package: "capacitor-swift-pm")`. Remove the unconditional `Cordova` product; it is only present in apps that install a Cordova plugin. Keep it on Capacitor 8 only if your code imports Cordova.

## Procedure

### 1. Inspect

Read `package.json` (name, `files`, `capacitor.ios.src`, scripts), the `.podspec` (`s.name`, `s.ios.deployment_target`, `s.dependency`, `s.resources`, `s.vendored_frameworks`), every file in `ios/`, and the `CAP_PLUGIN(...)` macro in the `.m` file.

Record: SPM `<Name>` (rule above), class name, `jsName`, every `CAP_PLUGIN_METHOD(name, returnType)`, iOS deployment target, third-party pods, resources, vendored frameworks, ObjC/C sources other than the bridge.

Check each third-party pod has an official SPM package. Report any that do not before editing; ask whether to drop, vendor as `.xcframework`, or keep the plugin CocoaPods-only.

### 2. Fast path: converter

If the iOS code is Swift-only apart from the `[Name]Plugin.m` / `.h` bridge, the official converter does most of the work (adds `CAPBridgedPlugin`, creates `Package.swift`, moves code to `ios/Sources` and `ios/Tests`, removes `Plugin.xcodeproj`/`xcworkspace`/`Podfile`, updates podspec `source_files`, `files`, and `verify:ios`): https://github.com/ionic-team/capacitor-plugin-converter. Review its diff against the rules above, especially the package/product name.

### 3. Manual conversion

1. Move sources: `ios/Plugin/` -> `ios/Sources/<ClassName>/`, tests -> `ios/Tests/<ClassName>Tests/`.
2. Convert the class (keep method names and return types exactly as in the `.m` macro):
   ```swift
   import Capacitor

   @objc(FooPlugin)
   public class FooPlugin: CAPPlugin, CAPBridgedPlugin {
       public let identifier = "FooPlugin"     // first CAP_PLUGIN argument
       public let jsName = "Foo"               // second CAP_PLUGIN argument (registerPlugin name)
       public let pluginMethods: [CAPPluginMethod] = [
           CAPPluginMethod(name: "doThing", returnType: CAPPluginReturnPromise),
           CAPPluginMethod(name: "watch", returnType: CAPPluginReturnCallback),
           CAPPluginMethod(name: "fireAndForget", returnType: CAPPluginReturnNone)
       ]
       @objc func doThing(_ call: CAPPluginCall) { call.resolve() }
   }
   ```
3. Delete `FooPlugin.m` and `FooPlugin.h` (the `CAP_PLUGIN` bridge) and stale `Plugin.xcodeproj`, `Plugin.xcworkspace`, `Podfile`, `Info.plist` files under `ios/`.
4. Add root `Package.swift`. Template and variants (resources, binary targets, third-party packages, mixed ObjC) in `references/package-swift-templates.md`.
5. Update the podspec: `s.source_files = 'ios/Sources/**/*.{swift,h,m,c,cc,mm,cpp}'`, keep `s.dependency 'Capacitor'`, and mirror deployment target and resources.
6. Update `package.json`:
   - `files`: add `ios/Sources/`, `Package.swift`; keep the `.podspec`; remove old `ios/Plugin/`.
   - `verify:ios`: `xcodebuild -scheme <Name> -destination generic/platform=iOS`.

## Verification

```bash
# Package resolves and builds standalone (from plugin root)
swift package describe >/dev/null && echo "manifest ok"
xcodebuild -scheme <Name> -destination generic/platform=iOS build
# Published tarball contains the manifest and sources
npm pack --dry-run 2>&1 | grep -E 'Package.swift|ios/Sources'
# No leftover ObjC bridge
grep -rn "CAP_PLUGIN(" ios/ && echo "LEFTOVER BRIDGE"
```

Then in an SPM example/test app (directory with `capacitor.config.*`): install the plugin (`npm install ../path` or a packed tarball), run `npx cap sync ios`, confirm no `does not have a Package.swift` warning, confirm `<Name>` appears in `ios/App/CapApp-SPM/Package.swift` and the class appears in `ios/App/App/capacitor.config.json` `packageClassList`, build, and call one method from JS. Also run `pod lib lint` (or a CocoaPods example app) if the podspec is still published.

## Error Handling

| Error | Fix |
|---|---|
| `product '<Name>' required by package 'capapp-spm' target 'CapApp-SPM' not found in package '<Name>'` | `Package(name:)` / `.library(name:)` do not match the CLI-derived `<Name>`. |
| `"Foo" plugin is not implemented on ios` | Missing `@objc(FooPlugin)`, wrong `jsName`, or class not in `packageClassList`; re-sync after fixing. |
| `"Foo.bar()" is not implemented on ios` | Method missing from `pluginMethods` or not marked `@objc`. |
| `No such module 'Capacitor'` building the package | Missing `capacitor-swift-pm` dependency or wrong product name. |
| `public headers ("include") directory path for 'X' is invalid or not contained in the target` | Mixed ObjC target without `publicHeadersPath`; split ObjC into its own target (see reference). |
| `<id> is built for Capacitor <N>, it might cause issues` (in app) | Bump `capacitor-swift-pm` `from:` to the app's major. |
| `Cordova` product missing (Capacitor 9 app) | Remove the `Cordova` product dependency. |
| Resource not found at runtime | Declare `resources:` and load via `Bundle.module`, not `Bundle.main`. |

## References

Only load when the topic is in play:
- `references/package-swift-templates.md`: base manifest, resources and privacy manifest, third-party SPM dependencies, binary `.xcframework`, mixed Swift/ObjC targets, Capacitor 8 vs 9 dependency blocks.
