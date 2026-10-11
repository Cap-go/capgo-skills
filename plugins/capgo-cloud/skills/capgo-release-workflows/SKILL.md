---
name: capgo-release-workflows
description: Designs repository-owned release pipelines for Capacitor apps that combine Capgo live updates, native builds (Capgo Build or the team's own CI runners), and App Store / Play publishing, with an automatic OTA-vs-native gate (`bundle releaseType`, `build needed`), staged channels, and rollback. Use when the user wants one release system covering OTA, builds, and store publishing, is replacing a hosted release service with CI they own, or asks how CI should decide between a live update and a store build. Do not use for single-step tasks (capgo-release-management, capgo-native-builds, capgo-live-updates), non-Capacitor apps, or Ionic Enterprise plugin migration (ionic-enterprise-sdk-migration).
---

# Capgo Release Workflows

Set up an end-to-end release system: Capgo OTA for web changes, native builds for binary changes, store publishing, and a CI gate that picks the right path.

## When to Use

TRIGGER when:

- The user wants a single release pipeline covering live updates, native builds, and store publishing.
- The user is moving off a hosted release service (Appflow-style) to CI they own.
- The user asks "how does CI know if this needs a store release?"

Do not use when:

- The user needs one operation (upload or promote a bundle, request one build). Use `capgo-release-management` or `capgo-native-builds`.
- The user is wiring the updater plugin. Use `capgo-live-updates`.
- The user is migrating off Ionic Appflow specifically. Start with `ionic-appflow-migration`, then return here for the pipeline.
- The app is not Capacitor.

## Building Blocks

| Area | Skill | Key command |
| --- | --- | --- |
| OTA updates | `capgo-live-updates`, `capgo-release-management` | `bundle upload`, `channel promote` |
| Native builds on Capgo | `capgo-native-builds` | `build request` |
| Native builds on own runners | `capacitor-ci-cd` | Xcode / Gradle / Fastlane |
| Store listing and review | `capacitor-app-store`, `capacitor-apple-review-preflight` | n/a |

## Procedure

### 1. Inventory (inspect, then report)

Find out:

- Which CI system runs (`.github/workflows`, `.gitlab-ci.yml`, `bitbucket-pipelines.yml`, `azure-pipelines.yml`).
- Whether `@capgo/capacitor-updater` is installed with the major that matches `@capacitor/core`, and whether `notifyAppReady()` is called.
- The existing Capgo channels (`npx @capgo/cli@latest channel list <appId>`) and the default channel.
- Where native signing lives (Capgo credentials, CI secrets, Fastlane match).
- Whether store uploads are required, or only internal distribution.

Report the gaps to the user and ask before you choose Capgo Build or their own runners for native builds.

### 2. Define channels and versioning

- Typical channels: `development` (self-assign), `staging`, `production` (default).
- Use semver bundle versions. In CI, use `--bundle <ver>` or `--auto-bump patch`, plus `--version-exists-ok`.
- Set production to the metadata strategy once, so every upload records its native baseline:

```bash
npx @capgo/cli@latest channel set production com.example.app --disable-auto-update metadata
```

### 3. Add the OTA-vs-native gate

```bash
# After npm ci && npm run build
if git diff --name-only "$BASE" HEAD | grep -qE '^(ios/|android/|capacitor\.config\.)'; then
  TYPE=native
else
  TYPE=$(npx @capgo/cli@latest bundle releaseType com.example.app --channel production | tr -d '[:space:]')
fi
```

`releaseType` prints `OTA` or `native` from native package metadata. It cannot see raw native edits, which is why the git-path check is there. `build needed` is the exit-code version: exit 1 means native is required, exit 0 means OTA is fine, exit 2 means the command failed.

### 4. Wire both branches

- **OTA:** `bundle upload --channel staging --fail-on-incompatible --auto-min-update-version`, then a manual or approved `channel promote staging production`, optionally with `--rollout 10`.
- **Native:** run `build request --platform ios|android` (Capgo Build) or the native jobs, then upload the matching bundle with `--auto-min-update-version` so the channel baseline advances. Do **not** pass `--fail-on-incompatible` on that baseline upload, because the native packages are supposed to differ.

Full GitHub Actions and GitLab templates: https://capgo.app/docs/builder/ci-ota-or-native/

### 5. Rollback plan (write it down before the first release)

- OTA: `channel set production --bundle <previous>` or `--rollout-rollback`. Auto-pause with `--auto-pause-enabled --auto-pause-action rollback`.
- Native: there is no rollback in the stores. Ship a fixed build, and keep OTA able to patch the web layer.

### 6. Secrets

- `CAPGO_TOKEN` (upload-capable, least privilege) and `CAPGO_PRIVATE_KEY` if bundles are encrypted.
- Native signing: export from Capgo with `build credentials manage` → `.env`, then `gh secret set -f`. Or keep the existing CI secret store.
- Never commit `.capgo`, `.capgo_key_v2`, `.capgo-credentials.json`, or `.env.capgo.*`.

## Verification

Run once, end to end:

1. A web-only commit takes the OTA branch. A device on staging gets the bundle (`npx @capgo/cli@latest app debug <appId>`).
2. A commit that adds or upgrades a native plugin takes the native branch. The build succeeds and lands in TestFlight or the Play internal track.
3. After the native release, `bundle releaseType --channel production` returns `OTA` again for web-only changes.
4. A practice rollback (`channel set --bundle <previous>`) reaches a test device.

## Error Handling

- CI uploads fail with `No Capgo API key found`: `CAPGO_TOKEN` is not exported to the step's `env`.
- `Bundle NOT compatible with production channel` in the OTA branch: the gate was skipped or `releaseType` ran against a different channel.
- Signing failures: fix credentials first (`capgo-native-builds`, `build prescan`) before you touch pipeline logic.
- Store failures: split the iOS and Android jobs so one platform does not block diagnosis of the other.

## Resources

- OTA or native in CI: https://capgo.app/docs/builder/ci-ota-or-native/
- CI/CD integration: https://capgo.app/docs/getting-started/cicd-integration/
- Capgo Build GitHub Actions: https://capgo.app/docs/builder/github-actions/
- Native + OTA channel workflow: https://capgo.app/docs/live-updates/native-ota-channel-workflow/
