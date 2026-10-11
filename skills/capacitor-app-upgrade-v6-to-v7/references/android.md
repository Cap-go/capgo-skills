# Android changes for Capacitor 7 (apps)

Source: https://capacitorjs.com/docs/updating/7-0

## `android/variables.gradle` minimums

```groovy
minSdkVersion = 23
compileSdkVersion = 35
targetSdkVersion = 35
androidxActivityVersion = '1.9.2'
androidxAppCompatVersion = '1.7.0'
androidxCoordinatorLayoutVersion = '1.2.0'
androidxCoreVersion = '1.15.0'
androidxFragmentVersion = '1.8.4'
coreSplashScreenVersion = '1.0.1'
androidxWebkitVersion = '1.12.1'
junitVersion = '4.13.2'
androidxJunitVersion = '1.2.1'
androidxEspressoCoreVersion = '3.6.1'
cordovaAndroidVersion = '10.1.1'
```

## `android/build.gradle` (root)

```diff
 dependencies {
-    classpath 'com.android.tools.build:gradle:8.2.1'
+    classpath 'com.android.tools.build:gradle:8.7.2'
-    classpath 'com.google.gms:google-services:4.4.0'
+    classpath 'com.google.gms:google-services:4.4.2'
 }
```

If the project uses Kotlin, set `kotlin_version = '1.9.25'`.

## `android/gradle/wrapper/gradle-wrapper.properties`

```diff
-distributionUrl=https\://services.gradle.org/distributions/gradle-8.2.1-all.zip
+distributionUrl=https\://services.gradle.org/distributions/gradle-8.11.1-all.zip
```

## Optional: `navigation` in `configChanges`

Prevents activity restarts on some devices when a Bluetooth keyboard connects.

```diff
 <!-- android/app/src/main/AndroidManifest.xml, main <activity> -->
-android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode"
+android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode|navigation"
```

## Java 21

Android Studio Ladybug ships JDK 21. In CI use `actions/setup-java` with `java-version: 21`.
