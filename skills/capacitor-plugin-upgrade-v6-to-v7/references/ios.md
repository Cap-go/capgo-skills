# Plugin iOS changes for Capacitor 7

Source: https://capacitorjs.com/docs/updating/plugins/7-0

## Podspec

```diff
-  s.ios.deployment_target = '13.0'
+  s.ios.deployment_target = '14.0'
```

## SPM-compatible plugins (`Package.swift`)

```diff
-    platforms: [.iOS(.v13)],
+    platforms: [.iOS(.v14)],
     dependencies: [
-        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", branch: "main")
+        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "7.0.0")
     ],
```

A `branch: "main"` dependency floats to whatever is on main (now v8/v9 work) and breaks consumers. Always pin `from:`.

## Plugins with the old structure (`ios/Plugin.xcodeproj` + `ios/Podfile`)

- In Xcode, Project and every Target: Build Settings -> Deployment -> iOS Deployment Target = 14.0.
- `ios/Podfile`:

```diff
-platform :ios, '13.0'
+platform :ios, '14.0'
```

Consider converting to the SPM structure now (`capacitor-plugin-spm-support`). CocoaPods Trunk is expected to become read-only on Dec 2, 2026.

## Removed APIs (Swift)

```diff
-call.success(["value": v])
+call.resolve(["value": v])
-call.error("Failed")
+call.reject("Failed")
```
