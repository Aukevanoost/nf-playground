import { Routes } from '@angular/router';

import { InsightsComponent } from './insights/insights';

// Standalone mfe2 (port 4202) serves the same component it exposes to the host.
export const routes: Routes = [{ path: '', component: InsightsComponent }];
