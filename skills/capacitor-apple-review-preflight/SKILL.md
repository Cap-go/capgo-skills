---
name: capacitor-apple-review-preflight
description: Guides the agent through an Apple App Store preflight review for Capacitor apps before submission or after rejection. Covers guideline checklist selection, App Store metadata review, Capacitor and iOS project inspection, privacy manifests, Sign in with Apple, entitlements, and common rejection patterns. Do not use for Google Play review, generic store publishing only, or non-Apple mobile runtimes.
---

# Capacitor Apple Review Preflight

Run a pre-submission or post-rejection Apple review audit for a Capacitor app.

This skill adapts the Apple guideline and rejection-rule corpus from [truongduy2611/app-store-preflight-skills](https://github.com/truongduy2611/app-store-preflight-skills) and narrows the workflow to Capacitor-specific project inspection.

## When to Use This Skill

- User wants an Apple App Store review preflight for a Capacitor app
- User received an Apple rejection and wants the project audited against likely guideline failures
- User wants to check metadata, entitlements, privacy manifests, Sign in with Apple, subscriptions, or minimum functionality before submission
- User wants reviewer-notes guidance for a Capacitor iOS submission

## Live Project Snapshot

Detected Capacitor, auth, subscription, analytics, and privacy-related packages:
!`node -e "const fs=require('fs');if(!fs.existsSync('package.json'))process.exit(0);const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));const sections=['dependencies','devDependencies'];const out=[];for(const section of sections){for(const [name,version] of Object.entries(pkg[section]||{})){if(name.startsWith('@capacitor/')||name.startsWith('@capgo/')||name.includes('firebase')||name.includes('sentry')||name.includes('revenuecat')||name.includes('purchase')||name.includes('subscription')||name.includes('auth')||name.includes('analytics')||name.includes('segment')||name.includes('amplitude')||name.includes('mixpanel'))out.push(section+'.'+name+'='+version)}}console.log(out.sort().join('\n'))"`

Relevant Apple review file paths:
!`find . -maxdepth 6 \( -name 'package.json' -o -name 'capacitor.config.json' -o -name 'capacitor.config.ts' -o -name 'capacitor.config.js' -o -name 'Info.plist' -o -name '*.entitlements' -o -name 'PrivacyInfo.xcprivacy' -o -name 'project.pbxproj' -o -path './ios' -o -path './fastlane/metadata' -o -path './metadata' \)`

## Procedure

### Step 1: Confirm This Is the Right Review Scope

Use this skill for Apple-facing review work, not for generic publishing.

If the task is mostly about screenshots, release setup, or store upload mechanics, combine this skill with `capacitor-app-store`.

### Step 2: Identify App Type and Load the Right Checklist

Always read:

- `references/guidelines/by-app-type/all_apps.md`

Then add the checklist that matches the app:

- `subscription_iap.md` for subscriptions or IAP
- `social_ugc.md` for UGC or moderation-heavy apps
- `kids.md` for Kids Category
- `health_fitness.md` for health, fitness, or medical claims
- `games.md` for games
- `ai_apps.md` for AI or LLM features
- `crypto_finance.md` for crypto, trading, or financial workflows
- `vpn.md` for VPN and networking apps
- `macos.md` only when the submission also targets macOS

Use `references/guidelines/README.md` for the full guideline index when a rejection cites a specific section.

### Step 3: Inspect Capacitor and iOS Project State

Start from the injected snapshot above, then inspect:

- `package.json` for Capacitor, auth, analytics, subscription, and SDK dependencies
- `capacitor.config.*` for app identifiers, app name, web asset config, and live update settings
- `ios/App/App/Info.plist` or the project-specific `Info.plist`
- any `*.entitlements` files
- `PrivacyInfo.xcprivacy` if present
- `fastlane/metadata` or other local metadata directories if they exist

Pay special attention to Capacitor-specific Apple review risks:

- social login providers without a Sign in with Apple path when required
- heavy WebView-only apps that may trigger 4.2 minimum functionality concerns
- third-party SDKs that imply Required Reason API declarations or privacy disclosures
- native capabilities enabled in Xcode but not justified by shipped functionality
- Capgo, Appflow, or other live-update flows that need clear reviewer notes and compliance boundaries
- missing or vague usage strings for camera, photo library, microphone, location, notifications, Face ID, tracking, or local network access

### Step 4: Run Rule-Based Review Passes

Use the upstream rule files as the source of truth:

- metadata: `references/rules/metadata/*.md`
- subscription: `references/rules/subscription/*.md`
- privacy: `references/rules/privacy/*.md`
- design: `references/rules/design/*.md`
- entitlements: `references/rules/entitlements/*.md`

Map them onto the Capacitor app:

- metadata rules against App Store text, screenshots, preview videos, and review notes
- privacy rules against `Info.plist`, privacy manifests, SDK usage, and data collection flows
- design rules against app navigation, native value, login flows, and reviewer accessibility
- entitlements rules against enabled capabilities in the iOS project

If App Store metadata is not stored locally and `asc` is available, pull it with `asc metadata pull --output-dir ./metadata`. If not, audit local metadata sources and state what remains unverified.

### Step 5: Produce a Capacitor-Focused Preflight Report

Use this format:

```markdown
## Apple Review Preflight

### Rejections Found
- [GUIDELINE X.X.X] Issue summary
  - Evidence: file or metadata location
  - Why it matters for this Capacitor app
  - Fix: exact remediation

### Warnings
- [GUIDELINE X.X.X] Potential issue

### Passed
- [Category] Checks that looked clean

### Missing Inputs
- Metadata or review assets that were not available locally
```

Order findings by severity and make each fix concrete.

### Step 6: Suggest Reviewer Notes and Submission Follow-Ups

When relevant, draft reviewer notes for:

- demo accounts or test credentials
- hidden or non-obvious features
- hardware dependencies
- subscription test flows
- AI moderation or content controls
- live-update behavior and what code can change post-review
- reasons for special entitlements or network behavior

## Error Handling

- If app metadata is unavailable locally and `asc` is not configured, continue with the code and project audit and clearly mark metadata checks as partial.
- If the app is mostly a thin web wrapper, call out guideline 4.2 risk directly rather than burying it in warnings.
- If social login is present, verify whether guideline 4.8 requires Sign in with Apple before concluding the auth flow is review-safe.
- If third-party SDKs suggest Required Reason API usage, inspect `PrivacyInfo.xcprivacy` before assuming privacy compliance.
- If the user is asking how to fix a specific rejection, prioritize the cited guideline and only then expand to adjacent risks.
