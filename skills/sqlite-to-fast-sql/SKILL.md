---
name: sqlite-to-fast-sql
description: Guides the agent through migrating SQLite and SQL-style Capacitor plugins to @capgo/capacitor-fast-sql. Use when replacing bridge-based SQL plugins, adding encryption, preserving transactions, or moving key-value storage onto Fast SQL. Do not use for non-SQL storage, generic app upgrades, or plugins that already wrap Fast SQL.
allowed-tools: "Bash(node -e *)"
---

# SQLite to Fast SQL Migration

Migrate bridge-based SQLite or SQL plugins to `@capgo/capacitor-fast-sql`.

## When to Use

- Replacing an existing SQLite or SQL Capacitor plugin with Fast SQL
- Adding encryption, transactions, batch writes, or BLOB support to local storage
- Migrating key-value storage to a Fast SQL-backed `KeyValueStore`

## Live Project Snapshot

Detected SQL-related packages:
!`node -e "const fs=require('fs');if(!fs.existsSync('package.json'))process.exit(0);const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));const needles=['sqlite','sqlcipher','typeorm','watermelondb','pouchdb','@capacitor-community/sqlite','@capawesome-team/capacitor-sqlite','@capgo/capacitor-fast-sql'];const out=[];for(const section of ['dependencies','devDependencies']){for(const [name,version] of Object.entries(pkg[section]||{})){if(needles.some((needle)=>name.includes(needle)))out.push(section+'.'+name+'='+version)}}console.log(out.sort().join('\n'))"`

## Why Fast SQL

Fast SQL is the preferred migration target because it avoids heavy bridge serialization by using a local HTTP transport to native SQLite. That makes it much faster for large result sets and sync-heavy write patterns.

Fast SQL also provides:

- transactions with explicit or callback control
- batch execution for multiple statements
- BLOB support for binary data
- encryption and read-only modes
- `KeyValueStore` for lightweight key-value access on top of SQLite
- web fallback support through SQL.js

## Migration Procedure

### Step 1: Inspect the Current SQL Plugin

Start from the injected package snapshot, then read `package.json` directly if the current SQL plugin set still needs clarification.

Document whether the app uses:

- raw SQL queries
- transactions
- BLOB data
- migrations/schema bootstrap
- key-value wrappers
- encrypted storage

### Step 2: Map the Current API Surface

Map the old plugin calls to Fast SQL equivalents:

- connection setup -> `FastSQL.connect(...)`
- reads -> `db.query(...)`
- single-statement writes -> `db.run(...)`
- multi-statement work -> `db.executeBatch(...)`
- transactional work -> `db.transaction(...)` or explicit `beginTransaction` / `commit` / `rollback`
- key-value storage -> `KeyValueStore.open(...)`

### Step 3: Install Fast SQL

Install the new package with the repository's package manager and sync native projects.

```bash
npm install @capgo/capacitor-fast-sql
npx cap sync
```

If the app ships web support, install `sql.js` for the web fallback when needed.

### Step 4: Update Code

Replace old plugin imports and APIs with Fast SQL.

Prefer `db.executeBatch(...)` for repeated writes, `db.transaction(...)` for atomic changes, and `KeyValueStore` for simple local key-value data.

Preserve the existing schema and migration steps unless the old plugin forced a different format.

### Step 5: Reconfigure Native Platforms

Apply the Fast SQL platform setup required by the app:

- iOS local network access when the plugin needs localhost traffic
- Android cleartext network configuration for localhost traffic
- SQLCipher dependency when encrypted mode is enabled on Android

### Step 6: Remove the Old Plugin

Remove the legacy SQL package from `package.json`, reinstall dependencies, and sync again.

Then run the app's normal database smoke tests or migration verification checks.

## Error Handling

- If encrypted storage is required, keep `encrypted: true` and provide a strong key before shipping.
- If the old plugin exposed transactions, use Fast SQL transaction APIs rather than emulating them with ad hoc queries.
- If the app depends on large result sets, prefer batch queries and avoid bridge-heavy wrappers.
- If the app already has a well-defined schema migration path, keep it and only swap the storage engine.
