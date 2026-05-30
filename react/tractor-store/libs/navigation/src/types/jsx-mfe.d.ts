import 'react';

declare global {
  namespace JSX {
    interface MfeElement extends React.HTMLAttributes<HTMLElement> {
      readonly children?: React.ReactNode;
    }

    interface IntrinsicElements {
      // explore (source)
      'mfe-home': MfeElement;
      'mfe-header': MfeElement;
      'mfe-footer': MfeElement;
      'mfe-category': MfeElement;
      'mfe-stores': MfeElement;
      'mfe-store-picker': MfeElement;
      'mfe-recommendations': MfeElement & { skus?: string };
      // decide (source)
      'mfe-product': MfeElement;
      // checkout (source)
      'mfe-cart': MfeElement;
      'mfe-checkout': MfeElement;
      'mfe-thanks': MfeElement;
      'mfe-mini-cart': MfeElement;
      'mfe-add-to-cart': MfeElement & { sku?: string };
    }
  }
}
