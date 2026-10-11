# Test Jobs in CI

Keep fast web tests on Linux and native tests on macOS only where needed. For build, signing and release pipelines see `capacitor-ci-cd`.

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]

jobs:
  web:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 24 }        # Capacitor 9 needs Node 24+, Capacitor 8 Node 22+
      - run: npm ci
      - run: npx vitest run --coverage
      - run: npx playwright install --with-deps
      - run: npx playwright test

  ios-native:
    runs-on: macos-latest                  # check that the image has the Xcode your Capacitor version needs
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 24 }
      - run: npm ci && npm run build && npx cap sync ios
      - run: |
          SIM=$(xcrun simctl list devices available | awk -F '[()]' '/iPhone/{print $2; exit}')
          xcodebuild test -project ios/App/App.xcodeproj -scheme App -destination "id=$SIM"

  android-native:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with: { distribution: temurin, java-version: 21 }
      - uses: actions/setup-node@v4
        with: { node-version: 24 }
      - run: npm ci && npm run build && npx cap sync android
      - run: cd android && ./gradlew test
```

Notes:
- The `ios-native` job only makes sense if the App project has a test target. For plugins, run `xcodebuild test -scheme <PackageName>` from the plugin repo.
- Check the JDK version that the project's Android Gradle Plugin requires (AGP 9 for Capacitor 9) before you pin `java-version`.
- Pick the simulator by UDID from `simctl list` instead of hard-coding a device name; images change.
- Appium or Maestro device suites on CI need an emulator / simulator boot step and are slow. Run them nightly or on release branches.
