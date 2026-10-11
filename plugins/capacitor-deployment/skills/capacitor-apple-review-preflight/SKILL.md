---
name: capacitor-apple-review-preflight
description: Audits a Capacitor iOS app against Apple App Review Guidelines before submission or after a rejection. Use when the user pastes a rejection (Guideline 4.2 Minimum Functionality, 4.8 Login Services / Sign in with Apple, 5.1.1 data collection or account deletion, 5.1.2(i) sharing data with third-party AI, 3.1.1 in-app purchase, 2.1 app completeness, 2.3 metadata, 4.3 spam), an upload warning (ITMS-91053 missing API declaration, ITMS-91061 missing privacy manifest, ITMS-90683 missing purpose string), or wants a preflight of metadata, PrivacyInfo.xcprivacy, Info.plist usage strings, entitlements, subscriptions, reviewer notes, live-update disclosure, and Xcode 27 / UIScene readiness. Do not use for Google Play review, upload mechanics, screenshots and listing setup (capacitor-app-store), building a web wrapper from scratch (webapp-to-capacitor), or non-Capacitor runtimes.
allowed-tools:
  - Bash(node -e *)
  - Bash(find *)
---

# Capacitor Apple Review Preflight

Run a pre-submission or post-rejection Apple review audit for a Capacitor app and return a prioritized, evidence-backed report.

