# GitLab CI for Capacitor

GitLab SaaS macOS runners are available on Premium/Ultimate tiers; otherwise register a self-hosted macOS runner and tag it `macos`. Pick an image that includes the required Xcode (Xcode 26 for Capacitor 8, Xcode 27 for Capacitor 9); check GitLab's hosted macOS image list.

```yaml
stages: [test, build, deploy]

variables:
  WEB_DIR: dist

default:
  image: node:22  # node:24 for Capacitor 9

.npm-cache:
  cache:
    key:
      files: [package-lock.json]
    paths: [.npm/]
  before_script:
    - npm ci --cache .npm --prefer-offline

test:
  stage: test
  extends: .npm-cache
  script:
    - npm run lint --if-present
    - npm test --if-present
    - npx @capgo/capgo-sec@latest scan --ci

build-web:
  stage: build
  extends: .npm-cache
  script:
    - npm run build
  artifacts:
    paths: [$WEB_DIR]
    expire_in: 1 day

build-android:
  stage: build
  image: eclipse-temurin:21-jdk
  needs: [build-web]
  before_script:
    - apt-get update && apt-get install -y nodejs npm unzip
    # install Android cmdline-tools + SDK here, or use a maintained Android SDK image with JDK 21
  script:
    - npm ci
    - npx cap sync android
    - echo "$ANDROID_KEYSTORE_BASE64" | base64 -d > /tmp/upload.jks
    - cd android && ANDROID_KEYSTORE_PATH=/tmp/upload.jks VERSION_CODE=$CI_PIPELINE_IID ./gradlew bundleRelease
  artifacts:
    paths: [android/app/build/outputs/bundle/release/*.aab]
  rules:
    - if: $CI_COMMIT_TAG

build-ios:
  stage: build
  tags: [macos]
  needs: [build-web]
  script:
    - npm ci
    - npx cap sync ios
    - cd ios/App && bundle exec fastlane beta
  rules:
    - if: $CI_COMMIT_TAG

capgo-ota:
  stage: deploy
  needs: [build-web]
  script:
    - npx @capgo/cli@latest bundle upload --path $WEB_DIR --channel production
  rules:
    - if: $CI_COMMIT_BRANCH == "main"
```

Store `CAPGO_TOKEN`, keystore values, and App Store Connect key values as masked, protected CI/CD variables. The Debian `nodejs` package is usually older than Node 22; in the Android job prefer installing Node from NodeSource or using an image that bundles both JDK 21 and Node.
