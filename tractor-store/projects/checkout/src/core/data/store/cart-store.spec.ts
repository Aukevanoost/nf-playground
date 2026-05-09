import { TestBed } from '@angular/core/testing';
import {
  CartStore,
  CART_STORAGE_KEY,
  CART_UPDATED_EVENT,
} from './cart-store';

describe('CartStore', () => {
  beforeEach(() => {
    window.localStorage.clear();
    TestBed.resetTestingModule();
  });

  function create(): CartStore {
    return TestBed.inject(CartStore);
  }

  it('reads an empty cart when storage is empty', () => {
    const store = create();
    expect(store.lineItems()).toEqual([]);
    expect(store.totalQuantity()).toBe(0);
  });

  it('reads an existing cart from localStorage on init', () => {
    window.localStorage.setItem(CART_STORAGE_KEY, 'AU-03-RD_2|CL-01-GR_1');
    const store = create();
    expect(store.lineItems()).toEqual([
      { sku: 'AU-03-RD', quantity: 2 },
      { sku: 'CL-01-GR', quantity: 1 },
    ]);
    expect(store.totalQuantity()).toBe(3);
  });

  it('adds a new item and persists', () => {
    const store = create();
    store.add('AU-03-RD');
    expect(store.lineItems()).toEqual([{ sku: 'AU-03-RD', quantity: 1 }]);
    expect(window.localStorage.getItem(CART_STORAGE_KEY)).toBe('AU-03-RD_1');
  });

  it('increments the quantity of an existing item', () => {
    const store = create();
    store.add('AU-03-RD');
    store.add('AU-03-RD');
    expect(store.lineItems()).toEqual([{ sku: 'AU-03-RD', quantity: 2 }]);
    expect(window.localStorage.getItem(CART_STORAGE_KEY)).toBe('AU-03-RD_2');
  });

  it('removes an item', () => {
    window.localStorage.setItem(CART_STORAGE_KEY, 'AU-03-RD_2|CL-01-GR_1');
    const store = create();
    store.remove('AU-03-RD');
    expect(store.lineItems()).toEqual([{ sku: 'CL-01-GR', quantity: 1 }]);
    expect(window.localStorage.getItem(CART_STORAGE_KEY)).toBe('CL-01-GR_1');
  });

  it('clears the cart', () => {
    window.localStorage.setItem(CART_STORAGE_KEY, 'AU-03-RD_2');
    const store = create();
    store.clear();
    expect(store.lineItems()).toEqual([]);
    expect(window.localStorage.getItem(CART_STORAGE_KEY)).toBe('');
  });

  it('dispatches a same-tab update event when writing', () => {
    const store = create();
    const spy = vi.fn();
    window.addEventListener(CART_UPDATED_EVENT, spy);
    store.add('AU-03-RD');
    window.removeEventListener(CART_UPDATED_EVENT, spy);
    expect(spy).toHaveBeenCalled();
  });

  it('syncs from a storage event fired by another tab', () => {
    const store = create();
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: CART_STORAGE_KEY,
        newValue: 'AU-05-ZH_3',
      }),
    );
    expect(store.lineItems()).toEqual([{ sku: 'AU-05-ZH', quantity: 3 }]);
  });
});
