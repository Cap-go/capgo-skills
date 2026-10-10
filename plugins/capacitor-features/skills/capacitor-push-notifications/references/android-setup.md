# Android Push Setup (@capacitor/push-notifications)

Load when configuring Android push or debugging delivery.

## 1. Firebase config

- Download `google-services.json` from Firebase Console (Android app with the exact `applicationId`) into `android/app/`.
- The Capacitor template applies `com.google.gms.google-services` only when that file exists and is non-empty. The classpath lives in `android/build.gradle` (Capacitor 9 docs: `com.google.gms:google-services:4.5.0`).
- Do not add the Firebase SDK manually; the plugin brings `firebase-messaging`.
- Override the version via `android/variables.gradle`: `firebaseMessagingVersion = '25.0.1'` (Capacitor 8 default). Only change it to resolve a conflict with another Firebase plugin; keep all Firebase libs aligned.

## 2. Permission (Android 13+ / API 33)

`POST_NOTIFICATIONS` is a runtime permission. The plugin declares it; you must call `checkPermissions()` / `requestPermissions()`. Without it, `register()` still yields a token but nothing displays.

## 3. Notification icon

White-on-transparent monochrome icon, else Android shows a white square:

```xml
<!-- AndroidManifest.xml, inside <application> -->
<meta-data
  android:name="com.google.firebase.messaging.default_notification_icon"
  android:resource="@drawable/ic_stat_notify" />
<meta-data
  android:name="com.google.firebase.messaging.default_notification_color"
  android:resource="@color/notification_accent" />
```

Generate with Android Studio -> New -> Image Asset -> Notification Icons.

## 4. Channels (Android 8+)

Channel resolution order: `channelId` in the message -> `default_notification_channel_id` meta-data -> Firebase's fallback channel. Options 1 and 2 still require creating the channel in code:

```ts
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';

if (Capacitor.getPlatform() === 'android') {
  await PushNotifications.createChannel({
    id: 'messages',
    name: 'Messages',
    importance: 4, // 1-5; 4 = heads-up
    visibility: 1,
    sound: 'message.wav', // file in res/raw
    vibration: true,
  });
}
```

Channel importance and sound cannot be changed after creation; the user owns them. Ship a new channel id to change behavior.

## 5. Data-only messages

The plugin emits `pushNotificationReceived` for data-only messages only while the app process is alive. For killed-app handling write a native service:

```kotlin
class AppMessagingService : com.google.firebase.messaging.FirebaseMessagingService() {
    override fun onMessageReceived(message: com.google.firebase.messaging.RemoteMessage) {
        // schedule WorkManager job, update badge, etc.
    }
}
```

Register it in `AndroidManifest.xml` with an intent-filter for `com.google.firebase.MESSAGING_EVENT`. Only one `MESSAGING_EVENT` service receives messages, so this can conflict with the plugin's own service; test carefully or use `@capgo/capacitor-firebase-messaging`.

## 6. Delivery caveats

- Doze / App Standby delay normal-priority messages; use `android.priority: "high"` for user-visible messages only.
- Apps force-stopped from Settings receive nothing until reopened.
- Android 15+ Private space: notifications are hidden while the space is locked; not detectable from the app.
- Testing while launched from Android Studio can differ from a normal launch; verify with a cold launch from the launcher.

## Checks

```bash
test -s android/app/google-services.json && echo ok
grep -n "firebaseMessagingVersion" android/variables.gradle
adb shell dumpsys package com.example.app | grep POST_NOTIFICATIONS
adb shell cmd notification list_channels com.example.app 0 2>/dev/null | head
```
