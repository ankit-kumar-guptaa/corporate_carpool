import { Component } from '@angular/core';

@Component({
  selector: 'app-carpool-search',
  templateUrl: './carpool-search.component.html',
  styleUrls: ['./carpool-search.component.scss']
})
export class CarpoolSearchComponent {
  selectedRole: string = 'Either'; 
  fromLocation: string = '';
  carpoolResults: Array<{ type: string, name: string, from: string }> = [];

  searchCarpool(): void {
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
  }

  submitRequest(): void {
    alert(`Role: ${this.selectedRole}, From: ${this.fromLocation}, To: A-83, Okhla Phase II, New Delhi`);
  }

  connectCarpool(): void {
    alert('Connecting with the carpool partner...');
  }
}
