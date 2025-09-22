import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import BarcodeScanner from "./BarcodeScanner";
import EnhancedProductDialog from "./EnhancedProductDialog";
import {
  ScanLine,
  Plus,
  Package,
  CheckCircle,
  AlertTriangle,
  Search,
  RefreshCw,
  X,
} from "lucide-react";

interface ScannedProduct {
  barcode: string;
  name?: string;
  category?: string;
  brand?: string;
  description?: string;
  estimatedPrice?: number;
  found: boolean;
  existingStock?: number;
}

interface QuickAddProduct {
  barcode: string;
  name: string;
  category: string;
  costPrice: number;
  sellingPrice: number;
  initialStock: number;
  supplier: string;
}

// Product database will be loaded from localStorage
const mockProductDatabase = [];

// Existing products will be loaded from localStorage
const initialExistingProducts = [];

const categories = [
  "Electronics", "Laptops", "Audio", "Accessories", "Mobile", "Tablets"
];

const suppliers = [
  "Apple Inc.", "Samsung", "Dell Technologies", "HP Inc.", "Lenovo"
];

export default function BarcodeProductAdder() {
  const [scannedProducts, setScannedProducts] = useState<ScannedProduct[]>([]);
  const [quickAddDialog, setQuickAddDialog] = useState(false);
  const [currentScanned, setCurrentScanned] = useState<ScannedProduct | null>(null);
  const [quickAddData, setQuickAddData] = useState<QuickAddProduct>({
    barcode: "",
    name: "",
    category: "",
    costPrice: 0,
    sellingPrice: 0,
    initialStock: 0,
    supplier: "",
  });
  const [batchMode, setBatchMode] = useState(false);
  const [enhancedDialogOpen, setEnhancedDialogOpen] = useState(false);
  // FIX: Convert static data into component state to track changes.
  const [inventoryProducts, setInventoryProducts] = useState(initialExistingProducts);

  // FIX: Use an effect to reliably open the dialog when a new product is scanned.
  useEffect(() => {
    // This effect runs only when a new product is scanned in single-item mode.
    if (currentScanned && !batchMode) {
      // FIX: Check against the stateful inventoryProducts, not the old constant.
      const existingProduct = inventoryProducts.find(p => p.barcode === currentScanned.barcode);

      if (existingProduct) {
        // Product exists, prepare data for the "Update Stock" dialog
        setQuickAddData({
          barcode: currentScanned.barcode,
          name: existingProduct.name,
          category: "",
          costPrice: 0,
          sellingPrice: 0,
          initialStock: 1, // Default to adding 1 unit
          supplier: "",
        });
      } else {
        // Product is new, check the mock database for details
        const productInfo = mockProductDatabase.find(p => p.barcode === currentScanned.barcode);
        // Prepare data for the "Quick Add" dialog
        setQuickAddData({
          barcode: currentScanned.barcode,
          name: productInfo?.name || "",
          category: productInfo?.category || "",
          costPrice: productInfo ? productInfo.estimatedPrice * 0.7 : 0,
          sellingPrice: productInfo?.estimatedPrice || 0,
          initialStock: 1,
          supplier: "",
        });
      }
      // Finally, open the dialog
      setQuickAddDialog(true);
    }
  }, [currentScanned, batchMode]);


  const handleBarcodeScanned = (barcode: string) => {
    // Prevent re-scanning the same item if the dialog is already open for it
    if (quickAddDialog && currentScanned?.barcode === barcode) {
      return;
    }

    // FIX: Find if the product exists in the stateful inventory, not the constant.
    const existingProduct = inventoryProducts.find(p => p.barcode === barcode);
    const productInfo = mockProductDatabase.find(p => p.barcode === barcode);

    const scannedProduct: ScannedProduct = {
      barcode,
      name: existingProduct?.name || productInfo?.name,
      found: !!existingProduct,
      existingStock: existingProduct?.stock,
      category: productInfo?.category,
      brand: productInfo?.brand,
      description: productInfo?.description,
      estimatedPrice: productInfo?.estimatedPrice,
    };

    if (batchMode) {
      // In batch mode, add to the queue without opening the dialog
      setScannedProducts(prev => [scannedProduct, ...prev]);
    } else {
      // In single mode, just set the current scanned product. The useEffect will handle the rest.
      setCurrentScanned(scannedProduct);
    }
  };

  const handleQuickAdd = () => {
    // Adding product
    // FIX: Update the inventory state with the new product.
    setInventoryProducts(prev => [
      ...prev,
      {
        barcode: quickAddData.barcode,
        name: quickAddData.name,
        stock: quickAddData.initialStock,
      }
    ]);
    setQuickAddDialog(false);
    setCurrentScanned(null);

    // Reset form
    setQuickAddData({
      barcode: "",
      name: "",
      category: "",
      costPrice: 0,
      sellingPrice: 0,
      initialStock: 0,
      supplier: "",
    });
  };

  const handleUpdateStock = () => {
    if (!currentScanned) return;
    // Updating stock
    // FIX: Update the stock for the correct product in the inventory state.
    setInventoryProducts(prev =>
      prev.map(p =>
        p.barcode === currentScanned.barcode
          ? { ...p, stock: p.stock + quickAddData.initialStock }
          : p
      )
    );
    setQuickAddDialog(false);
    setCurrentScanned(null);
  };

  const openEnhancedDialog = () => {
    setQuickAddDialog(false);
    setEnhancedDialogOpen(true);
  };

  const clearBatch = () => {
    setScannedProducts([]);
  };

  const processBatch = () => {
    // Processing batch
    // In real app, this would process all scanned products
    setScannedProducts([]);
    setBatchMode(false);
  };

  const removeBatchItem = (index: number) => {
    setScannedProducts(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {/* Scanner Interface */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <ScanLine className="w-5 h-5 mr-2" />
              Barcode Product Addition
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Label htmlFor="batch-mode" className="text-sm">Batch Mode</Label>
              <input
                id="batch-mode"
                type="checkbox"
                checked={batchMode}
                onChange={(e) => setBatchMode(e.target.checked)}
                className="rounded"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BarcodeScanner onScan={handleBarcodeScanned} />

            <div className="space-y-4">
              <Alert>
                <Package className="h-4 w-4" />
                <AlertDescription>
                  <strong>How it works:</strong>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                    <li>Scan a barcode to check if product exists</li>
                    <li>If exists: Update stock quantity</li>
                    <li>If new: Add product with quick form or detailed form</li>
                    <li>Use batch mode to scan multiple products at once</li>
                  </ul>
                </AlertDescription>
              </Alert>

              {batchMode && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Batch Queue ({scannedProducts.length})</h4>
                    <div className="space-x-2">
                      <Button variant="outline" size="sm" onClick={clearBatch}>
                        Clear
                      </Button>
                      <Button size="sm" onClick={processBatch} disabled={scannedProducts.length === 0}>
                        Process All
                      </Button>
                    </div>
                  </div>

                  <div className="max-h-48 overflow-y-auto space-y-2 p-1">
                    {scannedProducts.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">Scan items to add them to the batch.</p>
                    )}
                    {scannedProducts.map((product, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-background rounded-md">
                        <div className="flex items-center space-x-3 overflow-hidden">
                          {product.found ? (
                            <RefreshCw className="w-4 h-4 text-green-600 flex-shrink-0" />
                          ) : (
                            <span aria-label="New Product">
                              <Plus className="w-4 h-4 text-blue-600 flex-shrink-0" />
                            </span>
                          )}
                          <div className="overflow-hidden">
                            <p className="font-medium truncate text-sm">
                              {product.name || `Unknown Product`}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {product.barcode}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 flex-shrink-0"
                          onClick={() => removeBatchItem(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Add Dialog */}
      <Dialog open={quickAddDialog} onOpenChange={setQuickAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentScanned?.found ? "Update Stock" : "Quick Add Product"}
            </DialogTitle>
            <DialogDescription>
              {currentScanned?.found
                ? `Update stock quantity for ${currentScanned.name}`
                : "Add this product to your inventory quickly, or use detailed form for more options."
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {currentScanned?.found ? (
              <div className="space-y-4">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Product already exists in inventory with {currentScanned.existingStock} units.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="stock-quantity">Add Quantity</Label>
                  <Input
                    id="stock-quantity"
                    type="number"
                    min="1"
                    value={quickAddData.initialStock}
                    onChange={(e) => setQuickAddData({ ...quickAddData, initialStock: parseInt(e.target.value) || 1 })}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {currentScanned?.name ? (
                  <Alert>
                    <Search className="h-4 w-4" />
                    <AlertDescription>
                      Product information found in database and pre-filled below.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Product not found in database. Please fill in the details.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="product-name">Product Name *</Label>
                    <Input
                      id="product-name"
                      value={quickAddData.name}
                      onChange={(e) => setQuickAddData({ ...quickAddData, name: e.target.value })}
                      placeholder="Enter product name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select value={quickAddData.category} onValueChange={(value) => setQuickAddData({ ...quickAddData, category: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cost-price">Cost Price (₹) *</Label>
                    <Input
                      id="cost-price"
                      type="number"
                      value={quickAddData.costPrice}
                      onChange={(e) => setQuickAddData({ ...quickAddData, costPrice: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="selling-price">Selling Price (₹) *</Label>
                    <Input
                      id="selling-price"
                      type="number"
                      value={quickAddData.sellingPrice}
                      onChange={(e) => setQuickAddData({ ...quickAddData, sellingPrice: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="initial-stock">Initial Stock *</Label>
                    <Input
                      id="initial-stock"
                      type="number"
                      min="0"
                      value={quickAddData.initialStock}
                      onChange={(e) => setQuickAddData({ ...quickAddData, initialStock: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supplier">Supplier</Label>
                    <Select value={quickAddData.supplier} onValueChange={(value) => setQuickAddData({ ...quickAddData, supplier: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.map((supplier) => (
                          <SelectItem key={supplier} value={supplier}>
                            {supplier}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setQuickAddDialog(false)}>
              Cancel
            </Button>
            {!currentScanned?.found && (
              <Button variant="outline" onClick={openEnhancedDialog}>
                Detailed Form
              </Button>
            )}
            <Button
              onClick={currentScanned?.found ? handleUpdateStock : handleQuickAdd}
              disabled={currentScanned?.found ? false : (!quickAddData.name || !quickAddData.category)}
            >
              {currentScanned?.found ? "Update Stock" : "Quick Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Enhanced Product Dialog */}
      <EnhancedProductDialog
        open={enhancedDialogOpen}
        onOpenChange={setEnhancedDialogOpen}
        product={{
          name: quickAddData.name,
          barcode: quickAddData.barcode,
          category: quickAddData.category,
          costPrice: quickAddData.costPrice,
          unitPrice: quickAddData.sellingPrice,
          currentStock: quickAddData.initialStock,
          supplier: quickAddData.supplier,
        }}
        onSave={(product) => {
          // Saving detailed product
          setEnhancedDialogOpen(false);
          setCurrentScanned(null);
        }}
      />
    </div>
  );
}
