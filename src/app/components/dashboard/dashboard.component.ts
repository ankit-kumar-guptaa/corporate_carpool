import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../../services/global-service';
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

  // Carpool Confirmation
  isCarpoolConfirmModalVisible: boolean = false;
  carpoolPartnerName: string = '';
  carpoolDate: string = new Date().toISOString().split('T')[0];
  carpoolType: string = 'Passenger';
  carpoolHistory: any[] = [];
  todayConfirmed: boolean = false;

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

  constructor(private _globalService: GlobalService) {}

  ngOnInit(): void {
    this.loggedInUserName = localStorage.getItem('loggedInUserName') || '';
    this.loadCarpoolHistory();
    this.loadData();
    this.calculateImpact();
  }

  // Fetch all dashboard data
  loadData() {
    const userProfile = this._globalService.utilities.storage.get('UserProfile') || '{}';
    try {
      const parsedProfile = JSON.parse(userProfile);
      this.userId = parsedProfile?.id;
      this.loggedInUserEmail = parsedProfile?.email || '';
      this.updatedName = this.loggedInUserName;
      this.updatedEmail = this.loggedInUserEmail;
    } catch {}

    const param: any = {};
    const helperdata = new helper();
    param.user_id = this.userId;
    helperdata.spName = "CORP_GreenCar_GetMyConnection";
    helperdata.payload = JSON.stringify(param);

    this._globalService.ServiceManager.request.post('Ride/GetDataFromServer', helperdata).subscribe(res => {
      if (res.status == 1) {
        this.connections = res.data.dataset.table || [];
        this.MySendRequests = res.data.dataset.table1 || [];
        this.submittedRides = res.data.dataset.table2 || [];
        this.totalRidesCount = this.submittedRides.length;
        this.loadNotifications();
      }
    });
  }

  calculateImpact() {
    const totalCarpools = this.carpoolHistory.length;
    const soloEmissionPerDay = 8.5; // kg CO₂ per day solo driving
    const carpoolEmissionPerDay = 2.1; // kg CO₂ per day carpooling

    if (totalCarpools > 0) {
      const totalSaved = parseFloat((totalCarpools * (soloEmissionPerDay - carpoolEmissionPerDay)).toFixed(1));
      const avgSavedPerDay = parseFloat(((soloEmissionPerDay - carpoolEmissionPerDay)).toFixed(1));
      const reductionPercent = Math.round(((soloEmissionPerDay - carpoolEmissionPerDay) / soloEmissionPerDay) * 100);
      const treesEquivalent = Math.max(1, Math.floor(totalSaved / 21)); // ~21kg CO₂ per tree/year

      this.impactStats = {
        beforeMode: 'Solo Car (Petrol)',
        currentMode: 'Carpool',
        beforeEmission: soloEmissionPerDay,
        currentEmission: carpoolEmissionPerDay,
        saved: avgSavedPerDay,
        reductionPercent: reductionPercent,
        treesPlanted: treesEquivalent,
        totalCarpools: totalCarpools
      };
    } else {
      this.impactStats = {
        beforeMode: 'Solo Car (Petrol)',
        currentMode: 'Solo',
        beforeEmission: soloEmissionPerDay,
        currentEmission: soloEmissionPerDay,
        saved: 0,
        reductionPercent: 0,
        treesPlanted: 0,
        totalCarpools: 0
      };
    }
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
        this.loadData();
      } else {
        this._globalService.utilities.notify.error('Error Accepting Request');
      }
    });
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
      this._globalService.utilities.storage.set('UserProfile', JSON.stringify({
        id: this.userId,
        email: this.updatedEmail
      }));
      this._globalService.utilities.notify.success('Profile Updated Successfully');
      this.closeProfileModal();
    } else {
      this._globalService.utilities.notify.error('Please fill all fields');
    }
  }

  // Logout user
  logout(): void {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('loggedInUserName');
    this._globalService.utilities.notify.success('Logged Out Successfully');
    // Add navigation to login page if needed
    
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

  // Carpool Confirmation Methods
  openCarpoolConfirmModal(): void {
    this.carpoolDate = new Date().toISOString().split('T')[0];
    this.carpoolPartnerName = '';
    this.carpoolType = 'Passenger';
    this.isCarpoolConfirmModalVisible = true;
  }

  closeCarpoolConfirmModal(event?: MouseEvent): void {
    if (event) event.stopPropagation();
    this.isCarpoolConfirmModalVisible = false;
  }

  getAcceptedConnections(): any[] {
    // Combine accepted connections from inbox & sent requests
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

  submitCarpoolConfirmation(): void {
    if (!this.carpoolPartnerName) {
      this._globalService.utilities.notify.error('Please select your carpool partner');
      return;
    }
    if (!this.carpoolDate) {
      this._globalService.utilities.notify.error('Please select the date');
      return;
    }

    const confirmation = {
      partnerName: this.carpoolPartnerName,
      date: this.carpoolDate,
      type: this.carpoolType,
      confirmedAt: new Date().toISOString(),
      userName: this.loggedInUserName
    };

    this.carpoolHistory.unshift(confirmation);
    localStorage.setItem('carpoolHistory_' + this.userId, JSON.stringify(this.carpoolHistory));
    this.checkTodayConfirmed();
    this.calculateImpact();
    this._globalService.utilities.notify.success('🎉 Carpool confirmed! Thank you for going green!');
    this.closeCarpoolConfirmModal();

    // Add to notifications
    this.notifications.unshift({
      message: `You carpooled with ${this.carpoolPartnerName} as ${this.carpoolType}`,
      type: 'accept',
      timestamp: new Date()
    });
  }

  loadCarpoolHistory(): void {
    const stored = localStorage.getItem('carpoolHistory_' + this.userId);
    if (stored) {
      try {
        this.carpoolHistory = JSON.parse(stored);
      } catch {
        this.carpoolHistory = [];
      }
    }
    this.checkTodayConfirmed();
  }

  checkTodayConfirmed(): void {
    const today = new Date().toISOString().split('T')[0];
    this.todayConfirmed = this.carpoolHistory.some((c: any) => c.date === today);
  }

  deleteCarpoolEntry(index: number): void {
    this.carpoolHistory.splice(index, 1);
    localStorage.setItem('carpoolHistory_' + this.userId, JSON.stringify(this.carpoolHistory));
    this.checkTodayConfirmed();
    this.calculateImpact();
    this._globalService.utilities.notify.success('Entry removed');
  }

  // Prevent modal close on content click
  stopPropagation(event: MouseEvent): void {
    event.stopPropagation();
  }
}
