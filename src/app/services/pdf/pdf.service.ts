import { Injectable } from '@angular/core';
import { PatientAppointmentData } from '../../classes/patient-appointment';

@Injectable({
  providedIn: 'root',
})
export class PdfService {
  async generateMedicalRecordPDF(record: PatientAppointmentData) {
    try {
      // Importación dinámica más robusta
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

      // Convertir logo a base64 (puedes ponerlo en assets)
      const logoBase64 = await this.getLogoBase64();

      const docDefinition: any = {
        pageSize: 'A4',
        pageMargins: [50, 60, 50, 60],

        header: {
          columns: [
            {
              image: logoBase64,
              width: 60,
              margin: [50, 20, 0, 0],
            },
            {
              text: [
                { text: 'CLINICAL CENTER\n', fontSize: 16, bold: true },
                { text: 'Historia Clínica', fontSize: 12, color: '#666' },
              ],
              margin: [50, 25, 0, 0],
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
              margin: [0, 25, 50, 0],
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
          // Título principal
          {
            text: 'REGISTRO MÉDICO',
            fontSize: 20,
            bold: true,
            alignment: 'center',
            margin: [0, 20, 0, 30],
            color: '#2563eb',
          },

          // Información del paciente
          {
            text: 'INFORMACIÓN DEL PACIENTE',
            fontSize: 14,
            bold: true,
            margin: [0, 0, 0, 10],
            color: '#374151',
          },
          {
            table: {
              widths: ['30%', '70%'],
              body: [
                ['Paciente:', { text: record.patientName, bold: true }],
                [
                  'Fecha de atención:',
                  {
                    text:
                      record.appointmentDate
                        ?.toDate()
                        .toLocaleDateString('es-ES') || 'N/A',
                    bold: true,
                  },
                ],
                [
                  'Especialidad:',
                  { text: record.speciality || 'N/A', bold: true },
                ],
                [
                  'Especialista:',
                  { text: record.specialistName || 'N/A', bold: true },
                ],
              ],
            },
            layout: {
              fillColor: (rowIndex: number) =>
                rowIndex % 2 === 0 ? '#f8fafc' : null,
              hLineWidth: () => 0.5,
              vLineWidth: () => 0.5,
              hLineColor: () => '#e2e8f0',
              vLineColor: () => '#e2e8f0',
            },
            margin: [0, 0, 0, 20],
          },

          // Datos médicos (si existen)
          ...(record.healthRecord
            ? [
                {
                  text: 'DATOS MÉDICOS',
                  fontSize: 14,
                  bold: true,
                  margin: [0, 20, 0, 10],
                  color: '#374151',
                },
                {
                  table: {
                    widths: ['40%', '60%'],
                    body: [
                      [
                        'Presión Arterial:',
                        `${record.healthRecord.bloodPressure || 'N/A'} mmHg`,
                      ],
                      ['Altura:', `${record.healthRecord.height || 'N/A'} m`],
                      ['Peso:', record.healthRecord.weight || 'N/A'],
                      [
                        'Temperatura:',
                        `${record.healthRecord.temperature || 'N/A'}°C`,
                      ],
                      [
                        'Glucosa:',
                        `${record.healthRecord.glucoseLevel || 'N/A'} mg/dL`,
                      ],
                      [
                        'El paciente fuma?:',
                        record.healthRecord.smoker === true
                          ? 'Sí'
                          : record.healthRecord.smoker === false
                          ? 'No'
                          : 'N/A',
                      ],
                      [
                        'Nivel de dolor:',
                        `${record.healthRecord.painLevel || 'N/A'} / 100`,
                      ],
                    ],
                  },
                  layout: {
                    fillColor: (rowIndex: number) =>
                      rowIndex % 2 === 0 ? '#f0f9ff' : null,
                    hLineWidth: () => 0.5,
                    vLineWidth: () => 0.5,
                    hLineColor: () => '#e2e8f0',
                    vLineColor: () => '#e2e8f0',
                  },
                  margin: [0, 0, 0, 20],
                },
              ]
            : []),

          // Datos dinámicos (si existen)
          ...(record.healthRecord?.dynamicData &&
          Object.keys(record.healthRecord.dynamicData).length > 0
            ? [
                {
                  text: 'INFORMACIÓN ADICIONAL',
                  fontSize: 14,
                  bold: true,
                  margin: [0, 20, 0, 10],
                  color: '#374151',
                },
                {
                  table: {
                    widths: ['40%', '60%'],
                    body: Object.entries(record.healthRecord.dynamicData).map(
                      ([key, value]) => [key + ':', String(value || 'N/A')]
                    ),
                  },
                  layout: {
                    fillColor: (rowIndex: number) =>
                      rowIndex % 2 === 0 ? '#fefce8' : null,
                    hLineWidth: () => 0.5,
                    vLineWidth: () => 0.5,
                    hLineColor: () => '#e2e8f0',
                    vLineColor: () => '#e2e8f0',
                  },
                  margin: [0, 0, 0, 20],
                },
              ]
            : []),

          // Reseña médica (si existe)
          ...(record.review?.review
            ? [
                {
                  text: 'RESEÑA MÉDICA',
                  fontSize: 14,
                  bold: true,
                  margin: [0, 20, 0, 10],
                  color: '#374151',
                },
                {
                  text: record.review.review,
                  fontSize: 12,
                  lineHeight: 1.5,
                  margin: [15, 10, 15, 20],
                  italics: true,
                  alignment: 'justify',
                },
              ]
            : []),

          // Firma/Sello
          {
            columns: [
              { width: '50%', text: '' },
              {
                width: '50%',
                stack: [
                  {
                    text: '_'.repeat(40),
                    alignment: 'center',
                    margin: [0, 40, 0, 5],
                  },
                  {
                    text: 'Firma del Especialista',
                    alignment: 'center',
                    fontSize: 10,
                    color: '#666',
                  },
                  {
                    text: record.specialistName || 'N/A',
                    alignment: 'center',
                    fontSize: 12,
                    bold: true,
                    margin: [0, 5, 0, 0],
                  },
                ],
              },
            ],
            margin: [0, 30, 0, 0],
          },
        ],

        styles: {
          tableHeader: {
            bold: true,
            fontSize: 12,
            color: 'white',
            fillColor: '#2563eb',
          },
        },
      };

      // Generar y descargar PDF
      if (!pdfMake || typeof pdfMake.createPdf !== 'function') {
        throw new Error('pdfMake no está correctamente inicializado');
      }

      const pdf = pdfMake.createPdf(docDefinition);
      const fileName = `historia-clinica-${record.patientName.replace(
        /\s+/g,
        '-'
      )}-${
        record.appointmentDate?.toDate().toString().split('T')[0] || 'sin-fecha'
      }.pdf`;

      pdf.download(fileName);
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Error generando el PDF. Por favor, intenta de nuevo.');
    }
  }

  private async getLogoBase64(): Promise<string> {
    // Cargar logo desde assets y convertir a base64
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject('No se pudo obtener el contexto del canvas');
            return;
          }
          canvas.height = img.naturalHeight;
          canvas.width = img.naturalWidth;
          ctx.drawImage(img, 0, 0);
          const dataURL = canvas.toDataURL();
          resolve(dataURL);
        } catch (error) {
          reject(error);
        }
      };
      img.onerror = () => {
        // Si no se puede cargar el logo, usar un placeholder
        resolve(
          'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMzAiIGZpbGw9IiMyNTYzRUIiLz4KPHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4PSIxOCIgeT0iMTgiPgo8cGF0aCBkPSJNMTIgMTJINEwxMiA0VjEyWiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+Cjwvc3ZnPg=='
        );
      };
      img.src = 'logo.png';
    });
  }
}
