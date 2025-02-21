import { Component, EventEmitter, Input, Output } from '@angular/core';
import { HealthRecord } from '../../../classes/health-record';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-health-record-overview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './health-record-overview.component.html',
  styleUrl: './health-record-overview.component.css',
})
export class HealthRecordOverviewComponent {
  @Input() healthRecord: HealthRecord | null = null;
  @Output() eventCloseModal = new EventEmitter<{
    event: boolean;
  }>();

  closeModal() {
    this.eventCloseModal.emit({ event: false });
  }
}
