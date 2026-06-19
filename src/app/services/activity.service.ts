import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ActivityService {
  private apiUrl = 'https://overrun-harpist-wolverine.ngrok-free.dev/api/activities';

  constructor(private http: HttpClient) {}

  getRecentActivities(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/recent`);
  }

  getAllActivities(search = '', type = 'ALL'): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}?search=${encodeURIComponent(search)}&type=${type}`
    );
  }
}