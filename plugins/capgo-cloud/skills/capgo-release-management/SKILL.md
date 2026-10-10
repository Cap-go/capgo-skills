---
name: capgo-release-management
description: Runs Capgo OTA release operations with the CLI, including `bundle upload` (channels, delta, rollout, encryption, version bumps), `bundle compatibility` and `releaseType` checks, `channel add/set/promote/currentBundle/delete`, progressive rollouts and rollback, `bundle cleanup`, preview QR codes, and `key create/save` encryption setup. Use when the user ships, promotes, rolls back, or cleans up Capgo bundles, or hits upload errors such as "Version X already exists", "Bundle NOT compatible with <channel> channel", or "Cannot upload the same bundle content". Do not use for updater plugin wiring in app code (capgo-live-updates), native binaries (capgo-native-builds), or org/member administration (capgo-organization-management).
---

# Capgo Release Management

Ship, promote, roll back, and clean up Capgo OTA bundles from the CLI.

Facts below were checked against `@capgo/cli` 8.77 (October 2026). Every command accepts `-a, --apikey`. The `appId` can be omitted inside a Capacitor project.

## When to Use

TRIGGER when:

- The user uploads, lists, deletes, or cleans up bundles, or asks which version a channel serves.
- The user creates or configures channels, promotes staging to production, starts, pauses, or rolls back a progressive rollout, or rolls back a bad release.
- The user asks whether a change is OTA-safe (`bundle compatibility`, `bundle releaseType`).
- The user sets up bundle encryption (`key create`, `key save`, `--key-v2`).

Do not use when:

- The work is app-side updater code or config (`notifyAppReady`, `autoUpdate`, `setChannel`). Use `capgo-live-updates`.
- A native binary is needed. Use `capgo-native-builds`.
- The user manages organizations, members, 2FA, or API-key policy. Use `capgo-organization-management`.
- The user wants an end-to-end release pipeline design. Use `capgo-release-workflows`.

## Command Map

| Goal | Command |
| --- | --- |
| Upload and link | `bundle upload [appId] --path ./dist --channel production` (comma-separate several channels) |
| Is it OTA-safe? | `bundle releaseType [appId] --channel production` prints `OTA` or `native` |
| Detailed native diff | `bundle compatibility [appId] --channel production [--text]` |
| What is live | `channel currentBundle production [appId] --quiet` |
| Promote | `channel promote staging production [appId]` |
| Roll back | `channel set production [appId] --bundle <previous-version>` |
| Rollout | `bundle upload ... --rollout 10`, then `channel set ... --rollout-percentage 50` / `--rollout-promote` / `--rollout-rollback` |
| Create channel | `channel add beta [appId] [--default] [--self-assign]` |
| Channel policy | `channel set <ch> --disable-auto-update major\|minor\|patch\|metadata\|none` plus `--ios/--android/--dev/--prod/--emulator/--device` toggles |
| List | `bundle list [appId]`, `channel list [appId]` |
| Clean up | `bundle cleanup [appId] --bundle 1.0 --keep 3` |
| Delete | `bundle delete <version> [appId]`, `channel delete <ch> [appId]` |
| Preview QR | `app set [appId] --preview` once, then `get-qr [appId] --channel beta` or `bundle upload ... --qr-preview` |
| Encryption keys | `key create`, `key save --key ./.capgo_key_v2.pub`, `key delete_old` |
| Custom zip / external | `bundle zip [appId] --json`, `bundle encrypt <zip> <checksum>`, `bundle upload --external <url>` |

All of these are `npx @capgo/cli@latest <command>`. Commands that do **not** exist (they come from old docs or other tools): `channel create`, `bundle revert`, `upload --sign`, `key verify`, and a top-level `capgo upload` without `bundle`.

## Procedure

### 1. Inspect first

```bash
npx @capgo/cli@latest channel list com.example.app
npx @capgo/cli@latest channel currentBundle production com.example.app --quiet
npx @capgo/cli@latest bundle releaseType com.example.app --channel production
```

