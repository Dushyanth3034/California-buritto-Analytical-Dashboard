import * as XLSX from 'xlsx';

/**
 * Exports JSON data to a CSV file.
 * Handles text escaping for commas, quotes, and line breaks.
 */
export const exportToCSV = (data, filename = 'dashboard_export.csv') => {
  if (!data || data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(',')];

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const values = headers.map(header => {
      const val = row[header];
      const strVal = val === null || val === undefined ? '' : String(val);
      // Escape quotes and wrap cell value in quotes if it contains comma, quotes, or newlines
      const escaped = strVal.replace(/"/g, '""');
      if (escaped.includes(',') || escaped.includes('"') || escaped.includes('\n') || escaped.includes('\r')) {
        return `"${escaped}"`;
      }
      return escaped;
    });
    csvRows.push(values.join(','));
  }

  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
  if (navigator.msSaveBlob) { // IE 10+
    navigator.msSaveBlob(blob, filename);
  } else {
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
};

/**
 * Exports JSON data to a premium styled Excel sheet using SheetJS.
 */
export const exportToExcel = (data, filename = 'dashboard_export.xlsx') => {
  if (!data || data.length === 0) return;

  // Convert JSON to Worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);
  
  // Create a new empty workbook
  const workbook = XLSX.utils.book_new();
  
  // Append sheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Analytics Data');
  
  // Trigger browser download dialog
  XLSX.writeFile(workbook, filename);
};
