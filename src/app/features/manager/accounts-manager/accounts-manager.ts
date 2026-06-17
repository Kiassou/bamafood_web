import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService, User } from '../../../services/admin.service'; 
import { NotificationService } from '../../../services/notification.service'; 

@Component({
  selector: 'app-accounts-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './accounts-manager.html',
  styleUrls: ['./accounts-manager.css']
})
export class AccountsManagerComponent implements OnInit {
  isLoading: boolean = true;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  // Données d'utilisateurs
  allUsers: User[] = [];
  filteredUsers: User[] = [];

  // Filtres actifs
  searchQuery: string = '';
  currentFilter: 'all' | 'GERANT' | 'LIVREUR' | 'CLIENT' = 'all';

  // Compteurs statistiques
  totalCount = 0;
  managerCount = 0;
  riderCount = 0;
  clientCount = 0;

  // Variables pour le broadcast
  showBroadcastModal = false;
  broadcastSubject = '';
  broadcastMessage = '';
  isSendingBroadcast = false;

  // États de la modale de message d'alerte
  showMsgModal: boolean = false;
  activeUserForMsg: User | null = null;
  messageSubject: string = 'Avis de sécurité';
  messageBody: string = '';

  constructor(
    private router: Router,
    private adminService: AdminService, 
    private notificationService: NotificationService, 
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.checkSecurityGuard();
  }

  // Barrière de sécurité côté Angular : redirige vers le PIN si non authentifié
  checkSecurityGuard(): void {
    const isPinVerified = sessionStorage.getItem('bamafood_admin_authenticated');
    if (isPinVerified !== 'true') {
      console.warn("Accès interdit : Authentification par code PIN requise.");
      this.router.navigate(['/manager/verify-pin'], { replaceUrl: true });
    } else {
      this.loadUsersData();
    }
  }

