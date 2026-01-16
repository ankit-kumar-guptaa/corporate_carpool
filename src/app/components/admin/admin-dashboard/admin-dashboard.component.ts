import { Component } from '@angular/core';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent {
  
  // Stats for Charts
  monthlyStats = [
      { month: 'Jan', value: 450, height: '40%', co2Val: 200, co2Height: '30%' },
      { month: 'Feb', value: 520, height: '45%', co2Val: 250, co2Height: '35%' },
      { month: 'Mar', value: 600, height: '55%', co2Val: 300, co2Height: '40%' },
      { month: 'Apr', value: 750, height: '65%', co2Val: 380, co2Height: '50%' },
      { month: 'May', value: 800, height: '70%', co2Val: 420, co2Height: '55%' },
      { month: 'Jun', value: 950, height: '85%', co2Val: 500, co2Height: '65%' },
      { month: 'Jul', value: 1100, height: '95%', co2Val: 600, co2Height: '75%' },
      { month: 'Aug', value: 850, height: '75%', co2Val: 480, co2Height: '60%' },
      { month: 'Sep', value: 900, height: '80%', co2Val: 520, co2Height: '65%' },
      { month: 'Oct', value: 1000, height: '90%', co2Val: 580, co2Height: '70%' },
      { month: 'Nov', value: 1200, height: '100%', co2Val: 700, co2Height: '85%' },
      { month: 'Dec', value: 1150, height: '98%', co2Val: 650, co2Height: '80%' },
  ];

  // Recent Rides Data
  recentRides = [
      { from: 'Noida Sec 62', to: 'Cyber Hub, Gurgaon', user: 'Amit Singh', co2: 4.2, time: '10 mins ago' },
      { from: 'Dwarka Sec 10', to: 'Connaught Place', user: 'Sarah Jenkins', co2: 2.8, time: '25 mins ago' },
      { from: 'Indirapuram', to: 'Noida Sec 18', user: 'Rahul Sharma', co2: 1.5, time: '42 mins ago' },
      { from: 'Vasant Kunj', to: 'Aerocity', user: 'Priya Verma', co2: 3.1, time: '1 hr ago' },
      { from: 'Saket', to: 'Nehru Place', user: 'Vikram M.', co2: 1.2, time: '2 hrs ago' }
  ];

  // Updated Top Employees with Role
  topEmployees = [
    { name: 'Rahul Sharma', dept: 'IT Engineering', role: 'Pooler', rides: 145, distance: '2,340', co2: 450 },
    { name: 'Priya Verma', dept: 'HR', role: 'Seeker', rides: 132, distance: '1,980', co2: 380 },
    { name: 'Amit Singh', dept: 'Marketing', role: 'Pooler', rides: 120, distance: '1,500', co2: 310 },
    { name: 'Sneha Gupta', dept: 'Finance', role: 'Seeker', rides: 98, distance: '1,200', co2: 240 },
    { name: 'Vikram Malhotra', dept: 'Operations', role: 'Pooler', rides: 85, distance: '980', co2: 190 },
  ];
}
