# Simple — Native Federation across Angular versions

A minimal micro-frontend playground that uses [Angular Native Federation](https://www.npmjs.com/package/@angular-architects/native-federation) together with the [`@softarc/native-federation-orchestrator`](https://www.npmjs.com/package/@softarc/native-federation-orchestrator) to load remotes into a single host.

The point of this setup is to prove that a host can consume remotes that are built with **different Angular versions** (20, 21 and 22) side by side, using a shared runtime, and that they can be wired up through several different loading strategies.

## Architecture at a glance

| Remote  | Angular | Port | Workspace | Exposes                | How the host loads it |
| ------- | ------- | ---- | --------- | ---------------------- | --------------------- |
| `host`  | 22      | 4200 | `./`      | —                      | The shell application |
| `mfe1`  | 22      | 4201 | `./`      | `./Component`          | Eager custom element `<app-mfe1>`, declared in the orchestrator manifest |
| `mfe2`  | 22      | 4202 | `./`      | `./Component`          | Eager custom element `<app-mfe2>`, declared in the orchestrator manifest |
| `mfe3`  | 22      | 4203 | `./`      | `./Component`, `./Bootstrap` | Lazy route `/mfe3`, resolved on demand via `initRemoteEntry` |
| `mfe4`  | 20      | 4204 | `./ng20`  | `./Component`, `./Bootstrap` | Lazy route `/mfe4`, loaded through a "loading shell" that registers `<app-mfe4>` on demand |
| `mfe5`  | 21      | 4205 | `./ng21`  | `./Component`, `./Bootstrap` | Route `/mfe5`, present in the manifest and loaded eagerly through a "loading shell" that registers `<app-mfe5>` |

`host`, `mfe1`, `mfe2` and `mfe3` all live in **this** Angular 22 workspace (`./projects`). `mfe4` and `mfe5` are standalone workspaces (`./ng20` and `./ng21`) that ship their own `node_modules` so they can pin older Angular versions — this is what makes the cross-version test meaningful.

## How the host wires everything up

The host bootstraps federation before Angular starts (`projects/host/src/main.ts`):

- A **manifest** lists the remotes that are known up front (`team/mfe1`, `mfe2`, `mfe5`).
- `initFederation(...)` sets up the shared-dependency scope, then dynamically imports `./bootstrap` to start the Angular application.
- The resolved `NativeFederationResult` is handed to Angular through the `MODULE_LOADER` injection token (`projects/host/src/app/app.config.ts`), so components can load additional remotes at runtime.

From there, three loading patterns are demonstrated:

1. **Eager custom elements** — `mfe1` and `mfe2` are rendered directly in the host template (`<app-mfe1>`, `<app-mfe2>`). They are pulled in via the manifest and register themselves as custom elements.
2. **Fully lazy route** — `/mfe3` calls `initRemoteEntry(...)` at navigation time to fetch a remote that is *not* in the manifest, then `loadRemoteModule(...)` to grab its exposed `./Component` (`app.routes.ts`).
3. **Loading shells** — `/mfe4` and `/mfe5` route to small "shell" components (`loading-shell`, `loading-shell-eager`) that call `initRemoteEntry` / `loadRemoteModule` in their constructor to register a custom element (`<app-mfe4>`, `<app-mfe5>`) and render it. `mfe4` is discovered at runtime; `mfe5` is already in the manifest.

Each remote exposes its entry through Native Federation's `exposes` map in its `federation.config.mjs`, and registers a custom element in its `bootstrap.ts` via `@angular/elements`.

## Prerequisites

- **Node.js** (a version compatible with Angular 22)
- **pnpm**

The three workspaces (`./`, `./ng20`, `./ng21`) each have their own dependencies, so `pnpm install` has to be run in each one.

## Getting it running

Every step needs to happen in a **separate terminal**, and all three groups have to be running at the same time for the host to resolve its remotes.

### 1. Start the Angular 20 remote (`mfe4`)

```bash
cd ./ng20
pnpm install
pnpm start
```

Open `http://localhost:4204` to confirm `mfe4` serves on its own.

### 2. Start the Angular 21 remote (`mfe5`)

```bash
cd ./ng21
pnpm install
pnpm start
```

Open `http://localhost:4205` to confirm `mfe5` serves on its own.

### 3. Start the host + Angular 22 remotes

```bash
cd ./
pnpm install
pnpm start:all
```

`start:all` serves `mfe1`, `mfe2`, `mfe3` and `host` concurrently. Open `http://localhost:4200` — you should see `mfe1` and `mfe2` rendered inline, plus buttons that navigate to `mfe3`, `mfe4` and `mfe5`.

> **Note:** `pnpm start` on its own only runs `ng serve` for the default project. Use `pnpm start:all` to bring up the full host + remote set.

## Troubleshooting

- **A remote shows a 404 / fails to load** — make sure the corresponding dev server (from the table above) is actually running on its port. The host resolves remotes by URL at runtime, so a missing server surfaces as a failed fetch of `remoteEntry.json`.
- **Version / shared-dependency errors in the console** — the `shared` block in each `federation.config.mjs` controls which packages are shared as singletons. `@angular/core` is shared with `includeSecondaries: { keepAll: true }` to avoid partial-package mismatches across versions.
- **Changes to a remote aren't picked up** — the orchestrator caches remote entries. `overrideCachedRemotesIfURLMatches: true` (in `main.ts`) refreshes them when the URL matches; a hard refresh of the host usually clears any stale state.
