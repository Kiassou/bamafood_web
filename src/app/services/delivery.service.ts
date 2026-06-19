import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DeliveryService {
  private apiUrl = 'https://overrun-harpist-wolverine.ngrok-free.dev/api/deliveries';
  private usersUrl = 'https://overrun-harpist-wolverine.ngrok-free.dev/api/users';

  constructor(private http: HttpClient) {}

  getDeliveries(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getDeliveriesByDeliverer(delivererId: number | string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/deliverer/${delivererId}`);
  }

  updateDeliveryStatus(id: number, status: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/status`, { status });
  }

  assignDelivery(deliveryId: number, livreurId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${deliveryId}/assign`, { deliverer_id: livreurId });
  }

  getLivreurs(): Observable<any[]> {
    return this.http.get<any[]>(`${this.usersUrl}/role/livreur`);
  }
}