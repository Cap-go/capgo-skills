# Enhanced Security for Capacitor Apps

Enhanced Security is an Xcode capability (introduced in Xcode 26). It has two parts on the App target:

1. **Build settings**: `ENABLE_ENHANCED_SECURITY = YES`, which cascades pointer authentication, stack zero-initialization, security warnings, typed allocator support and libc++ hardening.
2. **Entitlements**: the `com.apple.security.hardened-process` family, which turns on the runtime protections.

Add it with **Signing & Capabilities > + Capability > Enhanced Security** on the App target. Xcode writes both parts. Then move `ENABLE_ENHANCED_SECURITY = YES` to the project level, so targets added later (widgets, App Intents extension, Notification Service extension) inherit it.

Apple docs: https://developer.apple.com/documentation/xcode/enabling-enhanced-security-for-your-app

## Which targets

| Target in a Capacitor project | Enhanced Security |
|---|---|
| App (`com.apple.product-type.application`) | Build settings and entitlements |
| App extensions (widget, share, notification service) | Not a supported product type for the entitlements. Settings are inherited from the project level, which is harmless |
| Plugin frameworks / static libraries (pods, SPM) | No entitlements. Pointer authentication still matters because the library must ship `arm64e`. See [plugin-authors.md](plugin-authors.md) |
| Test bundles | Skip |

## Entitlements

Required when the capability is on:

- `com.apple.security.hardened-process` = `true`
- `com.apple.security.hardened-process.enhanced-security-version-string` = `"2"` (the value current Xcode writes; let Xcode set it)

On by default (add them if they are missing):

- `com.apple.security.hardened-process.hardened-heap`: type-isolated allocator buckets
- `com.apple.security.hardened-process.dyld-ro`: dyld state is read-only
- `com.apple.security.hardened-process.platform-restrictions-string` = `"2"`: dylib loading and Mach message checks. Capacitor and normal plugins do not load dylibs at runtime or use raw Mach IPC, so this is safe. Review only plugins that use raw Mach APIs

Off by default (offer, never auto-enable):

- `com.apple.security.hardened-process.checked-allocations`: hardware memory tagging (MTE)
- `com.apple.security.hardened-process.checked-allocations.soft-mode`: produces simulated crash reports instead of terminating. It modifies the parent key; on its own it does nothing
- `...checked-allocations.enable-pure-data`, `...checked-allocations.no-tagged-receive`
- `...checked-allocations.enforce-checked-pointer-arithmetic-overflow`: needs the `arm64e.x1` slice (`ENABLE_HARDWARE_CHECKED_POINTER_ARITHMETIC_SLICE = YES`) and memory tagging. There is no soft mode, so a latent bug terminates the app

Entitlement reference: https://developer.apple.com/documentation/bundleresources/entitlements/com.apple.security.hardened-process

Read the entitlements file from the evaluated `CODE_SIGN_ENTITLEMENTS` path. Do not glob for `*.entitlements`: old or orphaned files are common in Capacitor repos.

## Pointer authentication and Capacitor dependencies

With pointer authentication on, device builds contain `arm64` and `arm64e`. Everything linked into the `arm64e` slice must also be `arm64e`. Check each dependency type:

### SPM projects (Capacitor 8 SPM template, default for new apps)

- **Source packages** (most `@capgo/*` and `@capacitor/*` plugins): Xcode does not build Swift packages as `arm64e` unless the workspace opts in. Add these to the project's implicit workspace:

```bash
F=ios/App/App.xcodeproj/project.xcworkspace/xcshareddata/WorkspaceSettings.xcsettings
[ -f "$F" ] || plutil -create xml1 "$F"
plutil -insert iOSPackagesShouldBuildARM64e -bool YES "$F"
```

  Commit that file. Check first whether it already exists; `plutil -insert` fails if the key is already there (use `-replace` then).
- **Binary targets**: `capacitor-swift-pm` ships the Capacitor and Cordova runtimes as prebuilt xcframeworks, and some plugins wrap vendor SDKs as `binaryTarget`. Check every slice:

```bash
find ~/Library/Developer/Xcode/DerivedData/App-*/SourcePackages/artifacts -path '*ios-arm64*' -name '*.framework' \
  | while read f; do echo "$f: $(lipo -archs "$f/$(basename "$f" .framework)" 2>/dev/null)"; done
```

  If one has no `arm64e`, set `ENABLE_POINTER_AUTHENTICATION = NO` **on the App target** (not the project) and keep the rest of Enhanced Security. Record the blocking dependency in the decision log and revisit it on each upgrade.

### CocoaPods projects

Pods are built in `Pods.xcodeproj`, which does not inherit the App project's settings. Two options. Ask the user which one:

1. Build pods as `arm64e` too, in `ios/App/Podfile` (the CLI leaves `post_install` alone):

```ruby
post_install do |installer|
  assertDeploymentTarget(installer)
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      config.build_settings['ENABLE_POINTER_AUTHENTICATION'] = 'YES'
    end
  end
end
```

   Then `cd ios/App && pod install`. Vendored binaries (`vendored_frameworks`) still need their own `arm64e` slice.
2. Set `ENABLE_POINTER_AUTHENTICATION = NO` on the App target.

CocoaPods Trunk becomes read-only in December 2026. Moving to SPM (`cocoapods-to-spm`) also simplifies this.

### Cordova plugins

`npx cap sync` generates the Cordova plugin package or pod. You cannot persist settings there. Treat it like a source pod or package (the options above), or opt the App target out.

### Never

- Do not add a simulator-only `ENABLE_POINTER_AUTHENTICATION = NO`. Simulator SDKs have no `arm64e`, and the build system already drops it.
- Do not drop Enhanced Security entirely because of one dependency. Opt the App target out of pointer authentication only.

## Hardware memory tagging rollout

Hardware: iPhone or iPad with an A19 chip or later. Other devices ignore it.

1. Add `checked-allocations` and `soft-mode`.
2. Ship to internal testers (TestFlight). Collect simulated crash reports.
3. Fix them, or update the plugin or SDK that owns the faulting code. Native C code bundled by plugins (zip extraction, SQLite, crypto, image codecs) is the usual source.
4. Remove `soft-mode` to enforce.

For local diagnosis: Scheme > Run > Diagnostics > Hardware Memory Tagging.

## Staged order

1. Compiler warnings, stack zero-init, read-only dyld state: zero runtime risk. Build, then fix warnings.
2. Runtime restrictions and typed allocators: safe for apps without raw Mach IPC or custom allocators.
3. Pointer authentication: needs the dependency plan above.
4. Memory tagging (soft mode first), then checked pointer arithmetic: hardware-dependent and highest effort.
