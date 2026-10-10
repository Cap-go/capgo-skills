# UIScene Audit Patterns

Run from the app root. Scope: `ios/App` (skip `Pods`, `build`, `DerivedData`, `.build`) and installed plugin sources in `node_modules`. Report every hit with file:line before editing anything.

```bash
EXCL="--exclude-dir=Pods --exclude-dir=build --exclude-dir=DerivedData --exclude-dir=.build"
```

## 1. Build blockers on 8.5

```bash
grep -rn $EXCL --include=*.swift --include=*.m --include=*.h -E '\btmpWindow\b|\bTmpViewController\b|tmpViewControllerAppeared' ios/App
```

Fix: delete. If the code presented UI from the temporary window, present from `bridge?.viewController` instead.

## 2. AppDelegate methods that stop running under scenes

```bash
grep -n -E 'func application\(.*open url:|continue userActivity:|applicationDidBecomeActive|applicationWillResignActive|applicationDidEnterBackground|applicationWillEnterForeground' ios/App/App/AppDelegate.swift
```

For each hit, read the body:
- Empty, comments only, or only `return ApplicationDelegateProxy.shared.application(...)` -> template-shaped, nothing to move. This is the same test `cap migrate` uses.
- Anything else -> custom logic. Ask, then move it:

| AppDelegate method | Scene destination |
|---|---|
| `application(_:open:options:)` | `scene(_:openURLContexts:)` (loop `URLContexts`, use `context.url`, `context.options.sourceApplication`) |
| `application(_:continue:restorationHandler:)` | `scene(_:continue:)` |
| `applicationDidBecomeActive` | `sceneDidBecomeActive(_:)` |
| `applicationWillResignActive` | `sceneWillResignActive(_:)` |
| `applicationDidEnterBackground` | `sceneDidEnterBackground(_:)` |
| `applicationWillEnterForeground` | `sceneWillEnterForeground(_:)` |

Cold launch: a URL or activity that launched the app arrives in `connectionOptions.urlContexts` / `connectionOptions.userActivities` inside `scene(_:willConnectTo:options:)`, not through `openURLContexts`. `SceneDelegateProxy` already handles this for Capacitor; custom logic that also needs the cold URL must read `connectionOptions` too.

## 3. Third-party SDK URL forwarding

```bash
grep -rn $EXCL --include=*.swift -E 'ApplicationDelegate\.shared|GIDSignIn|handleOpenURL|handle\(url|open url' ios/App/App
```

SDKs that were fed URLs from the AppDelegate need the same call in `scene(_:openURLContexts:)`. Check the SDK's docs for its scene API rather than guessing a signature.

## 4. Existing scene setup (partial state)

```bash
ls ios/App/App/SceneDelegate.swift 2>/dev/null
grep -n -A3 'UIApplicationSceneManifest' ios/App/App/Info.plist
grep -n 'UISceneConfiguration(name:\|configurationForConnecting' ios/App/App/AppDelegate.swift
grep -n 'SceneDelegate.swift' ios/App/App.xcodeproj/project.pbxproj
```

Existing SceneDelegate: list its methods. Required: window creation + `SceneDelegateProxy.shared` forwarders in `willConnectTo`, `openURLContexts`, `continue`. Merge missing ones; never replace the file.

## 5. Custom bridge view controller

```bash
grep -rn $EXCL --include=*.swift -E ':\s*CAPBridgeViewController' ios/App
grep -n 'customClass=' ios/App/App/Base.lproj/Main.storyboard
```

A subclass (often `MyViewController` with `capacitorDidLoad` registering local plugins) must be the `rootViewController` in the SceneDelegate.

## 6. Informational

```bash
grep -rn $EXCL --include=*.swift -E 'UIApplication\.shared\.applicationState|keyWindow|UIApplication\.shared\.windows|UIScreen\.main' ios/App
grep -rn --include=*.swift -E 'capacitorOpenURL|capacitorOpenUniversalLink|CDVPluginHandleOpenURL' node_modules/@capacitor* node_modules/@capgo 2>/dev/null
```

- `applicationState`: still works single-scene; scene-aware code reads `view.window?.windowScene?.activationState`.
- `keyWindow` / `windows` / `UIScreen.main`: work today, but they are the APIs Apple flags for resizable windows and foldables. Report, do not rewrite during this migration.
- Legacy URL notification observers: keep working, payload unchanged.

## 7. Plugins in node_modules

```bash
grep -rln --include=*.swift -E 'tmpWindow|TmpViewController|applicationDidBecomeActive|applicationDidEnterBackground|func application\(.*open url:' node_modules 2>/dev/null | grep '/ios/'
```

Report with plugin name and version (`node -p "require('<pkg>/package.json').version"`). Do not edit vendored code; upgrade the plugin or file an issue upstream. See `plugin-audit.md` for the verdicts.
