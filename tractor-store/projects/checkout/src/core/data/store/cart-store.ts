import { computed, Injectable, signal } from '@angular/core';
import type { CartLineItemModel } from '../contracts/models/cart-line-item.model';
import { emitCartUpdated, onCartUpdated } from './cart-bus';

export const CART_STORAGE_KEY = 'c_cart';
const ITEM_SEP = '|';
const QTY_SEP = '_';

function hasWindow(): boolean {
  return typeof window !== 'undefined';
}

function parse(raw: string | null): CartLineItemModel[] {
  if (!raw) return [];
  return raw
    .split(ITEM_SEP)
    .filter((entry) => entry.length > 0)
    .map((entry) => {
      const [sku, quantity] = entry.split(QTY_SEP);
      return { sku, quantity: parseInt(quantity, 10) || 0 };
    })
    .filter((item) => item.sku && item.quantity > 0);
}

function serialize(items: readonly CartLineItemModel[]): string {
  return items
    .map((item) => `${item.sku}${QTY_SEP}${item.quantity}`)
    .join(ITEM_SEP);
}

@Injectable({ providedIn: 'root' })
export class CartStore {
  private readonly _lineItems = signal<CartLineItemModel[]>(
    this.readFromStorage(),
  );

  readonly lineItems = this._lineItems.asReadonly();

  readonly totalQuantity = computed(() =>
    this._lineItems().reduce((sum, item) => sum + item.quantity, 0),
  );

  constructor() {
    if (hasWindow()) {
      window.addEventListener('storage', this.onStorage);
    }
    onCartUpdated(({ items }) => this._lineItems.set([...items]));
  }

  add(sku: string): void {
    const current = [...this._lineItems()];
    const existing = current.find((item) => item.sku === sku);
    if (existing) {
      existing.quantity += 1;
    } else {
      current.push({ sku, quantity: 1 });
    }
    this.persist(current);
  }

  remove(sku: string): void {
    const current = this._lineItems().filter((item) => item.sku !== sku);
    this.persist(current);
  }

  clear(): void {
    this.persist([]);
  }

  private persist(items: CartLineItemModel[]): void {
    this._lineItems.set(items);
    if (hasWindow()) {
      try {
        window.localStorage.setItem(CART_STORAGE_KEY, serialize(items));
      } catch {
        /* storage full or unavailable – ignore */
      }
    }
    emitCartUpdated({ items });
  }

  private readFromStorage(): CartLineItemModel[] {
    if (!hasWindow()) return [];
    try {
      return parse(window.localStorage.getItem(CART_STORAGE_KEY));
    } catch {
      return [];
    }
  }

  private readonly onStorage = (event: StorageEvent): void => {
    if (event.key !== CART_STORAGE_KEY) return;
    this._lineItems.set(parse(event.newValue));
  };
}
