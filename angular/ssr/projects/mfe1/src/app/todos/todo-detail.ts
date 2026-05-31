import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { TodoStore } from '../todo-store';

@Component({
  selector: 'app-todo-detail',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './todo-detail.html',
  styleUrl: './todo-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodoDetailComponent {
  private readonly store = inject(TodoStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  /** Bound from the `:id` route param via `withComponentInputBinding()`. */
  readonly id = input.required<string>();

  protected readonly todo = computed(() => this.store.todos().find((t) => t.id === this.id()));

  protected readonly form = new FormGroup({
    title: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  constructor() {
    // Keep the edit field in sync with the resolved todo.
    effect(() => {
      const todo = this.todo();
      this.form.controls.title.setValue(todo ? todo.title : '', { emitEvent: false });
    });
  }

  protected save(): void {
    const current = this.todo();
    if (!current || this.form.invalid) {
      return;
    }
    this.store.updateTitle(current.id, this.form.controls.title.value);
  }

  protected toggle(): void {
    const current = this.todo();
    if (current) {
      this.store.toggle(current.id);
    }
  }

  protected remove(): void {
    const current = this.todo();
    if (current) {
      this.store.remove(current.id);
      void this.router.navigate(['..'], { relativeTo: this.route });
    }
  }
}

// Default export so the host's federated `loadComponent` (which unwraps
// `.default`) can mount this directly.
export default TodoDetailComponent;
