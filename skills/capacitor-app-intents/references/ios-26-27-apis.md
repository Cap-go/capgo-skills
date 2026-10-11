# iOS 26 and iOS 27 App Intents APIs

Capacitor 8 deploys to iOS 15 and Capacitor 9 to iOS 16, so every API here needs an availability gate. Never drop the older path while the deployment target is below the API's floor.

## Availability

| API | iOS |
|---|---|
| `supportedModes` / `IntentModes` (`.background`, `.foreground`, `.foreground(.immediate / .deferred / .dynamic)`) | 26.0 |
| `continueInForeground(_:alwaysConfirm:)`, `needsToContinueInForegroundError(_:alwaysConfirm:)`, `systemContext.currentMode.canContinueInForeground` | 26.0 |
| `UndoableIntent` | 26.0 |
| `requestChoice(between:dialog:)` / `IntentChoiceOption` | 26.0 |
| `SnippetIntent` (interactive snippets) | 26.0 |
| `IntentValueQuery` for Visual Intelligence (`import VisualIntelligence`) | 26.0 |
| `@ComputedProperty`, `@DeferredProperty` (incl. `indexingKey:`) | 26.0 |
| `CancellableIntent` / `IntentCancellationReason` | 26.4 |
| `LongRunningIntent`, `performBackgroundTask(options:operation:)` | 27.0 |
| `allowedExecutionTargets` / `IntentExecutionTargets` | 27.0 |
| `IndexedEntityQuery`, `relatedAppEntityIdentifier` | 27.0 |
| `RelevantEntities` / `AppEntityContext` | 27.0 |
| `SyncableEntity`, `EntityOwnership` | 27.0 |
| `EntityCollection` | 27.0 |
| `AppIntentsTesting` framework | 27.0 (test targets) |
| Baseline for comparison: `OpenIntent` 16.0, `OpenURLIntent` / URL-representable 18.0, `IndexedEntity` 18.0, `@Property(indexingKey:)` 18.4 | |

## `supportedModes` replaces `openAppWhenRun`

`openAppWhenRun` is deprecated in iOS 26. It still works. Keep it while the deployment target is below 26, and add `supportedModes` for iOS 26+:

```swift
@available(iOS 16.0, *)
struct OpenSectionIntent: AppIntent {
    static let title: LocalizedStringResource = "Open Section"
    static let openAppWhenRun = true                 // iOS 16-25

    @available(iOS 26.0, *)
    static var supportedModes: IntentModes { .foreground }   // iOS 26+

    @Parameter(title: "Section") var section: AppSection

    func perform() async throws -> some IntentResult {
        PendingRouteStore.shared.set("/\(section.rawValue)")
        return .result()
    }
}
```

Build with the current SDK and confirm that the availability-gated witness compiles and the deprecation warning is the only one. Once the deployment target reaches 26, delete `openAppWhenRun`.

Mode guide for Capacitor apps:
- `.background`: native-only work. No WebView exists on a headless launch. This is the default when neither property is set.
- `.foreground` (= `.foreground(.immediate)`): the app comes forward before `perform()`. Use it for "open X" intents that hand a route to the web layer.
- `[.background, .foreground(.dynamic)]`: try headless, then escalate only when the web UI is needed:

```swift
@available(iOS 26.0, *)
struct ReviewOrderIntent: AppIntent {
    static let title: LocalizedStringResource = "Review Order"
    static var supportedModes: IntentModes { [.background, .foreground(.dynamic)] }
    @Parameter(title: "Order Number") var orderNumber: String

    func perform() async throws -> some IntentResult & ProvidesDialog {
        let status = try await OrdersAPI.status(orderNumber)      // native, headless
        guard status.needsReview else { return .result(dialog: "Order is \(status.label).") }
        guard systemContext.currentMode.canContinueInForeground else {
            throw needsToContinueInForegroundError("Open the app to review this order")
        }
        try await continueInForeground("Review in the app?", alwaysConfirm: false)
        PendingRouteStore.shared.set("/orders/\(orderNumber)/review")
        return .result(dialog: "Opening the order.")
    }
}
```

