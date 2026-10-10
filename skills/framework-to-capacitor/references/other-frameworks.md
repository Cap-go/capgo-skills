# Other Frameworks + Capacitor

Rule for every framework: produce a folder with `index.html` at its root, no server runtime, and set `webDir` to that folder.

## Solid

- SolidJS on Vite: `npm create vite@latest my-app -- --template solid-ts`, output `dist`.
- SolidStart: configure static/SPA output (`ssr: false` plus a static preset in `app.config`/`vite` config, depending on version). Check current SolidStart docs for the output directory, then verify `index.html` exists.

## Qwik

Use the static adapter (`npm run qwik add static`). Output is `dist`. Qwik's resumability prerenders pages; the Capacitor routing trap applies (extensionless URLs load root `index.html`), so keep navigation client-side.

## Astro

- Default `output: 'static'` builds to `dist`. `webDir: 'dist'`.
- Remove server adapters (`@astrojs/node`, `@astrojs/vercel`) and `output: 'server'` for the app build; server endpoints and actions do not run.
- Astro is multi-page: every page is its own HTML file, and Capacitor will not serve `about/index.html` for `/about`. Either make the app a single page with a client router (React/Vue/Svelte island + router), or enable Astro view transitions/client routing and avoid full reloads. Test every navigation on device.

## Remix v2

Remix v2 is superseded by React Router v7+ framework mode; follow `react.md`. Remix v2 SPA mode (`ssr: false` in the Vite plugin) outputs `build/client`.

## Ember, Preact, Lit, vanilla

Any bundler that produces static files works. Set `webDir` to the output folder; keep a root base path.
