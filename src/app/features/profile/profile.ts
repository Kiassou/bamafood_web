import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { RouterLink, Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class ProfileComponent implements OnInit {
  isLoading = true;
  currentUser: any = null;
  profileForm!: FormGroup;
  
  // États pour le modal et les mots de passe
  showChangePasswordModal = false;
  changePasswordForm!: FormGroup;
  isSubmittingPassword = false;
  passwordError: string | null = null;
  
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  imagePreview: string | null = null;
  activeSection = 'infos';

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {
    this.initForms();
  }

  ngOnInit(): void {
    this.userService.getProfile().subscribe({
      next: (data) => {
        this.currentUser = data;
        this.profileForm.patchValue({
          firstName: data.first_name,
          lastName: data.last_name,
          username: data.username,
          email: data.email,
          phone: data.phone
        });
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Erreur chargement profil", err);
        this.isLoading = false;
      }
    });
  }

  initForms() {
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['']
    });

    this.changePasswordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }

  // Validateur pour comparer les mots de passe
  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value ? null : { 'mismatch': true };
  }

  // --- Gestion du Modal ---
  openChangePasswordModal() { this.showChangePasswordModal = true; }
  closeChangePasswordModal() { this.showChangePasswordModal = false; }

  toggleCurrentPasswordVisibility() { this.showCurrentPassword = !this.showCurrentPassword; }
  toggleNewPasswordVisibility() { this.showNewPassword = !this.showNewPassword; }
  toggleConfirmPasswordVisibility() { this.showConfirmPassword = !this.showConfirmPassword; }

  onPasswordChange() {
    if (this.changePasswordForm.valid) {
      this.isSubmittingPassword = true;
      // Appel backend à implémenter plus tard
      console.log("Données mot de passe :", this.changePasswordForm.value);
      setTimeout(() => {
        this.isSubmittingPassword = false;
        this.closeChangePasswordModal();
        alert("Mot de passe modifié avec succès !");
      }, 1000);
    }
  }

  // --- Navigation et UI ---
  scrollToSection(sectionId: string) {
    this.activeSection = sectionId;
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  onSubmit() {
    if (this.profileForm.valid) {
      this.userService.updateProfile(this.profileForm.value).subscribe(() => {
        alert('Profil mis à jour !');
      });
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => this.imagePreview = e.target.result;
      reader.readAsDataURL(file);
    }
  }

  navigateToDashboard() {
    const role = this.currentUser?.role?.toUpperCase();
    const routes: { [key: string]: string } = {
      'CLIENT': '/client/dashboard',
      'GERANT': '/manager/dashboard',
      'LIVREUR': '/livreur/dashboard'
    };
    this.router.navigate([routes[role] || '/']);
  }
}