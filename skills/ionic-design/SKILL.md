---
name: ionic-design
description: Builds and reviews Ionic Framework UI in Capacitor apps (Ionic 9 current, Ionic 8 still common) - page structure (`ion-header`/`ion-content`/`ion-footer`), lists, modern form syntax (`label`/`labelPlacement` on `ion-input`/`ion-select`), sheet modals, tabs + `ion-router-outlet`, CSS variable theming, dark palettes (`palettes/dark.system.css`, `.ion-palette-dark`), iOS vs MD mode, and Ionic 8 -> 9 breaking changes (React Router 6, Vue Router 5, Angular 18-22 zoneless, removed `ion-picker-legacy`, boolean `autocorrect`, `npx @ionic/migrate`). Use when writing Ionic components, theming an Ionic app, fixing platform-mode styling, or upgrading @ionic/react, @ionic/vue, @ionic/angular. Do not use for Konsta UI (konsta-ui), Tailwind setup (tailwind-capacitor), raw safe-area CSS (safe-area-handling), keyboard resize (capacitor-keyboard), or Ionic Appflow/Enterprise migrations (ionic-appflow-migration, ionic-enterprise-sdk-migration).
---

# Ionic Framework Design

## When to Use

TRIGGER when:
- Writing or reviewing `Ion*` / `ion-*` components in a Capacitor app
- Theming: `--ion-color-*`, dark mode, high contrast, per-platform styles
- iOS vs Material Design mode looks wrong, or `mode` overrides misbehave
- Upgrading Ionic 7/8 -> 9, or errors after `npm i @ionic/*@latest`
- Choosing Ionic vs another UI kit for a new Capacitor app

Do not use:
- Konsta UI components: `konsta-ui`
- Tailwind v4 install / config: `tailwind-capacitor`
- Notch / system bar padding outside Ionic: `safe-area-handling`
- Keyboard covering inputs: `capacitor-keyboard` (Ionic apps use `resize: 'ionic'`)
- Leaving Appflow / Ionic Enterprise plugins: `ionic-appflow-migration`, `ionic-enterprise-sdk-migration`

## Versions (October 2026)

| Package | Current | Notes |
|---------|---------|-------|
| `@ionic/core`, `@ionic/react`, `@ionic/vue`, `@ionic/angular` | 9.x (`latest`) | 8.x on `v8-lts` tag |
| `ionicons` | 8.x | |
| Ionic 9 minimums | Capacitor 7+, iOS 16+, Android Chromium 89+, Angular 18-22, React 18/19 + React Router 6.4+, Vue 3.5 + vue-router 5, TypeScript 5.4+ | |

Check installed versions first: `npm ls @ionic/core @ionic/react @ionic/vue @ionic/angular`. Write code for the installed major; do not mix v8 and v9 APIs.

## Workflow

1. **Inspect** framework, Ionic major, router version, global CSS imports, `setupIonicReact` / `IonicVue` / `provideIonicAngular` config, `capacitor.config` `Keyboard.resize`.
2. **Upgrading?** Load [references/ionic-9-migration.md](references/ionic-9-migration.md); run `npx @ionic/migrate` in preview first, report findings, then apply.
3. **Components**: [references/components.md](references/components.md) for page shell, lists, forms, overlays, tabs.
4. **Theming**: [references/theming.md](references/theming.md) for colors, dark/high-contrast palettes, mode-specific CSS, shadow parts.
5. **Verify** in both modes and on devices (below).

Only load a reference when its topic is in play.

## Rules that prevent most Ionic bugs

