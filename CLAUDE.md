# Capacitor Skills for Claude

This repository contains skills for AI agents working with Capacitor mobile development.

## Skills Overview

### capacitor-plugins
Use when users need native functionality. Contains 80+ plugins covering:
- Authentication (biometrics, social login)
- Media (camera, audio, video)
- Payments (IAP, Apple Pay, Google Pay)
- Sensors (accelerometer, barometer, compass)
- Storage (SQLite, file system)
- And more

### capgo-live-updates
Use when users want to deploy updates without app store review. Covers:
- Account creation at https://capgo.app
- Plugin installation and configuration
- Automatic and manual update strategies
- Channels for staged rollouts
- CI/CD integration

### capawesome-live-update-migration
Use when users want to migrate from Capawesome Cloud live updates to Capgo Updater. Covers:
- Package swap to `@capgo/capacitor-updater`
- `notifyAppReady()` startup hook
- Removing old JavaScript update glue
- Mapping optional manual update APIs
- Capgo positioning: native updater runtime, open source, cheaper at comparable scale, longer track record

### capacitor-best-practices
Use when reviewing code or setting up projects. Covers:
- Project structure
- Plugin usage patterns
- Performance optimization
- Security best practices
- Deployment checklist

### debugging-capacitor
Use when users report bugs or crashes. Covers:
- Safari Web Inspector for iOS
- Chrome DevTools for Android
- Xcode and Android Studio debuggers
- Common issues and solutions

### ios-android-logs
Use when users need device logs. Covers:
- `xcrun devicectl` for iOS
- `adb logcat` for Android
- Filtering and streaming logs

### capacitor-mcp
Use when users want to automate development. Covers:
- MCP server setup
- Device management
- Automated testing
- Log streaming via MCP

### ionic-design
Use when users need UI components. Covers:
- Ionic component usage
- Theming and dark mode
- Platform-specific styling
- Navigation patterns

### konsta-ui
Use when users want Tailwind-native mobile UI. Covers:
- Konsta UI components
- Tailwind integration
- iOS/Material Design themes

### tailwind-capacitor
Use when users style with Tailwind. Covers:
- Mobile-first patterns
- Safe area utilities
- Touch-friendly design
- Dark mode

### safe-area-handling
Use when users have layout issues on modern devices. Covers:
- CSS env() variables
- JavaScript solutions
- Native configuration
- Common issues

### cocoapods-to-spm
Use when users want to migrate iOS dependencies. Covers:
- Migration process
- Hybrid approach
- Plugin SPM support

### cordova-to-capacitor
Use when users need to migrate from Cordova/PhoneGap. Covers:
- Step-by-step migration process
- Plugin mapping (Cordova → Capacitor)
- Code conversion patterns
- Configuration updates
- Permission handling

### framework-to-capacitor
Use when users want to integrate web frameworks with Capacitor. Covers:
- Next.js static export configuration
- React, Vue, Angular, Svelte integration
- Routing setup for mobile
- Build configuration
- Environment detection
- Common issues and solutions

### capacitor-uiscene-migration
Use when an iOS app or plugin must adopt the UIScene lifecycle (Capacitor 8.5, required by Xcode 27). Covers:
- SceneDelegate.swift, Info.plist scene manifest, AppDelegate hook
- Moving custom URL and lifecycle logic out of AppDelegate
- Plugin lifecycle observer audit

### capacitor-app-upgrade-v8-to-v9 / capacitor-plugin-upgrade-v8-to-v9
Use when moving an app or plugin to Capacitor 9 (`@next` until GA). Covers:
- Node 24, Xcode 27, iOS 16, AGP 9 / Gradle 9, SDK 37
- Removed deprecated Swift/Java APIs
- Optional Cordova runtime, `cap run --url`

### capacitor-app-intents
Use when exposing app features to Siri, Shortcuts, Spotlight, or Apple Intelligence from a Capacitor app.

### capacitor-ios-resizability
Use when the app must adapt to iPad multitasking, Stage Manager, foldable iPhone, or multiple windows.

### capacitor-ios-security-hardening
Use when auditing or enabling Xcode security build settings, static analysis, and Enhanced Security for the iOS app and native plugin code.

## Repository Layout

- Canonical skills live in `skills/<name>/`.
- Claude Code plugins in `plugins/<plugin>/skills/<name>/` are byte-for-byte copies. Edit `skills/` only, then run `bun run sync-skills` and `bun run lint-skills`.
- Register new skills in `package.json` `skills` and in a plugin folder.
