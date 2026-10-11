# File Transfer

File upload and download with progress tracking.

**Platforms:** Android, iOS, Web

## Installation

```bash
npm install @capacitor/file-transfer
npx cap sync
```

## Usage

```typescript
import { FileTransfer } from '@capacitor/file-transfer';
import { Directory, Filesystem } from '@capacitor/filesystem';

// Resolve a native file URI first; never hard-code platform paths.
const target = await Filesystem.getUri({ directory: Directory.Data, path: 'file.pdf' });

try {
  await FileTransfer.downloadFile({
    url: 'https://example.com/file.pdf',
    path: target.uri,
    progress: true,
  });
} catch (error: any) {
  if (error.code === 'OS-PLUG-FLTR-0010') {
    // HTTP error: error.data.httpStatus, error.data.body
  }
}

const upload = await Filesystem.getUri({ directory: Directory.Cache, path: 'photo.jpg' });
await FileTransfer.uploadFile({
  url: 'https://example.com/upload',
  path: upload.uri,
  chunkedMode: true,
  progress: false,
});

FileTransfer.addListener('progress', (event) => {
  console.log(`${event.bytes} / ${event.contentLength}`);
});
```

## Notes

- Common options: `url`, `path`, `method`, `headers`, `params`, `readTimeout`/`connectTimeout` (default 60s), `progress`, `disableRedirects`.
- Upload-specific: `chunkedMode`, `mimeType`, `fileKey`. Uploads are `multipart/form-data` unless you set `Content-Type` explicitly.
- Replaces the deprecated `Filesystem.downloadFile()` (deprecated since filesystem 7.1.0).
- Background uploads: `@capgo/capacitor-uploader`; large downloads: `@capgo/capacitor-downloader`.
