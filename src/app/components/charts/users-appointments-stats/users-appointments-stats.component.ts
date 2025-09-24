import { CommonModule } from '@angular/common';
import {
  LogsService,
  Patient,
  AppointmentStat,
} from '../../../services/logs/logs.service';
import { Component } from '@angular/core';
import { NgxEchartsModule } from 'ngx-echarts';
import { EChartsOption } from 'echarts/types/dist/echarts';

@Component({
  selector: 'app-users-appointments-stats',
  standalone: true,
  imports: [CommonModule, NgxEchartsModule],
  templateUrl: './users-appointments-stats.component.html',
  styleUrl: './users-appointments-stats.component.css',
})
export class UsersAppointmentsStatsComponent {
  patients: Patient[] = [];
  selectedPatient: Patient | null = null;
  appointmentStats: AppointmentStat[] = [];

  chartOption: any;
  loading = false;
  error: string | null = null;

  constructor(private statisticsService: LogsService) {}

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients() {
    this.loading = true;
    this.error = null;
    this.statisticsService.getPatients().subscribe({
      next: (data) => {
        this.patients = data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Error al cargar pacientes';
        this.loading = false;
      },
    });
  }

  selectPatient(patient: Patient) {
    this.selectedPatient = patient;
    this.loadAppointments(patient.id);
  }

  loadAppointments(patientId: string) {
    this.loading = true;
    this.error = null;
    this.statisticsService.getAppointmentsByPatient(patientId).subscribe({
      next: (stats) => {
        this.appointmentStats = stats;
        this.updateChart();
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Error al cargar turnos';
        this.loading = false;
      },
    });
  }

  updateChart() {
    this.chartOption = {
      tooltip: { trigger: 'item' },
      legend: { top: '5%', left: 'center' },
      series: [
        {
          name: 'Turnos',
          type: 'pie',
          radius: '60%',
          data: this.appointmentStats.map((s) => ({
            value: s.count,
            name: s.status,
          })),
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
        },
      ],
    };
  }

  refresh() {
    if (this.selectedPatient) {
      this.loadAppointments(this.selectedPatient.id);
    } else {
      this.loadPatients();
    }
  }
}
