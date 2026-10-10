---
name: capacitor-ci-cd
description: Designs and fixes CI/CD pipelines for Capacitor apps - GitHub Actions, GitLab CI, Fastlane, or Capgo Cloud Build (npx @capgo/cli@latest build request) - covering web build and tests, cap sync, iOS archive/export/upload with App Store Connect API keys, Android AAB signing and Play upload, Capgo live-update uploads, secrets, caching, and build-number bumping. Use when choosing runner images and toolchains (Node 22/24, macos-26 vs xcode-27 runners, JDK 21, Gradle 9 / AGP 9 for Capacitor 9), or when CI fails with errors like "No signing certificate", "requires a provisioning profile", "Unsupported class file major version", "Android Gradle plugin requires Java 17", "The engine node is incompatible", or "Could not find the web assets directory". Do not use for one-off manual store submission (capacitor-app-store), Capgo Cloud Build credential onboarding in depth (capgo-native-builds), Capgo channel/release strategy (capgo-release-workflows), or test authoring (capacitor-testing).
allowed-tools:
  - Bash(node -e *)
  - Bash(find *)
---

# CI/CD for Capacitor Apps

Build, sign, and ship Capacitor apps from CI with the right toolchain for the Capacitor major in use.

## When to Use

TRIGGER when:
- Creating or fixing `.github/workflows/*.yml`, `.gitlab-ci.yml`, `fastlane/Fastfile`, or a Capgo Cloud Build job.
- Picking runner images, Node/Xcode/JDK versions for Capacitor 8 or 9.
- Automating signing, TestFlight/Play uploads, version bumps, or Capgo OTA uploads.
- A CI build fails while a local build works.

Do not use for:
- Manual submission, listing, screenshots -> `capacitor-app-store`.
- Capgo Cloud Build credential setup and troubleshooting -> `capgo-native-builds`.
- Channel promotion, staged OTA rollouts -> `capgo-release-workflows`.
- Writing unit/E2E tests -> `capacitor-testing`.
- Security scanning rules -> `capacitor-security`.

## Live Project Snapshot

Capacitor version, Node engine, and scripts:
!`node -e "const fs=require('fs');if(!fs.existsSync('package.json'))process.exit(0);const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));const out=[];if(pkg.engines)out.push('engines='+JSON.stringify(pkg.engines));if(pkg.packageManager)out.push('packageManager='+pkg.packageManager);for(const section of ['dependencies','devDependencies']){for(const [name,version] of Object.entries(pkg[section]||{})){if(name.startsWith('@capacitor/')||name==='@capgo/cli'||name==='@capgo/capacitor-updater')out.push(section+'.'+name+'='+version)}}for(const [name,cmd] of Object.entries(pkg.scripts||{})){if(/build|test|lint|sync|release/i.test(name))out.push('scripts.'+name+'='+cmd)}console.log(out.join('\n'))"`

Existing CI, lockfiles, and native build files:
!`find . -maxdepth 4 -not -path '*/node_modules/*' \( -path './.github/workflows/*' -o -name '.gitlab-ci.yml' -o -name 'Fastfile' -o -name 'Appfile' -o -name 'Matchfile' -o -name 'ExportOptions.plist' -o -name 'Podfile' -o -name 'Package.swift' -o -name 'gradle-wrapper.properties' -o -name 'variables.gradle' -o -name '.nvmrc' -o -name '.node-version' -o -name 'bun.lock' -o -name 'package-lock.json' -o -name 'pnpm-lock.yaml' -o -name 'yarn.lock' \)`

## Toolchain Matrix

