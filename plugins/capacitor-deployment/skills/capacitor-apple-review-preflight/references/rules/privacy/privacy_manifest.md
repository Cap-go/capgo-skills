# Rule: Privacy Manifest and Required Reason APIs
- **Guideline**: 5.1.1 – Legal – Privacy, plus App Store Connect upload validation
- **Severity**: REJECTION (upload warning email first; listed SDKs without manifests block submission)
- **Category**: privacy

## What to Check

Two separate obligations:

1. **Your app's manifest** (`PrivacyInfo.xcprivacy` in the App target) declares required-reason APIs used by app code and by any native code without its own manifest, plus tracking status and collected data types.
2. **Third-party SDK manifests**: SDKs on Apple's privacy-impacting SDK list must ship their own privacy manifest (and a signature when distributed as a binary). Since Feb 12, 2025, new apps and updates that add a listed SDK without a manifest are rejected at upload (ITMS-91061).

Capacitor specifics:
- `@capacitor/ios` (Capacitor framework) and `CapacitorCordova` ship their own `PrivacyInfo.xcprivacy`; you do not redeclare their APIs.
- Plugins are separate pods/SPM packages. Maintained `@capacitor/*` and `@capgo/*` plugins ship manifests; old community or Cordova plugins often do not. Their API usage must then be covered by the app manifest or the plugin updated/replaced.
- `@capacitor/preferences` and many plugins use `UserDefaults` (`CA92.1`). File timestamp and disk space APIs show up in filesystem, cache, and updater plugins.

### Required Reason API Categories

| Category (`NSPrivacyAccessedAPIType`) | Common APIs | Typical reason codes |
|---|---|---|
| `NSPrivacyAccessedAPICategoryUserDefaults` | `UserDefaults` | `CA92.1` app-only data, `1C8F.1` App Group |
| `NSPrivacyAccessedAPICategoryFileTimestamp` | `creationDate`, `modificationDate`, `stat()`, `getattrlist()` | `C617.1` files in app container, `DDA9.1` display to user, `3B52.1` user-selected files |
| `NSPrivacyAccessedAPICategorySystemBootTime` | `systemUptime`, `mach_absolute_time()` | `35F9.1` measure elapsed time |
| `NSPrivacyAccessedAPICategoryDiskSpace` | `volumeAvailableCapacityKey`, `statfs()` | `E174.1` check space before writing, `85F4.1` display to user |
| `NSPrivacyAccessedAPICategoryActiveKeyboards` | `activeInputModes` | `3EC4.1` custom keyboard, `54BD.1` customize UI |

Use only reason codes from Apple's current list (developer.apple.com/documentation/bundleresources/describing-use-of-required-reason-api); pick the one that matches actual behaviour.

### Manifest keys
- `NSPrivacyTracking` (bool) and `NSPrivacyTrackingDomains` (array) - must match ATT usage.
- `NSPrivacyCollectedDataTypes` - data the app collects; must agree with App Store Connect App Privacy answers.
- `NSPrivacyAccessedAPITypes` - required-reason APIs with reasons.

## How to Detect

```bash
# App manifest present and in the App target?
find ios -name "PrivacyInfo.xcprivacy" -not -path "*/Pods/*" -not -path "*/.build/*"
grep -c "PrivacyInfo.xcprivacy" ios/App/App.xcodeproj/project.pbxproj

# Which plugin packages ship their own manifest?
for d in node_modules/@*/*/ios node_modules/cordova-plugin-*/src/ios; do
  [ -d "$d" ] || continue
  if find "$d" -name PrivacyInfo.xcprivacy | grep -q .; then echo "OK   $d"; else echo "NONE $d"; fi
done

# Required reason API usage in app native code and plugins without manifests
grep -rn "UserDefaults\|NSUserDefaults" --include="*.swift" --include="*.m" ios/App node_modules/*/ios node_modules/@*/*/ios 2>/dev/null | head
grep -rn "creationDate\|modificationDate\|NSFileCreationDate\|NSFileModificationDate\|systemUptime\|mach_absolute_time\|volumeAvailableCapacity\|statfs" --include="*.swift" --include="*.m" ios/App 2>/dev/null

plutil -lint ios/App/App/PrivacyInfo.xcprivacy
```

After archiving, Xcode Organizer -> right-click archive -> Generate Privacy Report aggregates all manifests in the build; review it for gaps.

## Resolution

1. Create `ios/App/App/PrivacyInfo.xcprivacy` (Xcode: File -> New -> File -> App Privacy) and tick the App target so it lands in Copy Bundle Resources.
2. Declare categories and reasons for APIs used by app code and by plugins that lack manifests.
3. Update or replace plugins/SDKs named in ITMS-91061 emails. Do not copy an SDK's practices into the app manifest; Apple wants the SDK to describe itself.
4. Re-run the privacy report and reconcile with App Store Connect App Privacy answers.

### Minimal Example
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>NSPrivacyTracking</key>
    <false/>
    <key>NSPrivacyTrackingDomains</key>
    <array/>
    <key>NSPrivacyCollectedDataTypes</key>
    <array/>
    <key>NSPrivacyAccessedAPITypes</key>
    <array>
        <dict>
            <key>NSPrivacyAccessedAPIType</key>
            <string>NSPrivacyAccessedAPICategoryUserDefaults</string>
            <key>NSPrivacyAccessedAPITypeReasons</key>
            <array>
                <string>CA92.1</string>
            </array>
        </dict>
    </array>
</dict>
</plist>
```

## Example Upload Emails

> ITMS-91053: Missing API declaration - Your app's code in the "App" file references one or more APIs that require reasons, including the following API categories: NSPrivacyAccessedAPICategoryUserDefaults. While no action is required at this time, starting May 1, 2024, when you upload a new app or app update, you must include a NSPrivacyAccessedAPITypes array in your app's privacy manifest to provide approved reasons for these APIs used by your app's code.

> ITMS-91061: Missing privacy manifest - Your app includes "Frameworks/<SDK>.framework/<SDK>", which includes <SDK>, an SDK that was identified in the documentation as a privacy-impacting third-party SDK. Starting February 12, 2025, if a new app includes a privacy-impacting SDK, or an app update adds a new privacy-impacting SDK, the SDK must include a privacy manifest file.

Wording in current emails may differ slightly; match on the ITMS code and the category or SDK name.
