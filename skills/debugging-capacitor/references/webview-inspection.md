# WebView Inspection (Safari / Chrome)

## Defaults that matter

| Setting | Default | Effect |
|---|---|---|
| `ios.webContentsDebuggingEnabled` | `true` for Debug builds, `false` for Release | Sets `WKWebView.isInspectable` (iOS 16.4+). Only set `true` explicitly to inspect a Release/TestFlight build. |
| `android.webContentsDebuggingEnabled` | equals the build's debuggable flag | Calls `WebView.setWebContentsDebuggingEnabled`. Set `true` only for temporary release debugging. |
| `loggingBehavior` (root, or per `ios`/`android`) | `debug` | `none` / `debug` / `production`. With `none`, Capacitor stops mirroring JS console to native logs. |

Remove forced `webContentsDebuggingEnabled: true` before store submission; an inspectable release WebView exposes app internals.

## iOS: Safari Web Inspector

1. Device: Settings > Apps > Safari > Advanced > Web Inspector ON (older iOS: Settings > Safari > Advanced).
2. Mac: Safari > Settings > Advanced > "Show features for web developers" (older Safari: "Show Develop menu").
3. Run the app, then Safari > Develop > <device or Simulator> > the app's page (`capacitor://localhost` or your `server.url`).

Traps:
- Inspector not listed: Release build without `webContentsDebuggingEnabled: true`, device not trusted, or the app is not foregrounded yet.
- Errors during the first milliseconds are lost because you attach after launch. Either reload from the inspector (Cmd+R inside Web Inspector reloads the WebView) or temporarily add a `debugger;` / delay at app bootstrap.
- Safari Technology Preview can inspect newer iOS betas when stock Safari cannot.

## Android: Chrome DevTools

1. Enable Developer options + USB debugging on the device; confirm with `adb devices`.
2. Open `chrome://inspect/#devices` in Chrome/Edge on the computer, find the app's WebView, click **inspect**.

Traps:
- Blank DevTools window: the inspector front-end is fetched for the device's WebView version, so the computer needs internet on first use.
- Device listed but no WebView: Release build, or the WebView has not been created yet.
- WebView version matters: check Settings > Apps > Android System WebView. Old emulator images ship old WebViews that miss modern JS syntax, causing a white screen with a `SyntaxError` in the console.

## What to check in the inspector

- Console: first red error on launch is usually the root cause of a white screen.
- Network: failed requests show `(failed) net::ERR_...` on Android; on iOS look for ATS or CORS messages.
- Application/Storage: `localStorage` and IndexedDB can be evicted by the OS; do not store critical data there (see `capacitor-offline-first`).
- `Capacitor.getPlatform()`, `Capacitor.isPluginAvailable('Camera')`, `Capacitor.isNativePlatform()` can be evaluated in the console to confirm the bridge loaded.

## Live reload setups

- Capacitor 9: `npx cap run <platform> --url <dev-server-url>` (overrides `server.url`).
- Capacitor 8: `npx cap run <platform> -l --host <ip> --port <port> [--https]`.
- Persisted alternative (any version): `server: { url: 'http://<ip>:<port>', cleartext: true }` then `npx cap copy`. Do not commit it.
- Android emulator to host machine: use `--forwardPorts 5173:5173` and `http://localhost:5173`, or the emulator alias `10.0.2.2`.
- With live reload the origin changes to the dev server, so cookie, CORS and service-worker behavior differ from the bundled app. Reproduce final bugs without live reload.
