import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { ButtonComponent } from '@internal/ui';
import type { StoreModel } from '../../core/data/contracts/models/store.model';
import { StoreStore } from '../../core/data/store/store-store';
import { ResourceService } from '../../shared/utils/resource.service';

@Component({
  selector: 'app-store-picker',
  imports: [ButtonComponent],
  templateUrl: './store-picker.component.html',
  styleUrl: './store-picker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StorePickerComponent {
  private readonly storeStore = inject(StoreStore);
  private readonly image = inject(ResourceService);
  private readonly hostRef = inject(ElementRef<HTMLElement>);

  readonly stores = computed(() => this.storeStore.stores() ?? []);
  readonly selected = signal<StoreModel | null>(null);

  readonly dialogRef =
    viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  readonly imageMeta = (image: string) => ({
    src: this.image.imgSrc(image, 200),
    srcset: this.image.imgSrcset(image, [200, 400]),
  });

  open(): void {
    const el = this.dialogRef().nativeElement;
    if (typeof el.showModal === 'function') {
      el.showModal();
    }
  }

  select(store: StoreModel): void {
    this.selected.set(store);
    const el = this.dialogRef().nativeElement;
    if (typeof el.close === 'function') el.close();
    this.hostRef.nativeElement.dispatchEvent(
      new CustomEvent('store-selected', {
        detail: { id: store.id },
        bubbles: true,
        composed: true,
      }),
    );
  }
}
