# `build request` Options

Source: `npx @capgo/cli@latest build request --help` (CLI 8.77) and https://capgo.app/docs/builder/configuration/. Precedence for most options: CLI flag, then environment variable, then saved credentials.

## Core

| Flag | Notes |
| --- | --- |
| `[appId]` | Positional. Inferred from `capacitor.config` when omitted |
| `--platform ios\|android` | Required in CI. An interactive terminal prompts for it |
| `--path <dir>` | Project directory (default `.`) |
| `--build-mode debug\|release` | Default `release` |
| `--node-modules <paths>` | Monorepo node_modules (comma-separated) |
| `--verbose` | Detailed logs |
| `-a, --apikey <key>` | Overrides `CAPGO_TOKEN` and saved keys |

## iOS

| Flag | Env | Notes |
| --- | --- | --- |
| `--ios-scheme <s>` / `--ios-target <t>` | `CAPGO_IOS_SCHEME` / `CAPGO_IOS_TARGET` | Default `App` |
| `--ios-distribution app_store\|ad_hoc` | `CAPGO_IOS_DISTRIBUTION` | `ad_hoc` skips store upload |
| `--ios-provisioning-profile <path or bundleId=path>` | `CAPGO_IOS_PROVISIONING_MAP` | Repeatable, one per signable target |
| `--build-certificate-base64` / `--p12-password` | `BUILD_CERTIFICATE_BASE64` / `P12_PASSWORD` | |
| `--apple-key-id` / `--apple-issuer-id` / `--apple-key-content` | `APPLE_KEY_ID` / `APPLE_ISSUER_ID` / `APPLE_KEY_CONTENT` | `.p8` as base64 |
| `--app-store-connect-team-id` | `APP_STORE_CONNECT_TEAM_ID` | |
| `--apple-id` + `--apple-app-specific-password` + `--apple-app-id` | `FASTLANE_USER` / `FASTLANE_APPLE_APPLICATION_SPECIFIC_PASSWORD` / `APPLE_APP_ID` | Alternative to the ASC API key for TestFlight upload. All three are required together |
| `--xcode-version <v>` | `CAPGO_IOS_XCODE_VERSION` | `26` accepts any 26.x. Default: any machine |
| `--no-cache` / `--cache-key <k>` | | Xcode compilation cache control |
| `--ios-testflight-groups <names>` | | External TestFlight groups |
| `--ios-automatic-release` / `--no-ios-automatic-release` | | Release after approval (default manual) |
| `--sync-ios-version` | | Copies the `package.json` version into `MARKETING_VERSION` / `CFBundleShortVersionString` |

Standalone version check: `npx @capgo/cli@latest build sync-ios-version --path . --check` exits non-zero when the versions are out of sync.

## Android

| Flag | Env | Notes |
| --- | --- | --- |
| `--android-keystore-file` (base64) | `ANDROID_KEYSTORE_FILE` | |
| `--keystore-key-alias` | `KEYSTORE_KEY_ALIAS` | Default `key0` |
| `--keystore-key-password` / `--keystore-store-password` | `KEYSTORE_KEY_PASSWORD` / `KEYSTORE_STORE_PASSWORD` | The key password falls back to the store password |
| `--play-config-json` (base64) | `PLAY_CONFIG_JSON` | Service account for Play upload |
| `--android-flavor <f>` | | Required when there are several flavors |
| `--android-track internal\|alpha\|beta\|production` | `PLAY_STORE_TRACK` | Default `internal` |
| `--android-release-status draft\|completed\|inProgress\|halted` | `PLAY_STORE_RELEASE_STATUS` | Default `draft` |
| `--in-app-update-priority 0-5` | | Play in-app update priority |
| `--no-playstore-upload` | | Requires `--output-upload` |
| `--sync-android-version` | | Copies the `package.json` version into `versionName`. Fails unless it is a plain quoted literal |

## Store submission (both platforms)

| Flag | Notes |
| --- | --- |
| `--submit-to-store-review` | Android: `production` track, `completed` status unless overridden. iOS: submits the processed build to App Store review |
| `--store-release-name <v>` | Play `version_name`, or the App Store version |
| `--store-release-notes <text>` | Default notes / What's New |
| `--store-release-notes-locale en-US="..."` | Repeatable |

Ask the user before you add `--submit-to-store-review`. It pushes a release toward real users.

## Output

| Flag | Notes |
| --- | --- |
| `--output-upload` / `--no-output-upload` | Time-limited IPA/APK/AAB link and QR code |
| `--output-retention 1h..7d` | Link TTL |
| `--output-record <path>` | Writes JSON (`jobId`, `status`, `outputUrl`, `qrCodeAscii`, `qrCodePngPath`, `finishedAt`) plus `<path>.qr.png` |

Read it back with `npx @capgo/cli@latest build last-output --path <path> [--field outputUrl | --qr]`.

## Versioning

| Flag | Notes |
| --- | --- |
| `--skip-build-number-bump` / `--no-skip-build-number-bump` | Auto-increment is on by default |
| `--skip-marketing-version-bump` / `--no-skip-marketing-version-bump` | Marketing version bump applies when the app is already released |

## Prescan and diagnostics

| Flag | Notes |
| --- | --- |
| `--prescan-skip <id[,id]>` | Skip specific checks (for example `ios/capacitor-server-url-shipped`) |
| `--prescan-warn <id[,id]>` | Downgrade checks to warnings |
| `--prescan-ignore-fatal` | Report only |
| `--no-prescan` | Skip the whole scan (avoid) |
| `--fail-on-warnings` | Treat warnings as fatal |
| `--ai-analytics` | Send failure logs to Capgo AI for diagnosis |
| `--send-logs-to-support` | Upload failure logs to Capgo support (`--send-logs` is a deprecated alias) |

Full prescan catalog: https://capgo.app/docs/builder/prescan/
