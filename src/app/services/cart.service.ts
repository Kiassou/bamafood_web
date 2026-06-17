import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private storageKey = 'bamafood_cart';

  private cartSubject = new BehaviorSubject<CartItem[]>(this.loadCart());
  cart$ = this.cartSubject.asObservable();

  private cartCountSubject = new BehaviorSubject<number>(this.countItems(this.loadCart()));
  cartCount$ = this.cartCountSubject.asObservable();

  private loadCart(): CartItem[] {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }

  private saveCart(cart: CartItem[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(cart));
    this.cartSubject.next(cart);
    this.cartCountSubject.next(this.countItems(cart));
  }

  private countItems(cart: CartItem[]): number {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  getCart(): CartItem[] {
    return this.cartSubject.value;
  }

  addToCart(item: Omit<CartItem, 'quantity'>, quantity = 1): void {
    const cart = [...this.cartSubject.value];
    const existing = cart.find(i => i.id === item.id);

    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({ ...item, quantity });
    }

    this.saveCart(cart);
  }

  removeItem(id: string): void {
    this.saveCart(this.cartSubject.value.filter(item => item.id !== id));
  }

  updateQuantity(id: string, amount: number): void {
    const cart = [...this.cartSubject.value];
    const item = cart.find(i => i.id === id);
    if (!item) return;

    item.quantity += amount;

    const updated = item.quantity <= 0 ? cart.filter(i => i.id !== id) : cart;
    this.saveCart(updated);
  }

  clearCart(): void {
    this.saveCart([]);
  }

  getTotal(): number {
    return this.cartSubject.value.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }
}