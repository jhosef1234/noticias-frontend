import { Routes } from '@angular/router';
import { AuthGuard } from './auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./auth/register/register.component').then(m => m.RegisterComponent),
  },
  {
    path: 'noticias',
    loadComponent: () =>
      import('./noticias/noticias').then(m => m.PortalNoticiasComponent),
    canActivate: [AuthGuard] // ✅ Protegida - solo usuarios autenticados
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];