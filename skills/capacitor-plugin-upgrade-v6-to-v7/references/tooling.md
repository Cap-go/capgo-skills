# Plugin JS tooling updates for Capacitor 7

Source: https://capacitorjs.com/docs/updating/plugins/7-0. Only update the tools the plugin actually uses.

| Package | Version |
| --- | --- |
| `@capacitor/cli`, `@capacitor/core`, `@capacitor/android`, `@capacitor/ios` (devDependencies) | `^7.0.0` |
| `@capacitor/core` (peerDependencies) | `>=7.0.0` |
| `@ionic/eslint-config` | `^0.4.0` |
| `eslint` | `^8.57.0` |
| `@ionic/swiftlint-config`, `swiftlint` | `^2.0.0` |
| `@ionic/prettier-config` | `^4.0.0` |
| `prettier` | `^3.4.2` |
| `prettier-plugin-java` | `^2.6.6` |
| `rollup` | `^4.30.1` |
| `rimraf` | `^6.0.1` |
| `@capacitor/docgen` | `^0.3.0` |

## Prettier 3

```diff
-    "prettier": "prettier \"**/*.{css,html,ts,js,java}\"",
+    "prettier": "prettier \"**/*.{css,html,ts,js,java}\" --plugin=prettier-plugin-java",
```

Prettier 3 respects `.gitignore`. Drop `.prettierignore` entries already in `.gitignore`; delete the file if nothing is left.

## Rollup 4

Rename `rollup.config.js` to `rollup.config.mjs`, then:

```diff
-    "build": "npm run clean && npm run docgen && tsc && rollup -c rollup.config.js",
+    "build": "npm run clean && npm run docgen && tsc && rollup -c rollup.config.mjs",
```
