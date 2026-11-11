## What
- Tag to tag `src/definitions.ts` diff for 139 Cap-go `capacitor-*` repos with releases since 2026-09-11 (same major line for `fromTag`).
- Full API methods, events, and plugin config keys in `capgo-plugin-index.md` (no 12 method cap).
- Nine `capgo-*.md` deep references plus `capgo-live-updates` and `sqlite-to-fast-sql` updates.

## Why
Index regeneration alone did not document every new method, option, event, or platform change from releases in the window.

## How
- `node scripts/diff-capgo-plugin-apis.mjs` then `node scripts/generate-capgo-plugin-index.mjs`.
- `scripts/lib/parse-definitions.mjs` parses methods, listeners, and `PluginsConfig` keys.
- `bun run sync-skills` and `bun run lint-skills`.

## Testing
- `bun run lint-skills`

## Not Tested
- `bun run lint-skills-skillgrade` (needs provider keys in CI)

### Plugin skill updates (139 repos)

| Plugin | Versions reviewed (from to) | What was added or changed in the skill |
|---|---|---|
| capacitor-accelerometer | 8.0.40 to 8.0.55 | Full API and version block in `capgo-plugin-index.md`; No `definitions.ts` delta between reviewed tags |
| capacitor-admob | 8.1.14 to 8.2.7 | Full API and version block in `capgo-plugin-index.md`; methods: feedAdCreate, feedAdDestroy, feedAdIsLoaded, feedAdLoad, feedAdSetAutoRefresh, feedAdUpdateBounds, requestConsentInfo, showConsentForm, showPrivacyOptionsForm |
| capacitor-age-range | 8.1.14 to 8.2.3 | Full API and version block in `capgo-plugin-index.md`; No `definitions.ts` delta between reviewed tags |
| capacitor-alarm | 8.1.8 to 8.1.14 | Full API and version block in `capgo-plugin-index.md`; No `definitions.ts` delta between reviewed tags |
| capacitor-android-age-signals | 8.1.18 to 8.1.30 | Full API and version block in `capgo-plugin-index.md`; No `definitions.ts` delta between reviewed tags |
| capacitor-android-inline-install | 8.0.13 to 8.0.19 | Full API and version block in `capgo-plugin-index.md`; No `definitions.ts` delta between reviewed tags |
| capacitor-android-kiosk | 8.2.8 to 8.3.3 | Full API and version block in `capgo-plugin-index.md`; No `definitions.ts` delta between reviewed tags |
| capacitor-android-sms-retriever | 8.0.10 to 8.1.2 | Full API and version block in `capgo-plugin-index.md`; No `definitions.ts` delta between reviewed tags |
| capacitor-android-usagestatsmanager | 8.2.1 to 8.2.15 | Full API and version block in `capgo-plugin-index.md`; No `definitions.ts` delta between reviewed tags |
| capacitor-app-attest | 8.2.5 to 8.2.18 | Full API and version block in `capgo-plugin-index.md`; No `definitions.ts` delta between reviewed tags |
| capacitor-app-intents | 8.1.0 to 8.1.0 | Full API and version block in `capgo-plugin-index.md`; No `definitions.ts` delta between reviewed tags |
| capacitor-app-tracking-transparency | 8.1.15 to 8.1.21 | Full API and version block in `capgo-plugin-index.md`; No `definitions.ts` delta between reviewed tags |
| capacitor-appinsights | 8.0.41 to 8.0.62 | Full API and version block in `capgo-plugin-index.md`; No `definitions.ts` delta between reviewed tags |
| capacitor-appsflyer | 8.1.13 to 8.1.19 | Full API and version block in `capgo-plugin-index.md`; No `definitions.ts` delta between reviewed tags |
| capacitor-asset-cache | 8.1.2 to 8.1.8 | Full API and version block in `capgo-plugin-index.md`; No `definitions.ts` delta between reviewed tags |
| capacitor-audio-recorder | 8.2.7 to 8.3.6 | Full API and version block in `capgo-plugin-index.md`; methods: resetAudioSessionForPlayback; events: recordingInterruptionBegan, recordingInterruptionEnded; package files: android/src/main/,android/build.gradle,dist/,ios/Sources,ios/Tests,Package.swift,CapgoCapacitorAudioRecorder.podspec -> android/src/main/,android/build.gradle,android/consumer-rules.pro,dist/,ios/Sources,ios/Tests,Package.swift,CapgoCapacitorAudioRecorder.podspec |
| capacitor-audiosession | 8.0.49 to 8.1.8 | Full API and version block in `capgo-plugin-index.md`; No `definitions.ts` delta between reviewed tags |
| capacitor-auto | 8.1.8 to 8.1.14 | Full API and version block in `capgo-plugin-index.md`; No `definitions.ts` delta between reviewed tags |
| capacitor-autofill-save-password | 8.1.1 to 8.2.3 | Full API and version block in `capgo-plugin-index.md`; No `definitions.ts` delta between reviewed tags |
| capacitor-background-geolocation | 8.4.5 to 8.6.0 | Added or updated `capacitor-plugins/references/capgo-background-geolocation.md`; Full API and version block in `capgo-plugin-index.md`; methods: clearGeofenceQueue, clearLocationLog, getLocationLog; package files: android/src/main/,android/build.gradle,dist/,ios/Sources,ios/Tests,Package.swift,CapgoBackgroundGeolocation.podspec -> android/src/main/,android/src/sqliteEnabled/,android/gradle.properties,android/build.gradle,android/consumer-rules.pro,scripts/configure-dependencies.js,dist/,ios/Sources,ios/SqliteLocationLog,ios/Tests,Package.swift,CapgoBackgroundGeolocation.podspec |
| capacitor-background-task | 8.1.7 to 8.1.12 | Full API and version block in `capgo-plugin-index.md`; No `definitions.ts` delta between reviewed tags |
| capacitor-barometer | 8.0.18 to 8.0.23 | Full API and version block in `capgo-plugin-index.md`; No `definitions.ts` delta between reviewed tags |
| capacitor-bluetooth-low-energy | 8.2.0 to 8.2.7 | Full API and version block in `capgo-plugin-index.md`; changelog notes in index |
| capacitor-brightness | 8.0.19 to 8.0.24 | Full API and version block in `capgo-plugin-index.md`; No `definitions.ts` delta between reviewed tags |
| capacitor-calendar | 8.0.8 to 8.0.15 | Full API and version block in `capgo-plugin-index.md`; No `definitions.ts` delta between reviewed tags |
| capacitor-camera-preview | 8.11.2 to 8.15.1 | Full API and version block in `capgo-plugin-index.md`; events: cameraInterrupted, cameraInterruptionEnded; package files: CapgoCameraPreview.podspec,Package.swift,android/,dist/,ios/ -> CapgoCameraPreview.podspec,Package.swift,android/,dist/,ios/,scripts/configure-dependencies.cjs |
| capacitor-compass | 8.1.19 to 8.1.24 | Full API and version block in `capgo-plugin-index.md`; No `definitions.ts` delta between reviewed tags |
| capacitor-contacts | 8.1.2 to 8.1.10 | Full API and version block in `capgo-plugin-index.md`; No `definitions.ts` delta between reviewed tags |
| capacitor-contentsquare | 8.1.7 to 8.1.17 | Full API and version block in `capgo-plugin-index.md`; package files: android/src/main/,android/build.gradle,dist/,ios/Sources,ios/Tests,Package.swift,CapgoCapacitorContentsquare.podspec -> android/src/main/,android/build.gradle,android/consumer-rules.pro,dist/,ios/Sources,ios/Tests,Package.swift,CapgoCapacitorContentsquare.podspec |
| capacitor-crisp | 8.2.1 to 8.2.12 | Full API and version block in `capgo-plugin-index.md`; No `definitions.ts` delta between reviewed tags |
| capacitor-data-storage-sqlite | 8.0.45 to 8.0.61 | Full API and version block in `capgo-plugin-index.md`; package files: android/src/main/,android/build.gradle,dist/,ios/Sources,ios/Tests,Package.swift,electron/,CapgoCapacitorDataStorageSqlite.podspec -> android/src/main/,android/build.gradle,android/consumer-rules.pro,dist/,ios/Sources,ios/Tests,Package.swift,electron/,CapgoCapacitorDataStorageSqlite.podspec |
| capacitor-date-picker | 8.1.7 to 8.1.14 | Full API and version block in `capgo-plugin-index.md`; No `definitions.ts` delta between reviewed tags |
| capacitor-device-info | 8.0.10 to 8.0.16 | Full API and version block in `capgo-plugin-index.md`; No `definitions.ts` delta between reviewed tags |
| capacitor-device-integrity | 8.0.8 to 8.0.15 | Full API and version block in `capgo-plugin-index.md`; No `definitions.ts` delta between reviewed tags |
| capacitor-document-scanner | 8.4.3 to 8.4.17 | Full API and version block in `capgo-plugin-index.md`; package files: android/src/main/,android/build.gradle,dist/,ios/Sources,ios/Tests,Package.swift,CapgoCapacitorDocumentScanner.podspec -> android/src/main/,android/build.gradle,dist/,ios/Sources,ios/Tests,Package.swift,CapgoCapacitorDocumentScanner.podspec,scripts/configure-visionkit-swizzle.mjs |
| capacitor-downloader | 8.3.1 to 8.3.19 | Full API and version block in `capgo-plugin-index.md`; No `definitions.ts` delta between reviewed tags |
| capacitor-env | 8.1.35 to 8.1.52 | Full API and version block in `capgo-plugin-index.md`; No `definitions.ts` delta between reviewed tags |
| capacitor-facebook-analytics | 8.1.11 to 8.1.20 | Full API and version block in `capgo-plugin-index.md`; No `definitions.ts` delta between reviewed tags |
| capacitor-fast-sql | 8.2.2 to 8.3.1 | Updated dedicated skill `sqlite-to-fast-sql`; Full API and version block in `capgo-plugin-index.md`; package files: android/src/main/,android/build.gradle,dist/,ios/Sources,ios/Tests,Package.swift,CapgoCapacitorFastSql.podspec -> android/src/main/,android/build.gradle,android/consumer-rules.pro,dist/,ios/Sources,ios/Tests,Package.swift,CapgoCapacitorFastSql.podspec |
| capacitor-file | 8.0.16 to 8.0.24 | Full API and version block in `capgo-plugin-index.md`; changelog notes in index |
| capacitor-file-compressor | 8.1.4 to 8.1.19 | Full API and version block in `capgo-plugin-index.md`; No `definitions.ts` delta between reviewed tags |
| capacitor-file-picker | 8.1.11 to 8.2.7 | Full API and version block in `capgo-plugin-index.md`; changelog notes in index |
| capacitor-file-sharer | 8.1.9 to 8.1.16 | Full API and version block in `capgo-plugin-index.md`; No `definitions.ts` delta between reviewed tags |
| capacitor-firebase | analytics/v8.0.2 to firestore/v8.3.1 | Full API and version block in `capgo-plugin-index.md`; No `definitions.ts` delta between reviewed tags |
| capacitor-flash | 8.0.38 to 8.0.51 | Full API and version block in `capgo-plugin-index.md`; No `definitions.ts` delta between reviewed tags |
| capacitor-gtm | 8.0.37 to 8.0.48 | Full API and version block in `capgo-plugin-index.md`; No `definitions.ts` delta between reviewed tags |
| capacitor-health | 8.10.6 to 8.12.1 | Full API and version block in `capgo-plugin-index.md`; No `definitions.ts` delta between reviewed tags |
| capacitor-home-indicator | 8.0.42 to 8.1.4 | Full API and version block in `capgo-plugin-index.md`; No `definitions.ts` delta between reviewed tags |
| capacitor-ibeacon | 8.1.34 to 8.1.48 | Full API and version block in `capgo-plugin-index.md`; No `definitions.ts` delta between reviewed tags |
| capacitor-icloud-kv | 8.1.0 to 8.1.2 | Full API and version block in `capgo-plugin-index.md`; No `definitions.ts` delta between reviewed tags |
| capacitor-in-app-review | 8.2.3 to 8.2.9 | Full API and version block in `capgo-plugin-index.md`; No `definitions.ts` delta between reviewed tags |
| capacitor-inappbrowser | 8.16.6 to 8.27.6 | Added or updated `capacitor-plugins/references/capgo-inappbrowser.md`; Full API and version block in `capgo-plugin-index.md`; methods: getFullscreen, setFullscreen; events: fullscreenChange; package files: android/src/main/,android/build.gradle,dist/,ios/Sources/,Package.swift,CapgoCapacitorInappbrowser.podspec -> android/src/main/,android/build.gradle,android/consumer-rules.pro,dist/,ios/Sources/,Package.swift,CapgoCapacitorInappbrowser.podspec,scripts/configure-http-proxy-swizzle.mjs |
| capacitor-incoming-call-kit | 8.2.7 to 8.2.14 | Full API and version block in `capgo-plugin-index.md`; No `definitions.ts` delta between reviewed tags |
| capacitor-install-referrer | 8.1.9 to 8.1.15 | Full API and version block in `capgo-plugin-index.md`; No `definitions.ts` delta between reviewed tags |
| capacitor-intent-launcher | 8.3.29 to 8.3.41 | Full API and version block in `capgo-plugin-index.md`; No `definitions.ts` delta between reviewed tags |
| capacitor-intercom | 8.1.12 to 8.2.3 | Full API and version block in `capgo-plugin-index.md`; No `definitions.ts` delta between reviewed tags |
| capacitor-intune | 8.1.2 to 8.1.9 | Full API and version block in `capgo-plugin-index.md`; package files: android/src/main/,android/ms-intune-app-sdk-android/,android/build.gradle,dist/,ios/Sources,ios/Tests,Package.swift,CapgoCapacitorIntune.podspec -> android/src/main/,android/ms-intune-app-sdk-android/,android/intune-mam-sdk/,android/intune-downlevel-stubs/,android/build.gradle,android/settings.gradle,dist/,ios/Sources,ios/Tests,Package.swift,CapgoCapacitorIntune.podspec; changelog notes in index |
| capacitor-is-root | 8.1.17 to 8.2.6 | Full API and version block in `capgo-plugin-index.md`; package files: android/src/main/,android/build.gradle,dist/,ios/Sources,ios/Tests,Package.swift,CapgoCapacitorIsRoot.podspec -> android/src/main/,android/build.gradle,android/consumer-rules.pro,dist/,ios/Sources,ios/Tests,Package.swift,CapgoCapacitorIsRoot.podspec; description: Jailbreak/Root Detection Plugin for Capacitor. Detect Android root, iOS jailbreak, and emulator (when requested). |
| capacitor-ivs-player | 8.0.33 to 8.0.44 | Full API and version block in `capgo-plugin-index.md`; No `definitions.ts` delta between reviewed tags |
| capacitor-jw-player | 8.0.47 to 8.0.62 | Full API and version block in `capgo-plugin-index.md`; No `definitions.ts` delta between reviewed tags |
| capacitor-keep-awake | 8.1.15 to 8.1.20 | Full API and version block in `capgo-plugin-index.md`; changelog notes in index |
| capacitor-launch-navigator | 8.0.35 to 8.1.6 | Full API and version block in `capgo-plugin-index.md`; No `definitions.ts` delta between reviewed tags |
| capacitor-light-sensor | 8.1.17 to 8.1.23 | Full API and version block in `capgo-plugin-index.md`; No `definitions.ts` delta between reviewed tags |
| capacitor-live-activities | 1.1.4 to 1.3.0 | Added or updated `capacitor-plugins/references/capgo-live-activities.md`; Full API and version block in `capgo-plugin-index.md`; package files: android/src/main/,android/build.gradle,dist/,ios/Sources,ios/Tests,Package.swift,CapgoCapacitorLiveActivities.podspec -> android/src/main/,android/build.gradle,dist/,ios/Sources,ios/Tests,ios/WidgetExtension,Package.swift,CapgoCapacitorLiveActivities.podspec,CapgoLiveActivitiesShared.podspec; changelog notes in index |
| capacitor-live-reload | 8.0.6 to 8.0.12 | Full API and version block in `capgo-plugin-index.md`; No `definitions.ts` delta between reviewed tags |
| capacitor-llm | 8.1.4 to 8.2.0 | Full API and version block in `capgo-plugin-index.md`; package files: android/src/main/,android/build.gradle,dist/,ios/Sources,ios/Tests,Package.swift,CapgoCapacitorLlm.podspec -> android/src/main/,android/src/genaiAgentEnabled/,android/src/genaiAgentDisabled/,android/build.gradle,android/gradle.properties,scripts/configure-genai-agent.mjs,dist/,ios/Sources,ios/Tests,Package.swift,CapgoCapacitorLlm.podspec |
| capacitor-media-session | 8.0.30 to 8.1.8 | Full API and version block in `capgo-plugin-index.md`; No `definitions.ts` delta between reviewed tags |
| capacitor-mock-location-detector | 8.0.4 to 8.0.10 | Full API and version block in `capgo-plugin-index.md`; No `definitions.ts` delta between reviewed tags |
| capacitor-mqtt | 8.1.11 to 8.1.16 | Full API and version block in `capgo-plugin-index.md`; No `definitions.ts` delta between reviewed tags |
| capacitor-mute | 8.1.4 to 8.1.18 | Full API and version block in `capgo-plugin-index.md`; No `definitions.ts` delta between reviewed tags |
| capacitor-mux-player | 8.0.18 to 8.1.2 | Full API and version block in `capgo-plugin-index.md`; No `definitions.ts` delta between reviewed tags |
| capacitor-native-audio | 8.4.25 to 8.5.1 | Added or updated `capacitor-plugins/references/capgo-native-audio.md`; Full API and version block in `capgo-plugin-index.md`; methods: clearQueue, getAudioRoute, getPlaybackState, getQueueState, getRate, queueNext, queuePrevious, queueSelect, setEarpiece, setQueue, setSpeaker; events: audioRouteChange, progress, queueChange; package files: android/src/main/,android/build.gradle,dist/,ios/Sources,ios/Tests,Package.swift,CapgoCapacitorNativeAudio.podspec,scripts/configure-dependencies.js -> android/src/main/,android/build.gradle,android/consumer-rules.pro,dist/,ios/Sources,ios/Tests,Package.swift,CapgoCapacitorNativeAudio.podspec,scripts/configure-dependencies.js |
| capacitor-native-biometric | 8.6.7 to 8.9.2 | Full API and version block in `capgo-plugin-index.md`; package files: android/src/main/,android/build.gradle,dist/,ios/Sources,ios/Tests,Package.swift,CapgoCapacitorNativeBiometric.podspec -> android/src/main/,android/build.gradle,android/consumer-rules.pro,dist/,ios/Sources,ios/Tests,Package.swift,CapgoCapacitorNativeBiometric.podspec |
| capacitor-native-loader | 8.1.5 to 8.1.11 | Full API and version block in `capgo-plugin-index.md`; No `definitions.ts` delta between reviewed tags |
| capacitor-native-map | 8.1.0 to 8.1.2 | Full API and version block in `capgo-plugin-index.md`; package files: android/src/main/,android/build.gradle,dist/,ios/Sources,ios/Tests,Package.swift,CapgoCapacitorNativeMap.podspec,assets/readme-demo.webp,assets/readme-screenshot-ios.webp,assets/readme-screenshot-android.webp,assets/github-social-preview.png,assets/github-social-template.svg -> android/src/main/,android/build.gradle,dist/,ios/Sources,ios/Tests,Package.swift,CapgoCapacitorNativeMap.podspec,assets/readme-demo-ios.webp,assets/readme-demo-android.webp,assets/readme-screenshot-ios.webp,assets/readme-screenshot-android.webp,assets/github-social-preview.png,assets/github-social-template.svg |
| capacitor-native-market | 8.0.42 to 8.0.57 | Full API and version block in `capgo-plugin-index.md`; No `definitions.ts` delta between reviewed tags |
| capacitor-native-navigation | 8.3.1 to 8.16.1 | Full API and version block in `capgo-plugin-index.md`; methods: endPullToRefresh, reportNavbarScroll, setPullToRefresh; events: hingeChanged, navbarSearch, navbarSegmentSelect, pullToRefresh, verticalBarChanged |
| capacitor-native-purchases | 8.7.0 to 8.9.8 | Added or updated `capacitor-plugins/references/capgo-native-purchases.md`; Full API and version block in `capgo-plugin-index.md`; methods: configure, finishTransaction, getUnfinishedTransactions |
| capacitor-nativegeocoder | 8.0.45 to 8.0.61 | Full API and version block in `capgo-plugin-index.md`; No `definitions.ts` delta between reviewed tags |
| capacitor-navigation-bar | 8.2.7 to 8.2.20 | Full API and version block in `capgo-plugin-index.md`; No `definitions.ts` delta between reviewed tags |
| capacitor-neon | 8.1.0 to 8.1.0 | Full API and version block in `capgo-plugin-index.md`; No `definitions.ts` delta between reviewed tags |
| capacitor-network-diagnostics | 8.0.9 to 8.0.15 | Full API and version block in `capgo-plugin-index.md`; No `definitions.ts` delta between reviewed tags |
| capacitor-nfc | 8.2.6 to 8.3.7 | Full API and version block in `capgo-plugin-index.md`; methods: transceive |
| capacitor-passkey | 8.5.1 to 8.5.8 | Full API and version block in `capgo-plugin-index.md`; No `definitions.ts` delta between reviewed tags |
| capacitor-patch | v8.3.4 to v8.3.10 | Full API and version block in `capgo-plugin-index.md`; No `definitions.ts` delta between reviewed tags |
| capacitor-pay | 8.1.17 to 8.2.1 | Full API and version block in `capgo-plugin-index.md`; methods: updateApplePayShipping; events: applePayShippingContactSelected, applePayShippingMethodSelected |
| capacitor-pdf-generator | 8.0.36 to 8.0.50 | Full API and version block in `capgo-plugin-index.md`; No `definitions.ts` delta between reviewed tags |
| capacitor-pdf-viewer | 8.2.2 to 8.3.0 | Added or updated `capacitor-plugins/references/capgo-pdf-viewer.md`; Full API and version block in `capgo-plugin-index.md`; methods: getCurrentPage, getPageCount, hide, nextPage, previousPage, show, updateLayout; events: zoomChange |
| capacitor-pedometer | 8.0.39 to 8.0.54 | Full API and version block in `capgo-plugin-index.md`; No `definitions.ts` delta between reviewed tags |
| capacitor-permissions | 8.2.2 to 8.2.8 | Full API and version block in `capgo-plugin-index.md`; No `definitions.ts` delta between reviewed tags |
| capacitor-persistent-account | 8.0.37 to 8.0.51 | Full API and version block in `capgo-plugin-index.md`; No `definitions.ts` delta between reviewed tags |
| capacitor-persistent-uuid | 8.1.3 to 8.1.10 | Full API and version block in `capgo-plugin-index.md`; No `definitions.ts` delta between reviewed tags |
| capacitor-persona | 8.1.1 to 8.2.3 | Full API and version block in `capgo-plugin-index.md`; changelog notes in index |
| capacitor-photo-library | 8.0.23 to 8.0.32 | Full API and version block in `capgo-plugin-index.md`; No `definitions.ts` delta between reviewed tags |
| capacitor-plus | 8.5.2 to 8.6.4 | Full API and version block in `capgo-plugin-index.md`; No `definitions.ts` delta between reviewed tags |
| capacitor-pretty-toast | 8.1.16 to 8.1.28 | Full API and version block in `capgo-plugin-index.md`; No `definitions.ts` delta between reviewed tags |
| capacitor-printer | 8.1.3 to 8.1.9 | Full API and version block in `capgo-plugin-index.md`; package files: android/src/main/,android/build.gradle,dist/,ios/Sources,ios/Tests,Package.swift,CapgoCapacitorPrinter.podspec -> android/src/main/,android/build.gradle,android/consumer-rules.pro,dist/,ios/Sources,ios/Tests,Package.swift,CapgoCapacitorPrinter.podspec |
| capacitor-privacy-screen | 8.3.9 to 8.3.14 | Full API and version block in `capgo-plugin-index.md`; No `definitions.ts` delta between reviewed tags |
| capacitor-proximity | 8.1.10 to 8.1.16 | Full API and version block in `capgo-plugin-index.md`; No `definitions.ts` delta between reviewed tags |
| capacitor-realtimekit | 8.0.35 to 8.0.45 | Full API and version block in `capgo-plugin-index.md`; No `definitions.ts` delta between reviewed tags |
| capacitor-recaptcha | 8.1.11 to 8.1.18 | Full API and version block in `capgo-plugin-index.md`; No `definitions.ts` delta between reviewed tags |
| capacitor-rich-notifications | 8.2.2 to 8.2.7 | Full API and version block in `capgo-plugin-index.md`; No `definitions.ts` delta between reviewed tags |
| capacitor-ricoh360-camera-plugin | 8.0.20 to 8.1.3 | Full API and version block in `capgo-plugin-index.md`; No `definitions.ts` delta between reviewed tags |
| capacitor-rudderstack | 8.1.11 to 8.1.17 | Full API and version block in `capgo-plugin-index.md`; No `definitions.ts` delta between reviewed tags |
| capacitor-screen-orientation | 8.1.20 to 8.4.3 | Full API and version block in `capgo-plugin-index.md`; methods: getBarPlacement, getFoldState, getHingeAngle, getReservedRegions, getSizeClass, isDeviceFoldable, setVerticalBarBehavior; events: foldStateChange, hingeAngleChange, sizeClassChange |
| capacitor-screen-recorder | 8.3.8 to 8.4.7 | Full API and version block in `capgo-plugin-index.md`; events: onStopped |
| capacitor-shake | 8.0.40 to 8.0.55 | Full API and version block in `capgo-plugin-index.md`; No `definitions.ts` delta between reviewed tags |
| capacitor-share-target | 8.0.50 to 8.0.65 | Full API and version block in `capgo-plugin-index.md`; No `definitions.ts` delta between reviewed tags |
| capacitor-sheets | v8.0.17 to v8.2.7 | Full API and version block in `capgo-plugin-index.md`; changelog notes in index |
| capacitor-sim | 8.0.35 to 8.0.52 | Full API and version block in `capgo-plugin-index.md`; No `definitions.ts` delta between reviewed tags |
| capacitor-social-login | 8.5.7 to 8.7.7 | Added or updated `capacitor-plugins/references/capgo-social-login.md`; Full API and version block in `capgo-plugin-index.md`; methods: openAuthSession |
| capacitor-speech-recognition | 8.2.0 to 8.4.6 | Full API and version block in `capgo-plugin-index.md`; events: audioLevel |
| capacitor-speech-synthesis | 8.0.21 to 8.0.27 | Full API and version block in `capgo-plugin-index.md`; No `definitions.ts` delta between reviewed tags |
| capacitor-ssl-pinning | 8.1.9 to 8.1.15 | Full API and version block in `capgo-plugin-index.md`; No `definitions.ts` delta between reviewed tags |
| capacitor-streamcall | 8.0.59 to 8.0.80 | Full API and version block in `capgo-plugin-index.md`; No `definitions.ts` delta between reviewed tags |
| capacitor-stripe-identity | 8.0.4 to 8.0.9 | Full API and version block in `capgo-plugin-index.md`; No `definitions.ts` delta between reviewed tags |
| capacitor-stripe-pay | 8.0.4 to 8.0.11 | Full API and version block in `capgo-plugin-index.md`; No `definitions.ts` delta between reviewed tags |
| capacitor-stripe-terminal | 8.0.3 to 8.0.9 | Full API and version block in `capgo-plugin-index.md`; No `definitions.ts` delta between reviewed tags |
| capacitor-supabase | 8.2.1 to 8.2.8 | Full API and version block in `capgo-plugin-index.md`; package files: android/src/main/,android/build.gradle,dist/,ios/Sources,ios/Tests,Package.swift,CapgoCapacitorSupabase.podspec -> android/src/main/,android/build.gradle,android/consumer-rules.pro,dist/,ios/Sources,ios/Tests,Package.swift,CapgoCapacitorSupabase.podspec |
| capacitor-textinteraction | 8.0.35 to 8.1.8 | Full API and version block in `capgo-plugin-index.md`; methods: isEnabled |
| capacitor-transitions | v8.1.9 to v8.3.9 | Full API and version block in `capgo-plugin-index.md`; changelog notes in index |
| capacitor-twilio-voice | 8.2.12 to 8.2.30 | Full API and version block in `capgo-plugin-index.md`; package files: android/src/main/,android/build.gradle,dist/,ios/Sources,ios/Tests,Package.swift,CapgoCapacitorTwilioVoice.podspec -> android/src/main/,android/build.gradle,android/consumer-rules.pro,dist/,ios/Sources,ios/Tests,Package.swift,CapgoCapacitorTwilioVoice.podspec; changelog notes in index |
| capacitor-updater | 8.51.15 to 8.54.2 | Updated dedicated skill `capgo-live-updates`; Full API and version block in `capgo-plugin-index.md`; events: updaterEvent; config: allowHttpsToHttpRedirect, builtinMinimum, httpsOnly, nativeUpdatePrompt, nativeUpdatePromptCooldownHours, nativeUpdatePromptCountry, nativeUpdatePromptLaterButton, nativeUpdatePromptMessage, nativeUpdatePromptOnStoreCheck, nativeUpdatePromptTitle, nativeUpdatePromptUpdateButton; package files: android/src/main/,android/proguard-rules.pro,android/build.gradle,dist/,ios/Sources/,CapgoCapacitorUpdater.podspec,Package.swift -> android/src/main/,android/proguard-rules.pro,android/build.gradle,dist/,ios/Sources/,CapgoCapacitorUpdater.podspec,Package.swift,scripts/builtin-hashes-lib.mjs,scripts/capacitor-builtin-hashes-hook.mjs,scripts/resolve-real-path.mjs |
| capacitor-uploader | 8.3.13 to 8.3.27 | Full API and version block in `capgo-plugin-index.md`; No `definitions.ts` delta between reviewed tags |
| capacitor-uwb | 8.0.4 to 8.0.9 | Full API and version block in `capgo-plugin-index.md`; No `definitions.ts` delta between reviewed tags |
| capacitor-verisoul | 8.0.10 to 8.0.17 | Full API and version block in `capgo-plugin-index.md`; No `definitions.ts` delta between reviewed tags |
| capacitor-video-player | 8.2.8 to 8.3.0 | Full API and version block in `capgo-plugin-index.md`; No `definitions.ts` delta between reviewed tags |
| capacitor-video-thumbnails | 8.1.19 to 8.1.25 | Full API and version block in `capgo-plugin-index.md`; No `definitions.ts` delta between reviewed tags |
| capacitor-volume-buttons | 8.1.1 to 8.1.6 | Full API and version block in `capgo-plugin-index.md`; No `definitions.ts` delta between reviewed tags |
| capacitor-watch | 8.1.3 to 8.1.20 | Added or updated `capacitor-plugins/references/capgo-watch.md`; Full API and version block in `capgo-plugin-index.md`; No `definitions.ts` delta between reviewed tags |
| capacitor-webview-crash | 8.1.9 to 8.1.13 | Full API and version block in `capgo-plugin-index.md`; No `definitions.ts` delta between reviewed tags |
| capacitor-webview-guardian | 8.0.23 to 8.1.4 | Full API and version block in `capgo-plugin-index.md`; No `definitions.ts` delta between reviewed tags |
| capacitor-webview-version-checker | 8.2.11 to 8.2.19 | Full API and version block in `capgo-plugin-index.md`; No `definitions.ts` delta between reviewed tags |
| capacitor-wechat | 8.0.42 to 8.0.56 | Full API and version block in `capgo-plugin-index.md`; No `definitions.ts` delta between reviewed tags |
| capacitor-widget-kit | 8.1.9 to 8.2.0 | Full API and version block in `capgo-plugin-index.md`; changelog notes in index |
| capacitor-wifi | 8.5.2 to 8.5.10 | Full API and version block in `capgo-plugin-index.md`; package files: android/src/main/,android/build.gradle,dist/,ios/Sources,ios/Tests,Package.swift,CapgoCapacitorWifi.podspec -> android/src/main/,android/build.gradle,android/consumer-rules.pro,dist/,ios/Sources,ios/Tests,Package.swift,CapgoCapacitorWifi.podspec |
| capacitor-youtube-player | 8.2.17 to 8.3.16 | Full API and version block in `capgo-plugin-index.md`; methods: createPlayer, setPlayerFrame; package files: android/src/main/,android/build.gradle,dist/,ios/Sources,ios/Tests,scripts/,Package.swift,CapgoCapacitorYoutubePlayer.podspec -> android/src/main/,android/build.gradle,android/consumer-rules.pro,dist/,ios/Sources,ios/Tests,scripts/,Package.swift,CapgoCapacitorYoutubePlayer.podspec |
| capacitor-zebra-datawedge | 8.1.9 to 8.2.5 | Added or updated `capacitor-plugins/references/capgo-zebra-datawedge.md`; Full API and version block in `capgo-plugin-index.md`; methods: configureDiagnostics, getDiagnostics, registerScanIntentAction |
| capacitor-zip | 8.1.18 to 8.2.3 | Full API and version block in `capgo-plugin-index.md`; events: progress; package files: android/src/main/,android/build.gradle,dist/,ios/Sources,ios/Tests,Package.swift,CapgoCapacitorZip.podspec -> android/src/main/,android/build.gradle,android/consumer-rules.pro,dist/,ios/Sources,ios/Tests,Package.swift,CapgoCapacitorZip.podspec |
