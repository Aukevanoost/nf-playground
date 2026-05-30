import { computed, signal, type Signal } from '@angular/core';
import type { RecommendationModel } from '../core/data/contracts/models/recommendation.model';

interface FakeResource<T> {
  value: Signal<T | undefined>;
  isLoading: Signal<boolean>;
  error: Signal<unknown>;
  status: Signal<'idle' | 'loading' | 'resolved' | 'error'>;
  reload: () => void;
}

function fakeResource<T>(value: Signal<T | undefined>): FakeResource<T> {
  return {
    value,
    isLoading: signal(false),
    error: signal(undefined),
    status: signal('resolved'),
    reload: () => {},
  };
}

export interface FakeRecommendationHttp {
  bySeedSkus(
    seedSkus: Signal<readonly string[]>,
    length?: number,
  ): FakeResource<RecommendationModel[]>;
  /** Last seed skus passed to bySeedSkus. */
  lastSeedSkus(): readonly string[];
}

export function fakeRecommendationHttp(
  items: RecommendationModel[] = [],
): FakeRecommendationHttp {
  let captured: readonly string[] = [];
  return {
    bySeedSkus(seedSkus, _length = 4) {
      const value = computed(() => {
        captured = seedSkus();
        return items;
      });
      return fakeResource<RecommendationModel[]>(value);
    },
    lastSeedSkus() {
      return captured;
    },
  };
}
