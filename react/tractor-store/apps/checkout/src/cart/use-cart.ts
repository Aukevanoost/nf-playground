import { useSyncExternalStore } from 'react';
import { cartStore, type CartLineItem } from './cart-store';

const EMPTY: readonly CartLineItem[] = [];

export function useCart() {
  const lineItems = useSyncExternalStore(
    cartStore.subscribe,
    cartStore.getSnapshot,
    () => EMPTY,
  );
  const totalQuantity = lineItems.reduce((sum, i) => sum + i.quantity, 0);
  return {
    lineItems,
    totalQuantity,
    add: cartStore.add,
    remove: cartStore.remove,
    clear: cartStore.clear,
  };
}
