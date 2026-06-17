import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService, CartItem } from '../../../services/cart.service';
import { OrdersService } from '../../../services/orders.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './cart.html',
  styleUrls: ['./cart.css']
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  totalCartPrice = 0;

  showPaymentModal = false;
  showConfirmationModal = false;

  paymentMethod: 'Orange Money' | 'Moov Money' = 'Orange Money';
  phoneNumber = '';
  paymentAmount = 0;
  secretCode = '';
  delivery = false;
  deliveryAddress = '';
  paymentError = '';
  isPaying = false;

  merchantCodeOrange = '123456';
  merchantCodeMoov = '654321';

  paymentResult = {
    transactionId: '',
    method: '',
    phone: '',
    delivery: false,
    address: '',
    total: 0,
    itemsCount: 0
  };

  constructor(
    private cartService: CartService,
    private ordersService: OrdersService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
  this.loadCart();
  this.prefillClientPhone();
  this.paymentAmount = this.totalCartPrice;
}

  loadCart(): void {
    this.cartItems = this.cartService.getCart();
    this.totalCartPrice = this.cartService.getTotal();
    if (!this.paymentAmount || this.paymentAmount <= 0) {
      this.paymentAmount = this.totalCartPrice;
    }
    this.cdr.detectChanges();
  }

 prefillClientPhone(): void {
  const currentUser = localStorage.getItem('current_user');

  if (currentUser) {
    const user = JSON.parse(currentUser);
    this.phoneNumber =
      user.phoneNumber ||
      user.phone ||
      user.telephone ||
      localStorage.getItem('phoneNumber') ||
      '';
  } else {
    this.phoneNumber = localStorage.getItem('phoneNumber') || '';
  }
}

  get currentMerchantCode(): string {
    return this.paymentMethod === 'Orange Money'
      ? this.merchantCodeOrange
      : this.merchantCodeMoov;
  }

  get ussdFormat(): string {
    const amount = this.paymentAmount || this.totalCartPrice;
    return `#144#5*${this.currentMerchantCode}*${amount}*code_secret#`;
  }

  increaseQty(itemId: string): void {
    this.cartService.updateQuantity(itemId, 1);
    this.loadCart();
  }

  decreaseQty(itemId: string): void {
    this.cartService.updateQuantity(itemId, -1);
    this.loadCart();
  }

  removeItem(itemId: string): void {
    this.cartService.removeItem(itemId);
    this.loadCart();
  }

  proceedToCheckout(): void {
    this.paymentError = '';
    this.paymentAmount = this.totalCartPrice;
    this.prefillClientPhone();
    this.showPaymentModal = true;
  }

  closePaymentModal(): void {
    if (this.isPaying) return;
    this.showPaymentModal = false;
  }

  confirmPayment(): void {
    if (this.isPaying) return;

    if (!this.phoneNumber.trim()) {
      this.paymentError = 'Numéro client manquant.';
      return;
    }

    if (!this.paymentAmount || this.paymentAmount <= 0) {
      this.paymentError = 'Veuillez saisir un montant valide.';
      return;
    }

    if (!this.secretCode.trim()) {
      this.paymentError = 'Veuillez saisir le code secret.';
      return;
    }

    if (this.delivery && !this.deliveryAddress.trim()) {
      this.paymentError = 'Veuillez saisir votre adresse de livraison.';
      return;
    }

    if (this.cartItems.length === 0) {
      this.paymentError = 'Votre panier est vide.';
      return;
    }

    this.paymentError = '';
    this.isPaying = true;

    const totalItems = this.cartItems.reduce((sum, item) => sum + item.quantity, 0);

    const payload = {
      total_price: this.totalCartPrice,
      items: this.cartItems.map(item => ({
        id: Number(item.id),
        quantity: item.quantity,
        price: item.price
      })),
      paymentMethod: this.paymentMethod,
      phoneNumber: this.phoneNumber,
      paymentAmount: this.paymentAmount,
      secretCode: this.secretCode,
      merchantCode: this.currentMerchantCode,
      delivery: this.delivery,
      deliveryAddress: this.deliveryAddress
    };

    this.ordersService.checkout(payload).subscribe({
      next: (res: any) => {
        this.paymentResult = {
          transactionId: `BF-${res.orderId}`,
          method: this.paymentMethod,
          phone: this.phoneNumber,
          delivery: this.delivery,
          address: this.deliveryAddress,
          total: this.totalCartPrice,
          itemsCount: res.itemsCount ?? totalItems
        };

        this.cartService.clearCart();
        this.loadCart();

        this.showPaymentModal = false;
        this.showConfirmationModal = true;
        this.isPaying = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.paymentError = err?.error?.message || 'Erreur lors du paiement.';
        this.isPaying = false;
        this.cdr.detectChanges();
      }
    });
  }

  closeConfirmationModal(): void {
    this.showConfirmationModal = false;
  }
}