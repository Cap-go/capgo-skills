# Accessibility Testing for Capacitor Apps

## Automated (web build)

- Playwright + axe (`@axe-core/playwright`):
  ```ts
  import AxeBuilder from '@axe-core/playwright';
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag22aa']).analyze();
  expect(results.violations).toEqual([]);
  ```
- CLI spot check: `npx @axe-core/cli@latest http://localhost:5173 --tags wcag2a,wcag2aa`.
- Automated tools catch only part of the issues; device testing is still required.

## iOS

- Accessibility Inspector: Xcode > Open Developer Tool > Accessibility Inspector, target the simulator or a connected device; it inspects WebView elements (label, traits, frame) and runs an audit.
- VoiceOver on device: Settings > Accessibility > VoiceOver, or set the Accessibility Shortcut (triple-click side button). Swipe right/left moves, double-tap activates, two-finger swipe up reads all, rotor (two-finger rotate) jumps by headings/links.
- Simulator settings (`xcrun simctl ui`):
  - `xcrun simctl ui booted content_size accessibility-extra-extra-extra-large` (reset: `large`)
  - `xcrun simctl ui booted increase_contrast enabled`
  - `xcrun simctl ui booted appearance dark`
- Safari Web Inspector > Elements > Node > Accessibility shows computed role/name for the WebView DOM.

## Android

- TalkBack on device: Settings > Accessibility > TalkBack (or the volume-keys shortcut). Swipe right/left moves, double-tap activates.
- Toggle via adb (device with TalkBack installed):
  ```bash
  adb shell settings put secure enabled_accessibility_services com.google.android.marvin.talkback/com.google.android.marvin.talkback.TalkBackService
  adb shell settings put secure enabled_accessibility_services ""   # off
  ```
- Font scale: `adb shell settings put system font_scale 2.0` (reset `1.0`). Display size: Settings > Display > Display size.
- Accessibility Scanner app (Google Play) flags touch target, contrast, and label issues on the running app.
- chrome://inspect > Elements > Accessibility pane shows computed names.

## Per-screen checklist

- [ ] Every interactive element: name, role, state announced (checked, expanded, selected, disabled).
- [ ] Reading order matches visual order; closed drawers/modals are `inert` or `aria-hidden`.
- [ ] Modals trap focus and return it on close; Android back closes them (`@capacitor/app` `backButton` listener).
- [ ] Route change announced or focus moved to `h1`.
- [ ] Form errors linked with `aria-describedby` and announced on submit.
- [ ] Text reflows at 200% / largest Dynamic Type; no truncated labels.
- [ ] Contrast: 4.5:1 body text, 3:1 large text and UI component boundaries.
- [ ] Targets >= 24x24 CSS px (WCAG 2.2), preferably 44 pt / 48 dp.
- [ ] Reduce Motion respected.
- [ ] iPad with hardware keyboard: Tab order works and a `:focus-visible` ring is visible.
