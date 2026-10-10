# Ionic Theming

Load when changing colors, dark mode, fonts, or platform-specific styles.

## Brand colors

Each color needs the full set; generate with the Ionic Color Generator (https://ionicframework.com/docs/theming/color-generator).

```css
/* src/theme/variables.css */
:root {
  --ion-color-primary: #4f46e5;
  --ion-color-primary-rgb: 79, 70, 229;
  --ion-color-primary-contrast: #ffffff;
  --ion-color-primary-contrast-rgb: 255, 255, 255;
  --ion-color-primary-shade: #4640ca;
  --ion-color-primary-tint: #6159e8;
}
```

Custom named color (`color="brand"`):

```css
:root { --ion-color-brand: #0ea5e9; --ion-color-brand-rgb: 14,165,233; --ion-color-brand-contrast: #fff;
        --ion-color-brand-contrast-rgb: 255,255,255; --ion-color-brand-shade: #0c91cd; --ion-color-brand-tint: #26aeed; }
.ion-color-brand {
  --ion-color-base: var(--ion-color-brand); --ion-color-base-rgb: var(--ion-color-brand-rgb);
  --ion-color-contrast: var(--ion-color-brand-contrast); --ion-color-contrast-rgb: var(--ion-color-brand-contrast-rgb);
  --ion-color-shade: var(--ion-color-brand-shade); --ion-color-tint: var(--ion-color-brand-tint);
}
```

Global app variables: `--ion-background-color`, `--ion-text-color`, `--ion-font-family`, `--ion-toolbar-background`, `--ion-item-background`, `--ion-tab-bar-background`, `--ion-safe-area-*`.

## Dark mode (Ionic 8+ palettes)

Import exactly one dark palette after core CSS:

| File | Activates |
|------|-----------|
| `css/palettes/dark.system.css` | OS dark setting (`prefers-color-scheme`) |
| `css/palettes/dark.always.css` | Always dark |
| `css/palettes/dark.class.css` | When `<html>` has class `ion-palette-dark` |

High contrast: `high-contrast.system.css`, `high-contrast-dark.system.css` (and `.always` / `.class` variants).

Manual toggle with the class palette:

```ts
document.documentElement.classList.toggle('ion-palette-dark', isDark);
```

Persist the choice with `@capacitor/preferences`. Sync native chrome: `SystemBars.setStyle({ style: isDark ? SystemBarsStyle.Dark : SystemBarsStyle.Light })` (see `safe-area-handling`) and match the splash background (`capacitor-splash-screen`).

Override palette values for dark only:

```css
.ion-palette-dark { --ion-background-color: #0b0b0f; }        /* class palette */
@media (prefers-color-scheme: dark) { :root { --ion-background-color: #0b0b0f; } } /* system palette */
```

## Platform modes

- Mode comes from the platform (`ios` on iPhone/iPad, `md` elsewhere). Force globally with `setupIonicReact({ mode: 'ios' })` / `IonicVue` / `provideIonicAngular({ mode })`, or per component with `mode="md"`.
- Mode-specific CSS: `.ios ion-toolbar { ... }` / `.md ion-toolbar { ... }` (class on `<html>`).
- Preview in browser: `?ionic:mode=ios`.

## Styling inside components

Prefer documented CSS custom properties (`--background`, `--color`, `--border-radius`, `--padding-start`). If none exists, use shadow parts:

```css
ion-button::part(native) { letter-spacing: 0; }
ion-select::part(icon) { color: var(--ion-color-medium); }
```

Ionic 9 changed internal DOM of `ion-input`, `ion-select`, `ion-textarea` (new `.input-control`, `part="control"`, etc.). Selectors targeting internal classes break across majors; use parts and variables.

## Tailwind with Ionic

Works, but disable Tailwind's Preflight or import it before Ionic CSS to avoid resetting Ionic typography; map Tailwind colors to Ionic variables (`--color-primary: var(--ion-color-primary)` in `@theme`). See `tailwind-capacitor`.
