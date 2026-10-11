# Keyboard

Keyboard display/visibility control and event tracking.

**Platforms:** Android, iOS

## Installation

```bash
npm install @capacitor/keyboard
npx cap sync
```

## Configuration

Config options in `capacitor.config.ts`:
- `resize` (iOS only): how the app resizes when the keyboard appears (default `native`). Values: `body`, `ionic`, `native`, `none`.
- `style` (iOS only): override keyboard appearance (`DARK`, `LIGHT`, `DEFAULT`).
- `resizeOnFullScreen` (Android only): workaround so the WebView resizes when the app is full screen / overlaying the status bar.
- `autoBackdropColor`: `'off' | 'auto' | 'dom'`, tint for the area behind the keyboard.

## Usage

```typescript
import { Keyboard } from '@capacitor/keyboard';

Keyboard.addListener('keyboardWillShow', (info) => {
  console.log('Keyboard height:', info.keyboardHeight);
});
Keyboard.addListener('keyboardDidHide', () => {
  console.log('Keyboard hidden');
});

await Keyboard.hide();
await Keyboard.setAccessoryBarVisible({ isVisible: false });
```

## Notes

- `show()` is Android-only.
- `setAccessoryBarVisible()` is iPhone-only.
- `setScroll()`, `setStyle()`, `setResizeMode()`, `getResizeMode()` are iOS-only.
- Events: `keyboardWillShow`, `keyboardDidShow`, `keyboardWillHide`, `keyboardDidHide`.
- For inputs hidden behind the keyboard, scroll issues, or accessory bar problems, load the `capacitor-keyboard` skill.
