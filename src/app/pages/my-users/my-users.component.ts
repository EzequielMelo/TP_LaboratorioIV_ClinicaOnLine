import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { DatabaseService } from '../../services/database/database.service';
import { AppUser } from '../../classes/user.model';
import { UsersTableComponent } from '../../components/admin-dashboard-components/users-table/users-table.component';
import { Specialist } from '../../classes/specialist.class';
import { FirebaseError } from 'firebase/app';
import { Patient } from '../../classes/patient.class';
import { UsersDetailModalComponent } from '../../components/admin-dashboard-components/users-detail-modal/users-detail-modal.component';

@Component({
  selector: 'app-my-users',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    UsersTableComponent,
    UsersDetailModalComponent,
  ],
  templateUrl: './my-users.component.html',
  styleUrl: './my-users.component.css',
})
export class MyUsersComponent implements OnInit {
  // Propiedades principales
  users: AppUser[] = [];
  filteredUsers: AppUser[] = [];
  selectedPatient: Patient | null = null;
  showPatientHealthRecord: boolean = false;

  // Formularios y filtros
  searchForm: FormGroup;
  selectedUserTypeFilter: string = '';
  selectedStatusFilter: string = '';

  private db = inject(DatabaseService);

  constructor(private formBuilder: FormBuilder) {
    this.searchForm = this.formBuilder.group({
      keyWord: [''],
    });
  }

  ngOnInit(): void {
    this.loadUsers();
    this.setupSearchSubscription();
  }

  /**
   * Carga inicial de usuarios
   */
  loadUsers(): void {
    // Aquí deberías llamar a tu servicio para obtener los usuarios
    this.db.getAllUsers().subscribe((users) => {
      this.users = users;
      this.applyFilters();
    });
    // Datos de ejemplo para demostración
  }

  /**
   * Configuración de la suscripción de búsqueda
   */
  setupSearchSubscription(): void {
    this.searchForm.get('keyWord')?.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  /**
   * Aplicar filtros de búsqueda y tipo de usuario
   */
  applyFilters(): void {
    let filtered = [...this.users];

    // Filtro por palabra clave
    const keyword = this.searchForm.get('keyWord')?.value?.toLowerCase();
    if (keyword) {
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(keyword) ||
          user.lastName.toLowerCase().includes(keyword) ||
          user.email.toLowerCase().includes(keyword) ||
          user.id.toLowerCase().includes(keyword)
      );
    }

    // Filtro por tipo de usuario
    if (this.selectedUserTypeFilter) {
      filtered = filtered.filter(
        (user) => user.userType === this.selectedUserTypeFilter
      );
    }

    this.filteredUsers = filtered;
  }

  /**
   * Manejo de eventos
   */
  onSearch(): void {
    this.applyFilters();
  }

  clearSearch(): void {
    this.searchForm.patchValue({ keyWord: '' });
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  onPatientSelected(user: Patient): void {
    this.selectedPatient = user;
    console.log('Paciente seleccionado:', user);
    this.showPatientHealthRecord = true;
  }

  backToUserList(): void {
    this.showPatientHealthRecord = false;
    this.selectedPatient = null;
  }

  onUserDeleted(deletedUser: AppUser): void {
    this.users = this.users.filter((user) => user.id !== deletedUser.id);
    this.backToUserList();
    this.applyFilters();
  }

  /**
   * Métodos de utilidad
   */
  getInitials(name?: string, lastName?: string): string {
    if (!name || !lastName) return '??';
    return (name.charAt(0) + lastName.charAt(0)).toUpperCase();
  }

  getUserTypeLabel(userType?: string): string {
    const labels: { [key: string]: string } = {
      admin: 'Administrador',
      specialist: 'Especialista',
      patient: 'Paciente',
    };
    return labels[userType || ''] || 'Usuario';
  }

  formatDate(date?: Date): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  getCurrentDateTime(): string {
    return new Date().toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getTotalUsers(): number {
    return this.users.length;
  }

  getTotalUsersByType(userType: string): number {
    return this.users.filter((user) => user.userType === userType).length;
  }

  /**
   * Métodos para clases CSS dinámicas
   */
  getUserHeaderClass(userType?: string): string {
    const baseClass = 'bg-gradient-to-r';
    const typeClasses: { [key: string]: string } = {
      admin: `${baseClass} from-indigo-600 to-purple-600 border-purple-200`,
      specialist: `${baseClass} from-green-600 to-emerald-600 border-green-200`,
      patient: `${baseClass} from-blue-600 to-indigo-600 border-blue-200`,
    };
    return (
      typeClasses[userType || ''] ||
      `${baseClass} from-gray-600 to-slate-600 border-gray-200`
    );
  }

  getUserAvatarClass(userType?: string): string {
    const typeClasses: { [key: string]: string } = {
      admin: 'bg-purple-300 text-purple-800',
      specialist: 'bg-green-300 text-green-800',
      patient: 'bg-blue-300 text-blue-800',
    };
    return typeClasses[userType || ''] || 'bg-gray-300 text-gray-800';
  }

  getUserStatusIndicatorClass(isActive?: boolean): string {
    return isActive ? 'bg-green-500' : 'bg-red-500';
  }

  getUserTypeChipClass(userType?: string): string {
    const typeClasses: { [key: string]: string } = {
      admin: 'bg-white bg-opacity-20 text-white',
      specialist: 'bg-white bg-opacity-20 text-white',
      patient: 'bg-white bg-opacity-20 text-white',
    };
    return typeClasses[userType || ''] || 'bg-white bg-opacity-20 text-white';
  }

  toggleAccountConfirmed(specialist: Specialist): void {
    specialist.accountConfirmed = !specialist.accountConfirmed;

    this.db
      .updateAccountConfirmed(specialist.id, specialist.accountConfirmed)
      .then(() => console.log('Account confirmed status updated successfully'))
      .catch((error: FirebaseError) => {
        console.error('Error updating account confirmed status:', error);
        specialist.accountConfirmed = !specialist.accountConfirmed;
      });
  }

  closeUserDetailsModal(): void {
    this.showPatientHealthRecord = false;
    this.selectedPatient = null;
  }
}
