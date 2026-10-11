---
name: konsta-ui
description: Builds Capacitor app UI with Konsta UI v5 (Tailwind CSS v4-based iOS and Material components for React 19, Vue 3, Svelte 5) - CSS-first setup (`@import 'tailwindcss'; @import 'konsta/react/theme.css';`), `--color-brand-*` colors in `@theme`, `<App theme="ios|material|parent" safeAreas dark>`, `KonstaProvider` when mixing with Ionic, `ios:`/`material:` variants, `pt-safe`/`no-safe-areas` utilities, `k-md-vibrant`/`k-md-monochrome`, and migrating from Konsta v3/v4 `konstaConfig` in `tailwind.config.js`. Use when installing or upgrading Konsta, components render unstyled, theme or dark mode does not switch, or Navbar/Tabbar overlap system bars. Do not use for Ionic components (ionic-design), plain Tailwind setup without Konsta (tailwind-capacitor), or native safe-area/edge-to-edge config (safe-area-handling).
---

# Konsta UI for Capacitor

## When to Use

TRIGGER when:
- Adding Konsta UI to a Capacitor app or choosing it over Ionic
- Upgrading Konsta v3/v4 (Tailwind v3 `konstaConfig`) to v5 (Tailwind v4)
- Components unstyled, colors ignored, `ios:`/`material:` classes do nothing
- Navbar / Tabbar under the status bar or gesture bar
- Theme should follow platform (`ios` on iPhone, `material` on Android)

Do not use:
- Ionic Framework components or theming: `ionic-design`
- Tailwind install/config without Konsta: `tailwind-capacitor`
- Android SystemBars / edge-to-edge native config: `safe-area-handling`
- Keyboard overlap in forms: `capacitor-keyboard`

## Versions (October 2026)

| Konsta | Tailwind | Frameworks | Config style |
|--------|----------|------------|--------------|
| 5.x (`latest`, 5.5.0) | v4 | React 19 (`ref` as prop), Vue 3, Svelte 5 (runes, snippets) | CSS: `@import 'konsta/<fw>/theme.css'` + `@theme` |
| 4.x | v3 | adds Svelte 5 types | JS: `konstaConfig()` in `tailwind.config.js` |
| 3.x and below | v3 | | JS `konstaConfig()` |

Check first: `npm ls konsta tailwindcss react vue svelte`. Never mix v5 CSS setup with a `tailwind.config.js` `konstaConfig` wrapper.

## Workflow

1. **Inspect** versions, main CSS file, `tailwind.config.*`, `postcss.config.*`, `vite.config.*`, `index.html` viewport meta, whether Ionic is also present.
2. **Install / upgrade** (below). For an existing Tailwind v3 project, migrate Tailwind first (`tailwind-capacitor`).
3. **Wrap the app** in `App` (or `KonstaProvider` with Ionic/Framework7).
4. **Build screens** with components: [references/components.md](references/components.md).
5. **Verify** (below).

Only load a reference when its topic is in play.

## Setup (v5, React shown; Vue/Svelte use `konsta/vue/theme.css` / `konsta/svelte/theme.css`)

```bash
npm i konsta tailwindcss @tailwindcss/vite
```

```ts
// vite.config.ts
import tailwindcss from '@tailwindcss/vite';
export default defineConfig({ plugins: [react(), tailwindcss()] });
```

```css
/* src/index.css */
@import 'tailwindcss';
@import 'konsta/react/theme.css';

@theme {
  --color-brand-primary: #007aff; /* only --color-brand-* drive component colors */
  --color-brand-red: #ff3b30;     /* use with class k-color-brand-red */
}
```

