# Svelte and SvelteKit + Capacitor

## SvelteKit with adapter-static

Install the adapter: `npm i -D @sveltejs/adapter-static`. Use `fallback: 'index.html'` so non-prerendered routes become a client-rendered SPA.

### SvelteKit 2.x (config in svelte.config.js)

```js
// svelte.config.js
import adapter from '@sveltejs/adapter-static';

export default {
  kit: {
    adapter: adapter({ pages: 'build', assets: 'build', fallback: 'index.html' }),
  },
};
```

### SvelteKit 3.x (config moved to the Vite plugin)

SvelteKit 3 no longer reads `svelte.config.js`; options formerly under `kit.*` are passed to the `sveltekit()` Vite plugin. It requires Node 22.17+, Vite 8, Svelte 5.56+, and `@sveltejs/adapter-static` 4. Migrate with `npx sv migrate sveltekit-3` after upgrading to the latest 2.x.

```js
// vite.config.js
import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';
import adapter from '@sveltejs/adapter-static';

export default defineConfig({
  plugins: [
    sveltekit({
      adapter: adapter({ pages: 'build', assets: 'build', fallback: 'index.html' }),
    }),
  ],
});
```

Check the current adapter-static docs if options were renamed in 4.x.

### Root layout

```ts
// src/routes/+layout.ts
export const ssr = false;      // client-only rendering in the app
export const prerender = false; // or true for fully static sites; then watch the routing trap
```

- `webDir: 'build'`.
- `+page.server.ts`, `+layout.server.ts`, `+server.ts`, form actions, and hooks.server do not run in the app. Move them to a hosted API; use `+page.ts` `load` with absolute URLs.
- Prerendered sub-routes (`build/about.html`, `build/about/index.html`) are never served for extensionless URLs by Capacitor; cold starts on those URLs boot the fallback/root page. Navigate client-side (`goto`) and handle deep links via `App.addListener('appUrlOpen', ...)`.
- SvelteKit 3 removes `$app/stores` (use `$app/state`) and no longer auto-generates `$lib`.

## Svelte + Vite (no Kit)

```bash
npm create vite@latest my-app -- --template svelte-ts
```

Output `dist/`, `webDir: 'dist'`.

## Errors

| Error | Fix |
|---|---|
| `@sveltejs/adapter-static: all routes must be fully prerenderable, but found the following routes that are dynamic` | Add `fallback: 'index.html'` (and `ssr = false`), or set `prerender` entries |
| Adapter/kit options silently ignored after upgrading to SvelteKit 3 | Move options into `sveltekit({...})` in `vite.config.js` |
| `must contain an index.html file` | Missing `fallback`, or wrong `pages` directory vs `webDir` |
