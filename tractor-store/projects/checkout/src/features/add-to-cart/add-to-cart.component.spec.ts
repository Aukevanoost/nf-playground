import { ComponentRef, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { VariantModel } from '../../core/data/contracts/models/variant.model';
import { VariantHttp } from '../../core/data/http/variant-http';
import { CartStore } from '../../core/data/store/cart-store';
import { AddToCartComponent } from './add-to-cart.component';

type Listener = (data: unknown) => void;

const fakeBus = () => {
  const listeners = new Map<string, Listener[]>();
  return {
    on: (type: string, cb: Listener) => {
      const arr = listeners.get(type) ?? [];
      arr.push(cb);
      listeners.set(type, arr);
      return () => {};
    },
    onReady: () => () => {},
    emit: (type: string, data: unknown) => {
      for (const cb of listeners.get(type) ?? [])
        cb({ data, timestamp: Date.now() });
    },
    register: async () => {},
    clear: () => listeners.clear(),
  };
};

const variantFixture: VariantModel[] = [
  {
    id: 'AU-03',
    sku: 'AU-03-RD',
    name: 'FutureHarvest Navigator Scarlet Dynamo',
    image: '/cdn/img/product/[size]/AU-03-RD.webp',
    price: 1900,
    inventory: 8,
  },
  {
    id: 'CL-04',
    sku: 'CL-04-TQ',
    name: 'Broadfield Majestic Aqua Green',
    image: '/cdn/img/product/[size]/CL-04-TQ.webp',
    price: 2200,
    inventory: 0,
  },
];

function fakeVariantHttp() {
  return {
    list() {
      return { value: signal(variantFixture) };
    },
  };
}

describe('AddToCartComponent', () => {
  let original: unknown;

  beforeEach(() => {
    window.localStorage.clear();
    TestBed.resetTestingModule();
    original = (window as unknown as { __NF_REGISTRY__?: unknown })
      .__NF_REGISTRY__;
    (window as unknown as { __NF_REGISTRY__: unknown }).__NF_REGISTRY__ =
      fakeBus();
  });

  afterEach(() => {
    (window as unknown as { __NF_REGISTRY__: unknown }).__NF_REGISTRY__ =
      original;
  });

  async function create(sku: string) {
    await TestBed.configureTestingModule({
      imports: [AddToCartComponent],
      providers: [
        provideRouter([]),
        { provide: VariantHttp, useFactory: fakeVariantHttp },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(AddToCartComponent);
    const ref: ComponentRef<AddToCartComponent> = fixture.componentRef;
    ref.setInput('sku', sku);
    fixture.detectChanges();
    return fixture;
  }

  it('creates for a known sku', async () => {
    const fixture = await create('AU-03-RD');
    expect(fixture.componentInstance).toBeTruthy();
    expect(fixture.componentInstance.outOfStock()).toBe(false);
  });

  it('marks out-of-stock when inventory is 0', async () => {
    const fixture = await create('CL-04-TQ');
    expect(fixture.componentInstance.outOfStock()).toBe(true);
  });

  it('adds to the cart and shows confirmation on submit', async () => {
    const fixture = await create('AU-03-RD');
    const cart = TestBed.inject(CartStore);
    fixture.componentInstance.onSubmit(new Event('submit'));
    fixture.detectChanges();
    expect(cart.lineItems()).toEqual([{ sku: 'AU-03-RD', quantity: 1 }]);
    expect(fixture.componentInstance.confirmed()).toBe(true);
  });
});
