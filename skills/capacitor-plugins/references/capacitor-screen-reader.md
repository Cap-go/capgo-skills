# Screen Reader

Access TalkBack/VoiceOver and text-to-speech for accessibility.

**Platforms:** Android, iOS, Web (partial)

## Installation

```bash
bun add @capacitor/screen-reader
bunx cap sync
```

## Usage

```typescript
import { ScreenReader } from '@capacitor/screen-reader';

const { value: isActive } = await ScreenReader.isEnabled();
await ScreenReader.speak({ value: 'Hello World', language: 'en' });

ScreenReader.addListener('stateChange', ({ value }) => {
  console.log('Screen reader active:', value);
});
```

## Notes

- `isEnabled()` not available on Web.
- `language` parameter (ISO 639-1) is Android-only.
