# iOS API Removals (Capacitor 9)

Source: https://capacitorjs.com/docs/updating/plugins/9-0#ios

Capacitor 9 removes the Swift and Objective-C APIs that were deprecated in previous major versions. If your plugin still uses any of them, replace them as follows.

## `CAPBridge` compatibility class removed

The `CAPBridge` class was a compatibility shim and has been removed entirely. Use the replacements below:

| Removed | Replacement |
| :------ | :---------- |
| `CAPBridge.statusBarTappedNotification` | `Notification.Name.capacitorStatusBarTapped` |
| `CAPBridge.getLastUrl()` | `ApplicationDelegateProxy.shared.lastURL` |
| `CAPBridge.handleOpenUrl(_:_:)` | `ApplicationDelegateProxy.shared.application(_:open:options:)` |
| `CAPBridge.handleContinueActivity(_:_:)` | `ApplicationDelegateProxy.shared.application(_:continue:restorationHandler:)` |
| `CAPBridge.handleAppBecameActive(_:)` | No longer needed, it was a no-op |

## Bridge (`CAPBridgeProtocol`) methods removed

| Removed | Replacement |
| :------ | :---------- |
| `getWebView()` | `webView` property |
| `isSimulator()` | `isSimEnvironment` property |
| `isDevMode()` | `isDevEnvironment` property |
| `getStatusBarVisible()` / `setStatusBarVisible(_:)` | `statusBarVisible` property |
| `getStatusBarStyle()` / `setStatusBarStyle(_:)` | `statusBarStyle` property |
| `setStatusBarAnimation(_:)` | `statusBarAnimation` property |
| `getUserInterfaceStyle()` | `userInterfaceStyle` property |
| `getLocalUrl()` | `config.localURL` |
| `getSavedCall(_:)` | `savedCall(withID:)` |
| `releaseCall(callbackId:)` | `releaseCall(withID:)` |
| `presentVC(_:animated:completion:)` | `viewController?.present(_:animated:completion:)` |
| `dismissVC(animated:completion:)` | `viewController?.dismiss(animated:completion:)` |
| `modulePrint(_:_:)` | `CAPLog.print(_:)` |

## Other removals

| Removed | Replacement |
| :------ | :---------- |
| `CAPNotifications` enum | `Notification.Name.capacitor*` constants (e.g. `Notification.Name.capacitorOpenURL`) |
| `PluginCallErrorData`, `PluginResultData` and `JSResultBody` typealiases | `PluginCallResultData` |
| `CAPPluginCall.hasOption(_:)` | Typed accessors (`getString(_:)`, `getInt(_:)`, etc.) |
| `JSDate.toString(_:)` | No longer needed, dates are mapped to strings during serialization |
| `InstanceConfiguration.getPluginConfigValue(_:_:)` | `getPluginConfig(_:)` |
| `InstanceConfiguration.getValue(_:)` / `getString(_:)` | Direct property accessors on `InstanceConfiguration` |
| `CAPPlugin.getConfigValue(_:)` | `getConfig()` and the typed accessors on `PluginConfig` |
| `CAPFileManager.getPortablePath(host:uri:)` | `portablePath(fromLocalURL:)` on the bridge |
| `CapacitorBridge` initializer taking `cordovaConfiguration` | The initializer without the `cordovaConfiguration` parameter |
| `CapacitorBridge.httpsInterceptorStartIdentifier` | `httpInterceptorStartIdentifier`, all proxied requests are handled by it |
| `CapacitorUrlRequest.setRequestHeaders([String: String])` | `setRequestHeaders([String: Any])`. Note: the replacement sets header values instead of appending them, so repeated keys overwrite the previous value |

## Find hits

```bash
grep -rn --include=*.swift --include=*.m --include=*.h -E '\bCAPBridge\b|getWebView\(\)|isSimulator\(\)|isDevMode\(\)|getStatusBarVisible|setStatusBarVisible|getStatusBarStyle|setStatusBarStyle|setStatusBarAnimation|getUserInterfaceStyle|getLocalUrl\(\)|getSavedCall\(|releaseCall\(callbackId|presentVC\(|dismissVC\(|modulePrint\(|CAPNotifications|PluginCallErrorData|PluginResultData|JSResultBody|hasOption\(|JSDate\.toString|getPluginConfigValue|getConfigValue\(|getPortablePath|cordovaConfiguration|httpsInterceptorStartIdentifier|setRequestHeaders|tmpWindow|TmpViewController' ios
```

## Typical rewrites

```swift
// before
let webView = bridge?.getWebView()
bridge?.presentVC(picker, animated: true, completion: nil)
if bridge?.isSimulator() == true { ... }
CAPLog.print / bridge?.modulePrint(self, "msg")
NotificationCenter.default.addObserver(self, selector: #selector(onOpen), name: Notification.Name(CAPNotifications.URLOpen.name()), object: nil)

// after
let webView = bridge?.webView
bridge?.viewController?.present(picker, animated: true, completion: nil)
if bridge?.isSimEnvironment == true { ... }
CAPLog.print("msg")
NotificationCenter.default.addObserver(self, selector: #selector(onOpen), name: .capacitorOpenURL, object: nil)
```

Config: `getConfig().getString("key")` (and the other typed `PluginConfig` accessors) instead of `getConfigValue("key")`.

Results: type result dictionaries as `PluginCallResultData` (`[String: Any]`).

Lifecycle: Capacitor 9 apps all use UIScene. Do lifecycle work through `UIApplication` / `UIScene` notifications; scene-scoped `.capacitorSceneOpenURL` / `.capacitorSceneOpenUniversalLink` / `.capacitorSceneWillConnect` are available because the minimum is now 8.5+.
