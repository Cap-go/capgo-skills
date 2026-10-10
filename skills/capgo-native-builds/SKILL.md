---
name: capgo-native-builds
description: Use for Capgo Cloud Build (Capgo Build) native iOS and Android workflows, including CLI login and API-key precedence, `build init` onboarding, signing credential save/update/export, `build request` with TestFlight, App Store, or Play upload, temporary IPA/APK/AAB download links (`--output-upload`), prescan failures, `build needed` OTA-vs-native gating, and CI secrets. Use when errors mention "No credentials found for this app and platform", "Legacy provisioning profile format detected", "Missing required argument: --platform", or prescan check ids. Do not use for OTA bundle uploads (capgo-release-management), updater plugin setup (capgo-live-updates), or local Xcode/Gradle builds and generic CI runners (capacitor-ci-cd).
---

# Capgo Native Builds

Build signed iOS and Android binaries on Capgo Cloud Build and deliver them to the stores or to a temporary download link.

Facts below were checked against `@capgo/cli` 8.77 and https://capgo.app/docs/builder/ (October 2026). The CLI describes native cloud builds as "limited beta".

## When to Use

TRIGGER when:

- The user asks for a Capgo Cloud Build, a native build in the cloud, a signed IPA/APK/AAB, a TestFlight, App Store, or Play upload through Capgo, or a temporary build download link or QR code.
- The user runs or asks about `build init`, `build request`, `build prescan`, `build needed`, `build last-output`, `build sync-ios-version`, or any `build credentials ...` subcommand.
- A Capgo build fails on signing, provisioning, keystore, prescan, or store upload.

Do not use when:

- Only JavaScript/web assets change. That is an OTA release: use `capgo-release-management`, or `capgo-live-updates` for plugin wiring.
- The user builds locally in Xcode or Gradle, or on their own CI runners without Capgo Build. Use `capacitor-ci-cd`.
- The user needs store listing, metadata, or review prep. Use `capacitor-app-store` and `capacitor-apple-review-preflight`.
- The user is upgrading Capacitor itself. Use `capacitor-app-upgrades`.

## Reference Index

Only load a reference when its topic is in play.

| File | Load when |
| --- | --- |
| `references/request-options.md` | Building the exact `build request` flags: store submission, tracks, release notes, versioning, cache, Xcode version, prescan flags |
| `references/credentials-and-ci.md` | Saving, updating, exporting, or migrating credentials, and pushing them into CI secrets |

## Operating Rules

- Use `npx @capgo/cli@latest` in user-facing commands.
- API keys, P12 passwords, keystore passwords, `.p8` keys, and Play service-account JSON are secrets. Use placeholders only in new generic examples. Never replace values the user already supplied with placeholders unless they ask. Never echo secrets back. Do not suggest rotation unless the user asks.
- Credentials are stored locally (`~/.capgo-credentials/credentials.json`, or `.capgo-credentials.json` with `--local`). They are uploaded only for the build job, and the temporary server copies are deleted when the build finishes. Never commit either file.
- Confirm these before requesting: platform, app ID, project path, flavor or scheme, and destination (store upload, download link, or both).

## Auth and API-key precedence

The CLI resolves the key in this order:

1. `-a, --apikey <key>` on the command
2. The `CAPGO_TOKEN` environment variable
3. `~/.capgo`, the global key saved by `npx @capgo/cli@latest login <key>`
4. `./.capgo`, the project key saved by `login --local <key>`

Trap: a global key **wins over** a project-local key. If a repository must use a different org's key, pass `-a` or set `CAPGO_TOKEN`. Make sure `.capgo` is git-ignored.

## Procedure

### 1. Inspect

- `ls ios android` and confirm the target native folder exists and `npx cap sync <platform>` has run.
- Read `capacitor.config.*` for `appId`. It must match the iOS bundle ID and Android `applicationId` (prescan check `shared/bundle-id-consistency`).
- iOS: check the Xcode scheme and target names (default `App`) and any extensions that need their own provisioning profiles.
- Android: check `android/app/build.gradle` for `productFlavors`. If there is more than one flavor, `--android-flavor` is required.
- Check that the app exists: `npx @capgo/cli@latest app list`. Add it with `npx @capgo/cli@latest app add com.example.app`.

### 2. Decide whether a native build is needed at all

```bash
npx @capgo/cli@latest build needed com.example.app --channel production
# prints "yes" and exits 1 -> native build required
# prints "no" and exits 0 -> ship OTA instead
# exits 2 -> the command itself failed
```

It compares native package metadata only. Raw edits under `ios/` or `android/` still need a native build.

### 3. Set up credentials

First build, interactive (preferred):

```bash
npx @capgo/cli@latest build init        # alias: build onboarding
```

- iOS: verifies or creates the App Store Connect API key, then creates or reuses the certificate, bundle ID, and App Store provisioning profiles. It saves everything locally and can fire the first build. Progress persists under `~/.capgo-credentials/onboarding/`, so the user can resume.
- Android: sets up the keystore. Google OAuth then provisions a GCP service account and sends the Play Console invite.
- macOS helper for the `.p8` key: `npx @capgo/cli@latest build credentials apple-key --appId com.example.app`.

