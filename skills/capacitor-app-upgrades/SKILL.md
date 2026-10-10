---
name: capacitor-app-upgrades
description: Routes and drives a Capacitor app upgrade across one or more major versions (4 to 9), including the required 8.4 to 8.5 iOS UIScene step before Capacitor 9 and Xcode 27. Detects the current version, plans the hop order (e.g. 6 to 7 to 8 to 8.5 to 9), runs `npx cap migrate` per hop, delegates each hop to its version skill, and verifies native builds between hops. Use for "upgrade Capacitor", "update to the latest Capacitor", "cap migrate", multi-version jumps, or when the target version is unclear. Do not use for plugin library upgrades (use capacitor-plugin-upgrades), Cordova apps (use cordova-to-capacitor), or non-Capacitor frameworks.
allowed-tools:
  - Bash(node -e *)
  - Bash(find *)
  - Bash(npm *)
  - Bash(npx cap *)
---

# Capacitor App Upgrade (router)

Plan and run a Capacitor app upgrade one hop at a time, using the version-specific skill for each hop.

## When to Use

TRIGGER when:
- User wants to upgrade a Capacitor app and the start or target version is unknown or more than one major apart
- User asks for "the latest Capacitor" (decide stable 8.5.x vs prerelease 9 with them)
- Xcode 27 builds fail on a Capacitor 8.4-or-older app (needs the 8.5 UIScene step)
- `npx cap migrate` failed midway and the user needs to know where they are

Do not use:
- Plugin library repos -> `capacitor-plugin-upgrades`
- Cordova/PhoneGap apps -> `cordova-to-capacitor`
- CocoaPods to SPM only -> `cocoapods-to-spm`

## Live Project Snapshot

Current Capacitor packages from `package.json`:
!`node -e "const fs=require('fs');if(!fs.existsSync('package.json'))process.exit(0);const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));const out=[];for(const section of ['dependencies','devDependencies']){for(const [name,version] of Object.entries(pkg[section]||{})){if(name.startsWith('@capacitor/'))out.push(section+'.'+name+'='+version)}}console.log(out.sort().join('\n'))"`

Native and Capacitor config paths:
!`find . -maxdepth 3 \( -name 'capacitor.config.json' -o -name 'capacitor.config.ts' -o -name 'capacitor.config.js' -o -path './ios' -o -path './android' \)`

## Version Map (October 2026)

| Hop | Skill | Key requirements after the hop |
|---|---|---|
| 4 -> 5 | `capacitor-app-upgrade-v4-to-v5` | see skill |
| 5 -> 6 | `capacitor-app-upgrade-v5-to-v6` | see skill |
| 6 -> 7 | `capacitor-app-upgrade-v6-to-v7` | see skill |
| 7 -> 8 | `capacitor-app-upgrade-v7-to-v8` | Node 22, Xcode 26, iOS 15, minSdk 24, SDK 36, AGP 8.13, Gradle 8.14.3 |
| 8.x -> 8.5 | `capacitor-uiscene-migration` | iOS UIScene lifecycle (SceneDelegate + scene manifest); required by Xcode 27 |
| 8.5 -> 9 | `capacitor-app-upgrade-v8-to-v9` | Node 24, Xcode 27, iOS 16, minSdk 26, SDK 37, AGP 9.2.1, Gradle 9.5.1 |

Capacitor stable is 8.5.x (`latest`). Capacitor 9 is a prerelease on the `next` tag (9.0.0-alpha.x): install with `@next` until 9.0.0 is GA, then `@latest`. Ask before moving a production app to a prerelease; 8.5 is the safe stopping point and already builds with Xcode 27.

## Procedure

1. **Detect.** Read `@capacitor/core` from the snapshot (`npm ls @capacitor/core` if ranges are ambiguous). For 8.x, also check whether UIScene is adopted: `grep -c UIApplicationSceneManifest ios/App/App/Info.plist`.
2. **Pick the target with the user** if not stated: stable (8.5.x) or prerelease (9).
3. **Plan hops.** One major at a time, never skip. From 8.0-8.4 to 9, insert the 8.5 UIScene hop first. Examples:
   - 6 -> 9: 6->7, 7->8, 8->8.5 (UIScene), 8.5->9
   - 8.2 -> 9: 8.2->8.5 (UIScene), 8.5->9
   - 8.5 without scene manifest -> 9: run `capacitor-uiscene-migration` first
   For big apps, write the hops as a TODO list and confirm it with the user.
4. **Per hop:** clean git tree, load that hop's skill, install the CLI for the target (`npm i -D @capacitor/cli@<major>` or `@next` for 9), run `npx cap migrate`, finish its manual checklist, `npx cap sync`, then build iOS and Android. Do not start the next hop until both build. Suggest a commit per hop so failures are bisectable.
5. **Plugins.** After each hop, align official `@capacitor/*` plugins to the same major and check third-party/`@capgo/*` plugins' peer ranges (`npm view <pkg> peerDependencies`).
6. **Final verification** (below), then offer follow-ups: `cocoapods-to-spm` (CocoaPods Trunk expected read-only December 2, 2026), Capgo live updates channel per native version.

## Verification

```bash
npx cap doctor
npm run build && npx cap sync
cd android && ./gradlew assembleDebug && cd ..
xcodebuild -project ios/App/App.xcodeproj -scheme App -destination 'generic/platform=iOS Simulator' build   # CocoaPods: -workspace ios/App/App.xcworkspace
npx cap run ios
npx cap run android
```

On device: launch, `pause`/`resume`, deep link cold + warm, push registration, one call per native plugin. If the app ships OTA updates (Capgo), a new native version needs a new native build; never send a bundle built for v9 to v8 binaries (see `capgo-live-updates`).

## Error Handling

- `cap migrate` stops partway -> finish that hop manually from its skill; do not start the next major.
- `Migrate can only be used on Capacitor 7` -> the installed CLI is newer than the project; step down with the older CLI first.
- `UIScene migration: project is in a partial state` -> `capacitor-uiscene-migration` handles it.
- iOS build fails after a hop -> check deployment target and Xcode version against the Version Map.
- Android build fails -> check AGP, Gradle wrapper, JDK, and `variables.gradle` against the hop's skill.
- Third-party plugin blocks a hop -> upgrade it, replace it (check `capacitor-plugins` for a Capgo equivalent), or pause at the current hop.
