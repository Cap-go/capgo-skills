# Caching and Versioning

## Caches

```yaml
# npm (built into setup-node)
- uses: actions/setup-node@v5
  with: { node-version: '22', cache: npm }

# Gradle: gradle/actions/setup-gradle@v4 caches ~/.gradle automatically.

# SPM (iOS, default for new Capacitor projects)
- uses: actions/cache@v4
  with:
    path: ~/Library/Developer/Xcode/DerivedData/**/SourcePackages
    key: spm-${{ runner.os }}-${{ hashFiles('ios/App/CapApp-SPM/Package.swift', 'ios/App/**/Package.resolved') }}

# CocoaPods projects
- uses: actions/cache@v4
  with:
    path: ios/App/Pods
    key: pods-${{ runner.os }}-${{ hashFiles('ios/App/Podfile.lock') }}
```

Do not cache `node_modules` across Capacitor upgrades without the lockfile in the key; stale native plugin sources cause confusing Xcode/Gradle errors. CocoaPods Trunk is expected to become read-only on Dec 2, 2026; migrating to SPM (`cocoapods-to-spm`) removes the Pods cache entirely.

## Build numbers

- iOS `CURRENT_PROJECT_VERSION` and Android `versionCode` must increase on every upload. Use the CI run counter (`github.run_number`, `CI_PIPELINE_IID`) plus an offset if the store already has higher numbers.
- Marketing version (`MARKETING_VERSION`, `versionName`) comes from `package.json` `version` or the git tag. Keep both platforms on the same value.
- Capgo Cloud Build bumps build numbers automatically unless `--skip-build-number-bump` is passed.
- Capgo OTA bundle versions must be unique per app; `bundle upload` defaults to `package.json` `version`, override with `--bundle <version>`.

## semantic-release (optional)

```json
{
  "branches": ["main"],
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    ["@semantic-release/npm", { "npmPublish": false }],
    ["@semantic-release/git", { "assets": ["package.json", "CHANGELOG.md"] }],
    "@semantic-release/github"
  ]
}
```

Tag pushes produced by semantic-release can then trigger the native release workflow.
