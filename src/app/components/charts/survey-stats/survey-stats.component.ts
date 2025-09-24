import { CommonModule } from '@angular/common';
import { LogsService } from '../../../services/logs/logs.service';
import { Component } from '@angular/core';
import { NgxEchartsModule } from 'ngx-echarts';
import { EChartsOption } from 'echarts/types/dist/echarts';

@Component({
  selector: 'app-survey-stats',
  standalone: true,
  imports: [CommonModule, NgxEchartsModule],
  templateUrl: './survey-stats.component.html',
  styleUrl: './survey-stats.component.css',
})
export class SurveyStatsComponent {
  loading = false;
  error: string | null = null;

  // Datos
  surveys: any[] = [];
  serviceQualityStats: any[] = [];
  improvementsStats: any[] = [];
  averageRating = 0;

  // Charts
  serviceQualityChartOption!: EChartsOption;
  improvementsChartOption!: EChartsOption;

  constructor(private surveyService: LogsService) {}

  ngOnInit(): void {
    this.refresh();
  }

  refresh() {
    this.loading = true;
    this.error = null;

    this.surveyService.getSurveys().subscribe({
      next: (data) => {
        this.surveys = data;

        // Service Quality
        this.surveyService.getServiceQualityStats().subscribe((stats) => {
          this.serviceQualityStats = stats;
          this.serviceQualityChartOption = {
            title: { text: 'Calidad del Servicio', left: 'center' },
            tooltip: { trigger: 'item' },
            series: [
              {
                type: 'pie',
                radius: '50%',
                data: stats.map((s) => ({
                  name: s.quality,
                  value: s.count,
                })),
              },
            ],
          };
        });

        // Improvements
        this.surveyService.getImprovementsStats().subscribe((stats) => {
          this.improvementsStats = stats;
          this.improvementsChartOption = {
            title: { text: 'Mejoras Solicitadas', left: 'center' },
            tooltip: { trigger: 'axis' },
            xAxis: { type: 'category', data: stats.map((s) => s.improvement) },
            yAxis: { type: 'value' },
            series: [
              {
                type: 'bar',
                data: stats.map((s) => s.count),
              },
            ],
          };
        });

        // Average Rating
        this.surveyService.getAverageRating().subscribe((avg) => {
          this.averageRating = avg;
        });

        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error cargando encuestas';
        this.loading = false;
        console.error(err);
      },
    });
  }
}
