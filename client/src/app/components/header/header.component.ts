import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  standalone: true,
  imports: [CommonModule, FlexLayoutModule]
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