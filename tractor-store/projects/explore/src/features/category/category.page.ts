import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  computed,
  inject,
  input,
} from '@angular/core';
import { param, RouteParams } from '@internal/navigation';
import type { ProductModel } from '../../core/data/contracts/models/product.model';
import { CategoryStore } from '../../core/data/store/category-store';
import { ProductTileComponent } from '../../shared/components/product-tile/product-tile';
import {
  FilterComponent,
  FilterItem,
} from '../../shared/components/filter/filter';
import { LOADER } from '../../core/remote-loader';

@Component({
  selector: 'app-category',
  imports: [ProductTileComponent, FilterComponent],
  templateUrl: './category.page.html',
  styleUrl: './category.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  host: { 'data-boundary-page': 'explore' },
})
export class CategoryPage {
  private readonly categoryStore = inject(CategoryStore);
  private loader = inject(LOADER);

  constructor() {
    void this.loader('@tractor-store/explore', 'mfe-header');
    void this.loader('@tractor-store/explore', 'mfe-footer');
  }

  readonly routeParams = input<RouteParams>({});

  readonly category = computed(() => param(this.routeParams(), 'category'));

  readonly activeCategory = computed(() =>
    this.categoryStore.findByKey(this.category()),
  );

  readonly title = computed(() =>
    this.activeCategory() ? this.activeCategory()!.name : 'All Machines',
  );

  readonly products = computed<ProductModel[]>(() => {
    const cat = this.activeCategory();
    const all = this.categoryStore.categories() ?? [];
    const list = cat ? [...cat.products] : all.flatMap((c) => c.products);
    return list.sort((a, b) => b.startPrice - a.startPrice);
  });

  readonly filters = computed<FilterItem[]>(() => {
    const current = this.category();
    const active = this.activeCategory();
    const all = this.categoryStore.categories() ?? [];
    return [
      {
        link: { intent: 'explore.products' },
        name: 'All',
        active: !active,
      },
      ...all.map((c) => ({
        link: {
          intent: 'explore.products.category',
          params: { category: c.key },
        },
        name: c.name,
        active: c.key === current,
      })),
    ];
  });
}
