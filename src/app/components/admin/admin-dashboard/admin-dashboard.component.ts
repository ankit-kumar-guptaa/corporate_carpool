import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  
  totalRides: number = 0;
  totalRequests: number = 0;
  totalUsers: number = 0;
  totalFuelSaved: number = 0;
  isLoadingStats: boolean = true;

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.isLoadingStats = true;
    
    // Fetch top-level stats
    this.adminService.getDashboardStats(this.currentFilter).subscribe({
      next: (res: any) => {
        if (res && res.status === 1 && res.data) {
           this.totalRides = res.data.totalRides;
           this.totalRequests = res.data.totalRequests;
           this.totalUsers = res.data.totalUsers;
           this.totalFuelSaved = res.data.totalFuelSaved || 0;
        }
      },
      error: (err) => console.error('Error fetching stats', err)
    });

    // Fetch chart data
    this.adminService.getDashboardChartData().subscribe({
        next: (res: any) => {
            if (res && res.status === 1 && res.data) {
                if (res.data.monthlyStats && res.data.monthlyStats.length > 0) {
                    this.monthlyStats = res.data.monthlyStats;
                }
                if (res.data.weeklyStats && res.data.weeklyStats.length > 0) {
                    this.weeklyStats = res.data.weeklyStats;
                }
                if (res.data.dailyStats && res.data.dailyStats.length > 0) {
                    this.dailyStats = res.data.dailyStats;
                }
                if (res.data.rideStatusStats && res.data.rideStatusStats.length > 0) {
                    this.rideStatusStats = res.data.rideStatusStats;
                }
            }
        },
        error: (err) => console.error('Error fetching chart data', err)
    });

    // Fetch Top Employees
    this.adminService.getAllEmployees().subscribe({
        next: (res: any) => {
            if (res && res.status === 1 && res.data) {
                // Grab top 5 by rides
                this.topEmployees = res.data.slice(0, 5).map((e: any) => ({
                    name: e.name,
                    dept: 'Corporate', // Fallback or could add to API
                    role: e.role,
                    rides: e.rides,
                    distance: e.distance,
                    co2: e.co2
                }));
            }
            this.isLoadingStats = false;
        },
        error: (err) => {
            console.error('Error fetching employees for dashboard top list', err);
            this.isLoadingStats = false;
        }
    });

  }

  // Stats for Charts
  currentFilter: string = 'Monthly';

  monthlyStats: any[] = [];
  weeklyStats: any[] = [];
  dailyStats: any[] = [];
  rideStatusStats: any[] = [];

  get currentStats() {
    switch (this.currentFilter) {
        case 'Weekly': return this.weeklyStats;
        case 'Today': return this.dailyStats;
        default: return this.monthlyStats;
    }
  }

  setFilter(filter: string) {
    this.currentFilter = filter;
    this.loadStats(); // Re-fetch the stats dynamically with the new filter
  }

  // Helper for Chart Scaling
  getMaxValue(type: 'rides' | 'co2'): number {
    return Math.max(...this.currentStats.map(s => s[type])) * 1.1; // 10% padding
  }

  // Generate Bar Height (0-100%)
  getBarHeight(val: number): string {
    const max = this.getMaxValue('rides');
    return `${(val / max) * 100}%`;
  }

  // Generate SVG Points for Line Chart
  getPolylinePoints(): string {
    const stats = this.currentStats;
    const maxCo2 = this.getMaxValue('co2');
    
    // We need to map each data point to X,Y coordinates
    // X is distributed evenly: (index / (count - 1)) * 100
    // Y is inverted: 100 - (value / max) * 100
    
    return stats.map((stat, index) => {
        const x = (index / (stats.length - 1)) * 100;
        const y = 100 - ((stat.co2 / maxCo2) * 100);
        return `${x},${y}`;
    }).join(' ');
  }

  // Top Employees with Role
  topEmployees: any[] = [];
}
