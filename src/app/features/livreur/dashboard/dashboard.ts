import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { DeliveryService } from '../../../services/delivery.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, AsyncPipe, RouterLink],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardLivreurComponent implements OnInit {
  isLoading = true;
  showLogoutModal = false;
  searchTerm = '';
  filterStatus = 'ALL';
  selectedQuickFilter = 'ALL';

  deliveries: any[] = [];
  filteredDeliveries: any[] = [];

  totalDeliveries = 0;
  pendingCount = 0;
  deliveredCount = 0;

  driverId: number | string = '';
  unreadCount$!: Observable<number>;

  constructor(
    private deliveryService: DeliveryService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {
    this.unreadCount$ = this.notificationService.unreadCount$;
  }

  ngOnInit(): void {
    this.loadDriverId();
    this.loadDeliveries();
  }

  loadDriverId() {
    const storedUserId = localStorage.getItem('userId');

    if (storedUserId) {
      this.driverId = Number(storedUserId);
      console.log('Driver ID loaded from userId:', this.driverId);
      return;
    }

    const currentUserRaw = localStorage.getItem('currentUser');
    if (currentUserRaw) {
      try {
        const currentUser = JSON.parse(currentUserRaw);
        this.driverId = currentUser?.id ? Number(currentUser.id) : '';
        console.log('Driver ID loaded from currentUser:', this.driverId);
        return;
      } catch (e) {
        console.error('Erreur parsing currentUser:', e);
      }
    }

    this.driverId = '';
    console.log('Driver ID loaded: vide');
  }

  loadDeliveries() {
    this.isLoading = true;

    if (!this.driverId) {
      this.deliveries = [];
      this.filteredDeliveries = [];
      this.updateStats();
      this.isLoading = false;
      this.cdr.detectChanges();
      return;
    }

    this.deliveryService.getDeliveriesByDeliverer(this.driverId).subscribe({
      next: (data) => {
        this.deliveries = data || [];
        this.applyFilters();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('loadDeliveries error:', err);
        this.deliveries = [];
        this.filteredDeliveries = [];
        this.updateStats();
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  setQuickFilter(status: string) {
    this.selectedQuickFilter = status;
    this.filterStatus = status;
    this.applyFilters();
  }

  applyFilters() {
    const search = this.searchTerm.toLowerCase().trim();

    this.filteredDeliveries = this.deliveries.filter(d => {
      const matchesStatus = this.filterStatus === 'ALL' || d.status === this.filterStatus;
      const matchesSearch =
        !search ||
        (d.clientName && d.clientName.toLowerCase().includes(search)) ||
        (d.address && d.address.toLowerCase().includes(search)) ||
        (d.orderId && d.orderId.toString().includes(search));

      return matchesStatus && matchesSearch;
    });

    this.updateStats();
    this.cdr.detectChanges();
  }

  updateStatus(delivery: any, newStatus: string) {
    this.deliveryService.updateDeliveryStatus(delivery.id, newStatus).subscribe({
      next: () => {
        delivery.status = newStatus;
        this.applyFilters();
      },
      error: (err) => console.error('updateStatus error:', err)
    });
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'en_attente': return 'En attente';
      case 'en_cours': return 'En cours';
      case 'livree': return 'Livrée';
      case 'annulee': return 'Annulée';
      default: return status;
    }
  }

  getProgress(status: string): number {
    switch (status) {
      case 'en_attente': return 20;
      case 'en_cours': return 60;
      case 'livree': return 100;
      case 'annulee': return 0;
      default: return 10;
    }
  }

  private updateStats() {
    this.totalDeliveries = this.deliveries.length;
    this.pendingCount = this.deliveries.filter(d => d.status === 'en_attente').length;
    this.deliveredCount = this.deliveries.filter(d => d.status === 'livree').length;
  }

  openLogoutModal() {
    this.showLogoutModal = true;
  }

  closeLogoutModal() {
    this.showLogoutModal = false;
  }

  confirmLogout() {
    this.showLogoutModal = false;
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}