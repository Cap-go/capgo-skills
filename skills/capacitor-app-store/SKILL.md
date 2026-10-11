---
name: capacitor-app-store
description: Ships a Capacitor app to the Apple App Store and Google Play. Use for release prep and submission - version/build numbers (CFBundleVersion, versionCode), signing, archiving and uploading the IPA/AAB, TestFlight, Play tracks and closed testing, icons and screenshots, listing metadata, App Privacy and Data safety forms, age ratings, export compliance, phased rollout, and current platform deadlines (iOS 26 SDK since April 28 2026, iOS 27 SDK from April 2027, UIScene lifecycle for Xcode 27, Play target API 36 from Aug 31 2026, 16 KB page size). Also for upload errors like ITMS-90725, ITMS-91053, ITMS-91061, ITMS-4238 redundant binary, or "Version code has already been used". Do not use for a guideline-by-guideline Apple rejection audit (capacitor-apple-review-preflight), CI pipeline authoring (capacitor-ci-cd), Capgo Cloud Build setup (capgo-native-builds), or converting a website into an app (webapp-to-capacitor).
allowed-tools:
  - Bash(node -e *)
  - Bash(find *)
---

# Publishing Capacitor Apps to the Stores

Get a Capacitor build from "runs on my device" to "live in both stores" without avoidable upload or review failures.

## When to Use

TRIGGER when:
- The user is preparing a first release or an update to App Store Connect or Google Play Console.
- Upload or processing fails (ITMS errors, Play Console version/target API errors).
- The user needs screenshot sizes, icon requirements, listing fields, privacy forms, or rollout options.
- The user asks which Xcode/SDK or target API level the stores require right now.

Do not use for:
- Auditing an app against App Review Guidelines or answering a rejection -> `capacitor-apple-review-preflight`.
- Writing GitHub Actions/GitLab/Fastlane pipelines -> `capacitor-ci-cd`.
- Building/signing in Capgo Cloud -> `capgo-native-builds`.
- Shipping web-only fixes after approval -> `capgo-live-updates`.

## Live Project Snapshot

Capacitor packages and version:
!`node -e "const fs=require('fs');if(!fs.existsSync('package.json'))process.exit(0);const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));const out=['version='+(pkg.version||'')];for(const section of ['dependencies','devDependencies']){for(const [name,version] of Object.entries(pkg[section]||{})){if(name.startsWith('@capacitor/')||name==='@capgo/capacitor-updater'||name==='@capacitor/assets')out.push(section+'.'+name+'='+version)}}console.log(out.join('\n'))"`

Native release files:
!`find . -maxdepth 5 -not -path '*/node_modules/*' \( -name 'Info.plist' -o -name 'PrivacyInfo.xcprivacy' -o -name '*.entitlements' -o -name 'SceneDelegate.swift' -o -name 'variables.gradle' -o -name 'build.gradle' -o -name 'ExportOptions.plist' -o -path './fastlane' \)`

## Current Store Requirements (October 2026)

| Requirement | Detail | Capacitor impact |
|---|---|---|
| Apple SDK minimum | Since April 28, 2026: built with Xcode 26+ and iOS 26 SDK. Starting April 2027: iOS 27 SDK (Xcode 27) | Capacitor 8 builds with Xcode 26; Xcode 27 needs Capacitor 8.5+ project changes |
| UIScene lifecycle | Xcode 27 / iOS 27 SDK builds require the scene lifecycle | Capacitor 8.5+: add `SceneDelegate.swift`, `UIApplicationSceneManifest`, AppDelegate `configurationForConnecting` (see `capacitor-app-upgrades`) |
| Privacy manifest | Required-reason APIs must be declared; listed third-party SDKs must ship their own signed manifests | Capacitor core and maintained plugins ship manifests; your app still needs its own `PrivacyInfo.xcprivacy` |
| Apple age rating | New questionnaire with 13+, 16+, 18+ tiers; answers were due Jan 31, 2026 or updates are blocked | Answer in App Store Connect -> App Information -> Age Ratings |
| Play target API | Since Aug 31, 2026 new apps and updates must target API 36 (extension to Nov 1, 2026 on request); existing apps below API 35 stop reaching new users on newer devices | Capacitor 8 templates use compile/target 36; Capacitor 9 uses 37 |
| Play format | New apps must upload AAB with Play App Signing | `./gradlew bundleRelease` |
| 16 KB page size | Apps targeting Android 15+ with native `.so` libraries must be 16 KB aligned | Check SQLCipher, ML, media, and analytics SDKs |
| Play closed testing | Personal accounts created after Nov 13, 2023: closed test with 12+ opted-in testers for 14 consecutive days before production | Start the test early |

