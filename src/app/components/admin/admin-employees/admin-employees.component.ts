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

  newUser: any = {
    name: '',
    email: '',
    password: ''
  };

  isAdding: boolean = false;

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
    this.newUser = { name: '', email: '', password: '' };
  }

  addEmployee() {
    if (!this.newUser.name || !this.newUser.email || !this.newUser.password) {
      this._globalService.utilities.notify.warning('Please fill all fields');
      return;
    }
    
    this.isAdding = true;
    const param: any = {
      email: this.newUser.email,
      mobile_No: '0000000000', // Default
      Password: this.newUser.password,
      name: this.newUser.name,
      domain: 'airliquide.com',
      VehicleType: 'None',
      Address: 'Added by Admin',
      Latitude: '28.6304',
      Longitude: '77.2177'
    };

    const helperdata = {
      spName: 'CORP_User_Register',
      payload: JSON.stringify(param)
    };

    this._globalService.ServiceManager.request.post('Ride/GetDataFromServer', helperdata).subscribe({
      next: (res: any) => {
        this.isAdding = false;
        if (res && res.status === 1 && res.data && res.data.dataset && res.data.dataset.table.length > 0) {
          this._globalService.utilities.notify.success('User created successfully');
          this.loadEmployees();
          document.getElementById('closeInviteModal')?.click();
        } else {
          this._globalService.utilities.notify.error('Failed to create user (may already exist)');
        }
      },
      error: () => {
        this.isAdding = false;
        this._globalService.utilities.notify.error('Network Error');
      }
    });
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
