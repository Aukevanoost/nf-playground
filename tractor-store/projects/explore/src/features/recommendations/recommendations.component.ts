import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { RecommendationHttp } from '../../core/data/http/recommendation-http';
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
  private readonly http = inject(RecommendationHttp);

  readonly skus = input<string[], unknown>([], {
    alias: 'skus',
    transform: parseSkus,
  });

  private readonly recoResource = this.http.bySeedSkus(this.skus);
  readonly items = computed(() => this.recoResource.value() ?? []);
}
