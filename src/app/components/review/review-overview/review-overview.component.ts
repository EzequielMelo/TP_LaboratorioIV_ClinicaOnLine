import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ReviewForPatient } from '../../../classes/reviewForPatient';
import { ReviewForSpecialist } from '../../../classes/reviewForSpecialist';

@Component({
  selector: 'app-review-overview',
  standalone: true,
  imports: [],
  templateUrl: './review-overview.component.html',
  styleUrl: './review-overview.component.css',
})
export class ReviewOverviewComponent {
  @Input() review: string | null = null;
  @Output() eventCloseModal = new EventEmitter<{
    event: boolean;
  }>();

  closeModal() {
    this.eventCloseModal.emit({ event: false });
  }
}
