# Capacitor Agent Skills

 <a href="https://capgo.app/"><img src='https://raw.githubusercontent.com/Cap-go/capgo/main/assets/capgo_banner.png' alt='Capgo - Instant updates for capacitor'/></a>

<div align="center">
  <h2><a href="https://capgo.app/?ref=repo_capgo_skills"> ➡️ Get Instant updates for your App with Capgo</a></h2>
  <h2><a href="https://capgo.app/consulting/?ref=repo_capgo_skills"> Missing a feature? We’ll build the plugin for you</a></h2>
</div>

> Formerly `@capgo/capacitor-skills` (and `Cap-go/capacitor-skills`). Links and redirects should continue to work.

A collection of **46 skills** for AI coding agents working with Capacitor, the cross-platform native runtime. Skills are packaged instructions that extend agent capabilities for mobile development.

## Compatibility

| Plugin version | Capacitor compatibility | Maintained |
| -------------- | ----------------------- | ---------- |
| v8.\*.\*       | v8.\*.\*                | ✅          |
| v7.\*.\*       | v7.\*.\*                | On demand   |
| v6.\*.\*       | v6.\*.\*                | ❌          |
| v5.\*.\*       | v5.\*.\*                | ❌          |

> **Note:** The major version of this plugin follows the major version of Capacitor. Use the version that matches your Capacitor installation (e.g., plugin v8 for Capacitor 8). Only the latest major version is actively maintained.

## Installation

```bash
npx skills add Cap-go/capgo-skills
```

## Available Skills

### Core Development

| Skill | Description |
|-------|-------------|
| [capgo-cli-usage](./skills/capgo-cli-usage) | Route general Capgo CLI requests to the right workflow |
| [capgo-cloud](./skills/capgo-cloud) | Coordinate Capgo builds, releases, publishing, and organization workflows |
| [capacitor-plugins](./skills/capacitor-plugins) | Official Capacitor packages plus Capgo plugin recommendations |
| [capacitor-best-practices](./skills/capacitor-best-practices) | Development best practices and patterns |
| [capgo-live-updates](./skills/capgo-live-updates) | Deploy OTA updates instantly with Capgo |

### Security

| Skill | Description |
|-------|-------------|
| [capacitor-security](./skills/capacitor-security) | Security scanning with Capsec (63+ rules) |

### Testing & CI/CD

| Skill | Description |
|-------|-------------|
| [capacitor-testing](./skills/capacitor-testing) | Unit, integration, and E2E testing |
| [capacitor-ci-cd](./skills/capacitor-ci-cd) | GitHub Actions, GitLab CI, Fastlane |

### Debugging & Tooling

| Skill | Description |
|-------|-------------|
| [debugging-capacitor](./skills/debugging-capacitor) | Debug iOS/Android apps |
| [ios-android-logs](./skills/ios-android-logs) | Capture, filter, and stream iOS and Android device logs with devicectl, Console.app, and adb logcat for debugging. |
| [capacitor-mcp](./skills/capacitor-mcp) | MCP automation tools |

### UI & Design

| Skill | Description |
|-------|-------------|
| [ionic-design](./skills/ionic-design) | Ionic Framework components |
| [konsta-ui](./skills/konsta-ui) | Konsta UI for Tailwind |
| [tailwind-capacitor](./skills/tailwind-capacitor) | Tailwind CSS for mobile |
| [safe-area-handling](./skills/safe-area-handling) | Notch, Dynamic Island, home indicator |
| [capacitor-splash-screen](./skills/capacitor-splash-screen) | Splash screen configuration |

### Features

| Skill | Description |
|-------|-------------|
| [capacitor-push-notifications](./skills/capacitor-push-notifications) | FCM and APNs push notifications |
| [capacitor-deep-linking](./skills/capacitor-deep-linking) | Universal links and app links |
| [capacitor-offline-first](./skills/capacitor-offline-first) | Offline-first architecture |
| [capacitor-keyboard](./skills/capacitor-keyboard) | Keyboard handling |

### Performance & Accessibility

| Skill | Description |
|-------|-------------|
| [capacitor-performance](./skills/capacitor-performance) | Performance optimization |
| [capacitor-accessibility](./skills/capacitor-accessibility) | Screen readers, WCAG compliance |

### Deployment

