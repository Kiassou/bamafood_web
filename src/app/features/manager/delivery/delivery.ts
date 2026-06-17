import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DeliveryService } from '../../../services/delivery.service';

@Component({
  selector: 'app-delivery',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './delivery.html',
  styleUrls: ['./delivery.css']
})
export class DeliveryManagerComponent implements OnInit {
  isLoading: boolean = true;
  searchTerm = '';
  filterStatus = 'ALL';
  selectedQuickFilter = 'ALL';

  showAssignModal = false;
  selectedDelivery: any = null;
  showDelivererModal = false;
  selectedDeliverer: any = null;
  deliverers: any[] = [];
  selectedDelivererId: number | string = '';

  deliveries: any[] = [];
  filteredDeliveries: any[] = [];

  totalDeliveries = 0;
  pendingCount = 0;
  inProgressCount = 0;
  deliveredCount = 0;

  delivererSearch = '';
  filteredDeliverers: any[] = [];

  constructor(private deliveryService: DeliveryService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadDeliveries();
    this.loadDeliverers();
  }

  loadDeliverers() {
    this.deliveryService.getLivreurs().subscribe(data => {
      this.deliverers = data;
      this.filteredDeliverers = [...this.deliverers];
    });
  }

  loadDeliveries() {
  this.isLoading = true;
  this.deliveryService.getDeliveries().subscribe({
    next: (data) => {
      this.deliveries = data;
      this.filteredDeliveries = [...this.deliveries];
      this.updateStats();
      this.isLoading = false;
      this.cdr.detectChanges();
    },
    error: (err) => {
      console.error(err);
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  });
}

  updateStatus(delivery: any, newStatus: string) {
    this.deliveryService.updateDeliveryStatus(delivery.id, newStatus).subscribe(() => {
      delivery.status = newStatus;
      this.applyFilters();
      this.loadDeliveries();
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
        (d.orderId && d.orderId.toString().includes(search)) ||
        (d.delivererName && d.delivererName.toLowerCase().includes(search));

      return matchesStatus && matchesSearch;
    });

    this.updateStats();
    this.cdr.detectChanges();
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
    this.inProgressCount = this.deliveries.filter(d => d.status === 'en_cours').length;
    this.deliveredCount = this.deliveries.filter(d => d.status === 'livree').length;
  }

  openAssignModal(delivery: any) {
    this.selectedDelivery = delivery;
    this.selectedDelivererId = '';
    this.showAssignModal = true;
  }

  closeAssignModal() {
  this.showAssignModal = false;
  this.selectedDelivery = null;
  this.selectedDelivererId = '';
}

openDelivererModal() {
  this.showDelivererModal = true;
}

closeDelivererModal() {
  this.showDelivererModal = false;
}


applyDelivererFilter() {
  const search = this.delivererSearch.toLowerCase().trim();

  this.filteredDeliverers = this.deliverers.filter(driver => {
    const username = (driver.username || '').toLowerCase();
    const phone = (driver.phone || '').toLowerCase();
    const fullName = `${driver.first_name || ''} ${driver.last_name || ''}`.toLowerCase();

    return (
      !search ||
      username.includes(search) ||
      phone.includes(search) ||
      fullName.includes(search) ||
      String(driver.id).includes(search)
    );
  });
}

selectDeliverer(driver: any) {
  this.selectedDeliverer = driver;
  this.selectedDelivererId = driver.id;
}

confirmSelectedDeliverer() {
  if (!this.selectedDeliverer) return;
  this.showDelivererModal = false;
}

assignDeliverer() {
  if (this.selectedDelivery && this.selectedDelivererId) {
    this.deliveryService.assignDelivery(
      this.selectedDelivery.id,
      Number(this.selectedDelivererId)
    ).subscribe({
      next: () => {
        this.loadDeliveries();
        this.closeAssignModal();
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err)
    });
  }
}

}