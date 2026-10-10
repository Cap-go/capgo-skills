# Rule: Unused or Unnecessary Entitlements
- **Guideline**: 2.4.5(i) – Performance
- **Severity**: REJECTION (info request, blocks review)
- **Category**: entitlements

## What to Check
Apps should only declare entitlements that are **actively used** by the app. Apple will request justification for any entitlement that doesn't have matching functionality in the app. If you can't justify an entitlement, it must be removed.

### Commonly Flagged Entitlements (macOS)
- `com.apple.security.network.server` — App acts as a network server
- `com.apple.security.network.client` — App makes outbound network requests
- `com.apple.security.files.downloads.read-only` — App reads the Downloads folder
- `com.apple.security.files.downloads.read-write` — App writes to Downloads
- `com.apple.security.files.user-selected.read-only` — App reads user-selected files
- `com.apple.security.files.user-selected.read-write` — App writes to user-selected files
- `com.apple.security.files.bookmarks.app-scope` — App uses security-scoped bookmarks
- `com.apple.security.temporary-exception.*` — Temporary exceptions (will draw scrutiny)

### iOS Capabilities That Add Entitlements
- Push Notifications → `aps-environment`
- HealthKit → `com.apple.developer.healthkit`
- Sign in with Apple → `com.apple.developer.applesignin`
- iCloud → `com.apple.developer.icloud-*`

## How to Detect

### Find entitlements files
```bash
# Find all entitlements files
find . -name "*.entitlements" -not -path "./.build/*"
```

### Parse entitlements
```bash
# List all declared entitlements
find . -name "*.entitlements" -not -path "./.build/*" -exec plutil -p {} \;
# or
find . -name "*.entitlements" -not -path "./.build/*" -exec cat {} \;
```

### Cross-reference with code usage
For each entitlement, verify the app actually uses the capability:

```bash
# Network server — is the app running a local server?
grep -rn "NWListener\|GCDWebServer\|Swifter\|Vapor\|HttpServer\|startServer" --include="*.swift" .

# Downloads folder access — does the app read/write Downloads?
grep -rn "Downloads\|downloadsDirectory\|FileManager.*downloads" --include="*.swift" .

# HealthKit — is HealthKit actually used?
grep -rn "HKHealthStore\|HealthKit\|health_kit" --include="*.swift" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" --include="*.vue" --include="*.svelte" --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=www --exclude-dir=build .
```

### Capacitor cross-check (iOS)

The App target entitlements file is usually `ios/App/App/App.entitlements`. Match each key to a plugin and a reachable feature:

| Entitlement | Expected evidence in a Capacitor app |
|---|---|
| `aps-environment` | `@capacitor/push-notifications` or another push plugin in `package.json`, and code that calls `register()` |
| `com.apple.developer.associated-domains` | Universal links: `applinks:` domains with a live `apple-app-site-association` file and an `appUrlOpen` handler |
| `com.apple.developer.applesignin` | Sign in with Apple button reachable in the UI (for example `@capgo/capacitor-social-login` with `provider: 'apple'`) |
| `com.apple.developer.healthkit` | A HealthKit plugin in `package.json` and screens that read/write health data |
| `com.apple.developer.icloud-*` / `ubiquity-*` | iCloud storage plugin or native code using CloudKit / iCloud Documents |
| `com.apple.developer.in-app-payments` | Apple Pay merchant ID and an Apple Pay flow |
| `com.apple.security.application-groups` | Widget, share extension, or notification service extension that shares data |

```bash
plutil -p ios/App/App/App.entitlements
node -e "const p=require('./package.json');console.log(Object.keys({...p.dependencies,...p.devDependencies}).filter(n=>/push|social|health|icloud|pay|widget/i.test(n)).join('\n'))"
```

Capabilities left over from a template, a removed plugin, or a Cordova migration are the most common source of this request.

### Automated audit
```bash
# List entitlements from the built app
codesign -d --entitlements :- /path/to/YourApp.app
```

## Resolution
1. **Remove unused entitlements**: Open the `.entitlements` file in Xcode and remove keys for capabilities you don't use
2. **Remove unused capabilities**: In Xcode → Target → Signing & Capabilities, remove capabilities you don't need
3. **If the entitlement IS needed**: Reply to Apple in App Store Connect explaining how and where the app uses each flagged entitlement
4. **Rebuild and resubmit**: After removing entitlements, Developer Reject the current submission, rebuild, and upload a new binary

## Example Rejection
> **Guideline 2.4.5(i) - Performance**
>
> Issue Description
>
> In order to continue reviewing the app, we require additional information.
>
> The app uses one or more entitlements which do not appear to have matching functionality within the app. Please reply to this message in App Store Connect and describe how and where the app uses the following entitlements.
>
> ---
> • com.apple.security.network.server
> • com.apple.security.files.downloads.read-only
> ---
>
> Resources
>
> Learn more about Mac App Store requirements in guideline 2.4.5.
