# Widgets and Control Center Controls

Widgets and controls run in a Widget Extension, not in the app. The extension has no Capacitor bridge and no WebView. Share data through an App Group ([project-setup.md](project-setup.md)).

For JS-driven Live Activities and SVG-template widgets without writing SwiftUI, look at `@capgo/capacitor-widget-kit` (skill `capacitor-plugins`). Use this file when you write the widget natively.

## Configuration intents describe, they do not run

- `WidgetConfigurationIntent` (iOS 17) and `ControlConfigurationIntent` (iOS 18) only declare `@Parameter`s, which become the edit sheet. The framework supplies a `perform()` that is never called as an action. Do not write one, and do not put data loading there. The `TimelineProvider` (or control value provider) reads the parameters and loads data.

```swift
import AppIntents
import WidgetKit

@available(iOS 17.0, *)
struct SectionWidgetConfig: WidgetConfigurationIntent {
    static let title: LocalizedStringResource = "Section"
    static let description = IntentDescription("Shows a section of the app.")
    @Parameter(title: "Section", default: .inbox) var section: AppSection
}
```

Give parameters defaults (or make them optional) so the system can preview the widget before the user configures it.

## Buttons in widgets (iOS 17+)

`Button(intent:)` in a widget runs an `AppIntent`. It runs in the widget extension by default, so the intent file needs the extension target membership, and it must not import `Capacitor`.

- Native work (toggle a value, log an entry): a normal background intent writing to the App Group, then `WidgetCenter.shared.reloadTimelines(ofKind:)`.
- Open the app on a route: use `Link` / `widgetURL` with a Universal Link or custom scheme. That goes through `appUrlOpen`, and is simpler than an intent.

## Controls (iOS 18+)

Two separate types:
- A `ControlConfigurationIntent` (optional) describes which thing the control points at.
- The action is a runnable intent. For on/off controls it is a `SetValueIntent` with `@Parameter var value: Bool` and a real `perform()`.

```swift
@available(iOS 18.0, *)
struct ToggleRemindersIntent: SetValueIntent {
    static let title: LocalizedStringResource = "Reminders"
    @Parameter(title: "Enabled") var value: Bool

    func perform() async throws -> some IntentResult {
        UserDefaults(suiteName: "group.com.example.app")?.set(value, forKey: "remindersEnabled")
        return .result()
    }
}
```

The web layer picks up the new value on startup or `resume` through the local plugin ([web-bridge.md](web-bridge.md)).

## iOS 27 system shortcut buttons

`RunSystemShortcutIntent(shortcut:)` with `SystemShortcut` (iOS 27, iPhone and iPad only) lets a widget configuration offer a button that runs a person's chosen system shortcut. It is narrow; use it only for that purpose.