```tsx
import { Capacitor } from '@capacitor/core';
import { App } from 'konsta/react';

const theme = Capacitor.getPlatform() === 'android' ? 'material' : 'ios';

export default function Root() {
  return (
    <App theme={theme} safeAreas>
      {/* pages */}
    </App>
  );
}
```

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
```

`App` props: `theme` (`'ios' | 'material' | 'parent'`, default `material`), `safeAreas` (default `true`), `dark`, `iosHoverHighlight`, `materialTouchRipple` (global switches added in v5). Only one `App` per app.

Material Roboto font: add it yourself (Google Fonts link or self-hosted for offline). iOS uses the system font.

## Migrating v4 -> v5

| v4 | v5 |
|----|----|
| `tailwind.config.js`: `module.exports = konstaConfig({...})` | Delete wrapper; `@import 'konsta/react/theme.css'` in CSS |
| `konstaConfig.colors.primary` | `@theme { --color-brand-primary: ... }` |
| Per-component ripple config | Prefer the global `App materialTouchRipple`; check component types in your installed version |
| `SegmentedButton strong rounded` | Removed; use Segmented theme-specific style props |
| `Link navbar/toolbar/tabbar` props | Removed; context-driven |
| React `forwardRef` usage / `innerRef` patterns | `ref` prop (React 19) |
| Svelte slots | `{#snippet ...}` |

Then run the Tailwind v4 upgrade (`npx @tailwindcss/upgrade`) if Tailwind itself is still v3; see `tailwind-capacitor`.

## Traps

- With Ionic in the same app, use `KonstaProvider` (not `App`) and pick one owner for safe areas (Ionic's `--ion-safe-area-*` or Konsta's `safe-areas`), not both.
- Dark mode in Konsta v5 is class-based (`@custom-variant dark (&:where(.dark, .dark *))` in its CSS): toggle `dark` on `<html>`, set `App dark`, and match native bars with `SystemBars.setStyle`.
- Konsta's own docs show `user-scalable=no, maximum-scale=1`; prefer allowing zoom for accessibility and fix iOS input zoom with 16px inputs instead.
- Modals/side panels that are not full-screen need `no-safe-areas` (or `no-safe-areas-top` etc.) to avoid extra padding.
- Konsta is UI only: no router, no page transitions. Pair with React Router / Vue Router / SvelteKit and handle Android back button with `@capacitor/app` `backButton`.

## Verification

1. `npm run build && npx cap sync`, run on iOS and Android.
2. Inspect `<html>`/root: `.k-ios` or `.k-material` class present; `ios:`/`material:` utilities apply.
3. Navbar clears the Dynamic Island; Tabbar clears the home indicator and Android gesture bar (Android 15+ edge-to-edge).
4. Toggle dark mode; components and status bar icons switch together.
5. Leftover check: `grep -rn "konstaConfig\|konsta/config" .` returns nothing on v5.

## Error Handling

| Error / symptom | Cause | Fix |
|-----------------|-------|-----|
| `Cannot find module 'konsta/config'` | v5 removed JS config | Use CSS `@import 'konsta/react/theme.css'` |
| Components render unstyled | Theme CSS not imported, or Tailwind not scanning (no `@tailwindcss/vite` / `@tailwindcss/postcss`) | Import theme after `@import 'tailwindcss'`; add the Tailwind plugin |
| `[postcss] It looks like you're trying to use tailwindcss directly as a PostCSS plugin` | Tailwind v4 PostCSS plugin moved | Use `@tailwindcss/postcss` or `@tailwindcss/vite` |
| Brand color ignored | Variable not named `--color-brand-*`, or defined outside `@theme` | Rename inside `@theme` |
| `ios:` classes have no effect | `App`/`KonstaProvider` missing, so no `.k-ios` ancestor | Wrap app |
| React warning about `ref` / `forwardRef` after upgrade | React 18 with Konsta 5 | Upgrade to React 19 or stay on Konsta 4 |
| Double top padding | Konsta `safeAreas` + Ionic or custom `env()` padding | Keep one owner |

## Resources

- Konsta UI: https://konstaui.com
- React installation: https://konstaui.com/react/installation
- Safe areas: https://konstaui.com/react/safe-areas
- Colors: https://konstaui.com/react/colors
- Changelog: https://github.com/konstaui/konsta/blob/master/CHANGELOG.md
