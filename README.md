# Capacitor Agent Skills

A collection of **22 skills** for AI coding agents working with Capacitor, the cross-platform native runtime. Skills are packaged instructions that extend agent capabilities for mobile development.

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
npx skills add Cap-go/capacitor-skills
```

## Available Skills

### Core Development

| Skill | Description |
|-------|-------------|
| [capacitor-plugins](./skills/capacitor-plugins) | Complete catalog of 80+ Capgo Capacitor plugins |
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
| [ios-android-logs](./skills/ios-android-logs) | Device log streaming |
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
| [capacitor-app-store](./skills/capacitor-app-store) | App Store and Play Store submission |
| [cocoapods-to-spm](./skills/cocoapods-to-spm) | Migrate to Swift Package Manager |

## Usage

Skills activate automatically when agents detect relevant tasks:

### Security
- "Run a security scan" → capacitor-security (Capsec)
- "Check for vulnerabilities" → capacitor-security

### Testing & CI/CD
- "Add unit tests" → capacitor-testing
- "Set up GitHub Actions" → capacitor-ci-cd

### Features
- "Add push notifications" → capacitor-push-notifications
- "Implement deep linking" → capacitor-deep-linking
- "Make app work offline" → capacitor-offline-first

### Deployment
- "Publish to App Store" → capacitor-app-store
- "Submit to Play Store" → capacitor-app-store

### UI/UX
- "Fix keyboard issues" → capacitor-keyboard
- "Configure splash screen" → capacitor-splash-screen
- "Make app accessible" → capacitor-accessibility

## Quick Start with Capgo

### 1. Create Account

Go to **https://capgo.app** and sign up.

### 2. Install CLI

```bash
bun add -g @capgo/cli
capgo login
```

### 3. Initialize & Deploy

```bash
capgo init
bun run build
capgo upload
```

## Security Scanning with Capsec

```bash
# Scan for vulnerabilities
bunx capsec scan

# CI mode (fails on high/critical)
bunx capsec scan --ci

# Generate HTML report
bunx capsec scan --output html --output-file security.html
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

## License

MIT
