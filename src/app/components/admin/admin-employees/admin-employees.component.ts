import { Component } from '@angular/core';
import { GlobalService } from '../../../services/global-service';

@Component({
  selector: 'app-admin-employees',
  templateUrl: './admin-employees.component.html',
  styleUrls: ['./admin-employees.component.scss']
})
export class AdminEmployeesComponent {
  employees = [
    { id: 1, name: 'Rahul Sharma', email: 'rahul.sharma@company.com', role: 'Pooler', status: 'Active', rides: 145, co2: 450 },
    { id: 2, name: 'Priya Verma', email: 'priya.verma@company.com', role: 'Seeker', status: 'Active', rides: 132, co2: 380 },
    { id: 3, name: 'Amit Singh', email: 'amit.singh@company.com', role: 'Pooler', status: 'Pending', rides: 0, co2: 0 },
    { id: 4, name: 'Sneha Gupta', email: 'sneha.gupta@company.com', role: 'Seeker', status: 'Active', rides: 98, co2: 240 },
    { id: 5, name: 'Vikram Malhotra', email: 'vikram.m@company.com', role: 'Pooler', status: 'Inactive', rides: 12, co2: 45 },
    { id: 6, name: 'Anjali Desai', email: 'anjali.d@company.com', role: 'Seeker', status: 'Pending', rides: 0, co2: 0 },
    { id: 7, name: 'Rohan Mehta', email: 'rohan.mehta@company.com', role: 'Pooler', status: 'Active', rides: 88, co2: 210 },
    { id: 8, name: 'Kavita Iyer', email: 'kavita.iyer@company.com', role: 'Seeker', status: 'Active', rides: 45, co2: 120 },
  ];

  constructor(private _globalService: GlobalService) {}

  inviteEmployee() {
    // This method is now triggered by data-bs-toggle="modal"
    // We can keep it empty or use it for analytics if needed
  }

  approve(emp: any) {
    emp.status = 'Active';
    this._globalService.utilities.notify.success(`Approved ${emp.name}`);
  }

  reject(emp: any) {
    this.employees = this.employees.filter(e => e.id !== emp.id);
    this._globalService.utilities.notify.warning(`Rejected ${emp.name}`);
  }

  remove(emp: any) {
    if (confirm(`Are you sure you want to remove ${emp.name}?`)) {
        this.employees = this.employees.filter(e => e.id !== emp.id);
        this._globalService.utilities.notify.success(`Removed ${emp.name}`);
    }
  }
}
