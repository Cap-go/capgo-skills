# Network Security

## HTTPS only

Release builds should make no `http://` or `ws://` requests. Defaults already help:
- Android blocks cleartext since API 28 (`net::ERR_CLEARTEXT_NOT_PERMITTED`).
- iOS App Transport Security (ATS) blocks HTTP (NSURLError -1022).

The usual regressions are config changes made for live reload that leaked into production.

### capacitor.config: keep dev settings out of release

`server.url`, `server.cleartext`, and `server.allowNavigation` are documented as "not intended for use in production." Gate them on an environment variable so release builds never contain them:

```typescript
import type { CapacitorConfig } from '@capacitor/cli';

const liveReloadUrl = process.env.CAP_SERVER_URL; // set only in your dev shell

const config: CapacitorConfig = {
  appId: 'com.example.app',
  appName: 'Example',
  webDir: 'dist',
  ...(liveReloadUrl && {
    server: { url: liveReloadUrl, cleartext: liveReloadUrl.startsWith('http:') },
  }),
};

export default config;
```

`capacitor.config.ts` is evaluated at `npx cap sync` / `copy` time, and the result is written to native assets. Always sync from a clean environment before a release build. On Capacitor 9, `npx cap run <platform> --url <dev-server-url>` handles live reload without editing the config.

### Android

`android/app/src/main/AndroidManifest.xml`:

```xml
<application
    android:usesCleartextTraffic="false"
    android:networkSecurityConfig="@xml/network_security_config"
    ...>
```

`android/app/src/main/res/xml/network_security_config.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <base-config cleartextTrafficPermitted="false">
        <trust-anchors>
            <certificates src="system" />
        </trust-anchors>
    </base-config>
    <!-- Dev only: put user CAs / cleartext for a local host in src/debug/res/xml -->
</network-security-config>
```

Put debug-only exceptions (local IP cleartext, user-installed proxy CAs for Charles/mitmproxy) in `android/app/src/debug/res/xml/network_security_config.xml` so they never reach release.

Also flag `android.allowMixedContent: true` in `capacitor.config.*` (documented as "not intended for use in production").

### iOS

Remove `NSAllowsArbitraryLoads` from `ios/App/App/Info.plist`. If a legacy HTTP host cannot be upgraded, scope an exception:

```xml
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSExceptionDomains</key>
    <dict>
        <key>legacy.example.com</key>
        <dict>
            <key>NSExceptionAllowsInsecureHTTPLoads</key>
            <true/>
        </dict>
    </dict>
</dict>
```

`NSAllowsArbitraryLoads` requires justification in App Review. Any exception is a finding to document.

## CORS vs CapacitorHttp

The WebView origin is `capacitor://localhost` on iOS and `https://localhost` on Android (default `server.androidScheme` is `https` since Capacitor 6). `fetch`/XHR from the WebView are subject to CORS.

Options:
1. Configure the backend to allow those two origins explicitly (preferred when you own the API).
2. Enable `plugins.CapacitorHttp.enabled: true`, which patches `fetch` and `XMLHttpRequest` to native HTTP (no CORS). It is bundled with `@capacitor/core`.

Never respond `Access-Control-Allow-Origin: *` together with credentials, and do not add wildcard CORS to an authenticated API to "fix" the app.

## Certificate pinning

Pinning stops MITM via a user-installed or compromised CA. It also breaks the app if the pinned certificate rotates without a backup pin, so confirm the rollout plan with the user first.

`@capgo/capacitor-ssl-pinning` (Capacitor 8) pins requests made through CapacitorHttp on iOS and Android:

```bash
npm install @capgo/capacitor-ssl-pinning
npx cap sync
```

```typescript
// capacitor.config.ts
plugins: {
  CapacitorHttp: { enabled: true },             // required: pinning hooks CapacitorHttp
  SSLPinning: {
    certs: ['sslCerts/production/primary.cer', 'sslCerts/production/backup.der'],
    excludedDomains: ['https://analytics.example.com'],
  },
},
```

- Paths are relative to the app root. `cap sync` copies them into `webDir/certs` and converts PEM `.cer` to DER for iOS.
- Ship at least two pins (current plus backup/intermediate). Rotate the backup in before the primary expires.
- Requests that bypass CapacitorHttp (third-party native SDKs, WebSockets, images loaded by the WebView) are not covered. On iOS the plugin also answers WebView auth challenges; verify behavior per platform.
- `SSLPinning.getConfiguration()` returns the active native configuration. Use it in a debug screen to confirm certs loaded.
- Android-only alternative without a plugin: `<pin-set>` with an `expiration` date in `network_security_config.xml`. It applies to the WebView too, so test thoroughly.

Docs: https://capgo.app/docs/plugins/ssl-pinning/

## Request hygiene

- No tokens, emails, or passwords in query strings (capsec NET008): URLs end up in server logs and analytics.
- Use `wss://` for WebSockets (capsec NET004).
- Send auth in the `Authorization` header. If using cookies on native, `plugins.CapacitorCookies.enabled` patches `document.cookie`; mark cookies `Secure` and `HttpOnly` server-side.
