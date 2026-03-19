---
name: capacitor-app-upgrade-v7-to-v8
description: Guides the agent through upgrading a Capacitor app from v7 to v8. Use when the project is on Capacitor 7 and needs the v8 migration path. Do not use for other major versions, plugin-only upgrades, or non-Capacitor apps.
allowed-tools:
  - Bash(node -e *)
---

# Capacitor App Upgrade v7 to v8

Upgrade a Capacitor app from version 7 to version 8.

## When to Use This Skill

- User says the app is on Capacitor 7 and must move to v8
- User wants the exact v7 to v8 migration path
- User needs v8-specific native and package updates

## Live Project Snapshot

Current Capacitor packages from `package.json`:
!`node -e "const fs=require('fs');if(!fs.existsSync('package.json'))process.exit(0);const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));const out=[];for(const section of ['dependencies','devDependencies']){for(const [name,version] of Object.entries(pkg[section]||{})){if(name.startsWith('@capacitor/'))out.push(section+'.'+name+'='+version)}}console.log(out.sort().join('\n'))"`

## Procedure

1. Start from the injected package snapshot and confirm the current `@capacitor/core` version.
2. Update all `@capacitor/*` packages to the v8-compatible range.
3. Review the v7 to v8 migration notes before editing native files.
4. Run `npm install`.
5. Sync with `npx cap sync`.
6. Verify the iOS and Android builds.

## Error Handling

- If the automated migration misses a package, update it manually before syncing again.
- If iOS fails, check the deployment target and Xcode compatibility for Capacitor 8.
- If Android fails, check the Gradle and Java requirements for Capacitor 8.
