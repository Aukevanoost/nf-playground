import { computed, inject, Injectable } from '@angular/core';
import { RecommendationHttp } from '../http/recommendation-http';
import type { RecommendationModel } from '../contracts/models/recommendation.model';

type Rgb = readonly [number, number, number];

function averageColor(colors: readonly Rgb[]): Rgb {
  if (colors.length === 0) return [0, 0, 0];
  const total = colors.reduce(
    (acc, [r, g, b]) => [acc[0] + r, acc[1] + g, acc[2] + b],
    [0, 0, 0],
  );
  return [
    Math.round(total[0] / colors.length),
    Math.round(total[1] / colors.length),
    Math.round(total[2] / colors.length),
  ];
}

function colorDistance(a: Rgb, b: Rgb): number {
  const [r1, g1, b1] = a;
  const [r2, g2, b2] = b;
  return Math.sqrt(
    Math.pow(r1 - r2, 2) + Math.pow(g1 - g2, 2) + Math.pow(b1 - b2, 2),
  );
}

@Injectable({ providedIn: 'root' })
export class RecommendationStore {
  private readonly http = inject(RecommendationHttp);

  private readonly listResource = this.http.list();
  readonly recommendations = this.listResource.value;
  readonly isLoading = this.listResource.isLoading;
  readonly error = this.listResource.error;
  readonly isLoaded = computed(
    () => this.listResource.status() === 'resolved',
  );

  /** Finds recommendations based on color similarity. */
  recosForSkus(skus: readonly string[], length = 4): RecommendationModel[] {
    const all = this.recommendations();
    if (!all) return [];

    const seedColors = skus
      .filter((sku) => all[sku])
      .map((sku) => all[sku].rgb);
    const targetRgb = averageColor(seedColors);

    const distances: { sku: string; distance: number }[] = [];
    for (const sku of Object.keys(all)) {
      if (!skus.includes(sku)) {
        distances.push({ sku, distance: colorDistance(targetRgb, all[sku].rgb) });
      }
    }
    distances.sort((a, b) => a.distance - b.distance);
    return distances.slice(0, length).map((d) => all[d.sku]);
  }

  reload(): void {
    this.listResource.reload();
  }
}
