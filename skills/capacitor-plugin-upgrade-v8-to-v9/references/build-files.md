# Plugin Build Files: Capacitor 8 -> 9

`npx @capacitor/plugin-migration-v8-to-v9@latest` applies most of this. Check each item against the diff anyway.

## package.json

```json
"devDependencies": {
  "@capacitor/android": "next",
  "@capacitor/cli": "next",
  "@capacitor/core": "next",
  "@capacitor/ios": "next"
},
"peerDependencies": {
  "@capacitor/core": ">=9.0.0-alpha.6"
}
```

After GA: `^9.0.0` everywhere. Run `npm install` and commit the lockfile.

## android/gradle.properties

Delete the AGP 8 compatibility flags (the AGP Upgrade Assistant re-adds them):

```properties
android.defaults.buildfeatures.resvalues=true
android.sdk.defaultTargetSdkToCompileSdkIfUnset=false
android.enableAppCompileTimeRClass=false
android.usesSdkInManifest.disallowed=false
android.uniquePackageNames=false
android.dependency.useConstraints=true
android.r8.strictFullModeForKeepRules=false
android.r8.optimizedResourceShrinking=false
android.builtInKotlin=false
android.newDsl=false
```

## android/build.gradle

SDK levels (drop `targetSdkVersion`, it does nothing in a library):

```groovy
android {
    namespace = "com.yourcompany.yourplugin"   // must be unique across the consuming app
    compileSdk = project.hasProperty('compileSdkVersion') ? rootProject.ext.compileSdkVersion : 37
    defaultConfig {
        minSdkVersion = project.hasProperty('minSdkVersion') ? rootProject.ext.minSdkVersion : 26
    }
    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

Namespace: AGP 9 makes `android.uniquePackageNames` true by default. Replace the scaffold default `com.mycompany.plugins.example` or an upstream namespace kept by a fork. Changing the namespace changes the generated `R`/`BuildConfig` package; update imports.

`ext` defaults: bump only the variables the plugin uses:

| Variable | v9 default |
|---|---|
| `androidxActivityVersion` | 1.13.0 |
| `androidxAppCompatVersion` | 1.7.1 |
| `androidxCoordinatorLayoutVersion` | 1.3.0 |
| `androidxCoreVersion` | 1.19.0 |
| `androidxFragmentVersion` | 1.8.9 |
| `androidxWebkitVersion` | 1.16.0 |
| `androidxBrowserVersion` | 1.10.0 |
| `androidxMaterialVersion` | 1.14.0 |
| `androidxExifInterfaceVersion` | 1.4.2 |
| `coreSplashScreenVersion` | 1.2.0 |
| `firebaseMessagingVersion` | 25.0.1 |
| `playServicesLocationVersion` | 21.4.0 |
| `googleMapsPlayServicesVersion` | 20.0.0 |
| `googleMapsUtilsVersion` | 5.0.0 (upstream breaking changes) |
| `googleMapsKtxVersion`, `googleMapsUtilsKtxVersion` | 6.0.1 |
| `kotlinxCoroutinesVersion` | 1.11.0 |
| `junitVersion` | 4.13.2 |
| `androidxJunitVersion` | 1.3.0 |
| `androidxEspressoCoreVersion` | 3.7.0 |

Pattern: `androidxCoreVersion = project.hasProperty('androidxCoreVersion') ? rootProject.ext.androidxCoreVersion : '1.19.0'`.

core-ktx: drop `androidxCoreKTXVersion`, depend on core:

```diff
-implementation "androidx.core:core-ktx:$androidxCoreKTXVersion"
+implementation "androidx.core:core:$androidxCoreVersion"
```

Kotlin plugins: AGP 9 bundles Kotlin 2.2.10. Remove `ext.kotlin_version`, the `kotlin-gradle-plugin` classpath, `apply plugin: 'kotlin-android'` (or `id 'org.jetbrains.kotlin.android'`), and `kotlin-stdlib`. Kotlin sources still compile.

Repositories and classpaths:

```diff
 repositories {
     google()
-    jcenter()
+    mavenCentral()
 }
 dependencies {
-    classpath 'com.android.tools.build:gradle:8.13.0'
+    classpath 'com.android.tools.build:gradle:9.2.1'
-    classpath 'com.google.gms:google-services:4.4.4'   // only if used
+    classpath 'com.google.gms:google-services:4.5.0'
 }
```

## android/gradle/wrapper/gradle-wrapper.properties

```properties
distributionUrl=https\://services.gradle.org/distributions/gradle-9.5.1-all.zip
```

## iOS: keep both podspec and Package.swift

Apps consume plugins through CocoaPods or SPM. Ship both until the plugin's README says otherwise; CocoaPods Trunk is expected to go read-only on December 2, 2026, which affects publishing new pods, so SPM support is mandatory going forward (see `capacitor-plugin-spm-support`).

`<Name>.podspec`:

```diff
-  s.ios.deployment_target = '15.0'
+  s.ios.deployment_target = '16.0'
```

`Package.swift`:

```diff
-    platforms: [.iOS(.v15)],
+    platforms: [.iOS(.v16)],
     dependencies: [
-        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "8.0.0")
+        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "9.0.0-alpha.6")
     ],
     targets: [
         .target(
             name: "MyPluginPlugin",
             dependencies: [
                 .product(name: "Capacitor", package: "capacitor-swift-pm"),
-                .product(name: "Cordova", package: "capacitor-swift-pm")
             ],
```

Use the newest alpha (`git ls-remote --tags https://github.com/ionic-team/capacitor-swift-pm.git | grep 9.0.0`). Remove `import Cordova` from sources at the same time.

Old-structure plugins with an Xcode project (`ios/Plugin.xcodeproj`): set iOS Deployment Target 16.0 in Project and Targets, and `platform :ios, '16.0'` in `ios/Podfile`.

## Example app

The example app is a normal Capacitor app: migrate it with `capacitor-app-upgrade-v8-to-v9` (Node 24, `@next` packages, scene template, AGP 9).
