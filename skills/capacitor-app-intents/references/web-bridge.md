# Bridging App Intents to the Web Layer

App Intents run native code. The web app is reachable only when the app is in the foreground and `CAPBridgeViewController` has loaded. Pick one of the patterns below per intent.

| Pattern | Needs | Works for | Cold start handled by |
|---|---|---|---|
| A. `OpenURLIntent` with a Universal Link | iOS 18+, Associated Domains, working `appUrlOpen` routing | "Open X" actions | `App.getLaunchUrl()` + `appUrlOpen` |
| B. Local plugin + pending-route store | iOS 16+, a `CAPBridgeViewController` subclass | "Open X" actions with custom schemes or no Universal Links | `consumePendingRoute()` on JS startup |
| C. Background native work + shared storage | iOS 16+ | Actions that must not open the app | JS reads storage on startup / `resume` |

## A. Route through the existing deep-link pipeline

If the app already handles `https://example.com/...` Universal Links in `appUrlOpen`, the intent only has to return an `OpenURLIntent`. The system foregrounds the app and delivers the URL to the Universal Link handler: under UIScene (Capacitor 8.5+) that is `SceneDelegate.scene(_:continue:)` → `SceneDelegateProxy` → `@capacitor/app` `appUrlOpen`. On cold start it arrives through the scene connection options, and `SceneDelegateProxy` delivers it after the bridge loads.

```swift
import AppIntents

@available(iOS 18.0, *)
struct OpenOrderIntent: AppIntent {
    static let title: LocalizedStringResource = "Open Order"

    @Parameter(title: "Order Number") var orderNumber: String

    func perform() async throws -> some OpensIntent {
        guard let url = URL(string: "https://example.com/orders/\(orderNumber)") else {
            throw $orderNumber.needsValueError("Which order?")
        }
        return .result(opensIntent: OpenURLIntent(url))
    }
}
```

- `OpenURLIntent` and `URLRepresentableIntent` need real Universal Links. They do not work with custom URL schemes.
- If the intent maps 1:1 to a URL, adopt `URLRepresentableIntent` with `static var urlRepresentation` and write **no** `perform()`. Interpolate parameter key paths (`"https://example.com/orders/\(\.$orderNumber)"`), not values.
- Treat the URL format as a contract. Saved shortcuts and widgets keep old URLs.
- If `appUrlOpen` does not fire for the same URL opened from Notes or Safari, fix the link setup first (`capacitor-deep-linking`).

## B. Local plugin with a pending-route store

Use this on iOS 16/17, with custom schemes, or when the route is not a URL. The intent stores the route. A local plugin tells JS that a route is pending, and JS takes it exactly once.

### Native store (shared by the intent and the plugin)

```swift
import Foundation

/// Thread-safe, process-local holder for one route requested by an intent.
final class PendingRouteStore: @unchecked Sendable {
    static let shared = PendingRouteStore()
    static let didChange = Notification.Name("PendingRouteStoreDidChange")

    private let lock = NSLock()
    private var route: String?

    func set(_ newRoute: String) {
        lock.lock(); route = newRoute; lock.unlock()
        NotificationCenter.default.post(name: Self.didChange, object: nil)
    }

    func peek() -> String? { lock.lock(); defer { lock.unlock() }; return route }

    func take() -> String? {
        lock.lock(); defer { lock.unlock() }
        let value = route
        route = nil
        return value
    }
}
```

### The intent

```swift
import AppIntents

@available(iOS 16.0, *)
enum AppSection: String, AppEnum {
    case inbox, orders, settings   // raw values are persisted: never rename, only append

    static let typeDisplayRepresentation: TypeDisplayRepresentation = "Section"
    static let caseDisplayRepresentations: [AppSection: DisplayRepresentation] = [
        .inbox: "Inbox", .orders: "Orders", .settings: "Settings"
    ]
}

@available(iOS 16.0, *)
struct OpenSectionIntent: AppIntent {
    static let title: LocalizedStringResource = "Open Section"
    static let openAppWhenRun = true   // iOS 16-25. On iOS 26+ see supportedModes in ios-26-27-apis.md

    @Parameter(title: "Section") var section: AppSection

    func perform() async throws -> some IntentResult {
        PendingRouteStore.shared.set("/\(section.rawValue)")
        return .result()
    }
}
```

### The local plugin

