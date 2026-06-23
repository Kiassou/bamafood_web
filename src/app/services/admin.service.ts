import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface User {
  id: number;
  last_name: string;
  first_name: string;
  username: string;
  phone: string;
  email: string;
  role: 'CLIENT' | 'LIVREUR' | 'GERANT';
  is_blocked: boolean;
  avatar: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  private apiUrl = 'http://localhost:3000/api/admin';

  constructor(private http: HttpClient) {}
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // --- 1. ENVOI DU CODE PIN POUR VÉRIFICATION ---
  verifyPin(pin: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/verify-pin`, { pin }, { headers: this.getAuthHeaders() });
  }

  // --- 2. RÉCUPÉRATION DE TOUS LES COMPTES UTILISATEURS ---
  getAllUsers(): Observable<User[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users/all`, { headers: this.getAuthHeaders() }).pipe(
      map(users => users.map(u => ({
        id: u.id,
        first_name: u.first_name, // Assure-toi que c'est exactement ce nom
        last_name: u.last_name,
        username: u.username,
        role: u.role,
        phone: u.phone,
        email: u.email,
        is_blocked: !!u.is_blocked, // Convertit le 0/1 en boolean
        avatar: u.first_name && u.last_name ? (u.first_name[0] + u.last_name[0]).toUpperCase() : '' // Génère l'initiale
      })))
    );
  }

  // --- 3. MODIFICATION DU RÔLE D'UN UTILISATEUR ---
  updateUserRole(userId: number, role: 'CLIENT' | 'LIVREUR' | 'GERANT'): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrl}/users/role/${userId}`, 
      { role }, 
      { headers: this.getAuthHeaders() }
    );
  }

  // --- 4. BLOCAGE / DÉBLOCAGE D'UN COMPTE ---
  toggleUserBlock(userId: number, isBlocked: boolean): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrl}/users/toggle-block/${userId}`, 
      { isBlocked }, 
      { headers: this.getAuthHeaders() }
    );
  }
}