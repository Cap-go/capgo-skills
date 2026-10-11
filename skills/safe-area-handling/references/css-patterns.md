# Safe Area CSS Patterns

Load when building the layout shell, tab bars, full-bleed headers, reading insets in JS, or debugging.

Assumes the `--sat/--sar/--sab/--sal` variables from SKILL.md.

## Layout shell

```css
html, body, #app { height: 100%; margin: 0; }
#app { display: flex; flex-direction: column; height: 100dvh; }
.app-header { flex: none; padding: var(--sat) var(--sar) 0 var(--sal); }
.app-main   { flex: 1; overflow-y: auto; overscroll-behavior: contain; padding-inline: var(--sal) var(--sar); }
.app-tabbar { flex: none; padding: 0 var(--sar) var(--sab) var(--sal); min-height: calc(49px + var(--sab)); }
```

Pad the shell once. Inner components should not read safe-area values.

## Full-bleed hero

```css
.hero {
  background: linear-gradient(#4f46e5, #7c3aed); /* extends under the status bar */
  padding: calc(var(--sat) + 16px) calc(var(--sar) + 16px) 16px calc(var(--sal) + 16px);
}
```

## Floating action button / toast

```css
.fab { position: fixed; right: calc(var(--sar) + 16px); bottom: calc(var(--sab) + 16px); }
```

## Reading insets in JS (only when CSS cannot do it, e.g. canvas, maps)

```ts
export function readInsets() {
  const cs = getComputedStyle(document.documentElement);
  const px = (v: string) => parseFloat(cs.getPropertyValue(v)) || 0;
  return { top: px('--sat'), right: px('--sar'), bottom: px('--sab'), left: px('--sal') };
}
```

`getPropertyValue('--sat')` returns the unresolved string (`var(...)`) in some engines. If so, resolve with a probe:

```ts
const probe = document.createElement('div');
probe.style.cssText = 'position:fixed;visibility:hidden;padding:var(--sat) var(--sar) var(--sab) var(--sal)';
document.body.appendChild(probe);
const s = getComputedStyle(probe);
const insets = { top: parseFloat(s.paddingTop), right: parseFloat(s.paddingRight), bottom: parseFloat(s.paddingBottom), left: parseFloat(s.paddingLeft) };
probe.remove();
```

Re-read on `resize` (covers rotation, iPad windowed resizing, foldables, split screen). `orientationchange` is deprecated and misses window resizes.

## Resizable windows (iPad, foldables, Android desktop/split screen)

- Window size, not device, decides layout. Use container queries / `min-width` media queries, not user-agent or `Device.getInfo().model` checks.
- Insets can be 0 in a windowed iPad app and non-zero full-screen; never assume a value per device.
- Native side (scene geometry, `UIScreen.main` removal): `capacitor-ios-resizability`.

## Debug overlay

```css
.debug-safe::before, .debug-safe::after {
  content: ''; position: fixed; left: 0; right: 0; z-index: 99999; pointer-events: none;
}
.debug-safe::before { top: 0; height: var(--sat); background: rgb(255 0 0 / .3); }
.debug-safe::after  { bottom: 0; height: var(--sab); background: rgb(0 0 255 / .3); }
```

Add `class="debug-safe"` to `<body>` temporarily; remove before release.

## Framework notes

- Ionic: uses `--ion-safe-area-top|right|bottom|left` (default `env()`); override those instead of padding `body`. On Android with old WebViews, map them: `:root { --ion-safe-area-top: var(--safe-area-inset-top, env(safe-area-inset-top)); }` and the same for the other sides.
- Konsta UI: `<App safeAreas>` plus `safe-areas` utilities; see `konsta-ui`.
- Tailwind: arbitrary values like `pt-[var(--sat)]` or a small `@utility`; see `tailwind-capacitor`.
