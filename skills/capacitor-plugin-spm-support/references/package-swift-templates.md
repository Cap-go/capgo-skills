# Package.swift Templates for Capacitor Plugins

`<Name>` must equal the CLI-derived name from the npm package (`@acme/capacitor-foo` -> `AcmeCapacitorFoo`). Target names are free; product name is not.

## Base (Capacitor 9 / next)

```swift
// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "AcmeCapacitorFoo",
    platforms: [.iOS(.v16)],
    products: [
        .library(name: "AcmeCapacitorFoo", targets: ["FooPlugin"])
    ],
    dependencies: [
        // Until 9.0.0 GA, use the current prerelease (check npm @capacitor/ios dist-tags next)
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "9.0.0-alpha.6")
    ],
    targets: [
        .target(
            name: "FooPlugin",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm")
            ],
            path: "ios/Sources/FooPlugin"),
        .testTarget(
            name: "FooPluginTests",
            dependencies: ["FooPlugin"],
            path: "ios/Tests/FooPluginTests")
    ]
)
```

## Capacitor 8 (stable)

Same, with `platforms: [.iOS(.v15)]` and `from: "8.0.0"`. Generated templates also list `.product(name: "Cordova", package: "capacitor-swift-pm")`; drop it unless your code imports Cordova, which makes the manifest ready for Capacitor 9.

## Resources and privacy manifest

```swift
.target(
    name: "FooPlugin",
    dependencies: [.product(name: "Capacitor", package: "capacitor-swift-pm")],
    path: "ios/Sources/FooPlugin",
    resources: [
        .process("Resources"),
        .copy("PrivacyInfo.xcprivacy")
    ])
```

Load with `Bundle.module`. Mirror in podspec with `s.resource_bundles = { 'FooPlugin' => ['ios/Sources/FooPlugin/Resources/**/*', 'ios/Sources/FooPlugin/PrivacyInfo.xcprivacy'] }`; CocoaPods code must not use `Bundle.module` unguarded (`#if SWIFT_PACKAGE`).

## Third-party SPM dependency (replacing `s.dependency`)

```swift
dependencies: [
    .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "8.0.0"),
    .package(url: "https://github.com/vendor/sdk-ios.git", from: "3.2.0")
],
targets: [
    .target(
        name: "FooPlugin",
        dependencies: [
            .product(name: "Capacitor", package: "capacitor-swift-pm"),
            .product(name: "VendorSDK", package: "sdk-ios")
        ],
        path: "ios/Sources/FooPlugin")
]
```

Use the vendor's documented product name; package identity is the last path component of the URL. Keep version ranges compatible with the podspec to avoid different behavior between CocoaPods and SPM apps. If two plugins in one app pull conflicting module names, apps can use `experimental.ios.spm.packageOptions[<id>].moduleAliases` (Capacitor 8.4+).

## Binary framework

```swift
.binaryTarget(name: "VendorKit", path: "ios/Frameworks/VendorKit.xcframework"),
.target(name: "FooPlugin", dependencies: [
    .product(name: "Capacitor", package: "capacitor-swift-pm"), "VendorKit"
], path: "ios/Sources/FooPlugin")
```

Only `.xcframework` works; plain `.framework` must be rebuilt as an xcframework. Add the xcframework path to package.json `files`.

## Mixed Swift + ObjC

SPM targets are single-language. Put ObjC/C in its own target with headers in `include/`:

```swift
.target(name: "FooPluginObjC", path: "ios/Sources/FooPluginObjC", publicHeadersPath: "include"),
.target(name: "FooPlugin", dependencies: [
    .product(name: "Capacitor", package: "capacitor-swift-pm"), "FooPluginObjC"
], path: "ios/Sources/FooPlugin")
```

Swift imports it with `import FooPluginObjC` (guard with `#if SWIFT_PACKAGE` if the podspec compiles both into one module).