- Every routed page = `IonPage` > `IonHeader` + `IonContent` (+ optional `IonFooter`). Missing `IonPage` breaks transitions and lifecycle hooks.
- Scroll lives in `ion-content`. Do not make `body` or a wrapper `div` scroll; use `IonContent` `scrollToTop()`/`getScrollElement()`.
- Use `ion-router-outlet` (`IonRouterOutlet`, `IonTabs`) for URL routing. In Ionic 9 `ion-nav` no longer integrates with `ion-router`; keep it for local URL-less stacks inside a page.
- Safe areas are handled through `--ion-safe-area-top|right|bottom|left` (default `env()`); do not add body padding on top. Requires `viewport-fit=cover`.
- Forms: put `label` + `labelPlacement` on the control itself (`<IonInput label="Email" labelPlacement="floating" />`). Legacy `<IonItem><IonLabel/><IonInput/></IonItem>` labeling was removed in Ionic 8.
- Overlays: prefer inline `<IonModal isOpen>` / `trigger` or hooks (`useIonModal`, `modalController`) consistently; always handle `didDismiss` to reset state.
- Platform: style via `.ios` / `.md` classes on `html` or `mode` CSS selectors; use `isPlatform('ios')` only for behavior, never `navigator.userAgent`.
- Icons: import only used icons (`import { heart } from 'ionicons/icons'`) and pass `icon={heart}`; string names need `addIcons` registration in standalone/bundled builds.

## Verification

1. Build and sync: `npm run build && npx cap sync`.
2. Run both modes in the browser: append `?ionic:mode=ios` and `?ionic:mode=md` to the dev URL; check headers, toolbars, lists, buttons.
3. Toggle OS dark mode (or add `ion-palette-dark` to `<html>` if using the class palette); check contrast of custom colors.
4. Device check: iPhone with Dynamic Island + Android 15/16 gesture nav for header/tab bar insets; open keyboard on a form page.
5. After upgrade: `grep -rn "ion-picker-legacy\|pickerController\|useIonPicker\|@ionic/angular/standalone\|autocorrect=\"off\"" src/` returns nothing; `npx tsc --noEmit` passes.

## Error Handling

| Error / symptom | Cause | Fix |
|-----------------|-------|-----|
| `Package path ./dist/... is not exported from package` (webpack) / `ERR_PACKAGE_PATH_NOT_EXPORTED` (Node) for `@ionic/core` | Ionic 9 `exports` map; deep import | Import from `@ionic/core`, `@ionic/core/components`, `@ionic/core/components/ion-*.js`, `@ionic/core/loader`, `@ionic/core/css/*.css` |
| Import errors or migrate warnings for `@ionic/angular/standalone` (Ionic 9) | Standalone imports moved | Import from `@ionic/angular`; lazy APIs from `@ionic/angular/lazy` |
| React: `Property 'component' does not exist` on `Route` / `IonRoute` | Ionic 9 requires React Router 6 | `element={<Page />}`, `Navigate` instead of `Redirect`, `useNavigate` instead of `useHistory` |
| Autocorrect turned ON after upgrade | `autocorrect="off"` string is truthy in Ionic 9 | Remove the attribute or bind `false` |
| `ionChange` no longer fires on re-selecting same option | Ionic 9 fires only on value change | Use `ionDismiss` for dismissal |
| Sheet modal handle now focusable / cycles breakpoints | Ionic 9 `handleBehavior` default `cycle` | `handle-behavior="none"` to restore |
| Styles missing, components unstyled | Core CSS not imported | Import `@ionic/<fw>/css/core.css` (+ structure/typography) once at entry |
| Dark mode never activates | No palette imported | Import `css/palettes/dark.system.css` (or `.class.css` + `ion-palette-dark` class) |
| Angular 21 view not updating after async work | Zoneless default in Ionic 9 + Angular 21 | Use signals / `markForCheck()`, or add `provideZoneChangeDetection()` |

## Resources

- Ionic docs: https://ionicframework.com/docs
- Ionic 9 breaking changes: https://github.com/ionic-team/ionic-framework/blob/main/BREAKING.md
- Theming: https://ionicframework.com/docs/theming/basics
- Dark mode: https://ionicframework.com/docs/theming/dark-mode
