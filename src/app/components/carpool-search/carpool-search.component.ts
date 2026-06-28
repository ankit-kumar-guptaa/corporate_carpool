import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { GlobalService } from '../../services/global-service';
import { PostRide } from '../../models/post-ride';

@Component({
  selector: 'app-carpool-search',
  templateUrl: './carpool-search.component.html',
  styleUrls: ['./carpool-search.component.scss']
})
export class CarpoolSearchComponent implements OnInit {
  minDate: string = new Date().toISOString().split('T')[0]; // Minimum date for one-time rides
  selectedRole: string = 'Pooler'; // Removed 'Either'
  fromLocation: string = '';
  carpoolResults: Array<{ type: string, name: string, from: string }> = [];
  isAddViaClicked: boolean = false;
  selectedSeats: number = 1;
  ursrProfile: any;
  viaLocation: string = '';
  viaLocations: string[] = [];
  isLoadingSearch: boolean = false;
  isLoadingSubmit: boolean = false;
  postRide: PostRide = new PostRide();
  noRidesAvailable: boolean = false;
  isEditMode: boolean = false;
  editRideId: any = null;
  RideList: any[] = [];
  showData: boolean = false;
  userRemark: string = '';
  transportMode: string = '';
  transportOptions: string[] = ['Cab', 'Bus', 'Own Car', 'Own Bike'];

