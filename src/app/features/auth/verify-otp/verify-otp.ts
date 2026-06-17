import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-verify-otp',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './verify-otp.html',
  styleUrls: ['./verify-otp.css']
})
export class VerifyOtpComponent {
  otpInputs: string[] = ['', '', '', '', '', ''];
  errorMessage: string = '';
  isLoading = false;
  email: string = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.email = sessionStorage.getItem('otpEmail') || '';
  }

  moveFocus(event: KeyboardEvent, previousInput: HTMLInputElement | null, nextInput: HTMLInputElement | null) {
    const target = event.target as HTMLInputElement;

    if (event.key === 'Backspace' && !target.value && previousInput) {
      previousInput.focus();
      return;
    }

    if (target.value && nextInput) {
      nextInput.focus();
    }
  }

  onVerifyOtp() {
    const fullCode = this.otpInputs.join('');

    if (!this.email) {
      this.showTemporaryError("Session OTP introuvable. Recommencez la procédure.");
      return;
    }

    if (fullCode.length < 6) {
      this.showTemporaryError("Veuillez saisir l'intégralité du code OTP !");
      return;
    }

    this.isLoading = true;

    this.authService.verifyOtp(this.email, fullCode).subscribe({
      next: (res) => {
        this.isLoading = false;
        sessionStorage.setItem('resetEmail', this.email);
        this.router.navigate(['/reset-password']);
      },
      error: (err) => {
        this.isLoading = false;
        this.showTemporaryError(err?.error?.message || "Code OTP incorrect ou expiré !");
      }
    });
  }

  showTemporaryError(message: string) {
    this.errorMessage = message;
    setTimeout(() => {
      this.errorMessage = '';
    }, 3000);
  }
}