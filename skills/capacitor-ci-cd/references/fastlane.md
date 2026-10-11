# Fastlane for Capacitor

Run `npm run build && npx cap sync` before any lane; Fastlane does not build web assets.

## iOS (`ios/App/fastlane/Fastfile`)

```ruby
default_platform(:ios)

platform :ios do
  lane :beta do
    setup_ci # temporary keychain on CI
    api_key = app_store_connect_api_key(
      key_id: ENV['ASC_KEY_ID'],
      issuer_id: ENV['ASC_ISSUER_ID'],
      key_content: ENV['ASC_KEY_P8_BASE64'],
      is_key_content_base64: true
    )
    match(type: 'appstore', readonly: true, api_key: api_key)
    increment_build_number(build_number: ENV['GITHUB_RUN_NUMBER'], xcodeproj: 'App.xcodeproj')
    build_app(
      # SPM projects: project: 'App.xcodeproj'; CocoaPods: workspace: 'App.xcworkspace'
      project: 'App.xcodeproj',
      scheme: 'App',
      export_method: 'app-store'
    )
    upload_to_testflight(api_key: api_key, skip_waiting_for_build_processing: true)
  end
end
```

Run from `ios/App` with `bundle exec fastlane beta` (pin fastlane in a `Gemfile` and use `ruby/setup-ruby` with `bundler-cache: true`).

## Android (`android/fastlane/Fastfile`)

```ruby
default_platform(:android)

platform :android do
  lane :internal do
    gradle(task: 'bundle', build_type: 'Release')
    upload_to_play_store(
      track: 'internal',
      aab: lane_context[SharedValues::GRADLE_AAB_OUTPUT_PATH],
      json_key_data: ENV['PLAY_SERVICE_ACCOUNT_JSON']
    )
  end
end
```

`increment_version_code` is a third-party plugin, not built into Fastlane; prefer `VERSION_CODE` from the environment read by `build.gradle` (see `signing-and-secrets.md`).

## Traps

- `build_app` must target the project type in use; SPM-only projects have no `App.xcworkspace`.
- Capacitor 9 / Xcode 27: make sure the runner selects Xcode 27 before Fastlane runs (`xcodes select` or `xcode-select`).
- `match` with `readonly: true` on CI; generate certificates locally once.
