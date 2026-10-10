# App Intents Traps

These hold on every OS version. Each one compiles fine and fails later, usually from Siri or Shortcuts, where it is hard to debug.

## Execution

- **`perform()` has no actor isolation.** It may run off the main thread. Wrap UIKit, the bridge, or `@MainActor` state in `await MainActor.run { }`, or mark the method `@MainActor func perform()` when the whole body is UI work. Do not mark the intent **type** `@MainActor`: Swift 6 rejects the conformance because the protocol requirements are nonisolated.
- **`perform()` can run again from the top.** `needsValueError` and `AppIntentError.restartPerform` restart it, and side effects are not rolled back. Resolve and validate every parameter first, then do the irreversible work last. Make writes idempotent (set values, do not append).
- **Confirm before destructive work.** `try await requestConfirmation(...)` throws on cancel. Call it right before the destructive step. Never wrap it in `try?`. The dialog variant is iOS 18+; the parameterless one is iOS 16+.
- **Return through `.result(...)`.** `perform()` returns `some IntentResult`, composed with `ReturnsValue<T>`, `ProvidesDialog` and `OpensIntent`. Never return a domain type.
- **Do not open URLs yourself.** `UIApplication.shared.open` inside `perform()` is the wrong layer, and it is unavailable in extensions. Return `OpenURLIntent` (iOS 18+) or adopt `URLRepresentableIntent`.
- **Do not write `perform()` next to `urlRepresentation`.** The system opens the URL and your body is dead code or a double open.

## Entities and queries

- **`AppEntity.id` must be stable** across launches and devices. Use a server id or a UUID stored with the record, never an array index, a local SQLite row id, or a Photos `localIdentifier`.
- **`entities(for:)` is required and batched.** Resolve all ids in one lookup. `suggestedEntities()` is optional and returns an empty list by default. Implement it when you want a picker with defaults.
- **`EntityStringQuery.entities(matching:)` is not filtered for you.** Your code filters.
- **Only `@Property` members are visible to the system** (Find actions, filters, display). Plain `var`s are invisible.
- **`EnumerableEntityQuery` (iOS 17+) loads everything** into memory. For large stores, use `EntityPropertyQuery` and execute the predicate yourself.
- In a Capacitor app the data often lives in the web layer (IndexedDB, localStorage). Native intents cannot read it. Move the data the intents need to native storage the web layer also uses (SQLite plugin, App Group defaults, files), or sync a native copy from JS.

## Enums

- `AppEnum` raw values are persisted as strings. Never rename or reorder them; only append.
- Every case needs a `caseDisplayRepresentations` entry. A missing entry is a runtime crash.

## Parameters and summaries

- Ask for values with `throw $param.needsValueError("...")` or `try await $param.requestValue(...)`.
- A non-optional `AppEnum` parameter is disambiguated by the system automatically.
- Only parameters named in `parameterSummary` (`Summary("Open \(\.$section)")`) show in the Shortcuts editor, in summary order. Use `When` / `Switch` to show parameters conditionally.

## Dependencies

- An unregistered `@Dependency` is a `fatalError`, not a thrown error. Register in `AppDelegate.application(_:didFinishLaunchingWithOptions:)`, which runs on headless launches. Never register from a view controller or `SceneDelegate`.
- `@Dependency` works on intents and queries, not on `AppEntity` or `AppEnum`.
- The dependency type must be `Sendable`. Make the store an `actor`, or isolate it with `@MainActor`.

## Errors

- Only errors that conform to `CustomLocalizedStringResourceConvertible` show a real message to the user. Conform your error type, or throw the prebuilt `AppIntentError.PermissionRequired` / `UserActionRequired` / `Unrecoverable` values (iOS 18+).

## Strings

- User-facing strings must be literal `LocalizedStringResource` values so Xcode can extract them. A runtime `String` passed through has no localization key.
- Localize phrases in `AppShortcuts.xcstrings` (or the project string catalog), the same way as UI strings.

## App Shortcut phrases

- Use the `AppShortcut(intent:phrases:shortTitle:systemImageName:)` initializer. The one without `shortTitle` / `systemImageName` is deprecated, and the tile has no title or icon.
- Every phrase must contain `\(.applicationName)`. Otherwise Xcode warns and the runtime index drops the phrase.
- Interpolate only parameters with a finite set (`AppEnum`, `AppEntity`, `Bool` with display names). Never free text or numbers.
- At most 10 App Shortcuts per app (build error above that). Keep phrases short and distinct; near-duplicates reduce match quality.
- Call `AppShortcuts.updateAppShortcutParameters()` when the entity options behind a phrase change (for example the user creates a new list).
- Register alternative app names with `INAlternativeAppNames` in Info.plist when users call the app by another name.

```swift
@available(iOS 16.0, *)
struct AppShortcuts: AppShortcutsProvider {
    static var appShortcuts: [AppShortcut] {
        AppShortcut(
            intent: OpenSectionIntent(),
            phrases: [
                "Open \(\.$section) in \(.applicationName)",
                "Show my \(.applicationName) \(\.$section)"
            ],
            shortTitle: "Open Section",
            systemImageName: "square.grid.2x2"
        )
    }
}
```

## Factoring

- Fixed set of choices: `AppEnum`. Dynamic, searchable data: `AppEntity` + `EntityQuery`. Free-form value: plain `@Parameter`.
- One intent per atomic task. A mega-intent with a "mode" parameter is hard to phrase, summarize and test.
