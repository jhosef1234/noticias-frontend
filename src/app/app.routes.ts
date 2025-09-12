import { Routes } from '@angular/router';

export const routes: Routes = [{
        path: '',
        loadComponent: () =>
            import('../app/noticias/noticias').then(m => m.PortalNoticiasComponent),
    },];
