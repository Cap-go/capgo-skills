# Status Bar

Configure style, visibility, and background color of the Status Bar.

**Platforms:** Android, iOS

## Installation

```bash
npm install @capacitor/status-bar
npx cap sync
```

## Configuration

### iOS

Set `UIViewControllerBasedStatusBarAppearance` to `YES` in `ios/App/App/Info.plist`.

## Usage

```typescript
import { Animation, StatusBar, Style } from '@capacitor/status-bar';

await StatusBar.setStyle({ style: Style.Dark });
await StatusBar.setBackgroundColor({ color: '#ffffff' });
await StatusBar.hide({ animation: Animation.Fade });
await StatusBar.show();
await StatusBar.setOverlaysWebView({ overlay: true });
const info = await StatusBar.getInfo();
```

## Notes

- **Android 16+ (targetSdk 36, Capacitor 8)**: `overlaysWebView` and `backgroundColor` have no effect because edge-to-edge is enforced. Prefer the core `SystemBars` API (see `capacitor-system-bars.md`) for new code.
- iOS: tap on the status bar dispatches a `statusTap` window event.
- Animation parameter is iOS-only.
