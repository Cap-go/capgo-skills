# Capgo Security Scanner (`@capgo/capgo-sec`)

Local, zero-config static scanner for Capacitor and Ionic projects. Code is not uploaded. Package `@capgo/capgo-sec` (formerly `@capgo/capacitor-sec`), binary `capsec`, Node 18+. Source: https://github.com/Cap-go/capgo-sec

## Commands

```bash
# One-off (no install). `npx capsec` fails: there is no `capsec` package on npm.
npx @capgo/capgo-sec@latest scan
npx @capgo/capgo-sec@latest scan ./apps/mobile

# Installed as a dev dependency, the `capsec` binary is available
npm install -D @capgo/capgo-sec
npx capsec scan
```

`scan` flags (verified against v1.2.0 source):

| Flag | Values | Default |
|------|--------|---------|
| `-o, --output <format>` | `cli`, `json`, `html` | `cli` |
| `-f, --output-file <file>` | path | stdout |
| `-s, --severity <level>` | `critical`, `high`, `medium`, `low`, `info` (minimum reported) | `low` |
| `-c, --categories <list>` | comma-separated: `secrets,storage,network,capacitor,android,ios,authentication,webview,cryptography,logging,debug` | all |
| `-e, --exclude <globs>` | comma-separated extra excludes | none |
| `--ci` | exit code 1 when any high/critical finding exists | off |
| `-v, --verbose` | verbose output | off |

Other commands:

```bash
npx @capgo/capgo-sec@latest rules                      # list every rule
npx @capgo/capgo-sec@latest rules --category android
npx @capgo/capgo-sec@latest rules --severity critical
npx @capgo/capgo-sec@latest init                       # writes capsec.config.json
```

Trap: in v1.2.0, `init` writes `capsec.config.json` but `scan` does not read it. Pass `--severity`, `--categories`, and `--exclude` explicitly in scripts and CI. Check `capsec scan --help` on newer versions before relying on the config file.

## Reports

```bash
npx @capgo/capgo-sec@latest scan --output json --output-file capsec-report.json
npx @capgo/capgo-sec@latest scan --output html --output-file capsec-report.html
```

## Rule IDs

Use `capsec rules` for the authoritative list on the installed version. As of v1.2.0:

| Prefix | Area | Notable rules |
|--------|------|---------------|
| SEC | Secrets | SEC001 hardcoded API keys (40+ patterns: AWS, Google, Firebase, Stripe, OpenAI, Anthropic, GitHub, Supabase service key...), SEC002 exposed `.env` |
| STO | Storage | STO001 sensitive data in Preferences, STO002 localStorage, STO003 unencrypted SQLite, STO006 Keychain/Keystore not used |
| NET | Network | NET001 HTTP cleartext, NET002 no pinning, NET003 `server.cleartext`, NET004 `ws://`, NET006 deep link validation, NET008 secrets in URL params |
| CAP | Capacitor config | CAP001 WebView debug enabled, CAP004 insecure `allowNavigation`, CAP005 native bridge exposure, CAP006 `eval`, CAP009 live update security, CAP010 `postMessage` handler, CAP011 insecure `server.url` |
| AND | Android | AND001 cleartext, AND002 debuggable, AND004 `allowBackup`, AND005 exported components, AND007 `addJavascriptInterface`, AND008 hardcoded signing key, AND009 file URL access, AND010 NSC cleartext |
| IOS | iOS | IOS001 ATS disabled, IOS002 keychain accessibility, IOS003 URL scheme validation, IOS005 entitlements, IOS008 screenshots, IOS009 `UIFileSharingEnabled` |
| AUTH | Auth | AUTH001 JWT not verified, AUTH002 biometric-only auth, AUTH003 `Math.random` for tokens, AUTH005 OAuth state, AUTH007 PKCE missing |
| WEB | WebView | WEB001/WEB006 HTML/script injection, WEB002 iframes, WEB003 external scripts, WEB004 CSP missing |
| CRY | Crypto | CRY001 MD5/SHA-1/DES/RC4/ECB, CRY002 hardcoded key, CRY003 static IV, CRY004 weak password hashing |
| LOG / DBG | Logging, debug | LOG001 sensitive data in logs, DBG001 `debugger`, DBG002 test credentials, DBG003 dev URLs |

## Triage guidance

- Static rules produce false positives (for example AUTH001 on server-side code in a monorepo, STO001 on non-sensitive keys). Confirm each Critical/High by reading the code before changing it.
- A finding in `node_modules` or generated `android/app/src/main/assets/public` is usually a symptom: fix the source in `src/` or the config, then rebuild and `npx cap sync`.
- CAP007 / IOS007 (missing root/jailbreak detection) are policy decisions. Ask the user whether the app's risk profile needs them.
- NET002 (no pinning) is a recommendation for apps handling payments, health, or banking data. Pinning has operational cost; confirm with the user.

## CI

GitHub Actions:

```yaml
name: Security scan
on: [push, pull_request]
jobs:
  capsec:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 24
      - run: npx @capgo/capgo-sec@latest scan --ci --output json --output-file capsec-report.json
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: capsec-report
          path: capsec-report.json
```

GitLab CI:

```yaml
capsec:
  image: node:24
  script:
    - npx @capgo/capgo-sec@latest scan --ci --output json --output-file capsec-report.json
  artifacts:
    when: always
    paths:
      - capsec-report.json
```

Pin a version (`@capgo/capgo-sec@1.2.0`) instead of `@latest` if new rules should not break CI unexpectedly. For broader pipeline design, use `capacitor-ci-cd`.
