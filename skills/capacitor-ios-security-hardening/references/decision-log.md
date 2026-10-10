# Decision Log

Keep one file under source control that records every security build-setting decision. A good default path is `ios/xcode-security-settings.md`. Ask the user if the repo keeps docs somewhere else.

## Rules

- Append or update only. Never delete entries.
- When a status changes (for example Deferred to Enabled), move the entry and keep the old reason as context.
- Every Disabled or Deferred entry needs a reason that says what would have to change.
- Record blocking dependencies by name and version, so the next upgrade can re-check them.
- Keep the user's own notes and section order.

## Template

```markdown
# iOS Security Build Settings

Decisions for <app name> (Capacitor <version>, <SPM|CocoaPods>). Last audit: <YYYY-MM-DD>.

## Enabled
- `ENABLE_ENHANCED_SECURITY` (project level)
- `com.apple.security.hardened-process` entitlements on App
- `CLANG_ANALYZER_SECURITY_INSECUREAPI_STRCPY`

## Disabled
- `ENABLE_POINTER_AUTHENTICATION = NO` on App: `<VendorSDK> 4.2` xcframework has no arm64e slice.
  Re-check on each SDK upgrade with `lipo -archs`.
- `ENABLE_USER_SCRIPT_SANDBOXING = NO`: CocoaPods embed script fails under the sandbox.
  Revisit after the SPM migration.

## Deferred
- `com.apple.security.hardened-process.checked-allocations`: needs a TestFlight soft-mode round on an A19+ device.
- `CLANG_WARN_SUSPICIOUS_IMPLICIT_CONVERSION`: noisy in vendored C code.
```
