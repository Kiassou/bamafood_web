import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent {
  user = {
    lastName: '',
    firstName: '',
    username: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
  };
  
  errorMessage: string = '';
  showPassword = false;
  showConfirmPassword = false;
  isLoading = false;

  constructor(private authService: AuthService, private router: Router,private cdr: ChangeDetectorRef) {}

  // --- GESTION DE LA VISIBILITÉ (Sorties de onRegister) ---
  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onRegister() {
    
    this.isLoading = true;

    if (!this.user.lastName.trim() || !this.user.firstName.trim() || 
        !this.user.username.trim() || !this.user.phone.trim() || 
        !this.user.email.trim() || !this.user.password.trim()) {
      this.showTemporaryError("Veuillez remplir tous les champs du formulaire !");
      this.isLoading = false;
      return;
    }

    if (this.user.password !== this.user.confirmPassword) {
      this.showTemporaryError('Les mots de passe ne correspondent pas.');
      this.isLoading = false;
      return;
    }

    // --- APPEL DE NOTRE BACKEND ---
    this.authService.register(this.user).subscribe({
      next: (res) => {
        console.log('Inscription réussie !', res);
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.isLoading = false;
        const msg = err.error?.message || "Une erreur est survenue lors de l'inscription.";
        this.showTemporaryError(msg);
      }
    });
  }

  showTemporaryError(message: string) {
    this.errorMessage = message;
    setTimeout(() => { 
      this.errorMessage = '';
      this.cdr.detectChanges(); 
    }, 3000);
  }
}