import { useMemo, useRef, useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Plus,
  Upload,
  X,
  Copy,
  ScanLine,
  Save,
  Calculator,
} from "lucide-react";

interface Product {
  id?: string;
  name: string;
  description: string;
  shortDescription: string;
  sku: string;
  barcode: string;
  category: string;
  subcategory: string;
  brand: string;
  unitPrice: number;
  costPrice: number;
  profitMargin: number;
  currentStock: number;
  minStock: number;
  maxStock: number;
  reorderQuantity: number;
  supplier: string;
  alternativeSuppliers: string[];
  unitOfMeasurement: string;
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  images: string[];
  status: "active" | "inactive" | "discontinued";
  trackInventory: boolean;
  warrantyPeriod: number;
  hsnCode: string;
  taxCategory: string;
  tags: string[];
}

const defaultCategories = [
  // Core electronics
  "Electronics",
  "Mobile",
  "Laptops",
  "Tablets",
  "Audio",
  "Accessories",
  "Cameras",
  "Televisions",
  "Wearables",
  "Gaming",
  "Networking",
  "Computer Components",
  // Appliances
  "Home Appliances",
  "Kitchen Appliances",
  "Air Conditioners",
  "Refrigerators",
  "Washing Machines",
  // Retail general
  "Grocery",
  "Fashion",
  "Footwear",
  "Beauty & Personal Care",
  "Sports & Fitness",
  "Automotive",
  "Tools & Hardware",
  "Books & Stationery",
  "Toys & Baby",
  "Home & Furniture",
  "Pet Supplies",
  "Garden & Outdoors",
  "Health & Wellness",
  "Watches",
  "Jewelry",
  "Bags & Luggage",
  "Office Supplies",
];

const subcategories: Record<string, string[]> = {
  Electronics: [
    "Smartphones",
    "Feature Phones",
    "Smartwatches",
    "Tablets",
    "Cameras",
    "TVs",
  ],
  Mobile: ["Android", "iPhone", "Feature Phones"],
  Laptops: ["Gaming Laptops", "Business Laptops", "Ultrabooks", "2-in-1"],
  Tablets: ["iPad", "Android Tablets", "Windows Tablets"],
  Audio: ["Headphones", "Earbuds", "Speakers", "Soundbars"],
  Accessories: [
    "Cases & Covers",
    "Chargers",
    "Cables",
    "Power Banks",
    "Screen Protectors",
  ],
  Cameras: ["DSLR", "Mirrorless", "Point & Shoot", "Action Cameras"],
  Televisions: ["LED", "OLED", "QLED", "Smart TV"],
  Wearables: ["Smart Bands", "Smartwatches"],
  Gaming: ["Consoles", "Controllers", "Games", "Gaming Chairs"],
  Networking: ["Routers", "Range Extenders", "Switches", "Modems"],
  "Computer Components": ["RAM", "Storage", "Motherboards", "GPUs", "PSU"],
  "Home Appliances": ["Air Purifiers", "Vacuum Cleaners", "Fans"],
  "Kitchen Appliances": [
    "Microwaves",
    "Mixer Grinders",
    "Toasters",
    "Cooktops",
  ],
  "Air Conditioners": ["Split AC", "Window AC", "Portable AC"],
  Refrigerators: ["Single Door", "Double Door", "Side-by-Side"],
  "Washing Machines": ["Front Load", "Top Load", "Semi Automatic"],
  Fashion: ["Men", "Women", "Kids"],
  Footwear: ["Sports Shoes", "Casual Shoes", "Sandals"],
  "Beauty & Personal Care": ["Skin Care", "Hair Care", "Fragrances"],
  "Sports & Fitness": ["Gym Equipment", "Sportswear", "Accessories"],
  Automotive: ["Car Accessories", "Bike Accessories", "Oils & Fluids"],
  "Tools & Hardware": ["Hand Tools", "Power Tools", "Safety"],
  "Books & Stationery": ["Books", "Notebooks", "Art Supplies"],
  "Toys & Baby": ["Toys", "Baby Care", "Strollers"],
  "Home & Furniture": ["Decor", "Bedding", "Furniture"],
  "Pet Supplies": ["Food", "Grooming", "Toys"],
  "Garden & Outdoors": ["Plants", "Gardening Tools", "Outdoor Furniture"],
  "Health & Wellness": ["Supplements", "Medical Devices"],
  Watches: ["Analog", "Digital", "Smart"],
  Jewelry: ["Gold", "Silver", "Fashion Jewelry"],
  "Bags & Luggage": ["Backpacks", "Suitcases", "Handbags"],
  "Office Supplies": ["Printers", "Paper", "Organization"],
};

