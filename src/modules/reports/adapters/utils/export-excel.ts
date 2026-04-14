import * as XLSX from 'xlsx';

interface ExcelExportOptions {
  sheetName: string;
  columns: string[];
  rows: (string | number | null)[][];
  fileName: string;
}

export function exportToExcel(options: ExcelExportOptions): void {
  const worksheetData = [options.columns, ...options.rows];
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  // Auto-width columns
  const colWidths = options.columns.map((col, i) => {
    const maxLen = Math.max(
      col.length,
      ...options.rows.map((row) => String(row[i] ?? '').length)
    );
    return { wch: Math.min(maxLen + 2, 40) };
  });
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, options.sheetName);
  XLSX.writeFile(workbook, `${options.fileName}.xlsx`);
}
