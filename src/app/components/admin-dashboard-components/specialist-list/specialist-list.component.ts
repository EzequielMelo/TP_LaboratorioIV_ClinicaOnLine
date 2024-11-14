import { Component, inject, Input } from '@angular/core';
import { Specialist } from '../../../classes/specialist.class';
import { DatabaseService } from '../../../services/database/database.service';
import { FirebaseError } from 'firebase/app';

@Component({
  selector: 'app-specialist-list',
  standalone: true,
  imports: [],
  templateUrl: './specialist-list.component.html',
  styleUrl: './specialist-list.component.css',
})
export class SpecialistListComponent {
  @Input() data: Specialist[] | null = null;

  private db = inject(DatabaseService);

  toggleAccountConfirmed(specialist: Specialist): void {
    // Cambia el valor localmente
    specialist.accountConfirmed = !specialist.accountConfirmed;

    // Actualiza en la base de datos
    this.db
      .updateAccountConfirmed(specialist.id, specialist.accountConfirmed)
      .then(() => {
        console.log('Account confirmed status updated successfully');
      })
      .catch((error: FirebaseError) => {
        console.error('Error updating account confirmed status:', error);
        specialist.accountConfirmed = !specialist.accountConfirmed;
      });
  }

  trackBySpecialist(index: number, specialist: Specialist): string {
    return specialist.dni; // O usa otro identificador único si tienes
  }
}
