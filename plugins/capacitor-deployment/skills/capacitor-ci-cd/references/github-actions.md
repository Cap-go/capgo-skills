# GitHub Actions for Capacitor

Example targets Capacitor 8 (Node 22, Xcode 26, JDK 21). For Capacitor 9 change `NODE_VERSION` to `24` and the iOS runner to an image with Xcode 27 (`xcode-27` preview label at time of writing; check https://github.com/actions/runner-images).

Replace `npm ci` with the repo's package manager (`pnpm install --frozen-lockfile`, `bun install --frozen-lockfile`, `yarn install --immutable`). Replace `dist` with your `webDir`.

```yaml
# .github/workflows/mobile.yml
name: Mobile CI

on:
  push:
    branches: [main]
    tags: ['v*']
  pull_request:

env:
  NODE_VERSION: '22'
  WEB_DIR: dist

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v5
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: npm
      - run: npm ci
      - run: npm run lint --if-present
      - run: npm test --if-present
      - run: npx @capgo/capgo-sec@latest scan --ci

  build-web:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v5
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with:
          name: web
          path: ${{ env.WEB_DIR }}
          if-no-files-found: error

  ios:
    runs-on: macos-26
    needs: build-web
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v5
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: npm
      - run: npm ci
      - uses: actions/download-artifact@v4
        with:
          name: web
          path: ${{ env.WEB_DIR }}
      - run: xcodebuild -version
      - run: npx cap sync ios   # runs pod install automatically for CocoaPods projects
      - name: Write App Store Connect API key
        env:
          ASC_KEY_P8_BASE64: ${{ secrets.ASC_KEY_P8_BASE64 }}
        run: |
          mkdir -p ~/.appstoreconnect/private_keys
          echo "$ASC_KEY_P8_BASE64" | base64 --decode > ~/.appstoreconnect/private_keys/AuthKey_${{ secrets.ASC_KEY_ID }}.p8
      - name: Archive
        working-directory: ios/App
        run: |
          # SPM projects: -project App.xcodeproj ; CocoaPods projects: -workspace App.xcworkspace
          PROJECT_ARG="-project App.xcodeproj"
          [ -d App.xcworkspace ] && PROJECT_ARG="-workspace App.xcworkspace"
          xcodebuild $PROJECT_ARG -scheme App -configuration Release \
            -destination 'generic/platform=iOS' \
            -archivePath "$RUNNER_TEMP/App.xcarchive" \
            -allowProvisioningUpdates \
            -authenticationKeyPath ~/.appstoreconnect/private_keys/AuthKey_${{ secrets.ASC_KEY_ID }}.p8 \
            -authenticationKeyID ${{ secrets.ASC_KEY_ID }} \
            -authenticationKeyIssuerID ${{ secrets.ASC_ISSUER_ID }} \
            CURRENT_PROJECT_VERSION=${{ github.run_number }} \
            DEVELOPMENT_TEAM=${{ secrets.APPLE_TEAM_ID }} \
            archive
      - name: Export IPA
        working-directory: ios/App
        run: |
          cat > "$RUNNER_TEMP/ExportOptions.plist" <<PLIST
          <?xml version="1.0" encoding="UTF-8"?>
          <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
          <plist version="1.0"><dict>
            <key>method</key><string>app-store-connect</string>
            <key>teamID</key><string>${{ secrets.APPLE_TEAM_ID }}</string>
            <key>signingStyle</key><string>automatic</string>
          </dict></plist>
          PLIST
          xcodebuild -exportArchive \
            -archivePath "$RUNNER_TEMP/App.xcarchive" \
            -exportOptionsPlist "$RUNNER_TEMP/ExportOptions.plist" \
            -exportPath "$RUNNER_TEMP/export" \
            -allowProvisioningUpdates \
            -authenticationKeyPath ~/.appstoreconnect/private_keys/AuthKey_${{ secrets.ASC_KEY_ID }}.p8 \
            -authenticationKeyID ${{ secrets.ASC_KEY_ID }} \
            -authenticationKeyIssuerID ${{ secrets.ASC_ISSUER_ID }}
      - name: Upload to TestFlight
        if: startsWith(github.ref, 'refs/tags/v')
        run: |
          xcrun altool --upload-app --type ios \
            --file "$RUNNER_TEMP"/export/*.ipa \
            --apiKey ${{ secrets.ASC_KEY_ID }} \
            --apiIssuer ${{ secrets.ASC_ISSUER_ID }}
      - uses: actions/upload-artifact@v4
        with:
          name: ios-ipa
          path: ${{ runner.temp }}/export/*.ipa

  android:
    runs-on: ubuntu-latest
    needs: build-web
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v5
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: npm
      - uses: actions/setup-java@v5
        with:
          distribution: temurin
          java-version: '21'
      - uses: gradle/actions/setup-gradle@v4
      - run: npm ci
      - uses: actions/download-artifact@v4
        with:
          name: web
          path: ${{ env.WEB_DIR }}
      - run: npx cap sync android
      - name: Decode keystore
        env:
          ANDROID_KEYSTORE_BASE64: ${{ secrets.ANDROID_KEYSTORE_BASE64 }}
        run: echo "$ANDROID_KEYSTORE_BASE64" | base64 --decode > "$RUNNER_TEMP/upload.jks"
      - name: Build AAB
        working-directory: android
        env:
          ANDROID_KEYSTORE_PATH: ${{ runner.temp }}/upload.jks
          ANDROID_KEYSTORE_PASSWORD: ${{ secrets.ANDROID_KEYSTORE_PASSWORD }}
          ANDROID_KEY_ALIAS: ${{ secrets.ANDROID_KEY_ALIAS }}
          ANDROID_KEY_PASSWORD: ${{ secrets.ANDROID_KEY_PASSWORD }}
          VERSION_CODE: ${{ github.run_number }}
        run: ./gradlew bundleRelease
      - uses: actions/upload-artifact@v4
        with:
          name: android-aab
          path: android/app/build/outputs/bundle/release/*.aab
      - name: Upload to Play internal track
        if: startsWith(github.ref, 'refs/tags/v')
        uses: r0adkll/upload-google-play@v1
        with:
          serviceAccountJsonPlainText: ${{ secrets.PLAY_SERVICE_ACCOUNT_JSON }}
          packageName: com.company.app
          releaseFiles: android/app/build/outputs/bundle/release/*.aab
          track: internal

  capgo-ota:
    # Web-only update to devices already on a compatible native build.
    runs-on: ubuntu-latest
    needs: build-web
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v5
        with:
          node-version: ${{ env.NODE_VERSION }}
      - uses: actions/download-artifact@v4
        with:
          name: web
          path: ${{ env.WEB_DIR }}
      - run: npx @capgo/cli@latest bundle upload --path ${{ env.WEB_DIR }} --channel production
        env:
          CAPGO_TOKEN: ${{ secrets.CAPGO_TOKEN }}
```

The Android job expects `android/app/build.gradle` to read signing values and `versionCode` from the environment; see `signing-and-secrets.md`.

Notes:
- `xcrun altool` looks for `AuthKey_<KEY_ID>.p8` in `~/.appstoreconnect/private_keys/` (also `./private_keys`, `~/private_keys`).
- `-allowProvisioningUpdates` with API-key flags lets Xcode create/download certificates and profiles; the API key needs the Admin or App Manager role for that. Use manual signing (import `.p12` + profile) if the team forbids cloud-managed certificates.
- Keep native jobs off pull requests from forks: secrets are not available there and signing will fail.

## Capgo Cloud Build job (no macOS runner)

```yaml
  capgo-build:
    runs-on: ubuntu-latest
    needs: build-web
    strategy:
      matrix:
        platform: [ios, android]
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v5
        with:
          node-version: ${{ env.NODE_VERSION }}
      - run: npm ci
      - uses: actions/download-artifact@v4
        with:
          name: web
          path: ${{ env.WEB_DIR }}
      - run: npx cap sync ${{ matrix.platform }}
      - run: npx @capgo/cli@latest build request com.company.app --platform ${{ matrix.platform }} --path .
        env:
          CAPGO_TOKEN: ${{ secrets.CAPGO_TOKEN }}
          # iOS credentials
          BUILD_CERTIFICATE_BASE64: ${{ secrets.BUILD_CERTIFICATE_BASE64 }}
          P12_PASSWORD: ${{ secrets.P12_PASSWORD }}
          APPLE_KEY_ID: ${{ secrets.APPLE_KEY_ID }}
          APPLE_ISSUER_ID: ${{ secrets.APPLE_ISSUER_ID }}
          APPLE_KEY_CONTENT: ${{ secrets.APPLE_KEY_CONTENT }}
          APP_STORE_CONNECT_TEAM_ID: ${{ secrets.APP_STORE_CONNECT_TEAM_ID }}
          # Android credentials
          ANDROID_KEYSTORE_FILE: ${{ secrets.ANDROID_KEYSTORE_FILE }}
          KEYSTORE_KEY_ALIAS: ${{ secrets.KEYSTORE_KEY_ALIAS }}
          KEYSTORE_KEY_PASSWORD: ${{ secrets.KEYSTORE_KEY_PASSWORD }}
          KEYSTORE_STORE_PASSWORD: ${{ secrets.KEYSTORE_STORE_PASSWORD }}
          PLAY_CONFIG_JSON: ${{ secrets.PLAY_CONFIG_JSON }}
```

iOS provisioning profiles are also passed as an env var (see the Capgo docs at capgo.app/docs/builder/github-actions/ for the current variable name and the credentials export flow). Credential details and failure modes: `capgo-native-builds`.
