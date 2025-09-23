import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  Timestamp,
} from '@angular/fire/firestore';

export interface SurveyData {
  rating: number;
  recommendationLevel: number;
  serviceQuality: string;
  improvements: string[];
  additionalComments: string;
  createdAt: Timestamp;
  date: string;
  time: string;
  patientId?: string;
  professionalId?: string;
}

@Injectable({
  providedIn: 'root',
})
export class SurveyService {
  constructor(private firestore: Firestore) {}

  async saveSurvey(
    surveyData: Omit<SurveyData, 'createdAt' | 'date' | 'time'>
  ): Promise<string> {
    try {
      const now = new Date();
      const timestamp = Timestamp.fromDate(now);

      // Formatear fecha y hora
      const date = now.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });

      const time = now.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

      const completeSurveyData: SurveyData = {
        ...surveyData,
        createdAt: timestamp,
        date: date,
        time: time,
      };

      const surveysCollection = collection(this.firestore, 'surveys');
      const docRef = await addDoc(surveysCollection, completeSurveyData);

      return docRef.id;
    } catch (error) {
      console.error('Error al guardar la encuesta:', error);
      throw error;
    }
  }
}
