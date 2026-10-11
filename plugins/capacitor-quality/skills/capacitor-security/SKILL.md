---
name: capacitor-security
description: App-level security audit and hardening for Capacitor apps. Use when the user wants a security review, OWASP MASVS check, or pentest fixes; runs the Capgo scanner (`npx @capgo/capgo-sec scan`, `capsec`, rule IDs like SEC001, NET003, CAP004); finds API keys or `.env` values in the web bundle; stores tokens in `@capacitor/preferences` or `localStorage`; needs Keychain/Keystore storage, certificate pinning, CSP, or root/jailbreak detection; or sees `server.cleartext`, `allowNavigation`, `webContentsDebuggingEnabled`, `NSAllowsArbitraryLoads`, `android:usesCleartextTraffic`, `android:allowBackup`, `net::ERR_CLEARTEXT_NOT_PERMITTED`, or ATS "requires the use of a secure connection" errors. Do not use for Xcode build-setting hardening (use capacitor-ios-security-hardening), deep link setup (capacitor-deep-linking), App Store review (capacitor-apple-review-preflight), CI design (capacitor-ci-cd), or live update setup (capgo-live-updates).
---

# Capacitor Security

Audit and harden the app layer of a Capacitor app: secrets in the bundle, on-device storage, network transport, WebView and native bridge exposure, and platform manifests.

## When to Use

TRIGGER when:
- The user asks for a security audit, OWASP Mobile Top 10 / MASVS review, or wants to fix pentest findings.
- The user wants to run or interpret `@capgo/capgo-sec` (`capsec`) results, rule IDs such as `SEC001`, `STO002`, `NET003`, `CAP004`, `AND004`, `IOS001`.
- API keys, service-role keys, or `.env` values appear in `src/`, `dist/`, `www/`, or `capacitor.config.*`.
- Auth tokens are stored with `Preferences.set`, `localStorage`, IndexedDB, or plain SQLite.
- `capacitor.config.*` contains `server.cleartext: true`, `server.url`, broad `server.allowNavigation`, `android.allowMixedContent`, or `webContentsDebuggingEnabled: true`.
- Native files contain `NSAllowsArbitraryLoads`, `android:usesCleartextTraffic="true"`, `android:allowBackup="true"`, `android:debuggable`, or exported components without permissions.
- The user needs certificate pinning, a Content Security Policy, screenshot protection, or root/jailbreak detection.

Do not use:
- Xcode build settings, Enhanced Security, pointer authentication, stack/heap hardening -> `capacitor-ios-security-hardening`.
- Universal Links / App Links setup -> `capacitor-deep-linking` (this skill only covers validating incoming URLs).
- Privacy manifests, App Review rejections -> `capacitor-apple-review-preflight`; store listing -> `capacitor-app-store`.
- Pipeline structure and signing secrets in CI -> `capacitor-ci-cd`.
- Live update installation and channels -> `capgo-live-updates` (this skill covers only bundle encryption).
- Runtime crashes and WebView inspection -> `debugging-capacitor`.

## Workflow

1. **Inspect before editing.** Read `capacitor.config.ts|json`, `package.json` (Capacitor major, installed plugins), `android/app/src/main/AndroidManifest.xml`, `android/app/src/main/res/xml/network_security_config.xml` (if any), `ios/App/App/Info.plist`, `*.entitlements`, and `index.html`.
2. **Scan.** Run the Capgo scanner from the project root (Node 18+):
   ```bash
   npx @capgo/capgo-sec@latest scan --severity medium
   ```
   The npm package is `@capgo/capgo-sec`; it installs a `capsec` binary. `npx capsec` does not work because no package named `capsec` exists on npm.
3. **Grep for what scanners miss** (see Verification). Build the web app first and also grep `dist/` or `www/`: bundlers inline `import.meta.env.*` and `process.env.*` values.
4. **Triage and report before invasive changes.** Group findings by Critical/High/Medium/Low with file and line. Ask the user before changes that alter behavior: certificate pinning (can lock out users when certs rotate), blocking rooted devices, removing `allowNavigation` hosts, a strict CSP.
5. **Fix by area**, loading the matching reference below.
6. **Re-run the scan and Verification checks**, then `npx cap sync` and test a release build on a device.

## Capacitor-specific traps

- **Nothing in the bundle is secret.** Web assets ship inside the IPA/APK and `capacitor.config.json` is copied into native assets. Values in `plugins.*` config (including `@capgo/capacitor-env`) are extractable. Move secret-bearing calls to a backend.
- **`allowNavigation` grants bridge access.** On Android, every `allowNavigation` entry is added to the bridge's allowed origin rules, so pages from those hosts can call your native plugins. Only list hosts you control. Open third-party pages with `@capacitor/browser` or `@capgo/inappbrowser` instead.
- **`server.url` and `server.cleartext` are dev-only.** Capacitor documents both as "not intended for use in production." A committed LAN IP ships a WebView that loads remote code over HTTP.
- **Debuggable WebView in release.** `ios.webContentsDebuggingEnabled` / `android.webContentsDebuggingEnabled` default to on only in debug builds. A hardcoded `true` exposes the WebView to Safari / `chrome://inspect` on any release build.
- **CapacitorHttp is not pinning.** `plugins.CapacitorHttp.enabled` only routes `fetch`/XHR through native networking. Pinning requires `@capgo/capacitor-ssl-pinning`, which hooks into CapacitorHttp.
- **Biometric prompt is not authentication.** `verifyIdentity()` can be hooked on rooted/jailbroken devices. Keep secrets behind `accessControl` (hardware-bound Keychain/Keystore item) and validate sessions server-side.
- **OAuth via custom schemes needs PKCE.** Any app can register `myapp://`. Use PKCE and prefer Universal/App Links for redirects.
- **Live update bundles are public unless encrypted.** Private channels limit who receives a bundle. They do not make it confidential.

