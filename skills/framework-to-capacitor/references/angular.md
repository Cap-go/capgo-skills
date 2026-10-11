# Angular + Capacitor

Current Angular major is 22. Since Angular 17 the default `application` builder (`@angular/build:application`) writes browser files to `dist/<project-name>/browser`.

## Config

- `webDir: 'dist/<project-name>/browser'` (check `angular.json` -> `projects.<name>.architect.build.options.outputPath`).
- Angular 16 and older (or projects still on the `browser` builder) output to `dist/<project-name>`; verify by looking for `index.html`.
- Keep `<base href="/">` in `src/index.html`. Do not set `baseHref` / `deployUrl` for the app build.

## Routing

`PathLocationStrategy` (default) works. Use hash routing only if existing URLs depend on it:

```ts
// app.config.ts (standalone)
import { provideRouter, withHashLocation } from '@angular/router';
export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes /*, withHashLocation() */)],
};
```

NgModule apps: `{ provide: LocationStrategy, useClass: HashLocationStrategy }`.

## SSR projects

If the project was created with `--ssr` (`@angular/ssr`, `server.ts`, `outputMode: 'server'`), the browser folder still contains `index.csr.html` or a prerendered `index.html` depending on configuration. For the app:
- Add a mobile build configuration with SSR/prerender disabled (`"ssr": false, "prerender": false` or `outputMode: 'static'`) so `browser/index.html` exists and is the client-rendered shell.
- Server-only providers (`REQUEST`, `TransferState` server fetches) must have client fallbacks.

## Ionic Angular

`@ionic/angular` projects created by the Ionic CLI use `www/` as output (`outputPath: "www"`). Match `webDir` to whatever `angular.json` says.

## Errors

| Error | Fix |
|---|---|
| `Could not find the web assets directory: ./dist/my-app.` | Add `/browser` to `webDir` |
| `must contain an index.html file` with only `index.csr.html` present | Disable SSR for the mobile configuration |
| White screen, assets 404 under `/my-app/` | Remove `baseHref`/`deployUrl` from the mobile build |
