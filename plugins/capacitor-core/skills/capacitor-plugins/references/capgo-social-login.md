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

Use `openAuthSession()` for a system browser session on iOS and Android, or a popup on Web. It returns `callbackURL` only. For an authorization-code flow, exchange the code from `callbackURL` on your backend or in your client logic, then handle the resulting session. Pair with `initialize()`, `login()`, `logout()`, and `refresh()`.

```typescript
import { SocialLogin } from '@capgo/capacitor-social-login';

const { callbackURL } = await SocialLogin.openAuthSession({
  url: authUrl,
  callbackURLScheme: 'myapp',
});
```

Sign in with Apple store rules: `capacitor-apple-review-preflight`.

## Docs

https://capgo.app/docs/plugins/social-login/
