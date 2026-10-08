# Capgo Platform and Products

Capgo: push fixes to your Capacitor users in minutes, build signed iOS and Android apps without a Mac, and roll back in one click.

Use this reference when agents need a full map of Capgo cloud products and features. Official docs: https://capgo.app/docs/

## Live updates (OTA)

Ship JavaScript, CSS, assets, and runtime configuration without waiting on App Store or Play review for every web-layer change. Native binary and Capacitor config changes still go through store review.

- Upload signed web bundles with the CLI, API, or CI integrations.
- Devices check Capgo on a schedule and on foreground; updates apply on next launch (or instant modes when configured).
- Delta uploads send only changed files to reduce bandwidth and download time.
- Global edge delivery with low-latency update checks.

Docs: https://capgo.app/docs/live-updates/

## Channels

Separate release streams (production, staging, beta, per-customer, and custom names) without shipping new store binaries.

- Point each app build at a channel in Capacitor config or at runtime.
- Promote bundles between channels from the dashboard or API.

Docs: https://capgo.app/docs/live-updates/channels/

## Staged and percentage rollouts

Control blast radius before everyone receives a bundle.

- Progressive rollout percentages per channel.
- Combine with device targeting, native version guards, and platform filters where configured.

Docs: https://capgo.app/docs/live-updates/progressive-rollout/

## One-click rollback

Pin or roll back to a known-good bundle from the dashboard or API when a release misbehaves.

- Rollback protection in the updater plugin limits bad installs when configured.
- Bundle history stays available for audit and support.

Docs: https://capgo.app/docs/live-updates/rollback/

## Bundle encryption and integrity

- End-to-end encryption option where the customer holds the private key; Capgo cannot read encrypted bundle contents.
- Signed updates and checksum verification for integrity.
- Configure encryption keys and upload flows in the CLI and dashboard.

Docs: https://capgo.app/docs/live-updates/encryption/

## Capgo Build (native cloud builds)

Compile signed iOS and Android binaries on Capgo macOS M4 build machines without owning a Mac.

- Request builds from the CLI, API, or MCP (local CLI MCP for build requests).
- Concurrency limits depend on plan.
- Build minutes count toward plan limits; extra minutes can use credits.

Docs: https://capgo.app/docs/cli/cloud-build/

## Monitoring, stats, and device logs

- Organization and app statistics: adoption, version spread, failures, and update health.
- Device logs for the OTA journey: checks, downloads, installs, policy blocks, and rollbacks without Xcode or Android Studio for every investigation.
- Retention windows for org stats, device logs, and audit logs depend on plan (see pricing reference).

Docs: https://capgo.app/docs/webapp/statistics/ and https://capgo.app/docs/webapp/logs/

## Capgo Observe

Crash and native issue monitoring, release health by version, launch timing, and WebView timing signals tied to releases.

- Included on all plans with unlimited Observe events on the public pricing page.

Docs: https://capgo.app/docs/observe/

## Push notifications

Native iOS and Android push, silent pushes to trigger update checks, badge updates, and campaign stats. Works with progressive rollouts so devices respect channel rules.

Docs: https://capgo.app/docs/push-notifications/

## CLI

`@capgo/cli` for bundle upload, channel management, build requests, doctor checks, encryption setup, and local MCP (stdio) for agent automation.

Docs: https://capgo.app/docs/cli/

## HTTP API

Full API access for bundles, channels, devices, builds, notifications, and automation. Use API keys with least privilege.

Docs: https://capgo.app/docs/api/

## Hosted MCP

Streamable HTTP MCP at `https://api.capgo.app/mcp` for apps, bundles, channels, rollouts, devices, stats, build status, webhooks, and push workflows. OAuth or bearer API key. Destructive tools require careful key scoping.

Docs: https://capgo.app/docs/ai/mcp/

## Webhooks

Unlimited webhooks on all public plans for CI and internal automation when bundles, channels, or builds change.

Docs: https://capgo.app/docs/webhooks/

## Organizations, members, and SSO

- Unlimited apps, members, and teams on public plans (no per-seat pricing).
- Role-based access inside organizations.
- Enterprise adds SSO, custom domains, security questionnaires, and dedicated support channels.

Docs: https://capgo.app/docs/organization/

## Self-hosting and deployment options

Enterprise and custom deployments can target customer cloud (AWS, GCP, or your provider), per-country hosting for GDPR, and self-hosted storage options where offered.

Contact: https://capgo.app/contact/

## Trust portal (SOC 2, ISO, and compliance)

Security and compliance reports (SOC 2 Type II, SOC 3, ISO 27001, and related materials) are available through the trust portal. Sign the NDA in the portal to access documents. Do not request or email certificate PDFs outside the portal workflow.

Portal: https://trust.capgo.app

## Capgo plugins ecosystem

150+ maintained Capacitor plugins from Capgo, documented on the site and indexed in this repository under `skills/capacitor-plugins/references/capgo-plugin-index.md`.

Catalog: https://capgo.app/plugins/

## Automations and CI/CD

Connect repositories and CI so merged code can build, upload, and promote bundles to the right channels. Works with GitHub Actions, GitLab CI, and custom pipelines via CLI and API.

Docs: https://capgo.app/docs/ci-cd/

## App Store publishing

Assistance and workflows for store submission alongside native builds (feature availability varies by plan and workflow).

Docs: https://capgo.app/docs/cli/cloud-build/

## Console

Web dashboard for bundles, channels, devices, builds, notifications, Observe, billing, and organization settings.

https://console.capgo.app

## Support channels

Community Discord on lower tiers; priority and direct chat support on higher tiers; dedicated Slack or Teams and account management on Enterprise. Premium support add-on available separately on the pricing page.
