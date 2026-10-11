---
name: capacitor-offline-first
description: Designs and implements offline-first data in Capacitor apps - local SQLite source of truth with @capgo/capacitor-fast-sql (`FastSQL.connect`, `KeyValueStore`), an outbox/sync queue, delta pulls, conflict resolution, @capacitor/network `networkStatusChange`, background sync with @capgo/capacitor-background-task, and why localStorage/IndexedDB get evicted and service workers break plugin injection in native WebViews. Use when the app must work without internet, data disappears after iOS storage pressure, sync duplicates or loses writes, or `Plugin not implemented` appears after adding a service worker. Do not use for migrating an existing SQLite plugin (sqlite-to-fast-sql), shipping web bundle updates offline (capgo-live-updates), HTTP security/certificate pinning (capacitor-security), or general performance (capacitor-performance).
---

# Offline-First Capacitor Apps

## When to Use

TRIGGER when:
- The app must read and write while offline and sync later
- Choosing local storage (Preferences vs SQLite vs IndexedDB) for user data
- Writes are duplicated, lost, or overwritten during sync
- Cached data vanishes on iOS after low-storage events
- A service worker was added and native plugins stopped working (`Plugin not implemented`)

Do not use:
- Replacing `@capacitor-community/sqlite` / Ionic secure storage: `sqlite-to-fast-sql`
- Getting new web code to devices (OTA): `capgo-live-updates`
- Encryption key storage, SSL pinning: `capacitor-security`
- Query speed / bridge overhead tuning: `capacitor-performance`

## Decisions (make these before writing code)

| Question | Default answer |
|----------|----------------|
| Where does UI read from? | Local DB only. Network writes into the DB; UI observes the DB. |
| Storage for records | SQLite via `@capgo/capacitor-fast-sql` |
| Storage for small settings / tokens | `@capacitor/preferences` (not for secrets; see `capacitor-security`) |
| localStorage / IndexedDB | Transient only: iOS can evict WebView storage under pressure |
| App shell offline | Already offline: Capacitor bundles web assets in the binary (or Capgo live-update bundle). No service worker needed. |
| Service worker in native builds | Avoid. Android SW blocks Capacitor plugin injection; iOS SW needs `WKAppBoundDomains`, which also blocks injection unless `ios.limitsNavigationsToAppBoundDomains` is set. Keep SW for the PWA build only. |
| IDs | Client-generated UUIDs (`crypto.randomUUID()`), so offline creates need no server round trip |
| Conflict policy | Ask the user/product owner: last-write-wins per record, per-field merge, or server-authoritative with user review |
| Deletes | Soft delete (tombstone) until the server acknowledges |

## Workflow

1. **Inspect**: current storage (`localStorage`, `@capacitor/preferences`, other SQLite plugins), API shape (does it support `updated_since` / version fields / idempotency keys?), auth refresh flow, existing service worker registration.
2. **Report** the plan (schema, outbox, conflict policy) to the user before invasive changes. For large apps, list each entity as a TODO.
3. **Install**: `npm install @capgo/capacitor-fast-sql @capacitor/network && npx cap sync`, then the platform setup in [references/fast-sql-setup.md](references/fast-sql-setup.md) (required: iOS ATS local networking, Android localhost cleartext).
4. **Schema + outbox**: [references/sync-engine.md](references/sync-engine.md).
5. **Triggers for sync**: app start, `networkStatusChange` -> connected, App `resume`, after each local write (debounced), optional background task.
6. **UI**: show pending count / last synced time; never block a write on the network.
7. **Verify** (below).

Only load a reference when its topic is in play.

## Minimal shape

