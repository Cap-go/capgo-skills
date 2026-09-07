# Resolver algorithm

Portable sequence for `resolveSession()`. Adapt storage reads to the host; keep the verdict mapping.

## Reasons

| `reason` | Typical verdict |
| --- | --- |
| `network` | `unresolved` |
| `storage_pending` | `unresolved` (native Preferences / OTA apply still warming) |
| `no_token` | `expired` |
| `getclaims_failed` | `unresolved` if it still looks transient; otherwise fall through to refresh |
| `refresh_failed` | `expired` |
| `token_expired_no_refresh` | `expired` |

Treat as network: `navigator.onLine === false`, or an error message that **case-insensitively** includes `failed to fetch`, `networkerror`, `network request failed`, `load failed`, `timeout`, `aborted`, or `net::err_` (so `Failed to fetch` is network, not expired).

## App-owned session snapshot

supabase-js `SIGNED_OUT` clears **its** storage (`removeItem` on the Auth adapter, usually `sb-<ref>-auth-token`). A resolver that then calls `getSession()` always sees no user and returns `expired` — the bounce this skill exists to stop.

Keep a second copy the Auth client does not own:

- On `SIGNED_IN` and `TOKEN_REFRESHED`, write `access_token` + `refresh_token` to an app-owned Preferences key (not the `sb-*-auth-token` key).
- Auth may still use a Preferences adapter for the official key (WebView `localStorage` eviction). That adapter is for persistence. The contest snapshot is for recovery after a phantom wipe.
- One hydration barrier: do not call `getClaims()` or `refreshSession()` until that snapshot (and the Auth adapter, if native) has been read to completion. While the bridge is warming, return `unresolved` / `storage_pending`.
- To contest: `readDurableSession()` reads the **app-owned** snapshot. If tokens exist, `setSession` them into the client, then validate.

## Sequence

```
cached = readDurableSession()          # app-owned snapshot; hydrate Auth before claims
if !cached.definitive: return unresolved / storage_pending
if !cached.user:       return expired / no_token

for attempt in [1, 2]:
  if attempt == 2: backoff ~1500ms; if offline: return unresolved / network
  claims = getClaims()
  if claims ok: return authenticated
  if claims threw network: continue
  break  # token rejected

if last error was network: return unresolved / network
if offline: return unresolved / network

refresh = refreshSession()
if refresh ok:     return authenticated
if refresh network: return unresolved / network
return expired / refresh_failed | token_expired_no_refresh
```

`getClaims()` verifies the JWT against the cached JWKS and avoids an Auth-server round-trip when the project uses asymmetric signing keys. Prefer it over `getUser()` for this check.

## Contest window

After a phantom `SIGNED_OUT` resolves to `authenticated`, set a module-level flag for ~30 seconds. While it is set, only a later **definitive invalid-session** result (`expired` / `refresh_failed` / `token_expired_no_refresh`) is terminal. `unresolved` (network, `storage_pending`, claims timeout) stays `unresolved` — do not redirect to login.

## Intentional exit

```
setIntentionalSignOutFlag()
try {
  await supabase.auth.signOut()
  # SIGNED_OUT handler sees the flag → cleanup, no contest
} finally {
  clearIntentionalSignOutFlag()
}
```

Clear the flag in `finally` on both success and failure so a rejected `signOut()` cannot leave the flag set. If sign-out fails, leave the user authenticated (fail closed) rather than half-clearing.

## Proactive refresh on resume

Decode `exp` from the access token (JWT payload, UNIX seconds). If `exp * 1000 - Date.now() < 5 * 60 * 1000`, call `refreshSession()` on visibility / app-resume. This is not a substitute for contesting `SIGNED_OUT`.
