---
name: capgo-organization-management
description: Guides Capgo account lookup and organization administration with the CLI, including `account whoami`, `organization list/add/members/set/delete`, 2FA enforcement, password policy, API-key expiration and hashed-key policy, and apps per organization. Use when listing or creating Capgo organizations, auditing members' 2FA before enforcing it, tightening org security settings, or resolving "Access Denied: Two-Factor Authentication Required" or "Insufficient permissions". Do not use for OTA bundle or channel work (capgo-release-management), native builds (capgo-native-builds), or app-side updater code (capgo-live-updates).
---

# Capgo Organization Management

Administer Capgo accounts and organizations safely from the CLI.

Facts below were checked against `@capgo/cli` 8.77 (October 2026). All commands accept `-a, --apikey`.

## When to Use

TRIGGER when:

- The user needs their Capgo account ID or email for support (`account whoami`).
- The user lists, creates, renames, or deletes organizations.
- The user audits members or 2FA status, or enforces 2FA, a password policy, API-key expiration, or hashed API keys.
- The user needs to know which org owns an app (`app list --show-org --show-org-id`).
- A command fails with an org-level 2FA or permission error.

Do not use when:

- The work is bundles, channels, or rollouts. Use `capgo-release-management`.
- The user needs native cloud builds. Use `capgo-native-builds`.
- The user wants an agent connected to the Capgo account (MCP). Use `capgo-cli-usage`.

## Command Map

| Goal | Command (`npx @capgo/cli@latest ...`) |
| --- | --- |
| Who am I | `account whoami` (alias `account id`) |
| List orgs | `organization list` |
| Create org | `organization add --name "My Company" --email admin@example.com` |
| Members + 2FA status | `organization members ORG_ID` (2FA status needs `super_admin`) |
| Rename / change email | `organization set ORG_ID --name "New Name" --email ops@example.com` |
| Enforce 2FA | `organization set ORG_ID --enforce-2fa` (`--no-enforce-2fa` to undo) |
| Password policy | `organization set ORG_ID --password-policy --min-length 12 --require-uppercase --require-number --require-special` |
| API-key expiration | `organization set ORG_ID --require-apikey-expiration --max-apikey-expiration-days 90` (1 to 365) |
| Hashed API keys | `organization set ORG_ID --enforce-hashed-api-keys` |
| Apps per org | `app list --show-org --show-org-id` or `app list --filter-by-org-id ORG_ID --output-text` |
| Delete org | `organization delete ORG_ID` (owner only, irreversible) |

Use `organization`. The `organisation` spelling is deprecated and will be removed.

## Procedure

### 1. Identify scope and role

```bash
npx @capgo/cli@latest account whoami
npx @capgo/cli@latest organization list
```

Confirm the target `ORG_ID`. Security settings need the `super_admin` role. Deleting an org needs the owner.

### 2. Inspect before enforcing

```bash
npx @capgo/cli@latest organization members ORG_ID
```

List the members without 2FA, then **report to the user before enforcing**. Enforcing 2FA locks those members out of CLI and API access until they enable it.

### 3. Change one policy at a time

Apply one `organization set` change, verify it, then move to the next. Keep at least one admin with working 2FA and a valid key so the org is never locked out.

### 4. API-key policy side effects

- `--require-apikey-expiration` / `--max-apikey-expiration-days` affects new keys. The keys the hosted MCP creates for OAuth (`MCP · <client>`) already expire after at most 90 days, and a stricter org limit wins.
- `--enforce-hashed-api-keys` means a key is shown only once at creation. Existing CI secrets keep working, but a lost key must be recreated.

## Traps

- `organization delete` cannot be undone, and only owners can run it. Run `app list --filter-by-org-id ORG_ID` first so the user sees what lives in that org, then get explicit confirmation with the org name.
- `organization members` needs `super_admin` to show 2FA status. Lower roles see partial data.
- Do not ask users to paste API keys into chat for admin work. Have them run `npx @capgo/cli@latest login`, or set `CAPGO_TOKEN` in their shell.

## Verification

1. Run `organization list` again. The name and email changes show up.
2. Run `organization members ORG_ID` again after enforcement. Every remaining member shows 2FA enabled.
3. Run a read-only command with a non-admin member's key (for example `app list`). It should succeed after they enable 2FA.

## Error Handling

| String | Fix |
| --- | --- |
| `🔐 Access Denied: Two-Factor Authentication Required` / `This organization requires all members to have 2FA enabled.` | Enable 2FA at https://console.capgo.app (account settings), then retry. Docs: https://capgo.app/docs/webapp/2fa-enforcement/ |
| `Insufficient permissions for <key>` | The acting user or key lacks the role. Security settings need `super_admin`, delete needs the owner |
| `No organizations available` | The key's user has no org yet. Create one with `organization add` |
| `No Capgo API key found. Run ... first, then retry this command.` | `npx @capgo/cli@latest login`, set `CAPGO_TOKEN`, or pass `-a` |

## Resources

- Organization reference: https://capgo.app/docs/cli/reference/organization/
- Account reference: https://capgo.app/docs/cli/reference/account/
- 2FA enforcement: https://capgo.app/docs/webapp/2fa-enforcement/
