# Fast SQL Platform Setup

Load when installing `@capgo/capacitor-fast-sql` (8.x for Capacitor 8). For migrating from another SQLite plugin, use `sqlite-to-fast-sql` instead.

The plugin runs a local HTTP server on `localhost` to move query results without the Capacitor bridge, so both platforms must allow cleartext to loopback.

## iOS (`ios/App/App/Info.plist`)

```xml
<key>NSAppTransportSecurity</key>
<dict>
  <key>NSAllowsLocalNetworking</key>
  <true/>
</dict>
```

Merge into an existing `NSAppTransportSecurity` dict; do not add a second one. This only permits loopback cleartext.

## Android

`android/app/src/main/res/xml/network_security_config.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
  <domain-config cleartextTrafficPermitted="true">
    <domain includeSubdomains="false">localhost</domain>
    <domain includeSubdomains="false">127.0.0.1</domain>
  </domain-config>
</network-security-config>
```

```xml
<application android:networkSecurityConfig="@xml/network_security_config" ...>
```

If the app already has a network security config (e.g. for pinning), add the `domain-config` to it instead of replacing it. Avoid `android:usesCleartextTraffic="true"`; it opens cleartext to every host.

## Web fallback

Uses sql.js (WASM). By default it loads from a CDN; for offline PWA builds bundle it and call before the first connect:

```ts
import { CapgoCapacitorFastSql } from '@capgo/capacitor-fast-sql';
await CapgoCapacitorFastSql.configureWeb({ sqlJsUrl: '/assets/sql-wasm.js', wasmUrl: '/assets/sql-wasm.wasm' });
```

## API cheat sheet

```ts
import { FastSQL, KeyValueStore } from '@capgo/capacitor-fast-sql';

const db = await FastSQL.connect({ database: 'app' });           // SQLConnection
const rows = await db.query('SELECT * FROM todos WHERE done = ?', [0]);
const { rowsAffected, insertId } = await db.run('DELETE FROM todos WHERE id = ?', [id]);
await db.executeBatch([{ statement: 'INSERT ...', params: [...] }]);
await db.transaction(async (tx) => { await tx.run('...'); });

const kv = await KeyValueStore.open({ database: 'app', store: 'settings' });
await kv.set('lastSync', 1730000000);
const v = await kv.get('lastSync');
```

Options: `encrypted` + `encryptionKey` (iOS/Android; Android needs the SQLCipher dependency per plugin README), `readOnly`. Load the encryption key from secure storage, never hardcode it.

Check the installed version's `SQLBatchOperation` type in `node_modules/@capgo/capacitor-fast-sql/dist/esm/definitions.d.ts` before writing batch code.

## Migrations

Keep a `PRAGMA user_version` integer and apply ordered migration steps inside a transaction at startup:

```ts
const [{ user_version }] = await db.query('PRAGMA user_version');
if (Number(user_version) < 1) {
  await db.transaction(async (tx) => {
    await tx.run('CREATE TABLE todos (id TEXT PRIMARY KEY, text TEXT, done INTEGER, updated_at INTEGER, dirty INTEGER, deleted INTEGER DEFAULT 0)');
    await tx.run('PRAGMA user_version = 1');
  });
}
```

Live updates can ship new JS against an old on-device schema; migrations must run on every app start and be forward-only.
