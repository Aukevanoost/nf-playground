import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CART_STORAGE_KEY } from '../../core/data/store/cart-store';
import type { VariantModel } from '../../core/data/contracts/models/variant.model';
import { VariantHttp } from '../../core/data/http/variant-http';
import { ENV } from '../../env.config';
import { LOADER } from '../../core/remote-loader';
import { CartPage } from './cart.page';

const envFixture = {
  production: false,
  apiUrl: '',
  scope: 'checkout',
  cdnUrl: '',
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
];

function fakeVariantHttp() {
  return {
    list() {
      return { value: signal(variantFixture) };
    },
  };
}

describe('CartPage', () => {
  beforeEach(() => {
    window.localStorage.clear();
    TestBed.resetTestingModule();
  });

  it('creates with an empty cart', async () => {
    await TestBed.configureTestingModule({
      imports: [CartPage],
      providers: [
        provideRouter([]),
        { provide: VariantHttp, useFactory: fakeVariantHttp },
        { provide: LOADER, useValue: () => Promise.resolve() },
        { provide: ENV, useValue: envFixture },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(CartPage);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
    expect(fixture.componentInstance.lineItems()).toEqual([]);
    expect(fixture.componentInstance.total()).toBe(0);
  });

  it('derives line items from the cart store', async () => {
    window.localStorage.setItem(CART_STORAGE_KEY, 'AU-03-RD_2');
    await TestBed.configureTestingModule({
      imports: [CartPage],
      providers: [
        provideRouter([]),
        { provide: VariantHttp, useFactory: fakeVariantHttp },
        { provide: LOADER, useValue: () => Promise.resolve() },
        { provide: ENV, useValue: envFixture },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(CartPage);
    fixture.detectChanges();
    const items = fixture.componentInstance.lineItems();
    expect(items).toHaveLength(1);
    expect(items[0].sku).toBe('AU-03-RD');
    expect(items[0].quantity).toBe(2);
    expect(items[0].total).toBe(3800);
    expect(fixture.componentInstance.total()).toBe(3800);
    expect(fixture.componentInstance.skusCsv()).toBe('AU-03-RD');
  });
});
