import { Component, inject } from '@angular/core';
import { LoadingService } from '../../../services/loading/loading.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-indicator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading-indicator.component.html',
  styleUrl: './loading-indicator.component.css',
})
export class LoadingIndicatorComponent {
  protected loadingService = inject(LoadingService);

  isLoading$ = this.loadingService.isLoading$;
}
