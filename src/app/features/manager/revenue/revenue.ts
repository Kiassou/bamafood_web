import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import Chart from 'chart.js/auto';
import { DashboardService } from '../../../services/dashboard.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-revenue',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './revenue.html',
  styleUrls: ['./revenue.css']
})
export class RevenueComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('dayChartCanvas') dayChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('weekChartCanvas') weekChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('monthChartCanvas') monthChartCanvas!: ElementRef<HTMLCanvasElement>;

  form!: FormGroup;
  summary: any = { dayRevenue: 0, weekRevenue: 0, monthRevenue: 0 };
  list: any[] = [];
  totalList = 0;

  dayChart: any;
  weekChart: any;
  monthChart: any;

  private destroy$ = new Subject<void>();
  private viewReady = false;
  private summaryReady = false;

  constructor(private fb: FormBuilder, 
    private dashboardService: DashboardService, 
    private router: Router,
    private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      search: [''],
      period: ['all'],
      startDate: [''],
      endDate: ['']
    });

    this.loadSummary();
    this.loadList();

    this.form.valueChanges
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadList();
      });
  }

  ngAfterViewInit(): void {
    this.viewReady = true;
    this.renderChartsIfReady();
  }

  loadSummary(): void {
    this.dashboardService.getRevenueSummary().subscribe((res) => {
      this.summary = res;
      this.summaryReady = true;
      this.renderChartsIfReady();
      this.cdr.detectChanges();
    });
  }

  loadList(): void {
    const { search, period, startDate, endDate } = this.form.value;
    const params: any = { search, period };

    if (startDate) params.from = startDate;
    if (endDate) params.to = endDate;

    this.dashboardService.getRevenueList(params).subscribe((res) => {
      this.list = res;
      this.totalList = this.list.reduce((sum, item) => sum + Number(item.totalPrice || 0), 0);
      this.cdr.detectChanges();
    });
  }

  renderChartsIfReady(): void {
    if (!this.viewReady || !this.summaryReady) return;
    setTimeout(() => this.renderCharts());
  }

  renderCharts(): void {
    if (this.dayChart) this.dayChart.destroy();
    if (this.weekChart) this.weekChart.destroy();
    if (this.monthChart) this.monthChart.destroy();

    const dayCtx = this.dayChartCanvas?.nativeElement?.getContext('2d');
    const weekCtx = this.weekChartCanvas?.nativeElement?.getContext('2d');
    const monthCtx = this.monthChartCanvas?.nativeElement?.getContext('2d');

    if (!dayCtx || !weekCtx || !monthCtx) return;

    this.dayChart = new Chart(dayCtx, {
      type: 'line',
      data: {
        labels: ['1', '2', '3', '4', '5', '6', '7'],
        datasets: [{
          data: [12, 14, 13, 16, 18, 17, Number(this.summary.dayRevenue || 0)],
          borderColor: '#ffb800',
          backgroundColor: 'rgba(255, 184, 0, 0.12)',
          tension: 0.4,
          fill: true,
          pointRadius: 0,
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        scales: {
          x: { display: false },
          y: { display: false }
        }
      }
    });

    this.weekChart = new Chart(weekCtx, {
      type: 'line',
      data: {
        labels: ['L', 'M', 'M', 'J', 'V', 'S', 'D'],
        datasets: [{
          data: [20, 18, 22, 19, 25, 23, Number(this.summary.weekRevenue || 0)],
          borderColor: '#ff8c00',
          backgroundColor: 'rgba(255, 140, 0, 0.12)',
          tension: 0.4,
          fill: true,
          pointRadius: 0,
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        scales: {
          x: { display: false },
          y: { display: false }
        }
      }
    });

    this.monthChart = new Chart(monthCtx, {
      type: 'line',
      data: {
        labels: ['S1', 'S2', 'S3', 'S4'],
        datasets: [{
          data: [30, 35, 31, Number(this.summary.monthRevenue || 0)],
          borderColor: '#ffffff',
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
          tension: 0.4,
          fill: true,
          pointRadius: 0,
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        scales: {
          x: { display: false },
          y: { display: false }
        }
      }
    });
  }

  downloadPdf(): void {
  this.dashboardService.downloadRevenuePdf(this.form.value).subscribe((blob) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'revenus-bamafood.pdf';
    a.click();
    window.URL.revokeObjectURL(url);
  });
}

  back() {
    this.router.navigate(['/manager/dashboard']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    if (this.dayChart) this.dayChart.destroy();
    if (this.weekChart) this.weekChart.destroy();
    if (this.monthChart) this.monthChart.destroy();
  }
}