Report the current live version and the OTA/native verdict before you change anything. If the verdict is `native`, stop and hand off to `capgo-native-builds` (or the user's native pipeline).

### 2. Upload

```bash
npm run build
npx @capgo/cli@latest bundle upload com.example.app --path ./dist --channel staging --comment "$(git rev-parse --short HEAD)"
```

- The version comes from `package.json` unless you pass `--bundle <semver>`. It must be unique, greater than `0.0.0`, and never a previously deleted version.
- Use `--delta` for instant-apply apps. The CLI refuses delta uploads with more than 10,000 files. Use `--no-delta` in that case.
- Use `--fail-on-incompatible` in CI. Use `--accept-incompatible` only when the JS guards missing plugins. These two flags and `--ignore-metadata-check` cannot be combined.

### 3. Promote and roll out

- Promote: `npx @capgo/cli@latest channel promote staging production com.example.app`. It runs the same compatibility checks as `channel set --bundle`.
- Gradual rollout: upload with `--rollout <pct>`, then watch the stats before you run `--rollout-promote`.
- Only change which channel is the **default** (`channel set <ch> --state default`, or `channel add --default`) when the user explicitly wants to move production traffic.

### 4. Roll back

```bash
npx @capgo/cli@latest bundle list com.example.app
npx @capgo/cli@latest channel set production com.example.app --bundle 1.4.2
# or, during a rollout:
npx @capgo/cli@latest channel set production com.example.app --rollout-rollback
```

Devices pick up the change on their next update check.

### 5. Encryption (optional, for sensitive apps)

```bash
npx @capgo/cli@latest key create        # writes .capgo_key_v2 (private) + .capgo_key_v2.pub, saves the public key to config
npx cap sync                             # the public key must ship in the native app
npx @capgo/cli@latest bundle upload com.example.app --key-v2 ./.capgo_key_v2 --channel production
```

In CI, pass `--key-data-v2 "$CAPGO_PRIVATE_KEY"`. Add `.capgo_key_v2` to `.gitignore` and never commit it. A changed key needs a new native build: devices with the old `publicKey` fail with `key_id_mismatch`.

## Traps

- On a channel that has a rollout configured, a plain `bundle upload --channel production` sets the **rollout target**, and stable is unchanged. Replace stable explicitly with `channel set --bundle`.
- `bundle cleanup --ignore-channel` also deletes the linked channels. Never add it without asking.
- `bundle delete` is permanent, and the deleted version cannot be reused. Prefer relinking an older bundle to roll back.
- `releaseType` only sees native package metadata, not raw `ios/` or `android/` edits.
- `--self-assign` on upload changes the channel's settings, not just this bundle.

## Verification

1. `npx @capgo/cli@latest channel currentBundle production com.example.app --quiet` prints the expected version.
2. `npx @capgo/cli@latest probe --platform ios` (run in the project) reports whether an update would be served.
3. `npx @capgo/cli@latest app debug com.example.app` shows a test device downloading and setting the bundle.
4. For encrypted uploads, a device on the new native build applies the update with no `key_id_mismatch` error.

## Error Handling

| String | Fix |
| --- | --- |
| `❌ Version X already exists` | Bump `--bundle`, use `--auto-bump patch`, or pass `--version-exists-ok` in CI re-runs |
| `Cannot upload the same bundle content` | The checksum is already on that channel. Rebuild with changes, or pass `--ignore-checksum-check` |
| `Bundle NOT compatible with <channel> channel` | Native packages differ. Do a native build first, or use `--accept-incompatible` if the code guards it |
| `notifyAppReady() is missing in the build folder (...)` | Fix the app entry point (see `capgo-live-updates`) |
| `index.html is missing in the root folder of <dir>` | Wrong `--path` |
| `Cannot find channel <name>` | Check `channel list`. Names are case sensitive |
| `Channel strategy <x> is not known` | Use `major`, `minor`, `patch`, `metadata`, or `none` |
| `No Capgo API key found. Run ... first, then retry this command.` | `npx @capgo/cli@latest login`, set `CAPGO_TOKEN`, or pass `-a` |
| `Insufficient permissions for <key>` | The API key role is too low for this app. Ask an admin for an upload-capable key |
| `Cannot upload bundle ( try again with --tus option)` | Retry with `--tus`, and raise `--timeout` for large bundles |

## Resources

- Bundle reference: https://capgo.app/docs/cli/reference/bundle/
- Channel reference: https://capgo.app/docs/cli/reference/channel/
- Progressive rollouts: https://capgo.app/docs/live-updates/progressive-rollouts/
- Encryption: https://capgo.app/docs/live-updates/encryption/
- Compatibility: https://capgo.app/docs/live-updates/compatibility/
