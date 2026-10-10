---
name: capacitor-ios-resizability
description: Makes a Capacitor iOS app work in windows that resize while running (iPad Split View, Slide Over, Stage Manager, windowed apps, the foldable iPhone). Audits the web layer (viewport, `100vh`, device sniffing, `screen.width`, `window.orientation`, cached safe-area insets) and native code in the app and node_modules plugins (`UIScreen.main`, `interfaceOrientation`, `userInterfaceIdiom`, `keyWindow`, AppDelegate lifecycle, hard-coded bar heights), then applies trait-, window- and scene-based replacements. Checks Info.plist `UIRequiresFullScreen` (ignored on iOS 27, TN3192), iPad orientations, launch screen (ITMS-90870) and the UIScene lifecycle (Capacitor 8.5+). Use for "support iPad multitasking", "Stage Manager layout broken", "app does not resize", "foldable iPhone", or a plugin overlay mis-sized in split view. Do not use for notch padding only (safe-area-handling) or the SceneDelegate migration (capacitor-uiscene-migration).
allowed-tools:
  - Bash(grep *)
  - Bash(find *)
  - Bash(bash *scan-legacy-apis.sh*)
---

# Resizable Windows for Capacitor iOS Apps

A Capacitor app is a full-window `WKWebView` in `CAPBridgeViewController`. The web view follows its window. The work is to make the web layout respond to width changes, and to remove native code (app, custom code, plugins) that assumes one full-screen window.

## When to Use

TRIGGER when:
- Preparing an app for iPad multitasking, Stage Manager, windowed iPad apps, the foldable iPhone, or external displays
- The layout breaks or does not update when the window is resized
- A native overlay from a plugin (scanner, camera preview, custom sheet) is the wrong size or position in split view
- Xcode or App Store Connect warns about `UIRequiresFullScreen`, missing iPad orientations, or launch screen requirements
- The user asks to remove `UIScreen.main`, `userInterfaceIdiom`, `interfaceOrientation` or AppDelegate lifecycle use

Do not use:
- CSS `env(safe-area-inset-*)` setup and notch padding only: `safe-area-handling`
- Moving AppDelegate to SceneDelegate: `capacitor-uiscene-migration` (prerequisite for Xcode 27)
- Keyboard overlap: `capacitor-keyboard`
- Tailwind breakpoints only: `tailwind-capacitor`

## Facts that drive the plan

- **iOS 27 ignores `UIRequiresFullScreen`** and resizes the scene anyway (TN3192). Never delete the key silently: deleting it makes the app resizable at once on current iOS. Never add `UIRequiresFullScreenIgnoredStartingWithVersion` on your own: its value decides which releases keep the old behavior. Both are the user's call, after testing.
- **The iOS 27 SDK requires a launch screen** declaration. Without one the upload is rejected with `ITMS-90870`. Capacitor templates set `UILaunchStoryboardName`; keep it.
- **Xcode 27 requires the scene lifecycle.** Capacitor 8.5 templates ship `SceneDelegate.swift`. Without it, AppDelegate lifecycle methods are the only signal, which is wrong in multi-window. Run `capacitor-uiscene-migration` first if `UIApplicationSceneManifest` is missing.
- **Keep `UIApplicationSupportsMultipleScenes = false`.** Each scene would create its own `CAPBridgeViewController`, with a second WebView and plugin set. Capacitor added scene-scoped notifications in 8.5 so plugins can prepare, but multi-window is not supported in the templates. Resizing works with a single scene.
- **`CAPBridgeViewController` builds `supportedInterfaceOrientations` from the iPhone key** `UISupportedInterfaceOrientations` only, not from `UISupportedInterfaceOrientations~ipad` (Capacitor 8.5 source). An iPad that declares all four orientations can still be locked by the bridge mask. Report it; override `supportedInterfaceOrientations` in a bridge subclass only if the user wants different iPad behavior.
- **The web layer gets resize events for free.** `WKWebView` resizes with the window and fires `resize`. Breakage comes from layout code that reads the device instead of the viewport.
- **Plugins are third-party code.** Edits to `node_modules` are lost on install. Report plugin findings, upgrade the plugin, open an issue upstream, or use `patch-package` only as a stopgap, with user approval.

## References

Only load a reference when its topic is in play.

| File | Load when |
|------|-----------|
| [references/info-plist-and-scenes.md](references/info-plist-and-scenes.md) | Checking Info.plist keys, orientation masks, scene lifecycle and the AppDelegate methods that stop firing |
| [references/web-layer.md](references/web-layer.md) | Auditing and fixing CSS/JS layout: viewport, units, device sniffing, safe areas that change at runtime |
| [references/native-replacements.md](references/native-replacements.md) | Replacing `UIScreen.main`, orientation, idiom, key window, lifecycle and hard-coded insets in Swift/ObjC |
| [references/plugin-audit.md](references/plugin-audit.md) | Scanning plugins in node_modules, triage, and what plugin authors should change |
| [references/swiftui-in-plugins.md](references/swiftui-in-plugins.md) | A plugin or app presents native SwiftUI screens that must resize; iOS 27 SDK SwiftUI changes |

