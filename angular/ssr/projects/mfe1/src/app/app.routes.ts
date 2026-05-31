import { Routes } from '@angular/router';

import { todoRoutes } from './todos.routes';

// Standalone mfe1 (port 4201) serves the same feature routes it exposes to the host.
export const routes: Routes = todoRoutes;
