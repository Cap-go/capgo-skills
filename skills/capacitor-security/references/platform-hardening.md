# Platform Hardening (App Level)

Manifest, Info.plist, and runtime protections. For Xcode compiler/linker hardening and Enhanced Security build settings, use `capacitor-ios-security-hardening`.

## Android

The Capacitor template ships `android:allowBackup="true"` and an exported `MainActivity` (required for the launcher). Review:

| Item | Check | Fix |
|------|-------|-----|
| Backup | `android:allowBackup="true"` copies app data (SharedPreferences, WebView storage, databases) to Google backup / `adb backup` | Set `android:allowBackup="false"`, or keep backups and exclude sensitive files with `android:fullBackupContent` (API 30 and below) and `android:dataExtractionRules` (API 31+) |
| Cleartext | `android:usesCleartextTraffic="true"` or `cleartextTrafficPermitted="true"` in NSC | See network.md |
| Debuggable | `android:debuggable="true"` in the manifest | Remove; Gradle sets it per build type |
| Exported components | `android:exported="true"` on activities/services/receivers/providers beyond the launcher | Set `exported="false"` or protect with `android:permission`; validate intent extras |
| FileProvider | `file_paths.xml` exposing `<root-path>` or the whole external storage | Limit to the directories you share |
| Permissions | Dangerous permissions not needed by a feature (`READ_SMS`, `ACCESS_BACKGROUND_LOCATION`, `REQUEST_INSTALL_PACKAGES`, `SYSTEM_ALERT_WINDOW`) | Remove; plugins add their own via manifest merge, check `app/build/intermediates/merged_manifests` |
| Signing | Keystore or passwords committed (`*.jks`, `*.keystore`, `storePassword` in `build.gradle`, `android.buildOptions.keystorePassword` in `capacitor.config`) | Move to CI secrets / `~/.gradle/gradle.properties`; rotate if pushed |

R8 / minification: the Capacitor template ships `minifyEnabled false`. Enabling it shrinks and obfuscates native code (not the web bundle):

```groovy
// android/app/build.gradle
buildTypes {
    release {
        minifyEnabled true
        // Capacitor 9 / AGP 9 removed proguard-android.txt
        proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
    }
}
```

Test every plugin after enabling it; add `-keep` rules if a plugin's docs require them. Obfuscation is defense in depth, not a secret store.

## iOS

| Item | Check | Fix |
|------|-------|-----|
| ATS | `NSAllowsArbitraryLoads`, `NSAllowsArbitraryLoadsInWebContent` | See network.md |
| File sharing | `UIFileSharingEnabled` / `LSSupportsOpeningDocumentsInPlace` = true exposes `Documents/` in Finder and the Files app | Remove unless the feature needs it; keep sensitive data in `Library/` |
| Entitlements | `get-task-allow` in release, unused `com.apple.developer.*` capabilities | Release signing strips `get-task-allow`; remove unused capabilities in Xcode Signing & Capabilities |
| URL schemes | `CFBundleURLTypes` handlers trusting input | Validate in JS (see webview-and-bridge.md) |
| Keychain accessibility | Native code using `kSecAttrAccessibleAlways*` (deprecated) | Use `kSecAttrAccessibleWhenUnlockedThisDeviceOnly` or `AfterFirstUnlockThisDeviceOnly` |
| Pasteboard | Copying OTPs/tokens to `UIPasteboard.general` | Avoid, or set an expiration and `localOnly` |

## Screenshot and app-switcher protection

`@capgo/capacitor-privacy-screen`:
- Android: `FLAG_SECURE` blocks screenshots, screen recording, and the recents preview.
- iOS: hides content in the app switcher snapshot (blur or launch screen). iOS does not allow blocking user screenshots.

```typescript
import { PrivacyScreen } from '@capgo/capacitor-privacy-screen';

await PrivacyScreen.enable({ ios: { blurEffect: 'dark' } }); // entering a sensitive screen
await PrivacyScreen.disable();                               // leaving it
```

Or enable globally with `plugins.PrivacyScreen.enabled: true` in `capacitor.config.*`.

## Root / jailbreak detection

Decide with the user: detection is bypassable and false positives lock out real users. Typical policy is warn or restrict high-risk actions, not block.

```typescript
import { IsRoot } from '@capgo/capacitor-is-root';

const { result: compromised } = await IsRoot.isRooted(); // iOS + Android
if (compromised) {
  disableHighRiskFeatures(); // e.g. require server re-auth, hide stored cards
  reportToBackend('device_compromised');
}
```

- `isRooted()` returns `{ result: boolean }`. Most other methods are Android only.
- iOS URL-scheme checks (`cydia`, `sileo`, `zbra`, `filza`) need those schemes in `LSApplicationQueriesSchemes`; other checks need no config.
- For high-assurance apps, pair with server-side attestation (Play Integrity, App Attest). Check current platform docs before wiring those.

## Live update security (Capgo)

- Bundles uploaded without encryption are public assets; private channels limit distribution, not confidentiality.
- Enable end-to-end encryption (RSA + AES, Encryption V2):
  ```bash
  npx @capgo/cli@latest key create        # writes .capgo_key_v2 (private) and .capgo_key_v2.pub
  npx @capgo/cli@latest key save --key ./.capgo_key_v2.pub
  ```
  Never commit `.capgo_key_v2`. Add it to `.gitignore` and store it as a CI secret.
- Encryption also proves bundle authenticity: only the private key holder can publish a valid encrypted update.
- The public key ships in the app, so encryption does not make shipped JS impossible to inspect. It does not replace keeping secrets server-side.
- Call `CapacitorUpdater.notifyAppReady()` early so a broken bundle rolls back.

Setup and channel strategy: `capgo-live-updates`. Docs: https://capgo.app/docs/live-updates/encryption/
