/**
 * PDF Generation Service
 * Service for generating PDF reports from session data
 */

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface DimensionData {
  name: string;
  score: number;
  subdimensions?: Array<{
    name: string;
    score: number;
  }>;
}

export interface SessionPDFData {
  sessionId: string;
  userName?: string;
  userEmail?: string;
  companyName?: string;
  sessionType: 'roleplay' | 'interview' | 'tech_week';
  profileName?: string;
  scenarioName?: string;
  score: number | null;
  passed?: boolean | null;
  duration: number;
  startedAt?: string;
  wordCount?: number;
  dimensions?: DimensionData[];
}

export class PDFService {
  /**
   * Generate PDF from session results page
   */
  static async generateSessionPDF(
    data: SessionPDFData,
    options?: {
      includeCharts?: boolean;
      chartElementIds?: string[];
    }
  ): Promise<void> {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10; // Reduced margin for more space
    let yPosition = margin;

    // Helper function to check if we need a new page
    const checkNewPage = (requiredSpace: number) => {
      if (yPosition + requiredSpace > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
        return true;
      }
      return false;
    };

    // Add header (more compact)
    pdf.setFillColor(59, 130, 246); // Primary blue
    pdf.rect(0, 0, pageWidth, 30, 'F');

    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Reporte de Sesión', margin, 15);

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const sessionTypeText = data.sessionType === 'interview'
      ? 'Entrevista'
      : data.sessionType === 'tech_week'
      ? 'Tech Week'
      : 'Roleplay';
    pdf.text(sessionTypeText, margin, 23);

    yPosition = 35;

    // User Information Section (compact, two columns)
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Información del Usuario', margin, yPosition);
    yPosition += 6;

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');

    const leftColumn = margin;
    const rightColumn = pageWidth / 2 + 5;
    const startY = yPosition;

    // Left column
    if (data.userName) {
      pdf.text(`Usuario: ${data.userName}`, leftColumn, yPosition);
      yPosition += 4;
    }

    if (data.userEmail) {
      pdf.text(`Email: ${data.userEmail}`, leftColumn, yPosition);
      yPosition += 4;
    }

    if (data.companyName) {
      pdf.text(`Empresa: ${data.companyName}`, leftColumn, yPosition);
      yPosition += 4;
    }

    // Right column
    let rightY = startY;

    if (data.profileName) {
      pdf.text(`Perfil: ${data.profileName}`, rightColumn, rightY);
      rightY += 4;
    }

    if (data.scenarioName) {
      pdf.text(`Escenario: ${data.scenarioName}`, rightColumn, rightY);
      rightY += 4;
    }

    const minutes = Math.floor(data.duration / 60);
    const seconds = data.duration % 60;
    pdf.text(`Duración: ${minutes}:${seconds.toString().padStart(2, '0')}`, rightColumn, rightY);
    rightY += 4;

    if (data.wordCount !== undefined) {
      pdf.text(`Palabras: ${data.wordCount}`, rightColumn, rightY);
      rightY += 4;
    }

    // Update yPosition to the max of both columns
    yPosition = Math.max(yPosition, rightY) + 2;

    if (data.startedAt) {
      const date = new Date(data.startedAt).toLocaleString('es-MX', {
        dateStyle: 'short',
        timeStyle: 'short'
      });
      pdf.text(`Fecha: ${date}`, leftColumn, yPosition);
      yPosition += 5;
    }

    // Score Section (compact)
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Resultados', margin, yPosition);
    yPosition += 6;

    // Score box (smaller)
    const scoreBoxWidth = 40;
    const scoreBoxHeight = 20;

    if (data.score !== null) {
      // Score background color based on value
      if (data.score >= 80) {
        pdf.setFillColor(34, 197, 94); // Green
      } else if (data.score >= 60) {
        pdf.setFillColor(59, 130, 246); // Blue
      } else if (data.score >= 40) {
        pdf.setFillColor(234, 179, 8); // Yellow
      } else {
        pdf.setFillColor(239, 68, 68); // Red
      }

      pdf.roundedRect(margin, yPosition, scoreBoxWidth, scoreBoxHeight, 3, 3, 'F');

      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text(data.score.toFixed(1), margin + scoreBoxWidth / 2, yPosition + scoreBoxHeight / 2 + 2, { align: 'center' });

      pdf.setFontSize(8);
      pdf.text('SCORE', margin + scoreBoxWidth / 2, yPosition + scoreBoxHeight / 2 + 7, { align: 'center' });
    }

    // Passed/Failed indicator
    if (data.passed !== undefined && data.passed !== null) {
      const passedBoxX = margin + scoreBoxWidth + 5;
      const passedColor = data.passed ? [34, 197, 94] : [239, 68, 68];
      pdf.setFillColor(passedColor[0], passedColor[1], passedColor[2]);
      pdf.roundedRect(passedBoxX, yPosition, scoreBoxWidth + 10, scoreBoxHeight, 3, 3, 'F');

      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      const passedText = data.passed ? 'APROBADO' : 'NO APROBADO';
      pdf.text(passedText, passedBoxX + (scoreBoxWidth + 10) / 2, yPosition + scoreBoxHeight / 2 + 1, { align: 'center' });
    }

    yPosition += scoreBoxHeight + 8;

    // Add dimension values in text
    if (data.dimensions && data.dimensions.length > 0) {
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Valores de Dimensiones', margin, yPosition);
      yPosition += 6;

      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');

      const columnWidth = (pageWidth - 2 * margin) / 2;
      const leftX = margin;
      const rightX = margin + columnWidth;

      let leftY = yPosition;
      let rightY = yPosition;
      let useRightColumn = false;

      data.dimensions.forEach((dimension, index) => {
        const currentX = useRightColumn ? rightX : leftX;
        let currentY = useRightColumn ? rightY : leftY;

        // Dimension name and score
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(59, 130, 246); // Blue color
        pdf.text(`${dimension.name}: ${dimension.score.toFixed(0)}`, currentX, currentY);
        currentY += 3.5;

        // Subdimensions
        if (dimension.subdimensions && dimension.subdimensions.length > 0) {
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(80, 80, 80); // Dark gray
          dimension.subdimensions.forEach((sub) => {
            const subText = `  • ${sub.name}: ${sub.score.toFixed(0)}`;
            pdf.text(subText, currentX, currentY);
            currentY += 3;
          });
        }

        currentY += 2; // Space between dimensions

        if (useRightColumn) {
          rightY = currentY;
        } else {
          leftY = currentY;
        }

        useRightColumn = !useRightColumn;
      });

      yPosition = Math.max(leftY, rightY) + 3;
    }

    // Capture and add charts if requested (2 charts side by side with dark background)
    if (options?.includeCharts && options?.chartElementIds && options.chartElementIds.length > 0) {
      pdf.setTextColor(255, 255, 255); // White text for dark background
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');

      // Add dark background for charts section
      const chartsStartY = yPosition;
      const darkBgHeight = pageHeight - yPosition - margin - 10; // Remaining space
      pdf.setFillColor(30, 30, 30); // Dark gray background
      pdf.rect(0, chartsStartY, pageWidth, darkBgHeight, 'F');

      pdf.text('Gráficas de Evaluación 360°', margin, yPosition + 5);
      yPosition += 11;

      const charts = [];

      // Capture all charts first (with dark background)
      for (const elementId of options.chartElementIds) {
        const element = document.getElementById(elementId);
        if (element) {
          try {
            const canvas = await html2canvas(element, {
              backgroundColor: null, // Preserve original background
              scale: 1.5, // Reduced scale for smaller file size
              logging: false,
            });
            charts.push(canvas);
          } catch (error) {
            console.error(`Error capturing chart ${elementId}:`, error);
          }
        }
      }

      // Place charts side by side if we have 2
      if (charts.length === 2) {
        const availableWidth = pageWidth - 2 * margin;
        const chartWidth = (availableWidth - 5) / 2; // 5mm gap between charts

        // Calculate heights proportionally
        const chart1Height = (charts[0].height * chartWidth) / charts[0].width;
        const chart2Height = (charts[1].height * chartWidth) / charts[1].width;
        const maxChartHeight = Math.max(chart1Height, chart2Height);

        // Check if we need to scale down to fit in remaining page space
        const availableHeight = pageHeight - yPosition - margin - 15; // 15mm for footer
        let finalHeight = Math.min(maxChartHeight, availableHeight);
        let finalWidth = chartWidth;

        // If charts are too tall, scale them down proportionally
        if (maxChartHeight > availableHeight) {
          const scaleFactor = availableHeight / maxChartHeight;
          finalWidth = chartWidth * scaleFactor;
          finalHeight = availableHeight;
        }

        // Add first chart (left)
        const imgData1 = charts[0].toDataURL('image/png');
        pdf.addImage(imgData1, 'PNG', margin, yPosition, finalWidth, (charts[0].height * finalWidth) / charts[0].width);

        // Add second chart (right)
        const imgData2 = charts[1].toDataURL('image/png');
        pdf.addImage(imgData2, 'PNG', margin + finalWidth + 5, yPosition, finalWidth, (charts[1].height * finalWidth) / charts[1].width);

        yPosition += finalHeight + 5;
      } else {
        // Fallback: place charts vertically if not exactly 2
        for (const canvas of charts) {
          const imgData = canvas.toDataURL('image/png');
          const imgWidth = pageWidth - 2 * margin;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;

          if (yPosition + imgHeight > pageHeight - margin) {
            pdf.addPage();
            yPosition = margin;
          }

          pdf.addImage(imgData, 'PNG', margin, yPosition, imgWidth, imgHeight);
          yPosition += imgHeight + 5;
        }
      }
    }

    // Footer on all pages
    const pageCount = (pdf as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(9);
      pdf.setTextColor(128, 128, 128);
      pdf.setFont('helvetica', 'normal');

      const footerText = `Generado por Maity - ${new Date().toLocaleDateString('es-MX')}`;
      pdf.text(footerText, margin, pageHeight - 10);

      pdf.text(`Página ${i} de ${pageCount}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
    }

    // Generate filename
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `Maity_${sessionTypeText}_${data.userName || 'Usuario'}_${timestamp}.pdf`;

    // Download PDF
    pdf.save(filename);
  }

  /**
   * Helper to format duration
   */
  static formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
  }
}