const defaultBrands = [
  // Mobile & Electronics
  "Apple",
  "Samsung",
  "Xiaomi",
  "OnePlus",
  "Realme",
  "Vivo",
  "Oppo",
  "Motorola",
  "Nokia",
  "Google",
  // PCs & Components
  "Dell",
  "HP",
  "Lenovo",
  "Asus",
  "Acer",
  "MSI",
  "Gigabyte",
  "Intel",
  "AMD",
  // Audio
  "Sony",
  "LG",
  "Bose",
  "JBL",
  "boAt",
  "Sennheiser",
  "Philips",
  "Nothing",
  // Storage & Accessories
  "Seagate",
  "Western Digital",
  "SanDisk",
  "Kingston",
  "Transcend",
  "Logitech",
  "Razer",
  "Corsair",
  // Networking & Cameras
  "TP-Link",
  "D-Link",
  "Canon",
  "Nikon",
  "Panasonic",
  // Appliances
  "Whirlpool",
  "IFB",
  "Bosch",
  "Haier",
  "Voltas",
  "Godrej",
];

const suppliers = [
  "Apple Inc.",
  "Samsung",
  "Dell Technologies",
  "HP Inc.",
  "Lenovo",
  "Sony",
  "LG Electronics",
  "Microsoft",
];

const taxCategories = ["GST 0%", "GST 5%", "GST 12%", "GST 18%", "GST 28%"];

const unitsOfMeasurement = [
  "Pieces",
  "Kg",
  "Grams",
  "Liters",
  "Meters",
  "Boxes",
  "Packs",
];

