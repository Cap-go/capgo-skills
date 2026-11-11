# Native Audio (@capgo/capacitor-native-audio)

Playlist queue, playback state, and audio routing on top of the native engine.

**Platforms:** iOS, Android, Web  
**Package:** `@capgo/capacitor-native-audio` (Capacitor 8.x)

## Installation

```bash
npm install @capgo/capacitor-native-audio
npx cap sync
```

## Versions reviewed

`8.4.25` to `8.5.1` (since 2026-09-11).

## API added in window

**Methods:** `setQueue()`, `queueNext()`, `queuePrevious()`, `queueSelect()`, `getPlaybackState()`, `getQueueState()`, `getRate()`, `getAudioRoute()`, `setSpeaker()`, `setEarpiece()`, `clearQueue()`.

**Events:** `queueChange`, `playbackState`, `progress`, `audioRouteChange`.

## Queue and playback

```typescript
import { NativeAudio } from '@capgo/capacitor-native-audio';

await NativeAudio.configure({ focus: true });
await NativeAudio.setQueue({ items: [{ assetId: 'a', assetPath: 'public/a.mp3' }] });
await NativeAudio.play({ assetId: 'a' });
await NativeAudio.queueNext();
const { state } = await NativeAudio.getPlaybackState();
const queue = await NativeAudio.getQueueState();
```

Subscribe:

```typescript
await NativeAudio.addListener('queueChange', () => {});
await NativeAudio.addListener('playbackState', ({ state }) => {});
await NativeAudio.addListener('progress', ({ position, duration }) => {});
await NativeAudio.addListener('audioRouteChange', ({ route }) => {});
```

## Audio route

`getAudioRoute()`, `setSpeaker()`, and `setEarpiece()` control whether playback uses the loudspeaker or earpiece (iOS and Android).

## Docs

https://capgo.app/docs/plugins/native-audio/
