import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GlobalService } from '../../services/global-service';
import { AuthService } from '../../core/services/auth.service';
import { helper } from '../../models/helper';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class DashboardComponent implements OnInit {
  loggedInUserName: string = '';
  loggedInUserEmail: string = '';
  totalRidesCount: number = 0;
  connections: any = [];
  MySendRequests: any = [];
  submittedRides: any = [];
  userId: number = 0;
  isModalVisible: boolean = false;
  isRideModalVisible: boolean = false;
  isProfileModalVisible: boolean = false;
  selectedUser: any = null;
  selectedRide: any = null;
  updatedName: string = '';
  updatedEmail: string = '';
  notifications: { message: string, type: string, timestamp: Date }[] = [];

  // Monthly Carpool Tracker
  monthlyData: any[] = [];
  currentMonth: number = new Date().getMonth();
  currentYear: number = new Date().getFullYear();
  normalCO2PerDay: number = 8.5; // Default, updated from user registration data

  // Impact Analysis Data (dynamic)
  impactStats = {
    beforeMode: 'Solo Car (Petrol)',
    currentMode: 'Solo',
    beforeEmission: 8.5,
    currentEmission: 8.5,
    saved: 0,
    reductionPercent: 0,
    treesPlanted: 0,
    totalCarpools: 0
  };

  constructor(
    private _globalService: GlobalService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loggedInUserName = localStorage.getItem('loggedInUserName') || '';
    this.loadData();
  }

  // Fetch all dashboard data
  loadData() {
    const userProfile = localStorage.getItem('UserProfile') || '{}';
    try {
      const parsedProfile = JSON.parse(userProfile);
      this.userId = parsedProfile?.userId || 0;
      this.loggedInUserEmail = parsedProfile?.email || '';
      this.updatedName = this.loggedInUserName;
      this.updatedEmail = this.loggedInUserEmail;
    } catch { }

    const param: any = {};
    const helperdata = new helper();
    param.user_id = this.userId;
    helperdata.spName = "CORP_GreenCar_GetMyConnection";
    helperdata.payload = JSON.stringify(param);

    this._globalService.ServiceManager.request.post('Ride/GetDataFromServer', helperdata).subscribe(res => {
      if (res.status == 1) {
        this.connections = res.data.dataset.table || [];
        this.MySendRequests = res.data.dataset.table1 || [];
        
        const allSubmittedRides = res.data.dataset.table2 || [];
        const deletedRides = JSON.parse(localStorage.getItem('deletedRides') || '[]');
        this.submittedRides = allSubmittedRides.filter((r: any) => !deletedRides.includes(r.id || r.rideId));
        
        this.totalRidesCount = this.submittedRides.length;
        this.loadNotifications();
        this.loadNormalCO2FromProfile();
        this.generateMonthlyData();
        this.calculateImpact();
      }
    });
  }

  // Load Normal CO2 from user's registration profile (distance * emission factor)
  loadNormalCO2FromProfile(): void {
    try {
      const userProfile = localStorage.getItem('UserProfile') || '{}';
      const parsed = JSON.parse(userProfile);
      // If the profile has co2 or distance data from registration
      if (parsed?.currentEmission) {
        this.normalCO2PerDay = parseFloat(parsed.currentEmission);
      } else if (parsed?.distanceKm) {
        // Recalculate: roundTrip * avg emission factor (0.192 for petrol car)
        this.normalCO2PerDay = parseFloat((parsed.distanceKm * 2 * 0.192).toFixed(2));
      } else {
        this.normalCO2PerDay = 8.5; // Default fallback
      }
    } catch {
      this.normalCO2PerDay = 8.5;
    }
  }

  // Generate monthly data table
  generateMonthlyData(): void {
    const storageKey = `carpoolMonthly_${this.userId}_${this.currentYear}_${this.currentMonth}`;
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        this.monthlyData = JSON.parse(stored);
        return;
      } catch { }
    }

    const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
    this.monthlyData = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(this.currentYear, this.currentMonth, d);
      const dayOfWeek = date.getDay();
      // Skip weekends (0=Sun, 6=Sat)
      if (dayOfWeek === 0 || dayOfWeek === 6) continue;
      this.monthlyData.push({
        date: date.toISOString().split('T')[0],
        dateDisplay: `${String(d).padStart(2, '0')}-${date.toLocaleString('en', { month: 'short' })}`,
        carpooled: false,
        partnerName: '',
        members: 2,
        normalCO2: this.normalCO2PerDay,
        co2Savings: 0
      });
    }
  }

  // Toggle carpool for a day
  onCarpoolToggle(row: any): void {
    if (!row.carpooled) {
      row.partnerName = '';
      row.members = 2;
      row.co2Savings = 0;
    } else {
      // Auto-fill partner from the last selected partner (look backwards)
      if (!row.partnerName) {
        const lastPartner = this.getLastSelectedPartner(row);
        if (lastPartner) {
          row.partnerName = lastPartner;
        }
      }
      this.recalculateRow(row);
    }
    this.saveMonthlyData();
    this.calculateImpact();
  }

  // Recalculate CO2 savings for a row
  recalculateRow(row: any): void {
    if (row.carpooled && row.members >= 2) {
      // CO2 Savings = Normal - (Normal / members)
      row.co2Savings = parseFloat((row.normalCO2 - (row.normalCO2 / row.members)).toFixed(2));
    } else {
      row.co2Savings = 0;
    }
  }

  // On partner or members change — propagate partner to future days
  onRowChange(row: any): void {
    this.recalculateRow(row);
    // Propagate selected partner to all future carpooled rows that don't have a partner set yet
    if (row.partnerName) {
      this.propagatePartnerToFutureDays(row);
    }
    this.saveMonthlyData();
    this.calculateImpact();
  }

  // Get the last selected partner by looking backwards from the given row
  getLastSelectedPartner(currentRow: any): string {
    const currentIndex = this.monthlyData.indexOf(currentRow);
    for (let i = currentIndex - 1; i >= 0; i--) {
      if (this.monthlyData[i].carpooled && this.monthlyData[i].partnerName) {
        return this.monthlyData[i].partnerName;
      }
    }
    return '';
  }

  // Propagate partner selection to future days that are carpooled but have no partner set
  propagatePartnerToFutureDays(currentRow: any): void {
    const currentIndex = this.monthlyData.indexOf(currentRow);
    for (let i = currentIndex + 1; i < this.monthlyData.length; i++) {
      const futureRow = this.monthlyData[i];
      // Only auto-fill if the future row is carpooled and has no partner selected yet
      if (futureRow.carpooled && !futureRow.partnerName) {
        futureRow.partnerName = currentRow.partnerName;
        this.recalculateRow(futureRow);
      }
    }
  }

  // Save monthly data to localStorage
  saveMonthlyData(): void {
    const storageKey = `carpoolMonthly_${this.userId}_${this.currentYear}_${this.currentMonth}`;
    localStorage.setItem(storageKey, JSON.stringify(this.monthlyData));
  }

  // Navigate months
  prevMonth(): void {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    this.generateMonthlyData();
    this.calculateImpact();
  }

  nextMonth(): void {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    this.generateMonthlyData();
    this.calculateImpact();
  }

  getMonthName(): string {
    return new Date(this.currentYear, this.currentMonth).toLocaleString('en', { month: 'long', year: 'numeric' });
  }

  // Get accepted connections for partner dropdown
  getAcceptedConnections(): any[] {
    const accepted: any[] = [];
    if (this.connections?.length) {
      this.connections.filter((c: any) => c.isaccept).forEach((c: any) => {
        if (!accepted.find((a: any) => a.name === c.name)) accepted.push(c);
      });
    }
    if (this.MySendRequests?.length) {
      this.MySendRequests.filter((c: any) => c.isaccept).forEach((c: any) => {
        if (!accepted.find((a: any) => a.name === c.name)) accepted.push(c);
      });
    }
    return accepted;
  }

  // Dynamic impact calculation from monthly data
  calculateImpact(): void {
    const carpoolDays = this.monthlyData.filter((d: any) => d.carpooled);
    const totalCarpools = carpoolDays.length;
    const totalSaved = carpoolDays.reduce((sum: number, d: any) => sum + (d.co2Savings || 0), 0);
    const totalNormal = carpoolDays.reduce((sum: number, d: any) => sum + (d.normalCO2 || 0), 0);

    if (totalCarpools > 0) {
      const avgSavedPerDay = parseFloat((totalSaved / totalCarpools).toFixed(1));
      const reductionPercent = totalNormal > 0 ? Math.round((totalSaved / totalNormal) * 100) : 0;
      const treesEquivalent = Math.max(1, Math.floor(totalSaved / 21));

      this.impactStats = {
        beforeMode: 'Solo Car',
        currentMode: 'Carpool',
        beforeEmission: this.normalCO2PerDay,
        currentEmission: parseFloat((this.normalCO2PerDay - avgSavedPerDay).toFixed(1)),
        saved: parseFloat(totalSaved.toFixed(1)),
        reductionPercent: reductionPercent,
        treesPlanted: treesEquivalent,
        totalCarpools: totalCarpools
      };
    } else {
      this.impactStats = {
        beforeMode: 'Solo Car',
        currentMode: 'Solo',
        beforeEmission: this.normalCO2PerDay,
        currentEmission: this.normalCO2PerDay,
        saved: 0,
        reductionPercent: 0,
        treesPlanted: 0,
        totalCarpools: 0
      };
    }
  }

  // Check if a date is today
  isToday(dateStr: string): boolean {
    return dateStr === new Date().toISOString().split('T')[0];
  }

  // Check if date is in the past (including today = editable)
  isPastOrToday(dateStr: string): boolean {
    return dateStr <= new Date().toISOString().split('T')[0];
  }

  // Handle ride request acceptance
  AcceptRequest(item: any) {
    const param: any = {};
    param.UserId = this.userId;
    param.RideId = item.rideId;
    param.RequestID = item.requestID;
    this._globalService.ServiceManager.request.post('Ride/CORP_AcceptRideRequest', param).subscribe(resp => {
      if (resp.status == 1) {
        item.isaccept = true;
        this._globalService.utilities.notify.success('Request Accepted Successfully');
        
        // Track accepted seats to update availability in search
        const acceptedSeatsMap = JSON.parse(localStorage.getItem('acceptedSeatsMap') || '{}');
        const rideId = item.rideId || item.id;
        if(rideId) {
            acceptedSeatsMap[rideId] = (acceptedSeatsMap[rideId] || 0) + 1;
            localStorage.setItem('acceptedSeatsMap', JSON.stringify(acceptedSeatsMap));
        }

        this.loadData();
      } else {
        this._globalService.utilities.notify.error('Error Accepting Request');
      }
    });
  }

  // Delete submitted ride locally
  deleteRide(ride: any): void {
      if(confirm('Are you sure you want to delete this ride?')) {
          const rideId = ride.id || ride.rideId;
          if (rideId) {
              const deletedRides = JSON.parse(localStorage.getItem('deletedRides') || '[]');
              if(!deletedRides.includes(rideId)) {
                  deletedRides.push(rideId);
                  localStorage.setItem('deletedRides', JSON.stringify(deletedRides));
              }
              this.submittedRides = this.submittedRides.filter((r: any) => (r.id || r.rideId) !== rideId);
              this.totalRidesCount = this.submittedRides.length;
              this._globalService.utilities.notify.success('Ride deleted successfully');
          }
      }
  }

  // Open connection details modal
  openModal(user: any): void {
    this.selectedUser = user;
    this.isModalVisible = true;
  }

  // Close connection details modal
  closeModal(event?: MouseEvent): void {
    if (event) event.stopPropagation();
    this.isModalVisible = false;
  }

  // Open ride details modal
  openRideModal(ride: any): void {
    this.selectedRide = ride;
    this.isRideModalVisible = true;
  }

  // Close ride details modal
  closeRideModal(event?: MouseEvent): void {
    if (event) event.stopPropagation();
    this.isRideModalVisible = false;
  }

  // Open profile update modal
  openProfileUpdateModal(): void {
    this.isProfileModalVisible = true;
  }

  // Close profile update modal
  closeProfileModal(event?: MouseEvent): void {
    if (event) event.stopPropagation();
    this.isProfileModalVisible = false;
  }

  // Save updated profile
  saveProfile(): void {
    if (this.updatedName && this.updatedEmail) {
      this.loggedInUserName = this.updatedName;
      this.loggedInUserEmail = this.updatedEmail;
      localStorage.setItem('loggedInUserName', this.updatedName);
      localStorage.setItem('UserProfile', JSON.stringify({
        userId: this.userId,
        email: this.updatedEmail
      }));
      this._globalService.utilities.notify.success('Profile Updated Successfully');
      this.closeProfileModal();
    } else {
      this._globalService.utilities.notify.error('Please fill all fields');
    }
  }

  // Logout user — clears JWT/local/session storage and hard-redirects to '/'.
  logout(): void {
    this.authService.logout(true, '/');
  }

  // Load dynamic notifications with timestamps
  loadNotifications(): void {
    this.notifications = [];
    const now = new Date();

    if (this.connections.length > 0) {
      this.connections.forEach((conn: any, index: number) => {
        if (!conn.isaccept) {
          this.notifications.push({
            message: `New ride request from ${conn.name}`,
            type: 'request',
            timestamp: new Date(now.getTime() - (index + 1) * 60000) // Simulating past times
          });
        }
      });
    }
    if (this.MySendRequests.length > 0) {
      this.MySendRequests.forEach((req: any, index: number) => {
        this.notifications.push({
          message: `Request to ${req.name} ${req.isaccept ? 'accepted' : 'pending'}`,
          type: req.isaccept ? 'accept' : 'request',
          timestamp: new Date(now.getTime() - (index + 1) * 120000)
        });
      });
    }
    if (this.submittedRides.length > 0) {
      this.submittedRides.forEach((ride: any, index: number) => {
        this.notifications.push({
          message: `Ride from ${ride.from_Address} submitted`,
          type: 'ride',
          timestamp: new Date(now.getTime() - (index + 1) * 180000)
        });
      });
    }
  }

  // Clear all notifications
  clearNotifications(): void {
    this.notifications = [];
    this._globalService.utilities.notify.success('Recent Activity Cleared');
  }

  // Prevent modal close on content click
  stopPropagation(event: MouseEvent): void {
    event.stopPropagation();
  }

  // Switch tabs programmatically
  switchTab(tabId: string): void {
    const tabElement = document.getElementById(tabId);
    if (tabElement) {
      tabElement.click();
    }
  }
}

