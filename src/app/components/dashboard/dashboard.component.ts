import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  loggedInUserName: string = '';
  totalRides: number = 0;
  totalConnections: number = 0;
  myRides: Array<{ from: string, to: string, date: string, status: string }> = [];
  myConnections: Array<{ name: string, type: string }> = [];

  ngOnInit(): void {
    // Fetch user data from localStorage
    this.loggedInUserName = localStorage.getItem('loggedInUserName') || '';

    const storedRides = JSON.parse(localStorage.getItem('myRides') || '[]');
    this.myRides = storedRides;

    // Update ride stats
    this.totalRides = storedRides.length;

    const storedConnections = JSON.parse(localStorage.getItem('myConnections') || '[]');
    this.myConnections = storedConnections;

    // Update connection stats
    this.totalConnections = storedConnections.length;
  }

  logout(): void {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('loggedInUserName');
    // Redirect to login page or any other action on logout
  }
}
