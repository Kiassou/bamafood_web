import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrdersService, Order } from '../../../services/orders.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './orders.html',
  styleUrls: ['./orders.css']
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  isLoading = true;
  errorMessage = '';

  selectedReceipt: any = null;
  showReceiptModal = false;
  showDeliverySuccessModal = false;
  deliverySuccessMessage = '';
  deliveryRequestedOrders: number[] = [];

  constructor(
    private ordersService: OrdersService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadOrders(); 
    this.loadDeliveryRequestedOrders();
  }

  private saveDeliveryRequestedOrders(): void {
    localStorage.setItem(
      'deliveryRequestedOrders',
      JSON.stringify(this.deliveryRequestedOrders)
    );
  }

  private loadDeliveryRequestedOrders(): void {
    const saved = localStorage.getItem('deliveryRequestedOrders');
    this.deliveryRequestedOrders = saved ? JSON.parse(saved) : [];
  }

  loadOrders(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.ordersService.getMyOrders().subscribe({
      next: (data) => {
        this.orders = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Impossible de charger vos commandes.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  formatItemsList(items: any[]): string {
    return items.map(item => `${item.quantity}x ${item.food.name}`).join(', ');
  }

  callRider(orderId: number): void {
  if (this.deliveryRequestedOrders.includes(orderId)) {
    return;
  }

  this.ordersService.callRider(orderId).subscribe({
    next: (res) => {
      console.log('Livreur contacté', res);
      this.deliverySuccessMessage = res.message || 'Livreur notifié avec succès.';
      this.showDeliverySuccessModal = true;

      this.deliveryRequestedOrders.push(orderId);
      this.saveDeliveryRequestedOrders();

      this.cdr.detectChanges();
    },
    error: (err) => {
      console.error('Erreur appel livreur', err);
    }
  });
}

viewReceipt(orderId: number): void {
  console.log('click reçu', orderId);

  this.ordersService.getReceipt(orderId).subscribe({
    next: (res) => {
      console.log('receipt reçu', res);
      this.selectedReceipt = res;
      this.showReceiptModal = true;
      this.cdr.detectChanges();
    },
    error: (err) => {
      console.error('Erreur reçu', err);
    }
  });
}

  closeReceiptModal(): void {
    this.showReceiptModal = false;
    this.selectedReceipt = null;
  }
}