# Android 12+ SplashScreen Theme

Load when customizing the Android launch splash beyond generated assets.

## Template theme (Capacitor)

```xml
<!-- android/app/src/main/res/values/styles.xml -->
<style name="AppTheme.NoActionBarLaunch" parent="Theme.SplashScreen">
    <item name="android:background">@drawable/splash</item>
</style>
```

`MainActivity` uses `AppTheme.NoActionBarLaunch` in `AndroidManifest.xml`; the plugin switches to the post-splash theme after launch.

## Icon-style splash (Android 12+ look on all versions)

```xml
<style name="AppTheme.NoActionBarLaunch" parent="Theme.SplashScreen">
    <item name="windowSplashScreenBackground">@color/splash_background</item>
    <item name="windowSplashScreenAnimatedIcon">@drawable/splash_icon</item>
    <item name="postSplashScreenTheme">@style/AppTheme.NoActionBar</item>
</style>
```

- `values-night/colors.xml` with a second `splash_background` gives a dark-mode splash.
- Icon canvas: 288 dp with the visible area inside a 192 dp circle (without icon background). Keep logos inside that circle.
- `windowSplashScreenAnimationDuration` only matters for animated vector drawables and is capped by the system.

## Opting out of the compat library

To show a full-screen image on Android 11 and below, change the parent to `AppTheme.NoActionBar` and keep `android:background`. Android 12+ always shows the system splash; it cannot be disabled.

## Variables

`android/variables.gradle`: `coreSplashScreenVersion = '1.2.0'` (Capacitor 8 and 9).

## Checks

```bash
grep -n "NoActionBarLaunch" android/app/src/main/AndroidManifest.xml
grep -n "coreSplashScreenVersion" android/variables.gradle
ls android/app/src/main/res/drawable*/splash*
```
