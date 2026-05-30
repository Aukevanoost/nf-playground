import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  inject,
  input,
} from '@angular/core';
import type { StoreModel } from '../../../core/data/contracts/models/store.model';
import { ResourceService } from '../../utils/resource.service';

@Component({
  selector: 'app-store-tile',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom,
  template: `
    <li class="e_Store">
      <div class="e_Store_content">
        <img
          class="e_Store_image"
          [src]="imgSrc()"
          [srcset]="imgSrcset()"
          width="200"
          height="200"
          alt=""
        />
        <p class="e_Store_address">
          {{ store().name }}<br />
          {{ store().street }}<br />
          {{ store().city }}
        </p>
      </div>
    </li>
  `,
  styles: [
    `
      :host {
        display: contents;
      }
      .e_Store {
        margin: 0;
      }
      .e_Store_image {
        display: block;
        max-width: 200px;
        width: 100%;
        height: auto;
      }
      .e_Store_address {
        margin: 1rem 0;
      }
    `,
  ],
})
export class StoreTileComponent {
  private readonly image = inject(ResourceService);

  readonly store = input.required<StoreModel>();
  readonly imgSrc = computed(() => this.image.imgSrc(this.store().image, 200));
  readonly imgSrcset = computed(() =>
    this.image.imgSrcset(this.store().image, [200, 400]),
  );
}
