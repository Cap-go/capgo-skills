# iOS Submission (App Store Connect)

## Prerequisites

- Apple Developer Program membership (organization accounts for regulated categories such as banking, VPN, crypto exchange, health records).
- App record created in App Store Connect with the exact bundle ID from `capacitor.config.*` `appId` / Xcode `PRODUCT_BUNDLE_IDENTIFIER`.
- Xcode 26+ today; Xcode 27 required for uploads from April 2027. Capacitor 8.5+ is needed to build with Xcode 27 (UIScene lifecycle).
- iOS project path: `ios/App/App.xcodeproj` (SPM, default for new projects) or `ios/App/App.xcworkspace` (CocoaPods). Always open the workspace if it exists.

## Signing

- Simplest: Xcode -> App target -> Signing & Capabilities -> Automatically manage signing, Team selected.
- CI: App Store Connect API key (`.p8`, key ID, issuer ID) with `-allowProvisioningUpdates`, or manual distribution certificate + App Store provisioning profile. See `capacitor-ci-cd`.
- Every capability enabled in Signing & Capabilities becomes an entitlement. Remove unused ones (Push, Associated Domains, iCloud) before submission; unused entitlements are a review risk.

## Archive and upload

Pick one:

1. Xcode: Product -> Archive -> Organizer -> Validate App -> Distribute App -> App Store Connect.
2. CLI:

```bash
cd ios/App
xcodebuild -scheme App -configuration Release \
  -destination 'generic/platform=iOS' \
  -archivePath build/App.xcarchive archive
# add -workspace App.xcworkspace for CocoaPods projects
xcodebuild -exportArchive -archivePath build/App.xcarchive \
  -exportOptionsPlist ExportOptions.plist -exportPath build
xcrun altool --upload-app --type ios --file build/App.ipa \
  --apiKey "$ASC_KEY_ID" --apiIssuer "$ASC_ISSUER_ID"
```

`ExportOptions.plist` needs `method` = `app-store-connect` (Xcode 15.3+ name; `app-store` still accepted) and your `teamID`. Setting `destination` = `upload` makes `-exportArchive` upload directly.

3. `npx cap build ios` (wraps `xcodebuild` archive/export; supports `--scheme`, `--configuration`, `--xcode-team-id`).
4. Transporter app, Fastlane `pilot`/`deliver`, or Capgo Cloud Build (`capgo-native-builds`).

## Info.plist and privacy

- Every permission a plugin can trigger needs a usage string, even if your code path rarely runs. Missing ones fail upload (ITMS-90683) or crash at runtime.
- Write specific purposes ("Scan receipts to attach them to expenses"), not "This app needs camera access".
- `ITSAppUsesNonExemptEncryption` = `false` skips the export compliance question when you only use HTTPS/OS crypto. Set `true` and answer the questionnaire if you ship custom crypto.
- `NSUserTrackingUsageDescription` only if you call App Tracking Transparency; requesting ATT without tracking is a rejection risk.
- `PrivacyInfo.xcprivacy` in the App target (Copy Bundle Resources): declare required-reason APIs used by your own code and plugins without manifests (`UserDefaults` -> `CA92.1` is common because Capacitor Preferences uses it). App Privacy answers in App Store Connect must cover all collected data, including third-party SDKs.

## App Store Connect fields

| Field | Limit / rule |
|---|---|
| Name | 30 characters |
| Subtitle | 30 characters |
| Promotional text | 170 characters, editable without review |
| Description | 4000 characters |
| Keywords | 100 bytes, comma-separated, no spaces needed |
| What's New | required for updates |
| Support URL | required; Privacy Policy URL required for all apps |
| Age rating | new questionnaire (4+, 9+, 13+, 16+, 18+) |

## TestFlight

- Internal testers (up to 100 team members) get builds after processing, no review.
- External testers (up to 10,000) need Beta App Review for the first build of a version.
- Builds expire after 90 days.

## Review submission

- Demo account with working credentials (or demo mode) in App Review Information; backend must be live.
- Review notes: explain non-obvious features, hardware requirements, and live update usage (Capgo updates only change web assets; native code changes still go through review).
- Phased release for automatic updates: 7-day rollout (1%, 2%, 5%, 10%, 20%, 50%, 100%), can be paused up to 30 days total; users can still update manually.
