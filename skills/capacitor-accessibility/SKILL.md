---
name: capacitor-accessibility
description: Makes Capacitor apps work with VoiceOver, TalkBack, Dynamic Type / Android font scale, Switch Control, hardware keyboards, Reduce Motion and Increase Contrast. Covers Capacitor-specific gaps - WKWebView not following iOS Dynamic Type, Android WebView text zoom breaking layouts, zoomEnabled/user-scalable, SPA route changes not announced, native views under the WebView (maps, camera preview) being unreachable, @capacitor/screen-reader (isEnabled, speak, stateChange) and @capacitor/text-zoom (getPreferred, set) - plus testing with Accessibility Inspector, simctl content_size, adb font_scale, TalkBack and axe-core, mapped to WCAG 2.2. Do not use for Ionic component styling (use ionic-design), notch/home-indicator layout (use safe-area-handling), keyboard overlap bugs (use capacitor-keyboard), automated test framework setup (use capacitor-testing), or App Store metadata (use capacitor-app-store).
---

# Accessibility in Capacitor Apps

The UI is web content inside WKWebView / Android WebView, so standard semantic HTML and ARIA do most of the work. This skill covers where the WebView and native layers behave differently from a browser.

## When to Use

TRIGGER when:
- User asks for VoiceOver/TalkBack support, an accessibility audit, WCAG 2.2 / EAA / ADA compliance.
- Text does not grow with iOS Larger Text, or the layout breaks at large Android font sizes.
- Screen reader does not announce page changes, toasts, or loading states.
- A native view (map, camera preview, video player) cannot be reached by the screen reader.
- User wants `@capacitor/screen-reader` or `@capacitor/text-zoom`.

Do not use:
- Ionic component APIs/theming -> `ionic-design`; Konsta/Tailwind -> `konsta-ui`, `tailwind-capacitor`.
- Content under notch/home indicator -> `safe-area-handling`.
- Keyboard covering inputs -> `capacitor-keyboard`.
- E2E test infrastructure -> `capacitor-testing`.

## Procedure

1. **Inventory screens** into a TODO list (auth, main tabs, forms, modals, media, settings). Audit one at a time.
2. **Automated pass** on the web build: run axe (`@axe-core/playwright` in tests, or `npx @axe-core/cli@latest http://localhost:5173`) and fix violations first (names, roles, contrast, labels).
3. **Device pass** per screen with VoiceOver and TalkBack, largest text size, Reduce Motion, and a Bluetooth keyboard (iPad). Use the checks in `references/testing.md`.
4. **Fix Capacitor-specific traps** below.
5. **Report** findings per screen with WCAG criterion, severity, and fix before large refactors; ask before changing design tokens (colors, font sizes).

## Capacitor-Specific Traps

1. **iOS Dynamic Type is ignored by default.** WKWebView renders `px`/`rem` text at fixed size regardless of Settings > Accessibility > Larger Text. Options:
   - CSS: `html { font: -apple-system-body; }` and size everything else in `rem`/`em` (WebKit maps this to the user's content size category; updates live).
   - Or `TextZoom.getPreferred()` then `TextZoom.set({ value })` from `@capacitor/text-zoom` on launch and on `resume`. On iPad this requires `ios.preferredContentMode: 'mobile'` in `capacitor.config.*`.
   Pick one, not both, or text scales twice.
2. **Android font scale applies automatically.** Android WebView scales text with the system font size, so fixed-height containers, `line-clamp`, and absolute layouts overflow at 200%. Test with `adb shell settings put system font_scale 2.0` and design for reflow (WCAG 1.4.4, 1.4.10).
3. **Pinch zoom.** `zoomEnabled` defaults to `false` and many templates ship `user-scalable=no`. Users can still scale text via traps 1/2; if you rely on zoom instead, set `zoomEnabled: true` and drop `user-scalable=no`.
4. **SPA navigation is silent.** Route changes do not trigger a page-load announcement. After navigation set `document.title`, move focus to the main heading (`<h1 tabindex="-1">`), or update a polite live region. Do not use `ScreenReader.speak` as the primary mechanism: it only speaks when a screen reader is active and bypasses the user's verbosity settings.
5. **Native views under or over the WebView.** `@capacitor/google-maps` renders a native map behind a transparent WebView region; camera preview plugins do the same. The screen reader sees the WebView, not the native view. Provide an accessible alternative (list of markers, text summary, capture button with label) in HTML.
6. **Native plugin UI.** Dialogs, action sheets, share sheets, pickers from official plugins are native and accessible by default; custom native screens in your own plugins need `accessibilityLabel`/`contentDescription` (see `references/native.md`).
7. **Touch targets.** Apple HIG minimum 44x44 pt; Material 48x48 dp; WCAG 2.2 2.5.8 minimum 24x24 CSS px. Icon buttons need padding, not just a small SVG.
8. **Motion and contrast.** `prefers-reduced-motion` and `prefers-contrast` media queries work in both WebViews. Disable parallax/auto-playing transitions under reduce motion; test Increase Contrast.
9. **Status changes.** Toasts (`@capacitor/toast` is native and announced), inline errors, spinners: use `role="status"` / `aria-live="polite"` for web toasts and `aria-busy` on loading regions; use `role="alert"` only for errors.
10. **Focus after native round-trips.** After a native modal (camera, share, auth browser) closes, focus may land on `<body>`. Restore focus to the triggering control on `appStateChange`/promise resolution.

## Verification

- axe: zero critical/serious violations on each audited route.
- VoiceOver (iOS) and TalkBack (Android): every control has a spoken name, role, and state; swipe order follows visual order; route change is announced or focus moves to heading.
- Largest text: `xcrun simctl ui booted content_size accessibility-extra-extra-extra-large` and `adb shell settings put system font_scale 2.0`; no clipped or overlapping text, no horizontal scroll on body.
- Grep: `grep -rnE "user-scalable=no|maximum-scale=1" index.html src/` and `grep -rn "outline: *none\|outline: *0" src/` (each must have a `:focus-visible` replacement).
- Reset after testing: `adb shell settings put system font_scale 1.0`, `xcrun simctl ui booted content_size large`.

## Error Handling

| Symptom / message | Fix |
|---|---|
| `ScreenReader.isEnabled` rejects/unavailable on web | Not supported on web (screen readers cannot be detected); guard with `Capacitor.isNativePlatform()`. |
| `speak` throws on web | Browser lacks SpeechSynthesis; only call on native or feature-detect `'speechSynthesis' in window`. |
| `"TextZoom" plugin is not implemented on web` | text-zoom is native only; skip on web. |
| Text zoom has no effect on iPad | Set `ios.preferredContentMode: 'mobile'`. |
| Text scaled twice on iOS | Using both `-apple-system-body` and TextZoom; keep one. |
| VoiceOver reads "button" with no name | Icon-only control missing `aria-label` or visible text. |

## References

Only load when the topic is in play:
- `references/testing.md`: VoiceOver/TalkBack gestures, Accessibility Inspector, Android Accessibility Scanner, adb/simctl setting commands, axe in Playwright, per-screen checklist.
- `references/native.md`: Swift/Kotlin accessibility APIs for custom native plugin views, posting announcements from native code.
