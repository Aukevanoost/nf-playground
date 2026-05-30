# Features

A catalogue of what each team ships, the fragments they expose, the
events they speak, and the cross-remote dependencies between them.
Use this document as a map when you need to find where something
lives or what would break if you renamed an `mfe-*` tag.

## Teams at a glance

| Team       | Remote name              | Port | Colour    | Owns                               |
| ---------- | ------------------------ | ---- | --------- | ---------------------------------- |
| Explore    | `@tractor-store/explore` | 4201 | `#FF5A54` | Catalog, recommendations, chrome   |
| Decide     | `@tractor-store/decide`  | 4202 | `#53FF90` | Product detail                     |
| Checkout   | `@tractor-store/checkout`| 4203 | `#FFDE54` | Cart, checkout flow, mini-cart     |

The host runs on port 4200 and owns the URL. Colours are used by the
boundary-overlay debugging script described in
[architecture.md](./architecture.md#team-boundary-visualisation).

The team names come from the [Tractor Store Blueprint][blueprint] and
are deliberately *verbs from the customer journey*, not technical
layers. Explore helps the user browse, Decide helps them choose a
product, Checkout takes them through the purchase. That vertical
split — feature, not framework layer — is the textbook MFE team
decomposition.

[blueprint]: https://github.com/neuland/tractor-store-blueprint

---

## Explore — catalog & chrome

Explore is the largest remote: it owns the catalog *and* the page
chrome (header, footer) that every other remote pulls in. It also
ships the "recommendations" carousel and the in-store-picker UI.

**Source:** `apps/explore/`

### Exposed fragments

| `mfe-*` tag           | Component                                            | Purpose                                          |
| --------------------- | ---------------------------------------------------- | ------------------------------------------------ |
| `mfe-home`            | `features/home/Home.tsx`                             | Landing page (full route)                        |
| `mfe-category`        | `features/category/Category.tsx`                     | Category listing (full route)                    |
| `mfe-stores`          | `features/stores/Stores.tsx`                         | Store finder (full route)                        |
| `mfe-header`          | `features/header/Header.tsx`                         | Top nav, logo, mini-cart slot                    |
| `mfe-footer`          | `features/footer/Footer.tsx`                         | Page footer                                      |
| `mfe-recommendations` | `features/recommendations/Recommendations.tsx`       | "You might also like" carousel                   |
| `mfe-store-picker`    | `features/store-picker/StorePicker.tsx`              | Store selector (used inside checkout)            |

Each feature has a `bootstrap.tsx` alongside the component that wraps
it with `defineMfe('mfe-…', Component)` — a single-line file.

### Routed intents

The remote's `nav-contribution.ts` declares intent IDs *relative* to
the remote; the host prepends `basePath` ("explore") to form the
public IDs.

| Public intent ID              | Path                          | Renders          |
| ----------------------------- | ----------------------------- | ---------------- |
| `explore.home`                | `/explore/`                   | `mfe-home`       |
| `explore.products`            | `/explore/products`           | `mfe-category`   |
| `explore.products.category`   | `/explore/products/{category}`| `mfe-category`   |
| `explore.stores`              | `/explore/stores`             | `mfe-stores`     |

### Chrome elements (declared but not routed)

`mfe-header`, `mfe-footer`, `mfe-recommendations`, `mfe-store-picker`
— declared in the `chromeElements` array of explore's nav-contribution
so the host's slice index knows these tags resolve to explore.

### Cross-remote fragments it loads

- **`mfe-mini-cart`** from `@tractor-store/checkout` —
  `features/header/Header.tsx` calls `prefetchElement('mfe-mini-cart')`
  on mount; the header reserves a slot for the mini-cart shipped by
  checkout.

That is the only cross-team dependency explore consumes; everything
else under `mfe-header`, `mfe-footer`, and `mfe-recommendations` is
its own.

### Events it emits

- **`store:selected`** — when the user picks a pickup store inside
  `mfe-store-picker`. Defined as a typed channel in
  `libs/event-bus/src/lib/store-event-bus.ts` and consumed by
  `mfe-checkout` to pre-fill the order's store field.

---

## Decide — product detail

Decide owns one page: the product detail view. It has the smallest
surface area and the most cross-remote integration.

**Source:** `apps/decide/`

### Exposed fragments

| `mfe-*` tag    | Component                              | Purpose                  |
| -------------- | -------------------------------------- | ------------------------ |
| `mfe-product`  | `features/product/Product.tsx`         | Product detail (route)   |

### Routed intents

| Public intent ID   | Path                       | Renders        |
| ------------------ | -------------------------- | -------------- |
| `decide.product`   | `/decide/product/{id}`     | `mfe-product`  |

The page reads `id` from the path and an optional `sku` query
parameter from `routeParams`, e.g. `/decide/product/123?sku=BLUE-XL`.

### Cross-remote fragments it loads

`features/product/Product.tsx` calls `prefetchElement` for four
fragments in a `useEffect` so they are warm by the time the page
paints:

```ts
const { prefetchElement } = useRemoteLoader();
useEffect(() => {
  void prefetchElement('mfe-header');
  void prefetchElement('mfe-footer');
  void prefetchElement('mfe-recommendations');
  void prefetchElement('mfe-add-to-cart');
}, [prefetchElement]);
```

The decide JSX then drops `<mfe-header>`, `<mfe-footer>`,
`<mfe-recommendations>`, and `<mfe-add-to-cart>` directly into its
markup — each is a custom element, so HTML is the only contract. The
`mfe-*` JSX typings come from `@react-internal/navigation`'s
`types/jsx-mfe.d.ts`.

---

## Checkout — cart & purchase flow

Checkout owns the entire purchase journey plus the mini-cart and
add-to-cart widgets that other teams embed.

**Source:** `apps/checkout/`

### Exposed fragments

| `mfe-*` tag         | Component                                       | Purpose                              |
| ------------------- | ----------------------------------------------- | ------------------------------------ |
| `mfe-cart`          | `features/cart/Cart.tsx`                        | Shopping cart (full route)           |
| `mfe-checkout`      | `features/checkout/Checkout.tsx`                | Checkout form (full route)           |
| `mfe-thanks`        | `features/thanks/Thanks.tsx`                    | Order confirmation (full route)      |
| `mfe-mini-cart`     | `features/mini-cart/MiniCart.tsx`               | Header cart icon + count             |
| `mfe-add-to-cart`   | `features/add-to-cart/AddToCart.tsx`            | "Add to cart" button (used by decide)|

### Routed intents

| Public intent ID      | Path                  | Renders         |
| --------------------- | --------------------- | --------------- |
| `checkout.cart`       | `/checkout/cart`      | `mfe-cart`      |
| `checkout.checkout`   | `/checkout/checkout`  | `mfe-checkout`  |
| `checkout.thanks`     | `/checkout/thanks`    | `mfe-thanks`    |

### Chrome elements (declared but not routed)

`mfe-mini-cart`, `mfe-add-to-cart` — declared in checkout's
`chromeElements` so the host's slice index knows peers' `<mfe-mini-cart>`
and `<mfe-add-to-cart>` references resolve to checkout.

### Cross-remote fragments it loads

- `Cart.tsx` prefetches `mfe-header`, `mfe-footer`, `mfe-recommendations`
  (all from explore).
- `Checkout.tsx` prefetches `mfe-store-picker`, `mfe-footer` (from
  explore). The checkout page reuses explore's store picker instead
  of duplicating store data inside checkout.
- `Thanks.tsx` prefetches `mfe-header`, `mfe-footer` (from explore).

`MiniCart.tsx` and `AddToCart.tsx` are exposed *for* other remotes
but load no foreign fragments themselves.

### Events it speaks

- **Listens to** `store:selected` from explore (`Checkout.tsx`) —
  pre-fills the order's store field when the user picks a store.
- **Emits** `nav:navigate` after a successful submission, with intent
  `'checkout.thanks'`, to ask the host to route to the confirmation
  page. This is the same channel that powers `<NavigateLink>`; the
  page just uses `useNavigateTo()` from `@react-internal/navigation`.
- **`cart:updated` (bidirectional)** — every checkout fragment's
  `cartStore` (`apps/checkout/src/cart/cart-store.ts:51`) emits on
  local mutations and listens for peer mutations. Because each
  loaded checkout slice has its own module-level singleton, a user
  adding an item via `<mfe-add-to-cart>` (mounted inside decide's
  product page) and the `<mfe-mini-cart>` (mounted inside explore's
  header) would otherwise see different counts. The bus syncs them
  without either side importing the other. The module also listens
  to browser `storage` events so a second tab stays in sync.

---

## Cross-remote integration map

A condensed view of who pulls what from whom:

| Consumer                          | Pulls                                              | From      |
| --------------------------------- | -------------------------------------------------- | --------- |
| explore (`mfe-header`)            | `mfe-mini-cart`                                    | checkout  |
| decide (`mfe-product`)            | `mfe-header`, `mfe-footer`, `mfe-recommendations`  | explore   |
| decide (`mfe-product`)            | `mfe-add-to-cart`                                  | checkout  |
| checkout (`mfe-cart`)             | `mfe-header`, `mfe-footer`, `mfe-recommendations`  | explore   |
| checkout (`mfe-checkout`)         | `mfe-store-picker`, `mfe-footer`                   | explore   |
| checkout (`mfe-thanks`)           | `mfe-header`, `mfe-footer`                         | explore   |

Two heuristics fall out of the table:

- **Explore is the chrome layer.** Every other remote's full-page
  views pull in `mfe-header` + `mfe-footer` from explore, so the
  chrome stays consistent without being duplicated three times.
- **Checkout exposes interaction primitives.** `mfe-mini-cart` and
  `mfe-add-to-cart` are not full pages — they are small interactive
  widgets that other teams drop into their own templates wherever the
  user might add or peek at the cart.

All prefetch calls use `prefetchElement(tag)` from
`useRemoteLoader()`. The owning remote is *not* hardcoded — the
host-built `__NF_SLICE_INDEX__` map resolves the tag to the right
remote at runtime.

## Cross-remote events

Every channel that travels on `window.__NF_REGISTRY__`:

| Channel          | Defined in                                                | Emitter                                | Subscriber                              |
| ---------------- | --------------------------------------------------------- | -------------------------------------- | --------------------------------------- |
| `nav:navigate`   | `libs/event-bus/src/lib/nav-event-bus.ts`                 | `<NavigateLink>` + `useNavigateTo()`   | host (`setupShellNavigation`)           |
| `nav:intents`    | `libs/event-bus/src/lib/nav-event-bus.ts`                 | host (after registering contributions) | `nav-resolver` in every remote          |
| `store:selected` | `libs/event-bus/src/lib/store-event-bus.ts`               | explore (`mfe-store-picker`)           | checkout (`mfe-checkout`)               |
| `cart:updated`   | `libs/event-bus/src/lib/cart-event-bus.ts`                | checkout (`cartStore`, all instances)  | checkout (`cartStore`, all instances)   |

All four use the same `defineChannel` factory from
`@react-internal/event-bus`, so the emitter and subscriber import
the same typed handle — one channel name, one payload type, both
ends in sync. `cart:updated` is internal to checkout (only checkout
subscribes) but lives in the shared lib so the shape is colocated
with the other channels.

## Shared libraries

Six TypeScript libraries live under `libs/`. Each has a single
responsibility; none contain business code.

| Package                       | Path                | What it provides                                                                                                                                  |
| ----------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@react-internal/event-bus`   | `libs/event-bus/`   | `defineChannel` factory, channel declarations (`navigateTo`, `navIntents`, `storeSelected`, cart helpers) and their payload types                 |
| `@react-internal/navigation`  | `libs/navigation/`  | `<NavigateLink>` component, `useNavigateTo` hook, `nav-resolver`, `NavContribution`/`NavIntent`/`NavTarget`/`NavBarContribution` types, `mfe-*` JSX type augmentations |
| `@react-internal/url`         | `libs/url/`         | `RouteParams` helpers, path-template helpers, `appendQueryString`, `NavPayload` type                                                              |
| `@react-internal/ui`          | `libs/ui/`          | Design-system primitives (`Button`, `Spinner`, `ErrorBoundary`), `useScopedStyles` hook, `ShadowRootProvider`, `globalContract`                   |
| `@react-internal/mfe-runtime` | `libs/mfe-runtime/` | `defineMfe`, `RemoteContextProvider` + `useRemoteEnv` / `useRemoteLoader` / `useCdnBase`, `use-async`, `cdn` + `price` helpers                    |
| `@react-internal/federation`  | `libs/federation/`  | `EnvironmentConfig`, `LoadRemoteSlice`, `createSliceLoader`, `toCdnUrl`, `__NF_SLICE_INDEX__` global                                              |

The first five are listed in each app's `sharedMappings` so the host
and all remotes share a single instance — same `<NavigateLink>`,
same channel handles, same `Spinner`.

`@react-internal/federation` is *not* in `sharedMappings`. It is only
used at bootstrap inside each app's `main.tsx`, so bundling it
locally avoids load-order puzzles and keeps the slice loader
self-sufficient.

## See also

- [Architecture](./architecture.md) — how custom elements, the event
  bus, and shared deps make this composition possible.
- [Navigation](./navigation.md) — how the intent system makes the
  cross-remote loads in this catalogue possible without coupling.
