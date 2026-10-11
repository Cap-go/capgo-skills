# Icons, Screenshots, and Listing Assets

## Icons

Generate from one source image with `@capacitor/assets` (v3):

```bash
npm install -D @capacitor/assets
# Easy mode: assets/logo.png (+ optional logo-dark.png) and background colors
npx @capacitor/assets generate --iconBackgroundColor '#ffffff' --splashBackgroundColor '#ffffff'
# Custom mode: assets/icon-only.png (>=1024x1024), icon-foreground.png, icon-background.png,
# splash.png and splash-dark.png (>=2732x2732)
npx @capacitor/assets generate --ios --android
```

- iOS: Xcode uses a single 1024x1024 App Icon (no alpha channel); Xcode generates the rest. Xcode 26+ also supports Icon Composer `.icon` files for layered Liquid Glass icons with light/dark/tinted variants.
- Android: adaptive icon (foreground + background, 108dp canvas with the 72dp safe zone), plus a monochrome layer for themed icons on Android 13+. Play listing icon: 512x512 PNG, 32-bit, up to 1 MB.

## iOS screenshots

Apple scales down from the largest sizes, so provide:

| Slot | Portrait pixels | Needed when |
|---|---|---|
| iPhone 6.9" | 1320x2868 (also accepted: 1290x2796, 1260x2736) | App runs on iPhone |
| iPad 13" | 2064x2752 (also accepted: 2048x2732) | App runs on iPad (iPhone apps run on iPad by default unless excluded) |

PNG or JPEG, no transparency, 1-10 per size per localization. Screenshots must show the app in use, not only splash or login screens. App previews: up to 3, 15-30 seconds, screen recordings only.

Capture from simulators of the matching size (`xcrun simctl io booted screenshot shot.png`) or from automated UI tests. Browser viewport screenshots are not pixel-accurate to device sizes; prefer simulator/emulator captures of the real app.

## Android screenshots

- Phone: 2-8 screenshots, 16:9 or 9:16, each side between 320 and 3840 px, long side no more than 2x the short side. 1080x1920 or 1080x2400 are safe choices.
- Tablets (7" and 10") and Chromebook screenshots improve large-screen visibility; required for some large-screen featuring.
- Feature graphic: 1024x500 JPEG or 24-bit PNG, no alpha.

Capture with `adb exec-out screencap -p > shot.png` on an emulator.

## Metadata hygiene (both stores)

- No other platform names in Apple metadata ("Android", "Google Play"), no Apple trademarks in Play metadata.
- No pricing or "free" claims in app names; no keyword stuffing.
- Fictional data in screenshots; no real customer names or emails.
- Privacy policy URL reachable without login and inside the app.
