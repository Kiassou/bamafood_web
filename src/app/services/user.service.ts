import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:3000/api/users';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  getProfile(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/profile`, {
      headers: this.getAuthHeaders()
    });
  }

  updateProfile(payload: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/profile`, payload, {
      headers: this.getAuthHeaders()
    });
  }

  changePassword(payload: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/profile/password`, payload, {
      headers: this.getAuthHeaders()
    });
  }

  getDashboardStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/dashboard-stats`, {
      headers: this.getAuthHeaders()
    });
  }

  getNotificationCount(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/notifications/count`, {
      headers: this.getAuthHeaders()
    });
  }

   getCurrentUser() {
    return JSON.parse(localStorage.getItem('user') || 'null');
  }
  
}