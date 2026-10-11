# React + Capacitor

## Vite (recommended)

Current: Vite 8 (Rolldown-based), `create-vite` 9. Output `dist/`.

```bash
npm create vite@latest my-app -- --template react-ts
```

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/',            // keep root base for the app build
  build: { outDir: 'dist' },
  server: { host: true }, // LAN access for live reload on devices
});
```

`webDir: 'dist'`. `BrowserRouter` / `createBrowserRouter` work because Capacitor falls back to `index.html` for extensionless paths; `HashRouter` is only needed if you already depend on hash URLs.

## React Router framework mode (v7/v8, ex-Remix)

Server rendering must be off:

```ts
// react-router.config.ts
import type { Config } from '@react-router/dev/config';

export default {
  ssr: false,
} satisfies Config;
```

- Output: `build/client` (contains `index.html`). `webDir: 'build/client'`.
- The root route still renders at build time, so route modules must be SSR-safe (no `window` at module scope).
- `loader` functions do not run in the app; use `clientLoader`.
- With `prerender` configured, the SPA fallback is written to `build/client/__spa-fallback.html` and `index.html` is the prerendered `/`. Capacitor always serves `index.html`, so avoid prerendering non-root routes for the app build or verify cold-start behaviour.

## TanStack Router / Start

TanStack Router on Vite is a normal SPA (`dist`). TanStack Start needs SPA/static mode; check its current docs for the SPA output directory and set `webDir` to the folder that contains `index.html`.

## Create React App (legacy)

CRA is deprecated. Existing projects build to `build/` (`webDir: 'build'`) and use `REACT_APP_*` env vars. Recommend migrating to Vite when touching the build; do not start new projects on CRA.

## Traps

- `import.meta.env.VITE_*` is inlined at build time. Use a separate `.env.mobile` + `vite build --mode mobile` if the app build needs different API URLs.
- `vite preview` testing is not equivalent to the device: test the synced app.
- Service workers (`vite-plugin-pwa`) are usually unnecessary in the app and can serve stale bundles after updates. Disable them for the mobile build or scope them carefully, especially when using Capgo live updates.
