---
name: session-verdict
description: Verdicts a Capacitor WebView supabase-js session as authenticated, expired, or unresolved instead of treating onAuthStateChange SIGNED_OUT as logout. Use when a hybrid app bounces authenticated users to login after iOS background resume, when supabase-js fires a phantom SIGNED_OUT on a still-valid token, when getClaims or refreshSession fails on the network, or when several auth guards disagree on whether the session is gone.
---

# Session Verdict

Every auth guard must ask one resolver "is the session gone?" The resolver returns a **verdict**: `authenticated` | `expired` | `unresolved`. A supabase-js `SIGNED_OUT` event is a *claim*, not a verdict. Contest it before wiping caches or redirecting to login.

Use `@capgo/capacitor-supabase` (via `capacitor-plugins`) when you want native Auth. This skill is for **supabase-js running in the WebView**. Do not use it to add OAuth, Preferences storage, or `notifyAppReady()`.

Canonical copy: https://github.com/orleib-lab/agent-skills/tree/main/session-verdict

## When to Use This Skill

- User reports logout / login bounce after backgrounding a Capacitor iOS app
- `onAuthStateChange` fires `SIGNED_OUT` but the refresh token is still valid
- Several guards (`onAuthStateChange`, session hook, route guard) disagree on auth
- `getClaims()` or `refreshSession()` fails on the network and the app treats that as signed out

## Instructions

### Step 1: Inventory every answer to "is the session gone?"

Find every listener, hook, and route guard that independently decides the user is logged out. Typical sites: `onAuthStateChange`, a session hook, an onboarding/login gate, a query-cache auth error handler.

Done when you have a list of call sites. If more than one site computes its own answer, they will disagree under a phantom `SIGNED_OUT` and that is the bug.

### Step 2: Give those sites one resolver

Introduce a single module that owns the question. All listed sites call it. None of them read `getSession()` and redirect on a missing user.

Two entry points:

| Call | Network | Returns | Use |
| --- | --- | --- | --- |
| `peekSession()` | No | `authenticated` or `unresolved` (never `expired`) | Warm-start UX only: "is there probably a session?" |
| `resolveSession()` | Yes | a verdict | Every guard that can redirect or wipe state |

`resolveSession()` deduplicates concurrent callers with one in-flight promise so three guards waking at once make one round-trip.

Done when every inventoried site delegates. No remaining `if (!session) redirect('/login')`.

### Step 3: Map each verdict to UI

| Verdict | Meaning | UI |
| --- | --- | --- |
| `authenticated` | Token is valid (or refresh succeeded) | Stay. Do not show login. |
| `unresolved` | Network, storage still warming, or claims check timed out | Hold: splash, existing shell, or retry. Do not treat as signed out. |
| `expired` | No token, or refresh definitively failed | Redirect to re-auth with `reason=expired` and `returnTo`. |

Network failure is `unresolved`, not `expired`. Signing the user out because `fetch` failed is the defect this skill prevents.

Done when no guard redirects on `unresolved`.

### Step 4: Contest `SIGNED_OUT`

On `onAuthStateChange` → `SIGNED_OUT`:

1. If this process just requested sign-out (an **intentional** exit flag you set before `signOut()`), complete cleanup and leave. That tap is a request; the flag is how you know it is not a phantom.
2. Otherwise **return from the callback first**, then run `resolveSession()` (queue with `setTimeout(..., 0)` or equivalent). Do not `await` `getClaims()` / `refreshSession()` inside the listener — older auth-js can deadlock ([auth-js#762](https://github.com/supabase/gotrue-js/issues/762)).
3. `authenticated` → mark a short contest window (~30s) and return. Do not wipe. Do not redirect.
4. `unresolved` with reason `network` → return. Hold the current UI.
5. `expired` → cleanup, redirect to re-auth.

During the contest window, only a later **definitive invalid-session** result (`expired`) is terminal. Network, `storage_pending`, and other `unresolved` results stay unresolved — do not redirect to login.

`peekSession()` is not enough here. Contesting requires `resolveSession()`.

Done when a background-resume `SIGNED_OUT` with a still-valid refresh token leaves the user on the screen they were on.

### Step 5: Resolve in this order

Full sequence: [references/algorithm.md](references/algorithm.md).

1. Read an **app-owned durable snapshot** (Preferences key the Auth client does not `removeItem` on `SIGNED_OUT`). Do not contest by reading supabase-js’s own storage after the event — that wipe is why a naive `getSession()` always looks expired. Hydrate the client with `setSession` from that snapshot before `getClaims()` / `refreshSession()`.
2. If native storage is still warming, return `unresolved` / `storage_pending` — not login.
3. No snapshot tokens → `expired` / `no_token`.
4. `getClaims()` up to twice (cached JWKS; faster than `getUser()`). Network errors stay `unresolved`.
5. Claims rejected → `refreshSession()`. Network errors stay `unresolved`. Hard refresh failure → `expired`.

On app resume, if the access-token `exp` is within a few minutes, `refreshSession()` proactively so the first user action does not hit a stale JWT. Decode `exp` from the JWT payload; no extra library.

Done when the resolver has no path that maps a network error to `expired`.

### Step 6: Instrument the verdict, not the event

Emit one analytics event per resolution: `verdict`, `reason`, `source` (which guard called). A phantom that was contested shows up as `authenticated` from `signed_out_handler`. A real expiry shows `expired`. If you only log `SIGNED_OUT`, you cannot tell them apart.

Done when you can answer, from production events, whether a login bounce was `expired` or a swallowed phantom.

## Guardrails

- **Intentional exit** is a flag you set, then call `signOut()`, and clear in `finally` (success and failure). A `SIGNED_OUT` without that flag is contested.
- Do not hard-redirect to `/` on `SIGNED_OUT`. Re-auth should keep `returnTo`.
- Do not show the logged-out empty state (onboarding, marketing home, provider buttons) while the verdict is `unresolved`.
- After a successful contest, do not also have a second listener wipe the query cache. Every listener contests or it races.

## Additional resources

- Resolver order and reason codes: [references/algorithm.md](references/algorithm.md)
