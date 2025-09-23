import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Injectable({
  providedIn: 'root',
})
export class PdfLogsService {
  constructor() {
    console.log('📄 PdfExportService inicializado');
  }

  /**
   * Exporta un elemento HTML completo a PDF
   */
  async exportElementToPdf(
    elementId: string,
    filename: string,
    title: string,
    subtitle?: string
  ): Promise<void> {
    try {
      console.log(`📄 Iniciando exportación PDF de elemento: ${elementId}`);

      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error(`Elemento con ID '${elementId}' no encontrado`);
      }

      // Configurar opciones para html2canvas
      const canvas = await html2canvas(element, {
        scale: 1.5, // Mayor calidad
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: element.scrollWidth,
        height: element.scrollHeight,
      });

      // Crear PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');

      // Dimensiones de la página A4
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Calcular dimensiones manteniendo proporción
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const ratio = canvasHeight / canvasWidth;

      let imgWidth = pdfWidth - 20; // Margen de 10mm a cada lado
      let imgHeight = imgWidth * ratio;

      // Si la imagen es muy alta, ajustar
      if (imgHeight > pdfHeight - 40) {
        imgHeight = pdfHeight - 40;
        imgWidth = imgHeight / ratio;
      }

      // Agregar título
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text(title, pdfWidth / 2, 15, { align: 'center' });

      if (subtitle) {
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(subtitle, pdfWidth / 2, 22, { align: 'center' });
      }

      // Agregar imagen
      const startY = subtitle ? 30 : 25;
      const startX = (pdfWidth - imgWidth) / 2;

      pdf.addImage(imgData, 'PNG', startX, startY, imgWidth, imgHeight);

      // Agregar fecha de generación
      const now = new Date();
      const dateStr = now.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'italic');
      pdf.text(`Generado el ${dateStr}`, 10, pdfHeight - 10);

      // Descargar PDF
      pdf.save(`${filename}-${now.toISOString().split('T')[0]}.pdf`);

