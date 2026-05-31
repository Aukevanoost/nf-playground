import { Routes } from '@angular/router';

import { TodoListComponent } from './todos/todo-list';
import { TodoDetailComponent } from './todos/todo-detail';

/**
 * Feature routes for the standalone mfe1 app (port 4201), mounted at its root.
 *
 * Under federation the host does NOT consume these routes: it mounts the
 * exposed components (`./List`, `./Detail`) under its own `/todos` route shape
 * so SSR deep-links land in the route manifest. See the README, "Federated
 * routes under SSR".
 */
export const todoRoutes: Routes = [
  { path: '', component: TodoListComponent },
  { path: ':id', component: TodoDetailComponent },
];
