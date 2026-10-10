# Background Runner

Event-based standalone JavaScript environment for executing code outside the webview.

**Platforms:** Android, iOS

## Installation

```bash
npm install @capacitor/background-runner
npx cap sync
```

## Configuration

### Capacitor Config

```json
{
  "plugins": {
    "BackgroundRunner": {
      "label": "com.example.background.task",
      "src": "runners/background.js",
      "event": "myCustomEvent",
      "repeat": true,
      "interval": 15,
      "autoStart": true
    }
  }
}
```

### iOS

- Enable Background Modes capability: "Background fetch" and "Background processing".
- Add `BGTaskSchedulerPermittedIdentifiers` to `ios/App/App/Info.plist`.
- In `ios/App/App/AppDelegate.swift`, import `CapacitorBackgroundRunner`.
- Inside `application(_:didFinishLaunchingWithOptions:)`:

```swift
BackgroundRunnerPlugin.registerBackgroundTask()
BackgroundRunnerPlugin.handleApplicationDidFinishLaunching(launchOptions: launchOptions)
```

- The `BGTaskSchedulerPermittedIdentifiers` entry must equal the config `label`.
- Geolocation in runners needs `NSLocationAlwaysUsageDescription` and `NSLocationWhenInUseUsageDescription`; push needs the `Remote notifications` background mode.

### Android

Add the plugin's bundled JS engine to the `flatDir` repositories in `android/app/build.gradle`:

```groovy
repositories {
    flatDir {
        dirs '../capacitor-cordova-android-plugins/src/main/libs', 'libs'
        dirs '../../node_modules/@capacitor/background-runner/android/src/main/libs', 'libs'
    }
}
```

Missing this line causes Gradle to fail resolving `android-js-engine-release`.

- Geolocation: `ACCESS_COARSE_LOCATION` and `ACCESS_FINE_LOCATION` permissions in `android/app/src/main/AndroidManifest.xml`.
- Android 13+: call `checkPermissions()` / `requestPermissions()` for notifications.
- Android 12+: `SCHEDULE_EXACT_ALARM` permission.

## Usage

```typescript
import { BackgroundRunner } from '@capacitor/background-runner';

await BackgroundRunner.dispatchEvent({
  label: 'com.example.background.task',
  event: 'myCustomEvent',
  details: {},
});
```

## Notes

- iOS: ~30 second runtime per invocation.
- Android: 10-minute max runtime, 15-minute minimum repeat interval.
- Runner context destroyed after resolve/reject. No state persistence between events.
