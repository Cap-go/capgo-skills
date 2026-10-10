# System Bars

Modern edge-to-edge API for configuring system bars (status bar + navigation bar). Replaces Status Bar plugin for new apps.

**Platforms:** Android, iOS

## Installation

Bundled with `@capacitor/core` 8+. No separate install needed.

## Configuration

### iOS

Set `UIViewControllerBasedStatusBarAppearance` to `YES` in `ios/App/App/Info.plist`.

### Android

Injects `--safe-area-inset-x` CSS variables as fallback for older Android WebView versions (<140).

## Usage

```typescript
import { SystemBars, SystemBarsStyle, SystemBarType } from '@capacitor/core';

await SystemBars.setStyle({ style: SystemBarsStyle.Dark });
await SystemBars.hide({ bar: SystemBarType.StatusBar });
await SystemBars.show({ bar: SystemBarType.NavigationBar });
await SystemBars.setAnimation({ animation: 'NONE' }); // iOS only
```

## Notes

- `setAnimation()` is iOS-only (values: 'FADE', 'NONE').
- Omit `bar` to apply to all system bars.
- Config (`plugins.SystemBars`): `insetsHandling` (Android, `css` | `disable`, default `css`), `style`, `hidden`, `animation` (iOS).
- Unsupported here (use `@capacitor/status-bar` for legacy needs): `setOverlaysWebView()`, `setBackgroundColor()`.
- Safe-area CSS: `padding-top: var(--safe-area-inset-top, env(safe-area-inset-top, 0px));`. For layout issues load the `safe-area-handling` skill.
