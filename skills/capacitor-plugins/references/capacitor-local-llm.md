# Local LLM (CapacitorLABS, experimental)

On-device LLM text generation (Apple Foundation Models / Gemini Nano via ML Kit) and image generation. No network or API key. Experimental: no support provided.

**Platforms:** Android (API 28+), iOS (text needs iOS 26+ with Apple Intelligence; image generation iOS 18.4+)

## Installation

```bash
npm install @capacitor/local-llm
npx cap sync
```

## Configuration

### Android

Set `minSdkVersion = 28` in `android/variables.gradle`. Gemini Nano must be downloaded through Google Play Services; emulators are not supported.

### iOS

No extra config. Simulators work only when the host Mac supports and has Apple Intelligence enabled.

## Usage

```typescript
import { LocalLLM } from '@capacitor/local-llm';

const { status } = await LocalLLM.systemAvailability();
if (status === 'downloadable') {
  await LocalLLM.download(); // then poll systemAvailability() until 'available'
}

const { text } = await LocalLLM.prompt({
  prompt: 'Summarize this note in one sentence.',
  instructions: 'Be concise.',
  sessionId: 'notes', // reuse to keep context; end with endSession()
});
```

Other methods: `warmup`, `endSession`, `generateImage`, `addListener('systemAvailabilityChange', ...)`.

## Notes

- iOS 18 and below: `systemAvailability()` returns `'unavailable'` for text and `prompt()` rejects.
- Always feature-detect and provide a server or non-AI fallback.
- Alternative: `@capgo/capacitor-llm`.
