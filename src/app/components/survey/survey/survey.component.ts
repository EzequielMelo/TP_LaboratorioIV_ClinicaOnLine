import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  SurveyData,
  SurveyService,
} from '../../../services/survey/survey.service';

@Component({
  selector: 'app-survey',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './survey.component.html',
  styleUrl: './survey.component.css',
})
export class SurveyComponent {
  @Input() isVisible: boolean = false;
  @Input() patientId?: string | null;
  @Input() professionalId?: string | null;
  @Output() modalClosed = new EventEmitter<void>();
  @Output() surveySubmitted = new EventEmitter<string>();

  surveyForm!: FormGroup;
  rating: number = 0;
  selectedImprovements: string[] = [];
  isSubmitting: boolean = false;
  errorMessage: string = '';

  constructor(private fb: FormBuilder, private surveyService: SurveyService) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    this.surveyForm = this.fb.group({
      recommendationLevel: [
        5,
        [Validators.required, Validators.min(0), Validators.max(10)],
      ],
      serviceQuality: ['', Validators.required],
      additionalComments: [''],
    });
  }

  setRating(rating: number): void {
    this.rating = rating;
  }

  onImprovementChange(improvement: string, event: any): void {
    if (event.target.checked) {
      if (!this.selectedImprovements.includes(improvement)) {
        this.selectedImprovements.push(improvement);
      }
    } else {
      this.selectedImprovements = this.selectedImprovements.filter(
        (item) => item !== improvement
      );
    }
  }

  isFormValid(): boolean {
    return this.surveyForm.valid && this.rating > 0;
  }

  async onSubmit(): Promise<void> {
    if (!this.isFormValid()) {
      this.errorMessage = 'Por favor completa todos los campos obligatorios.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    try {
      const surveyData: Omit<SurveyData, 'createdAt' | 'date' | 'time'> = {
        rating: this.rating,
        recommendationLevel: this.surveyForm.get('recommendationLevel')?.value,
        serviceQuality: this.surveyForm.get('serviceQuality')?.value,
        improvements: this.selectedImprovements,
        additionalComments:
          this.surveyForm.get('additionalComments')?.value || '',
        patientId: this.patientId ?? undefined,
        professionalId: this.professionalId ?? undefined,
      };

      const surveyId = await this.surveyService.saveSurvey(surveyData);

      // Emitir evento de éxito
      this.surveySubmitted.emit(surveyId);

      // Resetear formulario y cerrar modal
      this.resetForm();
      this.closeModal();

      // Opcional: Mostrar mensaje de éxito
      console.log('Encuesta guardada exitosamente con ID:', surveyId);
    } catch (error) {
      console.error('Error al guardar la encuesta:', error);
      this.errorMessage =
        'Error al enviar la encuesta. Por favor intenta nuevamente.';
    } finally {
      this.isSubmitting = false;
    }
  }

  closeModal(): void {
    this.modalClosed.emit();
    this.resetForm();
  }

  private resetForm(): void {
    this.rating = 0;
    this.selectedImprovements = [];
    this.surveyForm.reset({
      recommendationLevel: 5,
      serviceQuality: '',
      additionalComments: '',
    });
    this.errorMessage = '';
    this.isSubmitting = false;
  }
}
