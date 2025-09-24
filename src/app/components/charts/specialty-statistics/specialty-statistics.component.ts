import { Component } from '@angular/core';
import {
  LogsService,
  SpecialtyCount,
} from '../../../services/logs/logs.service';
import { CommonModule } from '@angular/common';
import { NgxEchartsModule } from 'ngx-echarts';

@Component({
  selector: 'app-specialty-statistics',
  standalone: true,
  imports: [CommonModule, NgxEchartsModule],
  templateUrl: './specialty-statistics.component.html',
  styleUrl: './specialty-statistics.component.css',
})
export class SpecialtyStatisticsComponent {
  loading = false;
  error: string | null = null;

  patientsBySpecialty: SpecialtyCount[] = [];
  specialistsBySpecialty: SpecialtyCount[] = [];

  patientsChartOptions: any;
  specialistsChartOptions: any;

  constructor(private statsService: LogsService) {}

  ngOnInit(): void {
    this.refresh();
  }

  refresh() {
    this.loading = true;
    this.error = null;

    this.statsService.getPatientsBySpecialty().subscribe({
      next: (data) => {
        this.patientsBySpecialty = data;
        this.updatePatientsChart();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar pacientes';
        this.loading = false;
      },
    });

    this.statsService.getSpecialistsBySpecialty().subscribe({
      next: (data) => {
        this.specialistsBySpecialty = data;
        this.updateSpecialistsChart();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar especialistas';
        this.loading = false;
      },
    });
  }

  updatePatientsChart() {
    this.patientsChartOptions = {
      title: { text: 'Pacientes por Especialidad', left: 'center' },
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: this.patientsBySpecialty.map((item) => item.specialty),
        axisLabel: { rotate: 30, interval: 0 },
      },
      yAxis: { type: 'value' },
      series: [
        {
          name: 'Pacientes',
          type: 'bar',
          data: this.patientsBySpecialty.map((item) => item.count),
          itemStyle: { color: '#4f46e5' },
        },
      ],
    };
  }

  updateSpecialistsChart() {
    this.specialistsChartOptions = {
      title: { text: 'Médicos por Especialidad', left: 'center' },
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: this.specialistsBySpecialty.map((item) => item.specialty),
        axisLabel: { rotate: 30, interval: 0 },
      },
      yAxis: { type: 'value' },
      series: [
        {
          name: 'Médicos',
          type: 'bar',
          data: this.specialistsBySpecialty.map((item) => item.count),
          itemStyle: { color: '#10b981' },
        },
      ],
    };
  }
}
