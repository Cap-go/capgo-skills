# Next.js + Capacitor

Applies to Next.js 14, 15, and 16 (current `latest` is 16.x). `next export` was removed in 14; static export is only `output: 'export'`.

## Config

```js
// next.config.mjs (or next.config.ts)
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: { unoptimized: true }, // or a custom loader
  trailingSlash: true,           // emits about/index.html instead of about.html
};

export default nextConfig;
```

- Output goes to `out/` (override with `distDir`). `webDir: 'out'`.
- Do not set `basePath` or `assetPrefix` for the mobile build. If the web deployment needs them, branch on an env var (`process.env.CAPACITOR_BUILD`) in `next.config.*`.
- `next build` both builds and exports. Script: `"build:mobile": "next build && cap sync"`.

## What fails in export mode

Build fails or the feature is dead at runtime:

| Feature | Replacement |
|---|---|
| Route Handlers that read the request (`app/api/*`, `pages/api/*`) | Hosted backend; call it with `fetch` |
| `middleware.ts` / `proxy.ts` (Next 16 rename), rewrites, redirects, headers | Client-side guards in a layout; native deep-link handling |
| Server Actions (`'use server'`) | API endpoint on your backend |
| `cookies()`, `headers()`, `draftMode()` | Client storage (`@capacitor/preferences`) or tokens from the backend |
| ISR / `revalidate`, `getServerSideProps` | Client fetch with caching (SWR/React Query) |
| Dynamic routes without `generateStaticParams()` | Pre-generate known params, or use `/item?id=123` read with `useSearchParams` (wrap in `<Suspense>`) |
| `next/image` default loader | `images.unoptimized: true` or a custom `loader` |
| `next/font/google` | Works (fonts are downloaded at build time) |

Server Components still work as long as they only run at build time (static data). Anything that must be fresh per user belongs in a client component.

## Routing trap specific to Next.js export

Capacitor maps every extensionless path to the root `out/index.html`. Next.js export writes one HTML file per route, but those files are only reached through client-side navigation (`next/link`, `router.push`), which fetches the `.txt` RSC payloads (they have an extension, so they are served).

Consequences:
- A cold start, `window.location.reload()`, `window.location.href = '/x'`, or an OS-delivered deep link on `/settings/` boots the home page HTML at the `/settings/` URL. Symptoms: home page flashes, hydration mismatch warnings, or the wrong page.
- Fix: never hard-navigate. Use `router.push`/`router.replace`. For deep links, start at `/` and push the route from an `appUrlOpen` listener mounted in the root layout:

```tsx
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { App } from '@capacitor/app';

export function DeepLinkListener() {
  const router = useRouter();
  useEffect(() => {
    const sub = App.addListener('appUrlOpen', ({ url }) => {
      const { pathname, search } = new URL(url);
      router.push(pathname + search);
    });
    return () => { void sub.then((h) => h.remove()); };
  }, [router]);
  return null;
}
```

Use `App.getLaunchUrl()` once on startup for the cold-start case.

## Browser-only APIs

Static export still prerenders every page in Node. Accessing `window`, `document`, or Capacitor plugins at module scope crashes the build (`ReferenceError: window is not defined`). Call plugins inside `useEffect` or event handlers in `'use client'` components, or load with `dynamic(() => import(...), { ssr: false })` from a client component.

## Errors

| Error | Fix |
|---|---|
| `Page "/blog/[slug]" is missing "generateStaticParams()" so it cannot be used with "output: export" config.` | Add `generateStaticParams` or move to query params |
| `Image Optimization using the default loader is not compatible with` ... `output: 'export'` | `images.unoptimized: true` or a custom loader |
| Export fails naming `force-dynamic`, `cookies`, `headers`, or "couldn't be rendered statically" | Remove request-time APIs / `dynamic = 'force-dynamic'` from that route; fetch on the client |
| `ReferenceError: window is not defined` during `next build` | Move browser/plugin code into effects or client-only dynamic import |

Wording of Next.js errors varies between 14, 15, and 16; match on the key phrase (`output: export`, `generateStaticParams`, `default loader`).