interface EnhancedProductDialogProps {
  trigger?: React.ReactNode;
  product?: Partial<Product>;
  onSave?: (product: Product) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function EnhancedProductDialog({
  trigger,
  product,
  onSave,
  open,
  onOpenChange,
}: EnhancedProductDialogProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState("basic");
  const [formData, setFormData] = useState<Product>({
    id: (product as any)?.id,
    name: product?.name || "",
    description: product?.description || "",
    shortDescription: product?.shortDescription || "",
    sku: product?.sku || "",
    barcode: product?.barcode || "",
    category: product?.category || "",
    subcategory: product?.subcategory || "",
    brand: product?.brand || "",
    unitPrice: product?.unitPrice || 0,
    costPrice: product?.costPrice || 0,
    profitMargin: product?.profitMargin || 0,
    currentStock: product?.currentStock || 0,
    minStock: product?.minStock || 0,
    maxStock: product?.maxStock || 0,
    reorderQuantity: product?.reorderQuantity || 0,
    supplier: product?.supplier || "",
    alternativeSuppliers: product?.alternativeSuppliers || [],
    unitOfMeasurement: product?.unitOfMeasurement || "Pieces",
    weight: product?.weight || 0,
    dimensions: product?.dimensions || { length: 0, width: 0, height: 0 },
    images: product?.images || [],
    status: product?.status || "active",
    trackInventory: product?.trackInventory !== false,
    warrantyPeriod: product?.warrantyPeriod || 0,
    hsnCode: product?.hsnCode || "",
    taxCategory: product?.taxCategory || "GST 18%",
    tags: product?.tags || [],
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const allCategories = useMemo(() => {
    try {
      const saved = localStorage.getItem("dashboard_products");
      const savedProducts = saved ? JSON.parse(saved) : [];
      const fromProducts = Array.from(
        new Set(
          (savedProducts || [])
            .map((p: any) => p?.category)
            .filter((c: any) => typeof c === "string" && c.trim() !== ""),
        ),
      );
      const fromSubcatKeys = Object.keys(subcategories);
      return Array.from(
        new Set([...defaultCategories, ...fromSubcatKeys, ...fromProducts]),
      );
    } catch {
      return defaultCategories;
    }
  }, []);

  const allBrands = useMemo(() => {
    try {
      const saved = localStorage.getItem("dashboard_products");
      const savedProducts = saved ? JSON.parse(saved) : [];
      const fromProducts = Array.from(
        new Set(
          (savedProducts || [])
            .map((p: any) => p?.brand)
            .filter((b: any) => typeof b === "string" && b.trim() !== ""),
        ),
      );
      return Array.from(new Set([...defaultBrands, ...fromProducts]));
    } catch {
      return defaultBrands;
    }
  }, []);

  const loadFilesAsDataUrls = async (files: FileList): Promise<string[]> => {
    const tasks: Promise<string>[] = [];
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      if (file.size > 10 * 1024 * 1024) return; // 10MB limit
      tasks.push(
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(file);
        }),
      );
    });
    return Promise.all(tasks);
  };

  const handleFilesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    try {
      const dataUrls = await loadFilesAsDataUrls(files);
      if (dataUrls.length === 0) return;
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...dataUrls],
      }));
    } catch {}
  };

  const isDialogOpen = open !== undefined ? open : dialogOpen;
  const setIsDialogOpen = onOpenChange || setDialogOpen;

  const generateSKU = () => {
    const prefix = formData.category.substring(0, 3).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    setFormData({ ...formData, sku: `${prefix}-${random}` });
  };

  const calculateProfitMargin = () => {
    if (formData.costPrice > 0 && formData.unitPrice > 0) {
      const margin =
        ((formData.unitPrice - formData.costPrice) / formData.unitPrice) * 100;
      setFormData({ ...formData, profitMargin: parseFloat(margin.toFixed(2)) });
    }
  };

  const updatePriceFromMargin = () => {
    if (formData.costPrice > 0 && formData.profitMargin > 0) {
      const price = formData.costPrice / (1 - formData.profitMargin / 100);
      setFormData({ ...formData, unitPrice: parseFloat(price.toFixed(2)) });
    }
  };

  const handleSave = () => {
    onSave?.(formData);
    setIsDialogOpen(false);
  };

  const addTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData({ ...formData, tags: [...formData.tags, tag] });
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {product?.id ? "Edit Product" : "Add New Product"}
          </DialogTitle>
          <DialogDescription>
            Fill in the product details across all tabs to create a
            comprehensive product entry.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={currentTab} onValueChange={setCurrentTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="identification">ID & Codes</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter product name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: any) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="discontinued">Discontinued</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter detailed product description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shortDescription">
                Short Description (for receipts)
              </Label>
              <Input
                id="shortDescription"
                placeholder="Brief description for bills"
                value={formData.shortDescription}
                onChange={(e) =>
                  setFormData({ ...formData, shortDescription: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      category: value,
                      subcategory: "",
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {allCategories
                      .filter(
                        (category): category is string =>
                          typeof category === "string",
                      )
                      .map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subcategory">Subcategory</Label>
                <Select
                  value={formData.subcategory}
                  onValueChange={(value) =>
                    setFormData({ ...formData, subcategory: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select subcategory" />
                  </SelectTrigger>
                  <SelectContent>
                    {(subcategories[formData.category] || []).map(
                      (subcategory) => (
                        <SelectItem key={subcategory} value={subcategory}>
                          {subcategory}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="brand">Brand</Label>
                <Select
                  value={formData.brand}
                  onValueChange={(value) =>
                    setFormData({ ...formData, brand: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select brand" />
                  </SelectTrigger>
                  <SelectContent>
                    {allBrands
                      .filter(
                        (brand): brand is string => typeof brand === "string",
                      )
                      .map((brand) => (
                        <SelectItem key={brand} value={brand}>
                          {brand}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="identification" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sku">SKU *</Label>
                <div className="flex gap-2">
                  <Input
                    id="sku"
                    placeholder="Product SKU"
                    value={formData.sku}
                    onChange={(e) =>
                      setFormData({ ...formData, sku: e.target.value })
                    }
                  />
                  <Button type="button" variant="outline" onClick={generateSKU}>
                    Generate
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="barcode">Barcode</Label>
                <div className="flex gap-2">
                  <Input
                    id="barcode"
                    placeholder="Product barcode"
                    value={formData.barcode}
                    onChange={(e) =>
                      setFormData({ ...formData, barcode: e.target.value })
                    }
                  />
                  <Button type="button" variant="outline">
                    <ScanLine className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hsnCode">HSN Code</Label>
                <Input
                  id="hsnCode"
                  placeholder="HSN/SAC Code"
                  value={formData.hsnCode}
                  onChange={(e) =>
                    setFormData({ ...formData, hsnCode: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="taxCategory">Tax Category</Label>
                <Select
                  value={formData.taxCategory}
                  onValueChange={(value) =>
                    setFormData({ ...formData, taxCategory: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {taxCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="pricing" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="costPrice">Cost Price (₹) *</Label>
                <Input
                  id="costPrice"
                  type="number"
                  placeholder="0.00"
                  value={formData.costPrice}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      costPrice: parseFloat(e.target.value) || 0,
                    })
                  }
                  onBlur={calculateProfitMargin}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unitPrice">Selling Price (₹) *</Label>
                <Input
                  id="unitPrice"
                  type="number"
                  placeholder="0.00"
                  value={formData.unitPrice}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      unitPrice: parseFloat(e.target.value) || 0,
                    })
                  }
                  onBlur={calculateProfitMargin}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profitMargin">Profit Margin (%)</Label>
                <div className="flex gap-2">
                  <Input
                    id="profitMargin"
                    type="number"
                    placeholder="0.00"
                    value={formData.profitMargin}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        profitMargin: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={updatePriceFromMargin}
                  >
                    <Calculator className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Cost Price:</span>
                  <div className="font-medium">
                    ₹{formData.costPrice.toLocaleString()}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Selling Price:</span>
                  <div className="font-medium">
                    ₹{formData.unitPrice.toLocaleString()}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Profit:</span>
                  <div className="font-medium text-green-600">
                    ₹
                    {(formData.unitPrice - formData.costPrice).toLocaleString()}{" "}
                    ({formData.profitMargin.toFixed(1)}%)
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="inventory" className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="trackInventory"
                checked={formData.trackInventory}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, trackInventory: checked })
                }
              />
              <Label htmlFor="trackInventory">
                Track inventory for this product
              </Label>
            </div>

            {formData.trackInventory && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentStock">Current Stock *</Label>
                    <Input
                      id="currentStock"
                      type="number"
                      placeholder="0"
                      value={formData.currentStock}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          currentStock: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minStock">Minimum Stock Level *</Label>
                    <Input
                      id="minStock"
                      type="number"
                      placeholder="0"
                      value={formData.minStock}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          minStock: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxStock">Maximum Stock Level</Label>
                    <Input
                      id="maxStock"
                      type="number"
                      placeholder="0"
                      value={formData.maxStock}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          maxStock: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="reorderQuantity">Reorder Quantity</Label>
                    <Input
                      id="reorderQuantity"
                      type="number"
                      placeholder="0"
                      value={formData.reorderQuantity}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          reorderQuantity: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unitOfMeasurement">
                      Unit of Measurement
                    </Label>
                    <Select
                      value={formData.unitOfMeasurement}
                      onValueChange={(value) =>
                        setFormData({ ...formData, unitOfMeasurement: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {unitsOfMeasurement.map((unit) => (
                          <SelectItem key={unit} value={unit}>
                            {unit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="supplier">Primary Supplier</Label>
              <Select
                value={formData.supplier}
                onValueChange={(value) =>
                  setFormData({ ...formData, supplier: value })
                }
              >
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
          </TabsContent>

          <TabsContent value="media" className="space-y-4">
            <div className="space-y-2">
              <Label>Product Images</Label>
              <div
                className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center"
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  await handleFilesSelected(e.dataTransfer.files);
                }}
                onClick={() => fileInputRef.current?.click()}
                role="button"
                aria-label="Upload Product Images"
              >
                <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">
                  Upload Product Images
                </h3>
                <p className="text-muted-foreground mb-4">
                  Drag and drop images here, or click to browse
                </p>
                <Button
                  variant="outline"
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Choose Files
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFilesSelected(e.target.files)}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  PNG, JPG up to 10MB each
                </p>
              </div>
            </div>

            {formData.images.length > 0 && (
              <div className="space-y-2">
                <Label>Uploaded Images</Label>
                <div className="grid grid-cols-4 gap-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`Product ${index + 1}`}
                        className="w-full h-24 object-cover rounded border"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                        onClick={() => {
                          const newImages = formData.images.filter(
                            (_, i) => i !== index,
                          );
                          setFormData({ ...formData, images: newImages });
                        }}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  placeholder="0.0"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      weight: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="warrantyPeriod">Warranty Period (months)</Label>
                <Input
                  id="warrantyPeriod"
                  type="number"
                  placeholder="0"
                  value={formData.warrantyPeriod}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      warrantyPeriod: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Dimensions (cm)</Label>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="length" className="text-sm">
                    Length
                  </Label>
                  <Input
                    id="length"
                    type="number"
                    placeholder="0"
                    value={formData.dimensions.length}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dimensions: {
                          ...formData.dimensions,
                          length: parseFloat(e.target.value) || 0,
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="width" className="text-sm">
                    Width
                  </Label>
                  <Input
                    id="width"
                    type="number"
                    placeholder="0"
                    value={formData.dimensions.width}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dimensions: {
                          ...formData.dimensions,
                          width: parseFloat(e.target.value) || 0,
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="height" className="text-sm">
                    Height
                  </Label>
                  <Input
                    id="height"
                    type="number"
                    placeholder="0"
                    value={formData.dimensions.height}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dimensions: {
                          ...formData.dimensions,
                          height: parseFloat(e.target.value) || 0,
                        },
                      })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Product Tags</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center gap-1"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add tag and press Enter"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const input = e.target as HTMLInputElement;
                      addTag(input.value.trim());
                      input.value = "";
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const input = document.querySelector(
                      'input[placeholder="Add tag and press Enter"]',
                    ) as HTMLInputElement;
                    if (input) {
                      addTag(input.value.trim());
                      input.value = "";
                    }
                  }}
                >
                  Add
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!formData.name || !formData.sku}
          >
            <Save className="w-4 h-4 mr-2" />
            {product?.id ? "Update Product" : "Save Product"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
