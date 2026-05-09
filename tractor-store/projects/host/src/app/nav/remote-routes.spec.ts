import { afterEach, describe, expect, it, vi } from 'vitest';
import { LoadedContribution } from './load-contributions';
import { buildRemoteRoutes } from './remote-routes';

const contribution = (
  source: string,
  basePath: string,
  intents: { id: string; path: string; element?: string }[],
): LoadedContribution => ({
  remoteName: source,
  contribution: { source, basePath, intents },
});

describe('buildRemoteRoutes', () => {
  afterEach(() => vi.restoreAllMocks());

  it('produces one route per intent that has an element', () => {
    const routes = buildRemoteRoutes([
      contribution('@a/explore', 'explore', [
        { id: 'explore.home', path: '/', element: 'mfe-explore-home' },
        { id: 'explore.products', path: '/products', element: 'mfe-explore-list' },
      ]),
    ]);
    expect(routes).toHaveLength(2);
    expect(routes.map((r) => r.path)).toEqual(['explore', 'explore/products']);
  });

  it('joins basePath and intent path into a leading-slash-free route path', () => {
    const [route] = buildRemoteRoutes([
      contribution('@a/decide', 'decide', [
        { id: 'decide.product', path: '/product/:id', element: 'mfe-decide-product' },
      ]),
    ]);
    expect(route.path).toBe('decide/product/:id');
  });

  it('encodes the remote name and element in route data so RemoteShell can pick them up', () => {
    const [route] = buildRemoteRoutes([
      contribution('@a/decide', 'decide', [
        { id: 'decide.product', path: '/product/:id', element: 'mfe-decide-product' },
      ]),
    ]);
    expect(route.data).toEqual({
      remoteName: '@a/decide',
      element: 'mfe-decide-product',
    });
  });

  it('skips intents that have no element (link-only intents)', () => {
    const routes = buildRemoteRoutes([
      contribution('@a/explore', 'explore', [
        { id: 'explore.home', path: '/', element: 'mfe-explore-home' },
        { id: 'explore.linkonly', path: '/somewhere' },
      ]),
    ]);
    expect(routes.map((r) => r.path)).toEqual(['explore']);
  });

  it('warns and skips contributions that contribute zero routed intents', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const routes = buildRemoteRoutes([
      contribution('@a/links-only', 'links', [
        { id: 'links.x', path: '/x' },
      ]),
    ]);
    expect(routes).toHaveLength(0);
    expect(warn).toHaveBeenCalledOnce();
    expect(warn.mock.calls[0][0]).toMatch(/@a\/links-only/);
  });

  it('returns an empty Routes array for an empty input', () => {
    expect(buildRemoteRoutes([])).toEqual([]);
  });

  it('attaches a loadComponent function to each route', () => {
    const [route] = buildRemoteRoutes([
      contribution('@a/explore', 'explore', [
        { id: 'explore.home', path: '/', element: 'mfe-explore-home' },
      ]),
    ]);
    expect(typeof route.loadComponent).toBe('function');
  });
});
