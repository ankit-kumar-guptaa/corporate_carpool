import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  @Input() isLoggedIn: boolean = false;
  @Input() userName: string = 'User';
  @Output() logoutEvent = new EventEmitter<void>();

  logout(): void {
    this.logoutEvent.emit();
  }
}
