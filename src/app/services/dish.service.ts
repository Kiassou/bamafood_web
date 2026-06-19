import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DishService {
  private apiUrl = 'https://overrun-harpist-wolverine.ngrok-free.dev/api/dishes'; // Ton API Node.js

  constructor(private http: HttpClient) {}

  // Génération des headers d'authentification avec le token JWT du gérant
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // AJOUTER UN PLAT (Utilisation de FormData pour envoyer le fichier image)
  createDish(formData: FormData): Observable<any> {
    const headers = this.getAuthHeaders();
    // Note : On ne définit pas manuellement le Content-Type à multipart/form-data, 
    // le navigateur s'en charge lui-même avec la bonne clé "boundary".
    return this.http.post<any>(`${this.apiUrl}/add`, formData, { headers });
  }

  // RÉCUPÉRER TOUS LES PLATS POUR LE COMPOSANT MANAGER
  getManagerCatalog(): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(`${this.apiUrl}/all`, { headers });
  }

  // CHANGER L'ÉTAT D'ACTIVATION D'UN PLAT (Switch En ligne / Hors ligne)
  toggleDishStatus(id: number, isActive: boolean): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.patch<any>(`${this.apiUrl}/toggle/${id}`, { isActive }, { headers });
  }

  // RÉCUPÉRER LES PLATS PUBLIÉS POUR LE CLIENT (commander)
  getClientDishes(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/catalog`);

}
  
}