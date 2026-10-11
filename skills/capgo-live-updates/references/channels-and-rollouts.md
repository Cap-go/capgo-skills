# Channels, Rollouts, and Version Targeting

Docs: https://capgo.app/docs/live-updates/channels/ · https://capgo.app/docs/live-updates/progressive-rollouts/ · https://capgo.app/docs/live-updates/version-targeting/

## How a device picks its channel (highest wins)

1. Forced device mapping (dashboard)
2. Per-device cloud override (dashboard or Public API). Expires 90 days after the last write
3. Local `setChannel()` choice in the plugin (since 7.34). It does not show as a Device Override in the dashboard
4. `defaultChannel` in `capacitor.config.*` (use it for TestFlight or internal builds)
5. The cloud default channel (most production users)

If no cloud default is set, a device only gets updates through steps 1 to 4.

## Channel CLI

```bash
npx @capgo/cli@latest channel add beta com.example.app --self-assign
npx @capgo/cli@latest channel add production com.example.app --default
npx @capgo/cli@latest channel list com.example.app
npx @capgo/cli@latest channel currentBundle production com.example.app --quiet
npx @capgo/cli@latest channel promote staging production com.example.app   # same checks as channel set --bundle
npx @capgo/cli@latest channel set production com.example.app --bundle 1.2.2  # rollback = relink the stable bundle
```

The command is `channel add`. There is no `channel create`, no `bundle revert`, and no `upload --sign`.

Targeting flags on `channel set`: `--ios/--no-ios`, `--android/--no-android`, `--dev/--no-dev`, `--prod/--no-prod`, `--emulator/--no-emulator`, `--device/--no-device`, `--self-assign/--no-self-assign`, `--downgrade/--no-downgrade`.

## Disable-auto-update strategies

`channel set <ch> --disable-auto-update <major|minor|patch|metadata|none>`

- `major`: blocks bundles whose major is above the device baseline (`CapacitorUpdater.version` or the native version).
- `minor` / `patch`: stricter versions of the same check.
- `metadata`: uses `min_update_version`. Upload with `--min-update-version x.y.z` or `--auto-min-update-version`.
- `none`: allows everything.

## Progressive rollouts

A channel can hold a **stable fallback** and a **rollout target** at the same time. Cohorts are random but sticky (cache default 30 days, range 60 s to 365 days).

```bash
# Upload and start a 10% rollout in one step
npx @capgo/cli@latest bundle upload com.example.app --path ./dist --channel production --rollout 10

# Promote the current target to stable and roll out the new upload at the same percentage
npx @capgo/cli@latest bundle upload com.example.app --path ./dist --channel production --rollout-advance

# Manage an existing rollout
npx @capgo/cli@latest channel set production com.example.app --rollout-percentage 50
npx @capgo/cli@latest channel set production com.example.app --rollout-pause
npx @capgo/cli@latest channel set production com.example.app --rollout-resume
npx @capgo/cli@latest channel set production com.example.app --rollout-promote
npx @capgo/cli@latest channel set production com.example.app --rollout-rollback
```

Auto-pause: use `--auto-pause-enabled` with `--auto-pause-failure-rate-bps`, `--auto-pause-min-attempts`, `--auto-pause-action pause|rollback|notify`, and related flags.

Traps:

- On a channel that has a rollout configured, a plain `bundle upload --channel production` sets the **rollout target**, and stable is unchanged. To replace stable on purpose, use `channel set production --bundle <version>`. The docs also mention an upload `--stable` flag, but CLI 8.77 does not ship it. Check `npx @capgo/cli@latest bundle upload --help` before you use it.
- Setting the percentage to 0% does not pull back devices already on the target. Use `--rollout-rollback`.

## Bundle versioning

- Versions must be unique and greater than `0.0.0`. A deleted version can never be reused.
- Use semver with prerelease tags per channel (`1.2.3-beta.1`, `1.2.3-rc.1`, `1.2.3`).
- In CI, `--auto-bump [major|minor|patch|metadata|ai]` picks the next free version. You cannot combine it with `--bundle`. `--version-exists-ok` exits 0 if the version already exists.

## Preview QR codes

Enable preview once with `npx @capgo/cli@latest app set com.example.app --preview`. Then:

```bash
npx @capgo/cli@latest get-qr com.example.app --channel production
npx @capgo/cli@latest bundle upload com.example.app --channel beta --qr-preview
```
