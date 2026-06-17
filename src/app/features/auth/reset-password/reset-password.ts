import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reset-password.html',
  styleUrls: ['./reset-password.css']
})
export class ResetPasswordComponent implements OnInit {
  password = '';
  confirmPassword = '';
  showPassword = false;
  errorMessage = '';
  successMessage = '';
  email = '';
  isLoading = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.email = sessionStorage.getItem('resetEmail') || '';
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onResetPassword() {
    if (!this.email) {
      this.showTemporaryError("Session expirée. Recommencez la procédure.");
      return;
    }

    if (!this.password.trim() || !this.confirmPassword.trim()) {
      this.showTemporaryError("Veuillez remplir tous les champs !");
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.showTemporaryError("Les mots de passe ne correspondent pas.");
      return;
    }

    this.isLoading = true;

    this.authService.resetPassword(this.email, this.password).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.successMessage = res.message || "Mot de passe réinitialisé avec succès !";
        this.errorMessage = '';
        sessionStorage.removeItem('otpEmail');
        sessionStorage.removeItem('resetEmail');

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1200);
      },
      error: (err) => {
        this.isLoading = false;
        this.showTemporaryError(err?.error?.message || "Erreur lors de la réinitialisation.");
      }
    });
  }

  showTemporaryError(message: string) {
    this.errorMessage = message;
    this.successMessage = '';
    setTimeout(() => {
      this.errorMessage = '';
    }, 3000);
  }
}