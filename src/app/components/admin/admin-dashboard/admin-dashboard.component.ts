import { Component } from '@angular/core';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent {
  
  // Stats for Charts
  currentFilter: string = 'Monthly';

  monthlyStats = [
      { label: 'Jan', rides: 450, co2: 200 },
      { label: 'Feb', rides: 520, co2: 250 },
      { label: 'Mar', rides: 600, co2: 300 },
      { label: 'Apr', rides: 750, co2: 380 },
      { label: 'May', rides: 800, co2: 420 },
      { label: 'Jun', rides: 950, co2: 500 },
      { label: 'Jul', rides: 1100, co2: 600 },
      { label: 'Aug', rides: 850, co2: 480 },
      { label: 'Sep', rides: 900, co2: 520 },
      { label: 'Oct', rides: 1000, co2: 580 },
      { label: 'Nov', rides: 1200, co2: 700 },
      { label: 'Dec', rides: 1150, co2: 650 },
  ];

  weeklyStats = [
      { label: 'Mon', rides: 120, co2: 45 },
      { label: 'Tue', rides: 145, co2: 55 },
      { label: 'Wed', rides: 160, co2: 65 },
      { label: 'Thu', rides: 135, co2: 50 },
      { label: 'Fri', rides: 180, co2: 75 },
      { label: 'Sat', rides: 90, co2: 30 },
      { label: 'Sun', rides: 60, co2: 20 },
  ];

  dailyStats = [
      { label: '00-04', rides: 15, co2: 5 },
      { label: '04-08', rides: 45, co2: 15 },
      { label: '08-12', rides: 180, co2: 70 },
      { label: '12-16', rides: 120, co2: 45 },
      { label: '16-20', rides: 210, co2: 85 },
      { label: '20-24', rides: 60, co2: 25 },
  ];

  // Ride Status for Donut Chart
  rideStatusStats = [
      { label: 'Completed', value: 65, color: '#0d6efd' }, // Primary Blue
      { label: 'Scheduled', value: 25, color: '#0dcaf0' }, // Info Cyan
      { label: 'Cancelled', value: 10, color: '#dc3545' }  // Danger Red
  ];

  get currentStats() {
    switch (this.currentFilter) {
        case 'Weekly': return this.weeklyStats;
        case 'Today': return this.dailyStats;
        default: return this.monthlyStats;
    }
  }

  setFilter(filter: string) {
    this.currentFilter = filter;
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
  topEmployees = [
    { name: 'Rahul Sharma', dept: 'IT Engineering', role: 'Pooler', rides: 145, distance: '2,340', co2: 450 },
    { name: 'Priya Verma', dept: 'HR', role: 'Seeker', rides: 132, distance: '1,980', co2: 380 },
    { name: 'Amit Singh', dept: 'Marketing', role: 'Pooler', rides: 120, distance: '1,500', co2: 310 },
    { name: 'Sneha Gupta', dept: 'Finance', role: 'Seeker', rides: 98, distance: '1,200', co2: 240 },
    { name: 'Vikram Malhotra', dept: 'Operations', role: 'Pooler', rides: 85, distance: '980', co2: 190 },
  ];
}
