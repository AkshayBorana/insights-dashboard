import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'insights',
  },
  {
    path: 'insights',
    loadComponent: () =>
      import('./features/insights/insights.component').then(
        (m) => m.InsightsComponent
      ),
  },
  {
    path: '**',
    redirectTo: 'insights',
  },
];
