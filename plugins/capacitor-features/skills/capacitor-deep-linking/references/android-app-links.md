# Android App Links

Load when configuring or debugging verified `https://` links on Android.

## 1. Intent filter

In `android/app/src/main/AndroidManifest.xml`, inside `MainActivity` (keep `android:launchMode="singleTask"` from the template):

```xml
<intent-filter android:autoVerify="true">
  <action android:name="android.intent.action.VIEW" />
  <category android:name="android.intent.category.DEFAULT" />
  <category android:name="android.intent.category.BROWSABLE" />
  <data android:scheme="https" />
  <data android:host="example.com" />
  <data android:pathPrefix="/product" />
  <data android:pathPrefix="/invite" />
</intent-filter>
```

- Keep verified https filters separate from custom-scheme filters. `<data>` elements in one filter are combined, so mixing schemes creates unintended matches.
- Android 12+ verifies each host independently; every host listed must serve a valid `assetlinks.json`.

## 2. assetlinks.json

Serve at `https://example.com/.well-known/assetlinks.json`:

```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.example.app",
    "sha256_cert_fingerprints": ["AA:BB:...:99"]
  }
}]
```

Include every signing certificate that ships builds:
- Play App Signing: copy the **App signing key** SHA-256 from Play Console -> Test and release -> App integrity. The upload key fingerprint alone fails for Play-installed builds.
- Debug: `keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android`
- Release keystore: `keytool -list -v -keystore release.keystore -alias <alias>`
- Built APK: `keytool -printcert -jarfile app-release.apk`

## 3. Verify

```bash
curl -s https://example.com/.well-known/assetlinks.json
adb shell pm verify-app-links --re-verify com.example.app
adb shell pm get-app-links com.example.app
adb shell am start -W -a android.intent.action.VIEW -c android.intent.category.BROWSABLE -d "https://example.com/product/123"
```

`get-app-links` states:
- `verified` - working.
- `none` - not verified yet or no autoVerify filter.
- `legacy_failure` / `1024` (or other numeric codes) - verification failed: unreachable file, redirect, wrong package, or fingerprint mismatch.

Google's Statement List tester: https://developers.google.com/digital-asset-links/tools/generator

## Traps

- The file must be served directly (no redirects, including http->https or apex->www) with `Content-Type: application/json`.
- Verification happens at install time. After fixing the server file, re-run `pm verify-app-links --re-verify` or reinstall.
- On Android 12+, an unverified https link opens the browser, not a chooser. Users can manually enable "Open supported links" in app settings, but do not rely on it.
- Warm opens with `singleTask` deliver the URL via `onNewIntent`; Capacitor's App plugin handles this. Custom `MainActivity` overrides of `onNewIntent` must call `super.onNewIntent(intent)`.