## References

Only load a reference when its topic is in play.

| Reference | Load when |
|-----------|-----------|
| [references/capsec-scanner.md](references/capsec-scanner.md) | Running the scanner, reading rule IDs, CI gating, JSON/HTML reports |
| [references/secrets-and-storage.md](references/secrets-and-storage.md) | Hardcoded keys, `.env` leakage, token storage, Keychain/Keystore, encrypted SQLite, logging |
| [references/network.md](references/network.md) | HTTPS/ATS/cleartext, `network_security_config.xml`, certificate pinning, CORS vs CapacitorHttp |
| [references/webview-and-bridge.md](references/webview-and-bridge.md) | CSP, `allowNavigation`, iframes, `postMessage`, `eval`, deep link/OAuth validation |
| [references/platform-hardening.md](references/platform-hardening.md) | AndroidManifest flags, R8, iOS Info.plist/entitlements, screenshot protection, root/jailbreak detection, live update encryption |

Xcode compiler/linker hardening is not covered here: use `capacitor-ios-security-hardening`.

## Verification

Run from the project root. Each grep should return nothing for a release build, or only intentional, documented hits.

```bash
# 1. Scanner gate (exit code 1 on high/critical)
npx @capgo/capgo-sec@latest scan --ci

# 2. Dev-only config left in capacitor.config
grep -nE "cleartext|server:\s*\{|\"url\"|url:|allowMixedContent|webContentsDebuggingEnabled" capacitor.config.* 

# 3. Secrets in the built bundle (build first)
npm run build
grep -rnE "sk_live_|sk-ant-|sk-proj-|AKIA[0-9A-Z]{16}|service_role|-----BEGIN (RSA |EC )?PRIVATE KEY" dist/ www/ 2>/dev/null

# 4. Tokens in plain storage
grep -rnE "(Preferences\.set|localStorage\.setItem)\(.*(token|password|secret|jwt)" -i src/

# 5. Android manifest flags
grep -nE "usesCleartextTraffic|allowBackup|debuggable|exported=\"true\"" android/app/src/main/AndroidManifest.xml

# 6. iOS transport and file sharing
plutil -p ios/App/App/Info.plist | grep -E "NSAllowsArbitraryLoads|NSExceptionAllowsInsecureHTTPLoads|UIFileSharingEnabled|LSSupportsOpeningDocumentsInPlace"

# 7. Native projects pick up config changes
npx cap sync
```

Then install a release build on a device and confirm: login works, API calls succeed (pinning did not break them), Safari Web Inspector / `chrome://inspect` cannot attach.

## Error handling

| Error | Cause | Fix |
|-------|-------|-----|
| `net::ERR_CLEARTEXT_NOT_PERMITTED` (Android) | HTTP request blocked; cleartext is off by default since API 28 | Use HTTPS. For dev live reload only, use `server.cleartext: true` in a dev-only config. Never ship `usesCleartextTraffic="true"`. |
| `The resource could not be loaded because the App Transport Security policy requires the use of a secure connection.` (iOS, NSURLError -1022) | HTTP URL under ATS | Use HTTPS. If a legacy host is unavoidable, add a narrow `NSExceptionDomains` entry, never `NSAllowsArbitraryLoads`. |
| `... has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present` | Backend does not allow the WebView origin | Allow `capacitor://localhost` (iOS) and `https://localhost` (Android default) on the server, or enable `CapacitorHttp`. Do not add `Access-Control-Allow-Origin: *` to authenticated endpoints. |
| `Refused to connect to '<url>' because it violates the following Content Security Policy directive` | CSP `connect-src` missing a host | Add the exact API origin to `connect-src`. Do not fall back to `*`. |
| Pinned requests fail after a certificate renewal | Pin matched only the old leaf cert | Pin the CA or intermediate plus a backup cert; ship the backup before rotating. |
| `npm error 404 Not Found - GET https://registry.npmjs.org/capsec` | Wrong package name | Use `npx @capgo/capgo-sec@latest scan`. |
| `No protected credentials found` / `No protected data found` (code `21`, `@capgo/capacitor-native-biometric`) | Nothing stored with `accessControl`, fresh install, or the item was invalidated by a biometric enrollment change | Treat as "logged out": re-authenticate against the server, then store again with `AccessControl.BIOMETRY_CURRENT_SET` or `BIOMETRY_ANY`. |

## Resources

- Capacitor security guide: https://capacitorjs.com/docs/guides/security
- Capgo security scanner: https://capgo.app/security-scanner/ (source: https://github.com/Cap-go/capgo-sec)
- OWASP Mobile Top 10: https://owasp.org/www-project-mobile-top-10/
- OWASP MASVS / MASTG: https://mas.owasp.org/
