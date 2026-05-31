import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';

import { TodoStore } from '../todo-store';
import { TodoFilter } from '../todo.model';

@Component({
  selector: 'app-todo-list',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './todo-list.html',
  styleUrl: './todo-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodoListComponent {
  private readonly store = inject(TodoStore);
  private readonly route = inject(ActivatedRoute);

  /** Filter is driven by the `?filter=` query param so it is shareable / SSR-safe. */
  protected readonly filter = toSignal(
    this.route.queryParamMap.pipe(map((params) => this.parseFilter(params.get('filter')))),
    { initialValue: 'all' as TodoFilter },
  );

  protected readonly total = this.store.total;
  protected readonly activeCount = this.store.activeCount;
  protected readonly completedCount = this.store.completedCount;

  protected readonly visibleTodos = computed(() => {
    const todos = this.store.todos();
    switch (this.filter()) {
      case 'active':
        return todos.filter((t) => !t.completed);
      case 'completed':
        return todos.filter((t) => t.completed);
      default:
        return todos;
    }
  });

  protected readonly form = new FormGroup({
    title: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  protected addTodo(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.store.add(this.form.controls.title.value);
    this.form.reset();
  }

  protected toggle(id: string): void {
    this.store.toggle(id);
  }

  protected remove(id: string): void {
    this.store.remove(id);
  }

  protected clearCompleted(): void {
    this.store.clearCompleted();
  }

  private parseFilter(value: string | null): TodoFilter {
    return value === 'active' || value === 'completed' ? value : 'all';
  }
}

// Default export so the host's federated `loadComponent` (which unwraps
// `.default`) can mount this directly.
export default TodoListComponent;
