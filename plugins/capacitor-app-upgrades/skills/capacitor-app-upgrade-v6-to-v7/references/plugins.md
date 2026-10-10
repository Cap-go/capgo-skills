# Official plugin breaking changes in Capacitor 7

Source: https://capacitorjs.com/docs/updating/7-0#plugins. Update all `@capacitor/*` plugins to `^7.0.0`.

## Removed deprecated types (rename)

| Plugin | Removed | Use |
| --- | --- | --- |
| App | `AppRestoredResult` | `RestoredListenerEvent` |
| App | `AppUrlOpen` | `URLOpenListenerEvent` |
| Device | `DeviceBatteryInfo` | `BatteryInfo` |
| Device | `DeviceLanguageCodeResult` | `GetLanguageCodeResult` |
| Haptics | `HapticsImpactOptions` | `ImpactOptions` |
| Haptics | `HapticsNotificationOptions` | `NotificationOptions` |
| Haptics | `HapticsNotificationType` | `NotificationType` |
| Haptics | `HapticsImpactStyle` | `ImpactStyle` |
| Splash Screen | `SplashScreenShowOptions` | `ShowOptions` |
| Splash Screen | `SplashScreenHideOptions` | `HideOptions` |

## Other changes

| Plugin | Change |
| --- | --- |
| Action Sheet | `androidxMaterialVersion = '1.12.0'` |
| Browser | `androidxBrowserVersion = '1.8.0'` |
| Camera | `androidxExifInterfaceVersion = '1.3.7'`, `androidxMaterialVersion = '1.12.0'` |
| Device | `getInfo()` no longer returns `diskFree`, `diskTotal`, `realDiskFree`, `realDiskTotal`; its `PrivacyInfo.xcprivacy` disk-space entries can be removed |
| Geolocation | `playServicesLocationVersion = '21.3.0'` |
| Push Notifications | `firebaseMessagingVersion = '24.1.0'` |
| Share | `androidxCoreVersion = '1.15.0'` |
| Status Bar | `setOverlaysWebView()` and `setBackgroundColor()` now work on iOS (check for platform guards that are now unnecessary). `androidxCoreVersion = '1.15.0'` |

## Leftover grep

```bash
grep -rnE "AppUrlOpen|AppRestoredResult|DeviceBatteryInfo|DeviceLanguageCodeResult|Haptics(Impact|Notification)(Options|Type|Style)|SplashScreen(Show|Hide)Options|realDisk|diskFree|diskTotal" src/
```
