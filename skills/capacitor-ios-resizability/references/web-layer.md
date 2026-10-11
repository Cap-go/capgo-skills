# Web Layer: Layout That Follows the Window

The WebView's viewport is the window. Make every layout decision from the viewport, never from the device.

## Required viewport

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
```

`viewport-fit=cover` is needed for `env(safe-area-inset-*)` to report non-zero values. Details in `safe-area-handling`.

## Patterns to replace

| Pattern | Problem | Replacement |
|---|---|---|
| `screen.width`, `screen.height`, `screen.availWidth` | Device screen, not the window | `window.innerWidth` / `visualViewport.width`, or CSS |
| `window.orientation`, `orientationchange` | Deprecated. A landscape-tagged window can be taller than wide | `matchMedia('(orientation: landscape)')`, which uses the viewport aspect, or width breakpoints |
| `navigator.userAgent` with `iPad` / `iPhone`, `isPlatform('ipad' / 'tablet')`, `Device.getInfo().model` for layout | Device class does not say how much room there is | Width breakpoints, container queries |
| `100vh` | Wrong with browser UI and keyboard; stale after resize | `100dvh` (or `100svh` / `100lvh` by intent) |
| Width read once at startup into state | Stale after resize | Read on `resize`, or use CSS |
| Safe-area insets read into JS once | Insets change at runtime and can differ per side | CSS `env()` per edge |
| `max(left, right)` inset on both sides, or left inset reused for right | A side bar can appear on one edge only | Each edge uses its own inset |

Keep device detection for things that really depend on the device: feature availability (`Capacitor.isPluginAvailable`), platform-specific UI conventions, analytics.

## CSS

```css
.page {
  min-height: 100dvh;
  padding: env(safe-area-inset-top) env(safe-area-inset-right)
           env(safe-area-inset-bottom) env(safe-area-inset-left);
}

/* Layout by available width, not by device */
.layout { display: grid; grid-template-columns: 1fr; }
@media (min-width: 768px) { .layout { grid-template-columns: 320px 1fr; } }

/* Components that adapt to their container */
.card-list { container-type: inline-size; }
@container (min-width: 500px) { .card { display: flex; } }
```

Container queries are supported in WKWebView on iOS 16+. Capacitor 8 apps on iOS 15 need a media-query fallback.

## JS

```ts
const wide = window.matchMedia('(min-width: 768px)');
const apply = () => document.body.classList.toggle('two-pane', wide.matches);
wide.addEventListener('change', apply);
apply();
```

Prefer `matchMedia` listeners or `ResizeObserver` on the element that changes, over raw `resize` handlers that recompute everything.

## Framework notes

- Ionic: `ion-split-pane` already switches by width (`when="md"` etc.). Do not wrap it in `isPlatform('ipad')`.
- Tailwind: use breakpoints (`md:`, `lg:`) and `@container` variants; see `tailwind-capacitor`.
- Virtual lists: recompute item sizes on container resize, not only on mount.

## Verify in a desktop browser first

Resize the browser window across 320 to 1400 px with the dev server running, and use the browser's responsive mode. Most web-layer resize bugs reproduce there, faster than in a simulator.
