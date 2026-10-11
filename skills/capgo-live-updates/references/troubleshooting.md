# Live Update Troubleshooting

Docs: https://capgo.app/docs/plugins/updater/commonproblems/ · https://capgo.app/docs/getting-started/troubleshooting/ · https://capgo.app/docs/plugins/updater/known-issues/

## Triage order

1. Run `npx @capgo/cli@latest doctor`. It reports the plugin and CLI versions and setup issues.
2. Run `npx @capgo/cli@latest probe --platform ios|android`. It sends one update request with this project's config and says whether an update would be served, and why not.
3. Run `npx @capgo/cli@latest app debug com.example.app [--device DEVICE_ID]` while you background and reopen the app on a real device.
4. Read the native logs. Filter for `CapacitorUpdater` in Xcode or Console.app on iOS, and use `adb logcat | grep -i capgo` on Android. Use `ios-android-logs` for the commands.
5. Check the device in the dashboard (Devices tab) for its channel, bundle, and platform.

## Backend error codes (`getLatest().error`, `app debug`)

| Code | Meaning | Fix |
| --- | --- | --- |
| `no_new_version_available` | Already current | Nothing, this is normal |
| `disable_auto_update_to_major` | Channel blocks major jumps. A baseline of `0.0.0` usually means `version` is unset | Set `plugins.CapacitorUpdater.version` to the native major, sync, rebuild. Or relax with `--disable-auto-update` |
| `disable_auto_update_to_minor` / `_to_patch` | Stricter strategy than the jump | Upload a compatible version or change the strategy |
| `disable_auto_update_to_metadata` | Baseline below `min_update_version` | Align `version` or adjust `--min-update-version` |
| `disable_auto_update_under_native` | Bundle version is lower than the native version | Upload a version >= native, or allow `--downgrade` |
| `cannot_update_via_private_channel` | Channel does not allow self-assignment | `channel set <ch> --self-assign` or use another channel |
| `unknown_version_build` / `semver_error` | Baseline version missing or not semver | Set a valid `version`, sync, rebuild |
| `unsupported_plugin_version` | Plugin too old for the backend | Upgrade `@capgo/capacitor-updater` (matching major), `npx cap sync`, rebuild |
| `disabled_platform_ios` / `disabled_platform_android` | Platform off on the channel | `channel set <ch> --ios` / `--android` |
| `disable_prod_build` / `disable_dev_build` / `disable_device` / `disable_emulator` | Build or runtime type blocked | Align the `--prod`/`--dev`/`--device`/`--emulator` flags |
| `key_id_mismatch` | Bundle encrypted with a different key than the app's `publicKey` | Re-run `key save` with the matching key, rebuild, or re-upload |
| `no_channel` / `null_channel_data` | No channel resolved | Set a cloud default, a `defaultChannel`, or a device override |
| `on_premise_app` (HTTP 429) | App ID unknown, flagged on-prem, or plan cancelled | Check that `appId` matches the dashboard exactly (case-sensitive). Run `app add` if missing |
| `provider_infrastructure_request_blocked` | Request came from a Google or Apple datacenter IP while blocking is on | Test from a real device network, or toggle the app setting (`app set --no-block-provider-infra-requests`) |

## Symptoms

| Symptom | Likely cause |
| --- | --- |
| Downloads, then reverts on the next launch | `notifyAppReady()` missing, late, or the bundle throws before it. Check `getFailedUpdate()` |
| Rollback loop | The new bundle crashes at boot. Fix it and upload a new version, or relink the previous bundle with `channel set <ch> --bundle <prev>` |
| Update never shows | Default `atBackground` applies only after a background and foreground cycle. Kill and reopen, or background the app |
| Works on Android, not iOS | Channel `--no-ios`, or `PrivacyInfo.xcprivacy` is missing the UserDefaults reason `CA92.1` |
| Dev builds never update | Channel blocks dev or emulator devices (`--dev`, `--emulator`) |
| Testing with live reload | The updater ignores live-reload servers. Test a real build |
| Android: cannot download over HTTP | Cleartext is blocked. Use HTTPS (`allowHttpsToHttpRedirect` stays `false`) |

## Upload-side errors (CLI)

| String | Fix |
| --- | --- |
| `notifyAppReady() is missing in the build folder (...)` | Add the call to the entry point, rebuild |
| `index.html is missing in the root folder of <dir>` | Point `--path` at the built `webDir` |
| `❌ Version X already exists` | Bump the version, or `--auto-bump` / `--version-exists-ok` |
| `Cannot upload the same bundle content` | The same checksum is already on the channel. Change the content or pass `--ignore-checksum-check` |
| `Bundle NOT compatible with <channel> channel` | Native deps changed. Ship a native build, or `--accept-incompatible` if guarded |
| `No Capgo API key found. Run ... first, then retry this command.` | `npx @capgo/cli@latest login`, set `CAPGO_TOKEN`, or pass `-a` |
| `Insufficient permissions for <key>` | The API key role is too low for the app or org |
| `Plan upgrade required for upload` | Billing: upgrade at console.capgo.app |
| `Cannot upload bundle ( try again with --tus option)` | Retry with `--tus`. For large bundles, raise `--timeout` |
