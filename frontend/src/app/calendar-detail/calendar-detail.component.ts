import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';  // CommonModule for pipes like 'date'

@Component({
  standalone: true,
  selector: 'app-calendar-detail',
  templateUrl: './calendar-detail.component.html',
  styleUrls: ['./calendar-detail.component.css'],
  imports: [CommonModule]  // Ensure CommonModule is imported here
})
export class CalendarDetailComponent {
  @Input() event: any;  // Event details passed into the component
  @Output() close = new EventEmitter<void>();  // Emit event to close the modal

  closeModal() {
    this.close.emit();
  }
}
