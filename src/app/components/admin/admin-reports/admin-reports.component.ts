import { Component } from '@angular/core';
import { GlobalService } from '../../../services/global-service';

@Component({
  selector: 'app-admin-reports',
  templateUrl: './admin-reports.component.html',
  styleUrls: ['./admin-reports.component.scss']
})
export class AdminReportsComponent {
  reports = [
    { rideId: 'R-1001', date: '2023-10-25', employee: 'Rahul Sharma', distance: 15, co2: 2.5 },
    { rideId: 'R-1002', date: '2023-10-25', employee: 'Priya Verma', distance: 22, co2: 3.8 },
    { rideId: 'R-1003', date: '2023-10-24', employee: 'Amit Singh', distance: 10, co2: 1.8 },
    { rideId: 'R-1004', date: '2023-10-24', employee: 'Sneha Gupta', distance: 18, co2: 3.1 },
    { rideId: 'R-1005', date: '2023-10-23', employee: 'Rahul Sharma', distance: 15, co2: 2.5 },
  ];

  constructor(private _globalService: GlobalService) {}

  export(type: string) {
    this._globalService.utilities.notify.success(`${type} Export initiated...`);
  }
}
