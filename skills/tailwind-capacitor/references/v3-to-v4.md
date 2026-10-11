# Tailwind v3 -> v4 in a Capacitor Project

Load when upgrading an existing Tailwind 3 setup.

## Before

1. Check the iOS floor: `grep -m1 IPHONEOS_DEPLOYMENT_TARGET ios/App/App.xcodeproj/project.pbxproj`. v4 needs Safari 16.4+. If the target is lower, ask the user whether to raise it or stay on `tailwindcss@3` (`v3-lts`).
2. Commit or branch first; the tool rewrites templates and CSS.
3. Node 20+ required by the upgrade tool.

## Automated

```bash
npx @tailwindcss/upgrade
```

It migrates `tailwind.config.js` into CSS `@theme`, replaces `@tailwind` directives with `@import "tailwindcss"`, renames changed utilities in templates, and swaps PostCSS config. Review the diff; JS-only config (functions, complex plugins) may be left behind with an `@config` reference.

## Manual mapping

| v3 | v4 |
|----|----|
| `@tailwind base; @tailwind components; @tailwind utilities;` | `@import "tailwindcss";` |
| `tailwind.config.js` `theme.extend.colors.brand` | `@theme { --color-brand: ...; }` |
| `content: [...]` | automatic; extra paths via `@source "..."` |
| `darkMode: 'class'` | `@custom-variant dark (&:where(.dark, .dark *));` |
| `plugins: [require('@tailwindcss/forms')]` | `@plugin "@tailwindcss/forms";` |
| `postcss.config.js` `tailwindcss: {}, autoprefixer: {}` | `"@tailwindcss/postcss": {}` (autoprefixing built in) |
| Custom `@layer components { .btn {...} }` | `@utility btn { ... }` (works with variants) |
| `theme()` in CSS | `var(--color-brand)` |
| `shadow-sm` / `shadow` | `shadow-xs` / `shadow-sm` |
| `rounded-sm` / `rounded` | `rounded-xs` / `rounded-sm` |
| `outline-none` | `outline-hidden` |
| `ring` (3px) | `ring-3` |
| `bg-opacity-50` | `bg-black/50` |
| `flex-shrink-0` / `flex-grow` | `shrink-0` / `grow` |

## Mobile-specific checks after upgrade

- Safe-area plugins for v3 (e.g. `tailwindcss-safe-area`) may not support v4; replace with `@utility` definitions (see mobile-patterns).
- `hover:` now only on hover-capable devices; remove manual `@media (hover: hover)` wrappers.
- Default border color is `currentColor`; borders that were gray become text-colored. Add `border-gray-200` (or set a base style).
- Placeholder color now uses current text color at 50% opacity.
- Buttons get `cursor: default` (Preflight); irrelevant on touch.

## Verify

```bash
npm run build
grep -rn "@tailwind \|theme(" src --include=*.css
npx cap sync && npx cap run ios
```

Compare key screens before/after on the oldest supported iOS device.
