---
name: capacitor-push-notifications
description: Sets up and debugs remote push in Capacitor apps with @capacitor/push-notifications (FCM on Android, APNs on iOS), or Capgo alternatives @capgo/capacitor-firebase-messaging and @capgo/capacitor-notifications. Covers APNs keys, Push Notifications capability, AppDelegate `didRegisterForRemoteNotificationsWithDeviceToken` forwarding (stays in AppDelegate under the Capacitor 8.5 UIScene lifecycle), Android 13+ POST_NOTIFICATIONS permission, notification channels and icons, `firebaseMessagingVersion`, foreground `presentationOptions` (Capacitor 9 removes iOS `alert`; use `banner`/`list`), and tap routing. Use when `registration` never fires, iOS returns an APNs token instead of an FCM token, errors like "no valid aps-environment entitlement string found" appear, or notifications do not show. Do not use for local-only notifications or deep link URL handling (capacitor-deep-linking), UIScene migration (capacitor-uiscene-migration), or log capture (ios-android-logs).
---

# Push Notifications in Capacitor

## When to Use

TRIGGER when:
- Adding remote push (FCM / APNs) to a Capacitor app
- `registration` / `registrationError` never fire, or the token works on one platform only
- iOS token is a 64-hex APNs token but the backend expects an FCM token
- Notifications arrive in background but not in foreground (or vice versa)
- Android 13+ shows no prompt and nothing is delivered
- Upgrading to Capacitor 8.5 (UIScene) or 9 (`alert` presentation option removed)

Do not use:
- Opening the app from `https://` / `myapp://` links: `capacitor-deep-linking`
- Moving AppDelegate code to SceneDelegate: `capacitor-uiscene-migration`
- Device log capture: `ios-android-logs`
- Choosing other native plugins: `capacitor-plugins`

## Choose the plugin first (ask the user if unclear)

| Need | Plugin |
|------|--------|
| Official plugin; APNs token on iOS, FCM token on Android | `@capacitor/push-notifications` |
| FCM token on both platforms, topics, Firebase-first backend | `@capgo/capacitor-firebase-messaging` |
| Capgo-managed delivery (dashboard campaigns, badges, silent live-update checks, no own push server) | `@capgo/capacitor-notifications` |
| Local notifications only, rich layouts | `@capgo/capacitor-rich-notifications` or `@capacitor/local-notifications` |

The rest of this file covers `@capacitor/push-notifications`. For Capgo plugins follow https://capgo.app/docs/plugins/firebase-messaging/ or https://capgo.app/docs/plugins/notifications/getting-started/.

## Workflow

1. **Inspect**: `package.json` versions (`@capacitor/core`, `@capacitor/push-notifications`), `capacitor.config.*` `plugins.PushNotifications`, `ios/App/App/AppDelegate.swift`, `ios/App/App/*.entitlements`, `android/app/google-services.json`, `android/variables.gradle`, `AndroidManifest.xml`.
2. **Install**: `npm install @capacitor/push-notifications && npx cap sync`.
3. **iOS**: capability + APNs key + AppDelegate forwarding. Details: [references/ios-setup.md](references/ios-setup.md).
4. **Android**: `google-services.json`, channel, icon, permission. Details: [references/android-setup.md](references/android-setup.md).
5. **JS**: listeners first, then permission, then `register()` (below).
6. **Backend**: send a test message. Payload shapes: [references/sending.md](references/sending.md).
7. **Verify** with the checklist below on physical devices.

Only load a reference when its topic is in play.

## JS registration (order matters)

```typescript
import { PushNotifications } from '@capacitor/push-notifications';

export async function initPush() {
  // 1. Listeners before register(), or the first token is missed
  await PushNotifications.addListener('registration', ({ value }) => sendTokenToServer(value));
  await PushNotifications.addListener('registrationError', (err) => console.error('push reg', err.error));
  await PushNotifications.addListener('pushNotificationReceived', (n) => {
    // foreground only (and Android data-only while app is alive)
  });
  await PushNotifications.addListener('pushNotificationActionPerformed', ({ notification, actionId }) => {
    routeFromNotification(notification.data); // tap handling
  });

  // 2. Permission (required on iOS and Android 13+ / targetSdk 33+)
  let perm = await PushNotifications.checkPermissions();
  if (perm.receive === 'prompt' || perm.receive === 'prompt-with-rationale') {
    perm = await PushNotifications.requestPermissions();
  }
  if (perm.receive !== 'granted') return; // explain + link to settings, do not loop prompts

  // 3. Register
  await PushNotifications.register();
}
```

Traps:
- Call `initPush()` at bootstrap so `pushNotificationActionPerformed` from a cold-start tap is captured.
- Tokens rotate. Send every `registration` value to the server and upsert by user + device.
- On iOS the plugin reports the raw APNs token unless AppDelegate swaps in the FCM token (see ios-setup). Sending an APNs token to FCM fails with `messaging/invalid-registration-token`.
- Ask permission after a user action that explains the value; iOS shows the system prompt only once.