| | Capacitor 8.x (stable, `latest`) | Capacitor 9 (`next`, pre-GA) |
|---|---|---|
| Node | 22+ | 24+ (ships npm 11) |
| Xcode | 26+ (27 OK on 8.5+ with UIScene adopted) | 27+ |
| GitHub macOS runner | `macos-26` (default Xcode 26.x) | `xcode-27` image (preview at time of writing) or a `macos-*` image that lists Xcode 27; check actions/runner-images |
| iOS deployment target | 15.0 | 16.0 |
| JDK | 21 | 21 (AGP 9 itself needs 17+, Capacitor's Android library compiles with Java 21) |
| Gradle / AGP | 8.14.3 / 8.13 | 9.5.1 / 9.2.1 |
| compile/target SDK | 36 | 37 |

Store-side deadlines: Apple requires the iOS 26 SDK now and the iOS 27 SDK from April 2027; Google Play requires target API 36 since Aug 31, 2026. A Capacitor 8 app on `macos-26` meets both today.

Pin Xcode explicitly when several are installed: `sudo xcode-select -s /Applications/Xcode_<version>.app` (exact folder names are listed in the runner image README).

## Choose a Pipeline Shape

Ask the user when unclear:
1. **Capgo Cloud Build** - no macOS runner or local signing setup; any Linux runner calls `npx @capgo/cli@latest build request <appId> --platform ios|android`. Credentials are saved once with `npx @capgo/cli@latest build credentials save ...` (or `build init` for guided iOS setup) and passed in CI as env vars. Load `capgo-native-builds` for details.
2. **Self-hosted GitHub Actions / GitLab** - full control; you manage macOS runners, certificates, and keystores. See `references/github-actions.md`, `references/gitlab-ci.md`.
3. **Fastlane** inside either - best when match/pilot/supply are already in use. See `references/fastlane.md`.

Web-only changes after a native release can skip native builds entirely: upload a Capgo bundle (`npx @capgo/cli@latest bundle upload --channel <channel>`, auth via `CAPGO_TOKEN`). Native changes (plugins, permissions, Capacitor upgrades) always need a native build.

## Procedure

1. Read the snapshot: Capacitor major, package manager + lockfile, iOS dependency manager (`Package.swift` -> SPM, `Podfile` -> CocoaPods), existing workflows.
2. Pick toolchain versions from the matrix. Set Node from `.nvmrc`/`engines` if present.
3. Structure jobs: `test` (lint, typecheck, unit) -> `build-web` (artifact `<webDir>`) -> `ios` + `android` in parallel -> deploy jobs gated on branch/tag. Always run `npx cap sync <platform>` on the native job after restoring the web artifact; never commit synced assets as a CI shortcut.
4. Signing: follow `references/signing-and-secrets.md`. Prefer App Store Connect API keys over Apple ID passwords; keep Android keystore and passwords in secrets, decode at runtime, delete after.
5. Build numbers: derive from CI (`GITHUB_RUN_NUMBER`, `CI_PIPELINE_IID`) or let Capgo Cloud Build bump them. Never reuse a build number.
6. Add caching (`references/caching-and-versioning.md`).
7. Run the pipeline on a branch first, uploading to TestFlight internal / Play internal track only.

## Verification

- The workflow passes on a clean runner twice in a row (cache cold and warm).
- Logs show the expected tool versions: add `node -v`, `xcodebuild -version`, `java -version`, `./gradlew --version` steps.
- iOS artifact: `unzip -l App.ipa | grep Payload/App.app` and the build appears in TestFlight with the expected build number.
- Android artifact: `bundletool dump manifest --bundle app-release.aab | grep -E "versionCode|targetSdkVersion"` matches expectations; build appears in the Play internal track.
- Capgo: `npx @capgo/cli@latest bundle list` shows the uploaded version on the intended channel.
- No secret values printed in logs (GitHub masks registered secrets; never `echo` decoded files).

## Error Handling

| Error in CI log | Fix |
|---|---|
| `error ... The engine "node" is incompatible with this module. Expected version ">=22.0.0"` (or `>=24`) | Bump `actions/setup-node` `node-version` to match the Capacitor major |
| `Could not find the web assets directory: ./dist.` | Web artifact not downloaded to `webDir`, or build skipped; fix artifact path |
| `No signing certificate "iOS Distribution" found` | Certificate not imported into the active keychain, or wrong team; see signing reference |
| `"App" requires a provisioning profile. Select a provisioning profile in the Signing & Capabilities editor.` | Install the profile, or use `-allowProvisioningUpdates` with API-key auth flags |
| `error: exportArchive: No profiles for 'com.x.y' were found` | Profile type mismatch with `ExportOptions.plist` `method` (`app-store-connect`) |
| `xcodebuild: error: SDK "iphoneos27.0" cannot be located` / Swift 6 errors on `@UIApplicationMain` | Wrong Xcode selected; `xcode-select` the required version; replace `@UIApplicationMain` with `@main` |
| `Unsupported class file major version 65` / `Android Gradle plugin requires Java 17 to run` / `invalid source release: 21` | Install JDK 21 with `actions/setup-java` (`distribution: temurin`, `java-version: '21'`) |
| `Plugin [id: 'org.jetbrains.kotlin.android'] ... ` conflicts after Capacitor 9 upgrade | AGP 9 has built-in Kotlin; remove the kotlin-android plugin per `capacitor-app-upgrades` |
| `SDK location not found. Define a valid SDK location with an ANDROID_HOME` | Use an image with the Android SDK (`ubuntu-latest` has it) or `android-actions/setup-android` |
| Play API: `APK specifies a version code that has already been used.` | Derive `versionCode` from the CI run number |
| Capgo: `Cannot find API key in local folder or global, please login first` | Export `CAPGO_TOKEN` from secrets in that step's `env` (or pass `-a`) |
| Capgo: `Cannot auth user with apikey` | Key revoked or lacks upload permission; create a new key in the Capgo dashboard |
| `npm error 404 Not Found - GET https://registry.npmjs.org/capsec` | Security scanner package is `@capgo/capgo-sec`: `npx @capgo/capgo-sec@latest scan --ci` |

## References

- `references/github-actions.md` - complete workflow: test, web build, iOS (SPM/CocoaPods), Android, Capgo OTA, Capgo Cloud Build job.
- `references/gitlab-ci.md` - GitLab pipeline with macOS runner tags.
- `references/fastlane.md` - iOS and Android lanes with API keys and match.
- `references/signing-and-secrets.md` - certificate/profile import, API key auth, Android keystore wiring, secret inventory.
- `references/caching-and-versioning.md` - npm/Gradle/SPM/CocoaPods caches, build numbers, semantic-release.
