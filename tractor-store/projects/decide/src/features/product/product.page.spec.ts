import { CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';
import type { ProductModel } from '../../core/data/contracts/models/product.model';
import { ProductHttp } from '../../core/data/http/product-http';
import { ENV } from '../../env.config';
import { LOADER } from '../../core/remote-loader';
import { ProductPage } from './product.page';

const envFixture = {
  production: false,
  apiUrl: '',
  scope: 'decide',
  cdnUrl: '',
};

const fixture: ProductModel[] = [
  {
    id: 'CL-01',
    name: 'Heritage Workhorse',
    category: 'classic',
    highlights: [],
    variants: [
      {
        sku: 'CL-01-GR',
        name: 'Verdant Field',
        image: '/cdn/img/product/[size]/CL-01-GR.webp',
        color: '#6B8E23',
        price: 5700,
      },
      {
        sku: 'CL-01-GY',
        name: 'Stormy Sky',
        image: '/cdn/img/product/[size]/CL-01-GY.webp',
        color: '#708090',
        price: 6200,
      },
    ],
  },
];

function fakeHttp() {
  return {
    list() {
      return { value: signal(fixture) };
    },
  };
}

describe('ProductPage', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductPage],
      providers: [
        provideRouter([]),
        { provide: ProductHttp, useFactory: fakeHttp },
        { provide: LOADER, useValue: () => Promise.resolve() },
        { provide: ENV, useValue: envFixture },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  });

  it('creates the component and resolves a product by id', () => {
    const fixture = TestBed.createComponent(ProductPage);
    fixture.componentRef.setInput('routeParams', { id: 'CL-01' });
    fixture.detectChanges();

    const cmp = fixture.componentInstance;
    expect(cmp).toBeTruthy();
    expect(cmp.product()?.name).toBe('Heritage Workhorse');
    expect(cmp.selectedSku()).toBe('CL-01-GR');
  });

  it('selects variant from ?sku query param when it matches', () => {
    const fixture = TestBed.createComponent(ProductPage);
    fixture.componentRef.setInput('routeParams', {
      id: 'CL-01',
      sku: 'CL-01-GY',
    });
    fixture.detectChanges();

    expect(fixture.componentInstance.selectedSku()).toBe('CL-01-GY');
  });

  it('falls back to first variant when sku does not match', () => {
    const fixture = TestBed.createComponent(ProductPage);
    fixture.componentRef.setInput('routeParams', {
      id: 'CL-01',
      sku: 'nonexistent',
    });
    fixture.detectChanges();

    expect(fixture.componentInstance.selectedSku()).toBe('CL-01-GR');
  });

  it('renders a "not found" fallback when no id is provided', () => {
    const fixture = TestBed.createComponent(ProductPage);
    fixture.detectChanges();

    expect(fixture.componentInstance.product()).toBeUndefined();
  });
});