  // Bug fix: Ride Type & Date & Days Selection
  rideType: string = 'Recurring'; // 'Recurring' or 'One-Time'
  rideDate: string = ''; // For one-time rides
  daysOfWeek: string[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  selectedDays: { [key: string]: boolean } = {
    'Mon': true, 'Tue': true, 'Wed': true, 'Thu': true, 'Fri': true, 'Sat': false, 'Sun': false
  };

  readonly OFFICE_ADDRESS = 'OXYGEN BUSINESS PARK, Sector 144, Noida, Uttar Pradesh 201304';
  readonly OFFICE_LAT = '28.4977536';
  readonly OFFICE_LNG = '77.4350798';

  constructor(private _globalService: GlobalService, private router: Router, private route: ActivatedRoute) {
    // Fetch user profile and email on component initialization
    this.loadUserProfile();
    // Initialize To Address to Office by default
    this.postRide.To_Address = this.OFFICE_ADDRESS;
    this.postRide.To_Latitude = this.OFFICE_LAT;
    this.postRide.To_Longitude = this.OFFICE_LNG;
    const today = new Date();
    // Format to YYYY-MM-DD for HTML date input
    this.minDate = today.toISOString().split('T')[0];
  }

  // Bug 9: Load edit data if coming from dashboard edit action
  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['edit'] === 'true') {
        const editData = localStorage.getItem('editRideData');
        if (editData) {
          try {
            const data = JSON.parse(editData);
            this.isEditMode = true;
            this.editRideId = data.rideId || null;
            this.postRide.From_Address = data.from || '';
            this.postRide.To_Address = data.to || '';
            this.selectedSeats = data.seats || 1;
            this.userRemark = data.comment || '';
            this.selectedRole = data.role || 'Pooler';
            this.rideType = data.rideType || 'Recurring';
            this.rideDate = data.rideDate || '';

            // Restore selected weekdays from frequency string (e.g. "Mon, Tue, Wed")
            if (data.rideType === 'Recurring' && data.rideFrequency) {
              // Reset all days to false first
              this.daysOfWeek.forEach(day => this.selectedDays[day] = false);
              const days = data.rideFrequency.split(',').map((d: string) => d.trim());
              days.forEach((day: string) => {
                if (this.selectedDays.hasOwnProperty(day)) {
                  this.selectedDays[day] = true;
                }
              });
            }

            localStorage.removeItem('editRideData');
            this._globalService.utilities.notify.info('Edit your ride details and click Update Ride.');
          } catch { }
        }
      }
    });
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
    this.postRide.Seats = this.selectedSeats;

    // Add the remark to postRide before sending
    this.postRide.User_Comment = this.userRemark + (this.transportMode ? ` [Mode: ${this.transportMode}]` : '');

    this.isLoadingSearch = true;
    this._globalService.ServiceManager.request.post('Ride/CORP_PostRide', this.postRide).subscribe(resp => {
      this.isLoadingSearch = false;

      if (resp.status === 1) {
        const acceptedSeatsMap = JSON.parse(localStorage.getItem('acceptedSeatsMap') || '{}');

        let allRides = (resp.data || []).map((ride: any) => {
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

          let totalSeats = 3;
          if (ride.user_Comment && ride.user_Comment.includes('Seats:')) {
            const match = ride.user_Comment.match(/Seats:\s*(\d+)/);
            if (match) {
              totalSeats = parseInt(match[1], 10);
            }
          }

          const rideId = ride.rideID || ride.id;
          const acceptedSeats = acceptedSeatsMap[rideId] || 0;
          let availableSeats = totalSeats - acceptedSeats;
          if (availableSeats < 0) availableSeats = 0;

          return { ...ride, distanceKm: dist, isSendRequest: ride.isSendRequest || false, availableSeats: availableSeats, totalSeats: totalSeats };
        });

        this.RideList = allRides.filter((r: any) => r.availableSeats >= this.selectedSeats);

        this.showData = true;

        if (this.RideList.length === 0) {
          this.noRidesAvailable = true;
          // Fix: Keep showData = true so the empty state CTA triggers
          this.showData = true;
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
          // Bug 6: If the backend returns a clear error, revert the optimistic update
          item.isSendRequest = false;
          this._globalService.utilities.notify.warning(resp.message || 'Request might have failed. Please check.');
        }
      },
      error: (err) => {
        // Bug 6: Don't blindly treat errors as success — check response text
        console.warn('API error or parse error on SendRideRequest:', err);
        // Only keep optimistic state if it's a JSON parse error (which typically means success with text response)
        if (err?.status === 200 || err?.status === 201) {
          this._globalService.utilities.notify.success('Request sent successfully.');
        } else {
          item.isSendRequest = false;
          this._globalService.utilities.notify.error('Failed to send request. Please try again.');
        }
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

    if (this.rideType === 'One-Time' && (this.rideDate === undefined || this.rideDate === null || this.rideDate.trim() === '')  ) {
      this._globalService.utilities.notify.error('Please Enter "Select Date".');
      return;

    }


    // // Bug 9: Check if user already has an active ride (same route or any active ride)
    // const activeRideKey = `activeRide_${this.ursrProfile.userId}`;
    // const existingRide = localStorage.getItem(activeRideKey);
    // if (existingRide) {
    //   try {
    //     const existing = JSON.parse(existingRide);
    //     // Allow if editing (different ride) or same-day resubmission
    //     const isEditing = this.route.snapshot.queryParams['edit'] === 'true';
    //     if (!isEditing) {
    //       this._globalService.utilities.notify.warning(
    //         `You already have an active ride posted (${existing.from} → ${existing.to}). Please edit or delete it first from the Dashboard.`
    //       );
    //       return;
    //     }
    //   } catch {}
    // }

    this.isLoadingSubmit = true;

    this.postRide.UserId = this.ursrProfile.userId;
    this.postRide.UserName = this.ursrProfile.name;
    this.postRide.Seats = this.selectedSeats;
    this.postRide.userType = this.selectedRole

    // When editing, pass RideId and set IsSearch=2 for update; IsSearch=1 for new post
    if (this.isEditMode && this.editRideId) {
      this.postRide.RideId = this.editRideId;
      this.postRide.IsSearch = 2;
    } else {
      this.postRide.RideId = 0;
      this.postRide.IsSearch = 1;
    }

    let frequencyText = '';
    if (this.rideType === 'Recurring') {
      const activeDays = this.daysOfWeek.filter(day => this.selectedDays[day]).join(', ');
      frequencyText = (activeDays || 'None');
    } else {
      frequencyText = this.rideDate;
    }




    this.postRide.Ride_Type = this.rideType;
    this.postRide.Ride_Frequency = frequencyText;
    this.postRide.Ride_Date = this.rideDate;

    // Add the remark to postRide before sending
    this.postRide.User_Comment = this.userRemark + (this.transportMode ? ` [Mode: ${this.transportMode}]` : '') + ` | Seats: ${this.selectedSeats}` + ` | Type: ${frequencyText}`;

    this._globalService.ServiceManager.request.post('Ride/CORP_PostRide', this.postRide).subscribe(
      resp => {
        this.isLoadingSubmit = false;

        if (resp.status === 1) {

          if (parseInt(resp.trackingNumber) > 0) {
            this._globalService.utilities.notify.error(resp.message || `You already have an active ride posted (${this.postRide.From_Address} → ${this.postRide.To_Address}). Please edit or delete it first from the Dashboard.`);
          }
          else {
            const successMsg = this.isEditMode 
              ? (resp.message || 'Ride updated successfully!') 
              : (resp.message || 'Ride submitted successfully!');
            this._globalService.utilities.notify.success(successMsg);
            this.router.navigate(['/dashboard']);
          }

          // this._globalService.utilities.notify.success('Ride submitted successfully!');

          // Bug 9: Track active ride for this user
          // localStorage.setItem(activeRideKey, JSON.stringify({
          //   from: this.postRide.From_Address,
          //   to: this.postRide.To_Address,
          //   date: new Date().toISOString().slice(0, 10),
          //   seats: this.selectedSeats
          // }));

          // Fix: Navigate to dashboard after successful post instead of showing empty search state

        } else {
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

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}
