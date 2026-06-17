import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DishService } from '../../../services/dish.service';
import { CartService } from '../../../services/cart.service';
import { FavoritesService } from '../../../services/favorites.service';
import { AuthService } from '../../../services/auth';

interface FoodItem {
  id: string;
  name: string;
  price: number;
  category: string;
  imageUrl: string;
  isPopular?: boolean;
}

interface TicketItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

interface FavoriteItem {
  favoriteId: number;
  dishId: number;
}

@Component({
  selector: 'app-commander',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './commander.html',
  styleUrls: ['./commander.css']
})
export class CommanderComponent implements OnInit {
  categories: string[] = [];
  foods: FoodItem[] = [];
  searchFilter = '';
  currentCategory = 'all';
  ticket: TicketItem[] = [];
  showSuccessModal = false;
  showMobileTicket = false;
  isLoading = true;
  errorMessage = '';
  lastAddedFoodId: string | null = null;

  favoriteFoodIds: number[] = [];
  favorites: FavoriteItem[] = [];

  private readonly serverBaseUrl = 'http://localhost:3000/';

  constructor(
    private dishService: DishService,
    private cartService: CartService,
    private favoriteService: FavoritesService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadFoods();
    this.loadFavorites();
  }

  private getCurrentUserId(): number | null {
    const user = this.authService.getCurrentUser();
    if (!user) return null;
    return user.id ? Number(user.id) : null;
  }

  loadFoods(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.dishService.getClientDishes().subscribe({
      next: (data: any[]) => {
        this.foods = data
          .filter(dish => dish.isActive)
          .map(dish => ({
            id: dish.id.toString(),
            name: dish.name,
            price: dish.price,
            category: (dish.category || '').toLowerCase(),
            imageUrl: dish.imageUrl?.startsWith('http')
              ? dish.imageUrl
              : `${this.serverBaseUrl}${dish.imageUrl}`,
            isPopular: dish.orderCount > 0
          }));

        this.categories = [...new Set(this.foods.map(f => f.category))];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: unknown) => {
        console.error(err);
        this.errorMessage = 'Impossible de charger les plats.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadFavorites(): void {
    const userId = this.getCurrentUserId();

    if (!userId) {
      console.error('Aucun utilisateur connecté');
      this.favorites = [];
      this.favoriteFoodIds = [];
      return;
    }

    this.favoriteService.getFavoritesByUser(userId).subscribe({
      next: (res: any[]) => {
        this.favorites = res.map((f: any) => ({
          favoriteId: Number(f.favoriteId),
          dishId: Number(f.dishId)
        }));
        this.favoriteFoodIds = this.favorites.map(f => f.dishId);
        this.cdr.detectChanges();
      },
      error: (err: unknown) => console.error('Erreur favoris', err)
    });
  }

  get filteredFoods(): FoodItem[] {
    return this.foods.filter(food => {
      const matchesSearch = food.name.toLowerCase().includes(this.searchFilter.toLowerCase());
      const matchesCategory = this.currentCategory === 'all' || food.category === this.currentCategory;
      return matchesSearch && matchesCategory;
    });
  }

  setCategory(category: string): void {
    this.currentCategory = category.toLowerCase();
  }

  addItemToTicket(food: FoodItem): void {
    const existing = this.ticket.find(item => item.id === food.id);

    if (existing) {
      existing.quantity += 1;
    } else {
      this.ticket.push({
        id: food.id,
        name: food.name,
        price: food.price,
        quantity: 1,
        imageUrl: food.imageUrl
      });
    }

    this.lastAddedFoodId = food.id;
    this.cdr.detectChanges();

    setTimeout(() => {
      if (this.lastAddedFoodId === food.id) {
        this.lastAddedFoodId = null;
        this.cdr.detectChanges();
      }
    }, 1200);
  }

  changeQty(itemId: string, amount: number): void {
    const item = this.ticket.find(item => item.id === itemId);
    if (!item) return;

    item.quantity += amount;

    if (item.quantity <= 0) {
      this.ticket = this.ticket.filter(i => i.id !== itemId);
    }

    this.cdr.detectChanges();
  }

  get totalEstimated(): number {
    return this.ticket.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  sendToCart(): void {
    if (this.ticket.length === 0) return;

    this.ticket.forEach(item => {
      this.cartService.addToCart({
        id: item.id,
        name: item.name,
        price: item.price,
        imageUrl: item.imageUrl
      }, item.quantity);
    });

    this.showSuccessModal = true;
    this.ticket = [];

    setTimeout(() => {
      this.showSuccessModal = false;
      this.cdr.detectChanges();
    }, 3000);
  }

  isFavorite(foodId: string): boolean {
    return this.favoriteFoodIds.includes(Number(foodId));
  }

  toggleFavorite(food: FoodItem): void {
    const userId = this.getCurrentUserId();

    if (!userId) {
      console.error('Aucun utilisateur connecté');
      return;
    }

    const dishId = Number(food.id);

    console.log('toggleFavorite fired', { userId, dishId, food });
    console.log('favorites before', this.favorites);
    console.log('favoriteFoodIds before', this.favoriteFoodIds);

    const existing = this.favorites.find(f => f.dishId === dishId);

    if (existing) {
      console.log('existing favorite found', existing);

      this.favoriteService.removeFavorite(existing.favoriteId).subscribe({
        next: (res) => {
          console.log('favorite removed', res);
          this.favorites = this.favorites.filter(f => f.favoriteId !== existing.favoriteId);
          this.favoriteFoodIds = this.favoriteFoodIds.filter(id => id !== dishId);
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          console.error('Erreur suppression favori', err);
        }
      });
    } else {
      console.log('adding favorite...');

      this.favoriteService.addFavorite(userId, dishId).subscribe({
        next: (res: any) => {
          console.log('favorite added response', res);
          this.favoriteFoodIds.push(dishId);
          this.favorites.push({
            favoriteId: Number(res.favoriteId),
            dishId
          });
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          console.error('Erreur ajout favori', err);
        },
        complete: () => {
          console.log('addFavorite completed');
        }
      });
    }
  }
}