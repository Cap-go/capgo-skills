# Android Submission (Google Play Console)

## Prerequisites

- Google Play developer account. Personal accounts created after Nov 13, 2023 must complete a closed test (12+ opted-in testers, 14 consecutive days) before production access; organization accounts are exempt.
- `applicationId` in `android/app/build.gradle` matches the Play listing package name. It can never change after the first upload.
- SDK levels in `android/variables.gradle`:
  - Capacitor 8: `minSdkVersion = 24`, `compileSdkVersion = 36`, `targetSdkVersion = 36`.
  - Capacitor 9: `minSdkVersion = 26`, `compileSdkVersion = 37`, `targetSdkVersion = 37` (AGP 9 can infer target from compile SDK).
  - Play requirement since Aug 31, 2026: target API 36 for new apps and updates.

## Release signing

Generate an upload key once and store it outside the repo:

```bash
keytool -genkeypair -v -keystore upload-keystore.jks -alias upload \
  -keyalg RSA -keysize 2048 -validity 10000
```

Wire it via `android/keystore.properties` (gitignored) or CI environment variables:

```groovy
// android/app/build.gradle
def keystoreProps = new Properties()
def keystoreFile = rootProject.file('keystore.properties')
if (keystoreFile.exists()) keystoreProps.load(new FileInputStream(keystoreFile))

android {
    signingConfigs {
        release {
            storeFile keystoreProps['storeFile'] ? file(keystoreProps['storeFile']) : null
            storePassword keystoreProps['storePassword']
            keyAlias keystoreProps['keyAlias']
            keyPassword keystoreProps['keyPassword']
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

- AGP 9 (Capacitor 9) removed `proguard-android.txt`; use `proguard-android-optimize.txt`.
- If you turn on `minifyEnabled`, test every plugin: R8 can strip classes reached by reflection. Add keep rules from plugin READMEs.
- Enroll in Play App Signing (default for new apps). Google holds the app signing key; you keep the upload key. Losing the upload key is recoverable through Play Console; losing a legacy self-managed signing key is not.

## Build

```bash
npm run build && npx cap sync android
cd android && ./gradlew bundleRelease
# output: android/app/build/outputs/bundle/release/app-release.aab
```

Or `npx cap build android --androidreleasetype AAB --keystorepath ... --keystorepass ... --keystorealias ... --keystorealiaspass ...`.

Do not add `ndk { abiFilters ... }` unless you know why; Play splits ABIs from the AAB automatically.

## 16 KB page size

Apps targeting Android 15+ that ship native `.so` files must be 16 KB aligned. Pure Java/Kotlin plugins are fine. Check with Android Studio's APK Analyzer (Build -> Analyze APK, alignment column) or Lint warnings, then update offending SDKs (SQLCipher, ML Kit, media codecs, older analytics SDKs).

## Play Console setup

- Store listing: app name (30), short description (80), full description (4000), icon 512x512 PNG, feature graphic 1024x500, 2-8 phone screenshots.
- App content: privacy policy URL, ads declaration, app access (demo credentials for login-gated apps), content rating (IARC), target audience, Data safety form, account deletion URL if the app has accounts, government/financial/health declarations where relevant.
- Data safety must include data collected by SDKs (Firebase, crash reporters, analytics).

## Tracks

| Track | Use |
|---|---|
| Internal testing | Up to 100 testers, available within minutes, no full review |
| Closed testing | Invite lists or Google Groups; satisfies the 12-tester rule |
| Open testing | Public beta listing |
| Production | Staged rollout by percentage; halt if crash rate spikes |

## Pre-submission checks

- Pre-launch report (runs automatically on uploaded builds) shows no crashes or accessibility blockers.
- Release-signed build tested: deep links (App Links need the Play app signing key SHA-256 in `assetlinks.json`, not just your upload key), push (FCM), Google Sign-In (register the Play signing SHA-1/SHA-256 in Firebase/Google Cloud).