```ts
import { FastSQL } from '@capgo/capacitor-fast-sql';
import { Network } from '@capacitor/network';
import { App } from '@capacitor/app';

const db = await FastSQL.connect({ database: 'app' });
await db.execute(`CREATE TABLE IF NOT EXISTS outbox (
  id TEXT PRIMARY KEY, entity TEXT NOT NULL, op TEXT NOT NULL,
  payload TEXT NOT NULL, created_at INTEGER NOT NULL, attempts INTEGER NOT NULL DEFAULT 0
)`);

export async function saveTodo(todo: Todo) {
  await db.transaction(async (tx) => {
    await tx.run('INSERT OR REPLACE INTO todos (id, text, done, updated_at, dirty) VALUES (?, ?, ?, ?, 1)',
      [todo.id, todo.text, todo.done ? 1 : 0, Date.now()]);
    await tx.run('INSERT INTO outbox (id, entity, op, payload, created_at) VALUES (?, ?, ?, ?, ?)',
      [crypto.randomUUID(), 'todo', 'upsert', JSON.stringify(todo), Date.now()]);
  });
  void sync(); // fire and forget; sync() is single-flight
}

Network.addListener('networkStatusChange', (s) => { if (s.connected) void sync(); });
App.addListener('resume', () => void sync());
```

The data row and its outbox entry are written in one transaction so a crash cannot leave one without the other.

## Traps

- `Network.getStatus().connected === true` does not mean the API is reachable (captive portals, VPN, server down). Treat fetch failures as offline; use `connected` only as a hint to retry.
- `networkStatusChange` can fire several times in a row; make `sync()` single-flight.
- Send an idempotency key (the outbox row id) with every mutation; retries after a timeout otherwise duplicate records.
- Process the outbox in order per entity; a delete must not overtake its create.
- Advance the pull cursor using the **server's** timestamp/version from the response, never the device clock.
- Auth tokens expire while offline: refresh before draining the outbox, and keep entries on 401 instead of dropping them.
- Do not store large blobs in SQLite rows; save files with `@capacitor/filesystem` and keep the path in the DB.
- iOS background execution is opportunistic. Background tasks help but cannot guarantee sync timing; foreground sync on `resume` is the reliable path.

## Verification

1. Airplane mode on device: create, edit, delete records; kill and relaunch the app; data is still there.
2. Turn network back on: outbox drains to 0, server reflects all changes once (no duplicates).
3. Conflict test: edit the same record on two devices offline, reconnect both; result matches the chosen policy.
4. Flaky network: Android emulator network throttling / iOS Network Link Conditioner (Settings -> Developer); retries back off, no data loss.
5. Native checks:

```bash
grep -rn "serviceWorker.register" src/ | grep -v "isNativePlatform"   # should be empty or web-guarded
/usr/libexec/PlistBuddy -c "Print :NSAppTransportSecurity:NSAllowsLocalNetworking" ios/App/App/Info.plist
grep -n "networkSecurityConfig\|usesCleartextTraffic" android/app/src/main/AndroidManifest.xml
```

6. Inspect the DB: `SELECT COUNT(*) FROM outbox` exposed in a debug screen, or pull the file (`adb exec-out run-as com.example.app ls databases/`).

## Error Handling

| Error / symptom | Cause | Fix |
|-----------------|-------|-----|
| `"CapgoCapacitorFastSql" plugin is not implemented on android` / `Plugin not implemented` | Service worker or `WKAppBoundDomains` blocking injection, or missing `npx cap sync` | Remove SW from native build / set `ios.limitsNavigationsToAppBoundDomains`; run `npx cap sync` |
| iOS: `The resource could not be loaded because the App Transport Security policy requires the use of a secure connection` | Fast SQL localhost transport blocked by ATS | Add `NSAllowsLocalNetworking` |
| Android: `CLEARTEXT communication to localhost not permitted by network security policy` | Cleartext to localhost blocked | Add `network_security_config.xml` localhost exception |
| `SQLITE_CONSTRAINT: UNIQUE constraint failed` during pull | Server row id already exists locally | Use `INSERT ... ON CONFLICT(id) DO UPDATE` |
| `database is locked` | Parallel writers / long transaction | Serialize writes; keep transactions short; single-flight sync |
| Data gone after iOS storage pressure | Stored in localStorage / IndexedDB | Move to SQLite |
| Duplicate server records after reconnect | Retried POST without idempotency key | Send outbox id as `Idempotency-Key`; server dedupes |

## Resources

- Fast SQL plugin: https://capgo.app/docs/plugins/fast-sql/
- Capacitor storage guide: https://capacitorjs.com/docs/guides/storage
- Network API: https://capacitorjs.com/docs/apis/network
- Background task plugin: https://capgo.app/docs/plugins/background-task/
- iOS troubleshooting (WKAppBoundDomains): https://capacitorjs.com/docs/ios/troubleshooting
