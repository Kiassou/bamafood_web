import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NotificationService } from '../../services/notification.service';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './notification.html',
  styleUrls: ['./notification.css']
})
export class NotificationComponent implements OnInit {
  notifications: any[] = [];
  filteredNotifications: any[] = [];
  searchQuery: string = '';
  
  // Variables pour la modale et la réponse
  selectedNotification: any = null;
  replyMessage: string = ''; 
  showDetailsModal = false;
  showDeleteModal = false;
  isSending = false; // Pour éviter les doubles clics
  isLoading = false;
  particles = Array(10).fill(0);
  currentUser: any = null;
  
  constructor(
    private notificationService: NotificationService, 
    private cdr: ChangeDetectorRef,
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadNotifications();
    // charger user pour connaitre son role
    this.currentUser = this.userService.getCurrentUser();
  }

  loadNotifications() {
    this.isLoading = true;
    this.notificationService.getNotifications().subscribe({
      next: (data) => {
        this.notifications = data || [];
        this.filteredNotifications = [...this.notifications];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Erreur chargement :", err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  filterNotifications() {
    const q = this.searchQuery.toLowerCase();
    this.filteredNotifications = this.notifications.filter(n => 
      n.subject?.toLowerCase().includes(q) || 
      n.message?.toLowerCase().includes(q)
    );
  }

  openDetails(notif: any) {
  this.selectedNotification = notif;
  this.replyMessage = '';
  this.showDetailsModal = true;

  // Si non lu, on marque comme lu
  if (notif.is_read === 0) {
    // 1. Mise à jour visuelle immédiate (côté client)
    notif.is_read = 1; 
    
    // 2. Appel serveur en arrière-plan
    this.notificationService.markAsRead(notif.id).subscribe({
      next: () => console.log("Message marqué comme lu en base."),
      error: (err) => {
        // En cas d'erreur, on remet à 0 (Rollback)
        notif.is_read = 0;
        console.error("Erreur marquage lu :", err);
      }
    });
  }
}

  closeDetails() { 
    this.showDetailsModal = false; 
    this.replyMessage = '';
  }

  // LOGIQUE D'ENVOI DE RÉPONSE
  replyToNotification() {
    if (!this.replyMessage.trim()) return;

    this.isSending = true;
    const payload = {
      recipient_id: this.selectedNotification.sender_id,
      subject: `Re: ${this.selectedNotification.subject}`,
      message: this.replyMessage
    };

    this.notificationService.sendMessage(payload).subscribe({
      next: () => {
        alert('Réponse envoyée avec succès !');
        this.isSending = false;
        this.closeDetails();
      },
      error: (err) => {
        console.error("Erreur envoi :", err);
        this.isSending = false;
        alert('Erreur lors de l\'envoi.');
      }
    });
  }

  openDeleteModal(notif: any) {
    this.selectedNotification = notif;
    this.showDeleteModal = true;
  }

  closeDeleteModal() { this.showDeleteModal = false; }

  confirmDelete() {
    if (!this.selectedNotification) return;

    this.notificationService.deleteNotification(this.selectedNotification.id).subscribe({
      next: () => {
        this.notifications = this.notifications.filter(n => n.id !== this.selectedNotification.id);
        this.filteredNotifications = [...this.notifications];
        this.closeDeleteModal();
        this.closeDetails();
      },
      error: (err) => console.error("Erreur suppression :", err)
    });
  }

  getSenderInitials(notif: any): string {
    if (!notif) return '?';
    const f = notif.first_name?.[0] || '';
    const l = notif.last_name?.[0] || '';
    return (f + l).toUpperCase() || '?';
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