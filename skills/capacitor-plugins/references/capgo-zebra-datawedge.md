# Zebra DataWedge (@capgo/capacitor-zebra-datawedge)

Zebra scanner and DataWedge profile control for Enterprise Android.

**Platforms:** Android  
**Package:** `@capgo/capacitor-zebra-datawedge`

## Installation

```bash
npm install @capgo/capacitor-zebra-datawedge
npx cap sync
```

## Versions reviewed

`8.1.9` to `8.2.5` (since 2026-09-11).

## API added in window

**Methods:** `configureDiagnostics()`, `getDiagnostics()`, `registerScanIntentAction()`.

## Dispatch ordering

`notify()`, `registerForNotification()`, and `unRegisterForNotification()` complete when the command is dispatched to DataWedge, not when the scanner finishes. Do not treat the Promise as "scan done". Listen on the `scan` event for decoded data.

```typescript
import { ZebraDataWedge } from '@capgo/capacitor-zebra-datawedge';

await ZebraDataWedge.configureDiagnostics({ enabled: true });
const diag = await ZebraDataWedge.getDiagnostics();
await ZebraDataWedge.registerScanIntentAction({ intentAction: 'com.example.SCAN' });
await ZebraDataWedge.addListener('scan', (result) => console.log(result));
```

## Profiles and config

Use `getConfig()`, `setConfig()`, `getProfilesList()`, and `switchToProfile()` for profile work. Diagnostics snapshots summarize DataWedge state for support builds.

## Docs

https://capgo.app/docs/plugins/zebra-datawedge/
