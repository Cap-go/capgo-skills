# Android changes for Capacitor 8 (apps)

Source: https://capacitorjs.com/docs/updating/8-0

In Android Studio Otter you can run `Tools -> AGP Upgrade Assistant`, pick `8.13.0`, then `Run selected steps`.

## `android/variables.gradle` minimums

```groovy
minSdkVersion = 24
compileSdkVersion = 36
targetSdkVersion = 36
androidxActivityVersion = '1.11.0'
androidxAppCompatVersion = '1.7.1'
androidxCoordinatorLayoutVersion = '1.3.0'
androidxCoreVersion = '1.17.0'
androidxFragmentVersion = '1.8.9'
coreSplashScreenVersion = '1.2.0'
androidxWebkitVersion = '1.14.0'
junitVersion = '4.13.2'
androidxJunitVersion = '1.3.0'
androidxEspressoCoreVersion = '3.7.0'
cordovaAndroidVersion = '14.0.1'
```

## Gradle property assignment syntax (`android/app/build.gradle`)

Space assignment is deprecated in Gradle 8 and will break in a later release.

```diff
 android {
-    namespace "com.getcapacitor.myapp"
-    compileSdk rootProject.ext.compileSdkVersion
+    namespace = "com.getcapacitor.myapp"
+    compileSdk = rootProject.ext.compileSdkVersion
     defaultConfig {
         aaptOptions {
-            ignoreAssetsPattern '!.svn:!.git:!.ds_store:!*.scc:.*:!CVS:!thumbs.db:!picasa.ini:!*~'
+            ignoreAssetsPattern = '!.svn:!.git:!.ds_store:!*.scc:.*:!CVS:!thumbs.db:!picasa.ini:!*~'
```

Method calls such as `mavenCentral()` stay as-is.

## `android/build.gradle` (root)

```diff
 dependencies {
-    classpath 'com.android.tools.build:gradle:8.7.2'
+    classpath 'com.android.tools.build:gradle:8.13.0'
-    classpath 'com.google.gms:google-services:4.4.2'
+    classpath 'com.google.gms:google-services:4.4.4'
 }
```

## `android/gradle/wrapper/gradle-wrapper.properties`

```diff
-distributionUrl=https\://services.gradle.org/distributions/gradle-8.11.1-all.zip
+distributionUrl=https\://services.gradle.org/distributions/gradle-8.14.3-all.zip
```

## Kotlin 2.2.20 (only if the app uses Kotlin)

Set `kotlin_version = '2.2.20'`. Kotlin 2 breaks:

- `kotlinOptions {}` -> `kotlin { compilerOptions { jvmTarget = JvmTarget.JVM_21 } }` with `import org.jetbrains.kotlin.gradle.dsl.JvmTarget`.
- `kotlin-android-extensions` plugin is gone: use `kotlin-parcelize` and view binding.

## `density` in `configChanges`

Prevents WebView reload when the app is resized (multi-window, foldables, display size changes).

```diff
-android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode|navigation"
+android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode|navigation|density"
```

## Edge-to-edge

`android.adjustMarginsForEdgeToEdge` was removed. Capacitor 8 ships the System Bars core plugin (https://capacitorjs.com/docs/apis/system-bars). Remove the config key and pad the layout with CSS:

```css
body {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
}
```

Read the System Bars "Android note" for older WebView versions that do not report `env()` insets.

## Removed resource

`bridge_layout_main.xml` is now `capacitor_bridge_layout_main.xml`. Update `R.layout.bridge_layout_main` references in app code.
