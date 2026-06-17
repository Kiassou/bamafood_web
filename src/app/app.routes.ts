import { Routes } from '@angular/router';

import { SplashComponent } from './features/auth/splash/splash';
import { LoginComponent } from './features/auth/login/login';
import { RegisterComponent } from './features/auth/register/register';
import { ForgotPasswordComponent } from './features/auth/forgot-password/forgot-password';
import { VerifyOtpComponent } from './features/auth/verify-otp/verify-otp';
import { ResetPasswordComponent } from './features/auth/reset-password/reset-password';
import { AntiAuthGuard } from './guards/anti-auth-guard';
import { AuthGuard } from './guards/auth-guard';

import { DashboardClientComponent } from './features/client/dashboard/dashboard';
import { CommanderComponent } from './features/client/commander/commander';
import { CartComponent } from './features/client/cart/cart';
import { OrdersComponent } from './features/client/orders/orders';
import { FavoritesComponent } from './features/client/favorites/favorites';
import { ProfileComponent } from './features/profile/profile';

import { DashboardManagerComponent } from './features/manager/dashboard/dashboard';
import { DishesManagerComponent } from './features/manager/dishes/dishes';
import { AddDishComponent } from './features/manager/add-dish/add-dish';
import { OrdersManagerComponent } from './features/manager/orders/orders';
import { AccountsManagerComponent } from './features/manager/accounts-manager/accounts-manager';
import { VerifyPinComponent } from './features/auth/verify-pin/verify-pin';
import { NotificationComponent } from './features/notification/notification';
import { ActivitiesManagerComponent } from './features/manager/activities/activities';
import { DeliveryManagerComponent } from './features/manager/delivery/delivery';
import { RevenueComponent } from './features/manager/revenue/revenue';
import { AnalyticsManagerComponent } from './features/manager/analytics/analytics';

import { DashboardLivreurComponent } from './features/livreur/dashboard/dashboard';

export const routes: Routes = [
  { path: '', component: SplashComponent },

  { path: 'login', component: LoginComponent, canActivate: [AntiAuthGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [AntiAuthGuard] },
  { path: 'forgot-password', component: ForgotPasswordComponent, canActivate: [AntiAuthGuard] },
  { path: 'verify-otp', component: VerifyOtpComponent, canActivate: [AntiAuthGuard] },
  { path: 'reset-password', component: ResetPasswordComponent, canActivate: [AntiAuthGuard] },

  { path: 'client/dashboard', component: DashboardClientComponent, canActivate: [AuthGuard] },
  { path: 'client/commander', component: CommanderComponent, canActivate: [AuthGuard] },
  { path: 'client/cart', component: CartComponent, canActivate: [AuthGuard] },
  { path: 'client/orders', component: OrdersComponent, canActivate: [AuthGuard] },
  { path: 'client/favorites', component: FavoritesComponent, canActivate: [AuthGuard] },

  { path: 'manager/dashboard', component: DashboardManagerComponent, canActivate: [AuthGuard] },
  { path: 'manager/dishes', component: DishesManagerComponent, canActivate: [AuthGuard] },
  { path: 'manager/add-dish', component: AddDishComponent, canActivate: [AuthGuard] },
  { path: 'manager/orders', component: OrdersManagerComponent, canActivate: [AuthGuard] },
  { path: 'manager/accounts-manager', component: AccountsManagerComponent, canActivate: [AuthGuard] },
  { path: 'manager/verify-pin', component: VerifyPinComponent, canActivate: [AuthGuard] },
  { path: 'manager/activities', component: ActivitiesManagerComponent, canActivate: [AuthGuard] },
  { path: 'manager/delivery', component: DeliveryManagerComponent, canActivate: [AuthGuard] },
  { path: 'manager/revenue', component: RevenueComponent, canActivate: [AuthGuard] },
  { path: 'manager/analytics', component: AnalyticsManagerComponent, canActivate: [AuthGuard] },

  { path: 'livreur/dashboard', component: DashboardLivreurComponent, canActivate: [AuthGuard] },

  { path: 'notification', component: NotificationComponent, canActivate: [AuthGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },

  { path: '**', redirectTo: '' }
];