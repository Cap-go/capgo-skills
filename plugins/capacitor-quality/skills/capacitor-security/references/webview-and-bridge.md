# WebView and Native Bridge

In a Capacitor app, XSS is not just a web bug: injected script runs with access to every installed native plugin (filesystem, contacts, camera, secure storage). Treat WebView hardening as native-level risk.

## Who can call native plugins

- The app's own origin (`capacitor://localhost` on iOS, `https://localhost` on Android).
- `server.url` when set (live reload or remote-hosted app).
- Every host in `server.allowNavigation`. On Android, Capacitor adds each entry to the bridge's allowed origin rules (`Bridge.java` `allowedOriginRules`), so those pages can invoke plugins.

Rules:
- Keep `allowNavigation` empty unless the app must navigate the main WebView to a host you control. Entries are host patterns (`example.com`, `*.example.com`), not API allow-lists; `fetch` calls do not need them.
- Open third-party pages (payment pages, help centers, OAuth providers) in `@capacitor/browser` (SFSafariViewController / Custom Tabs) or `@capgo/inappbrowser`, which do not get the Capacitor bridge.
- Never ship a remote `server.url` pointing at a host you do not fully control. A compromised host becomes native code execution.

## Debuggable WebView

```typescript
// Leave unset: Capacitor enables inspection automatically in debug builds only.
ios: { /* webContentsDebuggingEnabled: unset */ },
android: { /* webContentsDebuggingEnabled: unset */ },
```

If the team needs inspection in a QA build, gate it on an env var at sync time and confirm the release pipeline syncs without it.

## Content Security Policy

Add a CSP `<meta>` tag to `index.html` (Capacitor guide recommends it). Start strict and widen only for observed violations:

```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob: https://cdn.example.com;
  connect-src 'self' https://api.example.com wss://realtime.example.com;
  font-src 'self';
  object-src 'none';
  base-uri 'self';
  frame-src 'none'">
```

Notes:
- `'self'` covers `capacitor://localhost` / `https://localhost`.
- Live reload needs the dev server origin (and its `ws:` socket) in `connect-src`. Inject that only into dev builds.
- `frame-ancestors` is ignored in `<meta>` CSP; do not rely on it there.
- Frameworks that inline scripts (some SSR/hydration outputs) need hashes or nonces; avoid `'unsafe-eval'` and `'unsafe-inline'` in `script-src`.
- Test on both platforms: violations show in the console as `Refused to load ...` / `Refused to connect to ...` messages (Safari Web Inspector / `chrome://inspect`).

## Injection sinks

Search and fix:

```bash
grep -rnE "innerHTML|outerHTML|insertAdjacentHTML|document\.write|dangerouslySetInnerHTML|v-html|\[innerHTML\]|bypassSecurityTrust|eval\(|new Function\(" src/
```

- Render untrusted strings as text; sanitize unavoidable HTML with a maintained sanitizer (for example DOMPurify).
- Never `eval` or `new Function` server/deep-link input (capsec CAP006).
- Load scripts only from the bundle; remote `<script src>` from third parties executes with bridge access (capsec WEB003).
- `iframe`s: add `sandbox` and avoid `allow-scripts` + `allow-same-origin` together for untrusted content.
- `target="_blank"` links: add `rel="noopener noreferrer"`.

## postMessage

```typescript
window.addEventListener('message', (event) => {
  if (event.origin !== 'https://widget.example.com') return; // exact match
  if (typeof event.data !== 'object' || event.data?.type !== 'resize') return;
  handleResize(event.data);
});
```

Never act on `event.data` without checking `event.origin` (capsec CAP010).

## Deep links and OAuth

Setup belongs to `capacitor-deep-linking`. Security rules:
- Validate every `appUrlOpen` URL: parse with `new URL()`, check scheme/host against an allow-list, then map to a known route. Never navigate the WebView to a URL taken from a deep link.
- Custom schemes (`myapp://`) can be registered by any app. Do not send tokens through them.
- OAuth 2: use the authorization code flow with PKCE (Capacitor security guide requires it for native apps) and a `state` parameter. Prefer Universal Links / App Links as redirect URIs.
- Verify JWTs on the server. Client-side `jwt.decode` is fine for reading claims for UI, never for authorization.

```typescript
import { App } from '@capacitor/app';

App.addListener('appUrlOpen', ({ url }) => {
  let parsed: URL;
  try { parsed = new URL(url); } catch { return; }
  if (parsed.protocol !== 'https:' || parsed.host !== 'app.example.com') return;
  const allowed = ['/invite', '/reset-password'];
  if (!allowed.includes(parsed.pathname)) return;
  router.navigate(parsed.pathname + parsed.search);
});
```

iOS note (Capacitor 8.5+): after adopting the UIScene lifecycle, URL opens arrive through `SceneDelegate`; the `appUrlOpen` JS event keeps working. See `capacitor-uiscene-migration` if links stop arriving.
