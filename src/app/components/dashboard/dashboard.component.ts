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

  constructor(private _globalService: GlobalService) {}

  ngOnInit(): void {
    this.loggedInUserName = localStorage.getItem('loggedInUserName') || '';
    this.loadData();
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

  // Prevent modal close on content click
  stopPropagation(event: MouseEvent): void {
    event.stopPropagation();
  }
}