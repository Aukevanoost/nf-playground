import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { RecommendationStore } from '../../core/data/store/recommendation-store';
import { RecommendationComponent } from '../../shared/components/recommendation/recommendation';

function parseSkus(v: unknown): string[] {
  if (Array.isArray(v)) return v as string[];
  if (typeof v === 'string') {
    return v
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

@Component({
  selector: 'app-recommendations',
  imports: [RecommendationComponent],
  templateUrl: './recommendations.component.html',
  styleUrl: './recommendations.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecommendationsComponent {
  private readonly store = inject(RecommendationStore);

  readonly skus = input<string[], unknown>([], {
    alias: 'skus',
    transform: parseSkus,
  });

  readonly items = computed(() => this.store.recosForSkus(this.skus()));
}
