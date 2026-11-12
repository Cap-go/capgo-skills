# Updater JavaScript API

Import: `import { CapacitorUpdater } from '@capgo/capacitor-updater';`
Source of truth: `src/definitions.ts` in `@capgo/capacitor-updater` 8.54.2, and https://capgo.app/docs/plugins/updater/api/.

Minimum native versions for APIs in this reference (rebuild and sync after upgrading):

- **8.47.0+**: `getMissingBundleFiles`, `getBundleDownloadSize`, `startPreviewSession`
- **8.48.0+**: `startPreviewSession({ payloadUrl })` (the `payloadUrl` option alone requires 8.48.0+)
- **8.49.0+**: `listPreviews`, `setPreview`, `resetPreview`, `deletePreview`, `checkPreviewUpdate`, `updatePreview`
- **8.53.0+**: `updaterEvent` unified listener

## Lifecycle methods

| Method | Use |
| --- | --- |
| `notifyAppReady()` | Confirms the bundle booted. Call it first. It never rejects |
| `getLatest({ channel? })` | Asks the backend for the newest bundle. Does not download |
| `download({ url, version, sessionKey?, checksum?, manifest? })` | Downloads a zip, returns `BundleInfo` (`id`, `version`, `status`) |
| `next({ id })` | Applies on the next background, kill, or `reload()`. Preferred |
| `set({ id })` | Applies now and **destroys the JS context**. Nothing after it runs |
| `reload()` | Reloads the WebView (applies a pending `next`) |
| `reset({ toLastSuccessful?, usePendingBundle? })` | Back to builtin (default) or last good bundle. Reloads |
| `current()` | `{ bundle, native }`. `bundle.id === 'builtin'` means no OTA is active |
| `list()` / `delete({ id })` | Inspect or remove local bundles |
| `getBuiltinVersion()` / `getPluginVersion()` / `getDeviceId()` | Diagnostics |
| `setMultiDelay({ delayConditions })` / `cancelDelay()` | Hold a `next` bundle until `background`, `kill`, `nativeVersion`, or `date` |
| `triggerUpdateCheck()` | Queue an immediate auto-update check |
| `setBundleError({ id })` | Manual mode only. Needs `allowManualBundleError: true` |
| `getMissingBundleFiles({ version, manifest })` | Delta bundles. Lists manifest entries missing locally |
| `getBundleDownloadSize({ version, manifest, files })` | Delta bundles. Size estimate after `getMissingBundleFiles` |
| `startPreviewSession({ appId?, payloadUrl? })` | Expo Go style preview. Needs `allowPreview: true` in config |
| `listPreviews()` | Locally saved preview bundles still on disk |
| `setPreview({ id })` | Switch to a preview bundle and reload |
| `resetPreview()` | Leave preview mode |
| `deletePreview({ id })` | Remove a stored preview bundle |
| `checkPreviewUpdate({ id })` / `updatePreview({ id })` | Refresh a preview bundle from the server |

## Manual flow (`autoUpdate: false` or `"onlyDownload"`)

```typescript
CapacitorUpdater.notifyAppReady();

export async function checkAndStage() {
  const latest = await CapacitorUpdater.getLatest();
  if (latest.kind === 'up_to_date') return;          // error: 'no_new_version_available' is normal
  if (latest.kind === 'blocked') {                    // channel policy refused, read latest.error
    console.warn('Update blocked:', latest.error);
    return;
  }
  if (!latest.url) return;

  const bundle = await CapacitorUpdater.download({
    url: latest.url,
    version: latest.version,
    sessionKey: latest.sessionKey,   // present for encrypted bundles
    checksum: latest.checksum,
    manifest: latest.manifest,       // present for delta bundles
  });
  await CapacitorUpdater.next({ id: bundle.id }); // applies on next background
}
```

Traps:

- Pass `{ id: bundle.id }` to `next` / `set`, not the version string.
- Do not await anything after `set()` or `reset()`, because the context is gone. Save state to storage first.
- Prompting the user before `set()` is fine. Forcing an update that blocks app usage risks App Review issues.

## Channels from the app

```typescript
CapacitorUpdater.addListener('channelPrivate', ({ channel, message }) => {
  console.warn(`Channel ${channel} is not self-assignable: ${message}`);
});

await CapacitorUpdater.setChannel({ channel: 'beta', triggerAutoUpdate: true });
await CapacitorUpdater.getChannel();
await CapacitorUpdater.listChannels();       // only self-assignable channels
await CapacitorUpdater.unsetChannel({});     // back to defaultChannel / cloud default
```

- Since 7.34, `setChannel()` stores the choice on the device, not in the cloud. Overrides set from the dashboard or Public API still win.
- Do not call `setChannel()` at boot. Use `defaultChannel` in config for that. Call `setChannel()` after the user opts in, for example from a beta toggle.
- The target channel must allow self-assignment. If it does not, the call throws and `channelPrivate` fires.

## Events

| Event | Payload highlights |
| --- | --- |
| `download` | `{ percent, bundle }` progress |
| `updateAvailable` | `{ bundle }` downloaded and ready |
| `downloadComplete` | `{ bundle }` |
| `downloadFailed` | `{ version }` |
| `updateFailed` | `{ bundle }`, the bundle that failed `notifyAppReady` and rolled back |
| `noNeedUpdate` | `{ bundle }` already current |
| `majorAvailable` / `breakingAvailable` | `{ version }`, blocked by a major or breaking change (needs a native update) |
| `set` / `setNext` | `{ bundle }` |
| `appReady` | `{ bundle, status }` |
| `appReloaded` | none |
| `channelPrivate` | `{ channel, message }` |
| `updateCheckResult` | result of each check (`kind`, `error`, `message`) |
| `updaterEvent` | Unified stream: `{ type, data }` where event fields live in `data`. On this stream use `breakingAvailable`, not `majorAvailable` |

Prefer named events in app code. Use `updaterEvent` when one listener must mirror native stats or debug every event. Read `event.data`, not top-level fields.

There is no `downloadProgress` event. Use `download`.

`getFailedUpdate()` returns the last failed update after a rollback. Log it on startup to catch broken releases.

## Native app-store update helpers

`getAppUpdateInfo()`, `openAppStore()`, and on Android `performImmediateUpdate()` / `startFlexibleUpdate()` / `completeFlexibleUpdate()` handle native store updates. Pair them with the `majorAvailable` event when an OTA is blocked because a newer native build is required.
