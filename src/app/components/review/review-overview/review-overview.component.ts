import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ReviewForPatient } from '../../../classes/reviewForPatient';
import { ReviewForSpecialist } from '../../../classes/reviewForSpecialist';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';

@Component({
  selector: 'app-review-overview',
  standalone: true,
  imports: [],
  templateUrl: './review-overview.component.html',
  styleUrl: './review-overview.component.css',
  animations: [
    trigger('modalAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.9)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'scale(1)' })),
      ]),
      transition(':leave', [
        animate(
          '150ms ease-in',
          style({ opacity: 0, transform: 'scale(0.95)' })
        ),
      ]),
    ]),
    trigger('backdropAnimation', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms ease-out', style({ opacity: 1 })),
      ]),
      transition(':leave', [animate('150ms ease-in', style({ opacity: 0 }))]),
    ]),
  ],
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