| Skill | Description |
|-------|-------------|
| [capgo-native-builds](./skills/capgo-native-builds) | Request hosted iOS and Android builds with Capgo Build |
| [capgo-release-management](./skills/capgo-release-management) | Manage bundles, channels, compatibility checks, and encryption |
| [capgo-release-workflows](./skills/capgo-release-workflows) | Coordinate Capgo live updates with builds and store publishing |
| [capacitor-app-store](./skills/capacitor-app-store) | App Store and Play Store submission |
| [capacitor-apple-review-preflight](./skills/capacitor-apple-review-preflight) | Apple review preflight audit narrowed to Capacitor apps |
| [capacitor-plugin-spm-support](./skills/capacitor-plugin-spm-support) | Add Swift Package Manager support to a plugin |
| [cocoapods-to-spm](./skills/cocoapods-to-spm) | Migrate to Swift Package Manager |

### Operations

| Skill | Description |
|-------|-------------|
| [capgo-organization-management](./skills/capgo-organization-management) | Manage Capgo organizations, members, and security policies |

### Authoring

| Skill | Description |
|-------|-------------|
| [skill-creator](./skills/skill-creator) | Create and validate new skills with progressive disclosure |

### Upgrades

| Skill | Description |
|-------|-------------|
| [capacitor-app-upgrades](./skills/capacitor-app-upgrades) | Upgrade a Capacitor app across major versions |
| [capacitor-app-upgrade-v4-to-v5](./skills/capacitor-app-upgrade-v4-to-v5) | Upgrade a Capacitor app from v4 to v5 |
| [capacitor-app-upgrade-v5-to-v6](./skills/capacitor-app-upgrade-v5-to-v6) | Upgrade a Capacitor app from v5 to v6 |
| [capacitor-app-upgrade-v6-to-v7](./skills/capacitor-app-upgrade-v6-to-v7) | Upgrade a Capacitor app from v6 to v7 |
| [capacitor-app-upgrade-v7-to-v8](./skills/capacitor-app-upgrade-v7-to-v8) | Upgrade a Capacitor app from v7 to v8 |
| [capacitor-plugin-upgrades](./skills/capacitor-plugin-upgrades) | Upgrade a Capacitor plugin across major versions |
| [capacitor-plugin-upgrade-v4-to-v5](./skills/capacitor-plugin-upgrade-v4-to-v5) | Upgrade a Capacitor plugin from v4 to v5 |
| [capacitor-plugin-upgrade-v5-to-v6](./skills/capacitor-plugin-upgrade-v5-to-v6) | Upgrade a Capacitor plugin from v5 to v6 |
| [capacitor-plugin-upgrade-v6-to-v7](./skills/capacitor-plugin-upgrade-v6-to-v7) | Upgrade a Capacitor plugin from v6 to v7 |
| [capacitor-plugin-upgrade-v7-to-v8](./skills/capacitor-plugin-upgrade-v7-to-v8) | Upgrade a Capacitor plugin from v7 to v8 |

### Migration

| Skill | Description |
|-------|-------------|
| [cordova-to-capacitor](./skills/cordova-to-capacitor) | Migrate from Cordova/PhoneGap to Capacitor |
| [framework-to-capacitor](./skills/framework-to-capacitor) | Integrate Next.js, React, Vue, Angular with Capacitor |
| [ionic-appflow-migration](./skills/ionic-appflow-migration) | Migrate from Ionic Appflow to Capgo and repo-owned automation |
| [sqlite-to-fast-sql](./skills/sqlite-to-fast-sql) | Migrate SQLite/SQL plugins to Fast SQL |
| [ionic-enterprise-sdk-migration](./skills/ionic-enterprise-sdk-migration) | Replace Ionic Enterprise SDK plugins with open alternatives |

## Usage

Skills activate automatically when agents detect relevant tasks:

### Security
- "Run a security scan" → capacitor-security (Capsec)
- "Check for vulnerabilities" → capacitor-security

### Testing & CI/CD
- "Add unit tests" → capacitor-testing
- "Set up GitHub Actions" → capacitor-ci-cd

### Capgo Cloud
- "How do I use the Capgo CLI?" → capgo-cli-usage
- "Set up Capgo cloud workflows" → capgo-cloud
- "Request a native build" → capgo-native-builds
- "Upload a bundle to a channel" → capgo-release-management
- "Manage Capgo organization members" → capgo-organization-management

