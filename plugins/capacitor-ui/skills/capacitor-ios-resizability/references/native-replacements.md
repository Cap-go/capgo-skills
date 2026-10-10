# Native Replacements (Swift and Objective-C)

Applies to the app's own native code (`ios/App/App`, custom plugins in the app) and to plugin source you maintain.

## Rules

1. Use the information closest to the code: a view's `traitCollection` over its window's, a parameter over a property chain.
2. Never replace one global with another. `UITraitCollection.current`, `UIApplication.shared.windows`, `UIDevice.current` and `UIScreen.main` all carry the same single-window assumption.
3. Keep values dynamic. Never replace a read with a literal.
4. Keep control flow. Swap the value inside a condition; never collapse `if`/`else` branches or drop `#available`, `respondsToSelector:` or nil guards.
5. A cached value needs invalidation. If you store a trait-derived value, register for trait changes in the same edit.
6. Touch only lines that contain the target API. No opportunistic cleanup.
7. Ask before changing a public signature or a header other modules import.

## In a Capacitor plugin: where is "local"?

A `CAPPlugin` is not a view. The local context is the bridge's view controller:

```swift
guard let vc = bridge?.viewController else { return call.reject("No view controller") }
let traits = vc.traitCollection          // display scale, size classes, idiom of this scene
let bounds = vc.view.bounds              // the window's content area, not the screen
let scene = vc.view.window?.windowScene  // this scene, for activation state or geometry
```

UI work must run on the main thread: `DispatchQueue.main.async { ... }`. Plugin methods are called on a background queue.

## `UIScreen.main`

| Use | Replacement |
|---|---|
| `UIScreen.main.scale` in a view / view controller method | `traitCollection.displayScale` |
| `UIScreen.main.scale` in a plugin | `bridge?.viewController?.traitCollection.displayScale` |
| `UIScreen.main.bounds` for sizing an overlay | The presenting view's `bounds` (`bridge?.viewController?.view.bounds`), plus Auto Layout constraints so it follows resizes |
| `UIWindow(frame: UIScreen.main.bounds)` | `UIWindow(windowScene:)` in `SceneDelegate` |
| Cached scale in a `static let` / `dispatch_once` helper | Add an overload that takes `traitCollection: UITraitCollection`; keep the old one as a deprecated wrapper that forwards (the only place where `UITraitCollection.current` is acceptable) |
| SwiftUI | `@Environment(\.displayScale)`, `GeometryReader` |

Cached value plus invalidation (iOS 17+ API; gate with `#available` on Capacitor 8 / iOS 15-16):

```swift
// in class OverlayViewController: UIViewController
override func viewDidLoad() {
    super.viewDidLoad()
    overlay.layer.contentsScale = traitCollection.displayScale
    if #available(iOS 17.0, *) {
        registerForTraitChanges([UITraitDisplayScale.self]) { (self: OverlayViewController, _) in
            self.overlay.layer.contentsScale = self.traitCollection.displayScale
        }
    }
}
```

Use `registerForTraitChanges` instead of overriding `traitCollectionDidChange(_:)` (deprecated in iOS 17) on iOS 17+. Keep the override as the fallback below 17. Values read fresh in `layoutSubviews`, `draw(_:)` or `viewWillLayoutSubviews` need no registration.

Native views sized from frames must follow resizes: use Auto Layout constraints to the presenting view, or recompute frames in `layoutSubviews` / `viewWillLayoutSubviews`. A frame set once at present time is wrong after the first resize.

## Orientation

Only layout uses are in scope. Camera capture orientation, video recording, and motion sensors are not.

| Pattern | Replacement |
|---|---|
| `statusBarOrientation`, `interfaceOrientation`, `UIDevice.current.orientation` to choose a layout | Size classes (`traitCollection.horizontalSizeClass == .compact`) or bounds aspect (`view.bounds.width > view.bounds.height`) |
| `windowScene.effectiveGeometry.interfaceOrientation` for layout | Same as above. A landscape-oriented window can be taller than wide |
| `windowScene(_:didUpdate:interfaceOrientation:traitCollection:)` (deprecated) | `windowScene(_:didUpdateEffectiveGeometry:)`, iOS 26+. Capacitor 8 and 9 deploy below 26: keep the old method and add a TODO. To support both, implement both methods (a larger change; ask the user) |
| Left vs right landscape, rotation transforms, animation direction | Leave the orientation source. Add a TODO explaining why, or ask the user |

## Idiom

| Pattern | Replacement |
|---|---|
| `userInterfaceIdiom == .pad` to pick a wide layout | `traitCollection.horizontalSizeClass == .regular` |
| `== .phone` to pick a narrow layout | `horizontalSizeClass == .compact` |
| Phone landscape, hide a bar | `verticalSizeClass == .compact` |
| A real device-class decision (pointer/hover affordances, a feature only on iPad) | Keep the check, but read `traitCollection.userInterfaceIdiom` from the local view, not `UIDevice.current` |
| `UI_USER_INTERFACE_IDIOM()` | Deprecated since iOS 13. Same rules |
| Analytics, per-device asset names | Out of scope. Leave as is |

The mapping is not 1:1 on purpose: an iPad in narrow Split View reports `.compact`, a large iPhone in landscape reports `.regular`.

## Key window and window lists

| Pattern | Replacement |
|---|---|
| `UIApplication.shared.keyWindow`, `.windows.first` to present something | `bridge?.viewController` (plugins), `view.window` (views) |
| `UIApplication.shared.windows.first?.safeAreaInsets` | The presenting view's `safeAreaInsets` |
| `UIApplication.shared.statusBarFrame` | `view.window?.windowScene?.statusBarManager?.statusBarFrame`, or better the safe area |

## Safe areas in native views

- Constrain content to `safeAreaLayoutGuide`, not to the superview edges. Let backgrounds extend under the bars.
- Replace hard-coded 20 / 44 / 64 / 88 / 34 / 49 / 83 pt with safe-area or layout-guide anchors.
- Never mirror one side's inset to the other side. A vertical bar can sit on one edge only, for the whole session.
- Never store an inset read once. Override `safeAreaInsetsDidChange()` or use constraints.
- `topLayoutGuide` / `bottomLayoutGuide` (deprecated) → `view.safeAreaLayoutGuide`.
- Do not hand-roll keyboard avoidance with `keyboardWillShow` frames. Use `view.keyboardLayoutGuide` (iOS 15+).

## Lifecycle

See [info-plist-and-scenes.md](info-plist-and-scenes.md). In plugins, observe notifications (`UIScene.didEnterBackgroundNotification` filtered to `bridge?.viewController?.view.window?.windowScene`, or `UIApplication.didEnterBackgroundNotification`), never the AppDelegate methods.
