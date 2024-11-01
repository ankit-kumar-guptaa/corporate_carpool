import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  isLoggedIn: boolean = false;
  loggedInUserName: string = '';
  carpoolResults: Array<{ type: string, name: string, from: string }> = [];

  ngOnInit(): void {
    // Check if user is logged in from localStorage
    const loggedIn = localStorage.getItem('isLoggedIn');
    const userName = localStorage.getItem('loggedInUserName');
    
    if (loggedIn === 'true' && userName) {
      this.isLoggedIn = true;
      this.loggedInUserName = userName;
    }
  }

  onLogin(userName: string): void {
    this.isLoggedIn = true;
    this.loggedInUserName = userName;

    // Store login status in localStorage
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('loggedInUserName', userName);
  }

  logout(): void {
    this.isLoggedIn = false;
    this.loggedInUserName = '';

    // Clear login status from localStorage
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('loggedInUserName');
  }

  searchCarpool(): void {
    // Dummy data for available carpool results
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

  connectCarpool(): void {
    alert('Connecting with the carpool partner...');
  }
}
