# The Tractor Store — React & Native Federation

A reference micro-frontend (MFE) implementation of [The Tractor Store][tractor-store],
built with React 18, [Native Federation v4][nf-v4], and Web
Components. It follows the [Tractor Store Blueprint][blueprint] so it
can be compared head-to-head with implementations in other
frameworks.

[tractor-store]: https://micro-frontends.org/tractor-store/
[nf-v4]: https://www.npmjs.com/package/@softarc/native-federation
[blueprint]: https://github.com/neuland/tractor-store-blueprint

## What this project demonstrates

Three teams ship three React applications into one page, deploy them
independently, and never import each other's code. Three ideas hold
the boundary in place:

- **Custom elements as the integration surface.** Every remote
  registers its UI as `<mfe-*>` web components via the `defineMfe`
  helper from `@react-internal/mfe-runtime`. Other apps drop the tag
  into JSX — no React component, hook, or context crosses the line.
- **A central event bus on `window.__NF_REGISTRY__`.** Remotes
  publish and subscribe to small, stable, *typed* channels instead
  of calling each other directly. Navigation, store selection, and
  cart sync all ride on this bus, and every channel is defined the
  same way: `defineChannel<Payload>('channel:name')`.
- **Intent-based navigation.** A link in *decide* that should open
  the cart never types `'/checkout/cart'`. It emits the intent
  `'checkout.cart'` via the `<NavigateLink>` component (or
  `useNavigateTo()` hook); the host owns the URL.

Each idea is documented in detail under [`docs/`](./docs/) — start
there if you want the why and how.

## Documentation

| Document                                       | What's in it                                                                                                                                  |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| [docs/README.md](./docs/README.md)             | Overview, mental model, and a "where does X live" index. **Start here.**                                                                      |
| [docs/architecture.md](./docs/architecture.md) | The host/remote contract, the three decoupling mechanisms (custom elements, event bus, intent navigation), and the shared-libraries policy.   |
| [docs/navigation.md](./docs/navigation.md)     | The intent-based navigation system — how `<NavigateLink>` + a host-owned registry replace cross-MFE URL hard-coding.                          |
| [docs/features.md](./docs/features.md)         | Catalogue of what each team ships, the events they speak, and the cross-remote dependencies between them.                                     |

## Technologies at a glance

| Aspect                      | Solution                                                |
| --------------------------- | ------------------------------------------------------- |
| Frameworks, libraries       | [React 18][react], [native-federation][nf-v4]           |
| Rendering                   | CSR (client-side rendering)                             |
| Application shell           | Host app with route-based `RemoteShell` components      |
| Client-side integration     | Custom elements (`defineMfe`) loaded as remote slices   |
| Server-side integration     | None (static hosting)                                   |
| Communication               | Typed event channels on `window.__NF_REGISTRY__`        |
| Navigation                  | SPA inside host (react-router), intent IDs across remotes |
| Styling                     | Shadow DOM per fragment, shared CSS variables           |
| Design system               | Shared UI library (`@react-internal/ui`)                |
| Discovery                   | Runtime manifest (`federation.manifest.json`) + slice index |
| Local development           | [esbuild], [vite-style dev servers], [concurrently], [http-server] |

[react]: https://react.dev/
[esbuild]: https://esbuild.github.io/
[concurrently]: https://github.com/open-cli-tools/concurrently
[http-server]: https://github.com/http-party/http-server
[vite-style dev servers]: https://github.com/softarc-consulting/native-federation

## Project structure

The workspace contains four React applications and six libraries:

```
tractor-store/
├── apps/
│   ├── host/         # Shell application — owns routing & remote loading
│   ├── explore/      # Catalog, recommendations, header/footer chrome
│   ├── decide/       # Product detail page
│   └── checkout/     # Cart, checkout flow, mini-cart, add-to-cart
├── libs/
│   ├── event-bus/    # @react-internal/event-bus    — defineChannel factory, nav/store/cart channels
│   ├── navigation/   # @react-internal/navigation   — <NavigateLink>, useNavigateTo, NavContribution types
│   ├── url/          # @react-internal/url          — RouteParams, path-template, query helpers
│   ├── ui/           # @react-internal/ui           — Button, Spinner, ErrorBoundary, scoped-style hook
│   ├── mfe-runtime/  # @react-internal/mfe-runtime  — defineMfe, RemoteContext, hooks (use-async, cdn, price)
│   └── federation/   # @react-internal/federation   — env config, slice loader, slice index
└── cdn-content/      # Static fonts, images, helper script (served at :3000 in dev)
```

Each remote exposes a handful of fragments (e.g. `mfe-cart`,
`mfe-header`, `mfe-mini-cart`) registered as custom elements via
`defineMfe`. The host loads these on demand through Native
Federation and renders them inside route-based shell components.

## How to run locally

The workspace uses pnpm. Clone, install, and start everything:

```bash
git clone git@github.com:native-federation/playground.git
cd playground/react/tractor-store
pnpm install
pnpm start:all
```

`start:all` boots all four apps and the static CDN concurrently:

| Service         | Port |
| --------------- | ---- |
| host (shell)    | 4200 |
| explore         | 4201 |
| decide          | 4202 |
| checkout        | 4203 |
| cdn (fonts/img) | 3000 |

Open <http://localhost:4200> to see the integrated application.
Each remote can also be opened standalone on its own port — the
remote parses a `?fragment=` query param to pick which `mfe-*` to
mount, so e.g. <http://localhost:4201/?fragment=home> shows
`<mfe-home>` directly.

You can also start a single workspace package:

```bash
pnpm -F @tractor-store/host start          # or explore / decide / checkout
```

### Testing

Unit tests are written with [Vitest]. Run the suites:

```bash
pnpm test
```

[Vitest]: https://vitest.dev/

## Scope and limitations

This implementation focuses on the micro-frontend aspects. The
backend is mocked with in-memory fixtures, error boundaries are
minimal, and bundle-size or chunking optimisations are out of scope.
In a real-world project these aspects deserve more attention.

## About the authors

[The Native Federation team](https://native-federation.com/)
