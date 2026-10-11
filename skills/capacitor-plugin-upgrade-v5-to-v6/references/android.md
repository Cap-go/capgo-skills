# Plugin Android changes for Capacitor 6

Source: https://capacitorjs.com/docs/updating/plugins/6-0. Paths are the plugin's `android/` folder.

## `compileSdk` and SDK 34 defaults (`build.gradle`)

```diff
 android {
-    compileSdkVersion project.hasProperty('compileSdkVersion') ? rootProject.ext.compileSdkVersion : 33
+    compileSdk project.hasProperty('compileSdkVersion') ? rootProject.ext.compileSdkVersion : 34
-    targetSdkVersion project.hasProperty('targetSdkVersion') ? rootProject.ext.targetSdkVersion : 33
+    targetSdkVersion project.hasProperty('targetSdkVersion') ? rootProject.ext.targetSdkVersion : 34
```

Keep reading `rootProject.ext.compileSdkVersion` (the app variable name did not change).

## AGP and wrapper

```diff
-classpath 'com.android.tools.build:gradle:8.0.0'
+classpath 'com.android.tools.build:gradle:8.2.1'
```

```diff
 # gradle/wrapper/gradle-wrapper.properties
-distributionUrl=https\://services.gradle.org/distributions/gradle-8.0.2-all.zip
+distributionUrl=https\://services.gradle.org/distributions/gradle-8.2.1-all.zip
```

## Kotlin (only if used)

```diff
 buildscript {
-    ext.kotlin_version = project.hasProperty("kotlin_version") ? rootProject.ext.kotlin_version : '1.8.20'
+    ext.kotlin_version = project.hasProperty("kotlin_version") ? rootProject.ext.kotlin_version : '1.9.10'
```

Java stays at 17.
