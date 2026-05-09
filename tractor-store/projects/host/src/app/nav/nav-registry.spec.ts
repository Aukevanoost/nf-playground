import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NavRegistry } from './nav-registry';

describe('NavRegistry', () => {
  let navigator: ReturnType<typeof vi.fn<(url: string) => Promise<boolean>>>;
  let registry: NavRegistry;

  beforeEach(() => {
    navigator = vi.fn(async () => true);
    registry = new NavRegistry(navigator);
  });

  it('joins basePath and intent path', () => {
    registry.register({
      source: 's',
      basePath: 'explore',
      intents: [{ id: 'explore.home', path: '/' }],
    });
    expect(registry.resolve('explore.home')).toBe('/explore');
  });

  it('substitutes :params from payload', () => {
    registry.register({
      source: 's',
      basePath: '',
      intents: [{ id: 'product.detail', path: '/product/:id' }],
    });
    expect(registry.resolve('product.detail', { id: 'abc' })).toBe(
      '/product/abc',
    );
  });

  it('encodes param values', () => {
    registry.register({
      source: 's',
      basePath: '',
      intents: [{ id: 'p', path: '/p/:slug' }],
    });
    expect(registry.resolve('p', { slug: 'a b/c' })).toBe('/p/a%20b%2Fc');
  });

  it('throws when a required param is missing', () => {
    registry.register({
      source: 's',
      basePath: '',
      intents: [{ id: 'p', path: '/p/:id' }],
    });
    expect(() => registry.resolve('p', {})).toThrow(/missing required param/);
  });

  it('throws when navigating an unknown intent', () => {
    expect(() => registry.resolve('nope')).toThrow(/unknown intent/);
  });

  it('isAvailable returns false before register and true after', () => {
    expect(registry.isAvailable('late')).toBe(false);
    registry.register({
      source: 's',
      basePath: '',
      intents: [{ id: 'late', path: '/' }],
    });
    expect(registry.isAvailable('late')).toBe(true);
  });

  it('navigate calls navigator with the resolved URL', async () => {
    registry.register({
      source: 's',
      basePath: 'explore',
      intents: [{ id: 'explore.cat', path: '/products/:category' }],
    });
    await registry.navigate('explore.cat', { category: 'tractors' });
    expect(navigator).toHaveBeenCalledWith('/explore/products/tractors');
  });
});