## Foreground presentation

```ts
// capacitor.config.ts
plugins: {
  PushNotifications: {
    presentationOptions: ['badge', 'sound', 'banner', 'list'],
  },
},
```

- `banner` + `list` replace the deprecated iOS `alert`. **Capacitor 9 removes `alert` on iOS**; replace it when upgrading. `badge` is iOS only.
- Empty array = nothing shown in foreground; handle `pushNotificationReceived` yourself.

## Capacitor version notes

| Version | Change |
|---------|--------|
| 7 | `firebaseMessagingVersion` default 24.1.0 |
| 8 | `firebaseMessagingVersion` default 25.0.1 |
| 8.5 | UIScene lifecycle. Remote-notification callbacks (`didRegisterForRemoteNotificationsWithDeviceToken`, `didFailToRegister...`) **stay in AppDelegate** and keep working. Do not move them to SceneDelegate. Tap routing that used AppDelegate `application(_:open:)` must move (see `capacitor-deep-linking`). |
| 9 | iOS `alert` presentation option removed; iOS 16 min; `@main` replaces `@UIApplicationMain`; google-services Gradle plugin 4.5.0 |

## Verification

1. iOS: `codesign -d --entitlements :- path/to/App.app | grep aps-environment` shows `development` (debug) or `production` (TestFlight/App Store).
2. Android: `adb shell dumpsys package com.example.app | grep POST_NOTIFICATIONS` shows `granted=true` after accepting the prompt.
3. App logs a `registration` token on a real device (iOS Simulator on Apple silicon can receive pushes via `xcrun simctl push`, but test real APNs on device).
4. Send a test from Firebase Console (Messaging -> "Send test message") or your backend to that token.
5. Check all three states: foreground (presentation + `pushNotificationReceived`), background (system tray), killed (tap -> `pushNotificationActionPerformed` routes correctly).
6. iOS simulator smoke test without a server:

```bash
cat > /tmp/push.apns <<'EOF'
{ "Simulator Target Bundle": "com.example.app", "aps": { "alert": { "title": "Test", "body": "Hello" } }, "route": "/inbox" }
EOF
xcrun simctl push booted com.example.app /tmp/push.apns
```

(`aps.alert` in the APNs payload is the message content and is unaffected by the `presentationOptions` change.)

## Error Handling

| Error / symptom | Cause | Fix |
|-----------------|-------|-----|
| `no valid "aps-environment" entitlement string found for application` | Push Notifications capability missing or profile not regenerated | Add capability in Xcode, re-sign, rebuild |
| `registration` never fires on iOS, no error | AppDelegate does not post `.capacitorDidRegisterForRemoteNotifications` | Add forwarding methods to AppDelegate |
| `Default FirebaseApp is not initialized in this process` (Android) | `google-services.json` missing/empty, so google-services plugin was not applied (`google-services.json not found, google-services plugin not applied. Push Notifications won't work`) | Put file in `android/app/`, rebuild |
| `messaging/registration-token-not-registered` | Token stale (app reinstalled / data cleared) | Delete token server-side; rely on next `registration` |
| `messaging/invalid-registration-token` / `BadDeviceToken` | APNs token sent to FCM, or sandbox token sent to production APNs | Use FCM token on iOS (ios-setup) or match APNs environment |
| `messaging/third-party-auth-error` | APNs key not uploaded to Firebase, wrong Key ID / Team ID | Upload .p8 under Firebase Project Settings -> Cloud Messaging |
| Android 13+: nothing shown, no prompt | `requestPermissions()` never called | Call it; manifest permission is added by the plugin |
| Android shows white square icon | No monochrome notification icon | Set `default_notification_icon` meta-data |
| Android notification silent / wrong importance | Channel created with low importance (importance is immutable after creation) | Create a new channel id; delete the old one |
| Data-only message ignored when app killed (Android) | Plugin only delivers while app process lives | Native `FirebaseMessagingService` (android-setup) |
| iOS silent / background push not delivered to JS | Plugin does not support iOS silent push | Native handling, or `@capgo/capacitor-notifications` silent update checks |
| Duplicate class errors with Firebase after Capacitor 9 | Old `core-ktx` / Kotlin stdlib pins | See `capacitor-app-upgrade-v8-to-v9` |

## Resources

- Plugin API: https://capacitorjs.com/docs/apis/push-notifications
- Firebase guide: https://capacitorjs.com/docs/guides/push-notifications-firebase
- Updating to 9.0: https://capacitorjs.com/docs/updating/9-0
- Capgo Firebase Messaging: https://capgo.app/docs/plugins/firebase-messaging/
- Capgo Notifications: https://capgo.app/docs/plugins/notifications/
