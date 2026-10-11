# Native Unit Tests for Capacitor Plugins

## Layout

The plugin template keeps native tests next to the sources:

```
Package.swift                         # testTarget(name: "<Name>PluginTests", path: "ios/Tests/<Name>PluginTests")
ios/Sources/<Name>Plugin/<Name>.swift         # implementation (testable, no bridge)
ios/Sources/<Name>Plugin/<Name>Plugin.swift   # CAPPlugin glue
ios/Tests/<Name>PluginTests/*.swift
android/src/test/java/...             # JVM unit tests (JUnit)
android/src/androidTest/java/...      # instrumented tests (device/emulator)
```

Test the implementation class first. It has no bridge, so it needs no mocks. Test the `CAPPlugin` glue only for argument parsing, `resolve` / `reject` shape, and events.

## Running

```bash
# iOS: package scheme, iOS Simulator destination (swift test cannot build UIKit/Capacitor on macOS)
xcrun simctl list devices available | grep iPhone
xcodebuild test -scheme <PackageName> -destination 'platform=iOS Simulator,name=iPhone 16'
xcodebuild test -scheme <PackageName> -destination '...' -only-testing:<Name>PluginTests/<SuiteOrClass>

# Android
cd android && ./gradlew test
```

Test targets are not built by apps that consume the plugin, so test-only Swift features do not raise the plugin's minimum Xcode for users.

## Swift Testing or XCTest

| Test kind | Framework |
|---|---|
| New unit tests | Swift Testing (`import Testing`), Xcode 16+ toolchain |
| UI tests with `XCUIApplication` (example app) | XCTest only |
| `measure { }` performance tests | XCTest only (other methods in the same class can migrate) |
| AppIntentsTesting (iOS 27) | XCTest |

Migrate one class at a time. A file can import both `XCTest` and `Testing` during migration. When you remove `import XCTest`, add `import Foundation` if the file uses Foundation types (XCTest re-exported it).

### Migration map

| XCTest | Swift Testing |
|---|---|
| `final class FooTests: XCTestCase` | `struct FooTests` (`final class` or `actor` if you need `deinit`) |
| `override func setUp()` | `init() async throws`; stored properties initialized there, no IUOs |
| `override func tearDown()` | `deinit` (class / actor only) |
| `func testParsesUrl()` | `@Test func parsesUrl()`; sentence names with raw identifiers need Swift 6.2 (Xcode 26+) |
| `XCTAssertEqual(a, b)`, `XCTAssertTrue(x)`, `XCTAssertNil(x)` | `#expect(a == b)`, `#expect(x)`, `#expect(x == nil)` |
| `try XCTUnwrap(x)` | `try #require(x)` |
| `XCTAssertThrowsError(try f())` | `#expect(throws: (any Error).self) { try f() }`, or the specific error value when Equatable |
| `XCTAssertNoThrow(try f())` | `#expect(throws: Never.self) { try f() }` |
| `continueAfterFailure = false` | `try #require(...)` for every later assertion in the affected tests |
| `XCTestExpectation` + `fulfill` + `fulfillment(of:)` | `await confirmation { confirm in ... }` when the callback fires before the closure returns; otherwise `withCheckedContinuation` |
| `XCTSkipIf(c)` / `XCTSkipUnless(c)` | `@Test(.disabled(if: c))` / `.enabled(if: c)`; OS checks become `@available` on the test |
| `XCTExpectFailure` | `withKnownIssue { }` (`isIntermittent: true` for flaky) |
| `XCTAssertEqual(a, b, accuracy: e)` | No direct equivalent; `#expect(abs(a - b) <= e)` |
| `XCTAttachment` | `Attachment.record(value)` |

Swift Testing runs tests in parallel on arbitrary tasks. XCTest ran synchronous tests on the main actor, one at a time. Add `@MainActor` only to tests that relied on that, and `@Suite(.serialized)` to suites that share state (UserDefaults, files, singletons). Plugins often have such state.

Loops over inputs become parameterized tests: `@Test(arguments: ["a", "b"]) func parses(_ input: String)`.

Use only public API; no underscore-prefixed symbols.

### Testing a plugin method

`CAPPluginCall(callbackId:methodName:options:success:error:)` is the current initializer (the one without `methodName:` is deprecated, and Capacitor 9 removed many deprecated APIs). Create plugins with plain `init()`; the bridge is `nil` in tests.

```swift
import Testing
import Capacitor
@testable import EchoPlugin

@Suite struct EchoPluginTests {
    @Test func echoReturnsValue() async throws {
        let plugin = EchoPlugin()
        let value: String? = await withCheckedContinuation { continuation in
            let call = CAPPluginCall(
                callbackId: "test-1",
                methodName: "echo",
                options: ["value": "hello"],
                success: { result, _ in continuation.resume(returning: result?.data?["value"] as? String) },
                error: { _ in continuation.resume(returning: nil) }
            )
            plugin.echo(call!)
        }
        #expect(value == "hello")
    }

    @Test func rejectsMissingValue() async {
        let plugin = EchoPlugin()
        let message: String? = await withCheckedContinuation { continuation in
            let call = CAPPluginCall(callbackId: "test-2", methodName: "echo", options: [:],
                                     success: { _, _ in continuation.resume(returning: nil) },
                                     error: { error in continuation.resume(returning: error?.message) })
            plugin.echo(call!)
        }
        #expect(message != nil)
    }
}
```

Each continuation must resume exactly once. If the method can resolve and also notify, structure it so only one path resumes.

Events: subclass the plugin in the test target and override `notifyListeners(_:data:retainUntilConsumed:)` to record events instead of sending them through the bridge. Override methods that touch `UIApplication` or the bridge with test seams.

## Android (JUnit)

```kotlin
// android/src/test/java/com/example/echo/EchoTest.kt
import org.junit.Assert.assertEquals
import org.junit.Test

class EchoTest {
    @Test
    fun echoReturnsInput() {
        assertEquals("hello", Echo().echo("hello"))
    }
}
```

Test the implementation class without Android framework dependencies in `src/test`. For `PluginCall` glue, mock `PluginCall` with Mockito (`mockito-core` / `mockito-kotlin` as `testImplementation`) and verify `resolve(JSObject)`. Code that needs a `Context`, the WebView or real permissions goes in `src/androidTest` (instrumented, runs on an emulator: `./gradlew connectedAndroidTest`).

Capacitor 9 plugins build with AGP 9, which bundles Kotlin. Remove the standalone `kotlin-android` plugin from test setups copied from older templates.
