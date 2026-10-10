---
name: webapp-to-capacitor
description: Plans and executes turning an existing web app, PWA, or SPA into a store-ready Capacitor iOS and Android app. Use when the user wants to wrap a website or PWA as a mobile app, worries about Apple guideline 4.2 minimum functionality or thin-WebView rejection, needs a phased migration plan (static build, Capacitor shell, native UX, plugins, permissions, offline, account deletion, in-app purchase vs web billing, demo account, Play closed testing), or asks what still breaks after the first successful cap sync. Do not use for framework build configuration alone (framework-to-capacitor), Cordova apps (cordova-to-capacitor), final store submission mechanics (capacitor-app-store), or an Apple rejection audit (capacitor-apple-review-preflight).
allowed-tools:
  - Bash(node -e *)
  - Bash(find *)
---

# Web App to Capacitor

Turn a production web app into a Capacitor app that behaves like a mobile app and survives store review. The Capacitor shell is usually a day of work; mobile UX, native capabilities, and store policy are the real project.

## When to Use

TRIGGER when:
- "Turn my website / PWA / React (Vue, Angular, Svelte, Next.js, Nuxt) app into an iOS/Android app."
- The user asks whether Apple will reject a WebView wrapper (guideline 4.2) or how to make it feel native.
- The user needs a migration plan covering permissions, offline, auth, account deletion, payments, and testing.

Do not use for:
- Only fixing `webDir`, SSR, or routing for a specific framework -> `framework-to-capacitor`.
- Cordova/PhoneGap/Ionic-Cordova projects -> `cordova-to-capacitor`.
- Uploading builds, screenshots, listing metadata -> `capacitor-app-store`.
- Auditing a submission or answering a rejection -> `capacitor-apple-review-preflight`.
- CI pipelines and signing -> `capacitor-ci-cd` or `capgo-native-builds`.

## Live Project Snapshot

Detected web framework, build scripts, and Capacitor packages:
!`node -e "const fs=require('fs');if(!fs.existsSync('package.json'))process.exit(0);const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));const names=['@capacitor/core','@capacitor/cli','@capacitor/ios','@capacitor/android','@capgo/capacitor-updater','next','react','vue','@angular/core','@sveltejs/kit','nuxt','vite','@ionic/react','@ionic/vue','@ionic/angular','vite-plugin-pwa','workbox-window'];const out=[];for(const section of ['dependencies','devDependencies']){for(const [name,version] of Object.entries(pkg[section]||{})){if(names.includes(name))out.push(section+'.'+name+'='+version)}}for(const [name,cmd] of Object.entries(pkg.scripts||{})){if(/build|dev|preview|start|export|generate|sync|cap|ios|android/i.test(name))out.push('scripts.'+name+'='+cmd)}console.log(out.sort().join('\n'))"`

Relevant config and native project paths:
!`find . -maxdepth 4 -not -path '*/node_modules/*' \( -name 'capacitor.config.*' -o -name 'vite.config.*' -o -name 'next.config.*' -o -name 'nuxt.config.*' -o -name 'angular.json' -o -name 'svelte.config.*' -o -name 'manifest.webmanifest' -o -name 'manifest.json' -o -path './ios' -o -path './android' -o -name 'Info.plist' -o -name 'AndroidManifest.xml' \)`

## Command Policy

Use the target repo's package manager for installs and scripts. Keep Capacitor and Capgo CLI examples as `npx cap ...` and `npx @capgo/cli@latest ...`.

## Procedure

### 1. Audit (report before changing anything)

Produce a short inventory and show it to the user:
- Framework, version, build output directory.
- Server-only features: SSR, API routes, middleware, server actions, image optimization, cookies-based sessions bound to the web origin.
- Auth: providers, cookie vs token sessions, OAuth redirect URIs (web-only redirects break in the app).
- Money: what is sold. Digital goods/subscriptions consumed in the app need Apple IAP / Google Play Billing unless a specific exemption or entitlement applies (reader apps, external purchase link entitlements, region rules). Physical goods and real-world services keep web payments.
- Native capabilities the product needs: camera, photos, files, push, location, biometrics, haptics, share, background work.
- Offline expectations and data that must be local.
- Links that should open the app (universal links / app links).
- PWA pieces: service worker, web manifest, `beforeinstallprompt` UI.

Judgement call to ask the user: if the app offers nothing beyond the website, say so plainly and propose concrete native value (push, offline, camera flows, widgets later) before investing in store submission.

### 2. Static build

Make the app produce `index.html` + assets with no Node server. Load `framework-to-capacitor` for the framework-specific config. Move server-only logic to a hosted API reachable from `capacitor://localhost` (iOS) and `https://localhost` (Android) origins (CORS) or use `CapacitorHttp`.

### 3. Capacitor shell

```bash
npm install @capacitor/core @capacitor/ios @capacitor/android
npm install -D @capacitor/cli
npx cap init "App Name" com.company.app --web-dir dist
npx cap add ios
npx cap add android
npm run build && npx cap sync
```

