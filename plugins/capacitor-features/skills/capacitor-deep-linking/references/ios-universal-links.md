# iOS Universal Links

Load when configuring or debugging `https://` links that should open the iOS app.

## 1. Associated Domains entitlement

Xcode -> App target -> Signing & Capabilities -> + Capability -> Associated Domains -> add `applinks:example.com` (one entry per host; `www` is a separate host).

This writes `ios/App/App/App.entitlements`:

```xml
<key>com.apple.developer.associated-domains</key>
<array>
  <string>applinks:example.com</string>
  <string>applinks:www.example.com</string>
</array>
```

The key belongs in the `.entitlements` file, not `Info.plist`. The App ID in the Apple Developer portal must also have Associated Domains enabled, and the provisioning profile must be regenerated (automatic signing does this).

## 2. apple-app-site-association (AASA)

Serve at `https://example.com/.well-known/apple-app-site-association` (no `.json` extension):

```json
{
  "applinks": {
    "details": [
      {
        "appIDs": ["ABCDE12345.com.example.app"],
        "components": [
          { "/": "/product/*" },
          { "/": "/invite/*" },
          { "/": "/api/*", "exclude": true }
        ]
      }
    ]
  }
}
```

- `appIDs` = Team ID + bundle ID. Team ID is in the Developer portal Membership page.
- `components` (iOS 13+) replaces the older `paths` array. The legacy `"apps": [], "paths": [...]` format still works for older targets; you can include both.
- Requirements: HTTPS with a valid certificate, HTTP 200, no redirects, `Content-Type: application/json`, under 128 KB.
- Apple's CDN caches AASA. Devices fetch it from the CDN on install / update, not from your server directly.

## 3. Verify

```bash
curl -sI https://example.com/.well-known/apple-app-site-association     # 200, application/json, no 3xx
curl -s https://app-site-association.cdn-apple.com/a/v1/example.com      # what devices actually get
codesign -d --entitlements :- "path/to/App.app" | grep -A3 associated-domains
```

During development, bypass the CDN: use `applinks:example.com?mode=developer` and enable Settings -> Developer -> Associated Domains Development on the device. Remove `?mode=developer` for release builds.

## Traps

- Typing the URL into Safari's address bar does not trigger a Universal Link. Tap it from Notes, Messages, or Mail.
- A link to the same domain the user is already browsing in Safari opens in Safari.
- If the user once chose "Open in Safari" from the long-press menu, iOS remembers it. Long-press -> "Open in <App>" to undo.
- CDN cache can take hours to refresh after editing AASA. Use developer mode while iterating.
- With Capacitor 8.5+ scenes, Universal Links arrive via `scene(_:continue:)` (warm) or `connectionOptions.userActivities` (cold). See `ios-scene-delegate.md`.
- `server.hostname` / `server.url` in `capacitor.config` do not affect Universal Links; do not point them at your link domain.
