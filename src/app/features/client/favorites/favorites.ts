import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FavoritesService } from '../../../services/favorites.service';
import { AuthService } from '../../../services/auth';
import { CartService } from '../../../services/cart.service';

interface FavoriteFood {
  favoriteId: number;
  created_at: string;
  dishId: number;
  name: string;
  price: number;
  category: string;
  description: string | null;
  imageUrl: string;
  isActive: boolean;
  orderCount: number;
}

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './favorites.html',
  styleUrls: ['./favorites.css']
})
export class FavoritesComponent implements OnInit {
  favorites: FavoriteFood[] = [];
  isLoading = true;
  errorMessage = '';
  skeletonItems = Array(4);
  lastAddedFoodId: string | null = null;

  constructor(
    private favoritesService: FavoritesService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.loadFavorites();
  }

  private getCurrentUserId(): number | null {
    const user = this.authService.getCurrentUser();
    if (!user) return null;
    return user.id ? Number(user.id) : null;
  }

  loadFavorites(): void {
    const userId = this.getCurrentUserId();

    if (!userId) {
      this.isLoading = false;
      this.errorMessage = 'Aucun utilisateur connecté.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.favoritesService.getFavoritesByUser(userId).subscribe({
      next: (res: any[]) => {
        this.favorites = res.map((fav: any) => ({
          favoriteId: Number(fav.favoriteId),
          created_at: fav.created_at,
          dishId: Number(fav.dishId),
          name: fav.name,
          price: Number(fav.price),
          category: fav.category,
          description: fav.description,
          imageUrl: fav.imageUrl
            ? fav.imageUrl.startsWith('http')
              ? fav.imageUrl
              : `http://localhost:3000/${String(fav.imageUrl).replace(/^\/+/, '')}`
            : '',
          isActive: Boolean(fav.isActive),
          orderCount: Number(fav.orderCount)
        }));
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: unknown) => {
        console.error(err);
        this.errorMessage = 'Impossible de charger les favoris.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  removeFavorite(favoriteId: number): void {
    this.favoritesService.removeFavorite(favoriteId).subscribe({
      next: () => {
        this.favorites = this.favorites.filter(f => f.favoriteId !== favoriteId);
        this.cdr.detectChanges();
      },
      error: (err: unknown) => console.error('Erreur suppression favori', err)
    });
  }

  addToCart(favorite: FavoriteFood): void {
    this.cartService.addToCart({
      id: favorite.dishId.toString(),
      name: favorite.name,
      price: favorite.price,
      imageUrl: favorite.imageUrl
    }, 1);

    this.lastAddedFoodId = favorite.dishId.toString();
    this.cdr.detectChanges();

    setTimeout(() => {
      if (this.lastAddedFoodId === favorite.dishId.toString()) {
        this.lastAddedFoodId = null;
        this.cdr.detectChanges();
      }
    }, 1200);
  }
}