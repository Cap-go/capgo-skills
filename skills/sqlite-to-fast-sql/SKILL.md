---
name: sqlite-to-fast-sql
description: Migrates SQLite and SQL-style Capacitor storage (@capacitor-community/sqlite, cordova-sqlite-storage, @ionic/storage with a SQLite driver, TypeORM/Drizzle/Kysely capacitor drivers, and other bridge-based SQL plugins) to @capgo/capacitor-fast-sql. Use when replacing createConnection/open/query/run/executeSet calls, slow large result sets over the Capacitor bridge, adding SQLCipher encryption, keeping transactions and BLOBs, moving key-value data to KeyValueStore, preserving existing database files during the switch, or fixing Fast SQL setup errors (ATS NSAllowsLocalNetworking, Android cleartext localhost, "Encryption is not available in this build", web OPFS COOP/COEP headers). Do not use for non-SQL storage such as Preferences (capacitor-offline-first), Ionic Secure Storage or Identity Vault (ionic-enterprise-sdk-migration), generic app upgrades (capacitor-app-upgrades), or code that already wraps Fast SQL.
allowed-tools:
  - Bash(node -e *)
  - Bash(npm *)
  - Bash(npx cap *)
---

# SQLite to Fast SQL Migration

Swap a bridge-based SQL plugin for `@capgo/capacitor-fast-sql` without losing user data.

## When to Use

TRIGGER when:
- `package.json` has `@capacitor-community/sqlite`, `cordova-sqlite-storage`, `@capawesome-team/capacitor-sqlite`, an ORM capacitor driver, or another SQLite plugin, and the user wants Fast SQL.
- Large `SELECT`s or sync writes are slow because every row crosses the Capacitor bridge as JSON.
- The app needs encryption, transactions, batch writes, BLOBs, or an encrypted key-value store.

Do not use for:
- `@capacitor/preferences` or IndexedDB-only apps -> `capacitor-offline-first`.
- `@ionic-enterprise/secure-storage` / Identity Vault -> `ionic-enterprise-sdk-migration`.
- Apps already on Fast SQL needing schema design or sync logic -> `capacitor-offline-first`.

## Live Project Snapshot

Detected SQL-related packages:
!`node -e "const fs=require('fs');if(!fs.existsSync('package.json'))process.exit(0);const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));const needles=['sqlite','sqlcipher','typeorm','watermelondb','pouchdb','@capacitor-community/sqlite','@capawesome-team/capacitor-sqlite','@capgo/capacitor-fast-sql'];const out=[];for(const section of ['dependencies','devDependencies']){for(const [name,version] of Object.entries(pkg[section]||{})){if(needles.some((needle)=>name.includes(needle)))out.push(section+'.'+name+'='+version)}}console.log(out.sort().join('\n'))"`

## How Fast SQL Differs

- Native SQLite is reached through a token-protected HTTP server on `localhost`, not the Capacitor bridge, so big result sets and batches avoid bridge serialization. This is why iOS ATS and Android cleartext config are required.
- Plugin major follows Capacitor major (v8 for Capacitor 8). Current: 8.2.x.
- Database files: iOS `Documents/<database>.db`, Android `<filesDir>/<database>.db`. Other plugins use different paths and names, so existing data is not picked up automatically.
- Web: official `@sqlite.org/sqlite-wasm` with OPFS persistence (bundled dependency, no `sql.js` install). Older versions used sql.js + IndexedDB; that data is not migrated automatically.
- Encryption: SQLCipher, opt-in per platform.

## Procedure

### Step 1: Inventory

Read `package.json` and grep the data layer. Record: plugin and version, database names, schema/migration mechanism (`user_version`, upgrade statements, ORM migrations), use of transactions, BLOBs, encryption (and where the key comes from), JSON import/export, web support, and approximate data size. Report this before changing code.

### Step 2: Map the API

```ts
import { FastSQL, KeyValueStore } from '@capgo/capacitor-fast-sql';

const db = await FastSQL.connect({ database: 'app' });            // { encrypted, encryptionKey, readOnly }
const rows = await db.query('SELECT * FROM todo WHERE done = ?', [0]);
const { rowsAffected, insertId } = await db.run('INSERT INTO todo (title) VALUES (?)', ['A']);
await db.execute('CREATE TABLE IF NOT EXISTS todo (id INTEGER PRIMARY KEY, title TEXT, done INTEGER DEFAULT 0)');
await db.executeBatch([{ statement: 'INSERT INTO log (m) VALUES (?)', params: ['x'] }]);
await db.transaction(async (tx) => { await tx.run('UPDATE a SET n = n - 1'); await tx.run('UPDATE b SET n = n + 1'); });
await FastSQL.disconnect('app');
```

