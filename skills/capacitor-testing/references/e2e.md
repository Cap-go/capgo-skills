# End-to-End Tests

## Playwright: the web build

Fast and stable. Covers routing, forms and most UI. Native plugins fall back to their web implementations or your mocks.

```bash
npm install -D @playwright/test
npx playwright install
```

```ts
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e/web',
  use: { baseURL: 'http://localhost:5173', trace: 'on-first-retry' },
  projects: [
    { name: 'webkit-iphone', use: { ...devices['iPhone 15'] } },   // closest to WKWebView
    { name: 'chromium-pixel', use: { ...devices['Pixel 7'] } },    // closest to Android WebView
    { name: 'webkit-ipad', use: { ...devices['iPad (gen 7)'] } },
  ],
  webServer: { command: 'npm run dev', url: 'http://localhost:5173', reuseExistingServer: !process.env.CI },
});
```

Device names must exist in Playwright's device list for the installed version (`npx playwright show-devices` or `playwright-core/lib/server/deviceDescriptorsSource.json`).

For plugin calls in Playwright, inject a fake before the app loads:

```ts
await page.addInitScript(() => {
  (window as any).__E2E__ = true; // let the app pick a fake service layer
});
```

Playwright's WebKit is not WKWebView: no Capacitor bridge, no native plugins, different storage persistence. Keep native behavior for device tests.

## Appium: the real app

Use Appium (with WebdriverIO) when the test must cover native UI, permissions, plugins or deep links.

```bash
npm install -D webdriverio @wdio/cli @wdio/local-runner @wdio/mocha-framework @wdio/appium-service appium
npx appium driver install xcuitest
npx appium driver install uiautomator2
```

```ts
// wdio.conf.ts (capabilities only)
capabilities: [{
  platformName: 'iOS',
  'appium:automationName': 'XCUITest',
  'appium:deviceName': 'iPhone 16',
  'appium:app': './ios/build/Build/Products/Debug-iphonesimulator/App.app',
}, {
  platformName: 'Android',
  'appium:automationName': 'UiAutomator2',
  'appium:app': './android/app/build/outputs/apk/debug/app-debug.apk',
}],
```

Build the simulator `.app` with a known path:

```bash
xcodebuild -project ios/App/App.xcodeproj -scheme App -configuration Debug \
  -sdk iphonesimulator -derivedDataPath ios/build build
cd android && ./gradlew assembleDebug
```

### Switch into the WebView

The DOM is only reachable in a `WEBVIEW_*` context:

```ts
async function useWebView() {
  await driver.waitUntil(async () =>
    (await driver.getContexts()).some((c) => String(c).startsWith('WEBVIEW')), { timeout: 20000 });
  const contexts = await driver.getContexts();
  await driver.switchContext(String(contexts.find((c) => String(c).startsWith('WEBVIEW'))));
}

it('logs in', async () => {
  await useWebView();
  await $('[data-testid="email"]').setValue('test@example.com');
  await $('[data-testid="login"]').click();
  await expect($('h1')).toHaveText(expect.stringContaining('Welcome'));
  await driver.switchContext('NATIVE_APP'); // for permission dialogs and native sheets
});
```

- Permission dialogs, native pickers and plugin overlays are in `NATIVE_APP`.
- The WebView must be inspectable: debug builds are, by default. Release builds need `webContentsDebuggingEnabled` in `capacitor.config` for the test build only.
- Android needs a chromedriver that matches the device's WebView version. Check the Appium UiAutomator2 docs for autodownload.
- Biometrics on simulators/emulators: XCUITest `mobile: enrollBiometric` / `mobile: sendBiometricMatch`; Android emulator `mobile: fingerprint`. Check the driver docs for the installed version.

## Maestro

Maestro flows (YAML) drive the app through the accessibility tree and can tap web content that exposes accessible text. Capgo's own plugins use it for device smoke tests. It is lighter to set up than Appium, but DOM-level selectors are not available. Check Maestro's docs for WebView support on each platform before you commit to it.

## Make the web app testable

- Add `data-testid` or accessible labels to interactive elements.
- Expose a test-only fake service layer behind a build flag, never in production builds.
- Avoid timing-based waits; wait for elements or app state.
