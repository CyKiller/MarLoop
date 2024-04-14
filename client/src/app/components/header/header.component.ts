import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  standalone: true
})
export class HeaderComponent {
  isExpanded = false;

  constructor() {
    console.log('HeaderComponent initialized');
  }

  toggleExpansion() {
    this.isExpanded = !this.isExpanded;
    console.log(`Header menu expansion toggled: ${this.isExpanded}`);
  }
}