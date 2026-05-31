# TestSsr

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.1.1.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Running the federated SSR servers

Build everything first, then start the servers:

```bash
npm run build
npm run start:all
```

`start:all` (see [`scripts/start-all.mjs`](./scripts/start-all.mjs)) starts the
servers **in the order they must boot** and exits them all together on `Ctrl+C`:

| Server | URL |
|---|---|
| host | http://localhost:4200 |
| mfe1 (remote) | http://localhost:4201 |
| mfe2 (remote) | http://localhost:4202 |

**Boot order is load-bearing.** The host's `initNodeFederation` fetches each
remote's `remoteEntry.json` over HTTP at start-up, so the **remotes must be
listening before the host boots**. If the host starts first it cannot reach the
remotes and every federated region renders empty — and because the route-level
`.catch(() => RemoteUnavailable)` swallows the failure, this happens **silently,
with no error logged**. `start:all` waits for each remote's `remoteEntry.json`
to respond before starting the host, which removes that footgun.

The remote ports (4201/4202) are pinned by
[`projects/host/public/federation.manifest.json`](./projects/host/public/federation.manifest.json);
if you start a remote on a different port, update the manifest to match.

## Federated routes under SSR

This workspace is a host (`host`) that server-renders two federated remotes
(`mfe1`, `mfe2`) via Native Federation. There is one sharp edge worth knowing
about when combining **federation**, **`loadChildren`**, and **SSR deep-links**.

### The constraint

Angular's SSR build derives a **route manifest** by statically crawling the
host's router config, and `AngularNodeAppEngine` only renders URLs present in
that manifest. A federated **`loadChildren`** callback cannot be resolved during
that build-time crawl (the server federation loader isn't initialised then), so
its child routes — e.g. `/todos/:id` — never enter the manifest. The result: the
list at `/todos` renders, but a **direct** request to `/todos/:id` returns a
404 from Express, even though client-side navigation to it works.

Note this is about discovering the route *shape*, not enumerating ids: a
server-rendered `:id` is stored in the manifest as a single wildcard pattern, so
once the route is known, any id renders on demand. The problem is purely that a
federated `loadChildren` is invisible to the build.

See [`load-children-deeplink-bug.md`](./load-children-deeplink-bug.md) for the
full investigation, symptoms, and the experiments that don't work.

### What this repo does (host owns the route shape)

`projects/host/src/app/app.routes.ts` mounts the feature with **`loadComponent`
children** instead of a federated `loadChildren`:

```ts
{
  path: 'todos',
  children: [
    { path: '',    loadComponent: () => loadRemote('mfe1', './List')   },
    { path: ':id', loadComponent: () => loadRemote('mfe1', './Detail') },
  ],
}
```

A `loadComponent` path is registered statically (the callback isn't invoked at
build time), so both `/todos` and `/todos/:id` land in the manifest and
server-render on direct request — the same reason `/insights` (a `loadComponent`
leaf) already worked. mfe1 exposes the two components (`./List`, `./Detail`); the
nested empty-path + `:id` shape mirrors mfe1's own routing so the components'
relative `routerLink`s resolve unchanged, and `:id` is bound to
`TodoDetailComponent.id` via `withComponentInputBinding()`.

**Trade-off:** the host now declares the URL structure, so the remote owns the
*components* but not its *route shape*. Adding a nested child later requires a
host change.

### Long-term fix (not implemented here)

The architecturally "correct" fix keeps the federated `loadChildren` (remote
owns its routes) and instead makes the federated child routes visible to the
build. The least-fragile variant is a **manifest merge**: each remote already
emits its own `angular-app-manifest.mjs` (mfe1's, for example, contains `/` and
`/*`), so a post-build step can read the remote's manifest, prefix its routes
(`/` → `/todos`, `/*` → `/todos/*`), and merge them into the host manifest. That
avoids both hooking Angular's route-extraction internals and executing remote
code at build time, at the cost of coupling to the manifest format. It belongs
upstream in the Native Federation adapter (where Angular-version drift is owned),
not in an example app — which is why this repo ships the host-owned route shape
instead.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
