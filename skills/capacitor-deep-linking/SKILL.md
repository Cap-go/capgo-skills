---
name: capacitor-deep-linking
description: Implements and debugs deep links in Capacitor apps - custom URL schemes, iOS Universal Links (apple-app-site-association, Associated Domains entitlement), Android App Links (assetlinks.json, autoVerify), and routing via @capacitor/app `appUrlOpen` + `App.getLaunchUrl()`. Covers the Capacitor 8.5+ UIScene change where AppDelegate `application(_:open:options:)` and `continue userActivity` stop being called and custom handling must move to SceneDelegate, plus cold vs warm launch testing. Use when links open Safari/Chrome instead of the app, `appUrlOpen` never fires, the launch URL is lost on cold start, or OAuth redirects do not return to the app. Do not use for the full UIScene migration (capacitor-uiscene-migration), push notification taps (capacitor-push-notifications), or social login plugin setup (capacitor-plugins).
---

# Deep Linking in Capacitor

Route custom-scheme links, iOS Universal Links, and Android App Links into the web app.

## When to Use

TRIGGER when:
- Adding `myapp://` schemes, Universal Links, or App Links to a Capacitor app
- Links open the browser instead of the app, or open the app but land on the home page
- `appUrlOpen` fires on warm open but the URL is missing on cold launch (or the reverse)
- Deep links broke after updating to Capacitor 8.5+ / adopting `SceneDelegate.swift`
- OAuth / magic-link / payment redirects must come back into the app
- `adb shell pm get-app-links` shows `none` or `1024` instead of `verified`

Do not use:
- Full AppDelegate -> SceneDelegate migration of an app: `capacitor-uiscene-migration`
- Notification tap routing: `capacitor-push-notifications`
- Native log capture while debugging: `ios-android-logs`
- Sign in with Apple / Google plugin config: `capacitor-plugins`

## Link Types

| Type | Platform | Format | Needs hosted file | Verified ownership |
|------|----------|--------|-------------------|--------------------|
| Custom scheme | both | `myapp://product/123` | no | no (any app can claim it) |
| Universal Links | iOS | `https://example.com/product/123` | `/.well-known/apple-app-site-association` | yes |
| App Links | Android 6+ | `https://example.com/product/123` | `/.well-known/assetlinks.json` | yes |

Prefer verified https links for anything security-sensitive (OAuth, magic links). Custom schemes can be hijacked by another app.

## Workflow

1. **Inspect first.** Read `capacitor.config.*`, `ios/App/App/Info.plist`, `ios/App/App/*.entitlements`, `ios/App/App/AppDelegate.swift`, `ios/App/App/SceneDelegate.swift` (if present), `android/app/src/main/AndroidManifest.xml`, and the `@capacitor/app` version in `package.json`.
2. **Decide the iOS lifecycle path.**
   - `UIApplicationSceneManifest` present in Info.plist (Capacitor 8.5+ template or migrated app) -> URL events arrive in `SceneDelegate`. Any custom code in AppDelegate `application(_:open:options:)` or `application(_:continue:restorationHandler:)` is dead code. See [references/ios-scene-delegate.md](references/ios-scene-delegate.md).
   - No scene manifest -> AppDelegate path still works on 8.5 core, but Xcode 27 / Capacitor 9 require the scene lifecycle. Hand the migration to `capacitor-uiscene-migration`.
3. **Install** `@capacitor/app` (`npm install @capacitor/app && npx cap sync`).
4. **Register the JS handler once, at app bootstrap** (before the router renders), using both `appUrlOpen` and `getLaunchUrl()`. See below.
5. **Configure platforms**: custom scheme (Info.plist `CFBundleURLTypes`, Android `<intent-filter>`), then verified links per platform:
   - iOS Universal Links: [references/ios-universal-links.md](references/ios-universal-links.md)
   - Android App Links: [references/android-app-links.md](references/android-app-links.md)
6. **Route** in the framework router: [references/routing-patterns.md](references/routing-patterns.md) (React, Vue, Angular, OAuth callbacks, deferred links).
7. **Verify** with the cold/warm matrix below on a real device.

Only load a reference when its topic is in play.

## JS Handler (the part every app needs)

```typescript
import { App, type URLOpenListenerEvent } from '@capacitor/app';

let lastHandled: string | undefined;

function route(rawUrl: string) {
  if (rawUrl === lastHandled) return; // cold start can deliver the same URL to both paths
  lastHandled = rawUrl;
  const url = new URL(rawUrl);
  // myapp://product/123 -> host "product", pathname "/123"
  // https://example.com/product/123 -> pathname "/product/123"
  const path = url.protocol.startsWith('http')
    ? url.pathname
    : `/${url.host}${url.pathname}`;
  router.navigate(path + url.search); // your router
}

export async function initDeepLinks() {
  await App.addListener('appUrlOpen', (event: URLOpenListenerEvent) => route(event.url));
  const launch = await App.getLaunchUrl(); // resolves undefined or { url }
  if (launch?.url) route(launch.url);
}
```

