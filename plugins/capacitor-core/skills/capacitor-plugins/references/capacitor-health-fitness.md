# Health Fitness

Read/write Apple HealthKit and Android Health Connect data. Official plugin, 1.x (requires `@capacitor/core` 8+).

**Platforms:** Android, iOS (no Web)

## Installation

```bash
npm install @capacitor/health-fitness
npx cap sync
```

## Configuration

### iOS

- `Info.plist`: `NSHealthShareUsageDescription`, `NSHealthUpdateUsageDescription`.
- For `setBackgroundJob`: `UIBackgroundModes` (`fetch`, `processing`) and `BGTaskSchedulerPermittedIdentifiers` containing `com.outsystems.health.default`.
- Enable the HealthKit capability. Entitlements: `com.apple.developer.healthkit` (required), `...healthkit.background-delivery` (background jobs), `...healthkit.recalibrate-estimates` (estimate variables such as `WALKING_SPEED`), `...healthkit.access` = empty array.

### Android

Health Connect permissions must exist in the manifest at build time. Create `android/healthfitness.config.json` (values `Read`, `Write`, `ReadWrite`):

```json
{
  "permissions": { "STEPS": "ReadWrite", "HEART_RATE": "Read" },
  "groupPermissions": { "FITNESS_VARIABLES": "Read" }
}
```

A `capacitor:sync:after` hook rewrites `android/app/src/main/AndroidManifest.xml` on every `npx cap sync`. Re-run sync after editing the config.

## API

`requestHealthPermissions`, `getData`, `getWorkoutData` (iOS only), `writeData`, `getLastRecord`, `setBackgroundJob`, `updateBackgroundJob`, `deleteBackgroundJob`, `listBackgroundJobs`, `disconnectFromHealthConnect`, `openHealthConnect`.

`requestHealthPermissions` takes JSON-encoded strings, e.g. `fitnessVariables: JSON.stringify({ IsActive: true, AccessType: 'READ' })` and `customPermissions: JSON.stringify([{ Variable: 'STEPS', AccessType: 'READ' }])`. Check the plugin's `definitions.ts` for the full option set before writing code.

## Notes

- Health data apps face extra App Store / Play review requirements; load `capacitor-apple-review-preflight` before submission.
- Alternative: `@capgo/capacitor-health`.
