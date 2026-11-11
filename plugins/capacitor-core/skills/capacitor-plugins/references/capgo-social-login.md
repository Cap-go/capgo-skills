# Social Login (@capgo/capacitor-social-login)

Apple, Google, Facebook, and OAuth2/OIDC sign-in.

**Platforms:** iOS, Android, Web  
**Package:** `@capgo/capacitor-social-login`

## Installation

```bash
npm install @capgo/capacitor-social-login
npx cap sync
```

## Versions reviewed

`8.5.7` to `8.7.7` (since 2026-09-11).

## API added in window

**Methods:** `openAuthSession()`.

Use `openAuthSession()` for an in-app auth session (ASWebAuthenticationSession style) when a full browser handoff is too heavy. Pair with `initialize()`, `logout()`, and `refresh()`.

```typescript
import { SocialLogin } from '@capgo/capacitor-social-login';

await SocialLogin.openAuthSession({ url: authUrl, callbackUrl: 'myapp://auth' });
```

Sign in with Apple store rules: `capacitor-apple-review-preflight`.

## Docs

https://capgo.app/docs/plugins/social-login/
