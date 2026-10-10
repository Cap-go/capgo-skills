---
name: safe-area-handling
description: Fixes notch, Dynamic Island, home indicator, display cutout, and system bar overlap in Capacitor apps. Covers `viewport-fit=cover` + `env(safe-area-inset-*)`, the Capacitor 8 SystemBars core plugin (`insetsHandling`, injected `--safe-area-inset-*` CSS variables for Android WebView < 140, removal of `android.adjustMarginsForEdgeToEdge`), Android 15/16 enforced edge-to-edge (`overlaysWebView` and `backgroundColor` of @capacitor/status-bar no longer work at targetSdk 36), iOS `contentInset`, and insets that change at runtime on rotation, iPad/foldable resizable windows. Use when headers sit under the status bar, tab bars hide behind the gesture bar, `env()` returns 0 on Android, or layout broke after upgrading to Capacitor 8 / targetSdk 35+. Do not use for keyboard overlap (capacitor-keyboard), Ionic/Konsta component theming (ionic-design, konsta-ui), Tailwind utility setup (tailwind-capacitor), or iOS multi-window/resizability adoption (capacitor-ios-resizability).
---

# Safe Area Handling in Capacitor

## When to Use

TRIGGER when:
- Content renders under the status bar, notch, Dynamic Island, cutout, home indicator, or Android navigation/gesture bar
- `env(safe-area-inset-*)` is `0px` on Android, or correct only after rotation
- Layout broke after Capacitor 8 upgrade or raising `targetSdkVersion` to 35/36
- `StatusBar.setOverlaysWebView` / `setBackgroundColor` stopped working on Android
- Landscape / split-screen / iPad windowed layouts have wrong side padding

Do not use:
- Keyboard covering inputs: `capacitor-keyboard`
- Ionic `ion-header`/`ion-toolbar` theming: `ionic-design`; Konsta `safeAreas`: `konsta-ui`
- Tailwind plugin/utility setup: `tailwind-capacitor`
- iOS scene sizing, `UIScreen.main`, multi-window: `capacitor-ios-resizability`
- Splash screen colors: `capacitor-splash-screen`

## Facts that drive every decision

| Platform / version | Behavior |
|--------------------|----------|
| iOS (all) | WebView is full-screen. `env(safe-area-inset-*)` works only with `viewport-fit=cover`. `ios.contentInset` defaults to `never`. |
| Android, Capacitor <= 7 | `android.adjustMarginsForEdgeToEdge` config could add native margins. |
| Android, Capacitor 8+ | `adjustMarginsForEdgeToEdge` removed. SystemBars core plugin (in `@capacitor/core`) handles insets. |
| Android 15 (targetSdk 35) | Edge-to-edge enforced; opt-out via `windowOptOutEdgeToEdgeEnforcement` still possible. |
| Android 16 (targetSdk 36, Capacitor 8 default; 37 on Capacitor 9) | Opt-out ignored. `@capacitor/status-bar` `overlaysWebView` and `backgroundColor` have no effect. |
| Android WebView < 140 | `env(safe-area-inset-*)` wrong/0 (Chromium bug). SystemBars injects `--safe-area-inset-*` variables (default `insetsHandling: 'css'`). |

How SystemBars behaves on Android (from core source): if the page has `viewport-fit=cover` **and** WebView >= 140, insets pass through to `env()` and the WebView is edge-to-edge. Otherwise Capacitor pads the WebView natively so content sits between the bars and `env()` reports 0. `--safe-area-inset-*` variables carry correct values in both cases when `insetsHandling` is `css`.

## Workflow

1. **Inspect**: `index.html` viewport meta, `capacitor.config.*` (`ios.contentInset`, `android.adjustMarginsForEdgeToEdge`, `plugins.SystemBars`, `plugins.StatusBar`), `@capacitor/core` + `@capacitor/status-bar` versions, `android/variables.gradle` `targetSdkVersion`, global CSS that sets `padding-top`, UI framework (Ionic / Konsta handle insets themselves).
2. **Decide the design**: full-bleed (draw under bars, pad content) vs. contained (content between bars). Ask the user if mockups are unclear.
3. **Full-bleed (recommended)**: `viewport-fit=cover` + the CSS fallback chain below, applied once at the layout shell, not per component.
4. **Remove legacy config**: delete `android.adjustMarginsForEdgeToEdge`; drop Android uses of `StatusBar.setOverlaysWebView` / `setBackgroundColor` (keep for iOS if wanted); prefer `SystemBars.setStyle` for icon color.
5. **Framework check**: Ionic already applies `--ion-safe-area-*`; Konsta uses `safeAreas`. Do not double-pad.
6. **Verify** on devices (below).

Only load a reference when its topic is in play:
- [references/android-edge-to-edge.md](references/android-edge-to-edge.md) - SystemBars config, status-bar migration, nav bar color, WebView version checks
- [references/css-patterns.md](references/css-patterns.md) - layout shell, tab bars, reading insets in JS, debug overlay, resizable windows

