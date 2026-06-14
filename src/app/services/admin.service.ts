import { Injectable } from '@angular/core';
import { GlobalService } from './global-service';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(private globalService: GlobalService) { }

  getDashboardStats(filter: string = 'Monthly') {
    return this.globalService.ServiceManager.request.get('Ride/CORP_GetDashboardStats?filter=' + filter);
  }

  getAllRides() {
    return this.globalService.ServiceManager.request.get('Ride/CORP_GetAllRides');
  }

  getAllRideRequests() {
    return this.globalService.ServiceManager.request.get('Ride/CORP_GetAllRideRequests');
  }

  adminLogin(data: any) {
    return this.globalService.ServiceManager.request.post('Corporate/CORP_AdminLogin', data);
  }

  getAllEmployees() {
    return this.globalService.ServiceManager.request.get('Ride/CORP_GetAllEmployees');
  }

  getDashboardChartData() {
    return this.globalService.ServiceManager.request.get('Ride/CORP_GetDashboardChartData');
  }

  updateEmployeeStatus(data: any) {
    return this.globalService.ServiceManager.request.post('Ride/CORP_UpdateEmployeeStatus', data);
  }

  deleteEmployee(id: number) {
    return this.globalService.ServiceManager.request.get(`Ride/CORP_DeleteEmployee/${id}`); // Use .get because the global service .delete might not exist
  }
}
