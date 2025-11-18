import { Routes } from '@angular/router';
import { AuthGuard } from './auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'noticias',
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
    // ✅ Accesible sin autenticación - el login se solicita solo al hacer click en "Leer más"
  },
  {
    path: '**',
    redirectTo: 'noticias'
  }
];