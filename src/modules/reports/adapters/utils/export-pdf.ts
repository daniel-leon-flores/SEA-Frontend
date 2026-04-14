import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface PdfExportOptions {
  title: string;
  subtitle?: string;
  columns: string[];
  rows: (string | number)[][];
  fileName: string;
  orientation?: 'portrait' | 'landscape';
}

export function exportToPdf(options: PdfExportOptions): void {
  const doc = new jsPDF({ orientation: options.orientation || 'landscape' });

  // Header
  doc.setFontSize(18);
  doc.setTextColor(8, 30, 83); // #081e53
  doc.text(options.title, 14, 20);

  if (options.subtitle) {
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text(options.subtitle, 14, 28);
  }

  doc.setFontSize(9);
  doc.setTextColor(150);
  doc.text(`Generado: ${new Date().toLocaleString('es-MX')}`, 14, options.subtitle ? 35 : 28);

  // Table
  autoTable(doc, {
    head: [options.columns],
    body: options.rows,
    startY: options.subtitle ? 40 : 33,
    theme: 'grid',
    headStyles: {
      fillColor: [6, 149, 116], // #069574
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: { fontSize: 8 },
    alternateRowStyles: { fillColor: [245, 245, 245] },
  });

  doc.save(`${options.fileName}.pdf`);
}
