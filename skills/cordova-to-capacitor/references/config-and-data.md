# config.xml, Data Preservation, and Native Config

## config.xml -> Capacitor

| config.xml | Capacitor |
|---|---|
| `<widget id="com.x.y">` | `appId` (must stay identical to update the existing store app) |
| `<name>` | `appName` (display name: `CFBundleDisplayName` in Info.plist, `app_name` in `android/app/src/main/res/values/strings.xml`) |
| `<widget version="1.2.3">` / `android-versionCode` / `ios-CFBundleVersion` | Xcode `MARKETING_VERSION`/`CURRENT_PROJECT_VERSION`; Gradle `versionName`/`versionCode`. Build numbers must be higher than the last Cordova upload |
| `<preference name="...">` | `cordova.preferences` in `capacitor.config.*` (copied by `cap init`); only Cordova plugins read them |
| `<preference name="Orientation">` | Xcode target "Device Orientation" (`UISupportedInterfaceOrientations`), Android `android:screenOrientation` on the activity |
| `<preference name="StatusBar*">` | `@capacitor/status-bar` config/API |
| `<preference name="SplashScreen*">`, `<splash>`, `<icon>` | `@capacitor/splash-screen` config + `npx @capacitor/assets generate` |
| `<access origin>` / `<allow-navigation>` | `server.allowNavigation` (only for navigating the WebView itself to external hosts; avoid broad wildcards) |
| `<allow-intent>` | Not needed; open external URLs with `@capacitor/browser` or `App.openUrl` patterns |
| `<edit-config>` / `<config-file>` | Manual one-time edits to Info.plist, entitlements, AndroidManifest.xml |
| `<platform name="android"><resource-file>` | Copy files into `android/app/src/main/...` and commit |

Sample:

```ts
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.company.app',
  appName: 'My App',
  webDir: 'www',
  server: {
    // iosScheme: 'ionic', // see Data preservation
  },
  cordova: {
    preferences: {
      ScrollEnabled: 'false',
    },
  },
};

export default config;
```

## Data preservation (decide before the first Capacitor release)

WebView storage (`localStorage`, IndexedDB, cookies, Cache Storage, service workers) is keyed by origin. If the Capacitor app serves from a different origin than the Cordova app did, users appear logged out and lose offline data.

| Previous Cordova setup | Previous origin | Capacitor setting to keep it |
|---|---|---|
| iOS + `cordova-plugin-ionic-webview` | `ionic://localhost` | `server.iosScheme: 'ionic'` |
| iOS + cordova-ios 6+ with `scheme`/`hostname` preferences | `<scheme>://<hostname>` | `server.iosScheme` + `server.hostname` matching |
| iOS + old `file://` UIWebView/WKWebView engine | `file://` | Cannot be matched; migrate data (read via a native step or ask users to re-login) |
| Android + `cordova-plugin-ionic-webview` | `http://localhost` | `server.androidScheme: 'http'` |
| Android + cordova-android 10+ default | `https://localhost` | Capacitor default (nothing to set) |
| Android + `AndroidInsecureFileModeEnabled` / old `file://` | `file://` | Cannot be matched; migrate data |

Check the current scheme by reading `config.xml` (`scheme`, `hostname`, `Scheme`, `Hostname`, `AndroidInsecureFileModeEnabled` preferences) and the installed webview plugin version. Test by installing the old store build, creating data, then installing the Capacitor build over it.

Keeping `http` on Android means no secure context for some web APIs (crypto.subtle, service workers on non-localhost); `localhost` is treated as secure, so this usually works, but test.

## Permissions and capabilities

Cordova plugins injected these at build time. Add them once, by hand:

- iOS `ios/App/App/Info.plist`: `NSCameraUsageDescription`, `NSPhotoLibraryUsageDescription`, `NSPhotoLibraryAddUsageDescription`, `NSLocationWhenInUseUsageDescription`, `NSMicrophoneUsageDescription`, `NSFaceIDUsageDescription`, etc., only for features you ship.
- iOS capabilities in Xcode Signing & Capabilities: Push Notifications, Associated Domains, Sign in with Apple, Background Modes.
- Android `android/app/src/main/AndroidManifest.xml`: only the permissions the replacement plugins document. Do not copy legacy `READ_EXTERNAL_STORAGE`/`WRITE_EXTERNAL_STORAGE` for Android 13+ (`READ_MEDIA_IMAGES` etc. or the photo picker instead).
- Custom URL schemes: `CFBundleURLTypes` (iOS), intent filters (Android); handle with `App.addListener('appUrlOpen', ...)`.

## Splash and icons

```bash
npm install -D @capacitor/assets
npx @capacitor/assets generate
```

Put sources in `assets/` (`logo.png` easy mode, or `icon-only.png`, `icon-foreground.png`, `icon-background.png`, `splash.png`, `splash-dark.png`).
