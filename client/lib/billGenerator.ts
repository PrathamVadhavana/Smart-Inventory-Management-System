import { jsPDF } from "jspdf";

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

  // Color scheme for professional look
  private colors = {
    primary: "#2563eb", // Blue
    secondary: "#64748b", // Gray
    accent: "#059669", // Green
    light: "#f8fafc", // Light gray
    dark: "#0f172a", // Dark
    border: "#e2e8f0", // Border gray
  };

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
        throw new Error("No items found in bill data");
      }

      if (!billData.customer || !billData.customer.name) {
        throw new Error("Customer information is missing");
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

      return this.doc.output("dataurlstring");
    } catch (error) {
      console.error("Error generating bill:", error);
      throw new Error(
        `Failed to generate bill: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  downloadBill(billData: BillData, company: Company = defaultCompany): void {
    try {
      this.generateBill(billData, company);
      this.doc.save(`Bill_${billData.billNumber}.pdf`);
    } catch (error) {
      console.error("Error in downloadBill:", error);
      throw new Error("Failed to generate or download PDF");
    }
  }

  printBill(billData: BillData, company: Company = defaultCompany): void {
    this.generateBill(billData, company);

    try {
      // Try to open in new window first
      const blobUrl = this.doc.output("bloburl");
      const printWindow = window.open(blobUrl, "_blank");

      if (!printWindow) {
        // If popup is blocked, try alternative method
        console.warn("Popup blocked, trying alternative print method");
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
      console.error("Error in printBill:", error);
      throw new Error("Failed to open print dialog");
    }
  }

  private alternativePrint(): void {
    try {
      // Create a temporary link and trigger download as fallback
      const blob = this.doc.output("blob");
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "bill.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Alternative print method failed:", error);
      throw new Error("Failed to print or download bill");
    }
  }

  private addHeader(company: Company): void {
    // Header background
    this.doc.setFillColor(37, 99, 235); // Primary blue
    this.doc.rect(0, 0, this.pageWidth, 35, "F");

    // Company Name
    this.doc.setTextColor(255, 255, 255); // White text
    this.doc.setFontSize(26);
    this.doc.setFont("helvetica", "bold");
    this.doc.text(company.name, this.pageWidth / 2, 18, { align: "center" });

    // Tagline
    this.doc.setFontSize(11);
    this.doc.setFont("helvetica", "normal");
    this.doc.text("Smart Inventory Management System", this.pageWidth / 2, 28, {
      align: "center",
    });

    this.yPosition = 38; // Reduced from 45

    // Company details box
    this.doc.setTextColor(0, 0, 0); // Black text
    this.doc.setFillColor(248, 250, 252); // Light gray background
    this.doc.roundedRect(
      15,
      this.yPosition,
      this.pageWidth - 30,
      20, // Reduced from 25
      3,
      3,
      "F",
    );

    // Border for company details
    this.doc.setDrawColor(226, 232, 240);
    this.doc.setLineWidth(0.5);
    this.doc.roundedRect(
      15,
      this.yPosition,
      this.pageWidth - 30,
      20, // Reduced from 25
      3,
      3,
      "S",
    );

    this.yPosition += 6; // Reduced from 8

    // Company details in two columns
    this.doc.setFontSize(9);
    this.doc.setFont("helvetica", "normal");

    // Left column
    this.doc.text(company.address, 20, this.yPosition);
    this.yPosition += 4;
    this.doc.text(`Phone: ${company.phone}`, 20, this.yPosition);
    this.yPosition += 3; // Reduced from 4
    this.doc.text(`Email: ${company.email}`, 20, this.yPosition);

    // Right column
    if (company.website) {
      this.doc.text(
        `Website: ${company.website}`,
        this.pageWidth - 20,
        this.yPosition - 8,
        { align: "right" },
      );
    }
    this.doc.text(
      `GST No: ${company.gstNumber}`,
      this.pageWidth - 20,
      this.yPosition - 4,
      { align: "right" },
    );

    this.yPosition += 12; // Reduced from 15
  }

  private addBillInfo(billData: BillData): void {
    // Invoice title with accent color background
    this.doc.setFillColor(5, 150, 105); // Green accent
    this.doc.roundedRect(
      15,
      this.yPosition,
      this.pageWidth - 30,
      12,
      2,
      2,
      "F",
    );

    this.doc.setTextColor(255, 255, 255); // White text
    this.doc.setFontSize(18);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("TAX INVOICE", this.pageWidth / 2, this.yPosition + 8, {
      align: "center",
    });

    this.yPosition += 20;

    // Bill info in styled boxes
    this.doc.setTextColor(0, 0, 0); // Black text

    // Left side - Bill Number
    this.doc.setFillColor(248, 250, 252);
    this.doc.roundedRect(
      15,
      this.yPosition,
      (this.pageWidth - 35) / 2,
      18,
      2,
      2,
      "F",
    );
    this.doc.setDrawColor(226, 232, 240);
    this.doc.setLineWidth(0.3);
    this.doc.roundedRect(
      15,
      this.yPosition,
      (this.pageWidth - 35) / 2,
      18,
      2,
      2,
      "S",
    );

    this.doc.setFontSize(10);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("INVOICE NUMBER", 20, this.yPosition + 6);
    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(12);

    // Ensure bill number fits in box
    const maxBillWidth = (this.pageWidth - 35) / 2 - 10;
    let billNumber = billData.billNumber;
    if (this.doc.getTextWidth(billNumber) > maxBillWidth) {
      this.doc.setFontSize(10); // Use smaller font if needed
    }

    this.doc.text(billNumber, 20, this.yPosition + 13);

    // Right side - Date
    this.doc.setFillColor(248, 250, 252);
    this.doc.roundedRect(
      (this.pageWidth + 5) / 2,
      this.yPosition,
      (this.pageWidth - 35) / 2,
      18,
      2,
      2,
      "F",
    );
    this.doc.setDrawColor(226, 232, 240);
    this.doc.roundedRect(
      (this.pageWidth + 5) / 2,
      this.yPosition,
      (this.pageWidth - 35) / 2,
      18,
      2,
      2,
      "S",
    );

    this.doc.setFontSize(10);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("DATE", (this.pageWidth + 5) / 2 + 5, this.yPosition + 6);
    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(12);

    // Ensure date fits in box
    const maxDateWidth = (this.pageWidth - 35) / 2 - 10;
    let dateText = billData.date;
    if (this.doc.getTextWidth(dateText) > maxDateWidth) {
      this.doc.setFontSize(10); // Use smaller font if needed
    }

    this.doc.text(dateText, (this.pageWidth + 5) / 2 + 5, this.yPosition + 13);

    this.yPosition += 20; // Reduced from 25
  }

  private addCustomerInfo(customer: Customer): void {
    // Customer info header
    this.doc.setFillColor(37, 99, 235); // Primary blue
    this.doc.roundedRect(15, this.yPosition, this.pageWidth - 30, 8, 2, 2, "F");

    this.doc.setTextColor(255, 255, 255); // White text
    this.doc.setFontSize(12);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("BILL TO", 20, this.yPosition + 6);

    this.yPosition += 10; // Reduced from 12

    // Customer details box - more compact
    const customerBoxHeight =
      20 + // Reduced from 25
      (customer.email ? 3 : 0) + // Reduced from 4
      (customer.address ? 3 : 0) + // Reduced from 4
      (customer.gstNumber ? 3 : 0); // Reduced from 4

    this.doc.setTextColor(0, 0, 0); // Black text
    this.doc.setFillColor(248, 250, 252); // Light background
    this.doc.roundedRect(
      15,
      this.yPosition,
      this.pageWidth - 30,
      customerBoxHeight,
      2,
      2,
      "F",
    );

    // Border
    this.doc.setDrawColor(226, 232, 240);
    this.doc.setLineWidth(0.3);
    this.doc.roundedRect(
      15,
      this.yPosition,
      this.pageWidth - 30,
      customerBoxHeight,
      2,
      2,
      "S",
    );

    this.yPosition += 8;

    // Customer name (prominent) - with text wrapping
    this.doc.setFontSize(14);
    this.doc.setFont("helvetica", "bold");

    const maxNameWidth = this.pageWidth - 50; // Leave margin for box boundaries
    let customerName = customer.name;
    if (this.doc.getTextWidth(customerName) > maxNameWidth) {
      while (
        this.doc.getTextWidth(customerName + "...") > maxNameWidth &&
        customerName.length > 10
      ) {
        customerName = customerName.substring(0, customerName.length - 1);
      }
      customerName += "...";
    }

    this.doc.text(customerName, 20, this.yPosition);
    this.yPosition += 8;

    // Customer details
    this.doc.setFontSize(10);
    this.doc.setFont("helvetica", "normal");

    // Phone number with proper cleaning and validation
    let phoneText = "Not Provided";
    if (customer.phone && customer.phone !== "N/A") {
      // Clean phone number - remove emojis and special characters
      const cleanPhone = String(customer.phone)
        .replace(/[^\d\s+()-]/g, "")
        .trim();
      // Only use if it looks like a valid phone number
      if (cleanPhone && cleanPhone.length >= 10 && /\d{10,}/.test(cleanPhone)) {
        phoneText = cleanPhone;
      }
    }
    this.doc.text(`Phone: ${phoneText}`, 20, this.yPosition);
    this.yPosition += 4;

    if (customer.email) {
      const maxEmailWidth = this.pageWidth - 70;
      let emailText = customer.email;
      if (this.doc.getTextWidth(`Email: ${emailText}`) > maxEmailWidth) {
        while (
          this.doc.getTextWidth(`Email: ${emailText}...`) > maxEmailWidth &&
          emailText.length > 10
        ) {
          emailText = emailText.substring(0, emailText.length - 1);
        }
        emailText += "...";
      }
      this.doc.text(`Email: ${emailText}`, 20, this.yPosition);
      this.yPosition += 4;
    }

    if (customer.address) {
      const maxAddressWidth = this.pageWidth - 80;
      let addressText = customer.address;
      if (this.doc.getTextWidth(`Address: ${addressText}`) > maxAddressWidth) {
        while (
          this.doc.getTextWidth(`Address: ${addressText}...`) >
            maxAddressWidth &&
          addressText.length > 15
        ) {
          addressText = addressText.substring(0, addressText.length - 1);
        }
        addressText += "...";
      }
      this.doc.text(`Address: ${addressText}`, 20, this.yPosition);
      this.yPosition += 4;
    }

    if (customer.gstNumber) {
      this.doc.text(`GST: ${customer.gstNumber}`, 20, this.yPosition);
      this.yPosition += 3; // Reduced from 4
    }

    this.yPosition += 10; // Reduced from 15
  }

  private addItemsTable(items: BillItem[]): void {
    const formatCurrency = (n: number) => {
      // Ensure number is valid
      if (isNaN(n) || n === null || n === undefined) return "0.00";
      // Prevent unreasonably large numbers (over 10 million)
      const validNum = Math.abs(n) > 10000000 ? 0 : n;
      const roundedNum = Math.round(validNum * 100) / 100;
      // Use simpler formatting to avoid encoding issues
      const formatted = roundedNum
        .toFixed(2)
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      return `${formatted}`;
    };

    // Layout with safer margins
    const left = 20;
    const width = this.pageWidth - 40; // More conservative margins
    const top = this.yPosition;

    // Proportioned column widths that fit in page
    const col = {
      sno: 10,
      name: 60,
      qty: 18,
      rate: 45,
      amount: 50,
    };

    // Table header with gradient-like effect
    this.doc.setFillColor(37, 99, 235); // Primary blue
    this.doc.roundedRect(left, top, width, 12, 2, 2, "F");

    this.doc.setTextColor(255, 255, 255); // White text
    this.doc.setFontSize(11);
    this.doc.setFont("helvetica", "bold");

    // Header labels with positioning that fits in page
    this.doc.text("#", left + col.sno / 2, top + 8, { align: "center" });
    this.doc.text("PRODUCT DETAILS", left + col.sno + 3, top + 8);
    this.doc.text("QTY", left + col.sno + col.name + col.qty / 2, top + 8, {
      align: "center",
    });
    this.doc.text(
      "UNIT PRICE",
      left + col.sno + col.name + col.qty + col.rate / 2,
      top + 8,
      { align: "center" },
    );
    this.doc.text(
      "AMOUNT",
      left + col.sno + col.name + col.qty + col.rate + col.amount / 2,
      top + 8,
      { align: "center" },
    );

    this.yPosition += 15;

    // Rows with alternating colors
    items.forEach((item, index) => {
      // Page break handling
      if (this.yPosition > this.pageHeight - 80) {
        this.doc.addPage();
        this.yPosition = 30;
      }

      const rowTop = this.yPosition;

      // Alternating row colors
      if (index % 2 === 0) {
        this.doc.setFillColor(248, 250, 252); // Light gray
        this.doc.rect(left, rowTop, width, 12, "F");
      }

      // Row border
      this.doc.setDrawColor(226, 232, 240);
      this.doc.setLineWidth(0.2);
      this.doc.rect(left, rowTop, width, 12, "S");

      // Cell content
      this.doc.setTextColor(0, 0, 0); // Black text
      this.doc.setFontSize(10);
      this.doc.setFont("helvetica", "normal");

      // Serial number
      this.doc.text(String(index + 1), left + col.sno / 2, rowTop + 8, {
        align: "center",
      });

      // Product name (with improved text wrapping)
      const nameX = left + col.sno + 3;
      const nameWidth = col.name - 6; // More conservative width
      let productName = item.name;

      // Truncate if too long with better logic
      if (this.doc.getTextWidth(productName) > nameWidth) {
        while (
          this.doc.getTextWidth(productName + "...") > nameWidth &&
          productName.length > 8
        ) {
          productName = productName.substring(0, productName.length - 1);
        }
        productName += "...";
      }

      this.doc.text(productName, nameX, rowTop + 8);

      // Quantity
      this.doc.text(
        String(item.quantity),
        left + col.sno + col.name + col.qty / 2,
        rowTop + 8,
        { align: "center" },
      );

      // Unit price - with proper fitting
      const priceText = formatCurrency(item.price);
      const priceX = left + col.sno + col.name + col.qty + col.rate / 2;

      // Adjust font size if price text is too wide
      const priceWidth = this.doc.getTextWidth(priceText);
      if (priceWidth > col.rate - 5) {
        this.doc.setFontSize(8);
      }

      this.doc.text(priceText, priceX, rowTop + 8, { align: "center" });
      this.doc.setFontSize(10); // Reset

      // Total amount (bold for emphasis) - with better fitting
      this.doc.setFont("helvetica", "bold");
      const totalText = formatCurrency(item.total);
      const totalX =
        left + col.sno + col.name + col.qty + col.rate + col.amount / 2;

      // Adjust font size if total text is too wide
      const totalWidth = this.doc.getTextWidth(totalText);
      if (totalWidth > col.amount - 5) {
        this.doc.setFontSize(8);
      }

      this.doc.text(totalText, totalX, rowTop + 8, { align: "center" });

      // Reset font and size
      this.doc.setFontSize(10);
      this.doc.setFont("helvetica", "normal");

      this.yPosition += 10; // Reduced from 12
    });

    // Table footer border
    this.doc.setDrawColor(37, 99, 235);
    this.doc.setLineWidth(1);
    this.doc.line(left, this.yPosition, left + width, this.yPosition);

    this.yPosition += 10; // Reduced from 15
  }

  private addSummary(billData: BillData): void {
    const formatCurrency = (n: number) => {
      // Ensure number is valid
      if (isNaN(n) || n === null || n === undefined) return "0.00";
      // Prevent unreasonably large numbers (over 10 million)
      const validNum = Math.abs(n) > 10000000 ? 0 : n;
      const roundedNum = Math.round(validNum * 100) / 100;
      // Use simpler formatting to avoid encoding issues
      const formatted = roundedNum
        .toFixed(2)
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      return `${formatted}`;
    };

    // Check if summary will fit on current page
    if (this.yPosition > this.pageHeight - 100) {
      this.doc.addPage();
      this.yPosition = 30;
    }

    const boxWidth = 90; // Slightly smaller box
    const left = this.pageWidth - boxWidth - 25; // More margin from edge
    const top = this.yPosition;

    // Calculate heights based on content
    let summaryHeight = 35;
    if (billData.discount > 0) summaryHeight += 8;
    if (billData.amountReceived) summaryHeight += 16;

    // Summary box with gradient background
    this.doc.setFillColor(248, 250, 252); // Light background
    this.doc.roundedRect(left, top, boxWidth, summaryHeight, 3, 3, "F");

    // Border
    this.doc.setDrawColor(37, 99, 235);
    this.doc.setLineWidth(0.8);
    this.doc.roundedRect(left, top, boxWidth, summaryHeight, 3, 3, "S");

    this.doc.setTextColor(0, 0, 0);
    this.doc.setFontSize(10);
    this.doc.setFont("helvetica", "normal");

    let lineY = top + 10;
    const labelX = left + 8;
    const valueX = left + boxWidth - 8;

    // Subtotal
    this.doc.text("Subtotal:", labelX, lineY);
    this.doc.text(formatCurrency(billData.subtotal), valueX, lineY, {
      align: "right",
    });
    lineY += 6;

    // Discount (if any)
    if (billData.discount > 0) {
      const discountAmount = (billData.subtotal * billData.discount) / 100;
      this.doc.setTextColor(220, 38, 38); // Red for discount
      this.doc.text(`Discount (${billData.discount}%):`, labelX, lineY);
      this.doc.text(`- ${formatCurrency(discountAmount)}`, valueX, lineY, {
        align: "right",
      });
      lineY += 6;
      this.doc.setTextColor(0, 0, 0); // Reset to black
    }

    // Tax
    this.doc.text(`GST (${billData.taxRate}%):`, labelX, lineY);
    this.doc.text(formatCurrency(billData.taxAmount), valueX, lineY, {
      align: "right",
    });
    lineY += 8;

    // Divider line
    this.doc.setDrawColor(37, 99, 235);
    this.doc.setLineWidth(0.5);
    this.doc.line(labelX, lineY - 2, valueX, lineY - 2);

    // Total with emphasis
    this.doc.setFillColor(37, 99, 235); // Blue background for total
    this.doc.roundedRect(labelX - 3, lineY - 4, boxWidth - 10, 12, 2, 2, "F");

    this.doc.setTextColor(255, 255, 255); // White text
    this.doc.setFontSize(12);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("TOTAL:", labelX, lineY + 3);
    this.doc.text(formatCurrency(billData.total), valueX - 3, lineY + 3, {
      align: "right",
    });
    lineY += 12;

    // Payment info
    if (billData.amountReceived && billData.changeAmount !== undefined) {
      this.doc.setTextColor(0, 0, 0);
      this.doc.setFontSize(9);
      this.doc.setFont("helvetica", "normal");
      lineY += 4;
      this.doc.text(
        `Received: ${formatCurrency(billData.amountReceived)}`,
        labelX,
        lineY,
      );
      lineY += 4;
      this.doc.text(
        `Change: ${formatCurrency(billData.changeAmount)}`,
        labelX,
        lineY,
      );
    }

    // Payment method box - more compact
    this.yPosition = Math.max(this.yPosition, top + summaryHeight + 5); // Reduced from 8

    this.doc.setFillColor(5, 150, 105); // Green background
    this.doc.roundedRect(left, this.yPosition, boxWidth, 8, 2, 2, "F"); // Reduced from 10

    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(9); // Reduced from 10
    this.doc.setFont("helvetica", "bold");
    this.doc.text(
      `Payment Mode: ${billData.paymentMethod}`,
      left + boxWidth / 2,
      this.yPosition + 6, // Reduced from 7
      { align: "center" },
    );

    this.yPosition += 12; // Reduced from 18

    // Amount in words with better styling
    this.doc.setTextColor(0, 0, 0);
    this.doc.setFillColor(248, 250, 252);
    this.doc.roundedRect(
      15,
      this.yPosition,
      this.pageWidth - 30,
      12,
      2,
      2,
      "F",
    );

    this.doc.setDrawColor(226, 232, 240);
    this.doc.setLineWidth(0.3);
    this.doc.roundedRect(
      15,
      this.yPosition,
      this.pageWidth - 30,
      12,
      2,
      2,
      "S",
    );

    const words = this.convertAmountToWords(Math.round(billData.total));
    this.doc.setFontSize(10); // Increased from 9
    this.doc.setFont("helvetica", "bold");
    this.doc.text(`Amount in Words: `, 20, this.yPosition + 8);
    this.doc.setFont("helvetica", "normal");
    this.doc.text(`${words} Rupees Only`, 75, this.yPosition + 8); // Better positioning

    this.yPosition += 15; // Improved spacing for better layout
  }

  private convertAmountToWords(amount: number): string {
    const a = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];
    const b = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];

    const inWords = (num: number): string => {
      if (num === 0) return "Zero";
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
      if (rest)
        parts.push(
          rest < 20
            ? a[rest]
            : `${b[Math.floor(rest / 10)]}${rest % 10 ? " " + a[rest % 10] : ""}`,
        );
      return parts.join(" ");
    };

    return inWords(amount);
  }

  private addFooter(company: Company): void {
    // Start footer immediately after summary with minimal spacing
    this.yPosition += 3; // Minimal spacing instead of 10

    // Terms and conditions section - more compact
    this.doc.setFillColor(248, 250, 252); // Light background
    this.doc.roundedRect(
      15,
      this.yPosition,
      this.pageWidth - 35,
      20, // Reduced from 30
      2,
      2,
      "F",
    );

    this.doc.setDrawColor(226, 232, 240);
    this.doc.setLineWidth(0.3);
    this.doc.roundedRect(
      15,
      this.yPosition,
      this.pageWidth - 30,
      20, // Reduced from 30
      2,
      2,
      "S",
    );

    this.doc.setTextColor(0, 0, 0);
    this.doc.setFontSize(10); // Increased for better readability
    this.doc.setFont("helvetica", "bold");
    this.doc.text("TERMS & CONDITIONS:", 20, this.yPosition + 7);

    this.doc.setFontSize(8); // Increased from 7 for better readability
    this.doc.setFont("helvetica", "normal");

    const terms = [
      "• All goods sold are subject to our standard terms and conditions.",
      "• Payment is due immediately unless other arrangements have been made.",
      "• Returns are accepted within 7 days with original receipt and in original condition.",
      "• Prices are inclusive of GST. • This invoice is computer generated and does not require signature.",
    ];

    const maxTermWidth = this.pageWidth - 50; // Leave margin for box boundaries
    let termY = this.yPosition + 12; // Reduced from 14

    terms.forEach((term) => {
      let termText = term;
      // Wrap long terms to fit within box
      if (this.doc.getTextWidth(termText) > maxTermWidth) {
        // Split into multiple lines if too long
        const words = termText.split(" ");
        let line = "";

        for (const word of words) {
          const testLine = line + (line ? " " : "") + word;
          if (this.doc.getTextWidth(testLine) > maxTermWidth && line) {
            this.doc.text(line, 20, termY);
            termY += 3; // Reduced from 4
            line = word;
          } else {
            line = testLine;
          }
        }

        if (line) {
          this.doc.text(line, 20, termY);
          termY += 3; // Reduced from 4
        }
      } else {
        this.doc.text(termText, 20, termY);
        termY += 3; // Reduced from 4
      }
    });

    this.yPosition += 25; // Reduced from 38

    // Thank you section with styled background - more compact
    this.doc.setFillColor(5, 150, 105); // Green background
    this.doc.roundedRect(
      15,
      this.yPosition,
      this.pageWidth - 30,
      12, // Reduced from 15
      3,
      3,
      "F",
    );

    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(12);
    this.doc.setFont("helvetica", "bold");
    this.doc.text(
      "Thank You for Your Business!",
      this.pageWidth / 2,
      this.yPosition + 8,
      { align: "center" },
    );

    this.yPosition += 15; // Reduced from 18

    // Digital signature and timestamp
    this.doc.setTextColor(100, 116, 139); // Gray text
    this.doc.setFontSize(9); // Increased from 8 for better readability
    this.doc.setFont("helvetica", "normal");

    const timestamp = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    this.doc.text(
      "This is a computer generated invoice.",
      this.pageWidth / 2,
      this.yPosition,
      { align: "center" },
    );
    this.doc.text(
      `Generated on: ${timestamp} IST`,
      this.pageWidth / 2,
      this.yPosition + 4,
      { align: "center" },
    );

    // Footer border line
    this.doc.setDrawColor(37, 99, 235);
    this.doc.setLineWidth(2);
    this.doc.line(
      15,
      this.pageHeight - 5,
      this.pageWidth - 15,
      this.pageHeight - 5,
    );
  }
}

// Utility function to create bill data from cart
export function createBillData(
  cartItems: any[],
  customer: any,
  discount: number = 0,
  taxRate: number = 18,
  paymentMethod: string = "Cash",
  amountReceived?: number,
): BillData {
  // Validate and format cart items
  const items: BillItem[] = cartItems.map((item) => ({
    name: item.name || "Unknown Product",
    quantity: Number(item.quantity) || 1,
    price: Number(item.price) || 0,
    total: (Number(item.price) || 0) * (Number(item.quantity) || 1),
    hsnCode: item.hsnCode || "8517", // Default HSN code for electronics
  }));

  // Calculate totals with proper rounding
  const subtotal =
    Math.round(items.reduce((sum, item) => sum + item.total, 0) * 100) / 100;
  const discountAmount = Math.round(((subtotal * discount) / 100) * 100) / 100;
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = Math.round(((taxableAmount * taxRate) / 100) * 100) / 100;
  const total = Math.round((taxableAmount + taxAmount) * 100) / 100;

  // Calculate change if amount received is provided
  const changeAmount = amountReceived
    ? Math.round((amountReceived - total) * 100) / 100
    : undefined;

  // Generate professional bill number
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const time = String(now.getTime()).slice(-4);
  const billNumber = `INV-${year}${month}${day}-${time}`;

  return {
    billNumber,
    date: now.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "2-digit",
    }),
    customer: customer || {
      name: "Walk-in Customer",
      phone: "N/A",
      email: undefined,
      address: undefined,
      gstNumber: undefined,
    },
    items,
    subtotal,
    discount,
    taxRate,
    taxAmount,
    total,
    paymentMethod,
    amountReceived,
    changeAmount,
  };
}
