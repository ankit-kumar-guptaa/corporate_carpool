import { Component } from '@angular/core';
import { GlobalService } from '../../../services/global-service';

@Component({
  selector: 'app-admin-rides',
  templateUrl: './admin-rides.component.html',
  styleUrls: ['./admin-rides.component.scss']
})
export class AdminRidesComponent {
  rides = [
    { id: 'R-1001', employee: 'Rahul Sharma', from: 'Noida Sec 62', to: 'Cyber Hub', distance: 28, co2: 4.5, date: '2023-10-25', status: 'Completed' },
    { id: 'R-1002', employee: 'Priya Verma', from: 'Dwarka Sec 10', to: 'CP', distance: 22, co2: 3.8, date: '2023-10-25', status: 'Completed' },
    { id: 'R-1003', employee: 'Amit Singh', from: 'Indirapuram', to: 'Noida Sec 18', distance: 10, co2: 1.8, date: '2023-10-24', status: 'Cancelled' },
    { id: 'R-1004', employee: 'Sneha Gupta', from: 'Vasant Kunj', to: 'Aerocity', distance: 8, co2: 1.2, date: '2023-10-24', status: 'Completed' },
    { id: 'R-1005', employee: 'Vikram Malhotra', from: 'Saket', to: 'Nehru Place', distance: 5, co2: 0.8, date: '2023-10-23', status: 'Completed' },
    { id: 'R-1006', employee: 'Anjali Desai', from: 'Gurgaon Sec 56', to: 'Cyber City', distance: 12, co2: 2.1, date: '2023-10-23', status: 'Completed' },
    { id: 'R-1007', employee: 'Rohan Mehta', from: 'Noida Ext', to: 'Sec 62', distance: 15, co2: 2.5, date: '2023-10-22', status: 'Completed' },
    { id: 'R-1008', employee: 'Kavita Iyer', from: 'Lajpat Nagar', to: 'Okhla', distance: 7, co2: 1.1, date: '2023-10-22', status: 'Completed' },
  ];

  constructor(private _globalService: GlobalService) {}

  export(type: string) {
    this._globalService.utilities.notify.success(`${type} downloaded successfully!`);
  }

  filter() {
    this._globalService.utilities.notify.info('Filters applied');
  }
}
