# InAppBrowser (@capgo/capacitor-inappbrowser)

WebView browser with JS injection, postMessage, and fullscreen control.

**Platforms:** iOS, Android  
**Package:** `@capgo/capacitor-inappbrowser`

## Installation

```bash
npm install @capgo/capacitor-inappbrowser
npx cap sync
```

## Versions reviewed

`8.16.6` to `8.27.6` (since 2026-09-11).

## API added in window

**Methods:** `getFullscreen()`, `setFullscreen()`.

**Events:** `fullscreenChange`.

For OAuth-safe system browser use official `@capacitor/inappbrowser` (`capacitor-plugins/references/capacitor-inappbrowser.md`). Use `@capgo/capacitor-inappbrowser` when you need `executeScript`, `dispatchInputEvent`, or message bridges.

```typescript
import { InAppBrowser } from '@capgo/capacitor-inappbrowser';

await InAppBrowser.addListener('fullscreenChange', ({ enabled }) => {});
const { id } = await InAppBrowser.openWebView({ url: 'https://example.com' });
await InAppBrowser.setFullscreen({ enabled: true, id });
await InAppBrowser.executeScript({ code: 'document.title', id });
```

## Docs

https://capgo.app/docs/plugins/inappbrowser/
