import {
  Injectable,
  PLATFORM_ID,
  afterNextRender,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import { Todo, TODOS_STORAGE_KEY } from './todo.model';

/**
 * Deterministic seed rendered on the server *and* on the first client paint.
 * Keeping both renders identical is what prevents hydration mismatches — the
 * real (possibly different) `localStorage` data is only read *after* hydration
 * in `afterNextRender`.
 */
const SEED_TODOS: readonly Todo[] = [
  { id: 't-1', title: 'Render the todo list on the server', completed: true },
  { id: 't-2', title: 'Hydrate it on the client with event replay', completed: true },
  { id: 't-3', title: 'Load this remote into the host via Native Federation', completed: false },
  { id: 't-4', title: 'Persist changes to localStorage', completed: false },
];

@Injectable({ providedIn: 'root' })
export class TodoStore {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private readonly _todos = signal<Todo[]>(SEED_TODOS.map((todo) => ({ ...todo })));

  /** Monotonic counter for stable ids (no `Math.random`/`Date.now` → SSR-safe). */
  private nextId = SEED_TODOS.length + 1;

  readonly todos = this._todos.asReadonly();
  readonly total = computed(() => this._todos().length);
  readonly completedCount = computed(() => this._todos().filter((t) => t.completed).length);
  readonly activeCount = computed(() => this.total() - this.completedCount());

  constructor() {
    // Read persisted todos only after the first render has hydrated, so the
    // initial client DOM matches the server DOM (the seed above).
    afterNextRender(() => this.loadFromStorage());

    // Persist on every change, browser-only.
    effect(() => {
      const todos = this._todos();
      if (this.isBrowser) {
        localStorage.setItem(TODOS_STORAGE_KEY, JSON.stringify(todos));
      }
    });
  }

  find(id: string): Todo | undefined {
    return this._todos().find((t) => t.id === id);
  }

  add(title: string): void {
    const trimmed = title.trim();
    if (!trimmed) {
      return;
    }
    const todo: Todo = { id: `t-${this.nextId++}`, title: trimmed, completed: false };
    this._todos.update((todos) => [...todos, todo]);
  }

  toggle(id: string): void {
    this._todos.update((todos) =>
      todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    );
  }

  updateTitle(id: string, title: string): void {
    const trimmed = title.trim();
    if (!trimmed) {
      return;
    }
    this._todos.update((todos) =>
      todos.map((t) => (t.id === id ? { ...t, title: trimmed } : t)),
    );
  }

  remove(id: string): void {
    this._todos.update((todos) => todos.filter((t) => t.id !== id));
  }

  clearCompleted(): void {
    this._todos.update((todos) => todos.filter((t) => !t.completed));
  }

  private loadFromStorage(): void {
    const raw = localStorage.getItem(TODOS_STORAGE_KEY);
    if (!raw) {
      return;
    }
    try {
      const parsed = JSON.parse(raw) as Todo[];
      if (!Array.isArray(parsed)) {
        return;
      }
      this._todos.set(parsed);
      this.nextId = this.computeNextId(parsed);
    } catch {
      // Corrupt storage — keep the seed.
    }
  }

  private computeNextId(todos: Todo[]): number {
    const max = todos.reduce((acc, todo) => {
      const n = Number(todo.id.replace(/^t-/, ''));
      return Number.isFinite(n) && n > acc ? n : acc;
    }, 0);
    return max + 1;
  }
}
