# Ionic 8 -> 9 Migration

Load when upgrading `@ionic/*` to 9.x. Source: Ionic `BREAKING.md` (Version 9.x).

## Procedure

1. Confirm prerequisites: Capacitor 7+ (`capacitor-app-upgrades` if lower), and framework minimums below. Upgrade the framework/router first in a separate commit.
2. Preview automated fixes: `npx @ionic/migrate` (preview / CI-check modes available; read `--help`). It rewrites many changes (e.g. Angular import paths) and reports manual steps, but does not rewrite React `useIonModal` / `useIonPopover` prop typing errors.
3. Report the list to the user, then apply.
4. `npm i @ionic/<framework>@latest @ionic/core@latest ionicons@latest` (plus `@ionic/react-router` for React).
5. Fix manual items below, run `npx tsc --noEmit`, build, test on devices.

## Minimums

| Area | Ionic 9 requires |
|------|------------------|
| Native | Capacitor 7+ (Capacitor 2 apps are detected as web) |
| Browsers | Chrome/Edge 89+, Safari 16+, Firefox 75+; iOS 16+, Android 5.1+ with Chromium 89+ |
| Angular | 18-22, TypeScript 5.4+ (Angular 21: 5.9+, Angular 22: 6.0+) |
| React | 18 or 19, React Router 6.4+ |
| Vue | 3.5+, vue-router 5 |

## Package exports

`@ionic/core` now has an `exports` map. Deep imports fail under Node ESM, webpack 5, or TS `bundler`/`node16`/`nodenext` resolution. Allowed: `@ionic/core`, `@ionic/core/components`, `@ionic/core/components/ion-*.js`, `@ionic/core/loader`, `@ionic/core/hydrate`, `@ionic/core/css/*.css`.

## Components

| Component | Change | Action |
|-----------|--------|--------|
| `ion-input`, `ion-searchbar` | `autocorrect` is boolean, default `false`; `autocorrect="off"` now enables it | Remove attribute or bind boolean |
| `ion-input`, `ion-select`, `ion-textarea` | Floating label floats only on focus/value; internal DOM restructured | Update CSS selectors to parts/variables |
| `ion-textarea` (MD) | Min height 72px regardless of `rows` | Custom class with higher specificity if needed |
| `ion-picker-legacy`, `pickerController`, `useIonPicker` | Removed | `IonPicker` / `IonPickerColumn` or `IonDatetime` |
| `ion-modal` | `handleBehavior` default `cycle` | `handle-behavior="none"` to keep old |
| `ion-nav` | No `ion-router` integration, no URL updates, `updateURL` removed | Use `ion-router-outlet` for routed stacks |
| `ion-router-outlet` | New `swipeGesture` prop; React/Vue read `swipeBackEnabled` only at mount | Toggle `swipeGesture` at runtime |
| `ion-select` | `ionChange` only on real change; action sheet no `selected` role | Use `ionDismiss` for dismissal |

## Angular

- Standalone component imports: `@ionic/angular/standalone` -> `@ionic/angular`. Lazy-loaded (NgModule) imports: `@ionic/angular` -> `@ionic/angular/lazy`.
- `IonicModule.forRoot()` deprecated -> `provideIonicAngular()` in `providers`.
- Angular 21: zoneless by default. Use signals / `markForCheck()`, or add `provideZoneChangeDetection()` + `zone.js` polyfill.
- Angular 22: default `OnPush`; run `ng update`.
- Use `moduleResolution: "bundler"`; drop `~` from CSS `@import` paths.

## React (React Router 6)

- `<Route component={X}>` / `render` -> `<Route element={<X />}>`; `Redirect`/`IonRedirect` -> `<Navigate>`; `exact` removed; nested routes need `/*`.
- `useHistory` -> `useNavigate` / `useIonRouter`; `RouteComponentProps` -> `useParams`, `useLocation`.
- `history` prop removed from `IonReactRouter` / `IonReactHashRouter` / `IonReactMemoryRouter` (memory: `initialEntries`).
- `useIonModal` / `useIonPopover` type-check `componentProps` against the component.

## Vue

- vue-router 5, vue 3.5. Navigation guards calling `next()` warn; return values instead.

## Verify

```bash
grep -rn "ion-picker-legacy\|pickerController\|useIonPicker\|IonRedirect\|useHistory\|@ionic/angular/standalone\|IonicModule.forRoot" src/
npx tsc --noEmit
npm run build && npx cap sync
```

Then device-test forms (labels, autocorrect), selects, sheet modals, swipe-back, and tab navigation.
