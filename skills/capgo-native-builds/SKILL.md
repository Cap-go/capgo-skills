---
name: capgo-native-builds
description: Use for Capgo Cloud Build native iOS and Android workflows, including CLI login, API-key handling, iOS build onboarding, signing credential storage, build requests, store upload settings, output download links, and troubleshooting. Do not use for OTA bundle uploads or generic Capacitor setup unless a native Capgo build is requested.
---

# Capgo Native Builds

Use this skill when the user wants Capgo to build native iOS or Android binaries in the cloud.

## When to Use This Skill

- The user asks for a Capgo Cloud Build, native build, signed IPA/APK/AAB, TestFlight/App Store build, Play Store build, or temporary build download link.
- The user needs Capgo CLI login, build API-key setup, or help choosing between `login`, `CAPGO_TOKEN`, and `-a, --apikey`.
- The user needs iOS build onboarding, Apple signing setup, Android keystore setup, Play service account setup, or credential rotation.
- The user asks about `build init`, `build request`, `build credentials save`, `build credentials update`, `build credentials list`, `build credentials clear`, or `build credentials migrate`.

Do not use this skill for JavaScript-only OTA update uploads, generic CI/CD setup, or local native builds that do not involve Capgo Cloud Build.

## Operating Rules

- Use `npx @capgo/cli@latest` in user-facing commands.
- Treat API keys, P12 passwords, keystore passwords, App Store Connect keys, and Play service account JSON as secrets. Use placeholders in examples and do not echo secret values back to the user.
- Prefer Capgo CLI build flows before inventing custom CI scripts.
- Confirm the platform, app ID, project path, desired output destination, and whether the user wants store upload or a temporary download link.
- Credentials are stored locally by the CLI and are only sent to Capgo for the build job. They are not stored permanently on Capgo servers and are deleted after the build process.

## First Checks

Before requesting a build, verify:

- The project is a Capacitor app and has the native folder for the target platform (`ios/` or `android/`).
- The Capgo app exists. If needed, add it first:

```bash
npx @capgo/cli@latest app add com.example.app
```

- The user has a Capgo API key with permission to trigger native builds for the app.
- Signing credentials exist or the workflow will create/save them before `build request`.
- The output destination is clear:
  - Store upload: provide App Store Connect credentials for iOS or Play config for Android.
  - Download link only: use `--output-upload`, optionally with `--output-retention <duration>`.

## Authentication and Login

Use `login` when the machine should remember the Capgo API key:

```bash
npx @capgo/cli@latest login
npx @capgo/cli@latest login YOUR_API_KEY
npx @capgo/cli@latest login --local YOUR_API_KEY
```

Authentication precedence for build commands:

1. `-a, --apikey <apikey>` on the command.
2. `CAPGO_TOKEN` environment variable.
3. Global key saved by `login` in `~/.capgo`.
4. Local key saved by `login --local` in `.capgo`.

Use `CAPGO_TOKEN` for CI secrets. Use `-a, --apikey` when creating a single copy-pasteable command for onboarding or support. Use `login --local` only when the key should stay scoped to this repository; verify `.capgo` is ignored by git.

## Recommended Build Flows

### iOS Fast Path: `build init`

For a first iOS cloud build, prefer the interactive onboarding command:

```bash
npx @capgo/cli@latest build init
```

If no key is saved, pass one explicitly:

```bash
npx @capgo/cli@latest build init -a YOUR_API_KEY
```

`build init` also has the alias `build onboarding`. It is best when the user wants the CLI to create and save iOS signing material with the fewest manual steps.

What it handles:

- Verifies the App Store Connect API key.
- Creates or reuses Apple signing assets where possible.
- Registers or reuses the bundle ID.
- Creates App Store provisioning profiles.
- Saves build credentials into the same local store used by `build request`.
- Can request the first cloud build at the end.
- Persists onboarding progress under `~/.capgo-credentials/onboarding/` so the user can resume.
- Saves recovery/support material under `~/.capgo-credentials/support/` after unexpected failures.

Use manual credential commands instead when the user already has certificates, profiles, or CI secrets prepared.

### Manual iOS Credential Save

Use this when the user already has Apple signing files:

```bash
npx @capgo/cli@latest build credentials save --appId com.example.app --platform ios \
  --certificate ./cert.p12 --p12-password "P12_PASSWORD" \
  --ios-provisioning-profile ./profile.mobileprovision \
  --apple-key ./AuthKey_KEYID.p8 --apple-key-id "KEY_ID" \
  --apple-issuer-id "ISSUER_UUID" --apple-team-id "TEAM_ID"
```

For apps with extensions or multiple targets, repeat `--ios-provisioning-profile` and map each bundle ID:

```bash
npx @capgo/cli@latest build credentials save --appId com.example.app --platform ios \
  --ios-provisioning-profile com.example.app=./App.mobileprovision \
  --ios-provisioning-profile com.example.app.widget=./Widget.mobileprovision
```

For ad-hoc iOS builds, set the distribution mode and collect the IPA with `--output-upload`:

```bash
npx @capgo/cli@latest build credentials save --appId com.example.app --platform ios \
  --ios-distribution ad_hoc \
  --certificate ./cert.p12 \
  --ios-provisioning-profile ./adhoc.mobileprovision \
  --output-upload
```

### Manual Android Credential Save

Use this when the user already has Android signing files:

```bash
npx @capgo/cli@latest build credentials save --appId com.example.app --platform android \
  --keystore ./release.jks --keystore-alias "release-key" \
  --keystore-key-password "KEY_PASSWORD" \
  --keystore-store-password "STORE_PASSWORD" \
  --play-config ./service-account.json
```

