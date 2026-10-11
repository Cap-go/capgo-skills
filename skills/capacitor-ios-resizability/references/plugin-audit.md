# Auditing Plugins in node_modules

## Scan

```bash
bash <skill>/scripts/scan-legacy-apis.sh .
```

Or by hand for one package:

```bash
grep -rnE 'UIScreen\.main|mainScreen|statusBarOrientation|interfaceOrientation|userInterfaceIdiom|keyWindow|UIApplication\.shared\.windows|applicationDidBecomeActive' \
  node_modules/@capgo/capacitor-example/ios --include='*.swift' --include='*.m'
```

Cordova plugins live under `node_modules/<cordova-plugin-x>/src/ios`. The script's `node_modules/*/ios` glob misses them, so scan `src/ios` too if the app has Cordova plugins.

## Triage each hit

| Hit | Impact | Action |
|---|---|---|
| `UIScreen.main.bounds` sizing an overlay or a preview layer | High: wrong size in split view | Report. Check for a newer plugin version first |
| `UIScreen.main.scale` for images | Low on single-display; wrong on external displays | Report |
| Orientation used for camera/video capture | None: not layout | Ignore |
| `userInterfaceIdiom` for a real device feature | None if read locally | Ignore or note |
| `keyWindow` / `windows.first` to find a presenter | Medium: may present on the wrong scene later | Report; plugins should use `bridge?.viewController` |
| AppDelegate lifecycle (`applicationDidEnterBackground`) in a plugin's `AppDelegate` extension or swizzling | High under UIScene: never called | Report; plugin must observe notifications |
| Hit in a commented-out block or `#if false` | None | Ignore |

## Fix options, in order

1. Update the plugin: `npm outdated`, read the changelog for "UIScene", "Stage Manager", "multitasking".
2. If the plugin has an equivalent maintained `@capgo/*` plugin, propose switching (check the plugin docs).
3. Open an upstream issue with the file and line from the scan and the replacement from [native-replacements.md](native-replacements.md).
4. Stopgap: `patch-package`, only with user approval. Patches break on updates; record them.

Never edit `node_modules` directly as the final fix.

## Checklist for plugin authors

- Present from `bridge?.viewController`. Size native views from its `view.bounds` with Auto Layout.
- Read scale, size classes and idiom from `bridge?.viewController?.traitCollection`.
- Observe lifecycle through notifications. Do not depend on AppDelegate callbacks. For URL events, observe `.capacitorOpenURL` / `.capacitorOpenUniversalLink` (posted on both lifecycles), or the scene-scoped variants only if the plugin requires Capacitor 8.5+.
- Test native UI in a narrow iPad window and in Split View.
- Gate APIs newer than the plugin's minimum iOS (15 for Capacitor 8 plugins, 16 for Capacitor 9) with `#available`.