When the user already has signing files, use `build credentials save` instead. See `references/credentials-and-ci.md`.

### 4. Pre-flight

```bash
npx @capgo/cli@latest build prescan com.example.app --platform ios
```

Prescan runs automatically inside `build request`. Run it alone to fix problems before you upload anything. If one finding is intentional, skip only that check: `--prescan-skip <check-id>`. Avoid `--no-prescan`.

### 5. Request the build

```bash
# App Store / TestFlight (default ios distribution app_store)
npx @capgo/cli@latest build request com.example.app --platform ios --path .

# Android to Play internal track (default track internal, status draft)
npx @capgo/cli@latest build request com.example.app --platform android --path .

# Artifact only, no store upload
npx @capgo/cli@latest build request com.example.app --platform ios --ios-distribution ad_hoc --output-upload --output-retention 2d
npx @capgo/cli@latest build request com.example.app --platform android --no-playstore-upload --output-upload
```

The `--output-retention` range is `1h` to `7d`. The default TTL saved in credentials is `1h`.

## Traps

- **Xcode / Capacitor 9:** the Capgo Build docs list macOS Tahoe 26.2 with Xcode 26.2. You can pin with `--xcode-version <major[.minor]>` (or `CAPGO_IOS_XCODE_VERSION`). Capacitor 9 needs Xcode 27+. Capgo's docs and CLI 8.77 do not confirm an Xcode 27 builder. Before promising a Capacitor 9 iOS cloud build, check with `--xcode-version 27` or current docs.
- **`--no-playstore-upload` requires `--output-upload`**. Otherwise the build has no destination.
- **Ad hoc iOS** skips the store. Use it with `--output-upload` when the App Store record does not exist yet.
- **`--submit-to-store-review`** changes the Android defaults to the `production` track with status `completed`. Confirm with the user before you add it.
- **Build numbers auto-increment** by default. If the project owns build numbers, add `--skip-build-number-bump`. Marketing versions can also auto-bump (`--skip-marketing-version-bump` turns this off).
- **Build timeout** defaults to 15 minutes. Raise it with `npx @capgo/cli@latest app set com.example.app --build-timeout-minutes 60` (range 5 to 360).
- **`server.url` left in `capacitor.config`** (live reload) fails prescan `ios/capacitor-server-url-shipped` for store builds. Remove it rather than skipping the check.

## Verification

1. `npx @capgo/cli@latest build credentials list --appId com.example.app` shows masked credentials for the target platform.
2. `npx @capgo/cli@latest build prescan com.example.app --platform <p> --fail-on-warnings` exits 0.
3. `build request` ends with a success status. With `--output-upload` it prints a download link and QR code. With `--output-record /tmp/build.json`, check `npx @capgo/cli@latest build last-output --path /tmp/build.json --field outputUrl`.
4. Store path: the build appears in TestFlight or the Play Console track you chose.
5. Install the artifact on a device and check the version and build number.

## Error Handling

| String / symptom | Fix |
| --- | --- |
| `No Capgo API key found. Run ... first, then retry this command.` | `npx @capgo/cli@latest login`, set `CAPGO_TOKEN`, or pass `-a` |
| `Insufficient permissions for <key>` / prescan `shared/apikey-permission` | The key's role cannot request native builds for this app or org. Use a key with build rights |
| `Missing required argument: --platform <ios\|android>` | Add `--platform ios` or `--platform android` |
| `❌ No credentials found for this app and platform` | Run `build init` or `build credentials save --appId <id> --platform <p> ...`. Check `--local` versus the global store |
| `Legacy provisioning profile format detected. Run: npx @capgo/cli build credentials migrate --platform ios` | Run `npx @capgo/cli@latest build credentials migrate --platform ios` |
| `Missing argument, you need to provide a appId, or be in a capacitor project` | Pass the app ID positionally or run from the app root |
| `output-retention must be a number with optional unit: s, m, h, d` | Use `1h`, `6h`, `2d`, and so on (max `7d`) |
| Prescan `ios/cert-profile-pairing` / `ios/profile-type-vs-mode` | The profile does not embed the certificate or does not match `app_store`/`ad_hoc`. Regenerate it with `build credentials ios-provisioning` |
| Prescan `ios/targets-covered` | An extension has no profile. Add `--ios-provisioning-profile <bundleId>=<path>` |
| Android "Key alias not found" / wrong password | Check the alias and passwords. If they differ, pass both `--keystore-key-password` and `--keystore-store-password` |
| Multiple flavors error | Add `--android-flavor <flavor>` |
| Need diagnosis | Re-run with `--verbose`. `--ai-analytics` sends the failure logs to Capgo AI. `--send-logs-to-support` sends them to support |

More fixes: https://capgo.app/docs/builder/troubleshooting/

## Supporting Docs

- Build reference: https://capgo.app/docs/cli/reference/build/
- Getting started: https://capgo.app/docs/builder/getting-started/
- iOS: https://capgo.app/docs/builder/ios/ · Android: https://capgo.app/docs/builder/android/
- Credentials: https://capgo.app/docs/builder/credentials/ · Prescan: https://capgo.app/docs/builder/prescan/
- OTA vs native in CI: https://capgo.app/docs/builder/ci-ota-or-native/
