---
name: cordova-to-capacitor
description: Migrates an Apache Cordova, PhoneGap, or Ionic-Cordova app to Capacitor. Use when the project has config.xml, a platforms/ or plugins/ folder, cordova-* or phonegap-* dependencies, @awesome-cordova-plugins or @ionic-native wrappers, deviceready listeners, or cordova.plugins.* calls, and the user wants Capacitor native projects, Capacitor/Capgo plugin replacements, config.xml preference migration, and preserved localStorage/IndexedDB data (iosScheme/androidScheme). Covers keeping Cordova plugins temporarily, Capacitor 9 making the Cordova runtime optional (CapacitorCordova only bundled when a Cordova plugin is installed), skipped incompatible plugins, and removing Cordova afterwards. Do not use for porting a single Cordova plugin's native source into a Capacitor plugin, Capacitor major upgrades (capacitor-app-upgrades), Appflow/cordova-plugin-ionic live updates (ionic-appflow-migration), or non-Cordova web apps (webapp-to-capacitor, framework-to-capacitor).
allowed-tools:
  - Bash(node -e *)
  - Bash(find *)
  - Bash(cordova *)
  - Bash(npm *)
  - Bash(npx *)
---

# Cordova to Capacitor Migration

Move a Cordova app onto Capacitor incrementally: Capacitor first, plugins one by one, Cordova removed last.

## When to Use

TRIGGER when:
- `config.xml`, `platforms/`, `plugins/`, `cordova-android`/`cordova-ios`, or `cordova-plugin-*` are present and the user wants Capacitor.
- Code waits on `deviceready` or calls `navigator.camera`, `window.plugins.*`, `cordova.plugins.*`, `@awesome-cordova-plugins/*`, `@ionic-native/*`.
- After migration: data loss on first launch, missing Cordova plugin behaviour, or Capacitor 9 build errors referencing Cordova symbols.

Do not use for:
- Rewriting a Cordova plugin's Java/Objective-C as a Capacitor plugin (plugin-level port) -> follow Capacitor plugin docs; `capacitor-plugins` for existing replacements.
- Upgrading Capacitor majors -> `capacitor-app-upgrades`.
- Replacing Appflow Live Updates (`cordova-plugin-ionic`) -> `ionic-appflow-migration` + `capgo-live-updates`.
- Framework build config (Angular output path, Vite) -> `framework-to-capacitor`.

## Live Project Snapshot

Current migration-related packages:
!`node -e "const fs=require('fs');if(!fs.existsSync('package.json'))process.exit(0);const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));const out=[];for(const section of ['dependencies','devDependencies']){for(const [name,version] of Object.entries(pkg[section]||{})){if(name.includes('cordova')||name.includes('phonegap')||name.startsWith('@capacitor/')||name.startsWith('@capgo/')||name.startsWith('@ionic-native/')||name.startsWith('@awesome-cordova-plugins/')||name.startsWith('@ionic-enterprise/'))out.push(section+'.'+name+'='+version)}}if(pkg.cordova)out.push('cordova.plugins='+Object.keys(pkg.cordova.plugins||{}).join(','));console.log(out.sort().join('\n'))"`

Relevant config and platform paths:
!`find . -maxdepth 3 -not -path '*/node_modules/*' \( -name 'config.xml' -o -name 'capacitor.config.json' -o -name 'capacitor.config.ts' -o -name 'capacitor.config.js' -o -path './ios' -o -path './android' -o -path './platforms' -o -path './plugins' -o -name 'www' \)`

## Key Differences That Drive Decisions

- Capacitor native projects (`ios/`, `android/`) are source code you commit and edit; `npx cap sync` never regenerates them. Cordova `platforms/` is a build artifact.
- Capacitor does not apply `config.xml` or plugin `<config-file>` / `<edit-config>` edits at build time beyond what `cap sync` does for Cordova plugins. Permissions, entitlements, and Info.plist keys become manual, one-time edits.
- Cordova plugins still work in Capacitor (installed via npm, applied on `cap sync`). Hooks and `<variable>` install prompts do not run; set variables via `cordova.preferences` in `capacitor.config.*`.
- Origin changes: the app is served from `capacitor://localhost` (iOS) and `https://localhost` (Android) by default. Existing `localStorage`, IndexedDB, cookies, and service-worker data are tied to the old origin and look "lost" after the update unless you keep the scheme (see `references/config-and-data.md`).
- `deviceready` is not needed. Plugins are available after import; for remaining Cordova plugins, `deviceready` still fires because Capacitor's Cordova layer injects `cordova.js`.

### Capacitor 9: Cordova runtime is optional

On Capacitor 9, `npx cap sync` only wires in the Cordova compatibility layer when at least one installed plugin is a Cordova plugin:
- Android: `capacitor-cordova-android` / `capacitor-cordova-android-plugins` modules disappear from `settings.gradle` and `app/build.gradle` when there are none.
- iOS: `CapacitorCordova` is no longer added to the `Podfile` or `Package.swift`.

