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
    path: 'forgot-password',
    loadComponent: () =>
      import('./auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
  },
  {
    path: 'favoritos',
    loadComponent: () =>
      import('./favoritos/favoritos.component').then(m => m.FavoritosComponent),
  },
  {
    path: 'historial',
    loadComponent: () =>
      import('./historial/historial.component').then(m => m.HistorialComponent),
  },
  {
    path: 'planes',
    loadComponent: () =>
      import('./planes/planes.component').then(m => m.PlanesComponent),
  },
  {
    path: 'payment',
    loadComponent: () =>
      import('./payment/payment.component').then(m => m.PaymentComponent),
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./admin/admin.component').then(m => m.AdminComponent),
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