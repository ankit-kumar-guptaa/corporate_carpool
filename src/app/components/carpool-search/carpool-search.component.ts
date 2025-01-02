import { Component } from '@angular/core';
import { GlobalService } from '../../services/global-service';

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
  viaLocation: string = '';
  viaLocations: string[] = []; // Initially empty
  isLoadingSearch: boolean = false; // Only for search button loading state
  isLoadingSubmit: boolean = false; // Only for submit button loading state

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
    this.isLoadingSearch = true; // Start loading for search button
    setTimeout(() => {
      this.carpoolResults = [
        { type: 'Pooler', name: 'Ankit Sharma', from: 'Okhla' },
        { type: 'Seeker', name: 'Ramesh Kumar', from: 'Badarpur' },
        { type: 'Pooler', name: 'Pooja Singh', from: 'Jasola' },
        { type: 'Seeker', name: 'Neha Verma', from: 'Kalkaji' },
        { type: 'Pooler', name: 'Vikas Bhardwaj', from: 'Sarita Vihar' },
        { type: 'Seeker', name: 'Sakshi Gupta', from: 'Tughlakabad' },
        { type: 'Pooler', name: 'Amit Yadav', from: 'Govindpuri' },
        { type: 'Seeker', name: 'Rohit Ahuja', from: 'Nehru Place' },
        { type: 'Pooler', name: 'Meera Patel', from: 'Greater Kailash' },
        { type: 'Seeker', name: 'Kunal Chhabra', from: 'Lajpat Nagar' }
      ];
      this.isLoadingSearch = false; // End loading after search results are updated
    }, 2000); // Simulating async process (2 seconds delay)
  }

  // Method to handle form submission
  submitRequest(): void {
    this.isLoadingSubmit = true; 
    this._globalService.utilities.notify.info(`Role: ${this.selectedRole}, From: ${this.fromLocation}, To: A-83, Okhla Phase II, New Delhi`);
    setTimeout(() => {
      this.isLoadingSubmit = false; 
    }, 1500); 
  }

  // Method to handle connecting with the carpool partner
  connectCarpool(): void {
    alert('Connecting with the carpool partner...');
  }
}
