# Ionic Component Patterns

Load when writing pages, lists, forms, overlays, or tabs. Examples use React (Ionic 9 + React Router 6); Vue/Angular use the same components with `ion-*` tags or framework wrappers.

## App entry (React)

```tsx
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Route, Navigate } from 'react-router-dom';

import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/palettes/dark.system.css'; // optional dark mode
import './theme/variables.css';

setupIonicReact(); // optional config: { mode: 'ios' } forces one mode everywhere

export default function App() {
  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
          <Route path="/home" element={<Home />} />
          <Route path="/" element={<Navigate to="/home" replace />} />
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
}
```

Vue: `app.use(IonicVue)` + `@ionic/vue/css/*`. Angular (Ionic 9): `providers: [provideIonicAngular({})]`, components imported from `@ionic/angular`, CSS `@import '@ionic/angular/css/core.css';` (no `~`).

## Page shell

```tsx
<IonPage>
  <IonHeader translucent>
    <IonToolbar>
      <IonButtons slot="start"><IonBackButton defaultHref="/home" /></IonButtons>
      <IonTitle>Settings</IonTitle>
    </IonToolbar>
  </IonHeader>
  <IonContent fullscreen>
    <IonHeader collapse="condense">
      <IonToolbar><IonTitle size="large">Settings</IonTitle></IonToolbar>
    </IonHeader>
    {/* content */}
  </IonContent>
</IonPage>
```

`translucent` + `fullscreen` + condensed header = iOS large-title pattern; MD ignores the condense header.

## Lists

```tsx
<IonList inset>
  <IonItem button detail routerLink="/profile">
    <IonIcon icon={personOutline} slot="start" aria-hidden="true" />
    <IonLabel>
      <h2>Profile</h2>
      <p>Name, photo</p>
    </IonLabel>
  </IonItem>
  <IonItemSliding>
    <IonItem><IonLabel>Swipe me</IonLabel></IonItem>
    <IonItemOptions side="end">
      <IonItemOption color="danger" onClick={remove}>Delete</IonItemOption>
    </IonItemOptions>
  </IonItemSliding>
</IonList>
```

Long lists: virtualize with a library (e.g. `@tanstack/react-virtual`, `vue-virtual-scroller`) using `IonContent`'s scroll element; `ion-virtual-scroll` was removed in Ionic 6. Infinite loading: `IonInfiniteScroll` + call `complete()` on the event target.

## Forms (modern syntax, required since Ionic 8)

```tsx
<IonList>
  <IonItem>
    <IonInput label="Email" labelPlacement="floating" type="email"
      autocomplete="email" inputmode="email" errorText="Invalid email" />
  </IonItem>
  <IonItem>
    <IonSelect label="Country" labelPlacement="stacked" interface="action-sheet">
      <IonSelectOption value="fr">France</IonSelectOption>
    </IonSelect>
  </IonItem>
  <IonItem>
    <IonToggle checked={on} onIonChange={(e) => setOn(e.detail.checked)}>Notifications</IonToggle>
  </IonItem>
</IonList>
```

- Validation styling: add `ion-touched` and `ion-invalid` / `ion-valid` classes (framework form libs can toggle them); `errorText` / `helperText` show below.
- Ionic 9: `autocorrect` is boolean (default `false`); floating labels float only on focus or value.
- Inputs need `font-size >= 16px` on iOS to avoid zoom (Ionic default is fine; do not shrink it).

## Overlays

```tsx
<IonButton id="open-sheet">Filters</IonButton>
<IonModal trigger="open-sheet" initialBreakpoint={0.5} breakpoints={[0, 0.5, 1]}>
  <IonContent className="ion-padding">...</IonContent>
</IonModal>
```

- Sheet handle in Ionic 9 is focusable and cycles breakpoints (`handleBehavior="cycle"` default).
- Use `presentingElement` (the page element) for iOS card-style modals.
- Alerts/toasts/action sheets: `useIonAlert`, `useIonToast`, `useIonActionSheet` (React) or the controllers (Angular/Vue).
- Pickers: `IonPicker` + `IonPickerColumn` (inline) or `IonDatetime`. `ion-picker-legacy` and `pickerController` are removed in Ionic 9.

## Tabs

```tsx
<IonTabs>
  <IonRouterOutlet>
    <Route path="/tabs/home" element={<Home />} />
    <Route path="/tabs/search" element={<Search />} />
    <Route path="/tabs" element={<Navigate to="/tabs/home" replace />} />
  </IonRouterOutlet>
  <IonTabBar slot="bottom">
    <IonTabButton tab="home" href="/tabs/home"><IonIcon icon={home} /><IonLabel>Home</IonLabel></IonTabButton>
    <IonTabButton tab="search" href="/tabs/search"><IonIcon icon={search} /><IonLabel>Search</IonLabel></IonTabButton>
  </IonTabBar>
</IonTabs>
```

Parent route must match nested paths (`path="/tabs/*"` in React Router 6). Each tab keeps its own stack; do not navigate between tabs with `router.back()`.

## Navigation API

- React: `useIonRouter()` -> `router.push('/x', 'forward')`, `router.goBack()`.
- Vue: `useIonRouter()` or `router.push`.
- Angular: `NavController.navigateForward('/x')`.
- Swipe-back: `swipeGesture` prop on `ion-router-outlet` (Ionic 9; default `true` iOS, `false` MD).

## Lifecycle

Use `useIonViewWillEnter` / `ionViewWillEnter` for refresh-on-return; framework mount hooks do not re-run when navigating back to a cached page.
