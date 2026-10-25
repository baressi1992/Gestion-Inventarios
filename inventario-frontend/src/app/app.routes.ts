import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Dashboard } from './pages/dashboard/dashboard';
import { Productos } from './pages/productos/productos';
import { Ventas } from './pages/ventas/ventas';
import { MainLayout } from './layouts/main-layout/main-layout';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    component: Login,
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login',
  },
  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        component: Dashboard,
      },
      {
        path: 'productos',
        component: Productos,
      },
      { path: 'ventas', 
        component: Ventas 
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
