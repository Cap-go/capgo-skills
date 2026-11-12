# Background Geolocation (@capgo/background-geolocation)

Background location, geofencing, and iOS closed-app geofence delivery.

**Platforms:** iOS, Android  
**Package:** `@capgo/background-geolocation`

## Installation

```bash
npm install @capgo/background-geolocation
npx cap sync
```

## Versions reviewed

`8.4.5` to `8.6.0` (since 2026-09-11).

## API added in window

**Methods:** `clearGeofenceQueue()`, `clearLocationLog()`, `getLocationLog()`.

## iOS geofence POST queue vs location log

When `setupGeofencing({ url })` is set, native code can queue geofence transitions for HTTP POST while the app is suspended. `start({ url })` configures location POSTs, not geofence delivery. On iOS, terminated-app geofence delivery also requires `GeofenceRelay.shared.start()` from the app delegate (see the plugin README). `getLocationLog()` reads the on-device location history file (native tracking log), not the geofence POST queue. Inspect transitions in your backend or app handlers. Call `clearGeofenceQueue()` only when you intentionally abandon undelivered POST work (for example sign-out).

```typescript
import { BackgroundGeolocation } from '@capgo/background-geolocation';

const { entries } = await BackgroundGeolocation.getLocationLog({ afterId: 0 });
await BackgroundGeolocation.clearGeofenceQueue();
```

## Docs

https://capgo.app/docs/plugins/background-geolocation/
