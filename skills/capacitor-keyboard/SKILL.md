---
name: capacitor-keyboard
description: Fixes on-screen keyboard behavior in Capacitor apps with @capacitor/keyboard - iOS `resize` modes (`native` default, `body`, `ionic`, `none`), `keyboardWillShow`/`keyboardDidShow` heights, `setAccessoryBarVisible`, `setScroll`, `style` (`DARK`/`LIGHT`/`DEFAULT`), `autoBackdropColor` (8.0.4+), Android edge-to-edge/SystemBars interaction (drop legacy `resizeOnFullScreen` on Capacitor 8), iOS 26 fixes, and iOS input auto-zoom. Use when inputs are hidden behind the keyboard, the WebView jumps or leaves a white/black gap above the keyboard, fixed footers float mid-screen, `vh` layouts shrink, or keyboard events do not fire. Do not use for general safe-area/notch padding (safe-area-handling), Ionic component styling (ionic-design), or form accessibility (capacitor-accessibility).
---

# Keyboard Handling in Capacitor

## When to Use

TRIGGER when:
- Focused input is covered by the keyboard, or the page scrolls unexpectedly
- Chat composer / fixed footer does not stick to the keyboard
- White or black band above the keyboard (Android 15+ edge-to-edge, iOS backdrop)
- `100vh` / `dvh` layout collapses when the keyboard opens
- iOS zooms into inputs, or the QuickType/accessory bar looks wrong
- Keyboard events never fire or fire twice

Do not use:
- Notch / home-indicator / status-bar padding: `safe-area-handling`
- Ionic `ion-input`, `ion-footer` styling: `ionic-design`
- Labels, focus order, screen readers: `capacitor-accessibility`

## Platform model (the key decision)

| | iOS | Android |
|---|-----|---------|
| Who resizes | Plugin, per `resize` mode | OS + WebView; `resize` config is ignored |
| Events | `keyboardWillShow` before animation, `keyboardDidShow` after | Will/Did fire almost together |
| JS control | `setResizeMode`, `getResizeMode`, `setScroll`, `setStyle`, `setAccessoryBarVisible` (iPhone only) | `show()` (Android only), `hide()` |

iOS `resize` modes (`KeyboardResize` enum):

| Mode | Effect | Use when |
|------|--------|----------|
| `native` (default) | Whole WebView shrinks; `vh` units change | Plain web apps; simplest |
| `body` | Only `<body>` height changes; `vh` unchanged | Layouts that rely on stable `vh` |
| `ionic` | Only `ion-app` resizes | Ionic Framework apps only |
| `none` | Nothing resizes; you position with keyboard height | Custom chat UIs, full control |

## Workflow

1. **Inspect**: `capacitor.config.*` `plugins.Keyboard`, `@capacitor/keyboard` version (8.0.4+ includes iOS 26 and Android SystemBars fixes), whether Ionic is used, `@capacitor/status-bar` / SystemBars config, and the failing screen's CSS (`position: fixed`, `100vh`).
2. Reproduce on a **device** (simulators often use a hardware keyboard: iOS Simulator -> I/O -> Keyboard -> Toggle Software Keyboard).
3. Pick the iOS resize mode from the table; set it in config, not at runtime, unless one screen needs a different mode.
4. Fix Android separately (below).
5. Verify.

## Config

```ts
// capacitor.config.ts
import { KeyboardResize, KeyboardStyle } from '@capacitor/keyboard';

plugins: {
  Keyboard: {
    resize: KeyboardResize.Body,      // iOS only
    style: KeyboardStyle.Default,     // iOS only; JSON value is "DARK" | "LIGHT" | "DEFAULT"
    // resizeOnFullScreen: omit on Capacitor 8+ (SystemBars handles insets; see Android notes)
    autoBackdropColor: 'auto',        // iOS, 8.0.4+: 'off' (default) | 'auto' | 'dom'
  },
},
```

String values in JSON config are uppercase for `style` (`"DARK"`), lowercase for `resize` (`"body"`).

## Custom positioning (`resize: none` or chat UIs)

```ts
import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';

if (Capacitor.isNativePlatform()) {
  Keyboard.addListener('keyboardWillShow', ({ keyboardHeight }) => {
    document.documentElement.style.setProperty('--kb', `${keyboardHeight}px`);
  });
  Keyboard.addListener('keyboardWillHide', () => {
    document.documentElement.style.setProperty('--kb', '0px');
  });
}
```

