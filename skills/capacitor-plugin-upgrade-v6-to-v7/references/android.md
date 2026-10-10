# Plugin Android changes for Capacitor 7

Source: https://capacitorjs.com/docs/updating/plugins/7-0. Paths are the plugin's `android/` folder.

## Dependency defaults (`ext {}`)

```diff
 junitVersion = project.hasProperty('junitVersion') ? rootProject.ext.junitVersion : '4.13.2'
-androidxAppCompatVersion = project.hasProperty('androidxAppCompatVersion') ? rootProject.ext.androidxAppCompatVersion : '1.6.1'
+androidxAppCompatVersion = project.hasProperty('androidxAppCompatVersion') ? rootProject.ext.androidxAppCompatVersion : '1.7.0'
-androidxJunitVersion = project.hasProperty('androidxJunitVersion') ? rootProject.ext.androidxJunitVersion : '1.1.5'
+androidxJunitVersion = project.hasProperty('androidxJunitVersion') ? rootProject.ext.androidxJunitVersion : '1.2.1'
-androidxEspressoCoreVersion = project.hasProperty('androidxEspressoCoreVersion') ? rootProject.ext.androidxEspressoCoreVersion : '3.5.1'
+androidxEspressoCoreVersion = project.hasProperty('androidxEspressoCoreVersion') ? rootProject.ext.androidxEspressoCoreVersion : '3.6.1'
```

## SDK defaults

```diff
 android {
-    compileSdk project.hasProperty('compileSdkVersion') ? rootProject.ext.compileSdkVersion : 34
+    compileSdk project.hasProperty('compileSdkVersion') ? rootProject.ext.compileSdkVersion : 35
     defaultConfig {
-        minSdkVersion project.hasProperty('minSdkVersion') ? rootProject.ext.minSdkVersion : 22
+        minSdkVersion project.hasProperty('minSdkVersion') ? rootProject.ext.minSdkVersion : 23
-        targetSdkVersion project.hasProperty('targetSdkVersion') ? rootProject.ext.targetSdkVersion : 34
+        targetSdkVersion project.hasProperty('targetSdkVersion') ? rootProject.ext.targetSdkVersion : 35
```

## AGP and wrapper

```diff
-classpath 'com.android.tools.build:gradle:8.2.1'
+classpath 'com.android.tools.build:gradle:8.7.2'
```

```diff
 # gradle/wrapper/gradle-wrapper.properties
-distributionUrl=https\://services.gradle.org/distributions/gradle-8.2.1-all.zip
+distributionUrl=https\://services.gradle.org/distributions/gradle-8.11.1-all.zip
```

## Java 21

```diff
 compileOptions {
-    sourceCompatibility JavaVersion.VERSION_17
+    sourceCompatibility JavaVersion.VERSION_21
-    targetCompatibility JavaVersion.VERSION_17
+    targetCompatibility JavaVersion.VERSION_21
 }
```

## Kotlin (only if used)

```diff
-    ext.kotlin_version = project.hasProperty("kotlin_version") ? rootProject.ext.kotlin_version : '1.9.10'
+    ext.kotlin_version = project.hasProperty("kotlin_version") ? rootProject.ext.kotlin_version : '1.9.25'
```

## Removed APIs

```diff
-call.success(ret);
+call.resolve(ret);
-call.error("Failed", e);
+call.reject("Failed", e);
```

`BridgeFragment` is gone. Keep a plugin-local `Fragment` subclass if the plugin needs one.
