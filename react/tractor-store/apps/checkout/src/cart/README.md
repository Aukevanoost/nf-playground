# cart/

Cart state that is shared across checkout features (cart, mini-cart,
add-to-cart, checkout, thanks). Lives here — at the same level as
`features/` — rather than inside any one feature because every feature
above subscribes to or mutates it.

- `cartStore.ts` — module-level store; persists to `localStorage`,
  syncs cross-tab via the `storage` event, and broadcasts changes
  cross-MFE via `@internal/event-bus`'s `cart-event-bus`.
- `useCart.ts` — React hook that subscribes a component to the store
  via `useSyncExternalStore`.
