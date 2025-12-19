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

  /**
   * Exporta la lista de usuarios a PDF
   */
  async exportUsers(): Promise<void> {
    if (this.filteredUsers.length === 0) {
      alert('No hay usuarios para exportar');
      return;
    }

    try {
      // Importación dinámica de pdfMake
      const pdfMakeModule = await import('pdfmake/build/pdfmake');
      const pdfFontsModule = await import('pdfmake/build/vfs_fonts');

      // Obtener la instancia correcta de pdfMake
      let pdfMake: any;
      if ((pdfMakeModule as any).default) {
        pdfMake = (pdfMakeModule as any).default;
      } else if ((pdfMakeModule as any).createPdf) {
        pdfMake = pdfMakeModule;
      } else {
        throw new Error('No se pudo cargar pdfMake correctamente');
      }

      // Configurar fuentes
      try {
        const fonts =
          (pdfFontsModule as any).pdfMake?.vfs ||
          (pdfFontsModule as any).vfs ||
          (pdfFontsModule as any).default ||
          pdfFontsModule;

        if (typeof pdfMake === 'object' && pdfMake !== null) {
          pdfMake.vfs = fonts;
        } else if (typeof (window as any).pdfMake === 'object') {
          (window as any).pdfMake.vfs = fonts;
          pdfMake = (window as any).pdfMake;
        }
      } catch (fontError) {
        console.warn('Error configurando fuentes:', fontError);
      }

      // Preparar datos de la tabla
      const tableBody: any[] = [
        // Encabezados
        [
          { text: 'Nombre', style: 'tableHeader', fillColor: '#2563eb' },
          { text: 'Apellido', style: 'tableHeader', fillColor: '#2563eb' },
          { text: 'Email', style: 'tableHeader', fillColor: '#2563eb' },
          { text: 'DNI', style: 'tableHeader', fillColor: '#2563eb' },
          { text: 'Tipo', style: 'tableHeader', fillColor: '#2563eb' },
          { text: 'Verificado', style: 'tableHeader', fillColor: '#2563eb' },
        ],
      ];

      // Agregar filas de usuarios
      this.filteredUsers.forEach((user) => {
        const isVerified =
          user.userType === 'specialist'
            ? (user as any).accountConfirmed
            : true;

        tableBody.push([
          { text: user.name || '-', style: 'tableCell' },
          { text: user.lastName || '-', style: 'tableCell' },
          { text: user.email || '-', style: 'tableCell' },
          { text: this.formatDNI(user.dni) || '-', style: 'tableCell' },
          { text: this.translateUserType(user.userType), style: 'tableCell' },
          {
            text: isVerified ? 'Sí' : 'No',
            style: 'tableCell',
            color: isVerified ? '#059669' : '#dc2626',
          },
        ]);
      });

      // Definición del documento
      const docDefinition: any = {
        pageSize: 'A4',
        pageOrientation: 'landscape',
        pageMargins: [40, 60, 40, 60],

        header: {
          columns: [
            {
              text: 'CLINICAL CENTER',
              fontSize: 18,
              bold: true,
              margin: [40, 25, 0, 0],
              color: '#2563eb',
            },
            {
              text: [
                { text: 'Fecha de emisión:\n', fontSize: 10, color: '#666' },
                {
                  text: new Date().toLocaleDateString('es-ES'),
                  fontSize: 10,
                  bold: true,
                },
              ],
              alignment: 'right',
              margin: [0, 25, 40, 0],
            },
          ],
        },

        footer: (currentPage: number, pageCount: number) => {
          return {
            text: `Página ${currentPage} de ${pageCount}`,
            alignment: 'center',
            fontSize: 10,
            color: '#666',
          };
        },

        content: [
          {
            text: 'LISTADO DE USUARIOS',
            fontSize: 20,
            bold: true,
            alignment: 'center',
            margin: [0, 0, 0, 10],
            color: '#1e40af',
          },
          {
            text: `Total de usuarios: ${this.filteredUsers.length}`,
            fontSize: 12,
            alignment: 'center',
            margin: [0, 0, 0, 20],
            color: '#666',
          },
          {
            table: {
              headerRows: 1,
              widths: ['auto', 'auto', '*', 'auto', 'auto', 'auto'],
              body: tableBody,
            },
            layout: {
              fillColor: (rowIndex: number) => {
                return rowIndex === 0
                  ? '#2563eb'
                  : rowIndex % 2 === 0
                  ? '#f3f4f6'
                  : null;
              },
              hLineWidth: () => 0.5,
              vLineWidth: () => 0.5,
              hLineColor: () => '#e5e7eb',
              vLineColor: () => '#e5e7eb',
            },
          },
        ],

        styles: {
          tableHeader: {
            fontSize: 11,
            bold: true,
            color: 'white',
            alignment: 'center',
          },
          tableCell: {
            fontSize: 9,
            margin: [5, 5, 5, 5],
          },
        },
      };

      // Crear y descargar el PDF
      const pdf = pdfMake.createPdf(docDefinition);
      pdf.download(`usuarios_${new Date().getTime()}.pdf`);
    } catch (error) {
      console.error('Error al generar el PDF:', error);
      alert('Error al generar el PDF. Por favor, intente nuevamente.');
    }
  }

  /**
   * Formatea el DNI con puntos
   */
  private formatDNI(dni?: string): string {
    if (!dni) return '-';
    const dniStr = dni;

    if (dniStr.length === 7) {
      return `${dniStr.slice(0, 1)}.${dniStr.slice(1, 4)}.${dniStr.slice(4)}`;
    } else if (dniStr.length === 8) {
      return `${dniStr.slice(0, 2)}.${dniStr.slice(2, 5)}.${dniStr.slice(5)}`;
    } else if (dniStr.length > 8) {
      return `${dniStr.slice(0, 2)}.${dniStr.slice(2, 5)}.${dniStr.slice(
        5,
        8
      )}.${dniStr.slice(8)}`;
    }

    return dniStr;
  }

  /**
   * Traduce el tipo de usuario al español
   */
  private translateUserType(userType?: string): string {
    const translations: { [key: string]: string } = {
      admin: 'Administrador',
      specialist: 'Especialista',
      patient: 'Paciente',
    };
    return translations[userType || ''] || userType || '-';
  }
}
