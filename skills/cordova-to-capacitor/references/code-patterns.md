# Code Patterns: Cordova -> Capacitor

## Remove deviceready

```ts
// Before
document.addEventListener('deviceready', init, false);

// After: run init on app start; plugins are ready after import.
import { Capacitor } from '@capacitor/core';
init();
if (Capacitor.isNativePlatform()) { /* native-only setup */ }
```

Keep `deviceready` only while Cordova plugins that need it remain installed (and on Capacitor 9 only while at least one Cordova plugin keeps the runtime in the build).

## Lifecycle events

| Cordova | Capacitor |
|---|---|
| `document.addEventListener('pause')` / `'resume'` | `App.addListener('pause' | 'resume', ...)` or `appStateChange` |
| `document.addEventListener('backbutton')` | `App.addListener('backButton', ({ canGoBack }) => ...)` |
| `handleOpenURL(url)` global | `App.addListener('appUrlOpen', ({ url }) => ...)` + `App.getLaunchUrl()` |

## Common plugins

```ts
// Camera: navigator.camera.getPicture(success, error, opts)
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
const photo = await Camera.getPhoto({ quality: 80, resultType: CameraResultType.Uri, source: CameraSource.Prompt });
// photo.webPath -> <img src>, photo.path -> native file path

// Device: device.uuid, device.platform
import { Device } from '@capacitor/device';
const { identifier } = await Device.getId();
const { platform, model, osVersion } = await Device.getInfo();

// Network: navigator.connection.type
import { Network } from '@capacitor/network';
const { connected, connectionType } = await Network.getStatus();
Network.addListener('networkStatusChange', (s) => {});

// Geolocation: navigator.geolocation.getCurrentPosition(cb)
import { Geolocation } from '@capacitor/geolocation';
const pos = await Geolocation.getCurrentPosition();

// Dialogs: navigator.notification.confirm(...)
import { Dialog } from '@capacitor/dialog';
const { value } = await Dialog.confirm({ title: 'Delete', message: 'Are you sure?' });

// Files: window.resolveLocalFileSystemURL(cordova.file.dataDirectory + 'a.json', ...)
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
await Filesystem.writeFile({ path: 'a.json', data: '{}', directory: Directory.Data, encoding: Encoding.UTF8 });
const { data } = await Filesystem.readFile({ path: 'a.json', directory: Directory.Data, encoding: Encoding.UTF8 });
```

`cordova.file.dataDirectory` (iOS: `Library/NoCloud/`) and `Directory.Data` (iOS: `Documents/`) are different folders. If users have files from the Cordova build, copy them on first launch rather than assuming the same path.

## Permissions

Most Capacitor plugins expose `checkPermissions()` / `requestPermissions()`. Call them in context (before the feature), handle `denied` with a settings deep link explanation, and do not request on launch.

## Promise wrapper for kept Cordova plugins

```ts
function cordovaCall<T>(fn: (ok: (v: T) => void, err: (e: unknown) => void) => void) {
  return new Promise<T>((resolve, reject) => fn(resolve, reject));
}
const result = await cordovaCall((ok, err) => (window as any).plugins.somePlugin.doThing(ok, err, {}));
```
