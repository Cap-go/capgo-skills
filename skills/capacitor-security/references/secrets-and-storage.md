# Secrets and On-Device Storage

## Secrets in the app

Everything shipped in the IPA/APK is readable: the web bundle (`dist/`, `www/`), `capacitor.config.json` (copied into `android/app/src/main/assets/` and `ios/App/App/`), `Info.plist`, `strings.xml`, and native constants.

Treat these as public:
- Bundler env values (`import.meta.env.VITE_*`, `process.env.NEXT_PUBLIC_*`, Angular `environment.ts`). They are inlined at build time.
- Values set under `plugins.*` in `capacitor.config.*`, including `@capgo/capacitor-env` keys. That plugin is for per-build, non-secret configuration (white label, feature flags). It moves values out of the JS bundle, but they stay inside the app package.
- Live update bundles uploaded without encryption (see platform-hardening.md).

Acceptable in the client: publishable/anon keys designed for public use (Stripe publishable key, Firebase web config, Supabase anon key with row-level security on). Never in the client: Stripe secret keys, Supabase `service_role`, OpenAI/Anthropic API keys, AWS secret keys, database credentials, signing keys, webhook secrets.

Fix pattern: move the call behind a backend endpoint (serverless function or API) that holds the secret and authenticates the user.

```typescript
// Before: secret shipped to every device
await fetch('https://api.openai.com/v1/responses', {
  headers: { Authorization: `Bearer ${import.meta.env.VITE_OPENAI_KEY}` },
});

// After: the app calls its own backend with the user's session
await fetch('https://api.example.com/ai/complete', {
  method: 'POST',
  headers: { Authorization: `Bearer ${sessionToken}` },
  body: JSON.stringify({ prompt }),
});
```

If a secret already shipped, rotating it is mandatory: removing it from the next build does not revoke copies in installed apps. Tell the user which keys to rotate.

Also check: `.env` committed to git (`git ls-files | grep -E '^\.env'`), keystore passwords in `capacitor.config.*` `android.buildOptions` (use CI secrets instead), `google-services.json` / `GoogleService-Info.plist` are fine to ship but should match the right project.

## Token and credential storage

| Data | Store in | Never in |
|------|----------|----------|
| Refresh tokens, long-lived session tokens, encryption keys | Keychain / Keystore via `@capgo/capacitor-native-biometric` `setData` (8.6.0+) or `setCredentials` | `@capacitor/preferences`, `localStorage`, IndexedDB, plain SQLite, files |
| Short-lived access tokens | Memory only; refresh from the secure store | Persistent web storage |
| Username + password for biometric re-login | `setCredentials` with `accessControl` | Preferences |
| Non-sensitive settings (theme, onboarding flags) | `@capacitor/preferences` | n/a |
| Sensitive bulk data | Encrypted SQLite (check the plugin's encryption support) with the key in Keychain/Keystore | Unencrypted DB |

`@capacitor/preferences` uses `UserDefaults` (iOS) and `SharedPreferences` (Android) without encryption. `localStorage` lives in WebView storage on disk. Both are extractable from backups or a rooted/jailbroken device.

### `@capgo/capacitor-native-biometric`

```typescript
import { NativeBiometric, AccessControl } from '@capgo/capacitor-native-biometric';

// Encrypted at rest (Keychain / Keystore), no prompt to read
await NativeBiometric.setData({ key: 'refresh_token', value: refreshToken });
const { value } = await NativeBiometric.getData({ key: 'refresh_token' });

// Hardware-bound: reading requires a live biometric check
await NativeBiometric.setData({
  key: 'refresh_token',
  value: refreshToken,
  accessControl: AccessControl.BIOMETRY_CURRENT_SET,
});
const secure = await NativeBiometric.getSecureData({
  key: 'refresh_token',
  reason: 'Unlock your account',
});

await NativeBiometric.deleteData({ key: 'refresh_token' }); // on logout
```

Rules:
- `getData()` only returns values stored without `accessControl`; protected values need `getSecureData()` / `getSecureCredentials()`.
- `BIOMETRY_CURRENT_SET` invalidates the item when the user enrolls a new fingerprint/face. Handle error code `21` by re-authenticating against the server.
- On Android, `authValidityDuration > 0` lets any code read the key for that window without a prompt. Keep `0` (default) for high-value secrets.
- `verifyIdentity()` alone is a UI gate, not a security boundary. It can be hooked on compromised devices. Bind the secret to `accessControl` and verify sessions server-side.
- `isAvailable()` returns `{ isAvailable, biometryType, ... }`. Use `isAvailable` for logic; `biometryType` is for display.

## Logging

- Remove `console.log` of tokens, passwords, full API responses, and PII. iOS `os_log` and Android `logcat` output is readable by anyone with the device attached.
- `loggingBehavior` controls native logs and `console.*` statements Capacitor redirects to Xcode / Logcat. Default `'debug'` logs only in debug builds; `'none'` disables them. Flag `'production'` in review: it leaks logs on released builds.
- Strip `debugger` statements (capsec DBG001).

## Crypto

- Use Web Crypto (`crypto.subtle`) with AES-GCM and a random 12-byte IV per message (`crypto.getRandomValues`). Never reuse a static IV.
- Never use MD5, SHA-1, DES, 3DES, RC4, or ECB mode for security purposes.
- Generate tokens and nonces with `crypto.getRandomValues` / `crypto.randomUUID`, never `Math.random`.
- Never hardcode the encryption key. Generate it on device, store it in Keychain/Keystore, or derive it from a user secret with PBKDF2 (high iteration count) or Argon2 on the server.
