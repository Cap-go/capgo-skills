---
name: capacitor-plugin-upgrade-v7-to-v8
description: Guides the agent through upgrading a Capacitor plugin from v7 to v8. Use when the plugin targets Capacitor 7 and needs the v8 migration path. Do not use for app upgrades, other major versions, or non-Capacitor plugins.
allowed-tools:
  - Bash(node -e *)
  - Bash(find *)
---

# Capacitor Plugin Upgrade v7 to v8

Upgrade a Capacitor plugin from version 7 to version 8.

## When to Use This Skill

- User says the plugin targets Capacitor 7 and must move to v8
- User wants the exact v7 to v8 migration path
- User needs v8-specific native and package updates

## Live Project Snapshot

Plugin and Capacitor package snapshot:
!`node -e "const fs=require('fs');if(!fs.existsSync('package.json'))process.exit(0);const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));const out=['package.name='+(pkg.name||''),'package.version='+(pkg.version||'')];for(const section of ['peerDependencies','dependencies','devDependencies']){for(const [name,version] of Object.entries(pkg[section]||{})){if(name.startsWith('@capacitor/'))out.push(section+'.'+name+'='+version)}}console.log(out.join('\n'))"`

Example and native project paths:
!`find . -maxdepth 3 \( -path './example-app' -o -path './ios' -o -path './android' \)`

## Procedure

1. Start from the injected snapshot and confirm the current Capacitor peer dependency range in `package.json`.
2. Update the peer dependency range to Capacitor 8.
3. Review the v7 to v8 migration notes before editing native files.
4. Update the example app if it exists.
5. Run `npm install`.
6. Sync and verify the example or test app.

## Error Handling

- If the example app breaks, fix the plugin API or native bridge before moving on.
- If iOS fails, verify the deployment target for Capacitor 8.
- If Android fails, verify the Gradle and Java requirements for Capacitor 8.