Re-verify dates when the user is close to a deadline: Apple posts at developer.apple.com/news/upcoming-requirements, Google at developer.android.com/google/play/requirements/target-sdk.

## Procedure

1. Read the snapshot. Confirm Capacitor version, iOS scene lifecycle (look for `SceneDelegate.swift`), `variables.gradle` SDK values, and whether a privacy manifest exists.
2. Decide the release path with the user: manual (Xcode Organizer + Play Console), CLI/CI (`capacitor-ci-cd`), or Capgo Cloud Build (`capgo-native-builds`).
3. Bump versions. User-visible version must match on both platforms; build numbers must strictly increase per upload:
   - iOS: `MARKETING_VERSION` (CFBundleShortVersionString) and `CURRENT_PROJECT_VERSION` (CFBundleVersion) in the Xcode target build settings. `Info.plist` normally references `$(MARKETING_VERSION)`/`$(CURRENT_PROJECT_VERSION)`; edit build settings, not the plist literal.
   - Android: `versionName` and `versionCode` in `android/app/build.gradle` (`versionCode` max 2100000000).
4. Build web assets and sync: `npm run build && npx cap sync`.
5. Load the platform reference and follow it: `references/ios-submission.md`, `references/android-submission.md`.
6. Prepare listing assets with `references/assets-and-metadata.md`.
7. Before pressing submit on iOS, run `capacitor-apple-review-preflight` for anything beyond a trivial update.
8. Roll out: iOS phased release (7 days, pausable) or Play staged rollout percentages; watch crash rates before widening.

## Verification

- iOS: Archive validates in Xcode Organizer ("Validate App") with no errors; build appears in TestFlight after processing; install from TestFlight on a real device and run the critical flows.
- Android: `bundletool` or Play internal testing install works; Play Console pre-launch report has no crashes; `aapt2 dump badging app-release.aab` or the Play Console shows the expected `versionCode` and `targetSdkVersion`.
- Both: the app launches cold from the store build (not a debug build), login with the reviewer demo account works, deep links and push work in release signing.

## Error Handling

| Error | Fix |
|---|---|
| ITMS-4238 "Redundant Binary Upload" (build number already used) | Increase `CURRENT_PROJECT_VERSION` |
| ITMS-90062 `CFBundleShortVersionString` must be higher than the previously approved version | Increase `MARKETING_VERSION` |
| ITMS-90186 "Invalid Pre-Release Train" (version train closed) | The marketing version was already released; increase `MARKETING_VERSION` |
| ITMS-90725 "SDK Version Issue" (built with an older SDK) | Build with the required Xcode/SDK (Xcode 26+ now, Xcode 27 from April 2027) |
| ITMS-91053 "Missing API declaration" | Add the required-reason API category and reason code to `PrivacyInfo.xcprivacy` |
| ITMS-91061 "Missing privacy manifest" for a named SDK | Update that SDK/plugin to a version that bundles a privacy manifest; do not copy the SDK's practices into the app manifest |
| ITMS-90683 "Missing purpose string in Info.plist" | Add the named `NS...UsageDescription` with a specific purpose |
| App launches to a black screen or not at all when built with Xcode 27 | UIScene lifecycle not adopted; upgrade to Capacitor 8.5+ and apply the 8.5 project changes |
| Play: `Version code 45 has already been used. Try another version code.` | Increase `versionCode` |
| Play: target API level error on upload | Raise `targetSdkVersion`/`compileSdkVersion` in `variables.gradle` to the required level |
| Play: `You uploaded an APK or Android App Bundle that was signed in debug mode` | Build `bundleRelease` with the upload key |
| Play: `Your Android App Bundle is signed with the wrong key` | Sign with the registered upload key, or request an upload key reset in Play Console |
| Play: production track unavailable | Complete the 12-tester / 14-day closed test (personal accounts) |

## References

- `references/ios-submission.md` - signing, archive, upload options, TestFlight, App Privacy, export compliance, review notes, phased release.
- `references/android-submission.md` - release signing, AAB, Play App Signing, tracks, Data safety, target API and 16 KB checks, staged rollout.
- `references/assets-and-metadata.md` - icon generation, screenshot sizes, text field limits for both stores.

Related skills: `capacitor-apple-review-preflight`, `capacitor-ci-cd`, `capgo-native-builds`, `capacitor-app-upgrades`, `capgo-live-updates`.
