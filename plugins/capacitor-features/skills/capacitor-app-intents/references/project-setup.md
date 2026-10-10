# Project Setup for App Intents in a Capacitor App

## Where files go

```
ios/App/App/
  AppDelegate.swift
  SceneDelegate.swift            # Capacitor 8.5+
  Intents/
    AppShortcuts.swift           # one AppShortcutsProvider per app
    OpenSectionIntent.swift      # foreground intents
    SyncNowIntent.swift          # background intents
    Entities/NoteEntity.swift    # AppEntity + EntityQuery
  AppIntentsBridge.swift         # local plugin (if used), see web-bridge.md
  MainViewController.swift       # CAPBridgeViewController subclass that registers it
```

- Create the files in Xcode (File > New > File, Swift File, App group) so they get the **App** target membership. If you write files from the CLI, add them to the target: a `PBXFileReference`, a `PBXBuildFile`, an entry in the `App` group and one in the App target's Sources build phase. Xcode 16+ projects that use folder references ("synchronized groups") pick up new files automatically. Check which kind the project uses before you edit `project.pbxproj`.
- `npx cap sync` does not touch these files. They are app-owned like `AppDelegate.swift`.
- Do not put intents in `ios/App/CapApp-SPM/` (regenerated) or in `Pods/`.

## One AppShortcutsProvider per app

Put exactly one `AppShortcutsProvider` in the App target. App Shortcuts declared in a plugin's framework are not picked up the same way. A plugin that wants to contribute intents should ship the intent types and document the `AppShortcut` entries the app adds to its own provider. Check current Apple docs on `AppIntentsPackage` before you design a plugin that ships intents from a framework or Swift package.

## Extensions

Widgets and controls live in a Widget Extension target (File > New > Target > Widget Extension). Then:

- Give every intent file used by both the app and the widget **both** target memberships (App and the extension), or move the shared types into a framework.
- Code compiled into the extension cannot import `Capacitor`, use `UIApplication.shared`, or reach the WebView. Keep shared intent code free of Capacitor imports. Put bridge calls behind `#if` or in app-only files.
- Set the extension's deployment target and Swift version deliberately. Widgets need iOS 14+, interactive widgets with `Button(intent:)` iOS 17+, controls iOS 18+.

## App Groups (shared data between app, extension and intents)

1. Signing & Capabilities > + Capability > App Groups on the App target and each extension. Use the same `group.<bundle-id>...` identifier.
2. Read and write through `UserDefaults(suiteName: "group....")` or the group container URL (`FileManager.default.containerURL(forSecurityApplicationGroupIdentifier:)`).
3. `@capacitor/preferences` writes to `UserDefaults.standard` (keys prefixed by its group, `CapacitorStorage.` by default; check the installed version's source). An intent running **in the app process** can read those keys. An **extension** cannot. Use the App Group suite for anything an extension needs, and expose it to JS through the local plugin.

## Availability gating

| Capacitor | iOS deployment target | Gate needed for base App Intents |
|---|---|---|
| 8.x | 15.0 | Yes: `@available(iOS 16.0, *)` on every type |
| 9.x | 16.0 | No |

```swift
import AppIntents

@available(iOS 16.0, *)
struct OpenInboxIntent: AppIntent { /* ... */ }

@available(iOS 16.0, *)
struct AppShortcuts: AppShortcutsProvider { /* ... */ }
```

Gate code that references intents from iOS 15-reachable code (for example a donation call in a plugin method) with `if #available(iOS 16.0, *)`.

Tag every newer API with its own floor: `OpenURLIntent` and URL-representable types iOS 18, `IndexedEntity` iOS 18, `ControlConfigurationIntent` iOS 18, `supportedModes` iOS 26, `LongRunningIntent` iOS 27. Full table: [ios-26-27-apis.md](ios-26-27-apis.md).

## Registering dependencies

The equivalent of SwiftUI's `App.init()` in a Capacitor app is `AppDelegate.application(_:didFinishLaunchingWithOptions:)`. It runs on every process launch, including headless launches for background intents. `SceneDelegate` and the bridge view controller do not run on headless launches.

```swift
func application(_ application: UIApplication,
                 didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
    if #available(iOS 16.0, *) {
        AppDependencyManager.shared.add(dependency: NotesStore.shared)
    }
    return true
}
```

## Build checks

```bash
npx cap sync ios
xcodebuild -project ios/App/App.xcodeproj -scheme App \
  -destination 'generic/platform=iOS Simulator' build 2>&1 | grep -iE 'appintents|App Shortcut|phrase|error' | head -40
```

The App Intents metadata is extracted at build time. Warnings about phrases or the App Shortcut count show up there.
