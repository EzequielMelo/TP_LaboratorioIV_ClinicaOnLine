import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { DatabaseService } from '../../services/database/database.service';
import { AppointmentsService } from '../../services/appointments/appointments.service';
import { Subscription } from 'rxjs';
import { UserTypes } from '../../models/user-types';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  Timestamp,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  Firestore,
} from '@angular/fire/firestore';
import { Appointment } from '../../classes/appointment';

interface LoginLog {
  lastName: string;
  name: string;
  time: Timestamp;
  userId: string;
  userType: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css',
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  user: UserTypes | null = null;
  auth: boolean = false;
  currentSection: 'users' | 'addAdmin' | 'appointments' | 'settings' | null =
    null;

  // Estadísticas
  totalUsers: number = 0;
  todayAppointments: number = 0;
  totalAdmins: number = 0;
  completedAppointments: number = 0;
  activeSpecialists: number = 0;

  // Actividad reciente
  lastLogin: LoginLog | null = null;
  lastLoginTimeAgo: string = '';
  lastAppointment: Appointment | null = null;
  lastAppointmentTimeAgo: string = '';
  totalSiteVisits: number = 0;
  pendingAppointmentsToday: number = 0;

  protected authService = inject(AuthService);
  private databaseService = inject(DatabaseService);
  private appointmentsService = inject(AppointmentsService);
  private firestore = inject(Firestore);
  private userSubscription: Subscription;
  private usersSubscription?: Subscription;
  private appointmentsSubscription?: Subscription;

  constructor() {
    this.authService.authUser$.subscribe((response) => {
      if (response) {
        this.auth = true;
      } else {
        this.auth = false;
      }
      this.loadRecentActivity();
    });
    this.userSubscription = this.authService.user$.subscribe((user) => {
      this.user = user;
    });
  }

  ngOnInit(): void {
    this.loadStatistics();
  }

  loadStatistics(): void {
    // Obtener todos los usuarios
    this.usersSubscription = this.databaseService
      .getAllUsers()
      .subscribe((users) => {
        this.totalUsers = users.length;
        // Contar administradores
        this.totalAdmins = users.filter(
          (user) => user.userType === 'admin'
        ).length;
        // Contar especialistas activos (con cuenta confirmada)
        this.activeSpecialists = users.filter(
          (user) =>
            user.userType === 'specialist' && user.accountConfirmed === true
        ).length;
      });

    // Obtener turnos de hoy y citas finalizadas
    this.appointmentsSubscription = this.appointmentsService
      .getAllAppointments()
      .subscribe((appointments) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        this.todayAppointments = appointments.filter((appointment) => {
          if (appointment.appointmentDate) {
            const appointmentDate = appointment.appointmentDate.toDate();
            return appointmentDate >= today && appointmentDate < tomorrow;
          }
          return false;
        }).length;

        // Contar citas completadas
        this.completedAppointments = appointments.filter(
          (appointment) => appointment.appointmentStatus === 'Completado'
        ).length;

        // Contar turnos pendientes de hoy
        this.pendingAppointmentsToday = appointments.filter((appointment) => {
          if (
            appointment.appointmentDate &&
            appointment.appointmentStatus === 'Pendiente'
          ) {
            const appointmentDate = appointment.appointmentDate.toDate();
            return appointmentDate >= today && appointmentDate < tomorrow;
          }
          return false;
        }).length;
      });
  }
  async loadRecentActivity(): Promise<void> {
    try {
      // Obtener último login
      const loginLogsRef = collection(this.firestore, 'loginLogs');
      const loginQuery = query(loginLogsRef, orderBy('time', 'desc'), limit(1));
      const loginSnapshot = await getDocs(loginQuery);

      if (!loginSnapshot.empty) {
        const loginData = loginSnapshot.docs[0].data() as LoginLog;
        this.lastLogin = loginData;
        this.lastLoginTimeAgo = this.getTimeAgo(loginData.time.toDate());
      }

      // Obtener último turno solicitado
      this.appointmentsSubscription = this.appointmentsService
        .getAllAppointments()
        .subscribe((appointments) => {
          if (appointments.length > 0) {
            // Ordenar por requestedDate
            const sortedAppointments = [...appointments].sort((a, b) => {
              if (a.requestedDate && b.requestedDate) {
                return b.requestedDate.toMillis() - a.requestedDate.toMillis();
              }
              return 0;
            });

            this.lastAppointment = sortedAppointments[0];
            if (this.lastAppointment.requestedDate) {
              this.lastAppointmentTimeAgo = this.getTimeAgo(
                this.lastAppointment.requestedDate.toDate()
              );
            }
          }
        });

      // Obtener total de visitas al sitio
      const visitsRef = collection(this.firestore, 'site_visits');
      const visitsSnapshot = await getDocs(visitsRef);
      this.totalSiteVisits = visitsSnapshot.size;
    } catch (error) {
      console.error('Error loading recent activity:', error);
    }
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Hace un momento';
    if (diffMins < 60)
      return `Hace ${diffMins} minuto${diffMins !== 1 ? 's' : ''}`;
    if (diffHours < 24)
      return `Hace ${diffHours} hora${diffHours !== 1 ? 's' : ''}`;
    return `Hace ${diffDays} día${diffDays !== 1 ? 's' : ''}`;
  }

  getUserTypeLabel(userType: string): string {
    const labels: { [key: string]: string } = {
      admin: 'Administrador',
      specialist: 'Especialista',
      patient: 'Paciente',
    };
    return labels[userType] || userType;
  }

  sectionSelector(section: 'users' | 'addAdmin' | 'appointments' | 'settings') {
    this.currentSection = section;
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    if (this.usersSubscription) {
      this.usersSubscription.unsubscribe();
    }
    if (this.appointmentsSubscription) {
      this.appointmentsSubscription.unsubscribe();
    }
  }
}
