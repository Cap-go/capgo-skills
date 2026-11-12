# Build Credentials and CI

Docs: https://capgo.app/docs/builder/credentials/ · https://capgo.app/docs/builder/github-actions/

Storage: `~/.capgo-credentials/credentials.json` (global, the default) or `.capgo-credentials.json` in the project root (`--local`). Never commit either file.

## Supply signing credentials

For automation, inject the credential environment variables listed below from the user's secret manager or CI secret store into `build request`. Keep existing saved credentials when they already work. Never read their values into agent output.

The CLI's `build credentials save` accepts password arguments. Do not construct these commands with real passwords: expanding an environment variable into an argument still exposes its value in the process list, even when shell history contains only the variable name. Use the environment-variable build workflow instead. Check the installed CLI's help before relying on any interactive credential-entry feature.

Signing inputs:
- iOS: certificate, P12 password, provisioning map for every signable target, App Store Connect key, key/issuer IDs, and team ID.
- Android: keystore, alias, key/store passwords, and Play service-account JSON when store upload is requested.

Keep credential files outside version control with owner-only access. Select store upload or artifact output explicitly before requesting a build; neither credential setup nor a missing credential authorizes a store submission.

## Inspect, change, remove

```bash
npx @capgo/cli@latest build credentials list [--appId com.example.app] [--local]
npx @capgo/cli@latest build credentials update --appId com.example.app --platform ios --ios-provisioning-profile ./new.mobileprovision
npx @capgo/cli@latest build credentials update --local --keystore ./new-release.jks
npx @capgo/cli@latest build credentials ios-provisioning           # create or reuse profiles for every signable target
npx @capgo/cli@latest build credentials migrate --platform ios      # legacy BUILD_PROVISION_PROFILE_BASE64 -> CAPGO_IOS_PROVISIONING_MAP
npx @capgo/cli@latest build credentials manage [--appId ...] [--platform ...]   # TUI: view, export .env, delete
npx @capgo/cli@latest build credentials clear --appId com.example.app --platform ios
```

- On `update`, new `--ios-provisioning-profile` entries are **merged** into the existing map. Pass `--overwrite-ios-provisioning-map` only when you mean to replace the whole map.
- `clear` without `--appId` clears **all apps**. Always scope it, and only run it when the user asks for removal.

## Export a single value

Export only when the user asks, and let the user run it. Write to a file the user chose instead of printing the secret, so it never lands in the agent's output or the chat:

```bash
npx @capgo/cli@latest build credentials export APPLE_KEY_CONTENT --app-id com.example.app --platform ios --file ./AuthKey.p8 --decode-base64
```

`--file` never overwrites an existing file. Environment variables are never exported. `--raw` prints the value to the terminal: do not run it yourself and do not read its output.

## Push to GitHub Actions secrets

1. `gh secret set CAPGO_TOKEN` (paste the key when prompted. The API key is not in the credential store).
2. `npx @capgo/cli@latest build credentials manage --appId com.example.app`, then choose **Export to .env**. This writes `.env.capgo.<appId>` with mode `0600`.
3. `gh secret set -f .env.capgo.com.example.app`, then `gh secret list` to verify.
4. Delete the local `.env.capgo.*` file right after the upload. Never commit it and never read its contents into the chat.

## CI environment variable names

iOS: `BUILD_CERTIFICATE_BASE64`, `P12_PASSWORD`, `CAPGO_IOS_PROVISIONING_MAP`, `APPLE_KEY_ID`, `APPLE_ISSUER_ID`, `APPLE_KEY_CONTENT`, `APP_STORE_CONNECT_TEAM_ID`, `CAPGO_IOS_SCHEME`, `CAPGO_IOS_TARGET`, `CAPGO_IOS_DISTRIBUTION`, `CAPGO_IOS_XCODE_VERSION`. App-specific-password route: `FASTLANE_USER`, `FASTLANE_APPLE_APPLICATION_SPECIFIC_PASSWORD`, `APPLE_APP_ID`.

Android: `ANDROID_KEYSTORE_FILE`, `KEYSTORE_KEY_ALIAS`, `KEYSTORE_KEY_PASSWORD`, `KEYSTORE_STORE_PASSWORD`, `PLAY_CONFIG_JSON`, `PLAY_STORE_TRACK`, `PLAY_STORE_RELEASE_STATUS`.

Shared toggles: `BUILD_OUTPUT_UPLOAD_ENABLED`, `BUILD_OUTPUT_RETENTION_SECONDS`, `SKIP_BUILD_NUMBER_BUMP`.

Example CI step:

```yaml
- name: Capgo iOS build
  env:
    CAPGO_TOKEN: ${{ secrets.CAPGO_TOKEN }}
    BUILD_CERTIFICATE_BASE64: ${{ secrets.BUILD_CERTIFICATE_BASE64 }}
    P12_PASSWORD: ${{ secrets.P12_PASSWORD }}
    CAPGO_IOS_PROVISIONING_MAP: ${{ secrets.CAPGO_IOS_PROVISIONING_MAP }}
    APPLE_KEY_ID: ${{ secrets.APPLE_KEY_ID }}
    APPLE_ISSUER_ID: ${{ secrets.APPLE_ISSUER_ID }}
    APPLE_KEY_CONTENT: ${{ secrets.APPLE_KEY_CONTENT }}
    APP_STORE_CONNECT_TEAM_ID: ${{ secrets.APP_STORE_CONNECT_TEAM_ID }}
  run: |
    npx @capgo/cli@latest build request com.example.app --platform ios \
      --output-upload --output-record /tmp/build.json
    npx @capgo/cli@latest build last-output --path /tmp/build.json --field outputUrl
```

Run `npm ci`, the web build, and `npx cap sync <platform>` before `build request`, because prescan `shared/cap-sync-stale` checks them.
