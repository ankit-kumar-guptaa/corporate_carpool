import { Component, OnInit } from '@angular/core';

import { GlobalService } from '../../../services/global-service';
import { AdminService } from '../../../services/admin.service';
import { AuthService } from '../../../core/services/auth.service';
import { CreateUserRequest } from '../../../core/models/auth.models';

interface NewUserForm {
  name: string;
  email: string;
  password: string;
  domain: string;
  mobileNo: string;
  employeeCode: string;
  gender: string;
}

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

  // Pagination state
  currentPage: number = 1;
  pageSize: number = 8;
  pageSizeOptions: number[] = [5, 8, 10, 25, 50];

  newUser: NewUserForm = this.emptyUser();
  isAdding: boolean = false;

  constructor(
    private _globalService: GlobalService,
    private adminService: AdminService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadEmployees();
  }

  // ---------------------------- Data loading ----------------------------

  loadEmployees() {
    this.isLoadingData = true;
    this.adminService.getAllEmployees().subscribe({
      next: (res: any) => {
        if (res && res.status === 1 && res.data) {
          this.employees = res.data;
          this.applyFilters();
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

  // ---------------------------- Add Employee ----------------------------

  inviteEmployee() {
    this.newUser = this.emptyUser();
  }

  addEmployee() {
    const form = this.newUser;

    if (!form.name || !form.email || !form.password) {
      this._globalService.utilities.notify.warning(
        'Please fill name, email and password.'
      );
      return;
    }

    if (this.isAdding) {
      return;
    }

    this.isAdding = true;

    const orgId = this.authService.getOrgId() ?? 0;

    const payload: CreateUserRequest = {
      email: form.email.trim(),
      name: form.name.trim(),
      domain: form.domain.trim(),
      password: form.password,
      mobileNo: (form.mobileNo || '').trim(),
      employeeCode: (form.employeeCode || '').trim(),
      gender: (form.gender || '').trim(),
      orgId
    };

    this.authService.createUser(payload).subscribe({
      next: (res: any) => {
        this.isAdding = false;
        if (res?.status === true) {
          this._globalService.utilities.notify.success(
            res.message || 'User created successfully'
          );
          this.loadEmployees();
          this.newUser = this.emptyUser();
          document.getElementById('closeInviteModal')?.click();
        } else {
          this._globalService.utilities.notify.error(
            res?.message || 'Failed to create user'
          );
        }
      },
      error: (err) => {
        this.isAdding = false;
        const message = (err && err.message) || 'Failed to create user.';
        this._globalService.utilities.notify.error(message);
      }
    });
  }

  // ---------------------------- Status actions ----------------------------

  approve(emp: any) {
    if (confirm(`Are you sure you want to activate ${emp.name}?`)) {
      this.adminService
        .updateEmployeeStatus({ id: emp.id, status: 'Active' })
        .subscribe({
          next: (res: any) => {
            if (res && res.status === 1) {
              emp.status = 'Active';
              this.applyFilters();
              this._globalService.utilities.notify.success(`Activated ${emp.name}`);
            } else {
              this._globalService.utilities.notify.error(
                res.message || 'Failed to activate'
              );
            }
          },
          error: () => {
            this._globalService.utilities.notify.error(
              'Network Error during activation'
            );
          }
        });
    }
  }

  reject(emp: any) {
    if (confirm(`Are you sure you want to deactivate ${emp.name}?`)) {
      this.adminService
        .updateEmployeeStatus({ id: emp.id, status: 'Inactive' })
        .subscribe({
          next: (res: any) => {
            if (res && res.status === 1) {
              emp.status = 'Inactive';
              this.applyFilters();
              this._globalService.utilities.notify.warning(`Deactivated ${emp.name}`);
            } else {
              this._globalService.utilities.notify.error(
                res.message || 'Failed to deactivate'
              );
            }
          },
          error: () => {
            this._globalService.utilities.notify.error(
              'Network Error during deactivation'
            );
          }
        });
    }
  }

  remove(emp: any) {
    if (
      confirm(
        `Are you sure you want to permanently delete ${emp.name}? This action cannot be undone.`
      )
    ) {
      this.adminService.deleteEmployee(emp.id).subscribe({
        next: (res: any) => {
          if (res && res.status === 1) {
            this.employees = this.employees.filter((e) => e.id !== emp.id);
            this.applyFilters();
            this._globalService.utilities.notify.success(
              `Deleted ${emp.name} successfully`
            );
          } else {
            this._globalService.utilities.notify.error(
              res.message || 'Failed to delete employee'
            );
          }
        },
        error: () => {
          this._globalService.utilities.notify.error(
            'Network Error during deletion'
          );
        }
      });
    }
  }

  // ---------------------------- Filters ----------------------------

  filterData() {
    this.currentPage = 1;
    this.applyFilters();
  }

  private applyFilters() {
    const term = (this.searchTerm || '').toLowerCase();

    this.filteredEmployees = this.employees.filter((emp) => {
      const matchSearch =
        !term ||
        (emp.name && emp.name.toLowerCase().includes(term)) ||
        (emp.email && emp.email.toLowerCase().includes(term)) ||
        (emp.role && emp.role.toLowerCase().includes(term));

      const matchStatus = !this.statusFilter || emp.status === this.statusFilter;
      const matchRole = !this.roleFilter || emp.role === this.roleFilter;

      return matchSearch && matchStatus && matchRole;
    });

    // Clamp current page after filter changes
    const total = this.totalPages;
    if (this.currentPage > total) {
      this.currentPage = total || 1;
    }
  }

  // ---------------------------- Pagination helpers ----------------------------

  get totalItems(): number {
    return this.filteredEmployees.length;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalItems / this.pageSize));
  }

  get pagedEmployees(): any[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredEmployees.slice(start, start + this.pageSize);
  }

  get pageStart(): number {
    if (this.totalItems === 0) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get pageEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalItems);
  }

  get pageNumbers(): number[] {
    const total = this.totalPages;
    const maxButtons = 5;
    if (total <= maxButtons) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    let start = Math.max(1, this.currentPage - Math.floor(maxButtons / 2));
    const end = Math.min(total, start + maxButtons - 1);
    if (end - start + 1 < maxButtons) {
      start = Math.max(1, end - maxButtons + 1);
    }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    this.currentPage = page;
  }

  prevPage() {
    if (this.currentPage > 1) this.currentPage--;
  }

  nextPage() {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  onPageSizeChange() {
    this.currentPage = 1;
  }

  // ---------------------------- Helpers ----------------------------

  private emptyUser(): NewUserForm {
    return {
      name: '',
      email: '',
      password: '',
      domain: 'airliquide.com',
      mobileNo: '',
      employeeCode: '',
      gender: ''
    };
  }

  private deriveDomain(email: string): string {
    if (!email || !email.includes('@')) return '';
    return email.split('@')[1] || '';
  }
}
