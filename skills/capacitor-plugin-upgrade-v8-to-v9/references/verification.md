# Plugin Verification: Capacitor 8 -> 9

## 1. Leftover symbols (expect no output)

```bash
grep -rn --include=*.java --include=*.kt -E '@NativePlugin|\bsaveCall\(|pluginRequestPermission|pluginRequestAllPermissions|startActivityForPluginWithResult|isSaved\(\)|CAPACITOR_HTTPS_INTERCEPTOR_START|getConfigValue\(' android/src
grep -rn --include=*.swift --include=*.m -E '\bCAPBridge\b|getWebView\(\)|isSimulator\(\)|presentVC\(|dismissVC\(|modulePrint\(|CAPNotifications|getConfigValue\(|tmpWindow|TmpViewController|import Cordova' ios
grep -rn -E "jcenter\(\)|proguard-android\.txt|kotlin-android|kotlin-gradle-plugin|kotlin-stdlib|core-ktx|targetSdkVersion|com\.mycompany\.plugins" android/build.gradle
grep -n -E 'android\.builtInKotlin=false|defaultTargetSdkToCompileSdkIfUnset=false|uniquePackageNames=false' android/gradle.properties 2>/dev/null
grep -n -E '"Cordova"|\.v15|from: "8' Package.swift
grep -n "deployment_target = '15" *.podspec
```

Expected positives:

```bash
grep -n -E 'compileSdk|minSdkVersion|namespace|tools.build:gradle' android/build.gradle   # 37 / 26 / unique / 9.2.1
grep -n distributionUrl android/gradle/wrapper/gradle-wrapper.properties                  # 9.5.1
grep -n -E '\.v16|capacitor-swift-pm' Package.swift                                       # .v16, from 9.0.0-alpha.x
grep -n deployment_target *.podspec                                                       # 16.0
node -p "require('./package.json').peerDependencies['@capacitor/core']"
```

## 2. Builds

Prefer the repo's own script if present (`npm run verify`). Otherwise:

```bash
npm run build                                   # TS + docgen
cd android && ./gradlew clean build && cd ..    # library module
xcodebuild -scheme <PluginScheme> -destination 'generic/platform=iOS Simulator' build   # SPM, from the plugin root
cd ios && pod install && cd ..                  # old structure / CocoaPods test project, if present
pod lib lint --allow-warnings                   # podspec validity (needs CocoaPods installed)
```

Run `xcodebuild -list` first to find the SPM scheme name.

## 3. Example app

```bash
cd example-app
npm install
npx cap sync
npx cap run ios
npx cap run android
```

- Every public method returns the documented payload on both platforms.
- Permissions: request, deny, grant paths (Android `@PermissionCallback`, iOS prompts).
- Activity-result flows (pickers, intents) return data.
- Listeners / kept-alive calls keep firing and release cleanly.
- Lifecycle-sensitive features behave on background/foreground (scene-based app).
- If the plugin handles URLs: cold and warm open in the example app.
- Test an example app with no Cordova plugins installed (default for v9), to catch Cordova-layer references.

## 4. Release

- Bump the plugin major (`9.0.0`, or a prerelease like `9.0.0-alpha.0` while core is alpha).
- While core 9 is prerelease, publish with `npm publish --tag next` unless the user decides otherwise.
- Update README compatibility table and CHANGELOG with the breaking changes (iOS 16, minSdk 26, Capacitor 9 only).