### Features
- "Add push notifications" → capacitor-push-notifications
- "Implement deep linking" → capacitor-deep-linking
- "Make app work offline" → capacitor-offline-first

### Deployment
- "Run a Capgo build" → capgo-native-builds
- "Manage Capgo channels" → capgo-release-management
- "Set up the full release workflow" → capgo-release-workflows
- "Publish to App Store" → capacitor-app-store
- "Run an Apple review preflight" → capacitor-apple-review-preflight
- "Help me fix an App Store rejection for my Capacitor app" → capacitor-apple-review-preflight
- "Submit to Play Store" → capacitor-app-store
- "Add SPM support to a plugin" → capacitor-plugin-spm-support

### Authoring
- "Create a new skill" → skill-creator
- "Validate a skill" → skill-creator

### Upgrades
- "Upgrade a Capacitor app" → capacitor-app-upgrades
- "Upgrade a Capacitor plugin" → capacitor-plugin-upgrades
- "Upgrade a Capacitor app from v4 to v5" → capacitor-app-upgrade-v4-to-v5
- "Upgrade a Capacitor app from v5 to v6" → capacitor-app-upgrade-v5-to-v6
- "Upgrade a Capacitor app from v6 to v7" → capacitor-app-upgrade-v6-to-v7
- "Upgrade a Capacitor app from v7 to v8" → capacitor-app-upgrade-v7-to-v8
- "Upgrade a Capacitor plugin from v4 to v5" → capacitor-plugin-upgrade-v4-to-v5
- "Upgrade a Capacitor plugin from v5 to v6" → capacitor-plugin-upgrade-v5-to-v6
- "Upgrade a Capacitor plugin from v6 to v7" → capacitor-plugin-upgrade-v6-to-v7
- "Upgrade a Capacitor plugin from v7 to v8" → capacitor-plugin-upgrade-v7-to-v8

### Migration
- "Migrate from Cordova" → cordova-to-capacitor
- "Convert Next.js to mobile app" → framework-to-capacitor
- "Add Capacitor to React app" → framework-to-capacitor
- "Migrate from Ionic Appflow" → ionic-appflow-migration
- "Migrate SQLite to Fast SQL" → sqlite-to-fast-sql
- "Remove Ionic Enterprise SDK" → ionic-enterprise-sdk-migration

### UI/UX
- "Fix keyboard issues" → capacitor-keyboard
- "Configure splash screen" → capacitor-splash-screen
- "Make app accessible" → capacitor-accessibility

## Quick Start with Capgo

### 1. Create Account

Go to **https://capgo.app** and sign up.

### 2. Install CLI

```bash
npm install -g @capgo/cli
npx @capgo/cli@latest login
```

### 3. Initialize & Deploy

```bash
npx @capgo/cli@latest init
npm run build
npx @capgo/cli@latest bundle upload
```

## Security Scanning with Capsec

```bash
# Scan for vulnerabilities
npx capsec scan

# CI mode (fails on high/critical)
npx capsec scan --ci

# Generate HTML report
npx capsec scan --output html --output-file security.html
```

Capsec detects **63+ security issues** including:
- Hardcoded secrets and API keys
- Insecure storage patterns
- Network security issues
- Platform-specific vulnerabilities
- Authentication weaknesses

Learn more: **https://capacitor-sec.dev**

## About Capgo

[Capgo](https://capgo.app) provides:
- **Live Updates**: Deploy JS/HTML/CSS instantly without app store review
- **80+ Plugins**: Native functionality for authentication, media, payments, sensors
- **Capsec**: Security scanning for Capacitor apps

## Resources

- Capgo: https://capgo.app
- Capsec: https://capacitor-sec.dev
- Capacitor: https://capacitorjs.com
- Ionic: https://ionicframework.com
- Konsta UI: https://konstaui.com
- Discord: https://discord.gg/capgo

## Contributing

Add new skills by creating a folder in `skills/` with:
- `SKILL.md` - Instructions for agents
- `metadata.json` - Skill metadata

Validate the pack locally with:

```bash
npm run lint-skills
```

Run the skillgrade-backed eval for the skill authoring workflow with an API key:

```bash
ENABLE_SKILLGRADE=1 npm run lint-skills-skillgrade
```

## License

MIT