Traps:
- Custom scheme URLs parse with the first segment as `host`, not `pathname`. Normalize both forms as above.
- Register the listener at bootstrap, not inside a lazily loaded page. A listener added after the event fired never sees it; `getLaunchUrl()` is the fallback for cold start.
- Wrap state updates from the listener in your framework's zone/run loop (Angular `NgZone.run`) or navigation silently does nothing.
- Dedupe: on cold start the URL can be reachable via both `getLaunchUrl()` and `appUrlOpen`.
- Validate and allow-list paths before navigating; a deep link is untrusted input.

## Custom Scheme Config

iOS `ios/App/App/Info.plist`:

```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLName</key>
    <string>com.example.app</string>
    <key>CFBundleURLSchemes</key>
    <array><string>myapp</string></array>
  </dict>
</array>
```

Android `AndroidManifest.xml`, inside the existing `MainActivity` (keep the template's `android:launchMode="singleTask"` so warm opens reuse the activity):

```xml
<intent-filter>
  <action android:name="android.intent.action.VIEW" />
  <category android:name="android.intent.category.DEFAULT" />
  <category android:name="android.intent.category.BROWSABLE" />
  <data android:scheme="myapp" />
</intent-filter>
```

## Verification

Run every row on a physical device (Universal Links do not work reliably from the Simulator address bar; tap from Notes/Messages instead).

| Scenario | iOS | Android |
|----------|-----|---------|
| Custom scheme, warm | `xcrun simctl openurl booted "myapp://product/123"` | `adb shell am start -W -a android.intent.action.VIEW -d "myapp://product/123" com.example.app` |
| Custom scheme, cold | kill app, then same command | `adb shell am force-stop com.example.app`, then same command |
| Verified link, warm | tap `https://example.com/product/123` in Notes | `adb shell am start -W -a android.intent.action.VIEW -c android.intent.category.BROWSABLE -d "https://example.com/product/123"` |
| Verified link, cold | swipe app away, tap link | force-stop, then same command |
| Ownership check | `curl -sI https://example.com/.well-known/apple-app-site-association` (200, no redirect) | `adb shell pm get-app-links com.example.app` shows `verified` |

Pass criteria: each case lands on the right route, `appUrlOpen` logs once, and on cold start `getLaunchUrl()` returns the URL. After a Capacitor 8.5 scene migration, re-run the full matrix: cold launch takes a different native path (`scene(_:willConnectTo:options:)`) than warm open (`scene(_:openURLContexts:)` / `scene(_:continue:)`).

Grep for dead handlers after migration:

```bash
grep -n "open url: URL\|continue userActivity" ios/App/App/AppDelegate.swift
grep -n "SceneDelegateProxy" ios/App/App/SceneDelegate.swift
```

## Error Handling

| Symptom / message | Cause | Fix |
|-------------------|-------|-----|
| Link opens in Safari, app installed | AASA not fetched, wrong `appID`, entitlement missing, or user long-pressed and chose "Open in Safari" | Check AASA via Apple CDN, `TEAMID.bundleId`, `applinks:` entitlement; long-press link and choose "Open in App" to reset |
| Custom AppDelegate URL code stopped running after 8.5 update | Scene manifest exists; iOS calls SceneDelegate instead | Move logic to `SceneDelegate` (reference: ios-scene-delegate) |
| Warm opens work, cold launch lands on home | Listener registered late, or custom SceneDelegate code ignores `connectionOptions` | Call `getLaunchUrl()` at bootstrap; keep `SceneDelegateProxy.shared.scene(_:willConnectTo:options:)` |
| `Safari cannot open the page because the address is invalid` | Custom scheme not registered in installed build | Add `CFBundleURLTypes`, rebuild (not just `cap sync`) |
| `Error: Activity not started, unable to resolve Intent` | No intent-filter matches scheme/host | Fix `<data>` entries; reinstall app |
| `pm get-app-links` shows `1024` or `none` | assetlinks.json unreachable, wrong package, or wrong SHA-256 (often the Play App Signing key) | Fix file, then `adb shell pm verify-app-links --re-verify com.example.app` |
| Android shows app chooser for https link | Domain not verified (`autoVerify` missing or failed) | Add `android:autoVerify="true"`, re-verify |
| OAuth redirect returns to browser tab, not app | Redirect URI does not match registered scheme / verified domain | Register exact redirect URI; prefer verified https link |

## Resources

- Capacitor deep links guide: https://capacitorjs.com/docs/guides/deep-links
- App plugin API: https://capacitorjs.com/docs/apis/app
- Updating to 8.5 (UIScene): https://capacitorjs.com/docs/updating/8-5
- Apple Universal Links: https://developer.apple.com/documentation/xcode/supporting-associated-domains
- Android App Links: https://developer.android.com/training/app-links/verify-android-applinks
