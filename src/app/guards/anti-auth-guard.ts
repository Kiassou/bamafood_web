import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth';

@Injectable({
  providedIn: 'root'
})
export class AntiAuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean | UrlTree {
    if (this.authService.isLoggedIn()) {
      const role = this.authService.getUserRole();

      if (role === 'GERANT') {
        return this.router.parseUrl('/manager/dashboard');
      } else if (role === 'LIVREUR') {
        return this.router.parseUrl('/livreur/dashboard');
      }

      return this.router.parseUrl('/client/dashboard');
    }

    return true;
  }
}