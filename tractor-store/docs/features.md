# Features

A catalogue of what each team ships, the fragments they expose, and the
cross-remote dependencies between them. Use this as a map when you need to
find where something lives or what would break if you renamed an `mfe-*`
tag.

## Teams at a glance

| Team       | Remote name              | Port | Colour     | Owns                               |
| ---------- | ------------------------ | ---- | ---------- | ---------------------------------- |
| Explore    | `@tractor-store/explore` | 4201 | `#FF5A54`  | Catalog, recommendations, chrome   |
| Decide     | `@tractor-store/decide`  | 4202 | `#53FF90`  | Product detail                     |
| Checkout   | `@tractor-store/checkout`| 4203 | `#FFDE54`  | Cart, checkout flow, mini-cart     |

The host runs on port 4200 and owns the URL. Colours are used by the
boundary-overlay debugging script described in
[architecture.md](./architecture.md#team-boundary-visualisation).

---

## Explore — catalog & chrome

Explore is the largest remote: it owns the catalog *and* the page chrome
(header, footer) that every other remote pulls in. It also ships the
"recommendations" carousel and the in-store-picker UI.

**Source:** `projects/explore/`

### Exposed fragments

| `mfe-*` tag           | Component                                                            | Purpose                                          |
| --------------------- | -------------------------------------------------------------------- | ------------------------------------------------ |
| `mfe-home`            | `features/home/home.page.ts`                                         | Landing page (full route)                        |
| `mfe-category`        | `features/category/category.page.ts`                                 | Category listing (full route)                    |
| `mfe-stores`          | `features/stores/stores.page.ts`                                     | Store finder (full route)                        |
| `mfe-header`          | `features/header/header.component.ts`                                | Top nav, logo, mini-cart slot                    |
| `mfe-footer`          | `features/footer/footer.component.ts`                                | Page footer                                      |
| `mfe-recommendations` | `features/recommendations/recommendations.component.ts`              | "You might also like" carousel                   |
| `mfe-store-picker`    | `features/store-picker/store-picker.component.ts`                    | Store selector (used inside checkout)            |

### Routed intents

| Intent ID                     | Path                          | Renders          |
| ----------------------------- | ----------------------------- | ---------------- |
| `explore.home`                | `/explore/`                   | `mfe-home`       |
| `explore.products`            | `/explore/products`           | `mfe-category`   |
| `explore.products.category`   | `/explore/products/:category` | `mfe-category`   |
| `explore.stores`              | `/explore/stores`             | `mfe-stores`     |

### Cross-remote fragments it loads

- `mfe-mini-cart` from `@tractor-store/checkout`
  (`projects/explore/src/features/header/header.component.ts:26`) — the
  header reserves a slot for the mini-cart shipped by checkout.

That's the only cross-team dependency explore consumes; everything else
under `mfe-header`/`mfe-footer`/`mfe-recommendations` is its own.

---

## Decide — product detail

Decide owns one page: the product detail view. It has the smallest surface
area and the most cross-remote integration.

**Source:** `projects/decide/`

### Exposed fragments

| `mfe-*` tag    | Component                              | Purpose                  |
| -------------- | -------------------------------------- | ------------------------ |
| `mfe-product`  | `features/product/product.page.ts`     | Product detail (route)   |

### Routed intents

| Intent ID         | Path                       | Renders        |
| ----------------- | -------------------------- | -------------- |
| `decide.product`  | `/decide/product/:id`      | `mfe-product`  |

The page reads `id` and the optional `sku` query parameter from
`routeParams`, e.g. `/decide/product/123?sku=BLUE-XL`.

### Cross-remote fragments it loads

`features/product/product.page.ts:32-35` calls the slice loader for four
fragments at construction time so they're warm by the time the page paints:

```ts
void this.loader('@tractor-store/explore',  'mfe-header');
void this.loader('@tractor-store/explore',  'mfe-footer');
void this.loader('@tractor-store/explore',  'mfe-recommendations');
void this.loader('@tractor-store/checkout', 'mfe-add-to-cart');
```

The decide template then drops `<mfe-header>`, `<mfe-footer>`,
`<mfe-recommendations>`, and `<mfe-add-to-cart>` directly into its markup —
each is a custom element, so HTML is the only contract.

---

## Checkout — cart & purchase flow

Checkout owns the entire purchase journey plus the mini-cart that the
explore header embeds.

**Source:** `projects/checkout/`

### Exposed fragments

| `mfe-*` tag         | Component                                     | Purpose                           |
| ------------------- | --------------------------------------------- | --------------------------------- |
| `mfe-cart`          | `features/cart/cart.page.ts`                  | Shopping cart (full route)        |
| `mfe-checkout`      | `features/checkout/checkout.page.ts`          | Checkout form (full route)        |
| `mfe-thanks`        | `features/thanks/thanks.page.ts`              | Order confirmation (full route)   |
| `mfe-mini-cart`     | `features/mini-cart/mini-cart.component.ts`   | Header cart icon + count          |
| `mfe-add-to-cart`   | `features/add-to-cart/add-to-cart.component.ts` | "Add to cart" button (used by decide) |

### Routed intents

| Intent ID             | Path                  | Renders         |
| --------------------- | --------------------- | --------------- |
| `checkout.cart`       | `/checkout/cart`      | `mfe-cart`      |
| `checkout.checkout`   | `/checkout/checkout`  | `mfe-checkout`  |
| `checkout.thanks`     | `/checkout/thanks`    | `mfe-thanks`    |

### Cross-remote fragments it loads

- `cart.page.ts:32-34` — `mfe-header`, `mfe-footer`, `mfe-recommendations`
  (all from explore).
- `checkout.page.ts:30-31` — `mfe-store-picker`, `mfe-footer` (from
  explore). Notably, the checkout page reuses explore's store picker
  instead of duplicating store data inside checkout.
- `thanks.page.ts:29-30` — `mfe-header`, `mfe-footer` (from explore).

`mfe-mini-cart` and `mfe-add-to-cart` are exposed *for* other remotes but
load no foreign fragments themselves.

---

## Cross-remote integration map

A condensed view of who pulls what from whom:

| Consumer                              | Pulls                       | From      |
| ------------------------------------- | --------------------------- | --------- |
| explore (`mfe-header`)                | `mfe-mini-cart`             | checkout  |
| decide (`mfe-product`)                | `mfe-header`, `mfe-footer`, `mfe-recommendations` | explore |
| decide (`mfe-product`)                | `mfe-add-to-cart`           | checkout  |
| checkout (`mfe-cart`)                 | `mfe-header`, `mfe-footer`, `mfe-recommendations` | explore |
| checkout (`mfe-checkout`)             | `mfe-store-picker`, `mfe-footer` | explore |
| checkout (`mfe-thanks`)               | `mfe-header`, `mfe-footer`  | explore  |

Two heuristics fall out of the table:

- **Explore is the chrome layer.** Every other remote's full-page views
  pull in `mfe-header` + `mfe-footer` from explore, so the chrome stays
  consistent without being duplicated three times.
- **Checkout exposes interaction primitives.** `mfe-mini-cart` and
  `mfe-add-to-cart` are not full pages — they're small interactive widgets
  that other teams drop into their own templates wherever the user might
  add or peek at the cart.

## Shared libraries

Four TypeScript libraries live under `libs/` and are mapped via Native
Federation `sharedMappings` so every app sees the same instance:

| Package               | Path                | What it provides                                                       |
| --------------------- | ------------------- | ---------------------------------------------------------------------- |
| `@internal/navigation`| `libs/navigation/`  | `NavLinkDirective`, `NavRouteDirective`, `nav-bus`, `nav-types`, `RouteParams` helpers |
| `@internal/ui`        | `libs/ui/`          | Shared design-system components (`Button`, `Spinner`)                  |
| `@internal/logging`   | `libs/logging/`     | `ConsoleLoggerService` for consistent log formatting                   |
| `@internal/federation`| `libs/federation/`  | `EnvironmentConfig`, `toCdnUrl`, `createSliceLoader` factory           |

`@internal/federation` is *not* in the `sharedMappings` list — it's only
used at bootstrap inside each remote's `main.ts`, so it can be bundled
locally without breaking instance identity. The other three are shared and
must stay in step across all four apps.

## See also

- [Architecture](./architecture.md) — how custom elements and shared deps
  make this composition possible.
- [Navigation](./navigation.md) — how the intent system makes the
  cross-remote loads in this catalogue possible without coupling.
