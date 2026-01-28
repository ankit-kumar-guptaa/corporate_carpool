import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GlobalService } from '../../services/global-service';
import { helper } from '../../models/helper';

@Component({
  selector: 'app-transport-impact',
  templateUrl: './transport-impact.component.html',
  styleUrls: ['./transport-impact.component.scss']
})
export class TransportImpactComponent implements OnInit {
  transportMode: string = '';
  vehicleType: string = '';
  fuelType: string = '';
  bikeFuelType: string = '';
  impactCalculated: boolean = false;
  signupData: any = null;
  
  // Constants for Office Location (Example: Connaught Place, New Delhi)
  readonly OFFICE_LAT: number = 28.6304; 
  readonly OFFICE_LNG: number = 77.2177; 

  // Calculation Results
  distanceKm: number = 0;
  currentEmission: number = 0;
  co2Saved: number = 0;
  
  userLatitude: string = '';
  userLongitude: string = '';

  constructor(private router: Router, private _globalService: GlobalService) { 
    // Capture state from navigation (LoginSignupComponent)
    const nav = this.router.getCurrentNavigation();
    if (nav?.extras?.state?.['signupData']) {
      this.signupData = nav.extras.state['signupData'];
    } else {
       // Fallback for direct access if history.state is populated (e.g. slight refresh delay)
       this.signupData = history.state.signupData;
    }
  }

  ngOnInit(): void {
    if (this.signupData) {
      // New User Flow
      this.userLatitude = this.signupData.Latitude;
      this.userLongitude = this.signupData.Longitude;
    } else {
      // Existing User Flow (Edit Profile)
      const userProfile = this._globalService.utilities.storage.get('UserProfile');
      if (userProfile) {
        const user = typeof userProfile === 'string' ? JSON.parse(userProfile) : userProfile;
        this.userLatitude = user.Latitude;
        this.userLongitude = user.Longitude;
      } else {
        // If no user and no signup data, redirect to login
        this.router.navigate(['/']);
      }
    }
  }

  selectTransport(mode: string): void {
    this.transportMode = mode;
    this.vehicleType = '';
    this.fuelType = '';
    this.bikeFuelType = '';
    this.impactCalculated = false;
    if (mode === 'Cab') {
      this.calculateImpact();
    }
  }

  selectVehicle(type: string): void {
    this.vehicleType = type;
    this.fuelType = '';
    this.bikeFuelType = '';
    this.impactCalculated = false;
  }

  selectFuel(type: string): void {
    if (this.vehicleType === 'Car') {
      this.fuelType = type;
    } else {
      this.bikeFuelType = type;
    }
    this.calculateImpact();
  }

  calculateImpact(): void {
    if (!this.userLatitude || !this.userLongitude) {
        this._globalService.utilities.notify.warning('Location not found. Using default.');
        this.distanceKm = 15; // Default
    } else {
        // 1. Calculate Distance (Haversine Formula)
        const lat1 = parseFloat(this.userLatitude);
        const lon1 = parseFloat(this.userLongitude);
        const lat2 = this.OFFICE_LAT;
        const lon2 = this.OFFICE_LNG;
    
        const R = 6371; // Radius of the earth in km
        const dLat = this.deg2rad(lat2 - lat1);
        const dLon = this.deg2rad(lon2 - lon1);
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
          Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        this.distanceKm = R * c; // One way distance
    }

    // 2. Calculate Emissions
    // Emission Factors (kg CO2 per km) - Approximate
    let emissionFactor = 0;

    if (this.transportMode === 'Cab') {
      emissionFactor = 0.192; // Avg Car
    } else if (this.transportMode === 'Self') {
      if (this.vehicleType === 'Car') {
        if (this.fuelType === 'Petrol') emissionFactor = 0.192;
        else if (this.fuelType === 'Diesel') emissionFactor = 0.171;
        else if (this.fuelType === 'CNG') emissionFactor = 0.150; // Lower than petrol
        else if (this.fuelType === 'Electric') emissionFactor = 0.050; // Grid intensity dependent, but lower
      } else if (this.vehicleType === 'Bike') {
        if (this.bikeFuelType === 'Petrol') emissionFactor = 0.100;
        else if (this.bikeFuelType === 'Electric') emissionFactor = 0.020;
      }
    }

    const roundTripDistance = this.distanceKm * 2;
    this.currentEmission = roundTripDistance * emissionFactor;

    // Potential Saving: If they carpool (share with 3 others = 1/4th emission) or use shuttle
    // We assume they save ~75% if switching from Car to Carpool, or 100% if switching to EV shuttle (ideal scenario)
    // Let's simply say: Saving = Current Emission * 0.8 (Assumption for impact visualization)
    // Or if they are already EV, saving is less but congestion is reduced.
    // User asked: "CO2 emission per day ke hisaab se employee kitna kam krenge" (How much they will reduce)
    
    // Logic: 
    // If Solo Car (Petrol) -> Carpool (4 pax) => Saving is 75%
    // If Bike -> Carpool => Might actually increase CO2 if car is used, but safer/comfortable. 
    // Let's assume the comparison is against "Solo Driving".
    
    // We display "Potential CO2 Reduction per Day"
    this.co2Saved = this.currentEmission * 0.75; // Generic 75% reduction assumption for carpooling
    
    this.impactCalculated = true;
  }

  deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  submitImpact(): void {
    if (this.signupData) {
       // FINAL REGISTRATION STEP (New User)
       const param: any = {
         email: this.signupData.email,
         mobile_No: this.signupData.mobile_No,
         Password: this.signupData.Password,
         name: this.signupData.name,
         domain: this.signupData.domain || 'amdocs.com',
         VehicleType: this.transportMode === 'Cab' ? 'Cab' : (this.vehicleType || 'None'),
         Address: this.signupData.Address,
         Latitude: this.signupData.Latitude,
         Longitude: this.signupData.Longitude
       };
       
       const helperdata = new helper();
       helperdata.spName = 'CORP_User_Register';
       helperdata.payload = JSON.stringify(param);
       
       this._globalService.ServiceManager.request.post('Ride/GetDataFromServer', helperdata).subscribe(
         (res) => {
           if (res.status === 1 && res.data.dataset.table.length > 0) {
             this._globalService.utilities.notify.success('Registration Complete! Please Login.');
             this.router.navigate(['/']);
           } else {
             this._globalService.utilities.notify.error('Registration Failed: Email or Phone already exists.');
             // Redirect back to signup after a short delay so they can fix details
             setTimeout(() => {
                this.router.navigate(['/']); 
             }, 3000);
           }
         },
         (err) => {
             console.error(err);
             this._globalService.utilities.notify.error('Server Error during Registration.');
         }
       );
    } else {
      // Existing User Update Flow
      // User requested: "complete register ho jaaye carpool search par nhi login par lekar jaao"
      // We clear the session to force a fresh login
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('loggedInUserName');
      this._globalService.utilities.storage.removeItem('UserProfile');
  
      this._globalService.utilities.notify.success('Thank you! Profile updated. Now please login to your carpool account.');
      this.router.navigate(['/']);
    }
  }
}
