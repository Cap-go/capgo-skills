# Sync Engine: Outbox, Pull, Conflicts

Load when implementing or debugging the sync loop.

## Tables

```sql
CREATE TABLE todos (
  id TEXT PRIMARY KEY,
  text TEXT NOT NULL,
  done INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL,     -- local edit time (display only)
  server_version INTEGER,          -- last version seen from server
  dirty INTEGER NOT NULL DEFAULT 0,
  deleted INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE outbox (
  id TEXT PRIMARY KEY,             -- also the idempotency key
  entity TEXT NOT NULL,
  op TEXT NOT NULL,                -- upsert | delete
  payload TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  last_error TEXT
);
CREATE TABLE sync_state (entity TEXT PRIMARY KEY, cursor TEXT);
```

## Single-flight sync

```ts
let running: Promise<void> | null = null;

export function sync() {
  running ??= (async () => {
    try {
      await ensureFreshAuth();
      await push();
      await pull();
    } finally {
      running = null;
    }
  })();
  return running;
}
```

## Push (drain outbox in order)

```ts
async function push() {
  const items = await db.query('SELECT * FROM outbox ORDER BY created_at LIMIT 50');
  for (const item of items) {
    try {
      const res = await fetch(`${API}/${item.entity}/${JSON.parse(String(item.payload)).id}`, {
        method: item.op === 'delete' ? 'DELETE' : 'PUT',
        headers: { 'Content-Type': 'application/json', 'Idempotency-Key': String(item.id) },
        body: item.op === 'delete' ? undefined : String(item.payload),
      });
      if (res.status === 409) { await markConflict(item, await res.json()); continue; }
      if (res.status === 401) return;               // keep entries; re-auth later
      if (!res.ok && res.status >= 500) throw new Error(`HTTP ${res.status}`);
      if (!res.ok) { await deadLetter(item, res.status); continue; } // 4xx: will never succeed
      const rowId = JSON.parse(String(item.payload)).id;
      await db.transaction(async (tx) => {
        await tx.run('DELETE FROM outbox WHERE id = ?', [item.id]);
        // clear dirty only if no newer outbox entry targets the same row
        await tx.run(
          `UPDATE todos SET dirty = 0 WHERE id = ? AND NOT EXISTS
             (SELECT 1 FROM outbox WHERE entity = 'todo' AND json_extract(payload, '$.id') = ?)`,
          [rowId, rowId],
        );
      });
    } catch (e) {
      await db.run('UPDATE outbox SET attempts = attempts + 1, last_error = ? WHERE id = ?', [String(e), item.id]);
      return; // stop on network error, keep order; retry with backoff
    }
  }
}
```

`json_extract` needs SQLite JSON1 (bundled in current iOS/Android SQLite builds; confirm on your minimum OS). Alternative: store `row_id` as its own outbox column.

Backoff: `delay = min(2^attempts * 1000, 5 * 60_000)` plus jitter. Show items with `attempts > N` or dead-lettered entries in the UI.

## Pull (delta by server cursor)

```ts
async function pull() {
  const [state] = await db.query('SELECT cursor FROM sync_state WHERE entity = ?', ['todo']);
  const res = await fetch(`${API}/todos?since=${encodeURIComponent(String(state?.cursor ?? ''))}`);
  const { items, cursor } = await res.json();     // cursor issued by server
  await db.transaction(async (tx) => {
    for (const r of items) {
      const [local] = await tx.query('SELECT dirty FROM todos WHERE id = ?', [r.id]);
      if (local?.dirty) { await resolveConflict(tx, r); continue; }
      await tx.run(`INSERT INTO todos (id, text, done, updated_at, server_version, dirty, deleted)
        VALUES (?, ?, ?, ?, ?, 0, ?)
        ON CONFLICT(id) DO UPDATE SET text = excluded.text, done = excluded.done,
          updated_at = excluded.updated_at, server_version = excluded.server_version, deleted = excluded.deleted`,
        [r.id, r.text, r.done ? 1 : 0, r.updatedAt, r.version, r.deleted ? 1 : 0]);
    }
    await tx.run('INSERT INTO sync_state (entity, cursor) VALUES (?, ?) ON CONFLICT(entity) DO UPDATE SET cursor = excluded.cursor', ['todo', cursor]);
  });
}
```

The server must return tombstones for deletes, or deleted rows reappear on other devices.

## Conflict policies

| Policy | How | Good for |
|--------|-----|----------|
| Server-authoritative + version check | Client sends `server_version`; server returns 409 on mismatch; client re-applies or asks user | Most business data |
| Last-write-wins | Compare server-assigned timestamps; never device clocks | Low-value fields, settings |
| Per-field merge | Track changed fields in outbox payload; merge non-overlapping | Forms with many independent fields |
| CRDT | Library-managed (Yjs, Automerge) | Collaborative text / lists |

Ask the user which policy fits; do not silently pick last-write-wins for financial or shared data.

## Background sync

`@capgo/capacitor-background-task` schedules periodic background work (iOS BGTaskScheduler / Android WorkManager style). Keep the task short, call the same `sync()`, and expect the OS to delay or skip runs.

## Tests

- Unit-test `push`/`pull` against a fake API with: timeout after server commit (must not duplicate), 409, 401 mid-drain, 500 then success.
- Device test with airplane mode and app kill between write and sync.
