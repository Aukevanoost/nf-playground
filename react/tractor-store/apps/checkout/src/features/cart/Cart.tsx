import { useEffect, useMemo } from 'react';
import { Button } from '@react-internal/ui';
import { getVariantsBySkus } from '../../api/variants';
import { useCart } from '../../cart/use-cart';
import { useAsync } from '@react-internal/mfe-runtime';
import { useRemoteLoader } from '@react-internal/mfe-runtime';
import { useScopedStyles } from '@react-internal/mfe-runtime';
import { LineItem, type LineItemView } from './LineItem';
import { cartStyles } from './cart-styles';

export function Cart() {
  useScopedStyles('checkout-cart', cartStyles);

  const { prefetchElement } = useRemoteLoader();
  useEffect(() => {
    void prefetchElement('mfe-header');
    void prefetchElement('mfe-footer');
    void prefetchElement('mfe-recommendations');
  }, [prefetchElement]);

  const { lineItems } = useCart();
  // SKUs only — quantity changes don't trigger a refetch because variant
  // lookup is independent of quantity. Renamed from `skusKey` to make this
  // explicit so a future reader doesn't think quantity should be included.
  const skusOnlyKey = lineItems.map((i) => i.sku).join(',');

  const { value: variants, error } = useAsync(
    () => getVariantsBySkus(lineItems.map((i) => i.sku)),
    [skusOnlyKey],
  );

  const items: LineItemView[] = useMemo(() => {
    if (!variants?.length) return [];
    const bySku = new Map(variants.map((v) => [v.sku, v]));
    return lineItems.flatMap(({ sku, quantity }) => {
      const v = bySku.get(sku);
      return v
        ? [{ id: v.id, name: v.name, sku: v.sku, image: v.image, quantity, total: v.price * quantity }]
        : [];
    });
  }, [lineItems, variants]);

  const total = items.reduce((sum, i) => sum + i.total, 0);
  const skusCsv = items.map((i) => i.sku).join(',');

  return (
    <div data-boundary-page="checkout">
      <mfe-header></mfe-header>
      <main className="c_CartPage">
        <h2>Basket</h2>
        {error ? (
          <p role="alert">Failed to load basket items. Please refresh.</p>
        ) : null}
        <ul className="c_CartPage__lineItems" role="list">
          {items.map((i) => (
            <LineItem key={i.sku} item={i} />
          ))}
        </ul>
        <hr />
        <p className="c_CartPage__total">Total: {total} Ø</p>
        <div className="c_CartPage__buttons">
          <Button variant="primary" navigateTo="checkout.checkout">
            Checkout
          </Button>
          <Button variant="secondary" navigateTo="explore.home">
            Continue Shopping
          </Button>
        </div>
        <mfe-recommendations skus={skusCsv}></mfe-recommendations>
      </main>
      <mfe-footer></mfe-footer>
    </div>
  );
}
