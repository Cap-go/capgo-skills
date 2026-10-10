# Signing and Secrets in CI

Never commit certificates, `.p8` keys, keystores, or passwords. Store them as CI secrets (base64 for binary files), decode into the runner temp dir, and let the runner discard them. Do not replace a user's existing secret values with placeholders when editing their workflow; keep their secret names unless they are misleading.

## iOS

### Option A: App Store Connect API key + automatic signing (recommended)

Secrets: `ASC_KEY_ID`, `ASC_ISSUER_ID`, `ASC_KEY_P8_BASE64` (`base64 -i AuthKey_XXXX.p8`), `APPLE_TEAM_ID`.

Pass `-allowProvisioningUpdates -authenticationKeyPath ... -authenticationKeyID ... -authenticationKeyIssuerID ...` to both `archive` and `-exportArchive`. Xcode fetches or creates the distribution certificate and profile. Needs an API key with Admin/App Manager access; cloud-managed distribution certificates must be allowed for the team.

### Option B: Manual certificate + profile

Secrets: `IOS_P12_BASE64`, `IOS_P12_PASSWORD`, `IOS_PROFILE_BASE64`, `KEYCHAIN_PASSWORD` (any random string).

```bash
KEYCHAIN="$RUNNER_TEMP/build.keychain-db"
security create-keychain -p "$KEYCHAIN_PASSWORD" "$KEYCHAIN"
security set-keychain-settings -lut 21600 "$KEYCHAIN"
security unlock-keychain -p "$KEYCHAIN_PASSWORD" "$KEYCHAIN"
echo "$IOS_P12_BASE64" | base64 --decode > "$RUNNER_TEMP/cert.p12"
security import "$RUNNER_TEMP/cert.p12" -P "$IOS_P12_PASSWORD" -A -t cert -f pkcs12 -k "$KEYCHAIN"
security set-key-partition-list -S apple-tool:,apple: -k "$KEYCHAIN_PASSWORD" "$KEYCHAIN"
security list-keychain -d user -s "$KEYCHAIN" $(security list-keychains -d user | tr -d '"')

mkdir -p ~/Library/MobileDevice/Provisioning\ Profiles
echo "$IOS_PROFILE_BASE64" | base64 --decode > ~/Library/MobileDevice/Provisioning\ Profiles/app.mobileprovision
```

Then archive with `CODE_SIGN_STYLE=Manual`, `PROVISIONING_PROFILE_SPECIFIER="<profile name>"`, `CODE_SIGN_IDENTITY="Apple Distribution"`, and an `ExportOptions.plist` containing `method` = `app-store-connect`, `signingStyle` = `manual`, and `provisioningProfiles` mapping bundle ID -> profile name. Extensions (widgets, notification service) need their own profiles in the map.

Delete the keychain in an `if: always()` step on self-hosted runners.

### Option C: Fastlane match

Certificates live encrypted in a private git repo or bucket; CI needs `MATCH_PASSWORD` and repo access. See `fastlane.md`.

## Android

Secrets: `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`, `PLAY_SERVICE_ACCOUNT_JSON`.

`android/app/build.gradle` reading from env with a local `keystore.properties` fallback:

```groovy
def keystoreProps = new Properties()
def keystorePropsFile = rootProject.file('keystore.properties')
if (keystorePropsFile.exists()) keystoreProps.load(new FileInputStream(keystorePropsFile))
def envOr = { String env, String prop -> System.getenv(env) ?: keystoreProps[prop] }

android {
    defaultConfig {
        versionCode (System.getenv('VERSION_CODE') ?: '1').toInteger()
    }
    signingConfigs {
        release {
            def path = envOr('ANDROID_KEYSTORE_PATH', 'storeFile')
            storeFile path ? file(path) : null
            storePassword envOr('ANDROID_KEYSTORE_PASSWORD', 'storePassword')
            keyAlias envOr('ANDROID_KEY_ALIAS', 'keyAlias')
            keyPassword envOr('ANDROID_KEY_PASSWORD', 'keyPassword')
        }
    }
    buildTypes {
        release { signingConfig signingConfigs.release }
    }
}
```

Keep the existing `versionCode` literal as the fallback if the project already has one higher than `1`.

`npx cap build android --androidreleasetype AAB --keystorepath ... --keystorepass ... --keystorealias ... --keystorealiaspass ...` is an alternative that does not require Gradle edits.

Play upload: the service account needs access to the app in Play Console (Users and permissions). The first upload of a new app must be done manually in Play Console before the API accepts uploads.

## Secret inventory

| Secret | Used by |
|---|---|
| `ASC_KEY_ID`, `ASC_ISSUER_ID`, `ASC_KEY_P8_BASE64` | xcodebuild auth, altool, Fastlane `app_store_connect_api_key` |
| `APPLE_TEAM_ID` | `DEVELOPMENT_TEAM`, ExportOptions |
| `IOS_P12_BASE64`, `IOS_P12_PASSWORD`, `IOS_PROFILE_BASE64` | manual signing only |
| `MATCH_PASSWORD` (+ repo deploy key) | Fastlane match |
| `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD` | Android release signing |
| `PLAY_SERVICE_ACCOUNT_JSON` | Play upload |
| `CAPGO_TOKEN` | Capgo CLI (bundle upload, build request) |

Encode files: `base64 -i file | pbcopy` (macOS) or `base64 -w0 file` (Linux). With GitHub CLI: `gh secret set ANDROID_KEYSTORE_BASE64 < <(base64 -i upload.jks)`.
