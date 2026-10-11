---
name: capacitor-splash-screen
description: Configures and debugs launch splash screens in Capacitor apps with @capacitor/splash-screen and @capacitor/assets - `launchAutoHide`, `SplashScreen.hide()`, `launchFadeOutDuration` (Android default changed 200 -> 0 in Capacitor 9), Android 12+ SplashScreen API theme (`Theme.SplashScreen`, `windowSplashScreenAnimatedIcon`), iOS `LaunchScreen.storyboard` + `Splash.imageset`, and Capacitor 8.5 UIScene/SceneDelegate effects (window created in code, Main.storyboard no longer supplies the root view controller). Use for white/black flash at launch, splash never hiding, cropped/tiny Android 12 icon, dark-mode splash, or regenerating icons and splash assets. Do not use for status/navigation bar color and insets (safe-area-handling), the UIScene migration itself (capacitor-uiscene-migration), or startup performance profiling (capacitor-performance).
---

# Splash Screen in Capacitor

## When to Use

TRIGGER when:
- Configuring or regenerating splash / icon assets (`npx capacitor-assets generate`)
- Splash never disappears, disappears too early, or flashes white/black before the web app paints
- Android 12+ shows a small cropped icon on a solid color instead of the full image
- Upgrading to Capacitor 9 and the Android fade-out animation vanished
- iOS shows a black screen after adding `SceneDelegate.swift` (8.5+)

Do not use:
- Status bar / navigation bar styling and edge-to-edge insets: `safe-area-handling`
- Migrating AppDelegate to SceneDelegate: `capacitor-uiscene-migration`
- Slow first paint / bundle size: `capacitor-performance`
- Icon requirements for store submission: `capacitor-app-store`

## How launch works (decide what to edit)

| Phase | iOS | Android 12+ | Android <= 11 |
|-------|-----|-------------|---------------|
| OS launch screen (before any code) | `LaunchScreen.storyboard` (`UILaunchStoryboardName`), image `Splash` in `Assets.xcassets/Splash.imageset` | System SplashScreen API: theme `AppTheme.NoActionBarLaunch` with `Theme.SplashScreen` parent - icon + background color only | `androidx.core:core-splashscreen` compat, or `android:background` drawable |
| Plugin splash (until `hide()`) | Plugin overlay on the bridge view | Same system splash held via the API | Plugin ImageView / Dialog (`androidSplashResourceName`, `androidScaleType`) |

Most `androidScaleType`, `showSpinner`, `splashFullScreen`, `layoutName`, `useDialog`, `backgroundColor` options do **not** apply on Android 12+ launch (the OS draws it). They only affect `show()` and pre-12 devices.

## Workflow

1. **Inspect**: `capacitor.config.*` `plugins.SplashScreen`, `android/app/src/main/res/values/styles.xml`, `android/variables.gradle` (`coreSplashScreenVersion`), `ios/App/App/Info.plist`, `ios/App/App/SceneDelegate.swift`, `assets/` or `resources/` folder.
2. **Install**: `npm install @capacitor/splash-screen && npx cap sync`.
3. **Assets**: put sources in `assets/` (`icon-only.png`, `icon-foreground.png`, `icon-background.png`, `splash.png`, `splash-dark.png`; splash >= 2732x2732, icons >= 1024x1024), then `npm install -D @capacitor/assets && npx capacitor-assets generate` (`--ios`, `--android`, `--pwa` to scope). Keep the logo inside the center ~1/3 so Android 12+ circular masking does not crop it.
4. **Hide deliberately**: set `launchAutoHide: false` and call `hide()` after the first meaningful render (below).
5. **Android 12+ tuning** if needed: [references/android-12-splash.md](references/android-12-splash.md).
6. **Verify** (below).

## Recommended config

```ts
// capacitor.config.ts
plugins: {
  SplashScreen: {
    launchAutoHide: false,     // hide from JS when the UI is ready
    launchFadeOutDuration: 200, // explicit: Capacitor 9 default on Android is 0
    backgroundColor: '#ffffff', // match the first web paint to avoid a flash
  },
},
```

```ts
import { SplashScreen } from '@capacitor/splash-screen';

// after the router's first view has rendered (e.g. in a root component's mounted/useEffect)
await SplashScreen.hide(); // optional: { fadeOutDuration: 300 }
```

Traps:
- With `launchAutoHide: false`, a JS crash before `hide()` leaves the app stuck on the splash. Add a fallback: `setTimeout(() => SplashScreen.hide(), 8000)`.
- Default when auto-hiding is 500 ms (`launchShowDuration`). Long fixed durations hurt perceived startup; hide on readiness instead.
- Set `<body>` / root background to the splash background color, or the gap between native splash and first web paint flashes white (dark mode: black).
- Live updates (`capgo-live-updates`): call `notifyAppReady()` independently of `hide()`; do not gate one on the other.

