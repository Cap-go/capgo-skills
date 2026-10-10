# Plugin Usage Patterns

Finding the right plugin for a feature: `capacitor-plugins`. This file covers how to use any plugin correctly.

## Install

```bash
npm install @capgo/capacitor-native-biometric
npx cap sync
```

- `npx cap sync` copies web assets, updates native dependencies (SPM `CapApp-SPM/Package.swift` or `pod install` for CocoaPods) and regenerates plugin registration. You do not need to run `pod install` by hand after sync.
- Rebuild the native app after sync. A running app does not pick up new native code from live reload.
- `npx cap ls` shows what the CLI detected. A plugin missing there was not installed in the project the CLI reads.
- Follow the plugin README for required Info.plist keys, Android manifest entries, or Gradle config. Missing `NS*UsageDescription` keys crash iOS on first permission request.
- Plugins with Cordova code pull in the Cordova compatibility layer. On Capacitor 9 that layer is only added when a Cordova plugin is installed.

## Feature detection

```typescript
import { Capacitor } from '@capacitor/core';

if (Capacitor.isNativePlatform()) { /* ios or android */ }
const platform = Capacitor.getPlatform(); // 'ios' | 'android' | 'web'
if (Capacitor.isPluginAvailable('NativeBiometric')) { /* safe to call */ }
```

Device-level capability is a separate check, done with the plugin's own API:

```typescript
import { NativeBiometric } from '@capgo/capacitor-native-biometric';

const { isAvailable } = await NativeBiometric.isAvailable();
if (!isAvailable) return loginWithPassword();
```

## Permissions

Official plugins that need runtime permissions expose `checkPermissions()` and `requestPermissions()`. Third-party plugins vary; read their API.

```typescript
import { Camera } from '@capacitor/camera';

let status = await Camera.checkPermissions();
if (status.camera === 'prompt' || status.camera === 'prompt-with-rationale') {
  status = await Camera.requestPermissions({ permissions: ['camera'] });
}
if (status.camera === 'denied') {
  showGoToSettingsHelp(); // the OS will not show the prompt again
  return;
}
```

Request at the moment of use with context, not all at launch (App Review flags launch-time prompts without context).

## Errors

Branch on `code`. Messages are human text and differ by platform/version.

```typescript
import { Camera } from '@capacitor/camera';

try {
  return await Camera.takePhoto({ /* options */ });
} catch (e: any) {
  switch (e?.code) {
    case 'OS-PLUG-CAMR-0006': return null;                 // user cancelled
    case 'OS-PLUG-CAMR-0003': showPermissionHelp(); return null; // no camera access
    case 'UNIMPLEMENTED':     return pickFromFileInput();  // not on this platform
    default: throw e;
  }
}
```

The `OS-PLUG-CAMR-*` codes apply to `@capacitor/camera` 8.1+ new APIs (`takePhoto`, `chooseFromGallery`, ...). Check each plugin's docs for its codes. Capacitor core exceptions use `UNIMPLEMENTED` and `UNAVAILABLE`.

## Bridge payloads

- Each call serializes arguments to JSON across the bridge. Batch related writes into one call instead of many small ones.
- Do not ship megabytes of base64 across the bridge (photos, PDFs). Use plugin options that return file paths/URIs, then display with `Capacitor.convertFileSrc(path)` or a `webPath` the plugin returns.
- Remove listeners: `const handle = await Plugin.addListener(...)`, then `await handle.remove()` on unmount.

## Lazy loading

Capacitor plugin JS entry points are thin proxies created by `registerPlugin`; importing them at startup costs little. Lazy-load with `await import(...)` when the plugin ships a heavy web implementation or pulls large dependencies, and for your own heavy feature modules. Measure with `capacitor-performance` before optimizing.

## Mocking in tests

Unit tests run in Node/jsdom where native plugins do not exist. Mock the plugin module (Jest `__mocks__/@capacitor/...` or `vi.mock`). Official guide: https://capacitorjs.com/docs/guides/mocking-plugins. Full test strategy: `capacitor-testing`.
