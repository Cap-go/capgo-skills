---
name: tailwind-capacitor
description: Sets up and uses Tailwind CSS v4 in Capacitor apps - CSS-first config (`@import "tailwindcss"`, `@theme`, `@utility`, `@custom-variant`, `@source`, `@plugin`), `@tailwindcss/vite` / `@tailwindcss/postcss`, upgrading from v3 `tailwind.config.js` with `npx @tailwindcss/upgrade`, WebView browser floor (Safari 16.4+ / Chrome 111+ vs Capacitor iOS 15/16 targets), safe-area utilities built on `env(safe-area-inset-*)`, platform variants (`ios:`/`android:` via a root class), class-based dark mode, `pointer-coarse:` touch targets, and hover-on-touch behavior. Use when installing Tailwind in a Capacitor project, styles do not apply after upgrading to v4, colors look wrong on older iPhones, or building mobile layouts with Tailwind. Do not use for Konsta UI components (konsta-ui), Ionic theming (ionic-design), native system bar / edge-to-edge config (safe-area-handling), or keyboard overlap (capacitor-keyboard).
---

# Tailwind CSS in Capacitor Apps

## When to Use

TRIGGER when:
- Adding Tailwind to a Capacitor app (Vite, Angular, Next static export, etc.)
- Upgrading Tailwind v3 -> v4, or a v4 install produces no styles
- `tailwind.config.js` edits have no effect (v4 is CSS-first)
- Colors / gradients broken or transparent on older iOS devices
- Safe-area, dark mode, platform-specific, or touch-target utilities

Do not use:
- Konsta UI setup/components: `konsta-ui`
- Ionic components and `--ion-*` variables: `ionic-design`
- SystemBars / Android edge-to-edge / status bar plugin: `safe-area-handling`
- Inputs hidden by keyboard: `capacitor-keyboard`
- Adding Capacitor to a framework: `framework-to-capacitor`

## Version facts (October 2026)

- `tailwindcss` 4.x is `latest` (4.3.x); 3.4.x on `v3-lts`.
- v4 is configured in CSS. `tailwind.config.js` is not read unless you add `@config "./tailwind.config.js";`.
- v4 targets **Safari 16.4+, Chrome 111+, Firefox 128+** (uses `@property`, `color-mix()`, cascade layers, oklch).
- Capacitor 8 supports iOS 15+, Capacitor 9 iOS 16+. WKWebView = the device's Safari version. **Devices on iOS 15.x - 16.3 render v4 styles incorrectly.** Android System WebView auto-updates, so Chrome 111+ is usually met (Capacitor 9 minSdk 26).

Decision: if the iOS deployment target (or real user base) includes iOS < 16.4, ask the user: stay on Tailwind 3.4, or raise the minimum OS. Do not silently ship v4.

## Workflow

1. **Inspect**: `npm ls tailwindcss`, `tailwind.config.*`, `postcss.config.*`, bundler config, main CSS file, `ios/App/App.xcodeproj` `IPHONEOS_DEPLOYMENT_TARGET`, presence of Ionic or Konsta.
2. **New install** (below) or **upgrade**: [references/v3-to-v4.md](references/v3-to-v4.md).
3. **Mobile utilities** (safe areas, platform variants, touch, dark mode): [references/mobile-patterns.md](references/mobile-patterns.md).
4. **Verify** (below).

Only load a reference when its topic is in play.

## Install (Vite: React, Vue, Svelte, Solid)

```bash
npm i tailwindcss @tailwindcss/vite
```

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
export default defineConfig({ plugins: [tailwindcss() /* + framework plugin */] });
```

```css
/* src/styles.css */
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));
@custom-variant ios (&:where(.plt-ios, .plt-ios *));
@custom-variant android (&:where(.plt-android, .plt-android *));

@theme {
  --color-brand: oklch(0.55 0.2 265);
  --font-sans: system-ui, -apple-system, "Roboto", sans-serif;
}

