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

## iOS closed-app geofence queue

On iOS, geofence events may queue while the app is not running. Use `getLocationLog()` to inspect queued region events and `clearGeofenceQueue()` to drop stale queued geofence work after you process or abandon them.

```typescript
import { BackgroundGeolocation } from '@capgo/background-geolocation';

const log = await BackgroundGeolocation.getLocationLog();
await BackgroundGeolocation.clearGeofenceQueue();
```

## Docs

https://capgo.app/docs/plugins/background-geolocation/