Some contexts (voice-only, some widgets) cannot foreground. Always check `canContinueInForeground` before calling `continueInForeground`; that call throws in such contexts.

## Long-running work (iOS 27)

Background intents get about 30 seconds on iOS. `LongRunningIntent` moves the work into a system-managed background task with a Live Activity that shows `progress` automatically:

```swift
@available(iOS 27.0, *)
struct ExportDataIntent: AppIntent, LongRunningIntent {
    static let title: LocalizedStringResource = "Export Data"
    static var supportedModes: IntentModes { .background }

    func perform() async throws -> some IntentResult {
        progress.localizedDescription = "Exporting…"
        try await performBackgroundTask {
            try await Exporter.run { done, total in
                self.progress.totalUnitCount = Int64(total)
                self.progress.completedUnitCount = Int64(done)
            }
        }
        return .result()
    }
}
```

Add `CancellableIntent` (26.4) to get the `onCancel:` overload with an `IntentCancellationReason` (`.timeout` or `.userCancelled`).

## Execution targets (iOS 27)

`static var allowedExecutionTargets: IntentExecutionTargets` pins the process: `.default`, `.main`, `.appIntentsExtension`, `.widgetKitExtension`. In a Capacitor app, use `.main` only when the intent needs main-process state (the pending-route store, an in-memory cache). It does not create a WebView by itself. Prefer `.default`.

## Spotlight

- `IndexedEntity` (iOS 18) + `CSSearchableIndex.default().indexAppEntities(_:)` puts entities in Spotlight. Re-index when data changes. In Capacitor, call it from a plugin method after JS saves data.
- iOS 26: `@ComputedProperty(indexingKey:)` / `@DeferredProperty(indexingKey:)` map derived values to Spotlight attributes.
- iOS 27: `IndexedEntityQuery` lets the system ask you to reindex. `relatedAppEntityIdentifier` links an independently indexed `CSSearchableItem` to an entity.

## Apple Intelligence schemas

`@AppIntent(schema:)`, `@AppEntity(schema:)`, `@AppEnum(schema:)` (macros iOS 18) give an intent a fixed shape the system can call. The older `@AssistantIntent` / `@AssistantEntity` / `@AssistantEnum` family is deprecated and renamed to the `@App*` forms. Which schema domains are public depends on the SDK. Check the current Apple docs for the domain before you promise a surface to the user.

## Interactive snippets (iOS 26)

Return `.result(snippetIntent:)` with a `SnippetIntent` to show an interactive card with `Button(intent:)` controls. A `SnippetIntent`'s `perform()` may run many times to redraw. Keep it side-effect free.

## Testing with AppIntentsTesting (iOS 27)

`import AppIntentsTesting` runs intents and queries **out of process against the installed app**, as Siri does. It is XCTest-based and links only into test targets:

```swift
import XCTest
import AppIntentsTesting

@available(iOS 27.0, *)
final class IntentTests: XCTestCase {
    let definitions = IntentDefinitions(bundleIdentifier: "com.example.app") // the app, not the test bundle

    func testOpenOrder() async throws {
        let intent = definitions.intents["OpenOrderIntent"]
        try await intent.makeIntent(orderNumber: "1042").run()
    }
}
```

- Address intents by type name and pass parameters by their `@Parameter` label.
- There is no in-process dependency injection. Seed data through the app (for example a debug-only seed intent).
- Host the tests in a test target of `App.xcodeproj` (File > New > Target > Unit Testing Bundle or UI Testing Bundle). Set its deployment target to 27, or gate the class with `@available`. `viewAnnotations()` needs a launched `XCUIApplication`, so it requires a UI testing bundle.
- For parameters of enum and entity types, check the AppIntentsTesting docs for how to pass values (`makeReference(identifier:)` for entities).
