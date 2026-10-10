# Camera

Photo/video capture, gallery selection, and photo editing.

**Platforms:** Android, iOS, Web
**Package:** `@capacitor/camera` (latest 8.2.x for Capacitor 8)

## Installation

```bash
npm install @capacitor/camera
npx cap sync
```

## Configuration

### iOS

Add to `ios/App/App/Info.plist` (missing keys crash the app on first access):

```xml
<key>NSCameraUsageDescription</key>
<string>Camera access is required to take photos.</string>
<key>NSPhotoLibraryAddUsageDescription</key>
<string>Photo library access is required to save photos.</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>Photo library access is required to select photos.</string>
```

### Android

- Gallery picking uses the Android Photo Picker (Android 11+), falling back to `Intent.ACTION_OPEN_DOCUMENT`.
- No permissions needed unless `saveToGallery: true`; then add `READ_EXTERNAL_STORAGE` (`maxSdkVersion="32"`) and `WRITE_EXTERNAL_STORAGE` (`maxSdkVersion="29"`).
- Variables in `android/variables.gradle`: `androidxExifInterfaceVersion`, `androidxMaterialVersion`.
- The camera runs in a separate Activity. If Android kills the app meanwhile, recover the result via the `App` plugin `appRestoredResult` event.

### Web

`takePhoto` uses the PWA Elements `pwa-camera-modal` when registered (`@ionic/pwa-elements`), otherwise an `<input type="file">`.

## Usage (8.1+ API)

```typescript
import { Camera, MediaTypeSelection } from '@capacitor/camera';

try {
  const photo = await Camera.takePhoto({ quality: 90, includeMetadata: true });
  img.src = photo.webPath;

  const { results } = await Camera.chooseFromGallery({
    mediaType: MediaTypeSelection.Photo,
    allowMultipleSelection: true,
    limit: 5,
  });
} catch (e: any) {
  // Native errors carry a code such as 'OS-PLUG-CAMR-0003'
  console.error(e.code, e.message);
}
```

Other 8.1+ methods: `recordVideo()`, `playVideo()`, `editPhoto()`, `editURIPhoto()`, `pickLimitedLibraryPhotos()`, `getLimitedLibraryPhotos()`.

## Migrating from `getPhoto` / `pickImages` (deprecated since 8.1.0)

| Old | New |
|-----|-----|
| `getPhoto({ source: CameraSource.Camera })` | `takePhoto()` |
| `getPhoto({ source: CameraSource.Photos })` / `pickImages()` | `chooseFromGallery()` (`allowMultipleSelection: true` for multi) |
| `CameraSource.Prompt` | removed; build your own chooser UI |
| `width` / `height` | `targetWidth` + `targetHeight` (must be set together) |
| `direction` | `cameraDirection` |
| `allowEditing: true` | `editable: 'in-app'` |
| `resultType` (Base64/DataUrl) | removed; read `uri` with Filesystem or use `thumbnail` |

## Common error codes

- `OS-PLUG-CAMR-0003`: camera access denied -> check permission and plist keys.
- `OS-PLUG-CAMR-0005`: gallery access not granted.
- `OS-PLUG-CAMR-0006` / `0020`: user cancelled capture / gallery pick -> treat as non-error.
- `OS-PLUG-CAMR-0007`: no camera available (simulator).

Structured codes only exist for the 8.1+ methods.

## Alternative

Custom in-app camera UI or overlays: `@capgo/camera-preview`.