Implications:
- Removing the last Cordova plugin shrinks the app and drops `cordova.js` - good, but any app/native code that references Cordova symbols (`com.getcapacitor.cordova.CordovaPlugin`, `CDVPlugin`, `CDVPluginHandleOpenURL`, `window.cordova`) without a Cordova plugin installed fails to compile or is `undefined` at runtime.
- There is no config flag to force-include the runtime. Either remove those references or keep a Cordova plugin installed.
- `deviceready` listeners left in JS never fire once the runtime is gone. Remove them before removing the last Cordova plugin.
- On Capacitor 8 the runtime is always bundled, so this only surfaces on upgrade; check before moving to 9.

## Procedure

1. Audit (report to the user before editing):
   - `cordova --version`, `cordova platform ls`, `cordova plugin ls` (or `package.json` `cordova.plugins`).
   - `config.xml`: widget `id`, `version`, `<preference>`s, `<platform>` blocks, `<access>`/`<allow-navigation>`, icons/splash.
   - Which webview plugin is installed (`cordova-plugin-ionic-webview`, `cordova-plugin-wkwebview-engine`) and the current scheme/hostname - decides data preservation.
   - Every plugin: replacement exists, keep as Cordova plugin, or blocker. Use `references/plugin-mapping.md`.
   - Code using `deviceready`, `navigator.*` Cordova globals, `window.plugins`, Ionic Native wrappers.
2. Install Capacitor in the existing project and keep the same app ID:
   ```bash
   npm install @capacitor/core @capacitor/ios @capacitor/android
   npm install -D @capacitor/cli
   npx cap init "<name from config.xml>" <widget id from config.xml> --web-dir www
   ```
   `cap init` reads `config.xml` preferences into `cordova.preferences` in the Capacitor config. Make sure the web build outputs to the `webDir` (Ionic Angular: `www`).
3. Decide data preservation (scheme) before the first release: `references/config-and-data.md`.
4. `npm run build && npx cap add ios && npx cap add android`. Cordova plugins listed in `package.json` dependencies are installed into the new native projects; known-incompatible ones are skipped with a warning.
5. Port native configuration by hand: usage strings, permissions, entitlements, URL schemes, orientation, splash/icons (`npx @capacitor/assets generate`). See `references/config-and-data.md`.
6. Replace plugins one at a time (`references/plugin-mapping.md`), convert callback code to promises (`references/code-patterns.md`), `npx cap sync`, test on device after each.
7. Remove Cordova when nothing depends on it (see Removal). Keep Cordova plugins that have no replacement; they work.
8. Offer Capgo live updates once the Capacitor build is stable (`capgo-live-updates`).

## Removal

Only after every flow is verified on both platforms:

```bash
npm uninstall cordova cordova-ios cordova-android
npm uninstall cordova-plugin-ionic-webview cordova-plugin-splashscreen cordova-plugin-statusbar cordova-plugin-ionic-keyboard
rm -rf platforms plugins
git mv config.xml config.xml.bak   # keep for reference until release
npx cap sync
grep -rn "deviceready\|cordova\.\|window\.plugins" src --include=*.ts --include=*.js --include=*.tsx --include=*.vue
```

Remove the `cordova` block from `package.json` if no Cordova plugins remain. Do not run `cordova plugin rm` loops; they edit `platforms/` you are deleting anyway.

## Verification

- `npx cap sync` output lists only intended Cordova plugins and no "incompatible" surprises.
- `npx cap doctor` shows matching versions for core, cli, ios, android.
- Install the Capacitor build over the existing store version (same bundle ID, higher build number) on a device and confirm the user is still logged in and local data is present.
- Exercise every migrated plugin on real devices (camera, files, push token, geolocation, purchases).
- Capacitor 9: after removing the last Cordova plugin, `grep -rn "CapacitorCordova\|capacitor-cordova-android" ios android` returns nothing and the native build succeeds.

## Error Handling

| Error / symptom | Fix |
|---|---|
| `Found 1 incompatible Cordova plugin for ios, skipped install:` during sync | Plugin is on Capacitor's known-incompatible list; use the Capacitor equivalent |
| User data / login gone after updating from the Cordova build | Origin changed; set `server.iosScheme: 'ionic'` (old ionic-webview iOS) or match the old Android scheme/hostname, then ship again |
| `deviceready` handler never runs | Capacitor 9 with no Cordova plugins, or code expecting Cordova globals; call plugins directly |
| `"Camera" plugin is not implemented on ios` (any plugin name) | Plugin not installed in native project; `npx cap sync`, check `npx cap ls` |
| Cordova plugin variable missing (API key etc.) at build | Add it under `cordova.preferences` in `capacitor.config.*`, then `npx cap sync` |
| Android: `cannot find symbol class CordovaPlugin` / iOS: `No such module 'Cordova'` after Capacitor 9 upgrade | Cordova runtime no longer bundled; remove the reference or keep a Cordova plugin |
| Plugin with install hooks does nothing | Hooks do not run in Capacitor; replicate the hook's file edits manually |
| White screen after `cap add` | `webDir` wrong or web build not run; `npm run build` then `npx cap sync` |

## References

- `references/plugin-mapping.md` - Cordova plugin -> Capacitor/Capgo replacement table, incompatible list, keep-as-Cordova guidance.
- `references/config-and-data.md` - config.xml mapping, preferences, schemes and data preservation, permissions, splash/icons.
- `references/code-patterns.md` - callback-to-promise conversions for common plugins.

Related skills: `capacitor-plugins`, `capacitor-app-upgrades`, `capgo-live-updates`, `capacitor-app-store`.
