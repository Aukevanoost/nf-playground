import {
  ChangeDetectionStrategy,
  Component,
  afterNextRender,
  computed,
  signal,
} from '@angular/core';

/**
 * Minimal todo shape this dashboard needs. Intentionally duplicated from mfe1
 * (rather than imported) so the two remotes stay decoupled — they share no
 * runtime state or DI singletons, only the `localStorage` key contract below.
 */
interface Todo {
  id: string;
  title: string;
  completed: boolean;
}

const TODOS_STORAGE_KEY = 'nf-ssr-todos';

@Component({
  selector: 'app-insights',
  templateUrl: './insights.html',
  styleUrl: './insights.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InsightsComponent {
  /** Empty on the server / first client paint; filled after hydration. */
  private readonly todos = signal<Todo[]>([]);

  /** False until we have actually read `localStorage` in the browser. */
  protected readonly loaded = signal(false);

  protected readonly total = computed(() => this.todos().length);
  protected readonly completed = computed(() => this.todos().filter((t) => t.completed).length);
  protected readonly active = computed(() => this.total() - this.completed());
  protected readonly completionRate = computed(() => {
    const total = this.total();
    return total === 0 ? 0 : Math.round((this.completed() / total) * 100);
  });

  constructor() {
    // Read persisted todos only in the browser, after hydration, so the server
    // render (zeros) and the first client render match.
    afterNextRender(() => {
      this.todos.set(this.readTodos());
      this.loaded.set(true);
    });
  }

  private readTodos(): Todo[] {
    const raw = localStorage.getItem(TODOS_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    try {
      const parsed = JSON.parse(raw) as Todo[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
}

// Default export so the host's `loadComponent` (which unwraps `.default`) can
// resolve this federated component directly.
export default InsightsComponent;
