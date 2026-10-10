# Splash Screen

Control the display and hiding of the splash screen.

**Platforms:** Android, iOS

## Installation

```bash
npm install @capacitor/splash-screen
npx cap sync
```

## Configuration

In `capacitor.config.ts` (or `.json`):

```json
{
  "plugins": {
    "SplashScreen": {
      "launchShowDuration": 500,
      "launchAutoHide": true,
      "backgroundColor": "#ffffff",
      "showSpinner": false,
      "androidScaleType": "CENTER_CROP",
      "splashFullScreen": false,
      "splashImmersive": false
    }
  }
}
```

## Usage

```typescript
import { SplashScreen } from '@capacitor/splash-screen';

await SplashScreen.show({ autoHide: false, fadeInDuration: 300, fadeOutDuration: 300 });
await SplashScreen.hide({ fadeOutDuration: 500 });
```

## Notes

- Android 12+ uses native Splash Screen API. Compatibility library can be disabled by modifying `AppTheme.NoActionBarLaunch` parent theme in `android/app/src/main/res/values/styles.xml`.
- On the Android 12 Splash Screen API, `hide({ fadeOutDuration })` is ignored; use the `launchFadeOutDuration` config instead. Capacitor 9 changes its default from 200 to 0.
- Additional config: `launchFadeOutDuration`, `androidSplashResourceName`, `spinnerColor`, `layoutName` (custom Android layout), `useDialog`.
- Splash assets, white flash, or hide-timing issues: load the `capacitor-splash-screen` skill.
