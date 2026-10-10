# Android changes for Capacitor 5 (apps)

Source: https://capacitorjs.com/docs/updating/5-0

## `android/variables.gradle` minimums

```groovy
minSdkVersion = 22
compileSdkVersion = 33
targetSdkVersion = 33
androidxActivityVersion = '1.7.0'
androidxAppCompatVersion = '1.6.1'
androidxCoordinatorLayoutVersion = '1.2.0'
androidxCoreVersion = '1.10.0'
androidxFragmentVersion = '1.5.6'
coreSplashScreenVersion = '1.0.0'
androidxWebkitVersion = '1.6.1'
junitVersion = '4.13.2'
androidxJunitVersion = '1.1.5'
androidxEspressoCoreVersion = '3.5.1'
cordovaAndroidVersion = '10.1.1'
```

Keep any extra plugin variables you already have; update the ones listed in `plugins.md`.

## `android/build.gradle` (root)

```diff
 dependencies {
-    classpath 'com.android.tools.build:gradle:7.2.1'
+    classpath 'com.android.tools.build:gradle:8.0.0'
-    classpath 'com.google.gms:google-services:4.3.13'
+    classpath 'com.google.gms:google-services:4.3.15'
 }
```

If the project uses Kotlin, set `kotlin_version = '1.8.20'`.

## `android/gradle/wrapper/gradle-wrapper.properties`

```diff
-distributionUrl=https\://services.gradle.org/distributions/gradle-7.4.2-all.zip
+distributionUrl=https\://services.gradle.org/distributions/gradle-8.0.2-all.zip
```

## Move `package` to `namespace`

```diff
 <!-- android/app/src/main/AndroidManifest.xml -->
-<manifest xmlns:android="http://schemas.android.com/apk/res/android"
-    package="com.example.app">
+<manifest xmlns:android="http://schemas.android.com/apk/res/android">
```

```diff
 // android/app/build.gradle
 android {
+    namespace "com.example.app"
     compileSdkVersion rootProject.ext.compileSdkVersion
```

## Disable Jetifier (only if no support-library dependencies remain)

```diff
 # android/gradle.properties
 android.useAndroidX=true
-# Automatically convert third-party libraries to use AndroidX
-android.enableJetifier=true
```

## Java 17

AGP 8 requires JDK 17 to run Gradle. Android Studio Flamingo ships it. In CI, set `actions/setup-java` (or equivalent) to `17`.
