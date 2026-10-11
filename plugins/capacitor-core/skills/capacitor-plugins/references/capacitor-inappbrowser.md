# InAppBrowser

Opens URLs in WebView, in-app system browser, or external browser.

**Platforms:** Android, iOS (no Web)

## Installation

```bash
npm install @capacitor/inappbrowser
npx cap sync
```

## Configuration

### Android

Requires `minSdkVersion = 26` in `android/variables.gradle` (Capacitor 8 default is 24).

## Usage

```typescript
import {
  DefaultSystemBrowserOptions,
  DefaultWebViewOptions,
  InAppBrowser,
} from '@capacitor/inappbrowser';

await InAppBrowser.openInWebView({ url: 'https://example.com', options: DefaultWebViewOptions });
await InAppBrowser.openInSystemBrowser({ url: 'https://example.com', options: DefaultSystemBrowserOptions });
await InAppBrowser.openInExternalBrowser({ url: 'https://example.com' });
await InAppBrowser.close();

await InAppBrowser.addListener('browserClosed', () => {});
await InAppBrowser.addListener('browserPageNavigationCompleted', (data) => console.log(data.url));
```

## Notes

- WebView supports toolbar positioning, navigation buttons, cache management, user agent, zoom.
- Events: `browserClosed`, `browserPageLoaded`, `browserPageNavigationCompleted`.
- `openInWebView` isolates cookies/localStorage from the app (Android API 28+ runs it in a separate `:OSInAppBrowser` process). Set `android: { isIsolated: false }` only if session sharing is truly required.
- Need JS injection, message passing, or screenshot features: compare with `@capgo/capacitor-inappbrowser`.
