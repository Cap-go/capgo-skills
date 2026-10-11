# Native Projects

## iOS

### Dependency manager

| Signal | Setup |
|--------|-------|
| `ios/App/CapApp-SPM/Package.swift`, no `Podfile` | Swift Package Manager (default for new projects since Capacitor 8) |
| `ios/App/Podfile`, `App.xcworkspace` | CocoaPods |

CocoaPods Trunk is expected to become read-only on December 2, 2026. New pod versions will stop publishing, so recommend migrating with `cocoapods-to-spm`. For a new platform add:

```bash
npx cap add ios                         # SPM by default
npx cap add ios --packagemanager CocoaPods   # only if a required plugin lacks SPM support
```

With SPM, plugin packages are managed by `npx cap sync` through `CapApp-SPM/Package.swift`. Do not add Capacitor plugins by hand in Xcode's package UI; sync will not track them.

### Scene lifecycle (Capacitor 8.5+)

Capacitor 8.5 adopts `UIScene`; Xcode 27 requires it. Adopted projects have `SceneDelegate.swift`, `UIApplicationSceneManifest` in `Info.plist`, and `application(_:configurationForConnecting:options:)` in `AppDelegate`.

Review traps:
- Custom code in `AppDelegate` `application(_:open:options:)`, `application(_:continue:restorationHandler:)`, `applicationDidBecomeActive`, `applicationWillResignActive`, etc. no longer runs after adoption. Move it to the scene delegate equivalents.
- JS `resume`/`pause` events and `App.getLaunchUrl()` keep working through Capacitor's scene proxy.
- Avoid `UIScreen.main`, `UIApplication.shared.windows`, `interfaceOrientation`, and `userInterfaceIdiom`-based layout in native code; resizable windows and foldable iPhones break those assumptions. Use the view's `window.windowScene`, trait collections, and safe areas.

Full procedure: `capacitor-uiscene-migration`.

### Deployment target

- Capacitor 8: iOS 15.0 minimum. Capacitor 9: iOS 16.0.
- Gate newer APIs in native code with `if #available(iOS 17, *)`.
- Capacitor 9 with Swift 6 rejects `@UIApplicationMain`; use `@main` on `AppDelegate`.

## Android

### `android/variables.gradle`

Capacitor 8 template values:

```groovy
ext {
    minSdkVersion = 24
    compileSdkVersion = 36
    targetSdkVersion = 36
    // androidx* versions...
}
```

Capacitor 9: `minSdkVersion = 26`, compile/target 37, AGP 9.2.1, Gradle 9.5.1. Do not bump SDK levels independently of the Capacitor major: plugin AARs are built against the matching values. Google Play enforces a minimum `targetSdkVersion` for updates; check current Play policy before release.

### Release build type

The template ships `minifyEnabled false`. Enabling R8 shrinks native code; test every plugin afterwards.

```groovy
buildTypes {
    release {
        minifyEnabled true
        proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
    }
}
```

Use `proguard-android-optimize.txt`: AGP 9 (Capacitor 9) removed `proguard-android.txt`, so older templates fail to build after upgrading.

### Capacitor 9 Gradle changes to expect

- Kotlin is built into AGP 9: remove `kotlin-android` plugin and explicit stdlib.
- `jcenter()` is removed: use `google()` and `mavenCentral()`.
- `androidx.core:core-ktx` is folded into `core` 1.19.0.
- The Cordova Gradle modules are only included when a Cordova plugin is installed.

Run these through `capacitor-app-upgrade-v8-to-v9`, not ad hoc.

### Signing

Never commit keystores or passwords. Keep them in CI secrets or `~/.gradle/gradle.properties`. Pipeline setup: `capacitor-ci-cd`; cloud builds: `capgo-native-builds`.

## Both platforms

- Commit `ios/` and `android/`; treat changes there like code review.
- After `npm install` of anything native, run `npx cap sync`, then build from Xcode/Android Studio or `npx cap run`.
- Keep native customizations minimal and documented; every one is a merge risk during major upgrades.
