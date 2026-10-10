# Build Credentials and CI

Docs: https://capgo.app/docs/builder/credentials/ · https://capgo.app/docs/builder/github-actions/

Storage: `~/.capgo-credentials/credentials.json` (global, the default) or `.capgo-credentials.json` in the project root (`--local`). Never commit either file.

## Save (when the user already has signing files)

iOS (App Store, with an extension):

```bash
npx @capgo/cli@latest build credentials save --appId com.example.app --platform ios \
  --certificate ./cert.p12 --p12-password "P12_PASSWORD" \
  --ios-provisioning-profile ./App.mobileprovision \
  --ios-provisioning-profile com.example.app.widget=./Widget.mobileprovision \
  --apple-key ./AuthKey_KEYID.p8 --apple-key-id "KEY_ID" \
  --apple-issuer-id "ISSUER_UUID" --apple-team-id "TEAM_ID"
```

iOS ad hoc artifact only:

```bash
npx @capgo/cli@latest build credentials save --appId com.example.app --platform ios \
  --ios-distribution ad_hoc --certificate ./cert.p12 \
  --ios-provisioning-profile ./adhoc.mobileprovision --output-upload
```

Android:

```bash
npx @capgo/cli@latest build credentials save --appId com.example.app --platform android \
  --keystore ./release.jks --keystore-alias "release-key" \
  --keystore-key-password "KEY_PASSWORD" --keystore-store-password "STORE_PASSWORD" \
  --play-config ./service-account.json
```

To get a download link without a Play upload, replace `--play-config` with `--output-upload`.

Saved defaults you can also store: `--output-retention`, `--skip-build-number-bump`, `--skip-marketing-version-bump`, `--android-flavor`, `--in-app-update-priority`.

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

```bash
npx @capgo/cli@latest build credentials export BUILD_CERTIFICATE_BASE64 --app-id com.example.app --platform ios --raw
npx @capgo/cli@latest build credentials export APPLE_KEY_CONTENT --app-id com.example.app --platform ios --file ./AuthKey.p8 --decode-base64
```

`--file` never overwrites an existing file. Environment variables are never exported.

## Push to GitHub Actions secrets

1. `gh secret set CAPGO_TOKEN` (paste the key when prompted. The API key is not in the credential store).
2. `npx @capgo/cli@latest build credentials manage --appId com.example.app`, then choose **Export to .env**. This writes `.env.capgo.<appId>` with mode `0600`.
3. `gh secret set -f .env.capgo.com.example.app`, then `gh secret list` to verify.
4. Delete the local `.env.capgo.*` file afterwards, or keep it git-ignored.

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
