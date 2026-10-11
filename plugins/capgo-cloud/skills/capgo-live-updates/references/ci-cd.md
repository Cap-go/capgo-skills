# Uploading Live Updates from CI

Docs: https://capgo.app/docs/getting-started/cicd-integration/ · https://capgo.app/docs/builder/ci-ota-or-native/

## Auth in CI

- Store the Capgo API key as a CI secret named `CAPGO_TOKEN`. The CLI reads `CAPGO_TOKEN` automatically. You can also pass `--apikey "$CAPGO_TOKEN"`.
- The CLI resolves the key in this order: `-a/--apikey`, then `CAPGO_TOKEN`, then `~/.capgo` (global `login`), then `./.capgo` (`login --local`).
- For encrypted uploads, store the private key content as `CAPGO_PRIVATE_KEY` and pass `--key-data-v2 "$CAPGO_PRIVATE_KEY"`.
- Interactive prompts are disabled automatically in CI.

## GitHub Actions

```yaml
name: Capgo live update
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-node@v6
        with:
          node-version: '24'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - name: Upload to Capgo
        env:
          CAPGO_TOKEN: ${{ secrets.CAPGO_TOKEN }}
        run: |
          npx @capgo/cli@latest bundle upload com.example.app \
            --path ./dist \
            --channel production \
            --bundle "1.4.${{ github.run_number }}" \
            --fail-on-incompatible \
            --auto-min-update-version \
            --version-exists-ok
```

## GitLab CI

```yaml
deploy_capgo:
  image: node:24
  stage: deploy
  rules:
    - if: $CI_COMMIT_BRANCH == "main"
  script:
    - npm ci
    - npm run build
    - npx @capgo/cli@latest bundle upload com.example.app --path ./dist --channel production --fail-on-incompatible
  variables:
    CAPGO_TOKEN: $CAPGO_TOKEN
```

## Gate OTA vs native

Run this before uploading:

```bash
TYPE=$(npx @capgo/cli@latest bundle releaseType com.example.app --channel production | tr -d '[:space:]')
# TYPE=OTA    -> bundle upload
# TYPE=native -> Capgo Build (capgo-native-builds) or your native pipeline, then upload the matching bundle
```

Or use `npx @capgo/cli@latest build needed com.example.app --channel production`. It prints `yes` and exits 1 when a native build is required, prints `no` and exits 0 otherwise, and exits 2 on a command failure.

`releaseType` only compares native package metadata. Also force the native path when the git diff touches `ios/`, `android/`, or `capacitor.config.*`.

## Useful upload flags in CI

| Flag | Why |
| --- | --- |
| `--fail-on-incompatible` | Exit non-zero instead of shipping a bundle that native code cannot run |
| `--accept-incompatible` | Mismatch is intentional (the JS guards missing plugins). Warns and continues |
| `--auto-min-update-version` | Records the native baseline for the `metadata` strategy |
| `--version-exists-ok` | Re-runs and monorepos do not fail on an existing version |
| `--auto-bump patch` | Picks the next free version (not with `--bundle`) |
| `--delta` | Changed files only. Refuses builds with more than 10,000 files |
| `--rollout 10` | Ship to 10% of the channel |
| `--comment "$GIT_SHA"` / `--link <url>` | Release metadata |

`--fail-on-incompatible`, `--accept-incompatible`, and `--ignore-metadata-check` cannot be combined with each other.

## Monorepos

Pass `--package-json ./apps/mobile/package.json --node-modules ./node_modules,./apps/mobile/node_modules`. With a dynamic root `capacitor.config.ts`, also pass `--capacitor-config <path>`.