      console.log('✅ PDF exportado exitosamente');
    } catch (error) {
      console.error('❌ Error exportando PDF:', error);
      throw error;
    }
  }

  /**
   * Exporta múltiples elementos a un PDF de varias páginas
   */
  async exportMultipleElementsToPdf(
    elements: { id: string; title: string }[],
    filename: string,
    mainTitle: string,
    subtitle?: string
  ): Promise<void> {
    try {
      console.log(
        `📄 Iniciando exportación PDF multipágina: ${elements.length} elementos`
      );

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Página de título
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text(mainTitle, pdfWidth / 2, 40, { align: 'center' });

      if (subtitle) {
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'normal');
        pdf.text(subtitle, pdfWidth / 2, 55, { align: 'center' });
      }

      // Fecha de generación en portada
      const now = new Date();
      const dateStr = now.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      pdf.setFontSize(12);
      pdf.text(`Generado el ${dateStr}`, pdfWidth / 2, 70, { align: 'center' });

      // Procesar cada elemento
      for (let i = 0; i < elements.length; i++) {
        const elementInfo = elements[i];
        const element = document.getElementById(elementInfo.id);

        if (!element) {
          console.warn(
            `⚠️ Elemento '${elementInfo.id}' no encontrado, omitiendo...`
          );
          continue;
        }

        console.log(
          `📄 Procesando elemento ${i + 1}/${elements.length}: ${
            elementInfo.id
          }`
        );

        // Nueva página
        pdf.addPage();

        // Título de la sección
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text(elementInfo.title, pdfWidth / 2, 15, { align: 'center' });

        // Capturar elemento
        const canvas = await html2canvas(element, {
          scale: 1.2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          width: element.scrollWidth,
          height: element.scrollHeight,
        });

        const imgData = canvas.toDataURL('image/png');

        // Calcular dimensiones
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const ratio = canvasHeight / canvasWidth;

        let imgWidth = pdfWidth - 20;
        let imgHeight = imgWidth * ratio;

        // Ajustar si es muy alto
        if (imgHeight > pdfHeight - 40) {
          imgHeight = pdfHeight - 40;
          imgWidth = imgHeight / ratio;
        }

        const startX = (pdfWidth - imgWidth) / 2;
        pdf.addImage(imgData, 'PNG', startX, 25, imgWidth, imgHeight);

        // Número de página
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Página ${i + 2}`, pdfWidth - 20, pdfHeight - 10);
      }

      // Descargar PDF
      pdf.save(`${filename}-${now.toISOString().split('T')[0]}.pdf`);

      console.log('✅ PDF multipágina exportado exitosamente');
    } catch (error) {
      console.error('❌ Error exportando PDF multipágina:', error);
      throw error;
    }
  }

  /**
   * Exporta solo los gráficos de un componente
   */
  async exportChartsOnlyToPdf(
    chartIds: string[],
    filename: string,
    title: string,
    subtitle?: string
  ): Promise<void> {
    try {
      console.log(
        `📊 Exportando solo gráficos a PDF: ${chartIds.length} gráficos`
      );

      const pdf = new jsPDF('l', 'mm', 'a4'); // Landscape para gráficos
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Título
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text(title, pdfWidth / 2, 15, { align: 'center' });

      if (subtitle) {
        pdf.setFontSize(10);
        pdf.text(subtitle, pdfWidth / 2, 22, { align: 'center' });
      }

      let currentY = subtitle ? 35 : 30;
      const chartHeight = 80; // Altura fija para cada gráfico
      const marginBetween = 10;

      for (let i = 0; i < chartIds.length; i++) {
        const chartElement = document.querySelector(
          `#${chartIds[i]} canvas`
        ) as HTMLCanvasElement;

        if (!chartElement) {
          console.warn(`⚠️ Gráfico '${chartIds[i]}' no encontrado`);
          continue;
        }

        // Si no cabe en la página actual, crear nueva página
        if (currentY + chartHeight > pdfHeight - 20) {
          pdf.addPage();
          currentY = 20;
        }

        // Capturar canvas del gráfico
        const imgData = chartElement.toDataURL('image/png');

        // Calcular dimensiones manteniendo proporción
        const canvasRatio = chartElement.height / chartElement.width;
        const chartWidth = Math.min(pdfWidth - 40, 200);
        const calculatedHeight = Math.min(
          chartWidth * canvasRatio,
          chartHeight
        );

        const startX = (pdfWidth - chartWidth) / 2;

        pdf.addImage(
          imgData,
          'PNG',
          startX,
          currentY,
          chartWidth,
          calculatedHeight
        );

        currentY += calculatedHeight + marginBetween;
      }

      // Fecha de generación
      const now = new Date();
      const dateStr = now.toLocaleDateString('es-ES');
      pdf.setFontSize(8);
      pdf.text(`Generado el ${dateStr}`, 10, pdfHeight - 10);

      pdf.save(`${filename}-graficos-${now.toISOString().split('T')[0]}.pdf`);

      console.log('✅ PDF de gráficos exportado exitosamente');
    } catch (error) {
      console.error('❌ Error exportando gráficos PDF:', error);
      throw error;
    }
  }

  /**
   * Genera un PDF con tabla personalizada
   */
  generateTablePdf<T>(
    data: T[],
    columns: { key: keyof T; title: string; width?: number }[],
    filename: string,
    title: string,
    subtitle?: string
  ): void {
    try {
      console.log(`📋 Generando PDF de tabla con ${data.length} filas`);

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Título
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text(title, pdfWidth / 2, 15, { align: 'center' });

      if (subtitle) {
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(subtitle, pdfWidth / 2, 22, { align: 'center' });
      }

      // Configurar tabla
      const startY = subtitle ? 35 : 30;
      const tableWidth = pdfWidth - 20;
      const defaultColWidth = tableWidth / columns.length;

      // Headers
      let currentX = 10;
      let currentY = startY;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');

      columns.forEach((col) => {
        const colWidth = col.width || defaultColWidth;
        pdf.rect(currentX, currentY, colWidth, 8);
        pdf.text(col.title, currentX + 2, currentY + 5);
        currentX += colWidth;
      });

      currentY += 8;

      // Datos
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);

      data.forEach((row, index) => {
        // Nueva página si no cabe
        if (currentY > pdfHeight - 20) {
          pdf.addPage();
          currentY = 20;
        }

        currentX = 10;

        columns.forEach((col) => {
          const colWidth = col.width || defaultColWidth;
          const value = String(row[col.key] || '');

          pdf.rect(currentX, currentY, colWidth, 6);

          // Truncar texto si es muy largo
          const truncatedValue =
            value.length > 25 ? value.substring(0, 22) + '...' : value;
          pdf.text(truncatedValue, currentX + 1, currentY + 4);

          currentX += colWidth;
        });

        currentY += 6;
      });

      // Fecha de generación
      const now = new Date();
      const dateStr = now.toLocaleDateString('es-ES');
      pdf.setFontSize(8);
      pdf.text(
        `Generado el ${dateStr} - Total: ${data.length} registros`,
        10,
        pdfHeight - 10
      );

      pdf.save(`${filename}-tabla-${now.toISOString().split('T')[0]}.pdf`);

      console.log('✅ PDF de tabla generado exitosamente');
    } catch (error) {
      console.error('❌ Error generando PDF de tabla:', error);
      throw error;
    }
  }
}
