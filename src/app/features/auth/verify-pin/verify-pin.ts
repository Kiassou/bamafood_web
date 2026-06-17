import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AdminService } from '../../../services/admin.service'; // Ajustez le chemin selon votre structure

@Component({
  selector: 'app-verify-pin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './verify-pin.html',
  styleUrls: ['./verify-pin.css']
})
export class VerifyPinComponent implements OnInit {
  enteredPin: string = '';
  isWrongPin: boolean = false;
  errorMessage: string | null = null;
  attemptsLeft: number = 3;

  // États liés au verrouillage temporaire (Lockout)
  isLockedOut: boolean = false;
  lockoutCountdown: number = 30;
  private lockoutInterval: any;

  constructor(
    private router: Router,
    private adminService: AdminService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.checkExistingLockout();
  }

  // Sécurité anti-fraude : vérifie si un blocage est déjà actif (persiste au rafraîchissement)
  checkExistingLockout(): void {
    const lockTime = localStorage.getItem('bamafood_pin_lockout_time');
    if (lockTime) {
      const remainingSeconds = Math.round((parseInt(lockTime) - Date.now()) / 1000);
      if (remainingSeconds > 0) {
        this.triggerLockout(remainingSeconds);
      } else {
        localStorage.removeItem('bamafood_pin_lockout_time');
      }
    }
  }

  // Clic sur une touche numérique du pavé tactile
  pressKey(num: string): void {
    if (this.isLockedOut || this.enteredPin.length >= 6) return;

    this.enteredPin += num;
    this.isWrongPin = false;
    this.errorMessage = null;

    // Validation automatique dès que le 6ème chiffre est saisi
    if (this.enteredPin.length === 6) {
      setTimeout(() => {
        this.validatePin();
      }, 150);
    }
  }

  // Supprimer le dernier chiffre entré
  deleteLastDigit(): void {
    if (this.enteredPin.length > 0) {
      this.enteredPin = this.enteredPin.slice(0, -1);
    }
  }

  // Annuler et retourner au tableau de bord classique
  onCancel(): void {
    this.router.navigate(['/manager/dashboard'], { replaceUrl: true });
  }

  // Appel asynchrone sécurisé vers l'API Node.js/MySQL via notre AdminService
  validatePin(): void {
    this.adminService.verifyPin(this.enteredPin).subscribe({
      next: (response) => {
        console.log("PIN validé avec succès par l'API !", response);
        
        // Enregistrement de l'autorisation d'accès temporaire en session
        sessionStorage.setItem('bamafood_admin_authenticated', 'true');
        
        // Redirection vers le panneau d'administration des comptes (Étape 5)
        this.router.navigate(['/manager/accounts-manager'], { replaceUrl: true });
      },
      error: (err) => {
        console.error("Code PIN refusé par l'API :", err);
        this.attemptsLeft--;
        this.isWrongPin = true;
        this.enteredPin = ''; // Réinitialisation de l'affichage
        this.errorMessage = err.error?.message || "Code de sécurité incorrect.";

        // Feedback tactile (vibration) sur mobile si supporté
        if (navigator.vibrate) {
          navigator.vibrate(200);
        }

        // Si le gérant dépasse la limite de 3 tentatives, blocage de l'écran
        if (this.attemptsLeft <= 0) {
          this.triggerLockout(30);
        }

        this.cdr.detectChanges();
      }
    });
  }

  // Déclencher le compte à rebours de verrouillage
  triggerLockout(seconds: number): void {
    this.isLockedOut = true;
    this.lockoutCountdown = seconds;
    this.enteredPin = '';
    this.errorMessage = null;

    // Enregistrement de l'heure cible en millisecondes pour contrer les rechargements de page
    const endTime = Date.now() + (seconds * 1000);
    localStorage.setItem('bamafood_pin_lockout_time', endTime.toString());

    this.lockoutInterval = setInterval(() => {
      this.lockoutCountdown--;

      if (this.lockoutCountdown <= 0) {
        this.clearLockout();
      }
      this.cdr.detectChanges();
    }, 1000);
  }

  // Levée de la sécurité de blocage
  clearLockout(): void {
    clearInterval(this.lockoutInterval);
    this.isLockedOut = false;
    this.attemptsLeft = 3; // Réinitialisation à 3 essais
    localStorage.removeItem('bamafood_pin_lockout_time');
    this.cdr.detectChanges();
  }
}