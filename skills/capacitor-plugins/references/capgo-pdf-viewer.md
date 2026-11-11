# PDF Viewer (@capgo/capacitor-pdf-viewer)

Native PDF with fullscreen, inline, and `underWebView` presentation.

**Platforms:** iOS, Android, Web  
**Package:** `@capgo/capacitor-pdf-viewer`

## Installation

```bash
npm install @capgo/capacitor-pdf-viewer
npx cap sync
```

## Versions reviewed

`8.2.2` to `8.3.0` (since 2026-09-11).

## API added in window

**Methods:** `show()`, `hide()`, `nextPage()`, `previousPage()`, `getCurrentPage()`, `getPageCount()`, `updateLayout()`.

**Events:** `zoomChange`.

## `underWebView` mode

`PdfDisplayMode` includes `'underWebView'`. The native PDF sits behind a transparent Capacitor WebView so HTML draws chrome on top. On `open()`, use `mode: 'underWebView'` or `toBack: true` (shorthand). Pass `layout` on `open()` in CSS pixels for the PDF rectangle. iOS and Android only. Web rejects `underWebView` and `toBack: true`.

```typescript
import { PdfViewer } from '@capgo/capacitor-pdf-viewer';

await PdfViewer.open({
  source: 'file:///path/doc.pdf',
  mode: 'underWebView',
  layout: { x: 0, y: 56, width: 390, height: 700 },
});
await PdfViewer.updateLayout({ x: 0, y: 56, width: 390, height: 600 });
await PdfViewer.addListener('zoomChange', ({ scale }) => {});
```

## Docs

https://capgo.app/docs/plugins/pdf-viewer/
