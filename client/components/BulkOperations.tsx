import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Upload,
  Download,
  CheckCircle,
  AlertTriangle,
  FileSpreadsheet,
} from "lucide-react";

interface BulkOperationsProps {
  selectedItems: any[];
  onBulkEdit?: (updates: any) => void;
  onBulkDelete?: (ids: string[]) => void;
  onImport?: (data: any[]) => void;
  disabled?: boolean;
}

export default function BulkOperations({
  selectedItems,
  onBulkEdit,
  onBulkDelete,
  onImport,
  disabled = false,
}: BulkOperationsProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentOperation, setCurrentOperation] = useState<'edit' | 'delete' | 'import'>('edit');
  const [bulkEditData, setBulkEditData] = useState({
    category: "",
    supplier: "",
    priceAdjustment: "",
    adjustmentType: "percentage", // percentage or fixed
    status: "",
  });
  const [importProgress, setImportProgress] = useState(0);
  const [importing, setImporting] = useState(false);

  const handleBulkEdit = () => {
    if (onBulkEdit) {
      const updates: any = {};
      if (bulkEditData.category) updates.category = bulkEditData.category;
      if (bulkEditData.supplier) updates.supplier = bulkEditData.supplier;
      if (bulkEditData.status) updates.status = bulkEditData.status;

      if (bulkEditData.priceAdjustment) {
        updates.priceAdjustment = {
          value: parseFloat(bulkEditData.priceAdjustment),
          type: bulkEditData.adjustmentType,
        };
      }

      onBulkEdit(updates);
    }
    setDialogOpen(false);
    setBulkEditData({
      category: "",
      supplier: "",
      priceAdjustment: "",
      adjustmentType: "percentage",
      status: "",
    });
  };

  const handleBulkDelete = () => {
    if (onBulkDelete && selectedItems.length > 0) {
      const ids = selectedItems.map(item => item.id);
      onBulkDelete(ids);
    }
    setDialogOpen(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImporting(true);
      setImportProgress(0);

      // Simulate import process
      const interval = setInterval(() => {
        setImportProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setImporting(false);
            // Import data from file
            onImport?.(data);
            setDialogOpen(false);
            return 100;
          }
          return prev + 10;
        });
      }, 200);
    }
  };

  const downloadTemplate = () => {
    const csvContent = `name,sku,barcode,category,brand,unitPrice,costPrice,currentStock,minStock,supplier,description
iPhone 15 Pro,APL-IP15P-128,1234567890123,Electronics,Apple,129900,100000,45,10,Apple Inc.,Latest iPhone with Pro features
Sample Product,SMP-001,9876543210987,Electronics,Brand,999,700,50,5,Supplier Name,Sample product description`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'product_import_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const openDialog = (operation: 'edit' | 'delete' | 'import') => {
    setCurrentOperation(operation);
    setDialogOpen(true);
  };

  return (
    <>
      <div className="flex items-center space-x-2">
        <span className="text-sm text-muted-foreground">
          {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
        </span>

        <Button
          variant="outline"
          size="sm"
          onClick={() => openDialog('edit')}
          disabled={disabled || selectedItems.length === 0}
        >
          <Edit className="w-3 h-3 mr-1" />
          Bulk Edit
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => openDialog('delete')}
          disabled={disabled || selectedItems.length === 0}
        >
          <Trash2 className="w-3 h-3 mr-1" />
          Delete
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => openDialog('import')}
          disabled={disabled}
        >
          <Upload className="w-3 h-3 mr-1" />
          Import
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {currentOperation === 'edit' && 'Bulk Edit Products'}
              {currentOperation === 'delete' && 'Delete Products'}
              {currentOperation === 'import' && 'Import Products'}
            </DialogTitle>
            <DialogDescription>
              {currentOperation === 'edit' && `Apply changes to ${selectedItems.length} selected product${selectedItems.length !== 1 ? 's' : ''}`}
              {currentOperation === 'delete' && `This will permanently delete ${selectedItems.length} product${selectedItems.length !== 1 ? 's' : ''}`}
              {currentOperation === 'import' && 'Import products from CSV or Excel file'}
            </DialogDescription>
          </DialogHeader>

          {currentOperation === 'edit' && (
            <div className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Only fill in the fields you want to update. Empty fields will be ignored.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bulk-category">Category</Label>
                  <Select
                    value={bulkEditData.category}
                    onValueChange={(value) => setBulkEditData({ ...bulkEditData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Don't change</SelectItem>
                      <SelectItem value="Electronics">Electronics</SelectItem>
                      <SelectItem value="Laptops">Laptops</SelectItem>
                      <SelectItem value="Audio">Audio</SelectItem>
                      <SelectItem value="Accessories">Accessories</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bulk-supplier">Supplier</Label>
                  <Select
                    value={bulkEditData.supplier}
                    onValueChange={(value) => setBulkEditData({ ...bulkEditData, supplier: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Don't change</SelectItem>
                      <SelectItem value="Apple Inc.">Apple Inc.</SelectItem>
                      <SelectItem value="Samsung">Samsung</SelectItem>
                      <SelectItem value="Dell Technologies">Dell Technologies</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Price Adjustment</Label>
                <div className="flex gap-2">
                  <Select
                    value={bulkEditData.adjustmentType}
                    onValueChange={(value) => setBulkEditData({ ...bulkEditData, adjustmentType: value })}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">%</SelectItem>
                      <SelectItem value="fixed">₹</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    placeholder={bulkEditData.adjustmentType === 'percentage' ? '10' : '100'}
                    value={bulkEditData.priceAdjustment}
                    onChange={(e) => setBulkEditData({ ...bulkEditData, priceAdjustment: e.target.value })}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {bulkEditData.adjustmentType === 'percentage'
                    ? 'Enter percentage increase (+) or decrease (-)'
                    : 'Enter fixed amount to add (+) or subtract (-)'}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bulk-status">Status</Label>
                <Select
                  value={bulkEditData.status}
                  onValueChange={(value) => setBulkEditData({ ...bulkEditData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Don't change</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="discontinued">Discontinued</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {currentOperation === 'delete' && (
            <div className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  This action cannot be undone. The following products will be permanently deleted:
                </AlertDescription>
              </Alert>

              <div className="max-h-48 overflow-y-auto border rounded p-3">
                {selectedItems.map((item, index) => (
                  <div key={index} className="flex justify-between py-1">
                    <span>{item.name}</span>
                    <span className="text-muted-foreground">{item.sku}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentOperation === 'import' && (
            <div className="space-y-4">
              <Tabs defaultValue="upload">
                <TabsList>
                  <TabsTrigger value="upload">Upload File</TabsTrigger>
                  <TabsTrigger value="template">Download Template</TabsTrigger>
                </TabsList>

                <TabsContent value="upload" className="space-y-4">
                  {importing ? (
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-lg font-medium mb-2">Importing products...</div>
                        <Progress value={importProgress} className="w-full" />
                        <p className="text-sm text-muted-foreground mt-2">{importProgress}% complete</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                        <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-medium mb-2">Upload Product File</h3>
                        <p className="text-muted-foreground mb-4">
                          Select a CSV or Excel file with product data
                        </p>
                        <input
                          type="file"
                          accept=".csv,.xlsx,.xls"
                          onChange={handleFileUpload}
                          className="hidden"
                          id="file-upload"
                        />
                        <Label htmlFor="file-upload" className="cursor-pointer">
                          <Button variant="outline" asChild>
                            <span>
                              <FileSpreadsheet className="w-4 h-4 mr-2" />
                              Choose File
                            </span>
                          </Button>
                        </Label>
                      </div>

                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                          Make sure your file includes columns: name, sku, barcode, category, brand, unitPrice, costPrice, currentStock, minStock, supplier
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="template" className="space-y-4">
                  <div className="text-center space-y-4">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Download Import Template</h3>
                      <p className="text-muted-foreground">
                        Download a sample CSV file with the correct format and sample data
                      </p>
                    </div>

                    <Button onClick={downloadTemplate}>
                      <Download className="w-4 h-4 mr-2" />
                      Download CSV Template
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            {currentOperation === 'edit' && (
              <Button onClick={handleBulkEdit}>
                Apply Changes
              </Button>
            )}
            {currentOperation === 'delete' && (
              <Button variant="destructive" onClick={handleBulkDelete}>
                Delete Products
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
