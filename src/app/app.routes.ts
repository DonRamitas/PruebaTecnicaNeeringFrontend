import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard'; // Importa el guard
import { redirectGuard } from './guards/redirect.guard'; // importa tu guard
import { guestGuard } from './guards/guest.guard';

export const routes: Routes = [
  {
    path: '',
    canActivate: [redirectGuard],
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage) // no se carga nunca gracias al guard
  },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'products',
    canActivate: [AuthGuard],
    loadComponent: () => import('./pages/products/products.page').then(m => m.ProductsPage),
  },
  {
    path: 'categories',
    canActivate: [AuthGuard],
    loadComponent: () => import('./pages/categories/categories.page').then(m => m.CategoriesPage),
    
  },
  {
    path: 'product-add',
    canActivate: [AuthGuard],
    loadComponent: () => import('./pages/product-add/product-add.page').then( m => m.ProductAddPage)
  },
  {
    path: 'product-detail/:id',
    canActivate: [AuthGuard],
    loadComponent: () => import('./pages/product-detail/product-detail.page').then( m => m.ProductDetailPage)
  },
  {
    path: 'category-add',
    canActivate: [AuthGuard],
    loadComponent: () => import('./pages/category-add/category-add.page').then( m => m.CategoryAddPage)
  },
  {
    path: 'product-edit/:id',
    canActivate: [AuthGuard],
    loadComponent: () => import('./pages/product-edit/product-edit.page').then( m => m.ProductEditPage)
  },
  {
    path: 'category-add',
    canActivate: [AuthGuard],
    loadComponent: () => import('./pages/category-add/category-add.page').then( m => m.CategoryAddPage)
  },
  {
    path: 'category-edit/:id',
    canActivate: [AuthGuard],
    loadComponent: () => import('./pages/category-edit/category-edit.page').then( m => m.CategoryEditPage)
  },
  {
    path: '**',
    redirectTo: '',
  },
];
