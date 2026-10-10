---
name: framework-to-capacitor
description: Configures a web framework build so Capacitor can ship it as an iOS/Android app. Use for Next.js static export (output 'export', out/), Nuxt 4 (ssr false, nuxt generate, .output/public), Angular (dist/<project>/browser), SvelteKit adapter-static (SvelteKit 2 svelte.config.js or SvelteKit 3 vite.config), React/Vue/Svelte/Solid on Vite, and React Router framework SPA mode. Covers webDir mismatch, blank white screen after cap sync, missing index.html, SSR/API routes/middleware/server actions that cannot run in the app, next/image errors, deep-link reloads landing on the home page, router base paths, and env variables. Do not use for whole-app store readiness (webapp-to-capacitor), Cordova projects (cordova-to-capacitor), Capacitor major upgrades (capacitor-app-upgrades), or UI kits (ionic-design, konsta-ui, tailwind-capacitor).
allowed-tools:
  - Bash(node -e *)
  - Bash(find *)
---

# Framework to Capacitor

Make a framework emit a static bundle that Capacitor can copy into the native projects, and wire the scripts so `build -> cap sync` is one step.

## When to Use

TRIGGER when:
- Adding Capacitor to a Next.js, Nuxt, Angular, SvelteKit, Vite (React/Vue/Svelte/Solid), React Router, Qwik, or Astro project.
- `npx cap sync` fails with `The web assets directory (./dist) must contain an index.html file.` or `Could not find the web assets directory: ./dist.`
- The app launches to a white screen or loads the wrong page after a reload or deep link.
- The framework build fails because of SSR-only features (`output: 'export'` errors, `prerender` errors, API routes, middleware, server actions).

Do not use for:
- Store readiness, native UX, permissions, billing, review risk -> `webapp-to-capacitor`, `capacitor-app-store`, `capacitor-apple-review-preflight`.
- Cordova/PhoneGap apps -> `cordova-to-capacitor`.
- Capacitor version upgrades -> `capacitor-app-upgrades`.
- Live updates setup -> `capgo-live-updates`.

## Live Project Snapshot

Detected framework and build dependencies:
!`node -e "const fs=require('fs');if(!fs.existsSync('package.json'))process.exit(0);const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));const matchers=['next','nuxt','react','react-router','@react-router/dev','vue','@angular/core','@angular/build','@sveltejs/kit','@sveltejs/adapter-static','@builder.io/qwik','@qwik.dev/core','astro','@remix-run/react','solid-js','@solidjs/start','vite','@capacitor/core','@capacitor/cli'];const out=[];for(const section of ['dependencies','devDependencies']){for(const [name,version] of Object.entries(pkg[section]||{})){if(matchers.includes(name))out.push(section+'.'+name+'='+version)}}for(const [name,cmd] of Object.entries(pkg.scripts||{})){if(['build','export','generate','sync','cap:sync'].includes(name))out.push('scripts.'+name+'='+cmd)}console.log(out.join('\n'))"`

Relevant framework and Capacitor config paths:
!`find . -maxdepth 3 -not -path '*/node_modules/*' \( -name 'next.config.*' -o -name 'nuxt.config.*' -o -name 'vite.config.*' -o -name 'angular.json' -o -name 'svelte.config.*' -o -name 'react-router.config.*' -o -name 'astro.config.*' -o -name 'capacitor.config.json' -o -name 'capacitor.config.ts' -o -name 'capacitor.config.js' \)`

## Core Facts (apply to every framework)

- Capacitor copies `webDir` into the native app. It never runs Node. SSR, API routes, middleware, ISR, server actions, `cookies()`/`headers()`, and image optimization servers do not exist at runtime. Move them to a hosted backend and call it over HTTPS.
- The app is served from `capacitor://localhost` (iOS) and `https://localhost` (Android). Your backend must allow those origins for CORS, or use `CapacitorHttp`.
- Capacitor's local server returns the root `index.html` for any path without a file extension. History-mode SPA routing (`createWebHistory`, `BrowserRouter`, Angular default `PathLocationStrategy`) works; hash routing is not required.
- The same fallback means per-route HTML files (Next.js export, SvelteKit prerender, Astro) are never served for extensionless URLs. A cold start or `location.reload()` on `/settings/` loads the root `index.html`. Keep navigation client-side and route deep links through `App.addListener('appUrlOpen', ...)` + your router.
- Asset paths: keep the framework's base at `/` (Vite `base`, Angular `<base href="/">`, Next `basePath`/`assetPrefix` unset). A CDN or sub-path base used for web hosting breaks asset loading in the app; use a separate mobile build config.
- Environment variables are inlined at build time (`NEXT_PUBLIC_*`, `VITE_*`, `NUXT_PUBLIC_*`, `PUBLIC_*` in SvelteKit, Angular `environment.ts`). Rebuild before every `cap sync`; never point production builds at `localhost`.
- Capacitor 8 needs Node 22+. Capacitor 9 (currently `@next`, not GA) needs Node 24+. Some framework majors also raise Node minimums (SvelteKit 3: Node 22.17+).

## Procedure

