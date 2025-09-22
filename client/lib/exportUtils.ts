import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';

// Types for export data
export interface ExportColumn {
  key: string;
  header: string;
  width?: number;
  formatter?: (value: any) => string;
}

export interface ExportOptions {
  filename: string;
  sheetName?: string;
  title?: string;
  columns: ExportColumn[];
  data: any[];
  includeTimestamp?: boolean;
}

// CSV Export
export const exportToCSV = (options: ExportOptions) => {
  const { filename, columns, data, includeTimestamp = true } = options;
  try {
    // Create CSV headers
    const headers = columns.map(col => col.header);

    // Create CSV rows
    const rows = (data || []).map(item =>
      columns.map(col => {
        const value = item?.[col.key];
        return col.formatter ? col.formatter(value) : String(value ?? '');
      })
    );

    // Combine headers and rows
    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
      .join('\r\n');

    // Add BOM for proper UTF-8 encoding
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

    const finalFilename = includeTimestamp
      ? `${filename}_${new Date().toISOString().split('T')[0]}.csv`
      : `${filename}.csv`;

    saveAs(blob, finalFilename);
  } catch (error) {
    console.error('CSV export failed:', error);
    console.error('Failed to export CSV:', error);
    throw new Error('Failed to export CSV. Please try again.');
  }
};

// Excel Export
export const exportToExcel = (options: ExportOptions) => {
  const { filename, sheetName = 'Sheet1', columns, data, title, includeTimestamp = true } = options;

  // Create workbook
  const wb = XLSX.utils.book_new();

  // Prepare data for worksheet
  const wsData: any[][] = [];

  // Add title if provided
  if (title) {
    wsData.push([title]);
    wsData.push([]); // Empty row
  }

  // Add headers
  wsData.push(columns.map(col => col.header));

  // Add data rows
  data.forEach(item => {
    const row = columns.map(col => {
      const value = item[col.key];
      return col.formatter ? col.formatter(value) : value;
    });
    wsData.push(row);
  });

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Set column widths
  const colWidths = columns.map(col => ({ width: col.width || 15 }));
  ws['!cols'] = colWidths;

  // Style header row
  const headerRowIndex = title ? 2 : 0;
  columns.forEach((_, colIndex) => {
    const cellAddress = XLSX.utils.encode_cell({ r: headerRowIndex, c: colIndex });
    if (ws[cellAddress]) {
      ws[cellAddress].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: "CCCCCC" } }
      };
    }
  });

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  // Generate and save file
  const finalFilename = includeTimestamp
    ? `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`
    : `${filename}.xlsx`;

  XLSX.writeFile(wb, finalFilename);
};

// PDF Export
export const exportToPDF = (options: ExportOptions) => {
  const { filename, columns, data, title, includeTimestamp = true } = options;

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;

  // Add title
  if (title) {
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(title, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;
  }

  // Add export date
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth - 20, yPosition, { align: 'right' });
  yPosition += 15;

  // Calculate column widths
  const availableWidth = pageWidth - 40;
  const defaultColWidth = availableWidth / columns.length;

  // Table headers
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');

  let xPosition = 20;
  columns.forEach((col, index) => {
    const colWidth = col.width || defaultColWidth;
    doc.text(col.header, xPosition, yPosition);
    xPosition += colWidth;
  });

  // Draw header line
  doc.setLineWidth(0.5);
  doc.line(20, yPosition + 2, pageWidth - 20, yPosition + 2);
  yPosition += 10;

  // Table data
  doc.setFont('helvetica', 'normal');

  data.forEach((item, rowIndex) => {
    // Check if we need a new page
    if (yPosition > pageHeight - 30) {
      doc.addPage();
      yPosition = 20;
    }

    xPosition = 20;
    columns.forEach((col) => {
      const colWidth = col.width || defaultColWidth;
      const value = item[col.key];
      const displayValue = col.formatter ? col.formatter(value) : String(value || '');

      // Truncate text if too long
      const maxChars = Math.floor(colWidth / 2);
      const truncatedValue = displayValue.length > maxChars
        ? displayValue.substring(0, maxChars - 3) + '...'
        : displayValue;

      doc.text(truncatedValue, xPosition, yPosition);
      xPosition += colWidth;
    });

    yPosition += 8;
  });

  // Save the PDF
  const finalFilename = includeTimestamp
    ? `${filename}_${new Date().toISOString().split('T')[0]}.pdf`
    : `${filename}.pdf`;

  try {
    doc.save(finalFilename);
  } catch {
    // Fallback: save via Blob if direct save fails
    const blob = doc.output('blob');
    saveAs(blob as unknown as Blob, finalFilename);
  }
};

// Utility function to format currency
export const formatCurrency = (amount: number): string => {
  return `₹${amount.toLocaleString()}`;
};

// Utility function to format date
export const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-IN');
};

// Utility function to format boolean
export const formatBoolean = (value: boolean): string => {
  return value ? 'Yes' : 'No';
};

