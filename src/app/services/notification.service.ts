import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs'; // Ajout de BehaviorSubject
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private apiUrl = 'https://overrun-harpist-wolverine.ngrok-free.dev/api/notifications';

  // Le "flux" qui contient le nombre de messages non lus
  private unreadCountSubject = new BehaviorSubject<number>(0);
  unreadCount$ = this.unreadCountSubject.asObservable(); // Utilisé dans le HTML

  constructor(private http: HttpClient) {
    this.initialLoad();
  }

  private initialLoad() {
    // On charge les notifications une fois au lancement
    this.getNotifications().subscribe({
      error: (err) => console.log("Chargement initial silencieux...")
    });
  }

  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return { headers: new HttpHeaders({ 'Authorization': `Bearer ${token}` }) };
  }

  // Méthode de calcul centralisée
  private refreshUnreadCount(notifications: any[]) {
    const count = notifications.filter(n => !n.is_read || n.is_read == 0).length;
    this.unreadCountSubject.next(count);
  }

  getNotifications(): Observable<any[]> { 
    return this.http.get<any[]>(this.apiUrl, this.getAuthHeaders()).pipe( 
      tap((data: any[]) => this.refreshUnreadCount(data))
    );
  }

  markAsRead(id: number): Observable<any> {
  // Appel API pour mettre à jour en base de données
  return this.http.put(`${this.apiUrl}/${id}/read`, {}, this.getAuthHeaders()).pipe(
    tap(() => {
      // Optionnel : tu peux recharger toute la liste pour être 100% sûr de la cohérence
      // ou simplement décrémenter le compteur manuellement.
      this.getNotifications().subscribe(); 
    })
  );
}

  // IMPORTANT : Après chaque envoi ou suppression, il faut recharger la liste 
  // pour que le compteur (unreadCount) soit recalculé par le serveur
  sendMessage(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/send`, data, this.getAuthHeaders());
  }

  deleteNotification(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, this.getAuthHeaders())
      .pipe(tap(() => this.getNotifications().subscribe())); // Recharge la liste auto
  }

  sendBroadcast(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/broadcast`, data, this.getAuthHeaders());
  }

  loadUnreadCount(): void {
    this.getNotifications().subscribe({
      next: (data: any[]) => {
        const count = data.filter(n => !n.is_read || n.is_read == 0).length;
        this.unreadCountSubject.next(count);
      },
      error: (err) => console.log("Erreur chargement notifications", err)
    });
  }
}