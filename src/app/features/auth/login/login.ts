import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  username = '';
  password = '';
  errorMessage = '';
  showPassword = false; 
  isLoading = false;

  constructor(private authService: AuthService, private router: Router, private cdr: ChangeDetectorRef) {}

  // --- GESTION DE LA VISIBILITÉ (Bien placée, en dehors de onLogin) ---
  togglePassword() {
    this.showPassword = !this.showPassword;
  }

onLogin() {
  if (!this.username.trim() || !this.password.trim()) {
    this.showTemporaryError("Veuillez renseigner tous les champs !");
    return;
  }

  this.isLoading = true;

  this.authService.login({ username: this.username, password: this.password }).subscribe({
    next: (res) => {
      console.log('Connexion réussie ! Token enregistré.', res);

      localStorage.setItem('username', this.username);

      const phone =
        res.user?.phoneNumber ||
        res.user?.phone ||
        res.user?.telephone ||
        '';

      localStorage.setItem('phoneNumber', phone);
      localStorage.setItem('userId', res.user.id);
      localStorage.setItem('current_user', JSON.stringify(res.user));

      this.isLoading = false;

      const role = res.user.role;
      if (role === 'GERANT') {
        this.router.navigate(['/manager/dashboard']);
      } else if (role === 'LIVREUR') {
        this.router.navigate(['/livreur/dashboard']);
      } else {
        this.router.navigate(['/client/dashboard']);
      }
    },
    error: (err) => {
      this.isLoading = false;
      const msg = err.error?.message || "Identifiants incorrects.";
      this.showTemporaryError(msg);
    }
  });
}

  showTemporaryError(message: string) {
    this.errorMessage = message;
    this.cdr.detectChanges();

    setTimeout(() => {
      this.errorMessage = '';
      this.cdr.detectChanges();
    }, 3000);
  }
}