# Vue and Nuxt + Capacitor

## Vue + Vite

```bash
npm create vue@latest my-app
```

- Output `dist/`, `webDir: 'dist'`.
- `createWebHistory()` works (Capacitor serves `index.html` for extensionless paths). `createWebHashHistory()` is optional. Current vue-router major is 5.
- Keep Vite `base: '/'` for the app build.

## Nuxt 4

Nuxt must generate a client-only SPA:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  ssr: false,
});
```

```bash
npx nuxt generate      # nuxi generate also works
```

- Output: `.output/public` (also symlinked as `dist/` in many setups; prefer the real path). `webDir: '.output/public'`.
- `server/api/*`, `server/routes/*`, Nitro middleware, and `useFetch` against relative `/api/...` URLs do not exist in the app. Point `useFetch`/`$fetch` at the hosted API via `runtimeConfig.public.apiBase` (`NUXT_PUBLIC_API_BASE`).
- `routeRules` with `ssr`/`isr`/`swr` are ignored for the app.
- `nuxt build` (without generate) produces a Nitro server, not a static app: `cap sync` will fail with the missing `index.html` error.
- Browser-only plugins: name them `*.client.ts` or guard with `import.meta.client`.

## Errors

| Error | Fix |
|---|---|
| `The web assets directory (./dist) must contain an index.html file.` after `nuxt build` | Use `nuxt generate` with `ssr: false`, `webDir: '.output/public'` |
| `FetchError: [GET] "/api/..." 404` on device | Relative API URL; use absolute `apiBase` |
| `ReferenceError: window is not defined` during generate | Guard browser code (`onMounted`, `.client` plugin) |
