# Plugin iOS changes for Capacitor 8

Source: https://capacitorjs.com/docs/updating/plugins/8-0

## Podspec

```diff
-  s.ios.deployment_target = '14.0'
+  s.ios.deployment_target = '15.0'
```

## SPM-compatible plugins (`Package.swift`)

```diff
-    platforms: [.iOS(.v14)],
+    platforms: [.iOS(.v15)],
     dependencies: [
-        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "7.0.0")
+        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "8.0.0")
     ],
```

New Capacitor 8 apps are created with SPM by default (`npx cap add ios`), so a plugin without `Package.swift` cannot be used in them. If the plugin is CocoaPods-only, add SPM now (`capacitor-plugin-spm-support`). CocoaPods Trunk is expected to become read-only on Dec 2, 2026.

## Plugins with the old structure (`ios/Plugin.xcodeproj` + `ios/Podfile`)

- In Xcode, Project and every Target: Build Settings -> Deployment -> iOS Deployment Target = 15.0.
- `ios/Podfile`:

```diff
-platform :ios, '14.0'
+platform :ios, '15.0'
```

## View controller notifications

Capacitor 8 `CAPBridgeViewController` posts `viewDidAppear` and `viewWillTransition` notifications itself (`.capacitorViewDidAppear`, `.capacitorViewWillTransition`). Remove any plugin extension that posted them, or observers fire twice.
