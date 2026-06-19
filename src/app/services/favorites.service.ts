import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private baseUrl = 'https://overrun-harpist-wolverine.ngrok-free.dev/api/favorites';

  constructor(private http: HttpClient) {}

  getFavoritesByUser(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/${userId}`);
  }

  addFavorite(userId: number, dishId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/${userId}`, { dishId });
  }

  removeFavorite(favoriteId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${favoriteId}`);
  }
}