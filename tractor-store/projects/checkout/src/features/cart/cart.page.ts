import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  computed,
  inject,
} from '@angular/core';
import { ButtonComponent } from '@internal/ui';
import { VariantHttp } from '../../core/data/http/variant-http';
import { CartStore } from '../../core/data/store/cart-store';
import {
  LineItemComponent,
  LineItemView,
} from '../../shared/components/line-item/line-item';
import { LOADER } from '../../core/remote-loader';

@Component({
  selector: 'app-cart',
  imports: [ButtonComponent, LineItemComponent],
  templateUrl: './cart.page.html',
  styleUrl: './cart.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  host: { 'data-boundary-page': 'checkout' },
})
export class CartPage {
  private readonly cart = inject(CartStore);
  private readonly variantHttp = inject(VariantHttp);
  private loader = inject(LOADER);

  constructor() {
    void this.loader('@tractor-store/explore', 'mfe-header');
    void this.loader('@tractor-store/explore', 'mfe-footer');
    void this.loader('@tractor-store/explore', 'mfe-recommendations');
  }

  private readonly skus = computed(() =>
    this.cart.lineItems().map((i) => i.sku),
  );

  private readonly variantsResource = this.variantHttp.getBySkus(this.skus);
  readonly isLoading = this.variantsResource.isLoading;

  readonly lineItems = computed<LineItemView[]>(() => {
    const variants = this.variantsResource.value() ?? [];
    if (variants.length === 0) return [];
    const bySku = new Map(variants.map((v) => [v.sku, v]));
    return this.cart
      .lineItems()
      .reduce<LineItemView[]>((acc, { sku, quantity }) => {
        const variant = bySku.get(sku);
        if (variant) {
          acc.push({
            id: variant.id,
            name: variant.name,
            sku: variant.sku,
            image: variant.image,
            quantity,
            total: variant.price * quantity,
          });
        }
        return acc;
      }, []);
  });

  readonly total = computed(() =>
    this.lineItems().reduce((sum, item) => sum + item.total, 0),
  );

  readonly skusCsv = computed(() =>
    this.lineItems()
      .map((i) => i.sku)
      .join(','),
  );
}
