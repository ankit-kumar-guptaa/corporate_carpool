import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../../../services/global-service';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-admin-rides',
  templateUrl: './admin-rides.component.html',
  styleUrls: ['./admin-rides.component.scss']
})
export class AdminRidesComponent implements OnInit {
  
  activeTab: 'rides' | 'requests' = 'rides';
  
  rides: any[] = [];
  requests: any[] = [];
  
  isLoadingRides: boolean = false;
  isLoadingRequests: boolean = false;

  constructor(
      private _globalService: GlobalService,
      private adminService: AdminService
  ) {}

  ngOnInit(): void {
      this.loadRides();
      this.loadRequests();
  }

  loadRides() {
      this.isLoadingRides = true;
      this.adminService.getAllRides().subscribe({
          next: (res: any) => {
              if (res && res.status === 1) {
                  this.rides = res.data;
              }
              this.isLoadingRides = false;
          },
          error: (err) => {
              console.error(err);
              this.isLoadingRides = false;
          }
      });
  }

  loadRequests() {
      this.isLoadingRequests = true;
      this.adminService.getAllRideRequests().subscribe({
          next: (res: any) => {
               if (res && res.status === 1) {
                  this.requests = res.data;
              }
              this.isLoadingRequests = false;
          },
          error: (err) => {
              console.error(err);
              this.isLoadingRequests = false;
          }
      });
  }

  setActiveTab(tab: 'rides' | 'requests') {
      this.activeTab = tab;
  }

  export(type: string) {
    this._globalService.utilities.notify.success(`${type} downloaded successfully!`);
  }

  filter() {
    this._globalService.utilities.notify.info('Filters applied');
  }
}
