---
name: capacitor-plugin-upgrades
description: Routes and drives a Capacitor plugin library upgrade across one or more major versions (4 to 9), including the iOS UIScene lifecycle audit that Capacitor 8.5 and 9 require. Detects the supported Capacitor range, plans hops (e.g. 7 to 8 to 9), runs each official plugin migrator, delegates to the per-version skill, and verifies TypeScript, Android, iOS (podspec and Package.swift) and the example app. Use for "upgrade my plugin to the latest Capacitor", "support Capacitor 9 in my plugin", bumping peerDependencies, or multi-version plugin jumps. Do not use for app projects (use capacitor-app-upgrades) or non-Capacitor plugin frameworks.
allowed-tools:
  - Bash(node -e *)
  - Bash(find *)
  - Bash(npm *)
  - Bash(npx *)
---

# Capacitor Plugin Upgrade (router)

Plan and run a plugin upgrade one major at a time, using the version-specific skill for each hop.

## When to Use

TRIGGER when:
- Plugin maintainer wants support for a newer Capacitor major and the hop count is unclear
- `peerDependencies["@capacitor/core"]` lags the app's Capacitor version
- Users of the plugin report it breaks on Capacitor 8.5 scene-based apps or on Capacitor 9

Do not use:
- App projects -> `capacitor-app-upgrades`
- Adding SPM to a plugin -> `capacitor-plugin-spm-support`
- Cordova plugin to Capacitor plugin conversion -> `cordova-to-capacitor`

## Live Project Snapshot

Plugin and Capacitor package snapshot:
!`node -e "const fs=require('fs');if(!fs.existsSync('package.json'))process.exit(0);const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));const out=['package.name='+(pkg.name||''),'package.version='+(pkg.version||'')];for(const section of ['peerDependencies','dependencies','devDependencies']){for(const [name,version] of Object.entries(pkg[section]||{})){if(name.startsWith('@capacitor/'))out.push(section+'.'+name+'='+version)}}console.log(out.join('\n'))"`

Example and native project paths:
!`find . -maxdepth 3 \( -path './example-app' -o -path './ios' -o -path './android' -o -name 'capacitor.config.json' -o -name 'capacitor.config.ts' -o -name 'capacitor.config.js' \)`

## Version Map (October 2026)

| Hop | Skill | Notes |
|---|---|---|
| 4 -> 5 | `capacitor-plugin-upgrade-v4-to-v5` | |
| 5 -> 6 | `capacitor-plugin-upgrade-v5-to-v6` | |
| 6 -> 7 | `capacitor-plugin-upgrade-v6-to-v7` | |
| 7 -> 8 | `capacitor-plugin-upgrade-v7-to-v8` | iOS 15, SDK 36, AGP 8.13 |
| 8.5 lifecycle | `capacitor-uiscene-migration` (`references/plugin-audit.md`) | Audit only; no version bump needed if the plugin follows the one-release rules |
| 8 -> 9 | `capacitor-plugin-upgrade-v8-to-v9` | `npx @capacitor/plugin-migration-v8-to-v9@latest`, iOS 16, SDK 37, AGP 9.2.1, API removals |

Capacitor 9 is a prerelease (`next` tag, 9.0.0-alpha.x). Use `next` / `>=9.0.0-alpha.6` ranges until GA; consider publishing the plugin's v9 release under the npm `next` tag too. Ask the user before dropping support for the current stable major.

## Procedure

1. **Detect** the supported range (peer dependency, `Package.swift` `capacitor-swift-pm` requirement, podspec `Capacitor` dependency, `android/build.gradle` defaults). Confirm the target major with the user.
2. **Plan hops**, one major at a time. When crossing 8 -> 9, run the UIScene plugin audit as part of the hop. Example: 7 -> 9 = 7->8, UIScene audit, 8->9.
3. **Per hop:** clean git tree, load the hop skill, run its official migrator first (`npx @capacitor/plugin-migration-v<from>-to-v<to>@latest` where the skill names one), review the diff, finish the manual checklist, then verify (step 5) before the next hop.
4. **Surface area** to re-check every hop: TypeScript definitions and exported names, native method signatures and payloads, Android namespace and Java/Kotlin toolchain, iOS deployment target in podspec and `Package.swift` (keep both), README install and compatibility table.
5. **Verify** in the plugin root and in the example app.

## Verification

If `npm run verify` exists, run it. Otherwise:

```bash
npm run build
npm test --if-present
cd android && ./gradlew clean build && cd ..
xcodebuild -scheme <PluginScheme> -destination 'generic/platform=iOS Simulator' build   # find it with xcodebuild -list
cd example-app && npm install && npx cap sync && npx cap run ios && npx cap run android
```

Run `npx cap sync` and native runs from the example/test app, not the plugin root. Exercise each public method on every shipped platform.

## Error Handling

- Migrator for the hop fails or misses files -> finish manually from the hop skill before the next major.
- Example app breaks -> fix plugin API or native wiring before publishing.
- Consumers on CocoaPods and SPM both report issues -> check podspec and `Package.swift` declare the same platform and Capacitor range.
- Plugin breaks only in scene-based apps -> AppDelegate-method or `tmpWindow` assumptions; see `capacitor-uiscene-migration`.
