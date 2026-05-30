import { useEffect } from 'react';
import { param, type RouteParams } from '@react-internal/url';
import { getProductById } from '../../api/products';
import { useAsync } from '@react-internal/mfe-runtime';
import { useCdnBase, useRemoteLoader } from '@react-internal/mfe-runtime';
import { useScopedStyles } from '@react-internal/mfe-runtime';
import { imgSrc, imgSrcset } from '@react-internal/mfe-runtime';
import { VariantOption } from './VariantOption';
import { productStyles } from './product-styles';

export function Product({ routeParams = {} }: { routeParams?: RouteParams }) {
  useScopedStyles('decide-product', productStyles);

  const { prefetchElement } = useRemoteLoader();
  useEffect(() => {
    void prefetchElement('mfe-header');
    void prefetchElement('mfe-footer');
    void prefetchElement('mfe-recommendations');
    void prefetchElement('mfe-add-to-cart');
  }, [prefetchElement]);

  const id = param(routeParams, 'id');
  const skuParam = param(routeParams, 'sku');
  const base = useCdnBase();

  const { value: product, isLoading, error } = useAsync(
    () => getProductById(id),
    [id],
  );

  if (error || !product) {
    return (
      <div data-boundary-page="decide">
        <mfe-header></mfe-header>
        <main className="d_ProductPage">
          {error ? (
            <p role="alert">Failed to load this product. Please refresh.</p>
          ) : isLoading ? (
            <p>Loading…</p>
          ) : (
            <p>Product not found.</p>
          )}
        </main>
        <mfe-footer></mfe-footer>
      </div>
    );
  }

  const selected =
    product.variants.find((v) => v.sku === skuParam) ?? product.variants[0];

  return (
    <div data-boundary-page="decide">
      <mfe-header></mfe-header>
      <main className="d_ProductPage">
        <div className="d_ProductPage__details">
          <img
            className="d_ProductPage__productImage"
            src={selected ? imgSrc(selected.image, 400, base) : ''}
            srcSet={selected ? imgSrcset(selected.image, [400, 800], base) : undefined}
            sizes="400px"
            width={400}
            height={400}
            alt={selected ? `${product.name} - ${selected.name}` : ''}
          />
          <div className="d_ProductPage__productInformation">
            <h2 className="d_ProductPage__title">{product.name}</h2>
            <ul className="d_ProductPage__highlights">
              {product.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
            <ul className="d_ProductPage__variants">
              {product.variants.map((v) => (
                <VariantOption
                  key={v.sku}
                  id={product.id}
                  sku={v.sku}
                  name={v.name}
                  color={v.color}
                  selected={v.sku === selected?.sku}
                />
              ))}
            </ul>
            <mfe-add-to-cart sku={selected?.sku ?? ''}></mfe-add-to-cart>
          </div>
        </div>
        <mfe-recommendations skus={selected?.sku ?? ''}></mfe-recommendations>
      </main>
      <mfe-footer></mfe-footer>
    </div>
  );
}
