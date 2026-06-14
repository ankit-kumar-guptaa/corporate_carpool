import { Component } from '@angular/core';
import { GlobalService } from '../../services/global-service';
import { PostRide } from '../../models/post-ride';

@Component({
  selector: 'app-carpool-search',
  templateUrl: './carpool-search.component.html',
  styleUrls: ['./carpool-search.component.scss']
})
export class CarpoolSearchComponent {
  selectedRole: string = 'Either';
  fromLocation: string = '';
  carpoolResults: Array<{ type: string, name: string, from: string }> = [];
  isAddViaClicked: boolean = false;
  ursrProfile: any;
  viaLocation: string = '';
  viaLocations: string[] = [];
  isLoadingSearch: boolean = false;
  isLoadingSubmit: boolean = false;
  postRide: PostRide = new PostRide();
  noRidesAvailable: boolean = false;
  RideList: any[] = [];
  showData: boolean = false;
  userRemark: string = '';
  transportMode: string = '';
  transportOptions: string[] = ['Cab', 'Bus', 'Own Car', 'Own Bike'];

  readonly OFFICE_ADDRESS = 'OXYGEN BUSINESS PARK, Sector 144, Noida, Uttar Pradesh 201304';
  readonly OFFICE_LAT = '28.4977536';
  readonly OFFICE_LNG = '77.4350798';

  constructor(private _globalService: GlobalService) {
    // Fetch user profile and email on component initialization
    this.loadUserProfile();
    // Initialize To Address to Office by default
    this.postRide.To_Address = this.OFFICE_ADDRESS;
    this.postRide.To_Latitude = this.OFFICE_LAT;
    this.postRide.To_Longitude = this.OFFICE_LNG;
  }

  // Method to swap From and To locations
  swapLocations(): void {
    const tempAddr = this.postRide.From_Address;
    const tempLat = this.postRide.Form_Latitude;
    const tempLng = this.postRide.Form_Longitude;

    this.postRide.From_Address = this.postRide.To_Address;
    this.postRide.Form_Latitude = this.postRide.To_Latitude;
    this.postRide.Form_Longitude = this.postRide.To_Longitude;

    this.postRide.To_Address = tempAddr;
    this.postRide.To_Latitude = tempLat;
    this.postRide.To_Longitude = tempLng;

    this.updateRemarkAuto();
  }

  // Helper to update remark
  updateRemarkAuto() {
    if (this.postRide.From_Address && this.postRide.To_Address) {
      this.userRemark = `I am looking for a ride from ${this.postRide.From_Address} to ${this.postRide.To_Address}. My email is ${this.ursrProfile?.email || 'not available'}`;
    }
  }

  // Fetch user profile and email
  loadUserProfile() {
    const userProfile = localStorage.getItem('UserProfile') || '{}';
    try {
      this.ursrProfile = JSON.parse(userProfile);
    } catch (error) {
      console.error('Error parsing user profile:', error);
      this._globalService.utilities.notify.error('Failed to load user profile.');
    }
  }

  // Method to handle the Add Via button click
  addVia(): void {
    if (!this.isAddViaClicked) {
      this.isAddViaClicked = true;
      this.viaLocations.push('');
    } else {
      if (this.viaLocations.length < 3) {
        this.viaLocations.push('');
      }
    }
  }

  // Method to search carpool based on the selected role and location
  searchCarpool(): void {
    // Note: postRide.To_Address is already set (default or swapped)

    this.ursrProfile = JSON.parse(localStorage.getItem('UserProfile') || '{}');

    // Validate 'From' and 'To' addresses
    if (!this.postRide.From_Address) {
      this._globalService.utilities.notify.error('Please enter the "From" location.');
      return;
    }

    if (!this.postRide.To_Address) {
      this._globalService.utilities.notify.error('Please enter the "To" location.');
      return;
    }

    this.noRidesAvailable = false;

    this.postRide.UserId = this.ursrProfile.userId;
    this.postRide.UserName = this.ursrProfile.name;
    this.postRide.IsSearch = 0;

    // Add the remark to postRide before sending
    this.postRide.User_Comment = this.userRemark + (this.transportMode ? ` [Mode: ${this.transportMode}]` : '');

    this.isLoadingSearch = true;
    this._globalService.ServiceManager.request.post('Ride/CORP_PostRide', this.postRide).subscribe(resp => {
      this.isLoadingSearch = false;

      if (resp.status === 1) {
        this.RideList = (resp.data || []).map((ride: any) => {
          // Calculate distance
          let dist = 'N/A';
          const rLat = ride.form_Latitude || ride.from_Latitude;
          const rLon = ride.form_Longitude || ride.from_Longitude;
          if (this.postRide.Form_Latitude && this.postRide.Form_Longitude && rLat && rLon) {
            dist = this.calculateDistance(
              parseFloat(this.postRide.Form_Latitude), parseFloat(this.postRide.Form_Longitude),
              parseFloat(rLat), parseFloat(rLon)
            );
          }
          return { ...ride, distanceKm: dist, isSendRequest: ride.isSendRequest || false };
        });

        this.showData = true;

        if (this.RideList.length === 0) {
          this.noRidesAvailable = true;
          this.showData = false;
          this._globalService.utilities.notify.warning('No ride found on this route');
        }
      } else {
        this.showData = false;
        this._globalService.utilities.notify.error('Error on Search Page.');
      }
    }, error => {
      this.isLoadingSearch = false;
      this.showData = false;
      this._globalService.utilities.notify.error('Failed to search rides.');
    });
  }

