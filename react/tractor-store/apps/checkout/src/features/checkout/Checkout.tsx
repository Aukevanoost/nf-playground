import { useEffect, useState, type FormEvent } from 'react';
import { navigateTo, storeSelected } from '@react-internal/event-bus';
import { Button } from '@react-internal/ui';
import { useCart } from '../../cart/use-cart';
import { useRemoteLoader } from '@react-internal/mfe-runtime';
import { useScopedStyles } from '@react-internal/mfe-runtime';
import { CompactHeader } from './CompactHeader';
import { checkoutStyles } from './checkout-styles';

export function Checkout() {
  useScopedStyles('checkout-checkout', checkoutStyles);

  const { prefetchElement } = useRemoteLoader();
  useEffect(() => {
    void prefetchElement('mfe-store-picker');
    void prefetchElement('mfe-footer');
  }, [prefetchElement]);

  const cart = useCart();
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [storeId, setStoreId] = useState('');

  useEffect(() => storeSelected.on(({ id }) => setStoreId(id)), []);

  const isReady = Boolean(firstname && lastname && storeId);

  const onSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (!isReady) return;
    cart.clear();
    navigateTo.emit({ id: 'checkout.thanks', payload: {} });
  };

  return (
    <div data-boundary-page="checkout">
      <CompactHeader />
      <main className="c_Checkout">
        <h2>Checkout</h2>
        <form className="c_Checkout__form" onSubmit={onSubmit}>
          <h3>Personal Data</h3>
          <fieldset className="c_Checkout__name">
            <div>
              <label className="c_Checkout__label" htmlFor="c_firstname">
                First name
              </label>
              <input
                className="c_Checkout__input"
                type="text"
                id="c_firstname"
                name="firstname"
                required
                value={firstname}
                onChange={(e) => setFirstname(e.target.value)}
              />
            </div>
            <div>
              <label className="c_Checkout__label" htmlFor="c_lastname">
                Last name
              </label>
              <input
                className="c_Checkout__input"
                type="text"
                id="c_lastname"
                name="lastname"
                required
                value={lastname}
                onChange={(e) => setLastname(e.target.value)}
              />
            </div>
          </fieldset>

          <h3>Store Pickup</h3>
          <fieldset>
            <div className="c_Checkout__store">
              <mfe-store-picker></mfe-store-picker>
            </div>
            <label className="c_Checkout__label" htmlFor="c_storeId">
              Store ID
            </label>
            <input
              className="c_Checkout__input"
              type="text"
              id="c_storeId"
              name="storeId"
              readOnly
              required
              value={storeId}
            />
          </fieldset>

          <div className="c_Checkout__buttons">
            <Button type="submit" variant="primary" disabled={!isReady}>
              place order
            </Button>
            <Button variant="secondary" navigateTo="checkout.cart">
              back to cart
            </Button>
          </div>
        </form>
      </main>
      <mfe-footer></mfe-footer>
    </div>
  );
}
