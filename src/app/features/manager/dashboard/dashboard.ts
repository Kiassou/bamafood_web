import { Component, HostListener, OnInit, AfterViewInit, OnDestroy, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { NotificationService } from '../../../services/notification.service';
import { DashboardService } from '../../../services/dashboard.service';
import { ActivityService } from '../../../services/activity.service';
import Chart from 'chart.js/auto';

interface Order {
  id: number;
  clientName: string;
  dishNames: string;
  createdAt: Date;
}

interface Activity {
  type: string;
  description: string;
  createdAt: Date;
}

@Component({
  selector: 'app-dashboard-manager',
  standalone: true,
  imports: [CommonModule, RouterLink, AsyncPipe],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardManagerComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('miniRevenueChart') miniRevenueChart!: ElementRef<HTMLCanvasElement>;

  isSidebarClosed = false;
  isSidebarOpen = false;
  isLoading = true;
  username = localStorage.getItem('username') || 'Gérant';

  totalRevenue = 0;
  pendingCount = 0;
  totalDishes = 0;

  priorityOrders: Order[] = [];
  recentActivities: Activity[] = [];

  showDetailModal = false;
  modalTitle = '';
  activeDetailType: 'revenue' | 'pending' | 'dishes' | '' = '';
  detailItems: any[] = [];
  detailLink = '';

  showLogoutModal = false;
  unreadCount$!: Observable<number>;

  summary: any = { dayRevenue: 0, weekRevenue: 0, monthRevenue: 0 };

  now = new Date();

  miniChart: any;
  private viewReady = false;
  private summaryReady = false;
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private notificationService: NotificationService,
    private dashboardService: DashboardService,
    private activityService: ActivityService,
    private cdr: ChangeDetectorRef
  ) {
    this.unreadCount$ = this.notificationService.unreadCount$;
  }

  ngOnInit(): void {
    this.fetchDashboardData();
    this.loadUnreadCount();
    this.startClock();
    this.loadSummary();
  }

  ngAfterViewInit(): void {
    this.viewReady = true;
    this.renderMiniChartIfReady();
  }

  startClock(): void {
    setInterval(() => {
      this.now = new Date();
      this.cdr.detectChanges();
    }, 1000);
  }

  loadSummary(): void {
    this.dashboardService.getRevenueSummary().subscribe({
      next: (data) => {
        this.summary = data || { dayRevenue: 0, weekRevenue: 0, monthRevenue: 0 };
        this.summaryReady = true;
        this.renderMiniChartIfReady();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading summary:', err);
        this.summary = { dayRevenue: 0, weekRevenue: 0, monthRevenue: 0 };
        this.summaryReady = true;
        this.renderMiniChartIfReady();
        this.cdr.detectChanges();
      }
    });
  }

  renderMiniChartIfReady(): void {
    if (!this.viewReady || !this.summaryReady) return;
    setTimeout(() => this.renderMiniChart());
  }

  renderMiniChart(): void {
    if (this.miniChart) this.miniChart.destroy();

    const canvas = this.miniRevenueChart?.nativeElement;
    if (!canvas) return;

    // Ajuster la taille du canvas pour le padding du parent
    const rect = canvas.parentElement!.getBoundingClientRect();
    canvas.width = rect.width - 20;  // Soustraire le padding horizontal (10px de chaque côté)
    canvas.height = 220;           // Hauteur fixe pour le style (moins que 250px)

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    this.miniChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
        datasets: [
          {
            label: 'Jour',
            data: [2, 4, 3, 5, 6, 4, Number(this.summary.dayRevenue || 0)],
            borderColor: '#ffb800',
            backgroundColor: 'rgba(255, 184, 0, 0.12)',
            tension: 0.4,
            fill: false,
            pointRadius: 2,
            borderWidth: 2
          },
          {
            label: 'Semaine',
            data: [12, 14, 13, 16, 18, 17, Number(this.summary.weekRevenue || 0)],
            borderColor: '#ff8c00',
            backgroundColor: 'rgba(255, 140, 0, 0.12)',
            tension: 0.4,
            fill: false,
            pointRadius: 2,
            borderWidth: 2
          },
          {
            label: 'Mois',
            data: [30, 35, 31, 38, 42, 40, Number(this.summary.monthRevenue || 0)],
            borderColor: '#ff5f1f',
            backgroundColor: 'rgba(255, 95, 31, 0.12)',
            tension: 0.4,
            fill: false,
            pointRadius: 2,
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true, position: 'bottom' },
          tooltip: { enabled: true }
        }
      }
    });
  }

  loadUnreadCount(): void {
    this.notificationService.loadUnreadCount();
  }

  fetchDashboardData(): void {
    this.isLoading = true;
    this.dashboardService.getDashboardData().subscribe({
      next: (data) => {
        this.totalRevenue = data.revenue || 0;
        this.pendingCount = data.pendingCount || 0;
        this.totalDishes = data.totalDishes || 0;
        this.priorityOrders = data.priorityOrders || [];

        this.activityService.getRecentActivities().subscribe({
          next: (acts) => {
            this.recentActivities = acts || [];
            this.isLoading = false;
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error('loadRecentActivities error:', err);
            this.recentActivities = [];
            this.isLoading = false;
            this.cdr.detectChanges();
          }
        });
      },
      error: (err) => {
        console.error('Erreur de connexion MySQL :', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  openDetailModal(type: 'revenue' | 'pending' | 'dishes'): void {
    this.activeDetailType = type;
    this.showDetailModal = true;
    this.detailItems = [];

    if (type === 'revenue') {
      this.modalTitle = '5 dernières recettes';
      this.detailLink = '/manager/revenue';
      this.dashboardService.getRecentRevenueOrders().subscribe({
        next: (data) => {
          this.detailItems = data || [];
          this.cdr.detectChanges();
        }
      });
    }

    if (type === 'pending') {
      this.modalTitle = '5 commandes en préparation';
      this.detailLink = '/manager/orders';
      this.dashboardService.getRecentPendingOrders().subscribe({
        next: (data) => {
          this.detailItems = data || [];
          this.cdr.detectChanges();
        }
      });
    }

    if (type === 'dishes') {
      this.modalTitle = '5 plats actifs récents';
      this.detailLink = '/manager/dishes';
      this.dashboardService.getRecentDishes().subscribe({
        next: (data) => {
          this.detailItems = data || [];
          this.cdr.detectChanges();
        }
      });
    }
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
  }

  openLogoutModal(): void {
    this.showLogoutModal = true;
  }

  closeLogoutModal(): void {
    this.showLogoutModal = false;
  }

  confirmLogout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    if (event.target.innerWidth > 992) {
      this.isSidebarOpen = false;
    }
  }

  toggleSidebar(): void {
    if (window.innerWidth > 992) {
      this.isSidebarClosed = !this.isSidebarClosed;
    } else {
      this.isSidebarOpen = !this.isSidebarOpen;
    }
  }

  closeSidebar(): void {
    this.isSidebarOpen = false;
  }

  formatDate(dateValue: string | Date): string {
    const d = new Date(dateValue);
    return d.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.miniChart) this.miniChart.destroy();
  }
}