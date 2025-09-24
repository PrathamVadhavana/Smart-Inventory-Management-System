import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Upload } from "lucide-react";
import { Supplier } from "@/lib/supabase";

interface ProductDialogProps {
  trigger?: React.ReactNode;
  product?: any;
  onSave?: (product: any) => void;
  suppliers: Supplier[];
}

export default function ProductDialog({ trigger, product, onSave, suppliers }: ProductDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: product?.name || "",
    description: product?.description || "",
    sku: product?.sku || "",
    barcode: product?.barcode || "",
    category: product?.category || "",
    currentStock: product?.currentStock || "",
    minStock: product?.minStock || "",
    costPrice: product?.costPrice || "",
    sellingPrice: product?.sellingPrice || "",
    supplierId: product?.supplier_id || "",
  });

  const handleSave = () => {
    onSave?.(formData);
    setOpen(false);
    // Reset form if adding new product
    if (!product) {
      setFormData({
        name: "",
        description: "",
        sku: "",
        barcode: "",
        category: "",
        currentStock: "",
        minStock: "",
        costPrice: "",
        sellingPrice: "",
        supplierId: "",
      });
    }
  };

  const categories = [
    "Electronics",
    "Laptops",
    "Audio",
    "Accessories",
    "Mobile",
    "Tablets",
    "Wearables",
    "Gaming",
  ];



  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? "Edit Product" : "Add New Product"}</DialogTitle>
          <DialogDescription>
            {product
              ? "Update the product information below."
              : "Fill in the product details to add it to your inventory."
            }
          </DialogDescription>
        </DialogHeader>

          {/* Product Images */}
          <div className="space-y-2">
            <Label>Product Images</Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
              <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Click to upload or drag and drop images
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PNG, JPG up to 10MB
              </p>
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                placeholder="Enter product name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
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

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter product description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          {/* Product Codes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sku">SKU *</Label>
              <Input
                id="sku"
                placeholder="Enter SKU"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="barcode">Barcode</Label>
              <Input
                id="barcode"
                placeholder="Enter or scan barcode"
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
              />
            </div>
          </div>

          {/* Stock Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currentStock">Current Stock *</Label>
              <Input
                id="currentStock"
                type="number"
                placeholder="0"
                value={formData.currentStock}
                onChange={(e) => setFormData({ ...formData, currentStock: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minStock">Minimum Stock Level *</Label>
              <Input
                id="minStock"
                type="number"
                placeholder="0"
                value={formData.minStock}
                onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
              />
            </div>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="costPrice">Cost Price (₹) *</Label>
              <Input
                id="costPrice"
                type="number"
                placeholder="0.00"
                value={formData.costPrice}
                onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sellingPrice">Selling Price (₹) *</Label>
              <Input
                id="sellingPrice"
                type="number"
                placeholder="0.00"
                value={formData.sellingPrice}
                onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
              />
            </div>
          </div>

          {/* Supplier */}
          <div className="space-y-2">
            <Label htmlFor="supplier">Supplier</Label>
            <Select
              // Use the supplierId from state
              value={formData.supplierId}
              // Update the supplierId in state on change
              onValueChange={(value) => setFormData({ ...formData, supplierId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a supplier" />
              </SelectTrigger>
              <SelectContent>
                {/* Map over the suppliers passed in via props */}
                {suppliers.map((supplier) => (
                  // Use the supplier's ID as the key and value
                  <SelectItem key={supplier.id} value={supplier.id}>
                    {supplier.name} {/* Display the supplier's name */}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {product ? "Update Product" : "Add Product"}
            </Button>
          </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
