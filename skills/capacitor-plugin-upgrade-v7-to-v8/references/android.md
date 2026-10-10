# Plugin Android changes for Capacitor 8

Source: https://capacitorjs.com/docs/updating/plugins/8-0. Paths are the plugin's `android/` folder.

## Dependency defaults (`ext {}`)

Only add or update the ones the plugin uses.

| Variable | Default |
| --- | --- |
| `junitVersion` | `4.13.2` |
| `androidxAppCompatVersion` | `1.7.1` |
| `androidxJunitVersion` | `1.3.0` |
| `androidxEspressoCoreVersion` | `3.7.0` |
| `androidxActivityVersion` | `1.11.0` |
| `androidxCoordinatorLayoutVersion` | `1.3.0` |
| `androidxCoreVersion` | `1.17.0` |
| `androidxFragmentVersion` | `1.8.9` |
| `firebaseMessagingVersion` | `25.0.1` |
| `androidxBrowserVersion` | `1.9.0` |
| `androidxMaterialVersion` | `1.13.0` |
| `androidxExifInterfaceVersion` | `1.4.1` |
| `coreSplashScreenVersion` | `1.2.0` |
| `androidxWebkitVersion` | `1.14.0` |

Pattern:

```groovy
androidxCoreVersion = project.hasProperty('androidxCoreVersion') ? rootProject.ext.androidxCoreVersion : '1.17.0'
```

## SDK defaults (with `=` syntax)

```diff
 android {
-    compileSdk project.hasProperty('compileSdkVersion') ? rootProject.ext.compileSdkVersion : 35
+    compileSdk = project.hasProperty('compileSdkVersion') ? rootProject.ext.compileSdkVersion : 36
     defaultConfig {
-        minSdkVersion project.hasProperty('minSdkVersion') ? rootProject.ext.minSdkVersion : 23
+        minSdkVersion = project.hasProperty('minSdkVersion') ? rootProject.ext.minSdkVersion : 24
-        targetSdkVersion project.hasProperty('targetSdkVersion') ? rootProject.ext.targetSdkVersion : 35
+        targetSdkVersion = project.hasProperty('targetSdkVersion') ? rootProject.ext.targetSdkVersion : 36
```

## AGP, google-services, wrapper

```diff
-classpath 'com.android.tools.build:gradle:8.7.2'
+classpath 'com.android.tools.build:gradle:8.13.0'
-classpath 'com.google.gms:google-services:4.4.2'
+classpath 'com.google.gms:google-services:4.4.4'
```

```diff
 # gradle/wrapper/gradle-wrapper.properties
-distributionUrl=https\://services.gradle.org/distributions/gradle-8.11.1-all.zip
+distributionUrl=https\://services.gradle.org/distributions/gradle-8.14.3-all.zip
```

## Property assignment syntax

```diff
 repositories {
     mavenCentral()
     maven {
-        url "https://plugins.gradle.org/m2/"
+        url = "https://plugins.gradle.org/m2/"
     }
 }
 android {
-    namespace 'com.example.plugin'
+    namespace = 'com.example.plugin'
 }
 lintOptions {
-    abortOnError false
+    abortOnError = false
 }
```

Reference: https://docs.gradle.org/current/userguide/upgrading_version_8.html#groovy_space_assignment_syntax

## Java 21 (recommended; 17+ supported)

```diff
 compileOptions {
-    sourceCompatibility JavaVersion.VERSION_17
+    sourceCompatibility JavaVersion.VERSION_21
-    targetCompatibility JavaVersion.VERSION_17
+    targetCompatibility JavaVersion.VERSION_21
 }
```

## Kotlin 2.2.20 (only if used)

```diff
 buildscript {
-    ext.kotlin_version = project.hasProperty("kotlin_version") ? rootProject.ext.kotlin_version : '1.9.25'
+    ext.kotlin_version = project.hasProperty("kotlin_version") ? rootProject.ext.kotlin_version : '2.2.20'
```

```diff
+import org.jetbrains.kotlin.gradle.dsl.JvmTarget
+
 android {
-    kotlinOptions {
-        jvmTarget = '17'
-    }
 }
+
+kotlin {
+    compilerOptions {
+        jvmTarget = JvmTarget.JVM_21
+    }
+}
```

Match `JvmTarget` to the Java version in `compileOptions`. `kotlin-android-extensions` is removed: use `kotlin-parcelize` for `Parcelable` and view binding for synthetic views. Full list: https://kotlinlang.org/docs/whatsnew22.html

## Renamed resource

`bridge_layout_main.xml` -> `capacitor_bridge_layout_main.xml` in `@capacitor/android`.
