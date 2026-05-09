import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  computed,
  inject,
} from '@angular/core';
import { NavLinkDirective } from '@internal/navigation';
import { TeaserStore } from '../../core/data/store/teaser-store';
import { ResourceService } from '../../shared/utils/resource.service';
import { LOADER } from '../../core/remote-loader';

@Component({
  selector: 'app-home',
  imports: [NavLinkDirective],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  host: { 'data-boundary-page': 'explore' },
})
export class HomePage {
  private readonly teaserStore = inject(TeaserStore);
  private readonly image = inject(ResourceService);
  private loader = inject(LOADER);

  constructor() {
    void this.loader('@tractor-store/explore', 'mfe-header');
    void this.loader('@tractor-store/explore', 'mfe-footer');
    void this.loader('@tractor-store/explore', 'mfe-recommendations');
  }

  readonly teasers = computed(() =>
    (this.teaserStore.teasers() ?? []).map((t) => ({
      ...t,
      src: this.image.imgSrc(t.image, 500),
      srcset: this.image.imgSrcset(t.image, [500, 1000]),
    })),
  );

  readonly seedSkus: string[] = ['CL-01-GY', 'AU-07-MT'];
}