```css
.composer {
  position: fixed;
  inset-inline: 0;
  bottom: max(var(--kb, 0px), env(safe-area-inset-bottom));
}
```

Use `max()`, not `+`: while the keyboard is up the home-indicator inset is already covered.

## Android notes

- Android 15+ (targetSdk 35) enforces edge-to-edge; Android 16 (targetSdk 36, Capacitor 8 default) removes the opt-out. The WebView now draws under system bars, so the keyboard inset must be handled. `@capacitor/keyboard` 7.0.2 fixed white space above the keyboard on Android 15+, and 8.0.3 fixed the interaction with the SystemBars core plugin. Update the plugin before writing workarounds.
- `resizeOnFullScreen: true` was the Capacitor <= 7 workaround for fullscreen / overlaid status bar. On Capacitor 8+ the SystemBars core plugin handles IME insets and logs ``You should omit `Keyboard.resizeOnFullScreen` in your `capacitor.config.json`. Other values can lead to unexpected behavior.`` unless `SystemBars.insetsHandling` is `disable`. Remove it.
- Do not add `android:windowSoftInputMode="adjustPan"` to fix overlap; it pans the whole window and breaks fixed headers. The template omits it (default resize behavior).
- `env(keyboard-inset-height)` and `interactive-widget` viewport meta are Chromium features; test on the target Android System WebView version before relying on them, and never on iOS.

## iOS notes

- Inputs with computed `font-size` < 16px make iOS zoom on focus. Use `font-size: 16px` (or larger) on inputs; do not disable user zoom globally (`maximum-scale=1`) as it hurts accessibility.
- `setAccessoryBarVisible({ isVisible: false })` hides the prev/next/done bar on iPhone; it has no effect on iPad.
- `setScroll({ isDisabled: true })` stops the WebView scroll view from bouncing when the keyboard opens; pair with `resize: none` for custom layouts.
- iOS 26 keyboard regressions and the iPad Magic Keyboard black QuickType bar were fixed in `@capacitor/keyboard` 8.0.4. If a black/white band appears behind the keyboard, set `autoBackdropColor: 'auto'` (uses `backgroundColor` from config, else the DOM body background) or `'dom'`.

## Verification

1. `npx cap sync` and run on a physical iPhone and an Android 15+/16 device.
2. For each form screen: focus first and last input; the focused field stays visible; footer sits on the keyboard; no gap above the keyboard; rotating with the keyboard open keeps layout.
3. Dismiss via swipe/back button: `keyboardWillHide` fires and `--kb` returns to 0.
4. iOS: confirm no zoom on focus; accessory bar state matches the design.
5. Check versions: `npm ls @capacitor/keyboard @capacitor/core`.

## Error Handling

| Symptom / message | Cause | Fix |
|-------------------|-------|-----|
| `"Keyboard" plugin is not implemented on web` or `"Keyboard.setAccessoryBarVisible()" is not implemented on android` | Plugin/method unavailable on that platform | Guard with `Capacitor.getPlatform() === 'ios'` |
| `show()` does nothing on iOS | `show()` is Android only | Focus an input from a user gesture instead |
| Footer floats in the middle after keyboard closes (Android) | WebView height not reset when keyboard hides without animation | Update to `@capacitor/keyboard` 8.0.4+ |
| White band above keyboard on Android 15+ | Edge-to-edge insets + old plugin | Update plugin (7.0.2+ / 8.0.3+); on Capacitor 8 remove `resizeOnFullScreen` |
| Logcat ``SystemBars: You should omit `Keyboard.resizeOnFullScreen` ...`` | Legacy config fighting SystemBars inset handling | Delete `resizeOnFullScreen` from config |
| `vh`-based screen shrinks on iOS | `resize: native` changes viewport | Switch to `body` or `none` |
| Ionic content jumps twice | `resize: native`/`body` plus Ionic's own handling | Use `resize: 'ionic'` |
| Listeners fire twice after navigation | Listener added per page mount, never removed | Keep the returned handle and `await handle.remove()` on unmount |
| Black QuickType bar on iPad with hardware keyboard | Pre-8.0.4 plugin bug | Update plugin |

## Resources

- Keyboard plugin API: https://capacitorjs.com/docs/apis/keyboard
- Plugin changelog: https://github.com/ionic-team/capacitor-keyboard/blob/main/CHANGELOG.md
- System Bars (edge-to-edge): https://capacitorjs.com/docs/apis/system-bars