```swift
import Capacitor

@objc(AppIntentsBridgePlugin)
public class AppIntentsBridgePlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "AppIntentsBridgePlugin"
    public let jsName = "AppIntentsBridge"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "consumePendingRoute", returnType: CAPPluginReturnPromise)
    ]
    private var observer: NSObjectProtocol?

    override public func load() {
        observer = NotificationCenter.default.addObserver(
            forName: PendingRouteStore.didChange, object: nil, queue: .main
        ) { [weak self] _ in self?.signalPending() }
        signalPending() // a route stored before the bridge loaded (cold start)
    }

    private func signalPending() {
        guard PendingRouteStore.shared.peek() != nil else { return }
        // retainUntilConsumed: delivered to the first listener added later
        notifyListeners("routePending", data: [:], retainUntilConsumed: true)
    }

    @objc func consumePendingRoute(_ call: CAPPluginCall) {
        if let route = PendingRouteStore.shared.take() {
            call.resolve(["route": route])
        } else {
            call.resolve([:])
        }
    }
}
```

Register it from a `CAPBridgeViewController` subclass:

```swift
import Capacitor

class MainViewController: CAPBridgeViewController {
    override open func capacitorDidLoad() {
        bridge?.registerPluginInstance(AppIntentsBridgePlugin())
    }
}
```

- Capacitor 8.5+ (UIScene): instantiate `MainViewController()` in `SceneDelegate.scene(_:willConnectTo:options:)` instead of `CAPBridgeViewController()`.
- Before 8.5: set `MainViewController` as the custom class of the Bridge View Controller in `Main.storyboard`.

### JS

```ts
import { registerPlugin, type PluginListenerHandle } from '@capacitor/core';

interface AppIntentsBridgePlugin {
  consumePendingRoute(): Promise<{ route?: string }>;
  addListener(event: 'routePending', cb: () => void): Promise<PluginListenerHandle>;
}

export const AppIntentsBridge = registerPlugin<AppIntentsBridgePlugin>('AppIntentsBridge');

export async function initIntentRouting(navigate: (path: string) => void) {
  const drain = async () => {
    const { route } = await AppIntentsBridge.consumePendingRoute();
    if (route) navigate(route);
  };
  await AppIntentsBridge.addListener('routePending', drain);
  await drain(); // cold start
}
```

Call `initIntentRouting` once, after the router is ready. Validate `route` against known routes before you navigate; treat it as untrusted input like any deep link.

## C. Background intents and shared data

A background intent runs in the app process (or an extension) without a WebView. On a headless launch only `AppDelegate` ran.

```swift
@available(iOS 16.0, *)
struct LogWaterIntent: AppIntent {
    static let title: LocalizedStringResource = "Log Water"
    @Parameter(title: "Milliliters") var amount: Int

    func perform() async throws -> some IntentResult & ProvidesDialog {
        let defaults = UserDefaults(suiteName: "group.com.example.app")!
        let total = defaults.integer(forKey: "waterToday") + amount
        defaults.set(total, forKey: "waterToday")   // single write, safe to repeat after a restart
        return .result(dialog: "Logged. \(total) ml today.")
    }
}
```

The web layer reads it:
- From the App Group: add a `getSharedValue(key)` method to the local plugin that reads `UserDefaults(suiteName:)`.
- Or, if the intent runs only in the app process, write the keys `@capacitor/preferences` reads (`UserDefaults.standard`, prefixed `CapacitorStorage.` for the default group; confirm against the installed plugin source). Extensions cannot see them.

Refresh in JS on startup and on the `resume` event. If the bridge happens to be alive (the app is open when a control runs the intent), the intent may also post a notification that the local plugin forwards as a `dataChanged` event. Never depend on it: on a headless launch nobody is listening.

## Donating in-app actions

The system does not learn from in-app actions on its own. When the user does something in the web UI that an intent mirrors, have JS call a plugin method that donates the intent:

```swift
@objc func donateOpenSection(_ call: CAPPluginCall) {
    guard #available(iOS 16.0, *), let raw = call.getString("section"),
          let section = AppSection(rawValue: raw) else { return call.resolve() }
    let intent = OpenSectionIntent()
    intent.section = section
    Task {
        _ = try? await IntentDonationManager.shared.donate(intent: intent)
        call.resolve()
    }
}
```

Check `IntentDonationManager` availability for the deployment target in current Apple docs.
