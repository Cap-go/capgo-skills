# Konsta UI v5 Component Patterns (React)

Load when building screens. Vue (`konsta/vue`) and Svelte (`konsta/svelte`) expose the same component names; Svelte 5 uses snippets instead of slots/render props.

Exports used below: `App, Page, Navbar, NavbarBackLink, Block, BlockTitle, List, ListItem, ListInput, ListButton, Button, Toggle, Tabbar, TabbarLink, Sheet, Dialog, DialogButton, Popup, Toast, Actions, ActionsGroup, ActionsButton, Glass, Segmented, SegmentedButton, Searchbar, Preloader` from `konsta/react`.

## Page

```tsx
<Page>
  <Navbar
    title="Settings"
    large            // iOS large title
    transparent
    left={<NavbarBackLink onClick={() => navigate(-1)} />}
  />
  <BlockTitle>Account</BlockTitle>
  <List strong inset>
    <ListItem link title="Profile" onClick={() => navigate('/profile')} />
    <ListItem title="Notifications" after={<Toggle checked={on} onChange={() => setOn(!on)} />} />
  </List>
</Page>
```

`Page` is the scroll container. Navbar `large`/`medium` collapse on scroll of the page (`scrollEl` to point at a custom scroller).

## Forms

```tsx
<List strongIos insetIos>
  <ListInput label="Email" type="email" placeholder="you@example.com"
    floatingLabel outline autoComplete="email" inputMode="email"
    error={emailError} clearButton onClear={() => setEmail('')}
    value={email} onChange={(e) => setEmail(e.target.value)} />
  <ListInput label="Country" type="select" dropdown defaultValue="fr">
    <option value="fr">France</option>
  </ListInput>
</List>
<Block><Button large rounded onClick={submit}>Continue</Button></Block>
```

Keep input font size >= 16px on iOS (Konsta defaults are fine).

## Tabbar

```tsx
<Tabbar labels icons className="left-0 bottom-0 fixed">
  <TabbarLink active={tab === 'home'} onClick={() => setTab('home')} icon={<HomeIcon />} label="Home" />
  <TabbarLink active={tab === 'me'} onClick={() => setTab('me')} icon={<UserIcon />} label="Me" />
</Tabbar>
```

With `App safeAreas`, Tabbar includes bottom safe area. Pages behind a fixed Tabbar need bottom padding: `pb-safe-16` (v5 `pb-safe-*` utility = calc(spacing + bottom safe area)).

## Overlays

```tsx
<Sheet opened={open} onBackdropClick={() => setOpen(false)} className="pb-safe">
  <Block>...</Block>
</Sheet>

<Dialog opened={confirm} onBackdropClick={() => setConfirm(false)}
  title="Delete item?" content="This cannot be undone."
  buttons={<>
    <DialogButton onClick={() => setConfirm(false)}>Cancel</DialogButton>
    <DialogButton strong onClick={doDelete}>Delete</DialogButton>
  </>} />

<Popup opened={full} onBackdropClick={() => setFull(false)}>
  <Page><Navbar title="Details" right={<button onClick={() => setFull(false)}>Close</button>} /></Page>
</Popup>

<Toast opened={toast} position="center" button={<Button clear inline onClick={() => setToast(false)}>OK</Button>}>Saved</Toast>
```

Close overlays on Android back:

```ts
import { App as CapApp } from '@capacitor/app';
CapApp.addListener('backButton', ({ canGoBack }) => {
  if (sheetOpen) return setSheetOpen(false);
  canGoBack ? window.history.back() : CapApp.exitApp();
});
```

## Theme-specific styling

```tsx
<div className="ios:rounded-xl material:rounded-3xl p-4">...</div>
<Button className="k-color-brand-red">Delete</Button>
```

Component color props per theme exist as `colors={{ ... }}` and `bgIos` / `bgMaterial` style props; prefer `--color-brand-*` and utilities first.

## Glass (iOS 26 look)

`<Glass>` renders a liquid-glass surface (`bgIos`, `shadowIos`, `highlight` props; colors customizable since 5.2). Use sparingly over content, test contrast in light and dark.

## Material color schemes

Add `k-md-vibrant` or `k-md-monochrome` to `<html>`/`<body>`; ignored in iOS theme.