// Pre-defined column configurations for common exports

export const productColumns: ExportColumn[] = [
  { key: 'name', header: 'Product Name', width: 25 },
  { key: 'sku', header: 'SKU', width: 15 },
  { key: 'barcode', header: 'Barcode', width: 15 },
  { key: 'category', header: 'Category', width: 15 },
  { key: 'brand', header: 'Brand', width: 12 },
  { key: 'unitPrice', header: 'Unit Price', width: 12, formatter: formatCurrency },
  { key: 'costPrice', header: 'Cost Price', width: 12, formatter: formatCurrency },
  { key: 'currentStock', header: 'Stock', width: 10 },
  { key: 'minStock', header: 'Min Stock', width: 10 },
  { key: 'supplier', header: 'Supplier', width: 20 },
  { key: 'status', header: 'Status', width: 10 },
];

export const customerColumns: ExportColumn[] = [
  { key: 'name', header: 'Customer Name', width: 25 },
  { key: 'phone', header: 'Phone', width: 15 },
  { key: 'email', header: 'Email', width: 25 },
  { key: 'totalPurchases', header: 'Total Purchases', width: 15 },
  { key: 'totalSpent', header: 'Total Spent', width: 15, formatter: formatCurrency },
  { key: 'lastPurchase', header: 'Last Purchase', width: 15, formatter: formatDate },
  { key: 'loyaltyPoints', header: 'Loyalty Points', width: 12 },
  { key: 'joinDate', header: 'Join Date', width: 15, formatter: formatDate },
];

export const salesColumns: ExportColumn[] = [
  { key: 'billNumber', header: 'Bill Number', width: 15 },
  { key: 'date', header: 'Date', width: 15, formatter: formatDate },
  { key: 'customerName', header: 'Customer', width: 20 },
  { key: 'itemCount', header: 'Items', width: 10 },
  { key: 'subtotal', header: 'Subtotal', width: 15, formatter: formatCurrency },
  { key: 'discount', header: 'Discount', width: 12, formatter: formatCurrency },
  { key: 'tax', header: 'Tax', width: 12, formatter: formatCurrency },
  { key: 'total', header: 'Total', width: 15, formatter: formatCurrency },
  { key: 'paymentMethod', header: 'Payment Method', width: 15 },
];

export const inventoryColumns: ExportColumn[] = [
  { key: 'name', header: 'Product Name', width: 25 },
  { key: 'sku', header: 'SKU', width: 15 },
  { key: 'category', header: 'Category', width: 15 },
  { key: 'currentStock', header: 'Current Stock', width: 12 },
  { key: 'minStock', header: 'Min Stock', width: 12 },
  { key: 'maxStock', header: 'Max Stock', width: 12 },
  { key: 'stockValue', header: 'Stock Value', width: 15, formatter: formatCurrency },
  { key: 'status', header: 'Stock Status', width: 12 },
];

// Export functions for specific data types
export const exportProducts = (products: any[], format: 'csv' | 'excel' | 'pdf' = 'excel') => {
  const options: ExportOptions = {
    filename: 'products',
    title: 'Product Catalog',
    sheetName: 'Products',
    columns: productColumns,
    data: products,
  };

  switch (format) {
    case 'csv':
      exportToCSV(options);
      break;
    case 'excel':
      exportToExcel(options);
      break;
    case 'pdf':
      exportToPDF(options);
      break;
  }
};

export const exportCustomers = (customers: any[], format: 'csv' | 'excel' | 'pdf' = 'excel') => {
  const options: ExportOptions = {
    filename: 'customers',
    title: 'Customer Database',
    sheetName: 'Customers',
    columns: customerColumns,
    data: customers,
  };

  switch (format) {
    case 'csv':
      exportToCSV(options);
      break;
    case 'excel':
      exportToExcel(options);
      break;
    case 'pdf':
      exportToPDF(options);
      break;
  }
};

export const exportSales = (sales: any[], format: 'csv' | 'excel' | 'pdf' = 'excel') => {
  const options: ExportOptions = {
    filename: 'sales_report',
    title: 'Sales Report',
    sheetName: 'Sales',
    columns: salesColumns,
    data: sales,
  };

  switch (format) {
    case 'csv':
      exportToCSV(options);
      break;
    case 'excel':
      exportToExcel(options);
      break;
    case 'pdf':
      exportToPDF(options);
      break;
  }
};

export const exportInventory = (inventory: any[], format: 'csv' | 'excel' | 'pdf' = 'excel') => {
  const options: ExportOptions = {
    filename: 'inventory_report',
    title: 'Inventory Report',
    sheetName: 'Inventory',
    columns: inventoryColumns,
    data: inventory,
  };

  switch (format) {
    case 'csv':
      exportToCSV(options);
      break;
    case 'excel':
      exportToExcel(options);
      break;
    case 'pdf':
      exportToPDF(options);
      break;
  }
};
