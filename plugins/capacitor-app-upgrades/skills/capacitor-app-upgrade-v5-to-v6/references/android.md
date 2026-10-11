# Android changes for Capacitor 6 (apps)

Source: https://capacitorjs.com/docs/updating/6-0

## `android/variables.gradle` minimums

```groovy
minSdkVersion = 22
compileSdkVersion = 34
targetSdkVersion = 34
androidxActivityVersion = '1.8.0'
androidxAppCompatVersion = '1.6.1'
androidxCoordinatorLayoutVersion = '1.2.0'
androidxCoreVersion = '1.12.0'
androidxFragmentVersion = '1.6.2'
coreSplashScreenVersion = '1.0.1'
androidxWebkitVersion = '1.9.0'
junitVersion = '4.13.2'
androidxJunitVersion = '1.1.5'
androidxEspressoCoreVersion = '3.5.1'
cordovaAndroidVersion = '10.1.1'
```

## `android/build.gradle` (root)

```diff
 dependencies {
-    classpath 'com.android.tools.build:gradle:8.0.0'
+    classpath 'com.android.tools.build:gradle:8.2.1'
-    classpath 'com.google.gms:google-services:4.3.15'
+    classpath 'com.google.gms:google-services:4.4.0'
 }
```

If the project uses Kotlin, set `kotlin_version = '1.9.10'`.

## `android/app/build.gradle`

`compileSdkVersion` is deprecated in AGP 8.2; `npx cap migrate` rewrites it:

```diff
-    compileSdkVersion rootProject.ext.compileSdkVersion
+    compileSdk rootProject.ext.compileSdkVersion
```

## `android/gradle/wrapper/gradle-wrapper.properties`

```diff
-distributionUrl=https\://services.gradle.org/distributions/gradle-8.0.2-all.zip
+distributionUrl=https\://services.gradle.org/distributions/gradle-8.2.1-all.zip
```

## androidScheme

```ts
// capacitor.config.ts - keep v5 origin to preserve WebView storage
server: { androidScheme: 'http' }
```

Remove the entry only if it was already `'https'`.
