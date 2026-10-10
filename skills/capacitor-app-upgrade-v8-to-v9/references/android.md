# Android: Capacitor 8 -> 9 (app)

Requirements: Android Studio 2026.1.1+, AGP 9.2.1, Gradle 9.5.1, minSdk 26, compileSdk 37 (targetSdk inferred = 37).

Android Studio can do part of this: Tools -> AGP Upgrade Assistant -> 9.2.1 -> Run selected steps. Then undo what it adds to `gradle.properties` (next section).

## 1. Clean up `android/gradle.properties`

Remove all of these if present. Most are deprecated AGP 8 compatibility flags; `android.builtInKotlin=false` and `android.sdk.defaultTargetSdkToCompileSdkIfUnset=false` actively break a Capacitor 9 build.

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

Keep unrelated user settings (`org.gradle.jvmargs`, `android.useAndroidX`, signing props).

## 2. `android/variables.gradle`

```groovy
minSdkVersion = 26
compileSdkVersion = 37
targetSdkVersion = 37
androidxActivityVersion = '1.13.0'
androidxAppCompatVersion = '1.7.1'
androidxCoordinatorLayoutVersion = '1.3.0'
androidxCoreVersion = '1.19.0'
androidxFragmentVersion = '1.8.9'
coreSplashScreenVersion = '1.2.0'
androidxWebkitVersion = '1.16.0'
junitVersion = '4.13.2'
androidxJunitVersion = '1.3.0'
androidxEspressoCoreVersion = '3.7.0'
cordovaAndroidVersion = '15.0.0'
```

Keep extra variables the app or plugins rely on; bump official plugin variables per `plugins-and-cli.md`. minSdk 26 drops Android 7.x; confirm with the user if they still ship to it.

## 3. `android/app/build.gradle`

Remove the explicit target SDK (AGP 9 infers it from compileSdk):

```diff
 defaultConfig {
     minSdkVersion rootProject.ext.minSdkVersion
-    targetSdkVersion rootProject.ext.targetSdkVersion
```

Rename the default ProGuard file (fails even with `minifyEnabled false`):

```diff
-proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
+proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
```

`-optimize` enables R8 optimizations for minified builds. If the app minifies, test a release build; add keep rules for reflection-based code that breaks.

Declare root variables explicitly at the top (implicit parent lookup is deprecated in Gradle 9.6, an error in Gradle 10):

```groovy
apply plugin: 'com.android.application'

def androidxAppCompatVersion = rootProject.ext.androidxAppCompatVersion
def androidxCoordinatorLayoutVersion = rootProject.ext.androidxCoordinatorLayoutVersion
def coreSplashScreenVersion = rootProject.ext.coreSplashScreenVersion
def junitVersion = rootProject.ext.junitVersion
def androidxJunitVersion = rootProject.ext.androidxJunitVersion
def androidxEspressoCoreVersion = rootProject.ext.androidxEspressoCoreVersion
```

Add a `def` for every other `variables.gradle` name the file uses:

```bash
grep -oE '\$[{]?[a-zA-Z]+Version' android/app/build.gradle | tr -d '${' | sort -u
```

## 4. core-ktx

`androidx.core:core` 1.19.0 absorbs `core-ktx`. An explicit older `core-ktx` can cause duplicate-class errors:

```diff
-implementation "androidx.core:core-ktx:1.17.0"
+implementation "androidx.core:core:1.19.0"
```

If the duplicate comes from a third-party plugin, upgrade that plugin or report it upstream.

## 5. Kotlin and jcenter

AGP 9 bundles Kotlin (2.2.10). Remove the standalone setup from root and app `build.gradle` and any local module:

```diff
-classpath "org.jetbrains.kotlin:kotlin-gradle-plugin:2.2.20"
-apply plugin: 'kotlin-android'
-implementation "org.jetbrains.kotlin:kotlin-stdlib:2.2.20"
```

Gradle 9 removed `jcenter()`:

```diff
 repositories {
     google()
-    jcenter()
+    mavenCentral()
 }
```

## 6. Root `android/build.gradle` classpaths and wrapper

```diff
-classpath 'com.android.tools.build:gradle:8.13.0'
+classpath 'com.android.tools.build:gradle:9.2.1'
-classpath 'com.google.gms:google-services:4.4.4'
+classpath 'com.google.gms:google-services:4.5.0'
```

`android/gradle/wrapper/gradle-wrapper.properties`:

```properties
distributionUrl=https\://services.gradle.org/distributions/gradle-9.5.1-all.zip
```

Or `cd android && ./gradlew wrapper --gradle-version 9.5.1 --distribution-type all`.

## 7. Cordova modules

With no Cordova plugins, sync stops generating the `capacitor-cordova-android` / `capacitor-cordova-android-plugins` entries in `settings.gradle` and `app/build.gradle`. Code importing `com.getcapacitor.cordova.*` then fails. Remove the reference or keep a Cordova plugin installed.

## 8. App Java code

Custom Java/Kotlin in the app (local plugins, MainActivity) using removed APIs (`@NativePlugin`, `saveCall`, `pluginRequestPermission`, `startActivityForResult(call, intent, int)`, `CapConfig.getString`, ...) fails to compile. Full table: `capacitor-plugin-upgrade-v8-to-v9` -> `references/android-api-removals.md`.

## Build

```bash
cd android && ./gradlew clean assembleDebug
cd android && ./gradlew assembleRelease   # if the app minifies, this exercises the optimize ProGuard file
```
