# Plugin Audit for the UIScene Lifecycle

Plugins have no Info.plist or AppDelegate to patch. The question is whether the plugin's iOS code assumes the AppDelegate lifecycle, and whether one release can serve apps on 8.4 and 8.5+ (and Capacitor 9, where every app is scene-based).

First read the supported range: `peerDependencies["@capacitor/core"]`, the `capacitor-swift-pm` requirement in `Package.swift`, and the `Capacitor` dependency in the `.podspec`.

## Scan

```bash
grep -rn --include=*.swift --include=*.m -E 'tmpWindow|TmpViewController|applicationState|keyWindow|UIApplication\.shared\.windows|UIApplication\.shared\.delegate|applicationDidBecomeActive|applicationDidEnterBackground|applicationWillEnterForeground|applicationWillResignActive|capacitorOpenURL|capacitorOpenUniversalLink|CDVPluginHandleOpenURL|capacitorScene|SceneDelegateProxy|method_exchangeImplementations' ios
```

## Verdicts

| Pattern | Verdict |
|---|---|
| `tmpWindow`, `TmpViewController` | Must fix: removed in 8.5. Present from `bridge?.viewController` |
| Swizzling or casting `UIApplication.shared.delegate` to call/override `application(_:open:)`, `continue userActivity`, or the four lifecycle methods | Must fix: those methods no longer run in scene apps. Observe notifications instead |
| Observers of `UIApplication.didBecomeActiveNotification`, `willResignActive`, `didEnterBackground`, `willEnterForeground` | Fine: still posted |
| Observers of `.capacitorOpenURL`, `.capacitorOpenUniversalLink`, `CDVPluginHandleOpenURL` | Fine: re-posted on the scene path with the same payload |
| `ApplicationDelegateProxy.shared.lastURL` | Fine: populated from the scene path |
| `.capacitorScene*` notifications or `SceneDelegateProxy` | 8.5+ only. Does not compile against 8.4; never fires on 8.4. OK only if the plugin's minimum is 8.5 |
| `UIApplication.shared.applicationState` | Advisory: works single-scene; prefer `bridge?.webView?.window?.windowScene?.activationState` |
| `keyWindow?.rootViewController` for presenting | Advisory: prefer `bridge?.viewController` |

## One release for 8.4 and 8.5+

- Use the legacy notification names (posted on both).
- Do not reference removed APIs (`tmpWindow`, `TmpViewController`).
- Do not reference 8.5-only symbols unless the minimum is 8.5.
- Do lifecycle work through `UIApplication` notifications, not AppDelegate methods.

A plugin meeting all four needs no scene-specific release. For a Capacitor 9 release, the minimum is 9 anyway, so scene-only APIs are fine; see `capacitor-plugin-upgrade-v8-to-v9`.

## Output

Group findings as must fix / should fix / advisory / fine, with file:line. Edit only the plugin's own sources and only when the user asks. Verify in the example app with a scene-based iOS project (8.5+ template): pause/resume, URL open cold and warm, and any plugin feature that reacts to foreground/background.