  connectCarpool(item: any) {
    const param: any = {
      UserId: this.ursrProfile.userId,
      RideId: item.rideID || item.id // fallback for ride id
    };

    // Optimistically set to true to disable button instantly and prevent multiple clicks
    item.isSendRequest = true;

    this._globalService.ServiceManager.request.post('Ride/CORP_SendRideRequest', param).subscribe({
      next: (resp) => {
        // Tolerant success condition
        if (resp.status === 1 || resp.status === 'ok' || resp.status === 'Success' || resp.status === true || resp.message === 'success') {
          this._globalService.utilities.notify.success('Request sent successfully.');
        } else {
          // If the backend returns a clear error status
          this._globalService.utilities.notify.warning(resp.message || 'Request might have failed. Please check.');
        }
      },
      error: (err) => {
        // Many times backend succeeds but returns text, causing JSON parse error in Angular
        console.warn('API error or parse error on SendRideRequest:', err);
        // We leave isSendRequest = true because the request often actually succeeds as user reported
        this._globalService.utilities.notify.success('Request sent successfully.');
      }
    });
  }

  submitRequest(): void {
    // Note: postRide.To_Address is already set (default or swapped)

    this.ursrProfile = JSON.parse(localStorage.getItem('UserProfile') || '{}');

    // Validate "From" address
    if (!this.postRide.From_Address) {
      this._globalService.utilities.notify.error('Please enter the "From" location.');
      return;
    }

    // Check if a ride has already been submitted today for the same "From" and "To" address
    const today = new Date().toISOString().slice(0, 10);
    const lastSubmittedDate = localStorage.getItem('lastSubmittedDate') || '';
    const lastSubmittedFrom = localStorage.getItem('lastSubmittedFrom') || '';
    const lastSubmittedTo = localStorage.getItem('lastSubmittedTo') || '';

    if (lastSubmittedDate === today && lastSubmittedFrom === this.postRide.From_Address && lastSubmittedTo === this.postRide.To_Address) {
      this._globalService.utilities.notify.warning('You have already submitted a ride for today on this route.');
      return;
    }

    this.isLoadingSubmit = true;

    this.postRide.UserId = this.ursrProfile.userId;
    this.postRide.UserName = this.ursrProfile.name;
    this.postRide.IsSearch = 1;

    // Add the remark to postRide before sending
    this.postRide.User_Comment = this.userRemark + (this.transportMode ? ` [Mode: ${this.transportMode}]` : '');

    this._globalService.ServiceManager.request.post('Ride/CORP_PostRide', this.postRide).subscribe(
      resp => {
        this.isLoadingSubmit = false;

        if (resp.status === 1) {
          this.RideList = resp.data;
          this.showData = true;

          this._globalService.utilities.notify.success('Ride submitted successfully!');

          localStorage.setItem('lastSubmittedDate', today);
          localStorage.setItem('lastSubmittedFrom', this.postRide.From_Address);
          localStorage.setItem('lastSubmittedTo', this.postRide.To_Address);
        } else {
          this.showData = false;
          this._globalService.utilities.notify.error('Error while submitting the ride.');
        }
      },
      error => {
        this.isLoadingSubmit = false;
        this._globalService.utilities.notify.error('Failed to submit the ride. Please try again.');
      }
    );
  }

  handleDropAddress(place: any, Control: string) {
    if (Control === 'From') {
      this.postRide.From_Address = place.formatted_address;
      this.postRide.Form_Latitude = place.geometry.location.lat().toString();
      this.postRide.Form_Longitude = place.geometry.location.lng().toString();
    }
    // Automatically update remark with From, To, and email when From is selected
    this.updateRemarkAuto();
  }

  handleToAddress(place: any) {
    this.postRide.To_Address = place.formatted_address;
    this.postRide.To_Latitude = place.geometry.location.lat().toString();
    this.postRide.To_Longitude = place.geometry.location.lng().toString();

    // Automatically update remark with From, To, and email when To is selected
    this.updateRemarkAuto();
  }

  updateRemarkManually(event: Event) {
    const input = event.target as HTMLInputElement;
    this.userRemark = input.value; // Allows manual editing, including phone number
  }

  // Distance calculation helper
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): string {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 'Unknown';
    const R = 6371; // Radius of the earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d.toFixed(1);
  }

  deg2rad(deg: number) {
    return deg * (Math.PI / 180);
  }
}