## Baseline

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
```

```css
:root {
  --sat: var(--safe-area-inset-top, env(safe-area-inset-top, 0px));
  --sar: var(--safe-area-inset-right, env(safe-area-inset-right, 0px));
  --sab: var(--safe-area-inset-bottom, env(safe-area-inset-bottom, 0px));
  --sal: var(--safe-area-inset-left, env(safe-area-inset-left, 0px));
}
.app-header { padding-top: var(--sat); padding-inline: var(--sal) var(--sar); }
.app-tabbar { padding-bottom: var(--sab); padding-inline: var(--sal) var(--sar); }
```

The `--safe-area-inset-*` names are injected by Capacitor's SystemBars on Android; on iOS and web they are undefined, so the `env()` fallback applies.

```ts
import { SystemBars, SystemBarsStyle } from '@capacitor/core';
await SystemBars.setStyle({ style: SystemBarsStyle.Dark }); // light icons on dark background
```

`SystemBarsStyle.Dark` = light content for dark backgrounds; `Light` = dark content. iOS needs `UIViewControllerBasedStatusBarAppearance = YES` (template default).

## Traps

- Missing `viewport-fit=cover` is the #1 cause of `env()` = 0 on iOS and of Capacitor padding the WebView on Android.
- Do not combine `ios.contentInset: 'always'` with CSS safe-area padding: insets apply twice.
- Do not hardcode 20/44/47/59 px status bar heights; heights differ per device, orientation, and window size.
- Insets change at runtime (rotation, iPad windowed mode, foldables, Android split screen, keyboard). Use CSS, or re-read on `resize`; never cache once at startup.
- On iOS the bottom inset stays while the keyboard is visible; use `max()` with keyboard height (see `capacitor-keyboard`).
- `100vh` includes the area under system bars; use `100dvh` or flex layout with a fixed shell.
- Ionic: `ion-content` with `fullscreen` + `ion-header` already pads; adding body padding shifts everything twice.

## Verification

1. `npx cap sync`, run on: iPhone with Dynamic Island, iPhone SE-class (home button, small top inset), iPad (rotate + Stage Manager/windowed), Android 15/16 device or emulator in gesture **and** 3-button navigation, landscape.
2. Check Android WebView version: `adb shell dumpsys package com.google.android.webview | grep versionName` (< 140 relies on injected variables).
3. In Safari Web Inspector / `chrome://inspect`, run:

```js
getComputedStyle(document.documentElement).getPropertyValue('--sat');
document.querySelector('meta[name=viewport]').content.includes('viewport-fit=cover');
```

4. Confirm no element overlaps bars; tab bar taps work above the gesture bar; no double padding.
5. Grep for leftovers:

```bash
grep -rn "adjustMarginsForEdgeToEdge\|setOverlaysWebView\|setBackgroundColor\|windowOptOutEdgeToEdgeEnforcement" capacitor.config.* src android/app/src/main/res 2>/dev/null
```

## Error Handling

| Symptom / message | Cause | Fix |
|-------------------|-------|-----|
| Header under status bar on iOS, `env()` = 0 | No `viewport-fit=cover` | Add to viewport meta |
| Android: content correct but no edge-to-edge, `env()` = 0 | No `viewport-fit=cover` or WebView < 140, so Capacitor pads natively | Add `viewport-fit=cover`; use `--safe-area-inset-*` fallback |
| Android: double gap at top | Native padding + your CSS padding with `insetsHandling: 'disable'` or custom MainActivity insets code | Remove custom `setDecorFitsSystemWindows` / inset listeners; keep SystemBars default |
| `StatusBar.setBackgroundColor` / `setOverlaysWebView` no effect on Android | targetSdk 35+/36 edge-to-edge | Draw a background under the bar in CSS; use `SystemBars.setStyle` for icon color |
| `android.adjustMarginsForEdgeToEdge` still in config after Capacitor 8 upgrade, margins gone | Option removed and ignored | Delete it; rely on SystemBars + CSS |
| Logcat `Unknown insetsHandling value '...'. Falling back to 'css'.` | Invalid `SystemBars.insetsHandling` | Use a value listed in the current docs (`css`, `disable`; newer cores also accept `native`) |
| Status bar text invisible (white on white) | Style mismatch | `SystemBars.setStyle({ style: SystemBarsStyle.Light })` |
| Layout jumps on first paint (Android) | SystemBars detects `viewport-fit` after page commit | Set `plugins.SystemBars.initialViewportFitValueHint: 'cover'` (in core config declarations; verify in your version) |

## Resources

- System Bars API: https://capacitorjs.com/docs/apis/system-bars
- Status Bar API (Android 16 note): https://capacitorjs.com/docs/apis/status-bar
- Updating to 8.0: https://capacitorjs.com/docs/updating/8-0
- Android edge-to-edge: https://developer.android.com/develop/ui/views/layout/edge-to-edge
- WebKit viewport-fit / env(): https://webkit.org/blog/7929/designing-websites-for-iphone-x/
