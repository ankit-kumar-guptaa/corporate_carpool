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
  viaLocations: string[] = []; // Initially empty
  isLoadingSearch: boolean = false; // Only for search button loading state
  isLoadingSubmit: boolean = false; // Only for submit button loading state
  postRide: PostRide = new PostRide();
  noRidesAvailable: boolean = false;
  RideList: any[] = [];
  showData: boolean = false;
  userRemark: string = ''; // For remark
  transportMode: string = '';
  transportOptions: string[] = ['Cab', 'Bus', 'Own Car', 'Own Bike'];

  constructor(private _globalService: GlobalService) {
    // Fetch user profile and email on component initialization
    this.loadUserProfile();
  }

  // Fetch user profile and email
  loadUserProfile() {
    const userProfile = this._globalService.utilities.storage.get('UserProfile') || '{}';
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
    this.postRide.To_Address = 'B2, Plot 2 Tower 1, Nr Indus Valley School, Block B, Industrial Area, Sector 62, Noida';
    this.postRide.To_Latitude = '28.560965';
    this.postRide.To_Longitude = '77.370719';

    this.ursrProfile = JSON.parse(this._globalService.utilities.storage.get('UserProfile')) || undefined;

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

    this.postRide.UserId = this.ursrProfile.id;
    this.postRide.UserName = this.ursrProfile.name;
    this.postRide.IsSearch = 0;

    // Add the remark to postRide before sending
    this.postRide.User_Comment = this.userRemark + (this.transportMode ? ` [Mode: ${this.transportMode}]` : '');

    this._globalService.ServiceManager.request.post('Ride/CORP_PostRide', this.postRide).subscribe(resp => {
      this.isLoadingSearch = false;

      if (resp.status === 1) {
        this.RideList = resp.data;
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
      UserId: this.ursrProfile.id,
      RideId: item.rideID
    };

    this._globalService.ServiceManager.request.post('Ride/CORP_SendRideRequest', param).subscribe({
      next: (resp) => {
        if (resp.status === 1) {
          item.IsSendRequest = true;
          this._globalService.utilities.notify.success('Request sent successfully.');
        } else {
          this._globalService.utilities.notify.error('Error sending request.');
        }
      },
      error: () => {
        this._globalService.utilities.notify.error('Failed to send the request.');
      }
    });
  }

  submitRequest(): void {
    this.postRide.To_Address = 'B2, Plot 2 Tower 1, Nr Indus Valley School, Block B, Industrial Area, Sector 62, Noida';
    this.postRide.To_Latitude = '28.560965';
    this.postRide.To_Longitude = '77.370719';

    this.ursrProfile = JSON.parse(this._globalService.utilities.storage.get('UserProfile')) || undefined;

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

    this.postRide.UserId = this.ursrProfile.id;
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
    } else {
      this.postRide.To_Address = 'B2, Plot 2 Tower 1, Nr Indus Valley School, Block B, Industrial Area, Sector 62, Noida';
      this.postRide.To_Latitude = '28.560965';
      this.postRide.To_Longitude = '77.370719';
    }

    // Automatically update remark with From, To, and email when From is selected
    if (this.postRide.From_Address && this.postRide.To_Address) {
      this.userRemark = `I am looking for a ride from ${this.postRide.From_Address} to ${this.postRide.To_Address}. My email is ${this.ursrProfile?.email || 'not available'}`;
    }
  }

  // Method to allow manual updates to remark (e.g., adding phone number)
  updateRemarkManually(event: Event) {
    const input = event.target as HTMLInputElement;
    this.userRemark = input.value; // Allows manual editing, including phone number
  }
}