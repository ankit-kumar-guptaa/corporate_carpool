import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../../../services/global-service';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-admin-employees',
  templateUrl: './admin-employees.component.html',
  styleUrls: ['./admin-employees.component.scss']
})
export class AdminEmployeesComponent implements OnInit {
  employees: any[] = [];
  filteredEmployees: any[] = [];
  isLoadingData: boolean = true;
  
  searchTerm: string = '';
  statusFilter: string = '';
  roleFilter: string = '';

  constructor(
      private _globalService: GlobalService,
      private adminService: AdminService
  ) {}

  ngOnInit() {
      this.loadEmployees();
  }

  loadEmployees() {
      this.isLoadingData = true;
      this.adminService.getAllEmployees().subscribe({
          next: (res: any) => {
              if (res && res.status === 1 && res.data) {
                  this.employees = res.data;
                  this.filteredEmployees = [...this.employees];
              }
              this.isLoadingData = false;
          },
          error: (err) => {
              console.error('Error fetching employees', err);
              this._globalService.utilities.notify.error('Failed to load employees');
              this.isLoadingData = false;
          }
      });
  }

  inviteEmployee() {
    // This method is now triggered by data-bs-toggle="modal"
    // We can keep it empty or use it for analytics if needed
  }

  approve(emp: any) {
    if (confirm(`Are you sure you want to activate ${emp.name}?`)) {
        this.adminService.updateEmployeeStatus({ id: emp.id, status: 'Active' }).subscribe({
            next: (res: any) => {
                if (res && res.status === 1) {
                    emp.status = 'Active';
                    this.filterData();
                    this._globalService.utilities.notify.success(`Activated ${emp.name}`);
                } else {
                    this._globalService.utilities.notify.error(res.message || 'Failed to activate');
                }
            },
            error: (err) => {
                this._globalService.utilities.notify.error('Network Error during activation');
            }
        });
    }
  }

  reject(emp: any) {
    if (confirm(`Are you sure you want to deactivate ${emp.name}?`)) {
        this.adminService.updateEmployeeStatus({ id: emp.id, status: 'Inactive' }).subscribe({
            next: (res: any) => {
                if (res && res.status === 1) {
                    emp.status = 'Inactive';
                    this.filterData();
                    this._globalService.utilities.notify.warning(`Deactivated ${emp.name}`);
                } else {
                    this._globalService.utilities.notify.error(res.message || 'Failed to deactivate');
                }
            },
            error: (err) => {
                this._globalService.utilities.notify.error('Network Error during deactivation');
            }
        });
    }
  }

  remove(emp: any) {
    if (confirm(`Are you sure you want to permanently delete ${emp.name}? This action cannot be undone.`)) {
        this.adminService.deleteEmployee(emp.id).subscribe({
            next: (res: any) => {
                if (res && res.status === 1) {
                    this.employees = this.employees.filter(e => e.id !== emp.id);
                    this.filterData();
                    this._globalService.utilities.notify.success(`Deleted ${emp.name} successfully`);
                } else {
                    this._globalService.utilities.notify.error(res.message || 'Failed to delete employee');
                }
            },
            error: (err) => {
                this._globalService.utilities.notify.error('Network Error during deletion');
            }
        });
    }
  }

  filterData() {
    this.filteredEmployees = this.employees.filter(emp => {
      const matchSearch = !this.searchTerm || 
          (emp.name && emp.name.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
          (emp.email && emp.email.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
          (emp.role && emp.role.toLowerCase().includes(this.searchTerm.toLowerCase()));
      
      const matchStatus = !this.statusFilter || emp.status === this.statusFilter;
      const matchRole = !this.roleFilter || emp.role === this.roleFilter;

      return matchSearch && matchStatus && matchRole;
    });
  }
}
