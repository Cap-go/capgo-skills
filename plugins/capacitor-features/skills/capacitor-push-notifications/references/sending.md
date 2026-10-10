# Sending Push Messages

Load when writing backend code or a test sender.

## FCM HTTP v1 (Firebase Admin SDK, Node)

```ts
import { initializeApp, cert } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

initializeApp({ credential: cert(serviceAccountJson) });

await getMessaging().send({
  token,
  notification: { title: 'New message', body: 'Open to read' },
  data: { route: '/inbox/42' },            // strings only
  android: { priority: 'high', notification: { channelId: 'messages' } },
  apns: { payload: { aps: { sound: 'default', badge: 1 } } },
});
```

- Legacy FCM server-key API (`https://fcm.googleapis.com/fcm/send`, `"to": ...`) is shut down; use HTTP v1 (`/v1/projects/<id>/messages:send`) with an OAuth access token from a service account.
- `data` values must be strings. Read them in JS from `notification.data`.
- Multicast: `sendEachForMulticast({ tokens, ... })` (max 500 tokens per call). Remove tokens that return `messaging/registration-token-not-registered`.
- Topics: `subscribeToTopic` is server-side in Admin SDK, or client-side with `@capgo/capacitor-firebase-messaging`.

## Direct APNs

Only if `registration` returns raw APNs tokens. Use token-based auth (`.p8`, JWT signed ES256 with Key ID + Team ID), `apns-topic` = bundle ID, `apns-push-type: alert`. Sandbox host `api.sandbox.push.apple.com`, production `api.push.apple.com`.

## Tap routing payload

Put the route in `data.route` (FCM) or a custom top-level key (APNs). In `pushNotificationActionPerformed`, validate against an allow-list before navigating.

## Capgo-managed

`@capgo/capacitor-notifications` sends from the Capgo dashboard / API without your own FCM/APNs sender. See https://capgo.app/docs/plugins/notifications/getting-started/.
