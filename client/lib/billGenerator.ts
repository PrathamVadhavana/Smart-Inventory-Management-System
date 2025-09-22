import { jsPDF } from 'jspdf';

interface BillItem {
  name: string;
  quantity: number;
  price: number;
  total: number;
  hsnCode?: string;
}

interface Customer {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  gstNumber?: string;
}

interface Company {
  name: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  gstNumber: string;
  logo?: string;
}

interface BillData {
  billNumber: string;
  date: string;
  customer: Customer;
  items: BillItem[];
  subtotal: number;
  discount: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  paymentMethod: string;
  amountReceived?: number;
  changeAmount?: number;
}

const defaultCompany: Company = {
  name: "SmartInventory Solutions",
  address: "123 Business Park, Tech City, State - 500001",
  phone: "+91 98765 43210",
  email: "info@smartinventory.com",
  website: "www.smartinventory.com",
  gstNumber: "22AAAAA0000A1Z5",
};

export class BillGenerator {
  private doc: jsPDF;
  private yPosition: number = 20;
  private pageWidth: number;
  private pageHeight: number;

  constructor() {
    this.doc = new jsPDF();
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
  }

  generateBill(billData: BillData, company: Company = defaultCompany): string {
    try {
      this.yPosition = 20;

      // Validate bill data
      if (!billData.items || billData.items.length === 0) {
        throw new Error('No items found in bill data');
      }

      if (!billData.customer || !billData.customer.name) {
        throw new Error('Customer information is missing');
      }

      // Header
      this.addHeader(company);

      // Bill Info
      this.addBillInfo(billData);

      // Customer Info
      this.addCustomerInfo(billData.customer);

      // Items Table
      this.addItemsTable(billData.items);

      // Summary
      this.addSummary(billData);

      // Footer
      this.addFooter(company);

      return this.doc.output('dataurlstring');
    } catch (error) {
      console.error('Error generating bill:', error);
      throw new Error(`Failed to generate bill: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  downloadBill(billData: BillData, company: Company = defaultCompany): void {
    try {
      this.generateBill(billData, company);
      this.doc.save(`Bill_${billData.billNumber}.pdf`);
    } catch (error) {
      console.error('Error in downloadBill:', error);
      throw new Error('Failed to generate or download PDF');
    }
  }

  printBill(billData: BillData, company: Company = defaultCompany): void {
    this.generateBill(billData, company);

    try {
      // Try to open in new window first
      const blobUrl = this.doc.output('bloburl');
      const printWindow = window.open(blobUrl, '_blank');

      if (!printWindow) {
        // If popup is blocked, try alternative method
        console.warn('Popup blocked, trying alternative print method');
        this.alternativePrint();
      } else {
        // Wait for the window to load and then print
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print();
          }, 500);
        };
      }
    } catch (error) {
      console.error('Error in printBill:', error);
      throw new Error('Failed to open print dialog');
    }
  }

  private alternativePrint(): void {
    try {
      // Create a temporary link and trigger download as fallback
      const blob = this.doc.output('blob');
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'bill.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Alternative print method failed:', error);
      throw new Error('Failed to print or download bill');
    }
  }

  private addHeader(company: Company): void {
    // Company Name
    this.doc.setFontSize(24);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(company.name, this.pageWidth / 2, this.yPosition, { align: 'center' });
    this.yPosition += 10;

    // Company Details
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(company.address, this.pageWidth / 2, this.yPosition, { align: 'center' });
    this.yPosition += 5;

    const contactInfo = `Phone: ${company.phone} | Email: ${company.email}`;
    this.doc.text(contactInfo, this.pageWidth / 2, this.yPosition, { align: 'center' });
    this.yPosition += 5;

    if (company.website) {
      this.doc.text(`Website: ${company.website}`, this.pageWidth / 2, this.yPosition, { align: 'center' });
      this.yPosition += 5;
    }

    this.doc.text(`GST No: ${company.gstNumber}`, this.pageWidth / 2, this.yPosition, { align: 'center' });
    this.yPosition += 15;

    // Line separator
    this.doc.setLineWidth(0.5);
    this.doc.line(20, this.yPosition, this.pageWidth - 20, this.yPosition);
    this.yPosition += 10;
  }

  private addBillInfo(billData: BillData): void {
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('TAX INVOICE', this.pageWidth / 2, this.yPosition, { align: 'center' });
    this.yPosition += 15;

    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'normal');

    // Bill Number and Date
    this.doc.text(`Bill No: ${billData.billNumber}`, 20, this.yPosition);
    this.doc.text(`Date: ${billData.date}`, this.pageWidth - 20, this.yPosition, { align: 'right' });
    this.yPosition += 15;
  }

  private addCustomerInfo(customer: Customer): void {
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Bill To:', 20, this.yPosition);
    this.yPosition += 8;

    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(customer.name, 20, this.yPosition);
    this.yPosition += 5;

    this.doc.text(`Phone: ${customer.phone}`, 20, this.yPosition);
    this.yPosition += 5;

    if (customer.email) {
      this.doc.text(`Email: ${customer.email}`, 20, this.yPosition);
      this.yPosition += 5;
    }

    if (customer.address) {
      this.doc.text(`Address: ${customer.address}`, 20, this.yPosition);
      this.yPosition += 5;
    }

    if (customer.gstNumber) {
      this.doc.text(`GST No: ${customer.gstNumber}`, 20, this.yPosition);
      this.yPosition += 5;
    }

    this.yPosition += 10;
  }

  private addItemsTable(items: BillItem[]): void {
    const formatCurrency = (n: number) => `₹${n.toLocaleString('en-IN')}`;

    // Layout
    const top = this.yPosition;
    const left = 20;
    const width = this.pageWidth - 40;

    // Column widths
    const col = {
      sno: 12,
      name: 90,
      qty: 18,
      rate: 30,
      amount: 30,
    };

    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFillColor(240, 240, 240);
    this.doc.rect(left, top, width, 9, 'F');

    // Header labels
    this.doc.text('S.No', left + 3, top + 6);
    this.doc.text('Product Name', left + col.sno + 3, top + 6);
    this.doc.text('Qty', left + col.sno + col.name + col.qty - 10, top + 6, { align: 'right' });
    this.doc.text('Rate', left + col.sno + col.name + col.qty + col.rate - 4, top + 6, { align: 'right' });
    this.doc.text('Amount', left + width - 4, top + 6, { align: 'right' });

    this.yPosition += 11;
    this.doc.setFont('helvetica', 'normal');

    // Rows
    items.forEach((item, index) => {
      // New page handling (simple)
      if (this.yPosition > this.pageHeight - 60) {
        this.doc.addPage();
        this.yPosition = 20;
      }
      const rowTop = this.yPosition;
      const nameX = left + col.sno + 3;
      const nameWidth = col.name - 6;
      const nameLines = this.doc.splitTextToSize(item.name, nameWidth);

      // Draw row boundary
      const rowHeight = Math.max(9, nameLines.length * 5 + 4);
      this.doc.setLineWidth(0.1);
      this.doc.rect(left, rowTop - 6, width, rowHeight);

      // Cells
      this.doc.text(String(index + 1), left + 3, rowTop);
      this.doc.text(nameLines, nameX, rowTop);
      this.doc.text(String(item.quantity), left + col.sno + col.name + col.qty - 4, rowTop, { align: 'right' });
      this.doc.text(formatCurrency(item.price), left + col.sno + col.name + col.qty + col.rate - 4, rowTop, { align: 'right' });
      this.doc.text(formatCurrency(item.total), left + width - 4, rowTop, { align: 'right' });

      this.yPosition += rowHeight;
    });

    this.yPosition += 8;
  }

  private addSummary(billData: BillData): void {
    const formatCurrency = (n: number) => `₹${n.toLocaleString('en-IN')}`;

    const boxWidth = 90;
    const left = this.pageWidth - boxWidth - 20;
    const top = this.yPosition;

    // Box
    this.doc.setLineWidth(0.3);
    this.doc.rect(left, top, boxWidth, 40);

    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');

    let lineY = top + 8;
    const labelX = left + 6;
    const valueX = left + boxWidth - 6;

    this.doc.text('Subtotal', labelX, lineY);
    this.doc.text(formatCurrency(billData.subtotal), valueX, lineY, { align: 'right' });
    lineY += 6;

    if (billData.discount > 0) {
      this.doc.text('Discount', labelX, lineY);
      const discountAmount = (billData.subtotal * billData.discount) / 100;
      this.doc.text(`- ${formatCurrency(discountAmount)}`, valueX, lineY, { align: 'right' });
      lineY += 6;
    }

    this.doc.text(`GST (${billData.taxRate}%)`, labelX, lineY);
    this.doc.text(formatCurrency(billData.taxAmount), valueX, lineY, { align: 'right' });
    lineY += 8;

    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Total', labelX, lineY);
    this.doc.text(formatCurrency(billData.total), valueX, lineY, { align: 'right' });
    lineY += 10;

    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`Payment: ${billData.paymentMethod}`, labelX, lineY);
    this.yPosition = Math.max(this.yPosition + 42, lineY + 8);

    // Amount in words
    const words = this.convertAmountToWords(Math.round(billData.total));
    this.doc.text(`Amount in words: ${words} only`, 20, this.yPosition);
    this.yPosition += 12;
  }

  private convertAmountToWords(amount: number): string {
    const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const inWords = (num: number): string => {
      if (num === 0) return 'Zero';
      const crore = Math.floor(num / 10000000);
      num %= 10000000;
      const lakh = Math.floor(num / 100000);
      num %= 100000;
      const thousand = Math.floor(num / 1000);
      num %= 1000;
      const hundred = Math.floor(num / 100);
      const rest = num % 100;
      const parts: string[] = [];
      if (crore) parts.push(`${inWords(crore)} Crore`);
      if (lakh) parts.push(`${inWords(lakh)} Lakh`);
      if (thousand) parts.push(`${inWords(thousand)} Thousand`);
      if (hundred) parts.push(`${a[hundred]} Hundred`);
      if (rest) parts.push(rest < 20 ? a[rest] : `${b[Math.floor(rest / 10)]}${rest % 10 ? ' ' + a[rest % 10] : ''}`);
      return parts.join(' ');
    };

    return inWords(amount);
  }

  private addFooter(company: Company): void {
    this.yPosition = this.pageHeight - 40;

    // Terms and conditions
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');

    this.doc.text('Terms & Conditions:', 20, this.yPosition);
    this.yPosition += 5;

    const terms = [
      '1. All goods sold are subject to our standard terms and conditions.',
      '2. Payment is due immediately unless other arrangements have been made.',
      '3. Returns are accepted within 7 days with original receipt.',
    ];

    terms.forEach(term => {
      this.doc.text(term, 20, this.yPosition);
      this.yPosition += 4;
    });

    this.yPosition += 5;

    // Thank you message
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Thank you for your business!', this.pageWidth / 2, this.yPosition, { align: 'center' });

    // Digital signature
    this.yPosition += 10;
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('This is a computer generated invoice.', this.pageWidth / 2, this.yPosition, { align: 'center' });
  }
}

// Utility function to create bill data from cart
export function createBillData(
  cartItems: any[],
  customer: any,
  discount: number,
  taxRate: number,
  paymentMethod: string
): BillData {
  const items: BillItem[] = cartItems.map(item => ({
    name: item.name,
    quantity: item.quantity,
    price: item.price,
    total: item.price * item.quantity,
    hsnCode: '8517', // Default HSN code for electronics
  }));

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const discountAmount = (subtotal * discount) / 100;
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = (taxableAmount * taxRate) / 100;
  const total = taxableAmount + taxAmount;

  return {
    billNumber: `INV-${Date.now()}`,
    date: new Date().toLocaleDateString('en-IN'),
    customer: customer || { name: 'Guest Customer', phone: '-' },
    items,
    subtotal,
    discount,
    taxRate,
    taxAmount,
    total,
    paymentMethod: paymentMethod || 'Cash',
  };
}
