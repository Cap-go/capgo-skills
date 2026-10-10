---
name: capacitor-plugin-upgrade-v5-to-v6
description: Upgrades a Capacitor plugin library from v5 to v6 using `npx @capacitor/plugin-migration-v5-to-v6@latest`, then the manual checklist - `@capacitor/*` dev deps to `latest-6`, `compileSdkVersion` replaced by `compileSdk`, compile/target SDK 34 defaults, AGP 8.2.1, Gradle 8.2.1, Kotlin 1.9.10, plus code changes - `addListener` in `definitions.ts` returns only `Promise<PluginListenerHandle>` (drop `& PluginListenerHandle`), remove `CAP_PLUGIN_METHOD(removeAllListeners, ...)` from the `.m` file, and optional experimental SPM support via `Package.swift`. Use when a plugin targets Capacitor 5 and must support 6. Do not use for app upgrades, other major versions, or non-Capacitor libraries.
allowed-tools:
  - Bash(node -e *)
  - Bash(find *)
---

# Capacitor Plugin Upgrade v5 to v6

Move a plugin library to Capacitor 6. Source of truth: https://capacitorjs.com/docs/updating/plugins/6-0

## When to Use

- Snapshot shows `@capacitor/core` 5.x and the plugin must work in Capacitor 6 apps.
- `definitions.ts` still declares `Promise<PluginListenerHandle> & PluginListenerHandle`.
- The user wants to add SPM support while moving to 6.

Do not use:

- Upgrading an app -> `capacitor-app-upgrade-v5-to-v6`.
- Plugin on 4.x -> `capacitor-plugin-upgrade-v4-to-v5` first; on 6.x -> `capacitor-plugin-upgrade-v6-to-v7`. Multi-hop -> `capacitor-plugin-upgrades`.
- Full SPM conversion details -> `capacitor-plugin-spm-support`.

## Live Project Snapshot

Plugin and Capacitor package snapshot:
!`node -e "const fs=require('fs');if(!fs.existsSync('package.json'))process.exit(0);const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));const out=['package.name='+(pkg.name||''),'package.version='+(pkg.version||'')];for(const section of ['peerDependencies','dependencies','devDependencies']){for(const [name,version] of Object.entries(pkg[section]||{})){if(name.startsWith('@capacitor/'))out.push(section+'.'+name+'='+version)}}console.log(out.join('\n'))"`

Example and native project paths:
!`find . -maxdepth 3 \( -path './example-app' -o -path './ios' -o -path './android' \)`

## References

| File | Load when |
| --- | --- |
| `references/android.md` | Applying Gradle or Kotlin changes by hand |

## Preflight

| Tool | Minimum |
| --- | --- |
| Node.js | 18+ |
| Xcode | 15.0+ |
| Java | 17 |
| AGP / Gradle | 8.2.1 / 8.2.1 |
| Android SDK defaults | compileSdk 34, targetSdk 34, minSdk 22 |
| iOS deployment target | 13.0 (unchanged) |

## Procedure

1. Confirm 5.x and a clean tree.
2. From the plugin root:

   ```bash
   npx @capacitor/plugin-migration-v5-to-v6@latest
   ```

   Review `git diff`.
3. Finish manually (`references/android.md`): dev deps to `latest-6`, peer `@capacitor/core` to `^6.0.0`, `compileSdk` (not `compileSdkVersion`) default 34, `targetSdkVersion` default 34, AGP 8.2.1, Gradle 8.2.1, Kotlin 1.9.10.
4. **definitions.ts**: every `addListener` overload must return only `Promise<PluginListenerHandle>`:

   ```diff
     addListener(
       eventName: 'resume',
       listenerFunc: () => void,
   - ): Promise<PluginListenerHandle> & PluginListenerHandle;
   + ): Promise<PluginListenerHandle>;
   ```

   Update `web.ts` and README/docgen output to match. This is a breaking change for consumers who used the sync handle.
5. **iOS**: delete `CAP_PLUGIN_METHOD(removeAllListeners, CAPPluginReturnPromise);` from the plugin `.m` file. It is now built in for all plugins.
6. **Optional SPM**: Capacitor 6 adds experimental SPM. Ask the user if they want it now; if yes follow `capacitor-plugin-spm-support` (adds `Package.swift`, `CAPBridgedPlugin` conformance in Swift).
7. Upgrade the example app via `capacitor-app-upgrade-v5-to-v6`, bump the plugin major, note "Requires Capacitor 6".

## Verification

```bash
grep -n "\"@capacitor/" package.json                               # 6.x
grep -rn "& PluginListenerHandle" src/                             # expect none
grep -rn "removeAllListeners" ios/ --include=*.m 2>/dev/null       # expect none
grep -n "compileSdkVersion project\|gradle:8.2.1" android/build.gradle   # compileSdk + 8.2.1
grep -n "distributionUrl" android/gradle/wrapper/gradle-wrapper.properties   # gradle-8.2.1
npm run build
npm run verify        # if the repo has the template verify scripts
```

Run the example app on both platforms; add and remove each listener.

## Error Handling

| Error | Fix |
| --- | --- |
| TS: `Property 'remove' does not exist on type 'Promise<PluginListenerHandle>'` in example/tests | `await` the `addListener` call. |
| AGP deprecation warning on `compileSdkVersion` | Use `compileSdk`. |
| `removeAllListeners` still listed in the `.m` file | Remove the `CAP_PLUGIN_METHOD` line (step 5); the method is built in. |
| Example app `ERESOLVE` on `@capacitor/core` | Peer range still `^5`; set `^6.0.0`. |
