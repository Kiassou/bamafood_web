import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  downloadPdf(value: any) {
    throw new Error('Method not implemented.');
  }
  private apiUrl = 'http://localhost:3000/api/manager';

  constructor(private http: HttpClient) {}

  getDashboardData(): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboard-data`);
  }

  getRecentRevenueOrders(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/dashboard-revenue-orders`);
  }

  getRecentPendingOrders(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/dashboard-pending-orders`);
  }

  getRecentDishes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/dashboard-recent-dishes`);
  }

  getRevenueSummary(): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboard-revenue-summary`);
  }

  getRevenueList(params: any = {}): Observable<any[]> {
    const queryParams = new URLSearchParams();

    if (params.search) queryParams.set('search', params.search);
    if (params.from) queryParams.set('from', params.from);
    if (params.to) queryParams.set('to', params.to);
    if (params.period) queryParams.set('period', params.period);

    return this.http.get<any[]>(`${this.apiUrl}/dashboard-revenue-list?${queryParams.toString()}`);
  }

  downloadRevenuePdf(params: any = {}): Observable<Blob> {
    const queryParams = new URLSearchParams();

    if (params.search) queryParams.set('search', params.search);
    if (params.from) queryParams.set('from', params.from);
    if (params.to) queryParams.set('to', params.to);
    if (params.period) queryParams.set('period', params.period);

    return this.http.get(`${this.apiUrl}/dashboard-revenue-pdf?${queryParams.toString()}`, {
      responseType: 'blob'
    });
  }

}