| `@capacitor-community/sqlite` | Fast SQL |
|---|---|
| `new SQLiteConnection(CapacitorSQLite)`, `createConnection(name, encrypted, mode, version, readonly)`, `db.open()` | `FastSQL.connect({ database, encrypted, encryptionKey, readOnly })` |
| `db.query(sql, values)` -> `{ values }` | `db.query(sql, params)` -> rows array |
| `db.run(sql, values)` -> `{ changes: { changes, lastId } }` | `db.run(sql, params)` -> `{ rowsAffected, insertId }` |
| `db.execute(multiStatementSql)` | `db.execute(sql)` per statement, or `executeBatch` |
| `db.executeSet([{ statement, values }])` | `db.executeBatch([{ statement, params }])` |
| `beginTransaction/commitTransaction/rollbackTransaction`, `transaction` flag on calls | `db.transaction(cb)` or `beginTransaction()` / `commit()` / `rollback()` |
| `addUpgradeStatement` + version | Keep your own `PRAGMA user_version` migration runner |
| `closeConnection(name)` | `FastSQL.disconnect(name)` |
| `importFromJson` / `exportToJson` | Not provided; write rows with `executeBatch` |
| `cordova-sqlite-storage` `db.executeSql(sql, params, ok, err)` / `db.transaction(tx => tx.executeSql(...))` | `db.query`/`db.run` and `db.transaction(async tx => ...)` |

Key-value data (Ionic Storage, Preferences-like wrappers) -> `KeyValueStore.open({ database, encrypted, encryptionKey, store })` with `set/get/has/remove/clear/keys`.

### Step 3: Install and configure

```bash
npm install @capgo/capacitor-fast-sql
npx cap sync
```

iOS `ios/App/App/Info.plist` (loopback only; does not weaken ATS for other hosts):

```xml
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsLocalNetworking</key>
    <true/>
</dict>
```

Android `android/app/src/main/res/xml/network_security_config.xml`, referenced by `android:networkSecurityConfig="@xml/network_security_config"` on `<application>`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="false">localhost</domain>
        <domain includeSubdomains="false">127.0.0.1</domain>
    </domain-config>
</network-security-config>
```

If the app already has a network security config, merge the `domain-config` instead of replacing the file.

Encryption (only if `encrypted: true`):
- Android: `implementation 'net.zetetic:sqlcipher-android:4.13.0'` (or current) in `android/app/build.gradle` dependencies.
- iOS (CocoaPods): `pod 'CapgoCapacitorFastSql/SQLCipher', :path => '../../node_modules/@capgo/capacitor-fast-sql'` in `ios/App/Podfile`, then `pod install`. For SPM projects check the plugin README for the current SQLCipher option.
- Keep the key out of JS source: store it with `@capgo/capacitor-native-biometric` or fetch it from your backend.

Web (only if the app ships on web): serve `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp`, and in Vite add `optimizeDeps.exclude: ['@sqlite.org/sqlite-wasm']`. `CapgoCapacitorFastSql.configureWeb({ ... })` before the first `connect()` is optional and a no-op on native.

### Step 4: Preserve existing data

Pick one with the user:
1. Dual-plugin release (safest): keep the old plugin installed for one release. On first launch, if a `migrated` flag is missing, read tables from the old plugin, `executeBatch` them into Fast SQL inside a transaction, verify counts, set the flag. Remove the old plugin in the next release.
2. File copy: copy the old `.db` file to Fast SQL's path before the first `connect()` (old community plugin files are typically named `<name>SQLite.db`; verify the real path on a device first). Encrypted files keep working only with the same key and a compatible SQLCipher version.
3. Re-sync from server: acceptable when local data is a cache; confirm with the user.

### Step 5: Swap code and remove the old plugin

Replace imports and calls behind the existing data-access layer; keep schema and migration steps. Then (after the carry-over release if option 1):

```bash
npm uninstall @capacitor-community/sqlite   # or the plugin in use
npx cap sync
```

## Verification

- `rg -n "@capacitor-community/sqlite|cordova-sqlite|CapacitorSQLite|SQLiteConnection" -g '!node_modules' src` returns nothing after cleanup.
- Upgrade test: install the current store build, create data, install the new build over it; row counts match.
- Smoke test on both platforms: create, read, update, delete, transaction rollback (throw inside `transaction` and confirm no partial writes), BLOB round-trip (`Uint8Array`).
- Encrypted DB: opening with a wrong key fails; file is unreadable with plain `sqlite3`.
- Measure a large query before/after to confirm the performance goal.

## Error Handling

| Error / symptom | Fix |
|---|---|
| iOS: requests to `http://localhost:<port>` fail, `The resource could not be loaded because the App Transport Security policy requires the use of a secure connection` | Add `NSAllowsLocalNetworking` |
| Android: `net::ERR_CLEARTEXT_NOT_PERMITTED` or `CLEARTEXT communication to localhost not permitted by network security policy` | Add the localhost `network_security_config.xml` and reference it in the manifest |
| iOS: `Encryption is not available in this build. Add SQLCipher to enable encryption.` | Install the SQLCipher subspec or use `encrypted: false` |
| Android: `Encryption is not available. ... to your app's build.gradle to enable encryption.` | Add `net.zetetic:sqlcipher-android` to the app module |
| `Encryption key is required when encrypted is true` | Pass `encryptionKey` with `encrypted: true` |
| App starts with an empty database after update | New file path; run the Step 4 carry-over |
| Web: OPFS / `SharedArrayBuffer` errors | Missing COOP/COEP headers or Vite pre-bundling sqlite-wasm |
| `query` returns objects where code expected `{ values }` | Old community-plugin result shape; update callers to use the rows array |
