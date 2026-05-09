# The Tractor Store - Angular & Native Federation

A micro frontends sample implementation of [The Tractor Store](https://micro-frontends.org/tractor-store/) built with Angular 21 (zoneless), [Native Federation v4][https://github.com/native-federation/angular-adapter] and Web Components. It's based on the [Blueprint](https://github.com/neuland/tractor-store-blueprint).

**Live Demo:** [native-federation.github.io/angular-examples](https://native-federation.github.io/angular-examples/)

## About This Implementation

### Technologies

List of techniques used in this implementation.

| Aspect                     | Solution                                                |
| -------------------------- | ------------------------------------------------------- |
| 🛠️ Frameworks, Libraries   | [angular] (zoneless), [native-federation-v4][nf-v4]     |
| 📝 Rendering               | CSR (Client-Side Rendering)                             |
| 🐚 Application Shell       | Host app with route-based shell components              |
| 🧩 Client-Side Integration | Custom Elements ([@angular/elements]) loaded as remotes |
| 🧩 Server-Side Integration | None (static hosting)                                   |
| 📣 Communication           | Custom Events, Shared Angular services via DI           |
| 🗺️ Navigation              | SPA inside host, intent + URL bus across remotes        |
| 🎨 Styling                 | Self-Contained SCSS (One bundle per remote)             |
| 🍱 Design System           | Shared UI library (`@internal/ui`)                      |
| 🔮 Discovery               | Runtime manifest (`env.config.json`)                    |
| 🚚 Deployment              | Static (GitHub Pages, GitHub Actions)                   |
| 👩‍💻 Local Development       | [angular-cli], [concurrently], [http-server]            |

[angular]: https://angular.dev/
[nf-v4]: https://www.npmjs.com/package/@angular-architects/native-federation-v4
[@angular/elements]: https://angular.dev/guide/elements
[angular-cli]: https://angular.dev/tools/cli
[concurrently]: https://github.com/open-cli-tools/concurrently
[http-server]: https://github.com/http-party/http-server

### Project Structure

The workspace contains four Angular applications and four libraries:

```
tractor-store/
├── projects/
│   ├── host/         # Shell application — owns routing & remote loading
│   ├── explore/      # Catalog, recommendations, store picker
│   ├── decide/       # Product detail page
│   └── checkout/     # Cart, checkout, mini-cart
├── libs/
│   ├── federation/   # @internal/federation — env config & CDN helpers
│   ├── logging/      # @internal/logging — console logger service
│   ├── navigation/   # @internal/navigation — nav bus, link/route directives
│   └── ui/           # @internal/ui — buttons, spinner, …
└── public/cdn/       # Static fonts and images (served at :3000 in dev)
```

Each remote (`explore`, `decide`, `checkout`) exposes its top-level component plus a handful of fragment components (e.g. `Header`, `Footer`, `MiniCart`) registered as custom elements (`mfe-<remote>`, `mfe-<remote>-<fragment>`) via `@angular/elements`. The host loads these on demand through Native Federation and renders them inside route-based shell components.

### Discovery

Each app fetches its `env.config.json` at runtime, which lists the remote manifest plus environment values (`apiUrl`, `cdnUrl`, `production`). The CI workflow rewrites these files for the deployed environment so the same build works locally and on GitHub Pages.

### Limitations

This implementation focuses on the micro frontends aspects. The backend is mocked, error boundaries are minimal, and bundle-size or chunking optimizations are out of scope. In a real-world project these aspects deserve more attention.

### Todos

- [ ] Web performance optimizations (preload critical remotes, deeper code splitting)
- [ ] Error boundaries / fallback UI when a remote fails to load
- [ ] Wire a real backend instead of static fixtures
- [ ] Show selected store on checkout page

## How to run locally

Clone the repository and install dependencies (the workspace uses pnpm):

```bash
git clone git@github.com:native-federation/angular-examples.git
cd angular-examples/tractor-store
pnpm install
```

Start all four apps and the static CDN concurrently:

```bash
pnpm start:all
```

This boots:

| Service         | Port |
| --------------- | ---- |
| host (shell)    | 4200 |
| explore         | 4201 |
| decide          | 4202 |
| checkout        | 4203 |
| cdn (fonts/img) | 3000 |

Open http://localhost:4200 in your browser to see the integrated application. Each remote can also be opened standalone on its own port — Native Federation will load the sibling remotes it needs from the URLs declared in that remote's `public/env.config.json`.

You can also serve a single app:

```bash
pnpm ng serve host       # or explore / decide / checkout
```

### Testing

Unit and component tests are written with [Vitest] using `jsdom`. Run the full suite per project:

```bash
pnpm ng test host --watch=false
```

[Vitest]: https://vitest.dev/

## Deployment

The app is published to GitHub Pages by [`.github/workflows/deploy-tractor-store.yml`](../.github/workflows/deploy-tractor-store.yml) on every push to `main` that touches `tractor-store/**`. The workflow:

1. Builds the four apps with the appropriate `--base-href`.
2. Assembles a single `_site/` directory with `host` at the root and the remotes under `/explore`, `/decide`, `/checkout`.
3. Rewrites the `env.config.json` files so each app discovers its siblings via the deployed base path.
4. Pushes the result to the `gh-pages` branch.

Trigger a deploy manually from the **Actions** tab via _Run workflow_.

## About The Authors

[The Native Federation team](https://native-federation.com/)
