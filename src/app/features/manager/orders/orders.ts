import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DishService } from '../../../services/dish.service';


interface OrderItem {
  quantity: number;
  food: {
    name: string;
  };
}

interface Order {
  id: string;
  clientName: string;
  phone: string;
  created_at: Date;
  status: 'en_attente' | 'preparation' | 'livraison' | 'livree' | 'annulee';
  total_price: number;
  items: OrderItem[];
}

@Component({
  selector: 'app-orders-manager',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './orders.html',
  styleUrls: ['./orders.css']
})
export class OrdersManagerComponent implements OnInit {
  isLoading: boolean = true;
  currentFilter: 'all' | 'en_attente' | 'preparation' | 'livraison' | 'livree' | 'annulee' = 'all';

  orders: Order[] = [];
  filteredOrders: Order[] = [];

  // Compteurs pour alimenter les 6 cartes statistiques interactives hautes
  allCount = 0;
  pendingCount = 0;
  preparingCount = 0;
  shippingCount = 0;
  deliveredCount = 0;
  canceledCount = 0;

  constructor(
    private router: Router,
    private http: HttpClient,
    private dishService: DishService,
    private cdr: ChangeDetectorRef

  ) {}

  ngOnInit(): void {
    this.fetchOrders();
  }

  // Récupération sécurisée du token d'authentification JWT du gérant
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  // APPEL API NODE.JS : Chargement de l'ensemble des commandes MySQL
  fetchOrders(): void {
    this.isLoading = true;
    this.http.get<Order[]>('http://localhost:3000/api/orders/manager-orders', { headers: this.getHeaders() }).subscribe({
      next: (data) => {
        this.orders = data;
        this.calculateCounters();
        this.applyFilter();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Erreur de récupération des commandes depuis Node.js :", err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // CALCUL STATISTIQUE DES COMMANDES PAR ÉTAT POUR METTRE À JOUR LES CARTES EN TEMPS RÉEL
  calculateCounters(): void {
    this.allCount = this.orders.length;
    this.pendingCount = this.orders.filter(o => o.status === 'en_attente').length;
    this.preparingCount = this.orders.filter(o => o.status === 'preparation').length;
    this.shippingCount = this.orders.filter(o => o.status === 'livraison').length;
    this.deliveredCount = this.orders.filter(o => o.status === 'livree').length;
    this.canceledCount = this.orders.filter(o => o.status === 'annulee').length;
  }

  // METTRE À JOUR LE STATUT DE LA TRANSACTION DANS MYSQL
  updateStatus(order: Order, nextStatus: 'en_attente' | 'preparation' | 'livraison' | 'livree' | 'annulee'): void {
    this.http.put(`http://localhost:3000/api/orders/update-status/${order.id}`, { status: nextStatus }, { headers: this.getHeaders() }).subscribe({
      next: () => {
        // Mise à jour locale instantanée pour une interface fluide sans saccades
        order.status = nextStatus;
        
        // Recalculer les 6 compteurs en direct et ré-appliquer le filtre
        this.calculateCounters();
        this.applyFilter();
        
        console.log(`Commande #${order.id} modifiée avec succès en statut : ${nextStatus}`);
      },
      error: (err) => console.error("Erreur lors de la modification de l'état sur le serveur :", err)
    });
  }

  // Changer de catégorie de filtrage lors du clic sur l'une des 6 cartes statistiques
  setFilter(filter: 'all' | 'en_attente' | 'preparation' | 'livraison' | 'livree' | 'annulee'): void {
    this.currentFilter = filter;
    this.applyFilter();
  }

  applyFilter(): void {
    if (this.currentFilter === 'all') {
      this.filteredOrders = this.orders;
    } else {
      this.filteredOrders = this.orders.filter(order => order.status === this.currentFilter);
    }
  }

  // Remplacement de la boucle Django : formate proprement la liste des plats
  formatItemsList(items: OrderItem[]): string {
    return items.map(item => `${item.quantity}x ${item.food.name}`).join(', ');
  }

  backToDashboard(): void {
    this.router.navigate(['/manager/dashboard'], { replaceUrl: true });
  }
}