## Version notes

| Version | Change |
|---------|--------|
| 4 | Android uses the Android 12 SplashScreen API + compat library |
| 7 | `SplashScreenShowOptions` / `SplashScreenHideOptions` types removed -> `ShowOptions` / `HideOptions` |
| 8 | `coreSplashScreenVersion = '1.2.0'` |
| 8.5 (iOS) | UIScene template creates the window and `CAPBridgeViewController` in `SceneDelegate`; `Main.storyboard` no longer supplies the root view controller. `LaunchScreen.storyboard` is unchanged and still required. |
| 9 | Android `launchFadeOutDuration` default `200` -> `0` (the old default could block UI changes right after `hide()`). Set `200` explicitly to keep the fade. |

## iOS notes (Capacitor 8.5+ scenes)

- Keep `UILaunchStoryboardName = LaunchScreen` in Info.plist. Apple requires a launch storyboard; deleting it causes letterboxed / wrong-size rendering.
- Do not add views or a custom view controller to `Main.storyboard` expecting them to show: the 8.5 SceneDelegate sets `window.rootViewController = CAPBridgeViewController()` in code. Put a custom `CAPBridgeViewController` subclass there instead.
- Black screen right after launch with a scene manifest = SceneDelegate creates no window (missing `window = UIWindow(windowScene:)` + `makeKeyAndVisible()`) or `UISceneDelegateClassName` points to a missing class. Fix with `capacitor-uiscene-migration`.
- The storyboard is cached by iOS. After changing it, delete the app from the device/simulator and reinstall.
- On resizable windows / iPad / foldables the launch storyboard must use Auto Layout constraints, not fixed frames (see `capacitor-ios-resizability` if present).

## Verification

1. `npx cap sync` then a clean native build (`Product > Clean Build Folder` in Xcode; `./gradlew clean` in `android/`).
2. Delete and reinstall the app (both platforms cache launch screens).
3. Cold launch on: iOS device light + dark mode, Android 12+ device, Android <= 11 emulator (if minSdk allows; Capacitor 9 minSdk is 26).
4. Confirm: no white/black flash, splash hides once the first screen is visible, fade matches the configured duration.
5. Grep for leftovers:

```bash
grep -rn "launchFadeOutDuration\|launchAutoHide" capacitor.config.*
grep -n "Theme.SplashScreen\|postSplashScreenTheme" android/app/src/main/res/values/styles.xml
/usr/libexec/PlistBuddy -c "Print :UILaunchStoryboardName" ios/App/App/Info.plist
```

## Error Handling

| Symptom / message | Cause | Fix |
|-------------------|-------|-----|
| Splash stays forever | `launchAutoHide: false` and `hide()` never runs (JS error, wrong import, called before plugin load) | Check web console; add timeout fallback |
| Fade-out gone after Capacitor 9 upgrade (Android) | Default `launchFadeOutDuration` is now 0 | Set `launchFadeOutDuration: 200` |
| UI changes right after `hide()` not visible (Android, pre-9) | 200 ms fade blocked updates | Set `launchFadeOutDuration: 0` |
| Android 12+ shows small icon, image cropped | OS splash is icon-only by design | Provide adaptive icon-safe artwork; tune `windowSplashScreenAnimatedIcon` |
| Android 12/12L no splash from third-party launchers or Android Studio | Platform bug fixed in Android 13 | Test from the stock launcher |
| `error: resource drawable/splash not found` | `androidSplashResourceName` or styles reference a missing drawable | Regenerate assets or fix the name in both config and `styles.xml` |
| `AAPT: error: style attribute 'attr/windowSplashScreenAnimatedIcon' not found` | `core-splashscreen` dependency missing | Restore `implementation "androidx.core:core-splashscreen:$coreSplashScreenVersion"` |
| iOS black screen after 8.5 scene adoption | No window created in SceneDelegate | See iOS notes / `capacitor-uiscene-migration` |
| Old splash still shows on iOS | Launch screen cache | Delete app, reboot device if needed, reinstall |

## Resources

- Plugin API: https://capacitorjs.com/docs/apis/splash-screen
- Splash screens and icons guide: https://capacitorjs.com/docs/guides/splash-screens-and-icons
- Updating to 9.0: https://capacitorjs.com/docs/updating/9-0
- Android SplashScreen API: https://developer.android.com/develop/ui/views/launch/splash-screen
