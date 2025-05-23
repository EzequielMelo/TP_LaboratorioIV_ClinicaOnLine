import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Review } from '../../../classes/reviewForPatient';

@Component({
  selector: 'app-review-overview',
  standalone: true,
  imports: [],
  templateUrl: './review-overview.component.html',
  styleUrl: './review-overview.component.css',
})
export class ReviewOverviewComponent {
  @Input() review: Review | null = null;
  @Output() eventCloseModal = new EventEmitter<{
    event: boolean;
  }>();

  closeModal() {
    this.eventCloseModal.emit({ event: false });
  }
}