@utility pt-safe { padding-top: env(safe-area-inset-top); }
@utility pb-safe { padding-bottom: env(safe-area-inset-bottom); }
@utility px-safe { padding-left: env(safe-area-inset-left); padding-right: env(safe-area-inset-right); }
```

Other toolchains: PostCSS (Angular, webpack, Next) -> `npm i tailwindcss @tailwindcss/postcss` and `postcss.config.mjs` `{ plugins: { "@tailwindcss/postcss": {} } }`; standalone -> `@tailwindcss/cli`. Angular CLI 17+ reads `.postcssrc.json`.

```ts
// main.ts: platform class for ios:/android: variants
import { Capacitor } from '@capacitor/core';
document.documentElement.classList.add(`plt-${Capacitor.getPlatform()}`); // plt-ios | plt-android | plt-web
```

Add `viewport-fit=cover` to the viewport meta or the safe-area utilities resolve to 0.

## Traps

- Content detection is automatic in v4 (respects `.gitignore`). Classes in `node_modules` or outside the project root need `@source "../path";`. Dynamic class names (`` `bg-${color}-500` ``) are never generated; map to full class strings.
- v4 `hover:` only applies on devices with `(hover: hover)`, so sticky hover on touch is solved by default. Use `active:` for press feedback.
- v4 defaults changed: border color is `currentColor`, `ring` is 1px, `shadow-sm`/`shadow` and `rounded-sm`/`rounded` scales shifted, `outline-none` -> `outline-hidden`. The upgrade tool renames most; review visually.
- Ionic + Tailwind: Preflight resets Ionic typography. Import Tailwind without Preflight (`@layer theme, base, components, utilities; @import "tailwindcss/theme.css" layer(theme); @import "tailwindcss/utilities.css" layer(utilities);`) or load Ionic CSS after Tailwind.
- Konsta UI v5 already imports Tailwind theme pieces via `konsta/<fw>/theme.css`; follow `konsta-ui` instead of duplicating setup.
- Do not use `100vh` for full-screen layouts; use `h-dvh` (v4 has `dvh`/`svh`/`lvh` utilities) or a flex shell.
- Android WebView < 140 reports safe-area `env()` as 0; Capacitor 8 SystemBars injects `--safe-area-inset-*`. For Android robustness, use `@utility pt-safe { padding-top: var(--safe-area-inset-top, env(safe-area-inset-top)); }` (see `safe-area-handling`).

## Verification

1. `npm run build` succeeds; built CSS contains your utilities: `grep -c "pt-safe" dist/assets/*.css`.
2. `npx cap sync` and run on: oldest supported iOS version (check colors, gradients, shadows render), current iPhone, Android 15/16.
3. Toggle dark mode class and OS appearance; check `ios:`/`android:` variants by inspecting `<html class>`.
4. Leftovers after upgrade: `grep -rn "@tailwind base\|@tailwind components\|@tailwind utilities\|require('tailwindcss')" src postcss.config.* 2>/dev/null` returns nothing.

## Error Handling

| Error / symptom | Cause | Fix |
|-----------------|-------|-----|
| `[postcss] It looks like you're trying to use tailwindcss directly as a PostCSS plugin. The PostCSS plugin has moved to a separate package` | v3-style PostCSS config with v4 | Use `@tailwindcss/postcss` (or `@tailwindcss/vite`) |
| No styles at all | Missing `@import "tailwindcss"` or bundler plugin | Add both |
| `Cannot apply unknown utility class` in `@apply` | Custom class not defined via `@utility`, or CSS module / Vue `<style>` without theme reference | Define with `@utility`; add `@reference "../styles.css";` in the scoped style |
| `tailwind.config.js` theme changes ignored | v4 does not auto-load JS config | Move to `@theme`, or add `@config` |
| Transparent/missing colors on some iPhones | iOS < 16.4 lacks features v4 uses | Raise min iOS or stay on 3.4 |
| `dark:` follows OS, ignores toggle | Default dark variant is media-based | Add `@custom-variant dark (&:where(.dark, .dark *));` |
| Upgrade tool fails: requires Node | `@tailwindcss/upgrade` needs Node 20+ | Upgrade Node (Capacitor 9 needs 24+ anyway) |

## Resources

- Tailwind v4 install (Vite): https://tailwindcss.com/docs/installation/using-vite
- Upgrade guide: https://tailwindcss.com/docs/upgrade-guide
- Theme variables: https://tailwindcss.com/docs/theme
- Browser support: https://tailwindcss.com/docs/compatibility
- Dark mode: https://tailwindcss.com/docs/dark-mode
