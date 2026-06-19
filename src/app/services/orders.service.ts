import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface OrderItem {
  quantity: number;
  food: {
    name: string;
  };
  price: number;
}

export interface Order {
  id: number;
  user_id: number;
  total_price: number;
  status: 'en_attente' | 'preparation' | 'livraison' | 'livree' | 'annulee';
  created_at: string;
  items: OrderItem[];
}

@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  private apiUrl = 'https://overrun-harpist-wolverine.ngrok-free.dev/api/orders';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  getMyOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/my-orders`, {
      headers: this.getAuthHeaders()
    });
  }

  checkout(payload: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/create`, payload, {
      headers: this.getAuthHeaders()
    });
  }

  getManagerOrders(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/manager-orders`, {
      headers: this.getAuthHeaders()
    });
  }

  updateOrderStatus(orderId: number, status: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/update-status/${orderId}`, { status }, {
      headers: this.getAuthHeaders()
    });
  }

  callRider(orderId: number): Observable<any> {
  return this.http.post(`${this.apiUrl}/call-rider/${orderId}`, {}, {
    headers: this.getAuthHeaders()
  });
}

getReceipt(orderId: number): Observable<any> {
  return this.http.get(`${this.apiUrl}/receipt/${orderId}`, {
    headers: this.getAuthHeaders()
  });
}
}