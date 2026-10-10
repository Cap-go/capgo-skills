# Routing Patterns

Load when wiring deep links into a specific router, OAuth flow, or attribution.

## React Router (v6/v7)

```tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { App } from '@capacitor/app';

export function DeepLinkListener() {
  const navigate = useNavigate();
  useEffect(() => {
    const toPath = (raw: string) => {
      const u = new URL(raw);
      return (u.protocol.startsWith('http') ? u.pathname : `/${u.host}${u.pathname}`) + u.search;
    };
    const sub = App.addListener('appUrlOpen', (e) => navigate(toPath(e.url)));
    App.getLaunchUrl().then((r) => r?.url && navigate(toPath(r.url)));
    return () => { sub.then((h) => h.remove()); };
  }, [navigate]);
  return null;
}
```

Mount it once inside the router provider. `useHistory` is React Router v5 only.

## Vue Router

```ts
import { App } from '@capacitor/app';
import router from './router';

App.addListener('appUrlOpen', (event) => {
  const u = new URL(event.url);
  const path = u.protocol.startsWith('http') ? u.pathname : `/${u.host}${u.pathname}`;
  router.push(path + u.search);
});
```

Register in `main.ts` after `app.use(router)`.

## Angular

```ts
import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { App } from '@capacitor/app';

@Injectable({ providedIn: 'root' })
export class DeepLinkService {
  constructor(private zone: NgZone, private router: Router) {}
  init() {
    App.addListener('appUrlOpen', (event) => {
      this.zone.run(() => {
        const u = new URL(event.url);
        this.router.navigateByUrl(u.pathname + u.search);
      });
    });
  }
}
```

Without `NgZone.run` the navigation happens outside Angular change detection and appears to do nothing.

## OAuth / magic-link callbacks

```ts
App.addListener('appUrlOpen', async ({ url }) => {
  const u = new URL(url);
  if (u.pathname !== '/auth/callback') return;
  const error = u.searchParams.get('error');
  if (error) return showAuthError(error);
  const code = u.searchParams.get('code');
  if (code && u.searchParams.get('state') === expectedState) {
    await exchangeCode(code); // PKCE verifier stored before redirect
  }
});
```

- Use PKCE; never put client secrets in the app.
- Prefer a verified https redirect (Universal Link / App Link) over a custom scheme.
- When the auth page runs in `@capacitor/browser` / an in-app browser, close it after the callback (`Browser.close()`).

## Deferred deep links

Opening a link before the app is installed cannot be recovered by Capacitor alone. Options: an attribution SDK, or a server-side token the user re-enters / that you match after first launch. Store a "first launch handled" flag in `@capacitor/preferences` so it runs once.

## Allow-list routes

```ts
const ALLOWED = [/^\/product\/[\w-]+$/, /^\/invite\/[\w-]+$/, /^\/auth\/callback$/];
const safe = ALLOWED.some((re) => re.test(path)) ? path : '/';
```

Never pass deep-link parameters straight into `innerHTML`, `eval`, or API calls that mutate data without user confirmation.
