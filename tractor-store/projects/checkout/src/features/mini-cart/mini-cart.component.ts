import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal,
} from '@angular/core';
import { ButtonComponent } from '@internal/ui';
import { CartStore } from '../../core/data/store/cart-store';

@Component({
  selector: 'app-mini-cart',
  imports: [ButtonComponent],
  templateUrl: './mini-cart.component.html',
  styleUrl: './mini-cart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'data-boundary': 'checkout',
    class: 'c_MiniCart',
    '[class.c_MiniCart--highlight]': 'highlight()',
  },
})
export class MiniCartComponent {
  private readonly cart = inject(CartStore);
  readonly quantity = this.cart.totalQuantity;
  readonly highlight = signal(false);
  private lastQuantity: number | null = null;

  constructor() {
    let timer: ReturnType<typeof setTimeout> | null = null;
    effect((onCleanup) => {
      const q = this.quantity();
      const prev = this.lastQuantity;
      this.lastQuantity = q;
      if (prev !== null && q > prev) {
        this.highlight.set(true);
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => this.highlight.set(false), 600);
      }
      onCleanup(() => {
        if (timer) clearTimeout(timer);
      });
    });
  }
}