If the user only needs an APK/AAB download link and not Play upload, save `--output-upload` and omit or override Play upload:

```bash
npx @capgo/cli@latest build credentials save --appId com.example.app --platform android \
  --keystore ./release.jks --keystore-alias "release-key" \
  --keystore-key-password "KEY_PASSWORD" \
  --keystore-store-password "STORE_PASSWORD" \
  --output-upload
```

Use `--android-flavor <flavor>` when the Android project has multiple product flavors.

### Request a Build

Use `build request [appId]` after login and credentials are ready:

```bash
npx @capgo/cli@latest build request com.example.app --platform ios --path .
npx @capgo/cli@latest build request com.example.app --platform android --path .
```

Useful request options:

- `--platform ios|android`: required.
- `--path <path>`: project directory, default is the current directory.
- `--node-modules <paths>`: comma-separated `node_modules` paths for monorepos.
- `--build-mode debug|release`: defaults to release.
- `--ios-scheme <scheme>` and `--ios-target <target>` for custom Xcode projects.
- `--ios-distribution app_store|ad_hoc`.
- `--android-flavor <flavor>` for Android product flavors.
- `--output-upload` to create temporary IPA/APK/AAB download links.
- `--output-retention <duration>` from `1h` to `7d`.
- `--no-playstore-upload` to skip Play upload for an Android build. This requires `--output-upload`.
- `--skip-build-number-bump` when the project owns native build numbers itself.
- `--verbose` for support/debugging.

Example: collect an iOS ad-hoc IPA link:

```bash
npx @capgo/cli@latest build request com.example.app \
  --platform ios \
  --ios-distribution ad_hoc \
  --output-upload \
  --output-retention 2d
```

Example: Android flavor with a download link instead of Play upload:

```bash
npx @capgo/cli@latest build request com.example.app \
  --platform android \
  --android-flavor production \
  --output-upload \
  --no-playstore-upload
```

## Credential Management

Build credentials are stored globally in `~/.capgo-credentials/credentials.json` by default. Add `--local` to use `.capgo-credentials.json` in the project root. Never commit either credentials file.

List masked saved credentials:

```bash
npx @capgo/cli@latest build credentials list
npx @capgo/cli@latest build credentials list --appId com.example.app
npx @capgo/cli@latest build credentials list --local
```

Update only changed fields:

```bash
npx @capgo/cli@latest build credentials update --appId com.example.app --platform ios \
  --ios-provisioning-profile ./new-profile.mobileprovision

npx @capgo/cli@latest build credentials update --appId com.example.app --platform android \
  --keystore ./new-release.jks
```

For iOS provisioning profile updates:

- By default, new `--ios-provisioning-profile` entries are merged into the existing map.
- Use `--overwrite-ios-provisioning-map` only when replacing the whole mapping intentionally.

Migrate legacy iOS provisioning credentials:

```bash
npx @capgo/cli@latest build credentials migrate --appId com.example.app --platform ios
```

Clear credentials only when the user wants removal:

```bash
npx @capgo/cli@latest build credentials clear --appId com.example.app --platform ios
npx @capgo/cli@latest build credentials clear --local
```

## CI Guidance

For CI, prefer secrets in environment variables instead of local credential files:

```bash
CAPGO_TOKEN=YOUR_CAPGO_TOKEN \
BUILD_CERTIFICATE_BASE64=BASE64_P12 \
P12_PASSWORD=P12_PASSWORD \
APPLE_KEY_ID=KEY_ID \
APPLE_ISSUER_ID=ISSUER_UUID \
APPLE_KEY_CONTENT=BASE64_P8 \
APP_STORE_CONNECT_TEAM_ID=TEAM_ID \
CAPGO_IOS_PROVISIONING_MAP=PROVISIONING_MAP_JSON \
npx @capgo/cli@latest build request com.example.app --platform ios
```

Android CI commonly uses:

- `CAPGO_TOKEN`
- `ANDROID_KEYSTORE_FILE`
- `KEYSTORE_KEY_ALIAS`
- `KEYSTORE_KEY_PASSWORD`
- `KEYSTORE_STORE_PASSWORD`
- `PLAY_CONFIG_JSON` or `--output-upload`

Use repository or CI secret storage. Do not commit signing files or generated credential JSON.

## Troubleshooting

- `No Capgo API key found`: run `npx @capgo/cli@latest login`, set `CAPGO_TOKEN`, or pass `-a YOUR_API_KEY`.
- `Insufficient permissions`: verify the API key can access the app and includes native build permission.
- Missing output destination: add store upload credentials or enable `--output-upload`.
- No download link: request or save credentials with `--output-upload` and set `--output-retention` if the default TTL is too short.
- iOS signing failure: verify certificate password, Apple Team ID, distribution mode, and every bundle ID to provisioning profile mapping.
- Legacy iOS provisioning profile error: run `npx @capgo/cli@latest build credentials migrate --appId com.example.app --platform ios`.
- Android signing failure: verify keystore path, alias, key password, store password, and product flavor.
- Play upload should be skipped: use `--output-upload --no-playstore-upload`.
- Monorepo dependency mismatch: pass the app-specific `--path` and `--node-modules` values.
- Need support evidence: rerun the failing command with `--verbose`.

## Supporting Docs

- Build command reference: `https://capgo.app/docs/cli/reference/build/`
- Login command reference: `https://capgo.app/docs/cli/reference/login/`
- Cloud Build getting started: `https://capgo.app/docs/cli/cloud-build/getting-started/`
- iOS build setup: `https://capgo.app/docs/cli/cloud-build/ios/`
- Android build setup: `https://capgo.app/docs/cli/cloud-build/android/`
- Credential management: `https://capgo.app/docs/cli/cloud-build/credentials/`
