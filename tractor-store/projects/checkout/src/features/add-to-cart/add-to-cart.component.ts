import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { NavLinkDirective } from '@internal/navigation';
import { ButtonComponent } from '@internal/ui';
import { CartStore } from '../../core/data/store/cart-store';
import { VariantStore } from '../../core/data/store/variant-store';

@Component({
  selector: 'app-add-to-cart',
  imports: [ButtonComponent, NavLinkDirective],
  templateUrl: './add-to-cart.component.html',
  styleUrl: './add-to-cart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'data-boundary': 'checkout' },
})
export class AddToCartComponent {
  private readonly cart = inject(CartStore);
  private readonly variants = inject(VariantStore);

  readonly sku = input.required<string>();

  readonly variant = computed(() => this.variants.findBySku(this.sku()));
  readonly outOfStock = computed(() => (this.variant()?.inventory ?? 0) === 0);
  readonly confirmed = signal(false);

  onSubmit(event: Event): void {
    event.preventDefault();
    if (this.outOfStock()) return;
    this.cart.add(this.sku());
    this.confirmed.set(true);
  }
}
