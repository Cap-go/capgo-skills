# Rule: Sign in with Apple UX Violations
- **Guideline**: 4.0 – Design
- **Severity**: REJECTION
- **Category**: design

## What to Check
If the app offers **Sign in with Apple** (SIWA), the implementation must follow Apple's design and UX requirements. The most common violations:

### Common Violations
1. **Asking for name/email after SIWA** — The Authentication Services framework already provides name and email (if the user chooses to share). Do not prompt for this information again.
2. **Non-standard button styling** — The SIWA button must use Apple's provided `ASAuthorizationAppleIDButton` or equivalent, not a custom-designed button.
3. **Hidden or de-emphasized SIWA** — If other social logins are shown (Google, Facebook, etc.), SIWA must be equally prominent.
4. **Not handling the "Hide My Email" relay** — The app must work with Apple's relay email addresses (`*@privaterelay.appleid.com`).

## How to Detect

### Check for post-SIWA data requests
```bash
# Find SIWA implementation
grep -rn "ASAuthorizationAppleIDProvider\|SignInWithApple\|appleIDCredential\|apple.*sign.*in" --include="*.swift" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" --include="*.vue" --include="*.svelte" --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=www --exclude-dir=build .

# Check if name/email is requested AFTER sign-in
grep -rn "askForName\|askForEmail\|nameTextField\|emailTextField\|profileSetup\|completeProfile" --include="*.swift" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" --include="*.vue" --include="*.svelte" --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=www --exclude-dir=build .
```

### Check for relay email handling
```bash
# Ensure the app doesn't reject relay emails
grep -rn "privaterelay.appleid.com\|@privaterelay\|email.*validation\|isValid.*email" --include="*.swift" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" --include="*.vue" --include="*.svelte" --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=www --exclude-dir=build .
```

### Capacitor check
```bash
grep -rn "provider: *'apple'\|SignInWithApple\|appleid" --include="*.ts" --include="*.tsx" --include="*.vue" --include="*.svelte" --exclude-dir=node_modules src
plutil -p ios/App/App/App.entitlements | grep applesignin
```

### Visual Inspection
1. Sign in with Apple using the "Hide My Email" option
2. After authenticating, check if the app:
   - Shows a form asking for your name (❌ violation)
   - Shows a form asking for your email (❌ violation)
   - Immediately proceeds to the main app (✅ correct)

## Resolution
1. **Use the data from SIWA credentials**: `ASAuthorizationAppleIDCredential` provides `fullName` and `email` — cache these on first use
2. **Don't re-ask for provided data**: If the user shared their name/email via SIWA, use it directly
3. **Handle missing data gracefully**: If the user chose to hide email, use the relay address; if they hid their name, use a default
4. **Use standard SIWA button**: native `ASAuthorizationAppleIDButton`, or in a Capacitor web UI follow Apple's Sign in with Apple button guidelines (official logo, "Sign in with Apple" text, black/white/outline styles, same size as other providers). `@capgo/capacitor-social-login` (`provider: 'apple'`) uses the native AuthenticationServices sheet on iOS.
5. **Name is only returned on the first authorization**: persist `givenName`/`familyName` from the first login on your backend; later logins return only the user identifier and (possibly relay) email.
6. **Account deletion**: if the user deletes their account, revoke the Sign in with Apple token server-side (`/auth/revoke`) as Apple requires.

## Example Rejection
> **Guideline 4.0 - Design**
>
> Your app offers Sign in with Apple as a login option but does not follow the design and user experience requirements for Sign in with Apple. Specifically:
>
> - Your app requires users to provide their name and/or email address after using Sign in with Apple. This information is already provided by the Authentication Services framework.
>
> Next Steps
>
> Please revise the Sign in with Apple experience in your app to address the issues we identified above.
