import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../../services/global-service';
import { helper } from '../../models/helper';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  loggedInUserName: string = '';
  loggedInUserEmail: string = '';
  totalRidesCount: number = 0;
  totalConnections: number = 0;
  connections: any = [];
  MySendRequests: any = [];
  userId: number = 0;
  myRides: Array<{ from: string, to: string, date: string, status: string }> = [];
  myConnections: Array<{ name: string, type: string }> = [];
  constructor(private _globalService: GlobalService) { }



  ngOnInit(): void {
    // Fetch user data from localStorage
    this.loggedInUserName = localStorage.getItem('loggedInUserName') || '';

    const storedRides = JSON.parse(localStorage.getItem('myRides') || '[]');
    this.myRides = storedRides;

    // Update ride stats
   
    this.loadData();
  }

  logout(): void {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('loggedInUserName');
    // Redirect to login page or any other action on logout
  }
  openModal(item: any) {

  }
  loadData() {

    const userProfile = this._globalService.utilities.storage.get('UserProfile') || '{}';
    try {
      const parsedProfile = JSON.parse(userProfile);
      this.userId = parsedProfile?.id;
      this.loggedInUserEmail = parsedProfile?.email || ''; 
    } catch {

    }
    var param: any = {};

    let helperdata = new helper();

    param.user_id = this.userId;

    // debugger;
    helperdata.spName = "CORP_GreenCar_GetMyConnection";
    helperdata.payload = JSON.stringify(param);

    // this.helper.spName = "usp_get_condidate_beml";
    // this.helper.payload = JSON.stringify(user);
    // return this.global.ServiceManager.request.post('Grid/GetDataFromServer', helperdata).toPromise();
    // use another way of promise object

    this._globalService.ServiceManager.request.post('Ride/GetDataFromServer', helperdata).subscribe(res => {
      if (res.status == 1) {

        if (res.data.dataset.table.length > 0) {
          this.connections = res.data.dataset.table;
          this.MySendRequests = res.data.dataset.table1;


          // let jsonObj = JSON.parse(res.data.dataset.table1[0].condidate)[0];
        }
        if (res.data.dataset.table1.length > 0) {

          this.MySendRequests = res.data.dataset.table1;

          // let jsonObj = JSON.parse(res.data.dataset.table1[0].condidate)[0];
        }
        if (res.data.dataset.table2.length > 0) {

          this.totalRidesCount = res.data.dataset.table2.length;

          // let jsonObj = JSON.parse(res.data.dataset.table1[0].condidate)[0];
        }
      }
    });





  }
  AcceptRequest(item: any) {
    var param: any = {};
    param.UserId = this.userId;
    param.RideId = item.rideId;
    param.RequestID = item.requestID;
    this._globalService.ServiceManager.request.post('Ride/CORP_AcceptRideRequest', param).subscribe(resp => {

      if (resp.status == 1) {
        item.IsSendRequest = true;
        this._globalService.utilities.notify.success('Accept Request Success');
        this.loadData();
      }
      else {
        this._globalService.utilities.notify.error('Error On Send Request');
      }
    })
  }
}
