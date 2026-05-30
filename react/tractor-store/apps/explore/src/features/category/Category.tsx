import { useEffect } from 'react';
import { param, type RouteParams } from '@react-internal/url';
import { getCategories } from '../../api/categories';
import { useAsync } from '@react-internal/mfe-runtime';
import { useRemoteLoader } from '@react-internal/mfe-runtime';
import { useScopedStyles } from '@react-internal/mfe-runtime';
import { ProductTile } from './ProductTile';
import { Filter, type FilterItem } from './Filter';
import { categoryStyles } from './category-styles';

export function Category({ routeParams = {} }: { routeParams?: RouteParams }) {
  useScopedStyles('explore-category', categoryStyles);

  const { prefetchElement } = useRemoteLoader();
  useEffect(() => {
    void prefetchElement('mfe-header');
    void prefetchElement('mfe-footer');
  }, [prefetchElement]);

  const categoryKey = param(routeParams, 'category');

  const { value: rawCategories, error } = useAsync(() => getCategories(), []);
  const categories = rawCategories ?? [];

  const activeCategory = categoryKey
    ? categories.find((c) => c.key === categoryKey)
    : undefined;
  const title = activeCategory?.name ?? 'All Machines';

  const products = (activeCategory
    ? [...activeCategory.products]
    : categories.flatMap((c) => c.products)
  ).sort((a, b) => b.startPrice - a.startPrice);

  const filters: FilterItem[] = [
    {
      link: { intent: 'explore.products' },
      name: 'All',
      active: !activeCategory,
    },
    ...categories.map((c) => ({
      link: {
        intent: 'explore.products.category',
        params: { category: c.key },
      },
      name: c.name,
      active: c.key === categoryKey,
    })),
  ];

  return (
    <div data-boundary-page="explore">
      <mfe-header></mfe-header>
      <main className="e_CategoryPage">
        <h2>{title}</h2>
        {error ? (
          <p role="alert">Failed to load categories. Please refresh.</p>
        ) : (
          <>
            <div className="e_CategoryPage__subline">
              <p>{products.length} products</p>
              <Filter filters={filters} />
            </div>
            <ul className="e_CategoryPage_list">
              {products.map((p) => (
                <ProductTile key={p.id} product={p} />
              ))}
            </ul>
          </>
        )}
      </main>
      <mfe-footer></mfe-footer>
    </div>
  );
}
