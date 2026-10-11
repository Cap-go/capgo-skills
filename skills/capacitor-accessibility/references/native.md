# Native Accessibility for Custom Plugin Views

Only needed when your app or plugin presents its own native UI (custom view controller, overlay, camera UI).

## iOS (UIKit)

```swift
button.isAccessibilityElement = true
button.accessibilityLabel = "Capture photo"
button.accessibilityHint = "Takes a photo and returns to the app"
button.accessibilityTraits = .button

// Announce a change (e.g. scan result) from native code
UIAccessibility.post(notification: .announcement, argument: "Code scanned")

// When presenting a new native screen, move VoiceOver focus
UIAccessibility.post(notification: .screenChanged, argument: titleLabel)
```

Check `UIAccessibility.isVoiceOverRunning` and observe `UIAccessibility.voiceOverStatusDidChangeNotification` if behavior must differ. Use `UIFont.preferredFont(forTextStyle:)` with `adjustsFontForContentSizeCategory = true` so native text follows Dynamic Type. On Capacitor 8.5+ (UIScene lifecycle), read window and trait information from the view's scene, not `UIScreen.main`.

## Android (Views)

```kotlin
captureButton.contentDescription = "Capture photo"
ViewCompat.setAccessibilityDelegate(view, object : AccessibilityDelegateCompat() {
    override fun onInitializeAccessibilityNodeInfo(host: View, info: AccessibilityNodeInfoCompat) {
        super.onInitializeAccessibilityNodeInfo(host, info)
        info.roleDescription = "Shutter"
    }
})
// Announce changes with a live region rather than announceForAccessibility (deprecated)
ViewCompat.setAccessibilityLiveRegion(statusText, ViewCompat.ACCESSIBILITY_LIVE_REGION_POLITE)
statusText.text = "Code scanned"
```

Use `sp` for text sizes so the system font scale applies; minimum touch target 48dp.

## Exposing state to JS

If JS needs to adapt (for example skip an animation when VoiceOver is on), use `@capacitor/screen-reader` `isEnabled()` and the `stateChange` listener rather than writing a custom plugin.
