# Capgo Plugin Index

Agent-facing index of every public Capgo Capacitor plugin package in the Cap-go GitHub organization (non-archived `capacitor-*` repositories and `cordova-updater`). The set should match the public [capgo.app/plugins](https://capgo.app/plugins/) catalog; regenerate after org changes.

Facts come from each repository `package.json` and `src/definitions.ts`. API method names are taken from TypeScript definitions only.

Total packages: 150 (generated 2026-11-11)

## Plugins

## Background Geolocation

- **Package**: `@capgo/background-geolocation`
- **Purpose**: Accurate background geolocation and native geofencing for Capacitor apps on iOS and Android.
- **Install**:

```bash
npm install @capgo/background-geolocation
npx cap sync
```

- **Platforms**: iOS, Android, Web
- **Key API methods**: `checkPermissions()`, `requestPermissions()`, `getPluginVersion()`, `addGeofence()`, `clearGeofenceQueue()`, `clearLocationLog()`, `getLocationLog()`, `getMonitoredGeofences()`, `openSettings()`, `removeAllGeofences()`, `removeGeofence()`, `setPlannedRoute()`
- **Docs**: https://capgo.app/docs/plugins/background-geolocation/
- **Repository**: https://github.com/Cap-go/capacitor-background-geolocation

## Camera Preview

- **Package**: `@capgo/camera-preview`
- **Purpose**: Camera preview
- **Install**:

```bash
npm install @capgo/camera-preview
npx cap sync
```

- **Platforms**: iOS, Android
- **Key API methods**: `checkPermissions()`, `requestPermissions()`, `getPluginVersion()`, `capture()`, `captureSample()`, `deleteFile()`, `flip()`, `getAspectRatio()`, `getAvailableDevices()`, `getDeviceId()`, `getExposureCompensation()`, `getExposureCompensationRange()`
- **Docs**: https://capgo.app/docs/plugins/camera-preview/
- **Repository**: https://github.com/Cap-go/capacitor-camera-preview

## Accelerometer

- **Package**: `@capgo/capacitor-accelerometer`
- **Purpose**: Read device accelerometer measurements with Capacitor
- **Install**:

```bash
npm install @capgo/capacitor-accelerometer
npx cap sync
```

- **Platforms**: iOS, Android, Web
- **Key API methods**: `checkPermissions()`, `requestPermissions()`, `getPluginVersion()`, `getMeasurement()`, `isAvailable()`, `startMeasurementUpdates()`, `stopMeasurementUpdates()`
- **Docs**: https://capgo.app/docs/plugins/accelerometer/
- **Repository**: https://github.com/Cap-go/capacitor-accelerometer

## Admob

- **Package**: `@capgo/capacitor-admob`
- **Purpose**: Capacitor plugin to bridge AdMob SDKs for iOS and Android
- **Install**:

```bash
npm install @capgo/capacitor-admob
npx cap sync
```

- **Platforms**: iOS, Android, Web
- **Key API methods**: `getPluginVersion()`, `adHide()`, `adIsLoaded()`, `adLoad()`, `adShow()`, `configRequest()`, `configure()`, `feedAdCreate()`, `feedAdDestroy()`, `feedAdIsLoaded()`, `feedAdLoad()`, `feedAdSetAutoRefresh()`
- **Docs**: https://capgo.app/docs/plugins/admob/
- **Repository**: https://github.com/Cap-go/capacitor-admob

## Age Range

- **Package**: `@capgo/capacitor-age-range`
- **Purpose**: Cross-platform age range detection. Google Play Age Signals on Android, Apple DeclaredAgeRange on iOS.
- **Install**:

```bash
npm install @capgo/capacitor-age-range
npx cap sync
```

- **Platforms**: iOS, Android, Web
- **Key API methods**: `getPluginVersion()`, `requestAgeRange()`
- **Docs**: https://capgo.app/docs/plugins/age-range/
- **Repository**: https://github.com/Cap-go/capacitor-age-range

## Alarm

- **Package**: `@capgo/capacitor-alarm`
- **Purpose**: Manage native alarm Capacitor plugin
- **Install**:

```bash
npm install @capgo/capacitor-alarm
npx cap sync
```

- **Platforms**: iOS, Android
- **Key API methods**: `checkPermissions()`, `requestPermissions()`, `getPluginVersion()`, `cancelAlarm()`, `createAlarm()`, `getAlarms()`, `getOSInfo()`, `openAlarms()`
- **Docs**: https://capgo.app/docs/plugins/alarm/
- **Repository**: https://github.com/Cap-go/capacitor-alarm

## Android Age Signals

- **Package**: `@capgo/capacitor-android-age-signals`
- **Purpose**: Capacitor plugin that exposes Google Play Age Signals to your app.
- **Install**:

```bash
npm install @capgo/capacitor-android-age-signals
npx cap sync
```

- **Platforms**: iOS, Android, Web
- **Key API methods**: `getPluginVersion()`, `checkAgeSignals()`
- **Docs**: https://capgo.app/docs/plugins/age-signals/
- **Repository**: https://github.com/Cap-go/capacitor-android-age-signals

## Android Inline Install

- **Package**: `@capgo/capacitor-android-inline-install`
- **Purpose**: Capacitor plugin to trigger Android inline install feature.
- **Install**:

```bash
npm install @capgo/capacitor-android-inline-install
npx cap sync
```

- **Platforms**: iOS, Android, Web
- **Key API methods**: `getPluginVersion()`, `startInlineInstall()`
- **Docs**: https://capgo.app/docs/plugins/android-inline-install/
- **Repository**: https://github.com/Cap-go/capacitor-android-inline-install

## Android Kiosk

- **Package**: `@capgo/capacitor-android-kiosk`
- **Purpose**: Android Kiosk Mode plugin for Capacitor - Lock device into kiosk mode with launcher functionality
- **Install**:

```bash
npm install @capgo/capacitor-android-kiosk
npx cap sync
```

- **Platforms**: iOS, Android, Web
- **Key API methods**: `getPluginVersion()`, `enterKioskMode()`, `exitKioskMode()`, `isInKioskMode()`, `isSetAsLauncher()`, `setAllowedKeys()`, `setAsLauncher()`
- **Docs**: https://capgo.app/docs/plugins/android-kiosk/
- **Repository**: https://github.com/Cap-go/capacitor-android-kiosk

## Android Sms Retriever

- **Package**: `@capgo/capacitor-android-sms-retriever`
- **Purpose**: Capacitor plugin for Android SMS Retriever and Phone Number Hint APIs.
- **Install**:

```bash
npm install @capgo/capacitor-android-sms-retriever
npx cap sync
```

- **Platforms**: iOS, Android
- **Key API methods**: `getPluginVersion()`, `getHashString()`, `getPhoneNumber()`, `startWatch()`, `stopWatch()`
- **Docs**: https://capgo.app/docs/plugins/android-sms-retriever/
- **Repository**: https://github.com/Cap-go/capacitor-android-sms-retriever

## Android Usagestatsmanager

- **Package**: `@capgo/capacitor-android-usagestatsmanager`
- **Purpose**: Exposes the Android's UsageStatsManager SDK to Capacitor
- **Install**:

```bash
npm install @capgo/capacitor-android-usagestatsmanager
npx cap sync
```

- **Platforms**: iOS, Android, Web
- **Key API methods**: `getPluginVersion()`, `isUsageStatsPermissionGranted()`, `openUsageStatsSettings()`, `queryAllPackages()`, `queryAndAggregateUsageStats()`, `queryEvents()`, `queryUsageStats()`
- **Docs**: https://capgo.app/docs/plugins/android-usagestatsmanager/
- **Repository**: https://github.com/Cap-go/capacitor-android-usagestatsmanager

## App Attest

- **Package**: `@capgo/capacitor-app-attest`
- **Purpose**: App Attest on iOS, Play Integrity on Android, and optional device fraud signals for Capacitor
- **Install**:

```bash
npm install @capgo/capacitor-app-attest
npx cap sync
```

- **Platforms**: iOS, Android
- **Key API methods**: `attestKey()`, `clearStoredKeyId()`, `createAssertion()`, `createAttestation()`, `generateAssertion()`, `generateKey()`, `getCapabilities()`, `getDeviceCheckToken()`, `getStoredKeyId()`, `getWidevineFingerprint()`, `isSupported()`, `prepare()`
- **Docs**: https://capgo.app/docs/plugins/app-attest/
- **Repository**: https://github.com/Cap-go/capacitor-app-attest

## App Intents

- **Package**: `@capgo/capacitor-app-intents`
- **Purpose**: Siri, Shortcuts, Spotlight, Home Screen quick actions, and Apple App Intents for Capacitor apps with a JavaScript dispatch bridge.
- **Install**:

```bash
npm install @capgo/capacitor-app-intents
npx cap sync
```

- **Platforms**: iOS, Android, Web
- **Key API methods**: `getPluginVersion()`, `getPendingInvocations()`, `indexSpotlightEntities()`, `performAppleSchemaTemplate()`, `removePendingInvocation()`, `removeSpotlightEntities()`, `setEntityCatalog()`, `setHomeScreenShortcutItems()`
- **Docs**: https://capgo.app/docs/plugins/app-intents/
- **Repository**: https://github.com/Cap-go/capacitor-app-intents

## App Tracking Transparency

- **Package**: `@capgo/capacitor-app-tracking-transparency`
- **Purpose**: Capacitor plugin for iOS App Tracking Transparency framework. Request user authorization to access app-related data for tracking.
- **Install**:

```bash
npm install @capgo/capacitor-app-tracking-transparency
npx cap sync
```

- **Platforms**: iOS, Android, Web
- **Key API methods**: `getPluginVersion()`, `getStatus()`, `requestPermission()`
- **Docs**: https://capgo.app/docs/plugins/app-tracking-transparency/
- **Repository**: https://github.com/Cap-go/capacitor-app-tracking-transparency

## Appinsights

- **Package**: `@capgo/capacitor-appinsights`
- **Purpose**: A wrapper around the https://github.com/apptopia/appinsights SDK
- **Install**:

```bash
npm install @capgo/capacitor-appinsights
npx cap sync
```

- **Platforms**: iOS, Android, Web
- **Key API methods**: `getPluginVersion()`, `getState()`, `init()`, `setUserId()`
- **Docs**: https://capgo.app/docs/plugins/appinsights/
- **Repository**: https://github.com/Cap-go/capacitor-appinsights

## Appsflyer

- **Package**: `@capgo/capacitor-appsflyer`
- **Purpose**: Capacitor plugin for AppsFlyer attribution, analytics, and deep links.
- **Install**:

```bash
npm install @capgo/capacitor-appsflyer
npx cap sync
```

- **Platforms**: iOS, Android
- **Key API methods**: `addPushNotificationDeepLinkPath()`, `anonymizeUser()`, `appendParametersToDeepLinkingURL()`, `disableAdvertisingIdentifier()`, `disableAppSetId()`, `disableCollectASA()`, `disableSKAdNetwork()`, `enableFacebookDeferredApplinks()`, `enableTCFDataCollection()`, `generateInviteLink()`, `getAppsFlyerUID()`, `getSdkVersion()`
- **Docs**: https://capgo.app/docs/plugins/appsflyer/
- **Repository**: https://github.com/Cap-go/capacitor-appsflyer

## Asset Cache

- **Package**: `@capgo/capacitor-asset-cache`
- **Purpose**: Capacitor plugin for transparent local caching of large images and videos.
- **Install**:

```bash
npm install @capgo/capacitor-asset-cache
npx cap sync
```

- **Platforms**: iOS, Android, Web
- **Key API methods**: `getPluginVersion()`, `bind()`, `cancel()`, `clear()`, `configure()`, `getCacheSize()`, `list()`, `remove()`, `src()`
- **Docs**: https://capgo.app/docs/plugins/asset-cache/
- **Repository**: https://github.com/Cap-go/capacitor-asset-cache

## Audio Recorder

- **Package**: `@capgo/capacitor-audio-recorder`
- **Purpose**: Record audio on iOS, Android, and Web with Capacitor
- **Install**:

```bash
npm install @capgo/capacitor-audio-recorder
npx cap sync
```

- **Platforms**: iOS, Android
- **Key API methods**: `checkPermissions()`, `requestPermissions()`, `getPluginVersion()`, `cancelRecording()`, `getCurrentAmplitude()`, `getRecordingStatus()`, `pauseRecording()`, `resetAudioSessionForPlayback()`, `resumeRecording()`, `startRecording()`, `stopRecording()`
- **Docs**: https://capgo.app/docs/plugins/audio-recorder/
- **Repository**: https://github.com/Cap-go/capacitor-audio-recorder

## Audio Session

- **Package**: `@capgo/capacitor-audio-session`
- **Purpose**: This capacitor plugin allows iOS applications to get notified audio about interrupts & route changes (for example when a headset is connected), and also query and override the audio device in use.
- **Install**:

```bash
npm install @capgo/capacitor-audio-session
npx cap sync
```

- **Platforms**: iOS, Android, Web
- **Key API methods**: `getPluginVersion()`, `currentOutputs()`, `overrideOutput()`
- **Docs**: https://capgo.app/docs/plugins/audiosession/
- **Repository**: https://github.com/Cap-go/capacitor-audiosession

## Auto

- **Package**: `@capgo/capacitor-auto`
- **Purpose**: Capacitor plugin for CarPlay and Android Auto communication.
- **Install**:

```bash
npm install @capgo/capacitor-auto
npx cap sync
```

- **Platforms**: iOS, Android, Web
- **Key API methods**: `getPluginVersion()`, `getState()`, `getTransientState()`, `isAvailable()`, `removeState()`, `sendMessage()`, `setRootTemplate()`, `setState()`, `setTransientState()`
- **Docs**: https://capgo.app/docs/plugins/auto/
- **Repository**: https://github.com/Cap-go/capacitor-auto

## Autofill Save Password

- **Package**: `@capgo/capacitor-autofill-save-password`
- **Purpose**: Prompt to display dialog for saving password to keychain from webview app
- **Install**:

```bash
npm install @capgo/capacitor-autofill-save-password
npx cap sync
```

- **Platforms**: iOS, Android, Web
- **Key API methods**: `getPluginVersion()`, `promptDialog()`, `readPassword()`
- **Docs**: https://capgo.app/docs/plugins/autofill-save-password/
- **Repository**: https://github.com/Cap-go/capacitor-autofill-save-password

## Background Task

- **Package**: `@capgo/capacitor-background-task`
- **Purpose**: Capacitor plugin for periodic background fetch tasks on iOS and Android.
- **Install**:

```bash
npm install @capgo/capacitor-background-task
npx cap sync
```

- **Platforms**: iOS, Android, Web
- **Key API methods**: `addExpirationListener()`, `cancel()`, `define()`, `defineTask()`, `finish()`, `getPendingTaskRuns()`, `getPendingTaskRunsAsync()`, `getRegisteredTasks()`, `getRegisteredTasksAsync()`, `getStatus()`, `getStatusAsync()`, `isTaskRegistered()`
- **Docs**: https://capgo.app/docs/plugins/background-task/
- **Repository**: https://github.com/Cap-go/capacitor-background-task

## Barometer

- **Package**: `@capgo/capacitor-barometer`
- **Purpose**: Access device barometer readings with Capacitor
- **Install**:

```bash
npm install @capgo/capacitor-barometer
npx cap sync
```

- **Platforms**: iOS, Android
- **Key API methods**: `checkPermissions()`, `requestPermissions()`, `getPluginVersion()`, `getMeasurement()`, `isAvailable()`, `startMeasurementUpdates()`, `stopMeasurementUpdates()`
- **Docs**: https://capgo.app/docs/plugins/barometer/
- **Repository**: https://github.com/Cap-go/capacitor-barometer

## Bluetooth Low Energy

- **Package**: `@capgo/capacitor-bluetooth-low-energy`
- **Purpose**: Bluetooth Low Energy (BLE) plugin for Capacitor with support for scanning, connecting, reading, writing, and notifications.
- **Install**:

```bash
npm install @capgo/capacitor-bluetooth-low-energy
npx cap sync
```

- **Platforms**: iOS, Android, Web
- **Key API methods**: `connect()`, `disconnect()`, `checkPermissions()`, `requestPermissions()`, `getPluginVersion()`, `addGattService()`, `createBond()`, `discoverServices()`, `getConnectedDevices()`, `getServices()`, `initialize()`, `isBonded()`
- **Docs**: https://capgo.app/docs/plugins/bluetooth-low-energy/
- **Repository**: https://github.com/Cap-go/capacitor-bluetooth-low-energy

## Brightness

- **Package**: `@capgo/capacitor-brightness`
- **Purpose**: Control screen brightness on iOS and Android
- **Install**:

```bash
npm install @capgo/capacitor-brightness
npx cap sync
```

- **Platforms**: iOS, Android
- **Key API methods**: `checkPermissions()`, `requestPermissions()`, `getPluginVersion()`, `getBrightness()`, `getSystemBrightness()`, `getSystemBrightnessMode()`, `isAvailable()`, `isUsingSystemBrightness()`, `restoreSystemBrightness()`, `setBrightness()`, `setSystemBrightness()`, `setSystemBrightnessMode()`
- **Docs**: https://capgo.app/docs/plugins/brightness/
- **Repository**: https://github.com/Cap-go/capacitor-brightness

## Calendar

- **Package**: `@capgo/capacitor-calendar`
- **Purpose**: Capacitor plugin for managing calendar events on iOS and Android, with reminders support on iOS.
- **Install**:

```bash
npm install @capgo/capacitor-calendar
npx cap sync
```

- **Platforms**: iOS, Android, Web
- **Key API methods**: `checkAllPermissions()`, `checkPermission()`, `commit()`, `createCalendar()`, `createEvent()`, `createEventWithPrompt()`, `createReminder()`, `deleteCalendar()`, `deleteEvent()`, `deleteEventsById()`, `deleteEventWithPrompt()`, `deleteReminder()`
- **Docs**: https://capgo.app/docs/plugins/calendar/
- **Repository**: https://github.com/Cap-go/capacitor-calendar

## Compass

- **Package**: `@capgo/capacitor-compass`
- **Purpose**: Native compass heading plugin for Capacitor
- **Install**:

```bash
npm install @capgo/capacitor-compass
npx cap sync
```

- **Platforms**: iOS, Android
- **Key API methods**: `checkPermissions()`, `requestPermissions()`, `getPluginVersion()`, `getAccuracy()`, `getCurrentHeading()`, `startListening()`, `stopListening()`, `unwatchAccuracy()`, `watchAccuracy()`
- **Docs**: https://capgo.app/docs/plugins/compass/
- **Repository**: https://github.com/Cap-go/capacitor-compass

## Contacts

- **Package**: `@capgo/capacitor-contacts`
- **Purpose**: Work with device contacts using Capacitor APIs
- **Install**:

```bash
npm install @capgo/capacitor-contacts
npx cap sync
```

- **Platforms**: iOS, Android
- **Key API methods**: `checkPermissions()`, `requestPermissions()`, `getPluginVersion()`, `countContacts()`, `createContact()`, `createGroup()`, `deleteContactById()`, `deleteGroupById()`, `displayContactById()`, `displayCreateContact()`, `displayUpdateContactById()`, `getAccounts()`
- **Docs**: https://capgo.app/docs/plugins/contacts/
- **Repository**: https://github.com/Cap-go/capacitor-contacts

## Contentsquare

- **Package**: `@capgo/capacitor-contentsquare`
- **Purpose**: Capacitor plugin for the Contentsquare mobile analytics SDK on Capacitor 8.
- **Install**:

```bash
npm install @capgo/capacitor-contentsquare
npx cap sync
```

- **Platforms**: iOS, Android, Web
- **Key API methods**: `collect()`, `excludeURLForReplay()`, `onReady()`, `optIn()`, `optOut()`, `sendDynamicVar()`, `sendDynamicVarWithIntValue()`, `sendDynamicVarWithStringValue()`, `sendScreenName()`, `sendTransaction()`, `setCapturedElementsSelector()`, `setPIISelectors()`
- **Docs**: https://capgo.app/docs/plugins/contentsquare/
- **Repository**: https://github.com/Cap-go/capacitor-contentsquare

## Crisp

- **Package**: `@capgo/capacitor-crisp`
- **Purpose**: Crisp native SDK for capacitor
- **Install**:

```bash
npm install @capgo/capacitor-crisp
npx cap sync
```

- **Platforms**: iOS, Android
- **Key API methods**: `getPluginVersion()`, `configure()`, `enableNotifications()`, `handlePushNotification()`, `isCrispPushNotification()`, `openChatboxFromNotification()`, `openMessenger()`, `pushEvent()`, `registerPushToken()`, `reset()`, `sendMessage()`, `setCompany()`
- **Docs**: https://capgo.app/docs/plugins/crisp/
- **Repository**: https://github.com/Cap-go/capacitor-crisp

## Data Storage Sqlite

- **Package**: `@capgo/capacitor-data-storage-sqlite`
- **Purpose**: SQLite Storage of key/value strings pair
- **Install**:

```bash
npm install @capgo/capacitor-data-storage-sqlite
npx cap sync
```

- **Platforms**: iOS, Android, Web
- **Key API methods**: `getPluginVersion()`, `clear()`, `closeStore()`, `deleteStore()`, `deleteTable()`, `exportToJson()`, `filtervalues()`, `get()`, `importFromJson()`, `isJsonValid()`, `iskey()`, `isStoreExists()`
- **Docs**: https://capgo.app/docs/plugins/data-storage-sqlite/
- **Repository**: https://github.com/Cap-go/capacitor-data-storage-sqlite

## Date Picker

- **Package**: `@capgo/capacitor-date-picker`
- **Purpose**: Native Capacitor date picker for iOS, Android, and web with fixes for long-standing community issues.
- **Install**:

```bash
npm install @capgo/capacitor-date-picker
npx cap sync
```

- **Platforms**: iOS, Android, Web
- **Key API methods**: `getPluginVersion()`, `hide()`, `present()`, `presentRange()`
- **Docs**: https://capgo.app/docs/plugins/date-picker/
- **Repository**: https://github.com/Cap-go/capacitor-date-picker

## Device Info

- **Package**: `@capgo/capacitor-device-info`
- **Purpose**: Capacitor plugin for reading CPU, memory, GPU, storage, and onboard sensor metrics.
- **Install**:

```bash
npm install @capgo/capacitor-device-info
npx cap sync
```

- **Platforms**: iOS, Android, Web
- **Key API methods**: `getPluginVersion()`, `getInfo()`, `isMonitoring()`, `startMonitoring()`, `stopMonitoring()`
- **Docs**: https://capgo.app/docs/plugins/device-info/
- **Repository**: https://github.com/Cap-go/capacitor-device-info

## Device Integrity

- **Package**: `@capgo/capacitor-device-integrity`
- **Purpose**: Device integrity and fraud signals for Capacitor using Android Widevine, Play Integrity, iOS App Attest, and DeviceCheck.
- **Install**:

```bash
npm install @capgo/capacitor-device-integrity
npx cap sync
```

- **Platforms**: iOS, Android, Web
- **Key API methods**: `createAssertion()`, `createAttestation()`, `getCapabilities()`, `getDeviceCheckToken()`, `getWidevineFingerprint()`, `prepareAttestation()`
- **Docs**: https://capgo.app/docs/plugins/device-integrity/
- **Repository**: https://github.com/Cap-go/capacitor-device-integrity

## Document Scanner

- **Package**: `@capgo/capacitor-document-scanner`
- **Purpose**: Capacitor plugin to scan document iOS and Android
- **Install**:

```bash
npm install @capgo/capacitor-document-scanner
npx cap sync
```

- **Platforms**: iOS, Android, Web
- **Key API methods**: `getPluginVersion()`, `scanDocument()`
- **Docs**: https://capgo.app/docs/plugins/document-scanner/
- **Repository**: https://github.com/Cap-go/capacitor-document-scanner

## Downloader

- **Package**: `@capgo/capacitor-downloader`
- **Purpose**: Download file in background or foreground
- **Install**:

```bash
npm install @capgo/capacitor-downloader
npx cap sync
```

- **Platforms**: iOS, Android, Web
- **Key API methods**: `download()`, `getPluginVersion()`, `checkStatus()`, `getFileInfo()`, `pause()`, `resume()`, `stop()`
- **Docs**: https://capgo.app/docs/plugins/downloader/
- **Repository**: https://github.com/Cap-go/capacitor-downloader

## Env

- **Package**: `@capgo/capacitor-env`
- **Purpose**: Set Env var in Capacitor config and read them at runtime
- **Install**:

```bash
npm install @capgo/capacitor-env
npx cap sync
```

- **Platforms**: iOS, Android, Web
- **Key API methods**: `getPluginVersion()`, `getKey()`
- **Docs**: https://capgo.app/docs/plugins/env/
- **Repository**: https://github.com/Cap-go/capacitor-env

## Facebook Analytics

- **Package**: `@capgo/capacitor-facebook-analytics`
- **Purpose**: Capacitor plugin for Meta/Facebook App Events analytics.
- **Install**:

```bash
npm install @capgo/capacitor-facebook-analytics
npx cap sync
```

- **Platforms**: iOS, Android
- **Key API methods**: `getPluginVersion()`, `disableAdvertiserTracking()`, `enableAdvertiserTracking()`, `getAdvertiserTrackingStatus()`, `initAppEvents()`, `logEvent()`, `logPurchase()`
- **Docs**: https://capgo.app/docs/plugins/facebook-analytics/
- **Repository**: https://github.com/Cap-go/capacitor-facebook-analytics

## Fast Sql

- **Package**: `@capgo/capacitor-fast-sql`
- **Purpose**: High-performance native SQLite plugin with custom protocol for efficient sync operations and IndexedDB replacement
- **Install**:

```bash
npm install @capgo/capacitor-fast-sql
npx cap sync
```

- **Platforms**: iOS, Android, Web
- **Key API methods**: `connect()`, `disconnect()`, `getPluginVersion()`, `beginTransaction()`, `commitTransaction()`, `configureWeb()`, `execute()`, `getServerInfo()`, `rollbackTransaction()`
- **Docs**: https://capgo.app/docs/plugins/fast-sql/
- **Repository**: https://github.com/Cap-go/capacitor-fast-sql

## Ffmpeg

- **Package**: `@capgo/capacitor-ffmpeg`
- **Purpose**: Exposes the FFmpeg API to Capacitor
- **Install**:

```bash
npm install @capgo/capacitor-ffmpeg
npx cap sync
```

- **Platforms**: iOS, Android
- **Key API methods**: `getPluginVersion()`, `convertImage()`, `getCapabilities()`, `reencodeVideo()`
- **Docs**: https://capgo.app/docs/plugins/ffmpeg/
- **Repository**: https://github.com/Cap-go/capacitor-ffmpeg

## File

- **Package**: `@capgo/capacitor-file`
- **Purpose**: Capacitor plugin for file system operations, compatible with Cordova File plugin API
- **Install**:

```bash
npm install @capgo/capacitor-file
npx cap sync
```

- **Platforms**: iOS, Android, Web
- **Key API methods**: `checkPermissions()`, `requestPermissions()`, `getPluginVersion()`, `appendFile()`, `copy()`, `deleteFile()`, `exists()`, `getDirectories()`, `getDirectory()`, `getFile()`, `getFreeDiskSpace()`, `getMetadata()`
- **Docs**: https://capgo.app/docs/plugins/file/
- **Repository**: https://github.com/Cap-go/capacitor-file

## File Compressor

- **Package**: `@capgo/capacitor-file-compressor`
- **Purpose**: Capacitor plugin for efficient image compression supporting PNG, JPEG, and WebP formats across iOS, Android, and Web platforms
- **Install**:

```bash
npm install @capgo/capacitor-file-compressor
npx cap sync
```

- **Platforms**: iOS, Android, Web
- **Key API methods**: `getPluginVersion()`, `compressImage()`
- **Docs**: https://capgo.app/docs/plugins/file-compressor/
- **Repository**: https://github.com/Cap-go/capacitor-file-compressor

## File Picker

- **Package**: `@capgo/capacitor-file-picker`
- **Purpose**: File picker Capacitor plugin - Pick files, images, videos, and directories
- **Install**:

```bash
npm install @capgo/capacitor-file-picker
npx cap sync
```

- **Platforms**: iOS, Android
- **Key API methods**: `checkPermissions()`, `requestPermissions()`, `getPluginVersion()`, `convertHeicToJpeg()`, `copyFile()`, `pickDirectory()`, `pickFiles()`, `pickImages()`, `pickMedia()`, `pickVideos()`
- **Docs**: https://capgo.app/docs/plugins/file-picker/
- **Repository**: https://github.com/Cap-go/capacitor-file-picker

## File Sharer

- **Package**: `@capgo/capacitor-file-sharer`
- **Purpose**: Capacitor plugin for sharing and saving files on Android, iOS, and Web.
- **Install**:

```bash
npm install @capgo/capacitor-file-sharer
npx cap sync
```

- **Platforms**: iOS, Android, Web
- **Key API methods**: `getPluginVersion()`, `save()`, `share()`
- **Docs**: https://capgo.app/docs/plugins/file-sharer/
- **Repository**: https://github.com/Cap-go/capacitor-file-sharer

## Firebase Analytics

- **Package**: `@capgo/capacitor-firebase-analytics`
- **Purpose**: Capacitor plugin for Firebase Analytics.
- **Install**:

```bash
npm install @capgo/capacitor-firebase-analytics
npx cap sync
```

- **Platforms**: iOS, Android
- **Key API methods**: `getPluginVersion()`, `getAppInstanceId()`, `getSessionId()`, `initiateOnDeviceConversionMeasurementWithEmailAddress()`, `initiateOnDeviceConversionMeasurementWithHashedEmailAddress()`, `initiateOnDeviceConversionMeasurementWithHashedPhoneNumber()`, `initiateOnDeviceConversionMeasurementWithPhoneNumber()`, `isEnabled()`, `logEvent()`, `logTransaction()`, `resetAnalyticsData()`, `setConsent()`
- **Docs**: https://capgo.app/docs/plugins/firebase-analytics/
- **Repository**: https://github.com/Cap-go/capacitor-firebase (package path: `packages/analytics`, branch `main`)

## Firebase App

- **Package**: `@capgo/capacitor-firebase-app`
- **Purpose**: Capacitor plugin for Firebase App.
- **Install**:

```bash
npm install @capgo/capacitor-firebase-app
npx cap sync
```

- **Platforms**: iOS, Android, Web
- **Key API methods**: `getPluginVersion()`, `getName()`, `getOptions()`
- **Docs**: https://capgo.app/docs/plugins/firebase-app/
- **Repository**: https://github.com/Cap-go/capacitor-firebase (package path: `packages/app`, branch `main`)

## Firebase App Check

- **Package**: `@capgo/capacitor-firebase-app-check`
- **Purpose**: Capacitor plugin for Firebase App Check.
- **Install**:

```bash
npm install @capgo/capacitor-firebase-app-check
npx cap sync
```

- **Platforms**: iOS, Android, Web
- **Key API methods**: `getPluginVersion()`, `getToken()`, `initialize()`, `setTokenAutoRefreshEnabled()`
- **Docs**: https://capgo.app/docs/plugins/firebase-app-check/
- **Repository**: https://github.com/Cap-go/capacitor-firebase (package path: `packages/appcheck`, branch `main`)

## Firebase Authentication

- **Package**: `@capgo/capacitor-firebase-authentication`
- **Purpose**: Capacitor plugin for Firebase Authentication.
- **Install**:

```bash
npm install @capgo/capacitor-firebase-authentication
npx cap sync
```

- **Platforms**: iOS, Android
- **Key API methods**: `getPluginVersion()`, `applyActionCode()`, `checkAppTrackingTransparencyPermission()`, `confirmPasswordReset()`, `confirmVerificationCode()`, `createUserWithEmailAndPassword()`, `deleteUser()`, `fetchSignInMethodsForEmail()`, `getCurrentUser()`, `getIdToken()`, `getIdTokenResult()`, `getPendingAuthResult()`
- **Docs**: https://capgo.app/docs/plugins/firebase-authentication/
- **Repository**: https://github.com/Cap-go/capacitor-firebase (package path: `packages/authentication`, branch `main`)

## Firebase Crashlytics

- **Package**: `@capgo/capacitor-firebase-crashlytics`
- **Purpose**: Capacitor plugin for Firebase Crashlytics.
- **Install**:

```bash
npm install @capgo/capacitor-firebase-crashlytics
npx cap sync
```

- **Platforms**: iOS, Android
- **Key API methods**: `getPluginVersion()`, `crash()`, `deleteUnsentReports()`, `didCrashOnPreviousExecution()`, `isEnabled()`, `log()`, `recordException()`, `sendUnsentReports()`, `setCustomKey()`, `setEnabled()`, `setUserId()`
- **Docs**: https://capgo.app/docs/plugins/firebase-crashlytics/
- **Repository**: https://github.com/Cap-go/capacitor-firebase (package path: `packages/crashlytics`, branch `main`)

## Firebase Firestore

- **Package**: `@capgo/capacitor-firebase-firestore`
- **Purpose**: Capacitor plugin for Firebase Cloud Firestore.
- **Install**:

```bash
npm install @capgo/capacitor-firebase-firestore
npx cap sync
```

- **Platforms**: iOS, Android, Web
- **Key API methods**: `addDocument()`, `clearPersistence()`, `deleteDocument()`, `disableNetwork()`, `disablePersistence()`, `enableNetwork()`, `enablePersistence()`, `getCountFromServer()`, `removeSnapshotListener()`, `setDocument()`, `updateDocument()`, `useEmulator()`
- **Docs**: https://capgo.app/docs/plugins/firebase-firestore/
- **Repository**: https://github.com/Cap-go/capacitor-firebase (package path: `packages/firestore`, branch `main`)

## Firebase Functions

- **Package**: `@capgo/capacitor-firebase-functions`
- **Purpose**: Capacitor plugin for Firebase Cloud Functions.
- **Install**:

```bash
npm install @capgo/capacitor-firebase-functions
npx cap sync
```

- **Platforms**: iOS, Android, Web
- **Key API methods**: `getPluginVersion()`, `useEmulator()`
- **Docs**: https://capgo.app/docs/plugins/firebase-functions/
- **Repository**: https://github.com/Cap-go/capacitor-firebase (package path: `packages/functions`, branch `main`)

## Firebase Messaging

- **Package**: `@capgo/capacitor-firebase-messaging`
- **Purpose**: Capacitor plugin for Firebase Cloud Messaging (FCM).
- **Install**:

```bash
npm install @capgo/capacitor-firebase-messaging
npx cap sync
```

- **Platforms**: iOS, Android, Web
- **Key API methods**: `checkPermissions()`, `requestPermissions()`, `getPluginVersion()`, `createChannel()`, `deleteChannel()`, `deleteToken()`, `getDeliveredNotifications()`, `getToken()`, `isSupported()`, `listChannels()`, `removeAllDeliveredNotifications()`, `removeDeliveredNotifications()`
- **Docs**: https://capgo.app/docs/plugins/firebase-messaging/
- **Repository**: https://github.com/Cap-go/capacitor-firebase (package path: `packages/messaging`, branch `main`)

## Firebase Performance

- **Package**: `@capgo/capacitor-firebase-performance`
- **Purpose**: Capacitor plugin for Firebase Performance Monitoring.
- **Install**:

```bash
npm install @capgo/capacitor-firebase-performance
npx cap sync
```

- **Platforms**: iOS, Android, Web
- **Key API methods**: `getPluginVersion()`, `getAttribute()`, `getAttributes()`, `getMetric()`, `incrementMetric()`, `isEnabled()`, `putAttribute()`, `putMetric()`, `record()`, `removeAttribute()`, `setEnabled()`, `startTrace()`
- **Docs**: https://capgo.app/docs/plugins/firebase-performance/
- **Repository**: https://github.com/Cap-go/capacitor-firebase (package path: `packages/performance`, branch `main`)

## Firebase Remote Config

- **Package**: `@capgo/capacitor-firebase-remote-config`
- **Purpose**: Capacitor plugin for Firebase Remote Config.
- **Install**:

```bash
npm install @capgo/capacitor-firebase-remote-config
npx cap sync
```

- **Platforms**: iOS, Android, Web
- **Key API methods**: `getPluginVersion()`, `activate()`, `addConfigUpdateListener()`, `fetchAndActivate()`, `fetchConfig()`, `getAll()`, `getBoolean()`, `getInfo()`, `getNumber()`, `getString()`, `removeConfigUpdateListener()`, `setDefaults()`
- **Docs**: https://capgo.app/docs/plugins/firebase-remote-config/
- **Repository**: https://github.com/Cap-go/capacitor-firebase (package path: `packages/remote-config`, branch `main`)

## Firebase Storage

- **Package**: `@capgo/capacitor-firebase-storage`
- **Purpose**: Capacitor plugin for Firebase Cloud Storage.
- **Install**:

```bash
npm install @capgo/capacitor-firebase-storage
npx cap sync
```

- **Platforms**: iOS, Android, Web
- **Key API methods**: `getPluginVersion()`, `deleteFile()`, `downloadFile()`, `getDownloadUrl()`, `getMetadata()`, `listFiles()`, `updateMetadata()`, `uploadFile()`, `useEmulator()`
- **Docs**: https://capgo.app/docs/plugins/firebase-storage/
- **Repository**: https://github.com/Cap-go/capacitor-firebase (package path: `packages/storage`, branch `main`)

## Flash

- **Package**: `@capgo/capacitor-flash`
- **Purpose**: Switch the Flashlight / Torch of your device.
- **Install**:

```bash
npm install @capgo/capacitor-flash
npx cap sync
```

- **Platforms**: iOS, Android, Web
- **Key API methods**: `getPluginVersion()`, `isAvailable()`, `isSwitchedOn()`, `switchOff()`, `switchOn()`, `toggle()`
- **Docs**: https://capgo.app/docs/plugins/flash/
- **Repository**: https://github.com/Cap-go/capacitor-flash

## Gtm

- **Package**: `@capgo/capacitor-gtm`
- **Purpose**: Google Tag manager plugin for Capacitor
- **Install**:

```bash
npm install @capgo/capacitor-gtm
npx cap sync
```

- **Platforms**: iOS, Android, Web
- **Key API methods**: `getPluginVersion()`, `getValue()`, `initialize()`, `push()`, `reset()`, `setUserProperty()`
- **Docs**: https://capgo.app/docs/plugins/gtm/
- **Repository**: https://github.com/Cap-go/capacitor-gtm

## Health

- **Package**: `@capgo/capacitor-health`
- **Purpose**: Capacitor plugin to interact with data from Apple HealthKit and Health Connect
- **Install**:

```bash
npm install @capgo/capacitor-health
npx cap sync
```

- **Platforms**: iOS, Android
- **Key API methods**: `getPluginVersion()`, `checkAuthorization()`, `isAvailable()`, `openHealthConnectSettings()`, `queryAggregated()`, `queryWorkouts()`, `readSamples()`, `requestAuthorization()`, `saveSample()`, `showPrivacyPolicy()`
- **Docs**: https://capgo.app/docs/plugins/health/
- **Repository**: https://github.com/Cap-go/capacitor-health

## Home Indicator

- **Package**: `@capgo/capacitor-home-indicator`
- **Purpose**: hide and show home button indicator in Capacitor app
- **Install**:

```bash
npm install @capgo/capacitor-home-indicator
npx cap sync
```

- **Platforms**: iOS, Android
- **Key API methods**: `getPluginVersion()`, `hide()`, `isHidden()`, `show()`
- **Docs**: https://capgo.app/docs/plugins/home-indicator/
- **Repository**: https://github.com/Cap-go/capacitor-home-indicator

## Ibeacon

- **Package**: `@capgo/capacitor-ibeacon`
- **Purpose**: iBeacon plugin for Capacitor - proximity detection and beacon region monitoring
- **Install**:

```bash
npm install @capgo/capacitor-ibeacon
npx cap sync
```

- **Platforms**: iOS, Android, Web
- **Key API methods**: `getPluginVersion()`, `enableARMAFilter()`, `enableBackgroundMode()`, `getAuthorizationStatus()`, `isBluetoothEnabled()`, `isRangingAvailable()`, `requestAlwaysAuthorization()`, `requestWhenInUseAuthorization()`, `setBackgroundScanPeriod()`, `startAdvertising()`, `startMonitoringForRegion()`, `startRangingBeaconsInRegion()`
- **Docs**: https://capgo.app/docs/plugins/ibeacon/
- **Repository**: https://github.com/Cap-go/capacitor-ibeacon

## Icloud Kv

- **Package**: `@capgo/capacitor-icloud-kv`
- **Purpose**: Capacitor plugin to keep small app state in iCloud key-value storage on iOS and Android Backup on Android, so it survives a new phone.
- **Install**:

```bash
npm install @capgo/capacitor-icloud-kv
npx cap sync
```

- **Platforms**: iOS, Android, Web
- **Key API methods**: `getPluginVersion()`, `get()`, `getAll()`, `isAvailable()`, `remove()`, `set()`, `synchronize()`
- **Docs**: https://capgo.app/docs/plugins/icloud-kv/
- **Repository**: https://github.com/Cap-go/capacitor-icloud-kv

## In App Review

- **Package**: `@capgo/capacitor-in-app-review`
- **Purpose**: Prompt users to submit app store ratings and reviews without leaving your app
- **Install**:

```bash
npm install @capgo/capacitor-in-app-review
npx cap sync
```

- **Platforms**: iOS, Android, Web
- **Key API methods**: `getPluginVersion()`, `requestReview()`
- **Docs**: https://capgo.app/docs/plugins/in-app-review/
- **Repository**: https://github.com/Cap-go/capacitor-in-app-review

## Inappbrowser

- **Package**: `@capgo/capacitor-inappbrowser`
- **Purpose**: Capacitor plugin in app browser
- **Install**:

```bash
npm install @capgo/capacitor-inappbrowser
npx cap sync
```

- **Platforms**: iOS, Android
- **Key API methods**: `getPluginVersion()`, `bringToFront()`, `clearAllBrowsingData()`, `clearAllCookies()`, `clearCache()`, `clearCookies()`, `close()`, `dispatchInputEvent()`, `executeScript()`, `getCookies()`, `getFullscreen()`, `goBack()`
- **Docs**: https://capgo.app/docs/plugins/inappbrowser/
- **Repository**: https://github.com/Cap-go/capacitor-inappbrowser

## Incoming Call Kit

- **Package**: `@capgo/capacitor-incoming-call-kit`
- **Purpose**: Capacitor plugin for native incoming call UI with Android full-screen notifications and iOS CallKit.
- **Install**:

```bash
npm install @capgo/capacitor-incoming-call-kit
npx cap sync
```

- **Platforms**: iOS, Android, Web
- **Key API methods**: `checkPermissions()`, `requestPermissions()`, `getPluginVersion()`, `endAllCalls()`, `endCall()`, `getActiveCalls()`, `requestFullScreenIntentPermission()`, `showIncomingCall()`
- **Docs**: https://capgo.app/docs/plugins/incoming-call-kit/
- **Repository**: https://github.com/Cap-go/capacitor-incoming-call-kit

## Install Referrer

- **Package**: `@capgo/capacitor-install-referrer`
- **Purpose**: Capacitor plugin for reading Google Play install referrer and Apple AdServices attribution.
- **Install**:

```bash
npm install @capgo/capacitor-install-referrer
npx cap sync
```

- **Platforms**: iOS, Android, Web
- **Key API methods**: `getPluginVersion()`, `getReferrer()`, `GetReferrer()`
- **Docs**: https://capgo.app/docs/plugins/install-referrer/
- **Repository**: https://github.com/Cap-go/capacitor-install-referrer

## Intent Launcher

- **Package**: `@capgo/capacitor-intent-launcher`
- **Purpose**: Capacitor plugin to launch Android intents and open system settings screens on Android and iOS.
- **Install**:

```bash
npm install @capgo/capacitor-intent-launcher
npx cap sync
```

- **Platforms**: iOS, Android
- **Key API methods**: `getPluginVersion()`, `getApplicationIconAsync()`, `openApplication()`, `openIOSSettings()`, `startActivityAsync()`
- **Docs**: https://capgo.app/docs/plugins/intent-launcher/
- **Repository**: https://github.com/Cap-go/capacitor-intent-launcher

## Intercom

- **Package**: `@capgo/capacitor-intercom`
- **Purpose**: Intercom Capacitor plugin
- **Install**:

```bash
npm install @capgo/capacitor-intercom
npx cap sync
```

- **Platforms**: iOS, Android
- **Key API methods**: `displayArticle()`, `displayCarousel()`, `displayHelpCenter()`, `displayInAppMessages()`, `displayLauncher()`, `displayMessageComposer()`, `displayMessenger()`, `displaySurvey()`, `getUnreadConversationCount()`, `hideInAppMessages()`, `hideLauncher()`, `hideMessenger()`
- **Docs**: https://capgo.app/docs/plugins/intercom/
- **Repository**: https://github.com/Cap-go/capacitor-intercom

## Intune

- **Package**: `@capgo/capacitor-intune`
- **Purpose**: Capacitor plugin for Microsoft Intune MAM enrollment, app protection policies, app config, and MSAL authentication.
- **Install**:

```bash
npm install @capgo/capacitor-intune
npx cap sync
```

- **Platforms**: iOS, Android
- **Key API methods**: `acquireToken()`, `acquireTokenSilent()`, `appConfig()`, `deRegisterAndUnenrollAccount()`, `displayDiagnosticConsole()`, `enrolledAccount()`, `getPolicy()`, `groupName()`, `loginAndEnrollAccount()`, `logoutOfAccount()`, `registerAndEnrollAccount()`, `sdkVersion()`
- **Docs**: https://capgo.app/docs/plugins/intune/
- **Repository**: https://github.com/Cap-go/capacitor-intune

## Is Root

- **Package**: `@capgo/capacitor-is-root`
- **Purpose**: Jailbreak/Root Detection Plugin for Capacitor. Detect Android root, iOS jailbreak, and emulator (when requested).
- **Install**:

```bash
npm install @capgo/capacitor-is-root
npx cap sync
```

- **Platforms**: iOS, Android, Web
- **Key API methods**: `getPluginVersion()`, `checkDirPermissions()`, `checkExecutingCommands()`, `checkForBusyBoxBinary()`, `checkForDangerousProps()`, `checkforOverTheAirCertificates()`, `checkForRootNative()`, `checkForRWPaths()`, `checkForSuBinary()`, `checkGeneric()`, `checkGenymotion()`, `checkGoogleSDK()`
- **Docs**: https://capgo.app/docs/plugins/is-root/
- **Repository**: https://github.com/Cap-go/capacitor-is-root

## Ivs Player

- **Package**: `@capgo/capacitor-ivs-player`
- **Purpose**: Ivs player for capacitor app
- **Install**:

```bash
npm install @capgo/capacitor-ivs-player
npx cap sync
```

- **Platforms**: iOS, Android, Web
- **Key API methods**: `getPluginVersion()`, `cast()`, `create()`, `delete()`, `getAutoQuality()`, `getBackgroundState()`, `getCastStatus()`, `getFrame()`, `getMute()`, `getPip()`, `getPlayerPosition()`, `getQualities()`
- **Docs**: https://capgo.app/docs/plugins/ivs-player/
- **Repository**: https://github.com/Cap-go/capacitor-ivs-player

## Jw Player

- **Package**: `@capgo/capacitor-jw-player`
- **Purpose**: Playes videos from jwplayer.com
- **Install**:

```bash
npm install @capgo/capacitor-jw-player
npx cap sync
```

- **Platforms**: iOS, Android, Web
- **Key API methods**: `getPluginVersion()`, `currentPlaylist()`, `getAudioTracks()`, `getCaptions()`, `getCurrentAudioTrack()`, `getCurrentCaptions()`, `getPosition()`, `getState()`, `initialize()`, `loadPlaylist()`, `loadPlaylistWithItems()`, `pause()`
- **Docs**: https://capgo.app/docs/plugins/jw-player/
- **Repository**: https://github.com/Cap-go/capacitor-jw-player

## Keep Awake

- **Package**: `@capgo/capacitor-keep-awake`
- **Purpose**: Prevent the device screen from dimming or sleeping.
- **Install**:

```bash
npm install @capgo/capacitor-keep-awake
npx cap sync
```

- **Platforms**: iOS, Android, Web
- **Key API methods**: `getPluginVersion()`, `allowSleep()`, `isKeptAwake()`, `isSupported()`, `keepAwake()`
- **Docs**: https://capgo.app/docs/plugins/keep-awake/
- **Repository**: https://github.com/Cap-go/capacitor-keep-awake

## Launch Navigator

- **Package**: `@capgo/capacitor-launch-navigator`
- **Purpose**: Capacitor plugin which launches native route navigation apps for Android, iOS
- **Install**:

```bash
npm install @capgo/capacitor-launch-navigator
npx cap sync
```

- **Platforms**: iOS, Android, Web
- **Key API methods**: `getPluginVersion()`, `clearIconCache()`, `getAppIcons()`, `getAvailableApps()`, `getDefaultApp()`, `getSupportedApps()`, `isAppAvailable()`, `navigate()`, `refreshAppIcons()`
- **Docs**: https://capgo.app/docs/plugins/launch-navigator/
- **Repository**: https://github.com/Cap-go/capacitor-launch-navigator

## Light Sensor

- **Package**: `@capgo/capacitor-light-sensor`
- **Purpose**: Capacitor plugin for accessing the device light sensor (Android only)
- **Install**:

```bash
npm install @capgo/capacitor-light-sensor
npx cap sync
```

- **Platforms**: Android
- **Key API methods**: `checkPermissions()`, `requestPermissions()`, `getPluginVersion()`, `isAvailable()`, `start()`, `stop()`
- **Docs**: https://capgo.app/docs/plugins/light-sensor/
- **Repository**: https://github.com/Cap-go/capacitor-light-sensor

## Live Activities

- **Package**: `@capgo/capacitor-live-activities`
- **Purpose**: Manage iOS Live Activities from Capacitor
- **Install**:

```bash
npm install @capgo/capacitor-live-activities
npx cap sync
```

- **Platforms**: iOS, Android
- **Key API methods**: `getPluginVersion()`, `areActivitiesSupported()`, `cleanupImages()`, `endActivity()`, `getAllActivities()`, `getTimerState()`, `listImages()`, `pauseTimerSequence()`, `previousTimerStep()`, `removeImage()`, `resumeTimerSequence()`, `saveImage()`
- **Docs**: https://capgo.app/docs/plugins/live-activities/
- **Repository**: https://github.com/Cap-go/capacitor-live-activities

## Live Reload

- **Package**: `@capgo/capacitor-live-reload`
- **Purpose**: Capacitor plugin to live reload Capacitor apps from a remote Vite dev server.
- **Install**:

```bash
npm install @capgo/capacitor-live-reload
npx cap sync
```

- **Platforms**: iOS, Android, Web
- **Key API methods**: `connect()`, `disconnect()`, `getPluginVersion()`, `configureServer()`, `getStatus()`, `reload()`, `reloadFile()`
- **Docs**: https://capgo.app/docs/plugins/live-reload/
- **Repository**: https://github.com/Cap-go/capacitor-live-reload

## Llm

- **Package**: `@capgo/capacitor-llm`
- **Purpose**: Adds support for LLM locally runned for Capacitor
- **Install**:

```bash
npm install @capgo/capacitor-llm
npx cap sync
```

- **Platforms**: iOS, Android, Web
- **Key API methods**: `getPluginVersion()`, `createChat()`, `downloadModel()`, `getReadiness()`, `sendMessage()`, `setModel()`
- **Docs**: https://capgo.app/docs/plugins/llm/
- **Repository**: https://github.com/Cap-go/capacitor-llm

## Media Session

- **Package**: `@capgo/capacitor-media-session`
- **Purpose**: Capacitor plugin to expose media session controls of the device
- **Install**:

```bash
npm install @capgo/capacitor-media-session
npx cap sync
```

- **Platforms**: iOS, Android
- **Key API methods**: `getPluginVersion()`, `setActionHandler()`, `setMetadata()`, `setPlaybackState()`, `setPositionState()`
- **Docs**: https://capgo.app/docs/plugins/media-session/
- **Repository**: https://github.com/Cap-go/capacitor-media-session

## Mock Location Detector

- **Package**: `@capgo/capacitor-mock-location-detector`
- **Purpose**: Capacitor plugin for detecting simulated GPS locations and developer tooling that enables spoofing apps.
- **Install**:

```bash
npm install @capgo/capacitor-mock-location-detector
npx cap sync
```

- **Platforms**: iOS, Android
- **Key API methods**: `getPluginVersion()`, `analyze()`, `getCapabilities()`, `openDeveloperSettings()`, `runCheck()`, `startMonitoring()`, `stopMonitoring()`
- **Docs**: https://capgo.app/docs/plugins/mock-location-detector/
- **Repository**: https://github.com/Cap-go/capacitor-mock-location-detector

## Mqtt

- **Package**: `@capgo/capacitor-mqtt`
- **Purpose**: Capacitor plugin for MQTT connectivity on Android and iOS
- **Install**:

```bash
npm install @capgo/capacitor-mqtt
npx cap sync
```

- **Platforms**: iOS, Android, Web
- **Key API methods**: `connect()`, `disconnect()`, `publish()`, `subscribe()`
- **Docs**: https://capgo.app/docs/plugins/capacitor-mqtt/
- **Repository**: https://github.com/Cap-go/capacitor-mqtt

## Mute

- **Package**: `@capgo/capacitor-mute`
- **Purpose**: Detect if the mute switch is enabled/disabled on a device
- **Install**:

```bash
npm install @capgo/capacitor-mute
npx cap sync
```

- **Platforms**: iOS, Android, Web
- **Key API methods**: `getPluginVersion()`, `isMuted()`
- **Docs**: https://capgo.app/docs/plugins/mute/
- **Repository**: https://github.com/Cap-go/capacitor-mute

## Mux Player

- **Package**: `@capgo/capacitor-mux-player`
- **Purpose**: Native Mux Player SDK to play video on IOS and Android
- **Install**:

```bash
npm install @capgo/capacitor-mux-player
npx cap sync
```

- **Platforms**: iOS, Android, Web
- **Key API methods**: `getPluginVersion()`, `dismiss()`, `isActive()`, `play()`
- **Docs**: https://capgo.app/docs/plugins/mux-player/
- **Repository**: https://github.com/Cap-go/capacitor-mux-player

## Native Audio

- **Package**: `@capgo/capacitor-native-audio`
- **Purpose**: A native plugin for native audio engine
- **Install**:

```bash
npm install @capgo/capacitor-native-audio
npx cap sync
```

- **Platforms**: iOS, Android, Web
- **Key API methods**: `getPluginVersion()`, `clearCache()`, `clearQueue()`, `configure()`, `deinitPlugin()`, `getAudioRoute()`, `getCurrentTime()`, `getDuration()`, `getPlaybackState()`, `getQueueState()`, `getRate()`, `isPlaying()`
- **Docs**: https://capgo.app/docs/plugins/native-audio/
- **Repository**: https://github.com/Cap-go/capacitor-native-audio

## Native Biometric

- **Package**: `@capgo/capacitor-native-biometric`
- **Purpose**: This plugin gives access to the native biometric apis for android and iOS
- **Install**:

```bash
npm install @capgo/capacitor-native-biometric
npx cap sync
```

- **Platforms**: iOS, Android, Web
- **Key API methods**: `getPluginVersion()`, `deleteCredentials()`, `deleteData()`, `getCredentials()`, `getData()`, `getSecureCredentials()`, `getSecureData()`, `isAvailable()`, `isCredentialsSaved()`, `isDataSaved()`, `setCredentials()`, `setData()`
- **Docs**: https://capgo.app/docs/plugins/native-biometric/
- **Repository**: https://github.com/Cap-go/capacitor-native-biometric

## Native Loader

- **Package**: `@capgo/capacitor-native-loader`
- **Purpose**: Capacitor plugin for native animated loaders, fullscreen overlays, Lottie assets, and WebView resizing.
- **Install**:

```bash
npm install @capgo/capacitor-native-loader
npx cap sync
```

- **Platforms**: iOS, Android, Web
- **Key API methods**: `getPluginVersion()`, `configure()`, `getState()`, `hide()`, `hideAll()`, `resetWebViewLayout()`, `setProgress()`, `setWebViewLayout()`, `show()`, `update()`
- **Docs**: https://capgo.app/docs/plugins/native-loader/
- **Repository**: https://github.com/Cap-go/capacitor-native-loader

## Native Map

- **Package**: `@capgo/capacitor-native-map`
- **Purpose**: Native maps for Capacitor: Google Maps on Android, Apple MapKit on iOS, Google Maps JS on web
- **Install**:

```bash
npm install @capgo/capacitor-native-map
npx cap sync
```

- **Platforms**: iOS, Android, Web
- **Key API methods**: `constructor()`
- **Docs**: https://capgo.app/docs/plugins/native-map/
- **Repository**: https://github.com/Cap-go/capacitor-native-map

## Native Market

- **Package**: `@capgo/capacitor-native-market`
- **Purpose**: A native market plugin for linking to google play or app store.
- **Install**:

```bash
npm install @capgo/capacitor-native-market
npx cap sync
```

- **Platforms**: iOS, Android, Web
- **Key API methods**: `getPluginVersion()`, `openCollection()`, `openDevPage()`, `openEditorChoicePage()`, `openStoreListing()`, `search()`
- **Docs**: https://capgo.app/docs/plugins/native-market/
- **Repository**: https://github.com/Cap-go/capacitor-native-market

## Native Navigation

- **Package**: `@capgo/capacitor-native-navigation`
- **Purpose**: Capacitor plugin for native navbar, tabbar, safe-area handling, and WebView snapshot transitions.
- **Install**:

```bash
npm install @capgo/capacitor-native-navigation
npx cap sync
```

- **Platforms**: iOS, Android, Web
- **Key API methods**: `getPluginVersion()`, `beginTransition()`, `configure()`, `endPullToRefresh()`, `finishTransition()`, `reportNavbarScroll()`, `setNavbar()`, `setPullToRefresh()`, `setTabbar()`
- **Docs**: https://capgo.app/docs/plugins/native-navigation/
- **Repository**: https://github.com/Cap-go/capacitor-native-navigation

## Nativegeocoder

- **Package**: `@capgo/capacitor-nativegeocoder`
- **Purpose**: Capacitor plugin for native forward and reverse geocoding
- **Install**:

```bash
npm install @capgo/capacitor-nativegeocoder
npx cap sync
```

- **Platforms**: iOS, Android, Web
- **Key API methods**: `getPluginVersion()`, `forwardGeocode()`, `reverseGeocode()`
- **Docs**: https://capgo.app/docs/plugins/nativegeocoder/
- **Repository**: https://github.com/Cap-go/capacitor-nativegeocoder

## Navigation Bar

- **Package**: `@capgo/capacitor-navigation-bar`
- **Purpose**: Capacitor plugin Set navigation bar color for android lollipop and higher
- **Install**:

```bash
npm install @capgo/capacitor-navigation-bar
npx cap sync
```

- **Platforms**: iOS, Android, Web
- **Key API methods**: `getPluginVersion()`, `getNavigationBarColor()`, `hide()`, `setNavigationBarColor()`, `show()`
- **Docs**: https://capgo.app/docs/plugins/navigation-bar/
- **Repository**: https://github.com/Cap-go/capacitor-navigation-bar

## Neon

- **Package**: `@capgo/capacitor-neon`
- **Purpose**: Native Neon Auth and Data API integration for Capacitor: Auth, Database, and JWT access
- **Install**:

```bash
npm install @capgo/capacitor-neon
npx cap sync
```

- **Platforms**: iOS, Android, Web
- **Key API methods**: `getPluginVersion()`, `getAnonymousToken()`, `getSession()`, `getUser()`, `initialize()`, `refreshSession()`, `setSession()`, `signInWithOAuth()`, `signInWithOtp()`, `signInWithPassword()`, `signOut()`, `signUp()`
- **Docs**: https://capgo.app/docs/plugins/neon/
- **Repository**: https://github.com/Cap-go/capacitor-neon

## Network Diagnostics

- **Package**: `@capgo/capacitor-network-diagnostics`
- **Purpose**: Capacitor plugin for native network diagnostics.
- **Install**:

```bash
npm install @capgo/capacitor-network-diagnostics
npx cap sync
```

- **Platforms**: iOS, Android, Web
- **Key API methods**: `getPluginVersion()`, `getNetworkStatus()`, `runDiagnostics()`, `testDownloadSpeed()`, `testPacketLoss()`, `testPort()`, `testUrl()`, `testWebSocket()`
- **Docs**: https://capgo.app/docs/plugins/network-diagnostics/
- **Repository**: https://github.com/Cap-go/capacitor-network-diagnostics

## Nfc

- **Package**: `@capgo/capacitor-nfc`
- **Purpose**: Native NFC tag discovery, reading and writing for Capacitor apps on iOS and Android.
- **Install**:

```bash
npm install @capgo/capacitor-nfc
npx cap sync
```

- **Platforms**: iOS, Android, Web
- **Key API methods**: `getPluginVersion()`, `erase()`, `getStatus()`, `isSupported()`, `makeReadOnly()`, `share()`, `showSettings()`, `startScanning()`, `stopScanning()`, `transceive()`, `unshare()`, `write()`
- **Docs**: https://capgo.app/docs/plugins/nfc/
- **Repository**: https://github.com/Cap-go/capacitor-nfc

## Passkey

- **Package**: `@capgo/capacitor-passkey`
- **Purpose**: Capacitor passkey plugin with a WebAuthn-style shim for Capacitor apps.
- **Install**:

```bash
npm install @capgo/capacitor-passkey
npx cap sync
```

- **Platforms**: iOS, Android, Web
- **Key API methods**: `getPluginVersion()`, `autoShimWebAuthn()`, `createCredential()`, `getCredential()`, `isSupported()`, `shimWebAuthn()`
- **Docs**: https://capgo.app/docs/plugins/passkey/
- **Repository**: https://github.com/Cap-go/capacitor-passkey

## Patch

- **Package**: `@capgo/capacitor-patch`
- **Purpose**: Capacitor plugin for applying vetted Capgo patches during cap sync and cap update.
- **Install**:

```bash
npm install @capgo/capacitor-patch
npx cap sync
```

- **Platforms**: See repository
- **Key API methods**: See `src/definitions.ts` in the repository
- **Docs**: https://capgo.app/docs/plugins/capacitor-patch/
- **Repository**: https://github.com/Cap-go/capacitor-patch

## Pay

- **Package**: `@capgo/capacitor-pay`
- **Purpose**: Capacitor plugin to trigger native payment for iOS(Apple pay) and Android(Google Pay)
- **Install**:

```bash
npm install @capgo/capacitor-pay
npx cap sync
```

- **Platforms**: iOS, Android
- **Key API methods**: `getPluginVersion()`, `isPayAvailable()`, `requestPayment()`, `updateApplePayShipping()`
- **Docs**: https://capgo.app/docs/plugins/pay/
- **Repository**: https://github.com/Cap-go/capacitor-pay

## Pdf Generator

- **Package**: `@capgo/capacitor-pdf-generator`
- **Purpose**: Generate PDF files from HTML strings or URLs on iOS and Android.
- **Install**:

```bash
npm install @capgo/capacitor-pdf-generator
npx cap sync
```

- **Platforms**: iOS, Android
- **Key API methods**: `getPluginVersion()`, `fromData()`, `fromURL()`
- **Docs**: https://capgo.app/docs/plugins/pdf-generator/
- **Repository**: https://github.com/Cap-go/capacitor-pdf-generator

## Pdf Viewer

- **Package**: `@capgo/capacitor-pdf-viewer`
- **Purpose**: Capacitor plugin for opening PDFs inside the app.
- **Install**:

```bash
npm install @capgo/capacitor-pdf-viewer
npx cap sync
```

- **Platforms**: iOS, Android
- **Key API methods**: `getPluginVersion()`, `close()`, `getCurrentPage()`, `getPageCount()`, `goToPage()`, `hide()`, `nextPage()`, `open()`, `previousPage()`, `setZoom()`, `show()`, `updateLayout()`
- **Docs**: https://capgo.app/docs/plugins/pdf-viewer/
- **Repository**: https://github.com/Cap-go/capacitor-pdf-viewer

## Pedometer

- **Package**: `@capgo/capacitor-pedometer`
- **Purpose**: Capacitor plugin for accessing pedometer data including steps, distance, pace, cadence, and floors
- **Install**:

```bash
npm install @capgo/capacitor-pedometer
npx cap sync
```

- **Platforms**: iOS, Android
- **Key API methods**: `checkPermissions()`, `requestPermissions()`, `getPluginVersion()`, `getMeasurement()`, `isAvailable()`, `startMeasurementUpdates()`, `stopMeasurementUpdates()`
- **Docs**: https://capgo.app/docs/plugins/pedometer/
- **Repository**: https://github.com/Cap-go/capacitor-pedometer

## Permissions

- **Package**: `@capgo/capacitor-permissions`
- **Purpose**: Capacitor plugin for checking and requesting app permissions.
- **Install**:

```bash
npm install @capgo/capacitor-permissions
npx cap sync
```

- **Platforms**: iOS, Android
- **Key API methods**: `getPluginVersion()`, `check()`, `checkMultiple()`, `openSettings()`, `request()`, `requestMultiple()`, `requestPreciseLocation()`, `shouldShowRationale()`
- **Docs**: https://capgo.app/docs/plugins/permissions/
- **Repository**: https://github.com/Cap-go/capacitor-permissions

## Persistent Account

- **Package**: `@capgo/capacitor-persistent-account`
- **Purpose**: This plugin allows you to securely store account information for a user in Capacitor
- **Install**:

```bash
npm install @capgo/capacitor-persistent-account
npx cap sync
```

- **Platforms**: iOS, Android, Web
- **Key API methods**: `getPluginVersion()`, `readAccount()`, `saveAccount()`
- **Docs**: https://capgo.app/docs/plugins/persistent-account/
- **Repository**: https://github.com/Cap-go/capacitor-persistent-account

## Persistent Uuid

- **Package**: `@capgo/capacitor-persistent-uuid`
- **Purpose**: Capacitor plugin for a persistent app UUID that survives reinstalls and updates.
- **Install**:

```bash
npm install @capgo/capacitor-persistent-uuid
npx cap sync
```

- **Platforms**: iOS, Android, Web
- **Key API methods**: `getPluginVersion()`, `getId()`, `resetId()`
- **Docs**: https://capgo.app/docs/plugins/persistent-uuid/
- **Repository**: https://github.com/Cap-go/capacitor-persistent-uuid

## Persona

- **Package**: `@capgo/capacitor-persona`
- **Purpose**: Capacitor plugin for launching Persona Inquiry flows on iOS and Android.
- **Install**:

```bash
npm install @capgo/capacitor-persona
npx cap sync
```

- **Platforms**: iOS, Android, Web
- **Key API methods**: `startInquiry()`
- **Docs**: https://capgo.app/docs/plugins/persona/
- **Repository**: https://github.com/Cap-go/capacitor-persona

## Photo Library

- **Package**: `@capgo/capacitor-photo-library`
- **Purpose**: Capacitor plugin Displays photo gallery as web page, or boring native screen which you cannot modify but require no authorization
- **Install**:

```bash
npm install @capgo/capacitor-photo-library
npx cap sync
```

- **Platforms**: iOS, Android
- **Key API methods**: `getPluginVersion()`, `checkAuthorization()`, `getAlbums()`, `getLibrary()`, `getPhotoUrl()`, `getThumbnailUrl()`, `pickMedia()`, `requestAuthorization()`
- **Docs**: https://capgo.app/docs/plugins/photo-library/
- **Repository**: https://github.com/Cap-go/capacitor-photo-library

## Pretty Toast

- **Package**: `@capgo/capacitor-pretty-toast`
- **Purpose**: Native-first pretty toast notifications for Capacitor and the web
- **Install**:

```bash
npm install @capgo/capacitor-pretty-toast
npx cap sync
```

- **Platforms**: iOS, Android, Web
- **Key API methods**: `show()`
- **Docs**: https://capgo.app/docs/plugins/pretty-toast/
- **Repository**: https://github.com/Cap-go/capacitor-pretty-toast

## Printer

- **Package**: `@capgo/capacitor-printer`
- **Purpose**: Capacitor plugin for printing documents, HTML, PDFs, images and web views
- **Install**:

```bash
npm install @capgo/capacitor-printer
npx cap sync
```

- **Platforms**: iOS, Android, Web
- **Key API methods**: `getPluginVersion()`, `printBase64()`, `printFile()`, `printHtml()`, `printIframe()`, `printPdf()`, `printWebView()`
- **Docs**: https://capgo.app/docs/plugins/printer/
- **Repository**: https://github.com/Cap-go/capacitor-printer

## Privacy Screen

- **Package**: `@capgo/capacitor-privacy-screen`
- **Purpose**: Protect app content in Android screenshots and obscure the iOS app switcher snapshot.
- **Install**:

```bash
npm install @capgo/capacitor-privacy-screen
npx cap sync
```

- **Platforms**: iOS, Android, Web
- **Key API methods**: `getPluginVersion()`, `disable()`, `enable()`, `isEnabled()`
- **Docs**: https://capgo.app/docs/plugins/privacy-screen/
- **Repository**: https://github.com/Cap-go/capacitor-privacy-screen

## Proximity

- **Package**: `@capgo/capacitor-proximity`
- **Purpose**: Capacitor plugin for enabling proximity monitoring in mobile apps.
- **Install**:

```bash
npm install @capgo/capacitor-proximity
npx cap sync
```

- **Platforms**: iOS, Android
- **Key API methods**: `getPluginVersion()`, `disable()`, `enable()`, `getStatus()`
- **Docs**: https://capgo.app/docs/plugins/proximity/
- **Repository**: https://github.com/Cap-go/capacitor-proximity

## Realtimekit

- **Package**: `@capgo/capacitor-realtimekit`
- **Purpose**: Cloudflare Calls integration for Capacitor apps with built-in UI for meetings.
- **Install**:

```bash
npm install @capgo/capacitor-realtimekit
npx cap sync
```

- **Platforms**: iOS, Android, Web
- **Key API methods**: `getPluginVersion()`, `initialize()`, `startMeeting()`
- **Docs**: https://capgo.app/docs/plugins/realtimekit/
- **Repository**: https://github.com/Cap-go/capacitor-realtimekit

## Recaptcha

- **Package**: `@capgo/capacitor-recaptcha`
- **Purpose**: Capacitor plugin for generating reCAPTCHA and reCAPTCHA Enterprise tokens.
- **Install**:

```bash
npm install @capgo/capacitor-recaptcha
npx cap sync
```

- **Platforms**: iOS, Android, Web
- **Key API methods**: `getPluginVersion()`, `execute()`, `load()`
- **Docs**: https://capgo.app/docs/plugins/recaptcha/
- **Repository**: https://github.com/Cap-go/capacitor-recaptcha

## Rich Notifications

- **Package**: `@capgo/capacitor-rich-notifications`
- **Purpose**: Capacitor plugin for local rich notifications with channels, actions, progress, and schedules.
- **Install**:

```bash
npm install @capgo/capacitor-rich-notifications
npx cap sync
```

- **Platforms**: iOS, Android
- **Key API methods**: `getPluginVersion()`, `cancel()`, `cancelAll()`, `checkPermission()`, `createChannel()`, `createChannelGroup()`, `deleteChannel()`, `display()`, `getDisplayed()`, `getInitialNotification()`, `getPending()`, `registerActions()`
- **Docs**: https://capgo.app/docs/plugins/rich-notifications/
- **Repository**: https://github.com/Cap-go/capacitor-rich-notifications

## Ricoh360

- **Package**: `@capgo/capacitor-ricoh360`
- **Purpose**: Provides an SDK for the Ricoh360 cameras for Capacitor
- **Install**:

```bash
npm install @capgo/capacitor-ricoh360
npx cap sync
```

- **Platforms**: iOS, Android
- **Key API methods**: `getPluginVersion()`, `capturePicture()`, `captureVideo()`, `getCameraAsset()`, `initialize()`, `listFiles()`, `livePreview()`, `readSettings()`, `sendCommand()`, `setSettings()`, `stopLivePreview()`
- **Docs**: https://capgo.app/docs/plugins/ricoh360-camera/
- **Repository**: https://github.com/Cap-go/capacitor-ricoh360-camera-plugin

## Rudderstack

- **Package**: `@capgo/capacitor-rudderstack`
- **Purpose**: Capacitor plugin for RudderStack analytics, identity, and event tracking.
- **Install**:

```bash
npm install @capgo/capacitor-rudderstack
npx cap sync
```

- **Platforms**: iOS, Android, Web
- **Key API methods**: `getPluginVersion()`, `alias()`, `flush()`, `group()`, `identify()`, `initialize()`, `optOut()`, `putAdvertisingId()`, `putAnonymousId()`, `putDeviceToken()`, `reset()`, `screen()`
- **Docs**: https://capgo.app/docs/plugins/rudderstack/
- **Repository**: https://github.com/Cap-go/capacitor-rudderstack

## Screen Orientation

- **Package**: `@capgo/capacitor-screen-orientation`
- **Purpose**: Screen orientation plugin with support for bypassing orientation lock
- **Install**:

```bash
npm install @capgo/capacitor-screen-orientation
npx cap sync
```

- **Platforms**: iOS, Android
- **Key API methods**: `getPluginVersion()`, `getBarPlacement()`, `getFoldState()`, `getHingeAngle()`, `getReservedRegions()`, `getSizeClass()`, `isDeviceFoldable()`, `isOrientationLocked()`, `lock()`, `orientation()`, `setVerticalBarBehavior()`, `startOrientationTracking()`
- **Docs**: https://capgo.app/docs/plugins/screen-orientation/
- **Repository**: https://github.com/Cap-go/capacitor-screen-orientation

## Screen Recorder

- **Package**: `@capgo/capacitor-screen-recorder`
- **Purpose**: Record device's screen
- **Install**:

```bash
npm install @capgo/capacitor-screen-recorder
npx cap sync
```

- **Platforms**: iOS, Android, Web
- **Key API methods**: `getPluginVersion()`, `start()`, `stop()`
- **Docs**: https://capgo.app/docs/plugins/screen-recorder/
- **Repository**: https://github.com/Cap-go/capacitor-screen-recorder

## Shake

- **Package**: `@capgo/capacitor-shake`
- **Purpose**: Detect shake gesture in device
- **Install**:

```bash
npm install @capgo/capacitor-shake
npx cap sync
```

- **Platforms**: iOS, Android, Web
- **Key API methods**: `getPluginVersion()`
- **Docs**: https://capgo.app/docs/plugins/shake/
- **Repository**: https://github.com/Cap-go/capacitor-shake

## Share Target

- **Package**: `@capgo/capacitor-share-target`
- **Purpose**: Receive shared content from other apps
- **Install**:

```bash
npm install @capgo/capacitor-share-target
npx cap sync
```

- **Platforms**: iOS, Android, Web
- **Key API methods**: `getPluginVersion()`
- **Docs**: https://capgo.app/docs/plugins/share-target/
- **Repository**: https://github.com/Cap-go/capacitor-share-target

## Sheets

- **Package**: `@capgo/capacitor-sheets`
- **Purpose**: Framework-agnostic swipeable sheets, drawers, dialogs, and scroll primitives for Capacitor apps
- **Install**:

```bash
npm install @capgo/capacitor-sheets
npx cap sync
```

- **Platforms**: Android
- **Key API methods**: See `src/definitions.ts` in the repository
- **Docs**: https://capgo.app/docs/plugins/sheets/
- **Repository**: https://github.com/Cap-go/capacitor-sheets

## Sim

- **Package**: `@capgo/capacitor-sim`
- **Purpose**: Capacitor plugin to get information from device's sim cards
- **Install**:

```bash
npm install @capgo/capacitor-sim
npx cap sync
```

- **Platforms**: iOS, Android, Web
- **Key API methods**: `checkPermissions()`, `requestPermissions()`, `getPluginVersion()`, `getSimCards()`
- **Docs**: https://capgo.app/docs/plugins/sim/
- **Repository**: https://github.com/Cap-go/capacitor-sim

## Social Login

- **Package**: `@capgo/capacitor-social-login`
- **Purpose**: All social logins in one plugin
- **Install**:

```bash
npm install @capgo/capacitor-social-login
npx cap sync
```

- **Platforms**: iOS, Android, Web
- **Key API methods**: `getPluginVersion()`, `decodeIdToken()`, `getAccessTokenExpirationDate()`, `getAuthorizationCode()`, `handleRedirectCallback()`, `initialize()`, `isAccessTokenAvailable()`, `isAccessTokenExpired()`, `isLoggedIn()`, `isRefreshTokenAvailable()`, `logout()`, `openAuthSession()`
- **Docs**: https://capgo.app/docs/plugins/social-login/
- **Repository**: https://github.com/Cap-go/capacitor-social-login

## Speech Recognition

- **Package**: `@capgo/capacitor-speech-recognition`
- **Purpose**: Capacitor plugin for comprehensive on-device speech recognition with live partial results.
- **Install**:

```bash
npm install @capgo/capacitor-speech-recognition
npx cap sync
```

- **Platforms**: iOS, Android
- **Key API methods**: `checkPermissions()`, `requestPermissions()`, `getPluginVersion()`, `available()`, `forceStop()`, `getLastPartialResult()`, `getSupportedLanguages()`, `isListening()`, `isOnDeviceRecognitionAvailable()`, `setPTTState()`, `start()`, `stop()`
- **Docs**: https://capgo.app/docs/plugins/speech-recognition/
- **Repository**: https://github.com/Cap-go/capacitor-speech-recognition

## Speech Synthesis

- **Package**: `@capgo/capacitor-speech-synthesis`
- **Purpose**: Synthesize speech from text with full control over language, voice, pitch, rate, and volume.
- **Install**:

```bash
npm install @capgo/capacitor-speech-synthesis
npx cap sync
```

- **Platforms**: iOS, Android, Web
- **Key API methods**: `getPluginVersion()`, `activateAudioSession()`, `cancel()`, `deactivateAudioSession()`, `getLanguages()`, `getVoices()`, `initialize()`, `isAvailable()`, `isLanguageAvailable()`, `isSpeaking()`, `isVoiceAvailable()`, `pause()`
- **Docs**: https://capgo.app/docs/plugins/speech-synthesis/
- **Repository**: https://github.com/Cap-go/capacitor-speech-synthesis

## Ssl Pinning

- **Package**: `@capgo/capacitor-ssl-pinning`
- **Purpose**: Capacitor SSL pinning plugin for Android and iOS that integrates with CapacitorHttp.
- **Install**:

```bash
npm install @capgo/capacitor-ssl-pinning
npx cap sync
```

- **Platforms**: iOS, Android, Web
- **Key API methods**: `getPluginVersion()`, `getConfiguration()`
- **Docs**: https://capgo.app/docs/plugins/ssl-pinning/
- **Repository**: https://github.com/Cap-go/capacitor-ssl-pinning

## Stream Call

- **Package**: `@capgo/capacitor-stream-call`
- **Purpose**: Uses the https://getstream.io/ SDK to implement calling in Capacitor
- **Install**:

```bash
npm install @capgo/capacitor-stream-call
npx cap sync
```

- **Platforms**: iOS, Android, Web
- **Key API methods**: `getPluginVersion()`, `acceptCall()`, `call()`, `endCall()`, `getCallInfo()`, `getCallStatus()`, `getCurrentUser()`, `getDynamicStreamVideoApikey()`, `isCameraEnabled()`, `login()`, `logout()`, `rejectCall()`
- **Docs**: https://capgo.app/docs/plugins/streamcall/
- **Repository**: https://github.com/Cap-go/capacitor-streamcall

## Stripe Identity

- **Package**: `@capgo/capacitor-stripe-identity`
- **Purpose**: Capacitor plugin for Stripe Identity verification.
- **Install**:

```bash
npm install @capgo/capacitor-stripe-identity
npx cap sync
```

- **Platforms**: iOS, Android, Web
- **Key API methods**: `create()`, `initialize()`, `present()`
- **Docs**: https://capgo.app/docs/plugins/stripe-identity/
- **Repository**: https://github.com/Cap-go/capacitor-stripe-identity

## Stripe Pay

- **Package**: `@capgo/capacitor-stripe-pay`
- **Purpose**: Capacitor plugin for Stripe Payment Sheet, Apple Pay, and Google Pay.
- **Install**:

```bash
npm install @capgo/capacitor-stripe-pay
npx cap sync
```

- **Platforms**: iOS, Android, Web
- **Key API methods**: `initialize()`
- **Docs**: https://capgo.app/docs/plugins/stripe-pay/
- **Repository**: https://github.com/Cap-go/capacitor-stripe-pay

## Stripe Terminal

- **Package**: `@capgo/capacitor-stripe-terminal`
- **Purpose**: Capacitor plugin for Stripe Terminal in-person payments.
- **Install**:

```bash
npm install @capgo/capacitor-stripe-terminal
npx cap sync
```

- **Platforms**: iOS, Android, Web
- **Key API methods**: `cancelCollectPaymentMethod()`, `cancelDiscoverReaders()`, `cancelInstallUpdate()`, `cancelReaderReconnection()`, `clearReaderDisplay()`, `collectPaymentMethod()`, `confirmPaymentIntent()`, `connectReader()`, `disconnectReader()`, `discoverReaders()`, `getConnectedReader()`, `initialize()`
- **Docs**: https://capgo.app/docs/plugins/stripe-terminal/
- **Repository**: https://github.com/Cap-go/capacitor-stripe-terminal

## Supabase

- **Package**: `@capgo/capacitor-supabase`
- **Purpose**: Native Supabase SDK integration for Capacitor - Auth, Database, and JWT access
- **Install**:

```bash
npm install @capgo/capacitor-supabase
npx cap sync
```

- **Platforms**: iOS, Android, Web
- **Key API methods**: `getPluginVersion()`, `getSession()`, `getUser()`, `initialize()`, `refreshSession()`, `setSession()`, `signInAnonymously()`, `signInWithOAuth()`, `signInWithOtp()`, `signInWithPassword()`, `signOut()`, `signUp()`
- **Docs**: https://capgo.app/docs/plugins/supabase/
- **Repository**: https://github.com/Cap-go/capacitor-supabase

## Textinteraction

- **Package**: `@capgo/capacitor-textinteraction`
- **Purpose**: Toggle text interaction in Capacitor based iOS apps.
- **Install**:

```bash
npm install @capgo/capacitor-textinteraction
npx cap sync
```

- **Platforms**: iOS, Android
- **Key API methods**: `getPluginVersion()`, `isEnabled()`, `toggle()`
- **Docs**: https://capgo.app/docs/plugins/textinteraction/
- **Repository**: https://github.com/Cap-go/capacitor-textinteraction

## Transitions

- **Package**: `@capgo/capacitor-transitions`
- **Purpose**: Framework-agnostic page transitions for Capacitor apps - iOS-style navigation without opinions
- **Install**:

```bash
npm install @capgo/capacitor-transitions
npx cap sync
```

- **Platforms**: Android
- **Key API methods**: See `src/definitions.ts` in the repository
- **Docs**: https://capgo.app/docs/plugins/transitions/
- **Repository**: https://github.com/Cap-go/capacitor-transitions

## Twilio Voice

- **Package**: `@capgo/capacitor-twilio-voice`
- **Purpose**: Integrates the Twilio Voice SDK into Capacitor
- **Install**:

```bash
npm install @capgo/capacitor-twilio-voice
npx cap sync
```

- **Platforms**: iOS, Android
- **Key API methods**: `getPluginVersion()`, `acceptCall()`, `checkMicrophonePermission()`, `endCall()`, `getCallStatus()`, `isLoggedIn()`, `login()`, `logout()`, `makeCall()`, `muteCall()`, `rejectCall()`, `remove()`
- **Docs**: https://capgo.app/docs/plugins/twilio-voice/
- **Repository**: https://github.com/Cap-go/capacitor-twilio-voice

## Updater

- **Package**: `@capgo/capacitor-updater`
- **Purpose**: Live update for capacitor apps
- **Install**:

```bash
npm install @capgo/capacitor-updater
npx cap sync
```

- **Platforms**: iOS, Android
- **Key API methods**: `notifyAppReady()`, `download()`, `getLatest()`, `getPluginVersion()`, `cancelDelay()`, `checkPreviewUpdate()`, `completeFlexibleUpdate()`, `current()`, `delete()`, `deletePreview()`, `getAppId()`, `getAppUpdateInfo()`
- **Docs**: https://capgo.app/docs/plugins/updater/
- **Repository**: https://github.com/Cap-go/capacitor-updater

## Uploader

- **Package**: `@capgo/capacitor-uploader`
- **Purpose**: Upload file natively
- **Install**:

```bash
npm install @capgo/capacitor-uploader
npx cap sync
```

- **Platforms**: iOS, Android, Web
- **Key API methods**: `getPluginVersion()`, `acknowledgeEvent()`, `removeUpload()`, `startUpload()`, `uploadMultipart()`
- **Docs**: https://capgo.app/docs/plugins/uploader/
- **Repository**: https://github.com/Cap-go/capacitor-uploader

## Uwb

- **Package**: `@capgo/capacitor-uwb`
- **Purpose**: Capacitor plugin for Ultra-Wideband (UWB) ranging on iOS and Android.
- **Install**:

```bash
npm install @capgo/capacitor-uwb
npx cap sync
```

- **Platforms**: iOS, Android
- **Key API methods**: `getPluginVersion()`, `getDiscoveryToken()`, `isAvailable()`, `startControleeSession()`, `startControllerSession()`, `startPeerSession()`, `stopSession()`
- **Docs**: https://capgo.app/docs/plugins/uwb/
- **Repository**: https://github.com/Cap-go/capacitor-uwb

## Verisoul

- **Package**: `@capgo/capacitor-verisoul`
- **Purpose**: Capacitor plugin for Verisoul fraud prevention sessions.
- **Install**:

```bash
npm install @capgo/capacitor-verisoul
npx cap sync
```

- **Platforms**: iOS, Android
- **Key API methods**: `configure()`, `getSessionId()`, `recordTouchEvent()`, `reinitialize()`
- **Docs**: https://capgo.app/docs/plugins/verisoul/
- **Repository**: https://github.com/Cap-go/capacitor-verisoul

## Video Player

- **Package**: `@capgo/capacitor-video-player`
- **Purpose**: Capacitor plugin to play video in native player
- **Install**:

```bash
npm install @capgo/capacitor-video-player
npx cap sync
```

- **Platforms**: iOS, Android, Web
- **Key API methods**: `getPluginVersion()`, `exitPlayer()`, `getCurrentTime()`, `getDuration()`, `getMuted()`, `getRate()`, `getVolume()`, `hidePlayer()`, `initPlayer()`, `isControllerIsFullyVisible()`, `isPlaying()`, `pause()`
- **Docs**: https://capgo.app/docs/plugins/video-player/
- **Repository**: https://github.com/Cap-go/capacitor-video-player

## Video Thumbnails

- **Package**: `@capgo/capacitor-video-thumbnails`
- **Purpose**: Generate video thumbnails from local or remote video files
- **Install**:

```bash
npm install @capgo/capacitor-video-thumbnails
npx cap sync
```

- **Platforms**: iOS, Android, Web
- **Key API methods**: `getPluginVersion()`, `getThumbnail()`
- **Docs**: https://capgo.app/docs/plugins/video-thumbnails/
- **Repository**: https://github.com/Cap-go/capacitor-video-thumbnails

## Volume Buttons

- **Package**: `@capgo/capacitor-volume-buttons`
- **Purpose**: Capacitor plugin to listen to volume button presses
- **Install**:

```bash
npm install @capgo/capacitor-volume-buttons
npx cap sync
```

- **Platforms**: iOS, Android, Web
- **Key API methods**: `getPluginVersion()`
- **Docs**: https://capgo.app/docs/plugins/volume-buttons/
- **Repository**: https://github.com/Cap-go/capacitor-volume-buttons

## Watch

- **Package**: `@capgo/capacitor-watch`
- **Purpose**: Capacitor plugin for Apple Watch communication with bidirectional messaging support
- **Install**:

```bash
npm install @capgo/capacitor-watch
npx cap sync
```

- **Platforms**: iOS, Android
- **Key API methods**: `getPluginVersion()`, `getInfo()`, `replyToMessage()`, `sendMessage()`, `transferUserInfo()`, `updateApplicationContext()`
- **Docs**: https://capgo.app/docs/plugins/watch/
- **Repository**: https://github.com/Cap-go/capacitor-watch

## Webview Crash

- **Package**: `@capgo/capacitor-webview-crash`
- **Purpose**: Capacitor plugin for detecting WebView crash recovery and restarting long-running WebViews natively.
- **Install**:

```bash
npm install @capgo/capacitor-webview-crash
npx cap sync
```

- **Platforms**: iOS, Android, Web
- **Key API methods**: `clearPendingCrashInfo()`, `getPendingCrashInfo()`, `restartWebView()`, `simulateCrashRecovery()`
- **Docs**: https://capgo.app/docs/plugins/webview-crash/
- **Repository**: https://github.com/Cap-go/capacitor-webview-crash

## Webview Guardian

- **Package**: `@capgo/capacitor-webview-guardian`
- **Purpose**: Capacitor plugin to Detect when the WebView was killed in the background and relaunch it on foreground.
- **Install**:

```bash
npm install @capgo/capacitor-webview-guardian
npx cap sync
```

- **Platforms**: iOS, Android
- **Key API methods**: `checkNow()`, `getState()`, `startMonitoring()`, `stopMonitoring()`
- **Docs**: https://capgo.app/docs/plugins/webview-guardian/
- **Repository**: https://github.com/Cap-go/capacitor-webview-guardian

## Webview Version Checker

- **Package**: `@capgo/capacitor-webview-version-checker`
- **Purpose**: Capacitor plugin for checking outdated Android WebView engines, emitting status events, and presenting native update prompts.
- **Install**:

```bash
npm install @capgo/capacitor-webview-version-checker
npx cap sync
```

- **Platforms**: iOS, Android, Web
- **Key API methods**: `check()`, `getLastStatus()`, `openUpdatePage()`, `showUpdatePrompt()`, `startMonitoring()`, `stopMonitoring()`
- **Docs**: https://capgo.app/docs/plugins/webview-version-checker/
- **Repository**: https://github.com/Cap-go/capacitor-webview-version-checker

## Wechat

- **Package**: `@capgo/capacitor-wechat`
- **Purpose**: WeChat SDK for Capacitor - enables authentication, sharing, payments, and mini-programs
- **Install**:

```bash
npm install @capgo/capacitor-wechat
npx cap sync
```

- **Platforms**: iOS, Android, Web
- **Key API methods**: `getPluginVersion()`, `auth()`, `chooseInvoice()`, `initialize()`, `isInstalled()`, `openMiniProgram()`, `sendPaymentRequest()`, `share()`
- **Docs**: https://capgo.app/docs/plugins/wechat/
- **Repository**: https://github.com/Cap-go/capacitor-wechat

## Widget Kit

- **Package**: `@capgo/capacitor-widget-kit`
- **Purpose**: Capacitor plugin for generic iOS Home Screen widgets, WidgetKit, and Live Activities using SVG templates, declarative actions, and shared App Group persistence.
- **Install**:

```bash
npm install @capgo/capacitor-widget-kit
npx cap sync
```

- **Platforms**: iOS, Android, Web
- **Key API methods**: `getPluginVersion()`, `acknowledgeTemplateEvents()`, `acknowledgeWidgetMessages()`, `areActivitiesSupported()`, `completeWidgetMessage()`, `endTemplateActivity()`, `getTemplateActivity()`, `getWidgetSession()`, `listTemplateActivities()`, `listTemplateEvents()`, `listWidgetMessages()`, `listWidgetSessions()`
- **Docs**: https://capgo.app/docs/plugins/widget-kit/
- **Repository**: https://github.com/Cap-go/capacitor-widget-kit

## Wifi

- **Package**: `@capgo/capacitor-wifi`
- **Purpose**: Manage WiFi connectivity for your Capacitor app
- **Install**:

```bash
npm install @capgo/capacitor-wifi
npx cap sync
```

- **Platforms**: iOS, Android
- **Key API methods**: `connect()`, `disconnect()`, `checkPermissions()`, `requestPermissions()`, `getPluginVersion()`, `addNetwork()`, `getAvailableNetworks()`, `getIpAddress()`, `getRssi()`, `getSsid()`, `getWifiInfo()`, `isEnabled()`
- **Docs**: https://capgo.app/docs/plugins/wifi/
- **Repository**: https://github.com/Cap-go/capacitor-wifi

## Youtube Player

- **Package**: `@capgo/capacitor-youtube-player`
- **Purpose**: Capacitor player to embed YouTube player controls in Capacitor apps
- **Install**:

```bash
npm install @capgo/capacitor-youtube-player
npx cap sync
```

- **Platforms**: iOS, Android, Web
- **Key API methods**: `getPluginVersion()`, `createPlayer()`, `cuePlaylist()`, `cueVideoById()`, `cueVideoByUrl()`, `destroy()`, `getAllPlayersEventsState()`, `getAvailablePlaybackRates()`, `getAvailableQualityLevels()`, `getCurrentTime()`, `getDuration()`, `getIframe()`
- **Docs**: https://capgo.app/docs/plugins/youtube-player/
- **Repository**: https://github.com/Cap-go/capacitor-youtube-player

## Zebra Datawedge

- **Package**: `@capgo/capacitor-zebra-datawedge`
- **Purpose**: Capacitor plugin for Zebra DataWedge profile management, notifications, queries, and soft scanning on Zebra Android devices.
- **Install**:

```bash
npm install @capgo/capacitor-zebra-datawedge
npx cap sync
```

- **Platforms**: iOS, Android, Web
- **Key API methods**: `getPluginVersion()`, `cloneProfile()`, `configureDiagnostics()`, `createProfile()`, `deleteProfile()`, `disableDatawedge()`, `disableScannerInput()`, `enableDatawedge()`, `enableScannerInput()`, `enumerateScanners()`, `enumerateTriggers()`, `getActiveProfile()`
- **Docs**: https://capgo.app/docs/plugins/zebra-datawedge/
- **Repository**: https://github.com/Cap-go/capacitor-zebra-datawedge

## Zip

- **Package**: `@capgo/capacitor-zip`
- **Purpose**: A free Capacitor plugin for zipping and unzipping files on iOS, Android, and Web.
- **Install**:

```bash
npm install @capgo/capacitor-zip
npx cap sync
```

- **Platforms**: iOS, Android, Web
- **Key API methods**: `getPluginVersion()`, `unzip()`, `zip()`
- **Docs**: https://capgo.app/docs/plugins/zip/
- **Repository**: https://github.com/Cap-go/capacitor-zip

## Cordova Updater

- **Package**: `@capgo/cordova-updater`
- **Purpose**: Live update Cordova plugin for Capgo
- **Install**:

```bash
npm install @capgo/cordova-updater
npx cap sync
```

- **Platforms**: iOS, Android
- **Key API methods**: `notifyAppReady()`, `download()`, `getLatest()`, `getPluginVersion()`, `cancelDelay()`, `checkPreviewUpdate()`, `completeFlexibleUpdate()`, `current()`, `delete()`, `deletePreview()`, `getAppId()`, `getAppUpdateInfo()`
- **Docs**: https://capgo.app/docs/plugins/updater/
- **Repository**: https://github.com/Cap-go/cordova-updater

## Native Purchases

- **Package**: `@capgo/native-purchases`
- **Purpose**: In-app Subscriptions Made Easy
- **Install**:

```bash
npm install @capgo/native-purchases
npx cap sync
```

- **Platforms**: iOS, Android, Web
- **Key API methods**: `getPluginVersion()`, `acknowledgePurchase()`, `configure()`, `consumePurchase()`, `finishTransaction()`, `getAppTransaction()`, `getProduct()`, `getProducts()`, `getPurchases()`, `getStorefront()`, `getUnfinishedTransactions()`, `isBillingSupported()`
- **Docs**: https://capgo.app/docs/plugins/native-purchases/
- **Repository**: https://github.com/Cap-go/capacitor-native-purchases
