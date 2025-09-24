import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Download,
  FileText,
  FileSpreadsheet,
  FileImage,
  ChevronDown,
} from "lucide-react";
import {
  exportToCSV,
  exportToExcel,
  exportToPDF,
  ExportOptions,
} from "@/lib/exportUtils";
import { toast } from "@/components/ui/use-toast";

interface ExportDropdownProps {
  data: any[];
  options: Omit<ExportOptions, 'data'>;
  disabled?: boolean;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
}

export default function ExportDropdown({
  data,
  options,
  disabled = false,
  variant = "outline",
  size = "default"
}: ExportDropdownProps) {
  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    try {
      const exportOptions: ExportOptions = {
        ...options,
        data,
      };
      if (!data || data.length === 0) return;

      switch (format) {
        case 'csv':
          exportToCSV(exportOptions);
          break;
        case 'excel':
          exportToExcel(exportOptions);
          break;
        case 'pdf':
          exportToPDF(exportOptions);
          break;
      }
    } catch (err) {
      console.error('Export failed:', err);
      toast({
        title: "Export Failed",
        description: "Export failed. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} disabled={disabled || data.length === 0}>
          <Download className="w-4 h-4 mr-2" />
          Export
          <ChevronDown className="w-4 h-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Export Format</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleExport('csv')}>
          <FileText className="w-4 h-4 mr-2" />
          CSV File
          <span className="ml-auto text-xs text-muted-foreground">(.csv)</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('excel')}>
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          Excel File
          <span className="ml-auto text-xs text-muted-foreground">(.xlsx)</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('pdf')}>
          <FileImage className="w-4 h-4 mr-2" />
          PDF File
          <span className="ml-auto text-xs text-muted-foreground">(.pdf)</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
