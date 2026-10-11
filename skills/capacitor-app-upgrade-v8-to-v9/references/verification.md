# Verification: Capacitor 8 -> 9 (app)

## 1. Versions

```bash
npx cap --version            # 9.0.0-alpha.x (or 9.x after GA)
npm ls @capacitor/core @capacitor/ios @capacitor/android
npx cap doctor
```

All `@capacitor/*` should resolve to the same 9.x prerelease/release.

## 2. Leftover symbols (each should print nothing)

```bash
EX="--exclude-dir=node_modules --exclude-dir=Pods --exclude-dir=build --exclude-dir=.gradle --exclude-dir=DerivedData"
grep -rn $EX --include=*.swift '@UIApplicationMain' ios
grep -rn $EX --include=*.swift --include=*.m -E '\bCAPBridge\b|CAPNotifications|tmpWindow|TmpViewController' ios
grep -rn $EX --include=*.gradle --include=*.kts 'jcenter()' android
grep -rn $EX --include=*.gradle --include=*.kts "proguard-android.txt" android
grep -rn $EX --include=*.gradle --include=*.kts -E "kotlin-android|org.jetbrains.kotlin.android|kotlin-gradle-plugin|kotlin-stdlib" android
grep -rn $EX --include=*.gradle --include=*.kts 'core-ktx' android
grep -n -E 'android\.builtInKotlin=false|defaultTargetSdkToCompileSdkIfUnset=false|android\.newDsl=false|android\.uniquePackageNames=false' android/gradle.properties
grep -n 'targetSdkVersion' android/app/build.gradle
grep -rn -E "presentationOptions.*alert" capacitor.config.* 2>/dev/null
grep -rn --include=package.json -E 'cap run .*(-l\b|--live-reload|--host |--port )' . --exclude-dir=node_modules
```

Expected positives:

```bash
grep -n 'IPHONEOS_DEPLOYMENT_TARGET' ios/App/App.xcodeproj/project.pbxproj   # all 16.0
grep -n "platform :ios" ios/App/Podfile 2>/dev/null                           # '16.0'
grep -n -E 'minSdkVersion|compileSdkVersion' android/variables.gradle        # 26 / 37
grep -n 'com.android.tools.build:gradle' android/build.gradle                # 9.2.1
grep -n distributionUrl android/gradle/wrapper/gradle-wrapper.properties     # gradle-9.5.1
grep -c UIApplicationSceneManifest ios/App/App/Info.plist                     # 1
```

Hits inside `node_modules` belong to plugins: upgrade them or report upstream; do not patch vendored files.

## 3. Builds

```bash
npm run build
npx cap sync
cd android && ./gradlew clean assembleDebug && cd ..
cd android && ./gradlew assembleRelease && cd ..      # catches ProGuard/R8 issues when minify is on
xcodebuild -project ios/App/App.xcodeproj -scheme App -configuration Debug \
  -destination 'generic/platform=iOS Simulator' build   # CocoaPods: -workspace ios/App/App.xcworkspace
```

## 4. Device checks

Run on a device or emulator for each platform (`npx cap run ios`, `npx cap run android`):

- App launches, web assets load, no white or black screen.
- Splash: hides as expected; if the 200ms fade mattered, it is configured.
- Background/foreground fires JS `pause` / `resume`.
- Deep link cold and warm reaches `appUrlOpen`; `App.getLaunchUrl()` on cold start.
- Push: token registers; foreground notification displays (iOS uses `banner`/`list`).
- Each native plugin the app uses: exercise one call (camera, geolocation, filesystem, etc.).
- Live reload: `npx cap run android --url http://<lan-ip>:<port>` connects.
- Release build on Android if minified: smoke-test screens that rely on reflection (JSON mappers, plugins).

## 5. Report

Summarize per platform: versions, files changed, greps clean or remaining hits (with owner), build result, device checks passed/failed, and plugins without a Capacitor 9 release.
