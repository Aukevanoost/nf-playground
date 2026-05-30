import { NavigateLink } from '@react-internal/navigation';
import type { Product } from '../../api/categories';
import { useScopedStyles } from '@react-internal/mfe-runtime';
import { useCdnBase } from '@react-internal/mfe-runtime';
import { imgSrc, imgSrcset } from '@react-internal/mfe-runtime';
import { fmtPrice } from '@react-internal/mfe-runtime';
import { productTileStyles } from './product-tile-styles';

export function ProductTile({ product }: { product: Product }) {
  useScopedStyles('explore-product-tile', productTileStyles);
  const base = useCdnBase();

  return (
    <li className="e_Product">
      <NavigateLink
        intent={product.link.intent}
        params={product.link.params ?? {}}
        className="e_Product_link"
      >
        <img
          className="e_Product_image"
          src={imgSrc(product.image, 200, base)}
          srcSet={imgSrcset(product.image, [200, 400, 800], base)}
          sizes="300px"
          width={200}
          height={200}
          alt=""
        />
        <span className="e_Product_name">{product.name}</span>
        <span className="e_Product_price">{fmtPrice(product.startPrice)}</span>
      </NavigateLink>
    </li>
  );
}