1. Read the snapshot. Identify framework, major version, and the current build output directory. If several apps live in a monorepo, ask which one ships to mobile.
2. Load the matching reference (only the one in play):

| Framework in package.json | Load | webDir |
|---|---|---|
| `next` | `references/nextjs.md` | `out` |
| `nuxt` | `references/vue-nuxt.md` | `.output/public` |
| `vue` + `vite` (no Nuxt) | `references/vue-nuxt.md` | `dist` |
| `react` + `vite`, `react-router`/`@react-router/dev`, CRA | `references/react.md` | `dist`, `build/client`, or `build` |
| `@angular/core` | `references/angular.md` | `dist/<project>/browser` |
| `@sveltejs/kit` or `svelte` + `vite` | `references/svelte.md` | `build` or `dist` |
| `solid-js`, `@builder.io/qwik`/`@qwik.dev/core`, `astro`, `@remix-run/*` | `references/other-frameworks.md` | varies |

3. Inventory server-only features before changing config (grep for `app/api/`, `pages/api/`, `middleware.ts`/`proxy.ts`, `'use server'`, `getServerSideProps`, `+page.server.ts`, `+server.ts`, `server/api/`, `@angular/ssr`). Report the list to the user and agree where each moves (external API, client fetch, or native plugin) before deleting anything.
4. Make the static build work and inspect the output directory: it must contain `index.html` at its root.
5. Install and initialise Capacitor (use the repo's package manager for installs):

```bash
npm install @capacitor/core @capacitor/ios @capacitor/android
npm install -D @capacitor/cli
npx cap init "App Name" com.company.app --web-dir <webDir>
npx cap add ios
npx cap add android
```

6. Add one script that always builds before syncing, e.g. `"build:mobile": "<framework build> && cap sync"`.
7. Run the verification below on both platforms.

Minimal config (`androidScheme: 'https'` is the default since Capacitor 6; only set it to keep an older origin):

```ts
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.company.app',
  appName: 'App Name',
  webDir: 'dist',
};

export default config;
```

## Live Reload

Capacitor 8: `npx cap run ios -l --host <LAN-IP> --port <port>`. Capacitor 9: `npx cap run ios --url http://<LAN-IP>:<port>` (the `-l/--host/--port/--https` flags were merged into `--url`). The dev server must listen on the LAN (`--host 0.0.0.0` / `server.host: true` in Vite). Never commit `server.url` into `capacitor.config.*`.

## Verification

```bash
npm run build
test -f <webDir>/index.html && echo "index.html OK"
npx cap sync
npx cap run ios        # or open in Xcode
npx cap run android
```

Then on device/simulator:
- App opens on the first screen without a white flash beyond the splash.
- Navigate to a nested route, background + resume, and confirm the route survives.
- Open a deep link (`xcrun simctl openurl booted <url>` / `adb shell am start -a android.intent.action.VIEW -d <url>`) and confirm it lands on the right screen.
- Inspect the WebView (Safari Web Inspector / `chrome://inspect`) for 404s on JS/CSS and CORS errors.
- `grep -rn "localhost:\|127.0.0.1" <webDir>` returns nothing unexpected.

## Error Handling

| Symptom / error | Cause | Fix |
|---|---|---|
| `The web assets directory (./dist) must contain an index.html file.` | `webDir` points at the wrong folder or SSR build has no `index.html` | Set `webDir` to the static output listed above; enable static/SPA mode |
| `Could not find the web assets directory: ./out.` | Build not run or different output dir | Run the build first; match `webDir` to the real folder |
| White screen, console `Failed to load resource` for `/_next/...` or `/assets/...` | Non-root base path / CDN `assetPrefix` | Use `/` base for the mobile build |
| White screen, no 404s | JS error at boot (often `window`/`document` during prerender, or SSR-only import) | Inspect WebView console; guard browser-only code |
| Reload or deep link opens home page or hydration error | Capacitor serves root `index.html` for extensionless paths | Client-side navigation + `appUrlOpen` handler; see framework reference |
| `Page "/x/[id]" is missing "generateStaticParams()"` (Next.js) | Dynamic route in export mode | Pre-generate params or switch to a query-string/client route |
| `Image Optimization using the default loader is not compatible with` `output: export` | `next/image` default loader | `images.unoptimized: true` or custom loader |
| API call works in browser, fails on device | CORS for `capacitor://localhost` / `https://localhost`, or `localhost` URL baked in | Allow origins on backend, or enable `CapacitorHttp`; fix env var |

## References

- `references/nextjs.md` - Next.js 14-16 static export, App Router traps, dynamic routes, images.
- `references/react.md` - Vite React, React Router framework SPA mode, CRA legacy.
- `references/vue-nuxt.md` - Vue + Vite, Nuxt 4 SPA generate.
- `references/angular.md` - Angular 17+ application builder output, SSR removal.
- `references/svelte.md` - SvelteKit 2 and 3 with adapter-static, plain Svelte + Vite.
- `references/other-frameworks.md` - Solid, Qwik, Astro, Remix v2.

Related skills: `webapp-to-capacitor` (store readiness), `capacitor-deep-linking`, `safe-area-handling`, `capgo-live-updates`.
