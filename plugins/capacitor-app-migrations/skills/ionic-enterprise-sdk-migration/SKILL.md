---
name: ionic-enterprise-sdk-migration
description: Migrates Capacitor apps off Ionic Enterprise SDK plugins - @ionic-enterprise/auth (Auth Connect), @ionic-enterprise/identity-vault (Identity Vault), and @ionic-enterprise/secure-storage (Secure Storage) - to @capgo/capacitor-social-login (OAuth2/OIDC for Azure AD, Auth0, Okta, Cognito, plus Google/Apple), @capgo/capacitor-native-biometric (biometric-protected Keychain/Keystore credential vault), and @capgo/capacitor-fast-sql or @capgo/capacitor-data-storage-sqlite (encrypted storage). Use when package.json has @ionic-enterprise/* packages, code imports AuthConnect, BrowserVault/Vault/DeviceSecurityType, or SQLite from secure-storage, or the user needs to move stored tokens without logging users out. Do not use for Ionic Appflow live updates or builds (ionic-appflow-migration), generic SQLite plugin swaps (sqlite-to-fast-sql), Capacitor version upgrades (capacitor-app-upgrades), or Capgo live updates (capgo-live-updates).
allowed-tools:
  - Bash(node -e *)
  - Bash(rg *)
  - Bash(npm *)
  - Bash(npx cap *)
---

# Ionic Enterprise SDK Migration

Replace Ionic Enterprise plugins with open Capgo plugins one at a time, preserving login sessions and stored data.

Context: Ionic stopped selling its commercial products (including the Enterprise SDK) in February 2025 and is winding down maintenance; plan migrations before the license or support window ends.

## When to Use

TRIGGER when:
- `package.json` contains `@ionic-enterprise/auth`, `@ionic-enterprise/identity-vault`, or `@ionic-enterprise/secure-storage`.
- Code imports `AuthConnect`, `ProviderOptions`, `Vault`, `BrowserVault`, `VaultType`, `DeviceSecurityType`, or Secure Storage's `SQLite` / `KeyValueStorage`.
- The user asks how to replace Auth Connect, Identity Vault, or Secure Storage without forcing re-login.

Do not use for:
- Appflow Live Updates / builds -> `ionic-appflow-migration`.
- Community or other SQLite plugins -> `sqlite-to-fast-sql`.
- Biometric UX or general security review -> `capacitor-security`.

## Live Project Snapshot

Detected Ionic Enterprise and replacement packages:
!`node -e "const fs=require('fs');if(!fs.existsSync('package.json'))process.exit(0);const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));const out=[];for(const section of ['dependencies','devDependencies']){for(const [name,version] of Object.entries(pkg[section]||{})){if(name.startsWith('@ionic-enterprise/')||name.startsWith('@capgo/')||name==='@capacitor/preferences'||name==='@capacitor/core')out.push(section+'.'+name+'='+version)}}console.log(out.sort().join('\n'))"`

## Replacement Map

| Ionic Enterprise | Replacement | Covers | Not covered (rebuild in app) |
|---|---|---|---|
| Auth Connect | `@capgo/capacitor-social-login` (`provider: 'oauth2'` for OIDC/OAuth2 IdPs; `google`, `apple`, `facebook`, etc.) | Authorization code + PKCE, token refresh (`refreshToken`), logout, native Apple/Google sign-in | Token storage policy (store tokens with Native Biometric or encrypted SQL) |
| Identity Vault | `@capgo/capacitor-native-biometric` | Save/read/delete credentials in Keychain/Keystore; `accessControl: BIOMETRY_CURRENT_SET` or `BIOMETRY_ANY` makes reads require biometrics; `verifyIdentity` with passcode fallback on iOS; `biometryChange` listener | Inactivity lock timeout, privacy screen on background (`@capacitor/privacy-screen`), custom-passcode vaults, in-memory vaults |
| Secure Storage (SQLite) | `@capgo/capacitor-fast-sql` with `encrypted: true` + `encryptionKey` | Encrypted SQLite (SQLCipher), transactions, batch, `KeyValueStore` | Key management - keep the DB key in Native Biometric, not in JS constants |
| Secure Storage (key-value) | `@capgo/capacitor-data-storage-sqlite` or Fast SQL `KeyValueStore` | Simple encrypted key-value | |

Non-sensitive settings can go to `@capacitor/preferences`. Never move tokens or secrets there.

## Procedure

### Step 1: Detect and plan

```bash
rg -n "@ionic-enterprise/" -g '!node_modules' .
```

List each enterprise package, every call site, and what is stored (keys, DB names, vault config: `type`, `deviceSecurityType`, `lockAfterBackgrounded`, `unlockVaultOnLoad`). Migrate one plugin per release when more than one is present. Report the plan before editing.

### Step 2: Plan data carry-over (two-release rule)

Old plugin data can only be read while the old plugin is still installed. For tokens, vault values, or encrypted DBs:
1. Release N: install the Capgo replacement alongside the enterprise plugin. On first launch, read from the old store, write to the new one, set a `migrated` flag, then clear the old store.
2. Release N+1 (after most users have opened release N): remove the enterprise plugin.

If the user accepts a forced re-login for everyone, a single release is fine; confirm this explicitly.

### Step 3: Auth Connect -> Social Login

```bash
npm install @capgo/capacitor-social-login
npx cap sync
```

- Keep the same client IDs, scopes, and redirect URIs; register any new native redirect (custom scheme or universal link) with the IdP before shipping.
- Map each Auth Connect provider (Azure, Auth0, Okta, Cognito, generic OIDC) to an `oauth2` entry in `SocialLogin.initialize({ oauth2: { <providerId>: { ... } } })` with `clientId`/`appId`, `issuerUrl` or `authorizationBaseUrl` + `accessTokenEndpoint`, `redirectUrl`, and scopes. Check the plugin's OAuth2 docs for the exact fields of the installed version.
- Replace `AuthConnect.login/logout/refreshSession/isAccessTokenExpired` with `SocialLogin.login({ provider: 'oauth2', options: { providerId } })`, `logout`, `refreshToken`, and your own expiry check on the returned token.
- Compare the before/after authorization request (scopes, `prompt`, audience) and token response in a test tenant.

### Step 4: Identity Vault -> Native Biometric

```bash
npm install @capgo/capacitor-native-biometric
npx cap sync
```

```ts
import { NativeBiometric, AccessControl } from '@capgo/capacitor-native-biometric';

await NativeBiometric.setCredentials({
  server: 'com.company.app.session',
  username: userId,
  password: refreshToken,
  accessControl: AccessControl.BIOMETRY_CURRENT_SET,
});

const { password: token } = await NativeBiometric.getSecureCredentials({
  server: 'com.company.app.session',
  reason: 'Unlock your account',
});
```

- `lockAfterBackgrounded` -> on `App` `resume`, if elapsed time exceeds the timeout, show a lock screen and call `getSecureCredentials` again.
- `DeviceSecurityType.Both` / passcode fallback -> `verifyIdentity` supports device passcode fallback on iOS; protected credential reads stay biometric-only.
- `BIOMETRY_CURRENT_SET` invalidates the item when biometrics change (like Identity Vault's strict mode); `BIOMETRY_ANY` survives enrollment changes.
- Privacy screen in app switcher -> `@capacitor/privacy-screen`.
- iOS: add `NSFaceIDUsageDescription` to `Info.plist`.

### Step 5: Secure Storage -> Fast SQL or Data Storage SQLite

```bash
npm install @capgo/capacitor-fast-sql
npx cap sync
```

```ts
import { FastSQL, KeyValueStore } from '@capgo/capacitor-fast-sql';

const db = await FastSQL.connect({ database: 'app', encrypted: true, encryptionKey });
const kv = await KeyValueStore.open({ database: 'kv', encrypted: true, encryptionKey });
```

- Keep the same schema; port queries (`executeSql` -> `db.query` / `db.run` / `db.executeBatch` / `db.transaction`).
- Encryption requires SQLCipher: Android `implementation 'net.zetetic:sqlcipher-android:<version>'` in `android/app/build.gradle`; iOS CocoaPods subspec `CapgoCapacitorFastSql/SQLCipher`. Without it, `encrypted: true` fails with `Encryption is not available in this build` on iOS.
- Fast SQL runs a localhost HTTP server: add `NSAppTransportSecurity` -> `NSAllowsLocalNetworking` (iOS) and a localhost cleartext `network_security_config.xml` (Android). See `sqlite-to-fast-sql` for the full setup.
- Store `encryptionKey` with Native Biometric (Step 4) or derive it server-side; never hard-code it.

### Step 6: Clean up

```bash
npm uninstall @ionic-enterprise/auth @ionic-enterprise/identity-vault @ionic-enterprise/secure-storage
rg -n "@ionic-enterprise" -g '!node_modules' .
npx cap sync
```

Remove the Ionic Enterprise registry/token lines from `.npmrc` only after no enterprise package remains (CI installs fail otherwise).

## Verification

- Upgrade test: install the current store build, log in, store data; install the new build over it; user stays logged in and data is present.
- Fresh install: login, token refresh, logout, and biometric unlock work on real iOS and Android devices (simulators cannot fully test biometrics).
- Change device biometrics: `BIOMETRY_CURRENT_SET` items become unreadable and the app falls back to login.
- `rg -n "@ionic-enterprise" -g '!node_modules' .` returns nothing after the final release.
- `npm ci` succeeds in CI without Ionic Enterprise registry credentials.

## Error Handling

| Problem | Fix |
|---|---|
| `npm error 401 Unauthorized` / `404` for `@ionic-enterprise/*` in CI | Enterprise registry token expired; finish removal or keep the token until release N+1 |
| Users logged out after update | Data not carried over; ship the dual-plugin release N first |
| `redirect_uri_mismatch` / IdP error after switching | Register the new redirect URL with the IdP; keep scopes identical |
| `Encryption is not available in this build` | Add the SQLCipher dependency/subspec, rebuild |
| Fast SQL calls fail with network errors | Missing ATS local networking / Android cleartext config for localhost |
| Biometric read fails after enrollment change | Expected with `BIOMETRY_CURRENT_SET`; re-authenticate and save again |