This skill adapts the Apple guideline and rejection-rule corpus from [truongduy2611/app-store-preflight-skills](https://github.com/truongduy2611/app-store-preflight-skills) and narrows the workflow to Capacitor-specific project inspection.

## When to Use

TRIGGER when:
- The user wants an App Store review preflight for a Capacitor app.
- The user received an App Review rejection or an App Store Connect upload warning email and wants the project audited.
- The user asks whether metadata, entitlements, privacy manifests, Sign in with Apple, subscriptions, AI features, or minimum functionality will pass.
- The user wants reviewer notes for a Capacitor submission (demo accounts, live updates, hardware features).

Do not use for:
- Google Play policy or Data safety -> `capacitor-app-store` (Android reference).
- Archiving, uploading, screenshots, TestFlight -> `capacitor-app-store`.
- Making a website feel native from scratch -> `webapp-to-capacitor`.
- Security hardening beyond review rules -> `capacitor-security`.

## Live Project Snapshot

Detected Capacitor, auth, subscription, analytics, and privacy-related packages:
!`node -e "const fs=require('fs');if(!fs.existsSync('package.json'))process.exit(0);const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));const sections=['dependencies','devDependencies'];const out=[];for(const section of sections){for(const [name,version] of Object.entries(pkg[section]||{})){if(name.startsWith('@capacitor/')||name.startsWith('@capgo/')||name.includes('firebase')||name.includes('sentry')||name.includes('revenuecat')||name.includes('purchase')||name.includes('subscription')||name.includes('auth')||name.includes('analytics')||name.includes('segment')||name.includes('amplitude')||name.includes('mixpanel')||name.includes('openai')||name.includes('anthropic')||name.includes('gemini'))out.push(section+'.'+name+'='+version)}}console.log(out.sort().join('\n'))"`

Relevant Apple review file paths:
!`find . -maxdepth 6 -not -path '*/node_modules/*' \( -name 'package.json' -o -name 'capacitor.config.json' -o -name 'capacitor.config.ts' -o -name 'capacitor.config.js' -o -name 'Info.plist' -o -name '*.entitlements' -o -name 'PrivacyInfo.xcprivacy' -o -name 'SceneDelegate.swift' -o -name 'project.pbxproj' -o -path './ios' -o -path './fastlane/metadata' -o -path './metadata' \)`

## Current Apple Requirements (October 2026)

Check these first; they cause upload failures before review even starts:
- SDK: uploads must be built with Xcode 26+ / iOS 26 SDK (since April 28, 2026). From April 2027 the iOS 27 SDK (Xcode 27) is required.
- UIScene: Xcode 27 builds require the scene lifecycle. Capacitor 8.5+ supports it; the app needs `SceneDelegate.swift`, `UIApplicationSceneManifest` in `Info.plist`, and `configurationForConnecting` in `AppDelegate`. After adoption, AppDelegate `application(_:open:options:)`, `continue userActivity`, and foreground/background callbacks stop firing; custom native code there must move to the scene delegate.
- Privacy manifest: the app target needs its own `PrivacyInfo.xcprivacy` for required-reason APIs used by app code; SDKs on Apple's privacy-impacting list must ship their own manifests and signatures (Capacitor core and CapacitorCordova ship manifests).
- Age rating: the updated questionnaire (4+, 9+, 13+, 16+, 18+) must be answered or new versions cannot be submitted.
- AI data sharing: guideline 5.1.2(i) (Nov 2025 revision) requires clear in-app disclosure and explicit permission before personal data is sent to third-party AI services.

## Procedure

### Step 1: Confirm scope

Apple-facing review work only. If the task is mostly release mechanics, hand off to `capacitor-app-store`. If a rejection is cited, prioritize that guideline first, then expand to adjacent risks.

### Step 2: Identify app type and load checklists

Always read `references/guidelines/by-app-type/all_apps.md`. Then add the checklists that match:

| App has | Load |
|---|---|
| Subscriptions or IAP | `subscription_iap.md` |
| UGC, chat, social feeds | `social_ugc.md` |
| Kids Category | `kids.md` |
| Health, fitness, medical claims | `health_fitness.md` |
| Games | `games.md` |
| AI / LLM features | `ai_apps.md` |
| Crypto, trading, finance | `crypto_finance.md` |
| VPN / networking | `vpn.md` |
| Also ships to macOS | `macos.md` |

Use `references/guidelines/README.md` for the full guideline index when a rejection cites a specific section.

### Step 3: Inspect the Capacitor and iOS project

Start from the snapshot, then read:
- `package.json` for auth, analytics, ads, payments, AI SDKs.
- `capacitor.config.*` for `appId`, `server.url` (a remote `server.url` in a release build is a 4.2 / 2.5.2 risk), live-update config.
- `ios/App/App/Info.plist`: every `NS...UsageDescription` a plugin can trigger, `ITSAppUsesNonExemptEncryption`, `UIApplicationSceneManifest`, `UIBackgroundModes`.
- `*.entitlements` vs features actually shipped.
- `PrivacyInfo.xcprivacy` (app target membership, required-reason APIs, tracking domains).
- `fastlane/metadata` or `metadata/` if present.

Capacitor-specific risks:
- WebView-only experience with no native value or mobile UX -> 4.2.
- Remote `server.url` loading a website -> 4.2 and 2.5.2.
- Social login without Sign in with Apple or an equivalent private option -> 4.8.
- Web checkout for digital goods visible in the iOS build -> 3.1.1.
- Live updates used to change app purpose or add features beyond what was reviewed -> guideline 2.5.2 and the Apple Developer Program License Agreement interpreted-code terms; disclose the mechanism and keep updates to web-asset fixes.
- Plugin permissions present in `Info.plist` with vague or copied strings -> 5.1.1.
- Capabilities enabled in Xcode but unused (Push, iCloud, HealthKit, Associated Domains).

### Step 4: Run rule-based passes

Rule files are the source of truth:
- metadata: `references/rules/metadata/*.md`
- subscription: `references/rules/subscription/*.md`
- privacy: `references/rules/privacy/*.md`
- design: `references/rules/design/*.md`
- entitlements: `references/rules/entitlements/*.md`
- build: `references/rules/build/sdk_and_scene_lifecycle.md` (Xcode/SDK minimums, UIScene)

Map metadata rules to App Store text, screenshots, previews, and review notes; privacy rules to `Info.plist`, manifests, SDKs, and data flows; design rules to navigation, native value, and login; entitlement rules to enabled capabilities.

If metadata is not local and the `asc` CLI is configured, pull it with `asc metadata pull --output-dir ./metadata`. Otherwise audit local sources and mark metadata checks partial.

### Step 5: Report

```markdown
## Apple Review Preflight

### Rejections Found
- [GUIDELINE X.X.X] Issue summary
  - Evidence: file:line or metadata field
  - Why it matters for this Capacitor app
  - Fix: exact remediation

### Warnings
- [GUIDELINE X.X.X] Potential issue

### Passed
- [Category] Checks that looked clean

### Missing Inputs
- Metadata or assets not available locally
```

Order by severity. Report before making invasive changes (removing features, changing auth or billing); ask the user at those decision points.

### Step 6: Reviewer notes and follow-ups

Draft notes for: demo account, hidden or hardware-dependent features, subscription test path, AI moderation and data-sharing consent, live-update behaviour (web assets only; no native changes), and reasons for special entitlements or background modes.

## Verification

- Every rejection finding has a concrete fix applied or an explicit owner/decision.
- `plutil -lint ios/App/App/Info.plist ios/App/App/PrivacyInfo.xcprivacy` passes.
- `PrivacyInfo.xcprivacy` is a member of the App target (check `project.pbxproj` contains it in the Resources build phase).
- `grep -c "UsageDescription" ios/App/App/Info.plist` matches the permissions your plugins can request.
- Release build archives and validates in Xcode Organizer with no ITMS warnings.
- Demo account logs in on a clean install against production backend.

## Error Handling

| Input | Action |
|---|---|
| ITMS-91053 "Missing API declaration" with a category name | Add that `NSPrivacyAccessedAPIType` + approved reason to the app manifest (`references/rules/privacy/privacy_manifest.md`) |
| ITMS-91061 "Missing privacy manifest" naming an SDK | Update the SDK/plugin to a version with a bundled manifest; do not paste SDK practices into the app manifest |
| ITMS-90683 "Missing purpose string" | Add the named key with a specific purpose string |
| Guideline 4.2 rejection on a wrapper app | Treat as top severity; list concrete native features and UX gaps; never answer with reviewer notes alone |
| Guideline 4.8 | Add Sign in with Apple (`@capgo/capacitor-social-login` supports `apple`) or an equivalent option meeting 4.8 criteria |
| Guideline 5.1.1(v) | Add in-app account deletion (not just a support email) |
| Metadata unavailable and `asc` missing | Continue with code audit; mark metadata checks partial |
| Third-party SDKs suggest required-reason APIs | Inspect each SDK's bundled manifest before assuming compliance |
