# Mobile Patterns with Tailwind v4

Load when building mobile layouts. Assumes the setup in SKILL.md (`plt-*` class, `dark` variant, `viewport-fit=cover`).

## Safe-area utilities (Android-robust)

```css
@utility pt-safe { padding-top: var(--safe-area-inset-top, env(safe-area-inset-top, 0px)); }
@utility pb-safe { padding-bottom: var(--safe-area-inset-bottom, env(safe-area-inset-bottom, 0px)); }
@utility pl-safe { padding-left: var(--safe-area-inset-left, env(safe-area-inset-left, 0px)); }
@utility pr-safe { padding-right: var(--safe-area-inset-right, env(safe-area-inset-right, 0px)); }
@utility mb-safe { margin-bottom: var(--safe-area-inset-bottom, env(safe-area-inset-bottom, 0px)); }
@utility bottom-safe { bottom: var(--safe-area-inset-bottom, env(safe-area-inset-bottom, 0px)); }
```

`--safe-area-inset-*` is injected by Capacitor 8 SystemBars on Android; elsewhere the `env()` fallback applies.

Spacing + inset as a functional utility:

```css
@utility pb-safe-* {
  padding-bottom: calc(var(--spacing) * --value(integer) + env(safe-area-inset-bottom, 0px));
}
```

Then `pb-safe-4`.

## App shell

```html
<div class="flex h-dvh flex-col bg-white dark:bg-zinc-950">
  <header class="pt-safe px-4 pb-2 backdrop-blur bg-white/80 dark:bg-zinc-900/80">...</header>
  <main class="flex-1 overflow-y-auto overscroll-contain">...</main>
  <nav class="pb-safe grid grid-cols-4 border-t border-zinc-200 dark:border-zinc-800">...</nav>
</div>
```

Pad the shell once; children stay inset-agnostic.

## Touch targets

```html
<button class="min-h-11 min-w-11 px-4 active:scale-[.98] active:opacity-80 pointer-coarse:min-h-12 select-none">
  Save
</button>
```

- 44pt (iOS) / 48dp (Android) minimum: `min-h-11` = 44px, `min-h-12` = 48px.
- `pointer-coarse:` (v4.1+) targets touch screens; `pointer-fine:` for mouse/trackpad (iPad with trackpad, Android desktop mode).
- Remove tap highlight: `@utility tap-transparent { -webkit-tap-highlight-color: transparent; }`.

## Platform-specific styling

```html
<h1 class="text-lg font-semibold ios:text-center android:text-left android:font-medium">Inbox</h1>
```

Behavior differences (back button, haptics) belong in code, not CSS.

## Dark mode

```ts
import { Preferences } from '@capacitor/preferences';
import { SystemBars, SystemBarsStyle } from '@capacitor/core';

export async function applyTheme(mode: 'light' | 'dark' | 'system') {
  const dark = mode === 'dark' || (mode === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark', dark);
  await SystemBars.setStyle({ style: dark ? SystemBarsStyle.Dark : SystemBarsStyle.Light });
  await Preferences.set({ key: 'theme', value: mode });
}
```

Listen to `matchMedia('(prefers-color-scheme: dark)').addEventListener('change', ...)` when mode is `system`. Set `color-scheme: light dark` on `:root` so native form controls and scrollbars follow.

## Inputs

```html
<input class="w-full rounded-lg border border-zinc-300 px-3 py-3 text-base user-invalid:border-red-500" inputmode="email" autocomplete="email" />
```

`text-base` (16px) prevents iOS focus zoom. `user-invalid:` (v4.1+) shows errors only after interaction.

## Bottom sheet (CSS only)

```html
<div class="fixed inset-x-0 bottom-0 rounded-t-2xl bg-white pb-safe shadow-2xl transition-transform duration-300 translate-y-full data-[open=true]:translate-y-0 dark:bg-zinc-900">
  ...
</div>
```

Animate `transform`/`opacity` only; avoid animating `height`/`top` on low-end Android.

## Performance

- v4 generates only used classes; bundle size is rarely the issue. Large CSS usually means `@source` scans too much (e.g. a sibling `ios/` or `android/` build folder). Add `@source not "../ios"; @source not "../android";` if they are inside the scanned root and not gitignored.
- `backdrop-blur` is expensive on older Android GPUs; test scroll performance.
