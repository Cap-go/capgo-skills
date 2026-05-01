---
name: capacitor-plugin-upgrades
description: Guides the agent through upgrading a Capacitor plugin to a newer major version. Covers dependency alignment, native platform changes, example app verification, and multi-version jumps. Do not use for app project upgrades or non-Capacitor plugin frameworks.
allowed-tools:
  - Bash(node -e *)
  - Bash(find *)
  - Bash(npm *)
  - Bash(npx *)
---

# Capacitor Plugin Upgrade

Upgrade a Capacitor plugin to a newer major version.

## When to Use This Skill

- User wants to bump a Capacitor plugin package to a newer major version
- User needs help adapting native code to a new Capacitor major release
- User wants to verify the plugin still works in its example app after the upgrade

## Live Project Snapshot

Plugin and Capacitor package snapshot:
!`node -e "const fs=require('fs');if(!fs.existsSync('package.json'))process.exit(0);const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));const out=['package.name='+(pkg.name||''),'package.version='+(pkg.version||'')];for(const section of ['peerDependencies','dependencies','devDependencies']){for(const [name,version] of Object.entries(pkg[section]||{})){if(name.startsWith('@capacitor/'))out.push(section+'.'+name+'='+version)}}console.log(out.join('\n'))"`

Example and native project paths:
!`find . -maxdepth 3 \( -path './example-app' -o -path './ios' -o -path './android' -o -name 'capacitor.config.json' -o -name 'capacitor.config.ts' -o -name 'capacitor.config.js' \)`

## Procedures

### Step 1: Detect the Current Version

Start from the injected snapshot above, then inspect `package.json` if the Capacitor ranges or package version need confirmation.

Ask the user to confirm the exact target major version before proceeding.

### Step 2: Upgrade Sequentially

For each major jump:

1. Update `@capacitor/*` peer dependencies and native bridge code as needed.
2. Adjust iOS and Android native project settings for the target Capacitor version.
3. Run `npm install`.
4. Run `npx cap sync` from the example or test app directory that contains `capacitor.config.*`, or rebuild that app with the repository's documented command.
5. Verify the plugin API still works in the example app or test app.

Do not skip intermediate major versions.

### Step 3: Check Plugin-Specific Surface Area

Review these plugin areas carefully:

- TypeScript definitions and exported names
- Native method signatures and return payloads
- Android namespace, Gradle settings, and Java compatibility
- iOS deployment target, Swift syntax, and bridge registration
- Documentation snippets and README install steps

### Step 4: Final Verification

Check whether `npm run verify` exists in `package.json` or the repository scripts.

If it exists, run:

```bash
npm run verify
```

If it does not exist, run the repository's documented fallback checks instead:

- `npm run build`
- `npm test`
- `npx cap sync` from the example/test app directory
- the example app or test app build for every shipped platform

Run the sync and build commands from the plugin's example/test app directory, not the plugin root.

## Error Handling

- If a migration tool exists for the target version, use it first and then review the diff manually.
- If the example app breaks, fix the plugin API or native wiring before publishing the version bump.
- If a plugin supports multiple platforms, verify every platform that ships in the package.