  // Chargement des données d'utilisateurs depuis MySQL via l'AdminService
  loadUsersData(): void {
  this.isLoading = true;
  this.errorMessage = null;

  this.adminService.getAllUsers().subscribe({
    next: (data: User[]) => {
      // AJOUTE CETTE LIGNE POUR VÉRIFIER
      console.log("Données reçues par le composant :", data); 
      
      this.allUsers = data;
      this.calculateStats();
      this.applyFiltersAndSearch();
      this.isLoading = false;
      this.cdr.detectChanges();
    },
    error: (err) => {
      console.error("Erreur HTTP :", err);
      this.errorMessage = "Impossible de charger les utilisateurs.";
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  });
}

  // Calcul dynamique des statistiques pour alimenter les 4 cartes hautes
  calculateStats(): void {
    this.totalCount = this.allUsers.length;
    this.managerCount = this.allUsers.filter(u => u.role === 'GERANT').length;
    this.riderCount = this.allUsers.filter(u => u.role === 'LIVREUR').length;
    this.clientCount = this.allUsers.filter(u => u.role === 'CLIENT').length;
  }

  // Application combinée des filtres rapides (cartes ou boutons) et de la recherche textuelle
  applyFiltersAndSearch(): void {
    this.filteredUsers = this.allUsers.filter(user => {
      // Filtrage par bouton/rôle
      const matchesRole = this.currentFilter === 'all' || user.role === this.currentFilter;

      // Filtrage par zone de texte
      const q = this.searchQuery.toLowerCase().trim();
      const matchesSearch = !q ? true : (
        user.first_name.toLowerCase().includes(q) ||
        user.last_name.toLowerCase().includes(q) ||
        user.username.toLowerCase().includes(q) ||
        user.phone.includes(q) ||
        user.email.toLowerCase().includes(q)
      );

      return matchesRole && matchesSearch;
    });
  }

  onSearchChange(): void {
    this.applyFiltersAndSearch();
  }

  setRoleFilter(filter: 'all' | 'GERANT' | 'LIVREUR' | 'CLIENT'): void {
    this.currentFilter = filter;
    this.applyFiltersAndSearch();
  }

  // --- ACTIONS DE MODÉRATION ---

  // 1. Bloquer ou débloquer un compte utilisateur
  toggleBlockStatus(user: User): void {
    const nextStatus = !user.is_blocked;

    // Mise à jour optimiste de l'UI pour de la réactivité instantanée
    user.is_blocked = nextStatus;

    this.adminService.toggleUserBlock(user.id, nextStatus).subscribe({
      next: (response) => {
        this.showToast(response.message || `Compte mis à jour avec succès.`);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Erreur de blocage :", err);
        // Rétablir la valeur précédente en cas d'échec de communication avec MySQL
        user.is_blocked = !nextStatus;
        this.errorMessage = "Une erreur est survenue lors de l'action de blocage.";
        this.cdr.detectChanges();
      }
    });
  }

  // 2. Changer dynamiquement le rôle d'un compte
  onRoleChange(userId: number, event: Event): void {
    const newRole = (event.target as HTMLSelectElement).value as 'CLIENT' | 'LIVREUR' | 'GERANT';

    this.adminService.updateUserRole(userId, newRole).subscribe({
      next: (response) => {
        this.showToast(response.message || "Rôle modifié avec succès !");
        
        // Mettre à jour la liste locale et recalculer les cartes
        const user = this.allUsers.find(u => u.id === userId);
        if (user) {
          user.role = newRole;
          this.calculateStats();
          this.applyFiltersAndSearch();
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Erreur de rôle :", err);
        this.errorMessage = "Impossible de mettre à jour le rôle de l'utilisateur.";
        this.cdr.detectChanges();
      }
    });
  }

  // --- ENVOI DE MESSAGE D'ALERTE DIRECT (MODALE) ---

  sendSystemBroadcast(): void {
  // Vérification de sécurité
  if (!this.broadcastSubject.trim() || !this.broadcastMessage.trim()) return;

  this.isSendingBroadcast = true;
  this.cdr.detectChanges(); // Force le changement d'état UI (bouton devient "Envoi...")

  const payload = {
    subject: this.broadcastSubject,
    message: this.broadcastMessage
  };

  this.notificationService.sendBroadcast(payload).subscribe({
    next: (response) => {
      console.log("Broadcast envoyé avec succès", response);
      
      // RÉINITIALISATION
      this.isSendingBroadcast = false; // Désactive le spinner
      this.showBroadcastModal = false; // Ferme la modale
      this.broadcastSubject = '';
      this.broadcastMessage = '';
      
      this.showToast('Annonce globale diffusée avec succès !');
      this.cdr.detectChanges(); // FORCE LA MISE À JOUR DE L'INTERFACE
    },
    error: (err) => {
      console.error("Erreur broadcast :", err);
      this.isSendingBroadcast = false; // Désactive le spinner même en cas d'erreur
      alert("Erreur lors de l'envoi de l'annonce.");
      this.cdr.detectChanges(); // FORCE LA MISE À JOUR DE L'INTERFACE
    }
  });
}

  openMessageModal(user: User): void {
    this.activeUserForMsg = user;
    this.messageBody = '';
    this.showMsgModal = true;
    this.cdr.detectChanges();
  }

  closeMessageModal(): void {
    this.showMsgModal = false;
    this.activeUserForMsg = null;
    this.cdr.detectChanges();
  }

  sendSystemMessage(): void {
  if (!this.messageBody.trim() || !this.activeUserForMsg) {
    return;
  }

  // Préparation de l'objet à envoyer
  const payload = {
    recipient_id: this.activeUserForMsg.id, // Assure-toi que c'est bien l'ID de l'utilisateur
    subject: this.messageSubject,
    message: this.messageBody
  };

  // Appel au service pour envoyer à la DB
  this.notificationService.sendMessage(payload).subscribe({
    next: () => {
      console.log("Message enregistré en base de données avec succès !");
      this.showToast(`Alerte transmise avec succès à ${this.activeUserForMsg?.first_name} !`);
      this.closeMessageModal();
    },
    error: (err) => {
      console.error("Erreur lors de l'envoi à la base :", err);
      alert("Erreur : Impossible d'envoyer la notification.");
    }
  });
 }

  // --- LOGIQUE VISUELLE SECONDAIRE ---

  private showToast(message: string): void {
    this.successMessage = message;
    setTimeout(() => {
      this.successMessage = null;
      this.cdr.detectChanges();
    }, 4000);
  }

  backToDashboard(): void {
    sessionStorage.removeItem('bamafood_admin_authenticated');
    this.router.navigate(['/manager/dashboard'], { replaceUrl: true });
  }

  // Verrouiller la session gérant et retourner à l'étape PIN
  lockConsole(): void {
    sessionStorage.removeItem('bamafood_admin_authenticated');
    this.router.navigate(['/manager/verify-pin'], { replaceUrl: true });
  }
}