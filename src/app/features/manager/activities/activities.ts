import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ActivityService } from '../../../services/activity.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-activities',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './activities.html',
  styleUrls: ['./activities.css']
})
export class ActivitiesManagerComponent implements OnInit {
  searchTerm = '';
  filterType = 'ALL';

  activities: any[] = [];
  filteredActivities: any[] = [];

  securityCount = 0;
  orderCount = 0;

  constructor(private activityService: ActivityService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadActivities();
  }

  loadActivities() {
    this.activityService.getAllActivities().subscribe({
      next: (data) => {
        this.activities = data || [];
        this.filteredActivities = [...this.activities];
        this.updateStats();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('loadActivities error:', err);
        this.activities = [];
        this.filteredActivities = [];
        this.updateStats();
      }
    });
  }

  applyFilters() {
    const search = this.searchTerm.toLowerCase().trim();

    this.filteredActivities = this.activities.filter(act => {
      const matchesType = this.filterType === 'ALL' || act.type === this.filterType;
      const matchesSearch =
        !search ||
        (act.user && act.user.toLowerCase().includes(search)) ||
        (act.description && act.description.toLowerCase().includes(search)) ||
        (act.type && act.type.toLowerCase().includes(search));

      return matchesType && matchesSearch;
    });

    this.updateStats();
  }

  private updateStats() {
    this.securityCount = this.activities.filter(a => a.type === 'SECURITY').length;
    this.orderCount = this.activities.filter(a => a.type === 'ORDER').length;
  }
}