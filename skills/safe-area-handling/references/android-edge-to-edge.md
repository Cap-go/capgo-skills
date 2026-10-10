# Android Edge-to-Edge with Capacitor 8+

Load when fixing Android inset problems, migrating off `adjustMarginsForEdgeToEdge`, or replacing `@capacitor/status-bar` calls.

## SystemBars config

```ts
// capacitor.config.ts
plugins: {
  SystemBars: {
    insetsHandling: 'css', // default; injects --safe-area-inset-* on Android
    style: 'DEFAULT',      // 'DARK' | 'LIGHT' | 'DEFAULT'
    hidden: false,
    animation: 'FADE',     // iOS only: 'FADE' | 'NONE'
  },
},
```

`insetsHandling` (Android only):
- `css` (default): Capacitor handles insets and injects `--safe-area-inset-top|right|bottom|left` (dp values) into the document. Bottom is set to 0 while the IME is visible.
- `native` (present in newer core declarations): same handling without the injected variables. Check `node_modules/@capacitor/cli/dist/declarations.d.ts` before using.
- `disable`: Capacitor does nothing; your native and web code own all insets. Not recommended.

## Runtime API

```ts
import { SystemBars, SystemBarsStyle, SystemBarType } from '@capacitor/core';

await SystemBars.setStyle({ style: SystemBarsStyle.Light });                       // dark icons
await SystemBars.setStyle({ style: SystemBarsStyle.Dark, bar: SystemBarType.NavigationBar });
await SystemBars.hide({ bar: SystemBarType.NavigationBar });                      // immersive
await SystemBars.show();
```

## Migrating from @capacitor/status-bar

| Old call | Android 15+/16 status | Replacement |
|----------|----------------------|-------------|
| `StatusBar.setOverlaysWebView({ overlay: false })` | No effect (always overlays) | Pad content with safe-area CSS |
| `StatusBar.setBackgroundColor({ color })` | No effect | Paint a header background that extends under the bar |
| `StatusBar.setStyle({ style: Style.Dark })` | Works (top bar only) | `SystemBars.setStyle` (status + nav bar) |
| `StatusBar.hide()` / `show()` | Works (top bar only) | `SystemBars.hide()` / `show()` with optional `bar` |

`@capacitor/status-bar` remains valid for iOS `setOverlaysWebView` / `setBackgroundColor` (supported on iOS since v7) and for older Android targets.

## Navigation bar color

On enforced edge-to-edge the navigation bar is transparent; the WebView background shows through. Set the page background in CSS. For explicit color/button theme control there is `@capgo/capacitor-navigation-bar` (`setNavigationBarColor`), but on Android 15+ the system may ignore background colors; test on device.

## Remove legacy native code

Delete custom code in `MainActivity` that calls `WindowCompat.setDecorFitsSystemWindows`, `window.setDecorFitsSystemWindows(false)`, `SYSTEM_UI_FLAG_LAYOUT_*`, or `ViewCompat.setOnApplyWindowInsetsListener` on the decor view. It conflicts with SystemBars, which installs its own insets listener on the decor view.

`windowOptOutEdgeToEdgeEnforcement` in styles only works at targetSdk 35 and is ignored at 36+. Do not add it as a fix.

## WebView version

```bash
adb shell dumpsys package com.google.android.webview | grep versionName
adb shell dumpsys package com.android.chrome | grep versionName   # some devices use Chrome as provider
```

- < 140: `env()` insets unreliable; rely on `--safe-area-inset-*`.
- < 144: bottom inset incorrect while IME is visible; Capacitor applies a workaround.

## Display cutouts

Edge-to-edge apps at targetSdk 35+ default to drawing into cutouts on short edges. Landscape cutouts appear in `left`/`right` insets; always pad horizontally too.
