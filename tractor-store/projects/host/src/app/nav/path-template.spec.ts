import { describe, expect, it } from 'vitest';
import {
  joinPath,
  resolveTemplate,
  splitIntentParams,
  toRoutePath,
} from './path-template';

describe('joinPath', () => {
  it('joins basePath and intent path with a single slash', () => {
    expect(joinPath('explore', '/products')).toBe('/explore/products');
  });

  it('returns "/" when both segments are empty', () => {
    expect(joinPath('', '')).toBe('/');
  });

  it('handles a leading-slash basePath', () => {
    expect(joinPath('/explore', 'products')).toBe('/explore/products');
  });

  it('collapses repeated slashes around segments', () => {
    expect(joinPath('//explore//', '//products//')).toBe('/explore/products');
  });

  it('drops the basePath when it is empty', () => {
    expect(joinPath('', '/products')).toBe('/products');
  });

  it('drops the intent path when it is empty', () => {
    expect(joinPath('explore', '')).toBe('/explore');
  });
});

describe('splitIntentParams', () => {
  it('returns names of :param segments', () => {
    expect(splitIntentParams('/product/:id')).toEqual(['id']);
  });

  it('returns multiple param names in order', () => {
    expect(splitIntentParams('/:category/product/:sku')).toEqual([
      'category',
      'sku',
    ]);
  });

  it('returns empty when the path has no params', () => {
    expect(splitIntentParams('/products')).toEqual([]);
  });

  it('ignores segments where the colon is not at the start', () => {
    expect(splitIntentParams('/foo:bar')).toEqual([]);
  });
});

describe('toRoutePath', () => {
  it('joins basePath and intent path without a leading slash', () => {
    expect(toRoutePath('explore', '/products')).toBe('explore/products');
  });

  it('returns "" when both segments are empty (root route)', () => {
    expect(toRoutePath('', '')).toBe('');
  });

  it('strips a leading slash from a single non-empty segment', () => {
    expect(toRoutePath('explore', '/')).toBe('explore');
  });
});

describe('resolveTemplate', () => {
  it('substitutes :param segments from the payload', () => {
    expect(resolveTemplate('/product/:id', { id: '7' })).toBe('/product/7');
  });

  it('encodes substituted values', () => {
    expect(resolveTemplate('/p/:slug', { slug: 'a b/c' })).toBe('/p/a%20b%2Fc');
  });

  it('throws when a required param is missing', () => {
    expect(() => resolveTemplate('/p/:id', {})).toThrow(
      /missing required param ":id"/,
    );
  });

  it('leaves non-param segments untouched', () => {
    expect(resolveTemplate('/static/path/:id', { id: '1' })).toBe(
      '/static/path/1',
    );
  });
});
