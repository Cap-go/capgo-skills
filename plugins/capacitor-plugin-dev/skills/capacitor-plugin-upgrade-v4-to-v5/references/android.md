# Plugin Android changes for Capacitor 5

Source: https://capacitorjs.com/docs/updating/plugins/5-0. All paths are the plugin's `android/` folder.

## SDK defaults (`build.gradle`)

```diff
 android {
-    compileSdkVersion project.hasProperty('compileSdkVersion') ? rootProject.ext.compileSdkVersion : 32
+    compileSdkVersion project.hasProperty('compileSdkVersion') ? rootProject.ext.compileSdkVersion : 33
-    targetSdkVersion project.hasProperty('targetSdkVersion') ? rootProject.ext.targetSdkVersion : 32
+    targetSdkVersion project.hasProperty('targetSdkVersion') ? rootProject.ext.targetSdkVersion : 33
```

## Dependency defaults (`ext {}`)

```diff
-androidxAppCompatVersion = project.hasProperty('androidxAppCompatVersion') ? rootProject.ext.androidxAppCompatVersion : '1.4.2'
+androidxAppCompatVersion = project.hasProperty('androidxAppCompatVersion') ? rootProject.ext.androidxAppCompatVersion : '1.6.1'
-androidxJunitVersion = project.hasProperty('androidxJunitVersion') ? rootProject.ext.androidxJunitVersion : '1.1.3'
+androidxJunitVersion = project.hasProperty('androidxJunitVersion') ? rootProject.ext.androidxJunitVersion : '1.1.5'
-androidxEspressoCoreVersion = project.hasProperty('androidxEspressoCoreVersion') ? rootProject.ext.androidxEspressoCoreVersion : '3.4.0'
+androidxEspressoCoreVersion = project.hasProperty('androidxEspressoCoreVersion') ? rootProject.ext.androidxEspressoCoreVersion : '3.5.1'
```

`junitVersion` stays `4.13.2`.

## AGP and wrapper

```diff
-classpath 'com.android.tools.build:gradle:7.2.1'
+classpath 'com.android.tools.build:gradle:8.0.0'
```

```diff
 # gradle/wrapper/gradle-wrapper.properties
-distributionUrl=https\://services.gradle.org/distributions/gradle-7.4.2-all.zip
+distributionUrl=https\://services.gradle.org/distributions/gradle-8.0.2-all.zip
```

## Namespace

```diff
 <!-- src/main/AndroidManifest.xml -->
-<manifest xmlns:android="http://schemas.android.com/apk/res/android"
-    package="com.example.plugin">
+<manifest xmlns:android="http://schemas.android.com/apk/res/android">
```

```diff
 android {
+    namespace "com.example.plugin"
     compileSdkVersion project.hasProperty('compileSdkVersion') ? rootProject.ext.compileSdkVersion : 33
```

## Jetifier (`gradle.properties`)

```diff
 android.useAndroidX=true
-# Automatically convert third-party libraries to use AndroidX
-android.enableJetifier=true
```

## Java 17

```diff
 compileOptions {
-    sourceCompatibility JavaVersion.VERSION_11
+    sourceCompatibility JavaVersion.VERSION_17
-    targetCompatibility JavaVersion.VERSION_11
+    targetCompatibility JavaVersion.VERSION_17
 }
```

## Kotlin (only if used)

```diff
 buildscript {
-    ext.kotlin_version = project.hasProperty("kotlin_version") ? rootProject.ext.kotlin_version : '1.7.0'
+    ext.kotlin_version = project.hasProperty("kotlin_version") ? rootProject.ext.kotlin_version : '1.8.20'
```

```diff
 dependencies {
-    implementation "org.jetbrains.kotlin:kotlin-stdlib-jdk7:$kotlin_version"
+    implementation "org.jetbrains.kotlin:kotlin-stdlib:$kotlin_version"
```

## Null-safe PluginCall access

```java
JSObject opts = call.getObject("options");
if (opts == null) {
    call.reject("Must provide options");
    return;
}
```
