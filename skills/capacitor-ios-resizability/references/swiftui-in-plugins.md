# SwiftUI Screens in Capacitor Plugins and Apps

Some plugins and apps present native SwiftUI screens on top of the WebView (paywalls, scanners, editors, onboarding). They must resize with the window like everything else.

## Presenting

```swift
import SwiftUI
import Capacitor

@objc func open(_ call: CAPPluginCall) {
    DispatchQueue.main.async {
        guard let presenter = self.bridge?.viewController else {
            return call.reject("No view controller")
        }
        let host = UIHostingController(rootView: EditorView(onDone: { result in
            presenter.dismiss(animated: true)
            call.resolve(["result": result])
        }))
        host.modalPresentationStyle = .automatic   // a sheet on iPad, sized by the system
        presenter.present(host, animated: true)
    }
}
```

- Present from `bridge?.viewController`, never from `keyWindow` or `windows.first`.
- Let the system size sheets. Do not set `preferredContentSize` from `UIScreen.main.bounds`.
- `.fullScreenCover` / `.overFullScreen` fills the window, not the screen. That is correct.

## Layout inside SwiftUI

| Instead of | Use |
|---|---|
| `UIScreen.main.bounds.width` | `GeometryReader`, `containerRelativeFrame`, or layout that does not need the size |
| `UIScreen.main.scale` | `@Environment(\.displayScale)` |
| `UIDevice.current.userInterfaceIdiom == .pad` for layout | `@Environment(\.horizontalSizeClass)` |
| Fixed padding for bars | Safe-area-aware layout; `ignoresSafeArea(edges:)` only for backgrounds, with explicit edges |
| `NavigationView` (soft-deprecated) | `NavigationStack` / `NavigationSplitView` (iOS 16+; gate on Capacitor 8 / iOS 15) |

`NavigationSplitView` collapses to a stack in compact width on its own, which is what a resizable window needs.

## State and models

- Mark observable models `@MainActor` (`@MainActor @Observable final class ...`, iOS 17+; `ObservableObject` below). Plugin methods run on a background queue, so hop to the main actor before you mutate them.
- Pass results back with the `CAPPluginCall` you captured. Resolve or reject exactly once, including when the user dismisses the sheet by swiping (handle `onDisappear` or the presentation controller delegate).

## Localization in a plugin

A plugin's strings are not in `Bundle.main`. Without an explicit bundle, SwiftUI looks them up in the app's bundle and shows the key unlocalized:
- SPM plugin with resources: `Text("Done", bundle: .module)`, or `#bundle` with the Xcode 26+ toolchain.
- CocoaPods plugin: load the resource bundle declared in the podspec (`resource_bundles`) and pass it as `bundle:`.

## iOS 27 SDK changes that hit existing plugin code

- **`@State` is a macro in the SDK 27 toolchain.** Code that gives a `@State` property an initial value and assigns it again in `init` now fails with `Variable 'self.x' used before being initialized`. Fix: remove the initial value from the declaration and assign it only in `init` (do not just reorder the assignments). Composing another property wrapper with `@State` can fail with `invalid redeclaration of synthesized property '_x'`. Restructure the wrappers.
- New iOS 27 APIs (reorderable containers, swipe actions outside `List`, toolbar overflow controls, `AsyncImage(request:)`, `alert` / `confirmationDialog` with an `item:` binding) need `if #available(iOS 27, *)` in plugins that support Capacitor 8 or 9.