- Use Capacitor 8.5+ (current stable). It ships the iOS UIScene lifecycle that Xcode 27 requires. Capacitor 9 is on the `next` tag only.
- New projects use SPM on iOS by default; keep it (CocoaPods Trunk is expected to go read-only on Dec 2, 2026).
- Cookies: `localStorage`/cookies from the website do not carry over; the app origin is new. Plan a fresh login.
- Disable or tightly scope the service worker in the app build; it can pin stale bundles.
- Remove "Install this app" PWA prompts and web download links inside the app.

### 4. Native-feeling UX (the 4.2 defence)

- Safe areas and Android edge-to-edge -> `safe-area-handling`.
- Keyboard covering inputs -> `capacitor-keyboard`.
- Splash, icon, launch states -> `capacitor-splash-screen`.
- Platform navigation: tab bars/stacks, Android hardware back button (`App.addListener('backButton', ...)`), swipe-back on iOS, no hover-only controls, 44pt/48dp touch targets.
- Offline and error states instead of browser error pages -> `capacitor-offline-first`.
- External links open in the system browser or `@capacitor/browser`, not inside the app WebView.
- UI kits if needed -> `ionic-design`, `konsta-ui`, `tailwind-capacitor`.

### 5. Native capabilities

Prefer official `@capacitor/*` plugins, then `@capgo/*` when official coverage is missing (see `capacitor-plugins`). For each plugin:
- Add the iOS usage string (`NS...UsageDescription`) with a specific, honest purpose.
- Add Android permissions only when required; ask at the moment of use, never all on first launch.
- Handle denied, limited, and unavailable states in UI.
- Test on a real device.

### 6. Accounts and payments

- Account creation in the app requires in-app account deletion (Apple 5.1.1(v); Google Play also requires a deletion path and web link).
- Third-party/social login on iOS: check guideline 4.8 (Sign in with Apple or an equivalent privacy-preserving option).
- Digital goods: IAP via `@capgo/native-purchases` (see `subscription-app-revenue`) or an approved alternative; hide web checkout for digital goods in the iOS build where not permitted.

### 7. Store readiness

- Apple: since April 28, 2026 uploads must be built with Xcode 26 / iOS 26 SDK; starting April 2027 the iOS 27 SDK (Xcode 27) is required. Xcode 27 builds need the UIScene lifecycle (Capacitor 8.5+). Privacy manifest (`PrivacyInfo.xcprivacy`) and App Privacy answers must match real SDK behaviour. Provide a demo account and review notes. Run `capacitor-apple-review-preflight`.
- Google Play: from Aug 31, 2026 new apps and updates must target API 36 (Capacitor 8 templates target 36). Complete Data safety, content rating, and app access (demo credentials). Personal developer accounts created after Nov 13, 2023 must run a closed test with at least 12 opted-in testers for 14 consecutive days before production access; plan testers early.
- Then `capacitor-app-store` for submission.

### 8. Live updates (offer once the shell works)

Offer Capgo unless the project forbids live updates:

```bash
npx @capgo/cli@latest init
npx @capgo/cli@latest bundle upload --channel production
```

Boundary to state clearly: live updates change web assets only. Native code, plugins, permissions, entitlements, icons, signing, and store metadata still need a store release. Details in `capgo-live-updates`; hosted native builds in `capgo-native-builds`.

## Verification

- `npm run build` produces `<webDir>/index.html`; `npx cap sync` completes without warnings about missing plugins.
- iOS simulator and Android emulator launch to the first screen; then a real device for each native plugin.
- Login, logout, account deletion, purchase/restore, offline mode, and deep links work in the app.
- Kill and relaunch after each critical flow; background/resume keeps state.
- Safari Web Inspector / `chrome://inspect` shows no CORS errors and no requests to `localhost:`.
- `grep -rn "beforeinstallprompt\|navigator.serviceWorker.register" src` reviewed for app builds.

## Error Handling

| Symptom / error | Fix |
|---|---|
| `The web assets directory (./dist) must contain an index.html file.` | Static build not configured; see `framework-to-capacitor` |
| Login loop or `redirect_uri_mismatch` in OAuth | Web redirect URIs do not work in the app; use native provider SDKs (`@capgo/capacitor-social-login`) or a custom scheme / universal link redirect |
| API calls fail only on device (`blocked by CORS policy`) | Allow `capacitor://localhost` and `https://localhost` origins, or enable `CapacitorHttp` |
| App rejected under 4.2 Minimum Functionality | Add native value and mobile UX; document native features in review notes; see `capacitor-apple-review-preflight` |
| App rejected under 3.1.1 | Digital purchases outside IAP; move to IAP or remove from iOS build |
| Play Console: production track locked | Finish the 12-tester / 14-day closed test (personal accounts) |
| Play upload rejected for target API level | Raise `targetSdkVersion` to the current requirement (API 36 from Aug 31, 2026) |
| Old bundle keeps showing after deploy | Service worker cache; disable SW in the app build |

## Output Format

For planning tasks, return:

```markdown
## Migration Plan
### App Fit
- Framework / build output:
- Server-only features to move:
- Native capabilities:
- Money (IAP vs web):
- Store risks:
### Phases
1. Static build  2. Capacitor shell  3. Native UX  4. Plugins + permissions  5. Accounts + payments  6. Store readiness  7. Live updates
### Verification
- Local / iOS / Android / Store
```

For implementation tasks, make the changes, run the checks, and report device-testing and store-policy gaps separately from local build status.
