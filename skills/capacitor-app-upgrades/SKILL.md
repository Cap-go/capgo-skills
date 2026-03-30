---
name: capacitor-app-upgrades
description: "Upgrades @capacitor/core and platform packages one major version at a time, runs npx cap migrate for automated changes, aligns native project settings (iOS deployment target, Gradle/Java versions), and verifies builds. Use when updating Capacitor from one major version to another, performing multi-version jumps, or fixing a failed cap migrate. Do not use for plugin library upgrades or non-Capacitor mobile frameworks."
allowed-tools: "Bash(node -e *), Bash(find *)"
---

# Capacitor App Upgrade

Upgrade a Capacitor app project to a newer major version.

## When to Use

- Upgrading @capacitor/core across one or more major versions
- Running `npx cap migrate` or fixing a failed migration
- Aligning native platform requirements after a Capacitor version bump

## Live Project Snapshot

Current Capacitor packages from `package.json`:
!`node -e "const fs=require('fs');if(!fs.existsSync('package.json'))process.exit(0);const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));const out=[];for(const section of ['dependencies','devDependencies']){for(const [name,version] of Object.entries(pkg[section]||{})){if(name.startsWith('@capacitor/'))out.push(section+'.'+name+'='+version)}}console.log(out.sort().join('\n'))"`

Native and Capacitor config paths:
!`find . -maxdepth 3 \( -name 'capacitor.config.json' -o -name 'capacitor.config.ts' -o -name 'capacitor.config.js' -o -path './ios' -o -path './android' \)`

## Procedures

### Step 1: Detect the Current Version

Start from the injected snapshot above, then confirm `@capacitor/core` in `package.json` if anything looks inconsistent.

If the target version is not specified, ask the user to confirm an explicit major version before proceeding.

### Step 2: Upgrade One Major Version at a Time

Do not skip intermediate major versions.

For each version jump:

1. Update `@capacitor/core`, `@capacitor/cli`, `@capacitor/ios`, `@capacitor/android` to the target major version in `package.json`.
2. Run `npm install`.
3. Run `npx cap migrate` (available in Capacitor 5+). For Capacitor 4 and below, apply changes manually per the official migration guide.
4. Sync native projects: `npx cap sync`.
5. Verify builds before continuing:
   ```bash
   # iOS
   cd ios && xcodebuild -workspace App.xcworkspace -scheme App -destination 'generic/platform=iOS' build && cd ..
   # Android
   cd android && ./gradlew assembleDebug && cd ..
   ```

If `npx cap migrate` only partially completes, finish the remaining changes for the current major version manually and re-verify builds before moving to the next version.

### Step 3: Check Native Projects

Review the platform projects for version-specific requirements:

| Capacitor | iOS Deployment Target | Xcode | Gradle | Java |
|-----------|-----------------------|-------|--------|------|
| v5        | 13.0+                 | 14+   | 8.0+   | 17   |
| v6        | 13.0+                 | 15+   | 8.2+   | 17   |
| v7        | 14.0+                 | 15+   | 8.7+   | 21   |
| v8        | 16.0+                 | 16+   | 8.11+  | 21   |

Check `ios/App/App.xcodeproj` for deployment target and `android/build.gradle` for Gradle/Java settings. Update any plugin-specific native changes introduced by the new major version.

### Step 4: Final Verification

Run the project checks that matter for the app:

```bash
npm install
npx cap sync
npx cap run ios
npx cap run android
```

If the app has a custom test or build pipeline, run that as well.

## Error Handling

- If the automated migration step only partially completes, finish the current major version manually before trying the next one.
- If iOS fails, verify the deployment target and Xcode version match the target Capacitor major version.
- If Android fails, verify the Gradle and Java requirements for the target version.
- If the app uses plugins with their own upgrade constraints, handle those plugins separately after the app version is stable.