Script: [scripts/scan-legacy-apis.sh](scripts/scan-legacy-apis.sh) scans `ios/App/App` and every `node_modules/**/ios` folder and prints the resize-related Info.plist keys. Read-only.

## Workflow

### 1. Prerequisites (read-only)

Read `ios/App/App/Info.plist`, `AppDelegate.swift`, `SceneDelegate.swift`, the `@capacitor/ios` version, and the `TARGETED_DEVICE_FAMILY` build setting (`1,2` = iPhone and iPad). Report:

| Check | OK when | Otherwise |
|---|---|---|
| Launch screen | `UILaunchStoryboardName` or `UILaunchScreen` present | Report ITMS-90870 risk |
| Scene lifecycle | `UIApplicationSceneManifest` present, `SceneDelegate.swift` in the target | Send to `capacitor-uiscene-migration` first |
| iPad orientations | `UISupportedInterfaceOrientations~ipad` lists all four, or no iPad key | Name the missing ones. Mention the bridge mask fact above |
| Full-screen opt-out | `UIRequiresFullScreen` absent | Report that iOS 27 ignores it. Ask the user before changing it |

### 2. Scan

```bash
bash <skill>/scripts/scan-legacy-apis.sh .
```

Also scan the web code ([references/web-layer.md](references/web-layer.md)):

```bash
grep -rnE 'screen\.(width|height|availWidth)|window\.orientation|orientationchange|\b100vh\b|navigator\.userAgent.*(iPad|iPhone)|isPlatform\(.(ipad|tablet|iphone)|innerWidth' src --include='*.{ts,tsx,js,jsx,vue,svelte,css,scss}'
```

Make a TODO list with one entry per file. Large projects: process files in batches of 3 to 5. Every file in the list gets a change or a written reason for no change.

### 3. Report, then ask

Group the findings into: app web code, app native code, plugins (by package), Info.plist. For each, state the fix. Ask the user before:
- changing `UIRequiresFullScreen`, orientation keys or the orientation mask,
- changing a public method signature in shared native code,
- patching a plugin in `node_modules`.

### 4. Fix

- Web layer first. It is usually the whole fix: [references/web-layer.md](references/web-layer.md).
- App native code: [references/native-replacements.md](references/native-replacements.md). Only edit lines that contain the target API. Keep every `if`/`else` branch and `#available` guard. Never replace a dynamic value with a literal, and never replace one global (`UIScreen.main`) with another (`UIApplication.shared`, `UITraitCollection.current`, `UIDevice.current`).
- Empty template stubs (`applicationDidBecomeActive` and friends with only comments) are harmless. Move them only if they contain code.
- Plugins: [references/plugin-audit.md](references/plugin-audit.md).

### 5. Verify

```bash
npx cap sync ios
xcrun simctl list devices available | grep -i ipad
npx cap run ios --target <iPad-simulator-UDID>
```

- On the iPad simulator (iPadOS 26+), switch the app to a window and drag its corner. Check narrow, medium and wide sizes. Also try Split View with another app.
- Rotate during each size. Open and close the keyboard in a narrow window.
- Check native overlays from plugins (scanner, camera preview, pickers) at a narrow width.
- Background and foreground the app. JS `pause` / `resume` must fire.
- If Xcode offers a foldable iPhone simulator, test fold and unfold the same way.
- Re-run the scan. Remaining hits must each have a written reason (non-layout use such as camera capture orientation or analytics).

## Error Handling

| Symptom | Cause | Fix |
|---|---|---|
| Layout stuck at the old size after resize | JS cached `window.innerWidth` / `screen.width` at startup, or CSS uses `100vh` | Read sizes on `resize` or use CSS; replace `100vh` with `100dvh` |
| Content under the status bar or home indicator only in some window sizes | Safe-area insets were read once, or a side inset was mirrored to both sides | Use `env(safe-area-inset-*)` per edge in CSS; never cache them in JS |
| Plugin overlay covers the wrong area in split view | Plugin sizes its view from `UIScreen.main.bounds` | Update the plugin, or report upstream with the scan line |
| App launches but is not resizable on iOS 26 | `UIRequiresFullScreen = true` | Expected until the user removes it after testing |
| Upload rejected with `ITMS-90870` | No launch screen key | Restore `UILaunchStoryboardName` with `LaunchScreen.storyboard` |
| `pause` / `resume` stop firing after adding `SceneDelegate` | Custom code in AppDelegate lifecycle methods | Move it to scene methods or observe notifications ([references/info-plist-and-scenes.md](references/info-plist-and-scenes.md)) |

## Related Skills

- `safe-area-handling`: CSS env() variables and the status bar overlay
- `capacitor-uiscene-migration`: SceneDelegate adoption, the prerequisite for scene-aware fixes
- `tailwind-capacitor`: responsive breakpoints in Tailwind
- `capacitor-testing`: simulator and device verification loop
- `capacitor-plugin-upgrade-v8-to-v9`: when a plugin fix needs a new major version
