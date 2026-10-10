# Hardening Capacitor Plugin Code

App settings never reach plugin code. Harden the plugin in its own repo, where the plugin is the root project.

## Detect what the plugin compiles

```bash
find ios -name '*.swift' | wc -l
find ios -name '*.m' -o -name '*.mm' -o -name '*.c' -o -name '*.cpp' -o -name '*.h' | head
grep -n 'binaryTarget\|vendored_frameworks\|source_files' Package.swift *.podspec
```

- Pure Swift (most Capacitor 7+ plugins using `CAPBridgedPlugin`): clang warnings do not apply. Focus on Swift warnings, the analyzer is irrelevant, and the `arm64e` readiness of any binary dependency matters.
- ObjC / C / C++ (legacy `CAP_PLUGIN` `.m` files, vendored C libraries such as minizip or sqlite): apply the Stage A and B settings from [settings-catalog.md](settings-catalog.md).

## CocoaPods: podspec

`pod_target_xcconfig` applies only to the plugin's own pod target:

```ruby
s.pod_target_xcconfig = {
  'GCC_WARN_ABOUT_RETURN_TYPE' => 'YES_ERROR',
  'GCC_WARN_UNINITIALIZED_AUTOS' => 'YES_AGGRESSIVE',
  'CLANG_WARN_IMPLICIT_FALLTHROUGH' => 'YES',
  'GCC_WARN_64_TO_32_BIT_CONVERSION' => 'YES',
  'GCC_TREAT_IMPLICIT_FUNCTION_DECLARATIONS_AS_ERRORS' => 'YES'
}
```

Do not use `user_target_xcconfig`. It changes the consumer's app target.

## SPM: Package.swift

- `unsafeFlags` (for example `.unsafeFlags(["-Werror"])`) makes a package unusable as a remote dependency. Never ship it in a plugin's `Package.swift`.
- SwiftPM 6.2 (`swift-tools-version: 6.2`) adds warning-control settings (`treatAllWarnings(as:)`, `treatWarning(_:as:)`, `enableWarning(_:)`, `disableWarning(_:)` on `cSettings` / `cxxSettings` / `swiftSettings`). They apply when the package is built as the root, which is what the plugin's own CI does, so consumers are not affected. Raising the tools version raises the minimum Xcode for consumers: check it against the Capacitor version the plugin supports (Capacitor 9 needs Xcode 27; Capacitor 8 supports Xcode 26). Check current SwiftPM docs before you adopt it.
- Run the analyzer on the plugin as root:

```bash
xcodebuild analyze -scheme <PluginPackageName> -destination 'generic/platform=iOS Simulator'
```

## Ship `arm64e` (and stay consumable)

- Source plugins (podspec or Package.swift) are compiled by the consumer. They get `arm64e` when the consumer opts in (CocoaPods `post_install`, SPM `iOSPackagesShouldBuildARM64e`). Make sure the code builds as `arm64e`: no inline assembly with raw pointers, no casts between incompatible function pointer types.
- Plugins that ship an xcframework (`binaryTarget`, `vendored_frameworks`) must build it with pointer authentication on. The device slice then contains `arm64` and `arm64e`, and consumers who opt into Enhanced Security can still link it. Verify before you release:

```bash
lipo -archs MyPlugin.xcframework/ios-arm64*/MyPlugin.framework/MyPlugin
# expect: arm64 arm64e
```

- Build the distributed artifact with `ONLY_ACTIVE_ARCH = NO` (the Release default).
- When the plugin wraps a vendor SDK without `arm64e`, say so in the README so app teams know why they must opt their App target out of pointer authentication.

## Test the hardened plugin

Run the plugin's example app with the app-side Enhanced Security turned on, on a real device. Memory tagging in soft mode is a cheap way to catch use-after-free in bundled C code before users do.
