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

Treat as network: `navigator.onLine === false`, and error messages matching `failed to fetch`, `networkerror`, `network request failed`, `load failed`, `timeout`, `aborted`, `net::err_`.

## Sequence

```
cached = readDurableSession()          # Preferences on native, then seed localStorage
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

After a phantom `SIGNED_OUT` resolves to `authenticated`, set a module-level flag for ~30 seconds. While it is set, treat subsequent auth errors as real expiry so a genuine dead refresh token is not recovered forever.

## Intentional exit

```
setIntentionalSignOutFlag()
await supabase.auth.signOut()
# SIGNED_OUT handler sees the flag → cleanup, no contest
```

Clear the flag after cleanup. If sign-out fails, leave the user authenticated (fail closed) rather than half-clearing.

## Proactive refresh on resume

Decode `exp` from the access token (JWT payload, UNIX seconds). If `exp * 1000 - Date.now() < 5 * 60 * 1000`, call `refreshSession()` on visibility / app-resume. This is not a substitute for contesting `SIGNED_OUT`.
