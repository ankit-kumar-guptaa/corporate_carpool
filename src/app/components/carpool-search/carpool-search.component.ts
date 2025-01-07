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
  noRidesAvailable:boolean=false;
  RideList:any=[];
  showData:boolean=false;
  constructor(private _globalService: GlobalService){}

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


    //this.isLoadingSearch = true; // Start loading for search button
    // setTimeout(() => {
    //   this.carpoolResults = [
    //     { type: 'Pooler', name: 'Ankit Sharma', from: 'Okhla' },
    //     { type: 'Seeker', name: 'Ramesh Kumar', from: 'Badarpur' },
    //     { type: 'Pooler', name: 'Pooja Singh', from: 'Jasola' },
    //     { type: 'Seeker', name: 'Neha Verma', from: 'Kalkaji' },
    //     { type: 'Pooler', name: 'Vikas Bhardwaj', from: 'Sarita Vihar' },
    //     { type: 'Seeker', name: 'Sakshi Gupta', from: 'Tughlakabad' },
    //     { type: 'Pooler', name: 'Amit Yadav', from: 'Govindpuri' },
    //     { type: 'Seeker', name: 'Rohit Ahuja', from: 'Nehru Place' },
    //     { type: 'Pooler', name: 'Meera Patel', from: 'Greater Kailash' },
    //     { type: 'Seeker', name: 'Kunal Chhabra', from: 'Lajpat Nagar' }
    //   ];
    //   this.isLoadingSearch = false; // End loading after search results are updated
    // }, 2000); // Simulating async process (2 seconds delay)
  }

  // Method to handle form submission
  submitRequest(): void {

    this.ursrProfile = JSON.parse(this._globalService.utilities.storage.get('UserProfile')) || undefined;

    // Validate 'From' and 'To' addresses
   if (!this.postRide.From_Address) {
     this._globalService.utilities.notify.error('Please enter the "From" location.');
     return;
   }

  //  if (!this.postRide.To_Address) {
  //    this._globalService.utilities.notify.error('Please enter the "To" location.');
  //    return;
  //  }

   this.noRidesAvailable = false;

   this.postRide.UserId = this.ursrProfile.id;
   this.postRide.UserName = this.ursrProfile.name;
   this.postRide.IsSearch = 1;



    this._globalService.ServiceManager.request.post('Ride/CORP_PostRide', this.postRide).subscribe(resp => {
      this.isLoadingSearch = false;

      if (resp.status === 1) {
        this.RideList = resp.data;
        this.showData = true;

        if (this.RideList.length === 0) {
          this.noRidesAvailable = true;
          this._globalService.utilities.notify.warning('No ride found on this route');
        }
      } else {
        this.showData = false;
        this._globalService.utilities.notify.error('Error on Search Page.');
      }
    }, error => {
      this.isLoadingSearch = false;
      this._globalService.utilities.notify.error('Failed to search rides.');
    });



    // this.isLoadingSubmit = true; 
    // this._globalService.utilities.notify.info(`Role: ${this.selectedRole}, From: ${this.fromLocation}, To: A-83, Okhla Phase II, New Delhi`);
    // setTimeout(() => {
    //   this.isLoadingSubmit = false; 
    // }, 1500); 
  }

  // Method to handle connecting with the carpool partner
  connectCarpool(): void {
    alert('Connecting with the carpool partner...');
  }
  handleDropAddress(place: any, Control: string) {
    if (Control === 'From') {
      this.postRide.From_Address = place.formatted_address;
      this.postRide.Form_Latitude = place.geometry.location.lat().toString();
      this.postRide.Form_Longitude = place.geometry.location.lng().toString();


      this.postRide.To_Address = 'B2, Plot 2 Tower 1, Nr Indus Valley School, Block B, Industrial Area, Sector 62, Noida'
      this.postRide.To_Latitude ='28.560965';
      this.postRide.To_Longitude ='77.370719';

    } else {
      this.postRide.To_Address = 'B2, Plot 2 Tower 1, Nr Indus Valley School, Block B, Industrial Area, Sector 62, Noida'
      this.postRide.To_Latitude ='28.560965';
      this.postRide.To_Longitude ='77.370719';
    }

     // Automatically update comment if both addresses are filled
    if (this.postRide.To_Address && this.postRide.From_Address) {
      this.postRide.User_Comment = `I am looking for a ride from ${this.postRide.From_Address} to ${this.postRide.To_Address}`;
    }
  }

}
