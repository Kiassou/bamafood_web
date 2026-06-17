import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.css']
})
export class ForgotPasswordComponent {
  email: string = '';
  errorMessage: string = '';
  successMessage: string = '';
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onForgotPassword() {
    if (!this.email.trim()) {
      this.showTemporaryError("Veuillez saisir votre adresse email !");
      return;
    }

    this.isLoading = true;

    this.authService.forgotPassword(this.email).subscribe({
      next: (res) => {
        this.successMessage = res.message || "Un code OTP a été envoyé à votre adresse email.";
        this.errorMessage = '';
        this.isLoading = false;

        setTimeout(() => {
          this.router.navigate(['/verify-otp']);
        }, 1500);
      },
      error: (err) => {
        this.isLoading = false;
        this.showTemporaryError(
          err?.error?.message || "Impossible d'envoyer le code OTP."
        );
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