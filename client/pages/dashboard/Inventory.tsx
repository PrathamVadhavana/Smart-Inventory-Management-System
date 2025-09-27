import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import EnhancedProductDialog from "@/components/EnhancedProductDialog";
import ExportDropdown from "@/components/ExportDropdown";
import AdvancedFilter, {
  productFilters,
  FilterValue,
} from "@/components/AdvancedFilter";
import BulkOperations from "@/components/BulkOperations";
import { Checkbox } from "@/components/ui/checkbox";
import { productColumns } from "@/lib/exportUtils";
import { useProducts, useSuppliers } from "@/hooks/useSupabase";
import {
  Plus,
  Search,
  Filter,
  Download,
  Edit,
  Trash2,
  Eye,
  Package,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Grid3X3,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Product } from "@/lib/supabase";

export default function Inventory() {
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  const { suppliers } = useSuppliers();
  const enrichedProducts = useMemo(() => {
    // Create a fast lookup map of supplier IDs to names
    const supplierMap = new Map(suppliers.map((s) => [s.id, s.name]));

    // Match each product's supplier_id to the map to get the name
    return products.map((product) => ({
      ...product,
      // Priority: 1) Supabase join data, 2) Local supplier lookup, 3) Fallback
      supplierName:
        product.suppliers?.name ||
        supplierMap.get(product.supplier_id) ||
        (typeof (product as any).supplier_name === "string"
          ? (product as any).supplier_name
          : undefined) ||
        (typeof (product as any).supplier === "string"
          ? (product as any).supplier
          : undefined) ||
        (product.supplier_id ? "Loading..." : "N/A"),
    }));
  }, [products, suppliers]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterValues, setFilterValues] = useState<FilterValue>({});
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [summaryData, setSummaryData] = useState({
    totalProducts: 0,
    totalCategories: 0,
    lowStockItems: 0,
    totalValue: 0,
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // View toggle state
  const [activeView, setActiveView] = useState<"table" | "insights">("table");
  const [viewedProduct, setViewedProduct] = useState<Product | null>(null);
  const [isDetailViewOpen, setIsDetailViewOpen] = useState(false);

  // Helper: format currency
  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  // Helper: calculate summary
  const calculateSummary = (products: any[]) => {
    const categories = new Set(
      products.map((p) => p.category || "Uncategorized"),
    );
    const lowStock = products.filter((p) => {
      const currentStock = p.current_stock ?? 0;
      const minStock = p.min_stock ?? 0;
      return (
        (p.track_inventory === true && currentStock <= minStock) ||
        (minStock > 0 && currentStock <= minStock)
      );
    }).length;
    const totalValue = products.reduce((sum, p) => {
      const currentStock = p.current_stock ?? 0;
      const unitPrice = parseFloat(
        (p.unit_price || "0").toString().replace(/₹|,/g, ""),
      );
      return sum + currentStock * unitPrice;
    }, 0);

    return {
      totalProducts: products.length,
      totalCategories: categories.size,
      lowStockItems: lowStock,
      totalValue,
    };
  };

  // Load products from localStorage
  useEffect(() => {
    setSummaryData(calculateSummary(enrichedProducts));
  }, [enrichedProducts]);

  // Filtered products (memoized)
  const filteredProducts = useMemo(() => {
    return enrichedProducts.filter((product) => {
      // --- 1. Text search ---
      const matchesSearch =
        (product.name?.toLowerCase() || "").includes(
          searchTerm.toLowerCase(),
        ) ||
        (product.sku?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (product.barcode || "").includes(searchTerm);

      // --- 2. Advanced filters ---
      const matchesFilters = Object.entries(filterValues).every(
        ([key, value]) => {
          if (
            value === null ||
            value === "" ||
            (Array.isArray(value) && value.length === 0)
          )
            return true;

          switch (key) {
            case "category":
              if (Array.isArray(value)) {
                return value
                  .map((v) => v.toLowerCase())
                  .includes((product.category || "").toLowerCase());
              }
              return (
                (product.category || "").toLowerCase() === value.toLowerCase()
              );

            case "supplier":
              if (Array.isArray(value)) {
                return value.some((v) =>
                  (product.supplierName || "")
                    .toLowerCase()
                    .includes(v.toLowerCase()),
                );
              }
              return (product.supplierName || "")
                .toLowerCase()
                .includes(value.toLowerCase());

            case "priceRange":
              const price = parseFloat(
                (product.unit_price || "0").toString().replace(/₹|,/g, ""),
              );
              if (value.min && price < parseFloat(value.min)) return false;
              if (value.max && price > parseFloat(value.max)) return false;
              return true;

            case "stockStatus":
              const stock = product.current_stock ?? 0;
              const minStock = product.min_stock ?? 0;
              if (value === "in-stock") return stock > minStock;
              if (value === "low-stock") return stock <= minStock && stock > 0;
              if (value === "out-of-stock") return stock === 0;
              return true;

            case "trackInventory":
              return value === (product.track_inventory ?? false);

            case "dateAdded":
              if (!value.from && !value.to) return true;
              const addedDate = new Date(product.updated_at);
              if (value.from && addedDate < new Date(value.from)) return false;
              if (value.to && addedDate > new Date(value.to)) return false;
              return true;

            default:
              return true;
          }
        },
      );

      return matchesSearch && matchesFilters;
    });
  }, [enrichedProducts, searchTerm, filterValues]);

  const getStockStatus = (current: number, min: number) => {
    if (current <= min)
      return { status: "Low Stock", color: "text-red-600 bg-red-50" };
    if (current <= min * 2)
      return { status: "Medium", color: "text-yellow-600 bg-yellow-50" };
    return { status: "In Stock", color: "text-green-600 bg-green-50" };
  };

  const handleSaveProduct = async (productData: any, productId?: string) => {
    try {
      const normalizedSupplierName =
        typeof productData.supplier === "string"
          ? productData.supplier.trim()
          : "";
      const supplierFromId = productData.supplierId
        ? suppliers.find((supplier) => supplier.id === productData.supplierId)
        : null;
      const supplierFromName =
        !supplierFromId && normalizedSupplierName
          ? suppliers.find(
              (supplier) =>
                supplier.name.trim().toLowerCase() ===
                normalizedSupplierName.toLowerCase(),
            )
          : null;
      const resolvedSupplierId =
        supplierFromId?.id ||
        productData.supplierId ||
        supplierFromName?.id ||
        null;
      const resolvedSupplierName =
        supplierFromId?.name ||
        supplierFromName?.name ||
        normalizedSupplierName ||
        null;

      // Prepare the data for saving
      const dataToSave = {
        name: productData.name,
        description: productData.description || "",
        sku: productData.sku || `SKU-${Date.now()}`,
        barcode: productData.barcode || "",
        category: productData.category || "Uncategorized",
        unit_price: parseFloat(
          productData.unitPrice || productData.price || "0",
        ),
        current_stock: parseInt(
          productData.currentStock || productData.stock || "0",
        ),
        min_stock: parseInt(productData.minStock || "0"),
        track_inventory: productData.trackInventory !== false,
        images: productData.images || [],
        hsn_code: productData.hsnCode || "8517",
        supplier_id: resolvedSupplierId,
        supplier_name: resolvedSupplierName,
      };

      // If a productId is provided, it's an update. Otherwise, it's a new product.
      if (productId) {
        await updateProduct(productId, dataToSave);
      } else {
        await addProduct(dataToSave);
      }
    } catch (error) {
      console.error("Error saving product:", error);
      // The toast notification is already handled in your hook, so no need to add one here.
    }
  };

  const handleDeleteProduct = async (id: number | string) => {
    try {
      await deleteProduct(id.toString());
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(filteredProducts.map((p) => p.id.toString()));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSelectProduct = (productId: string, checked: boolean) => {
    if (checked) {
      setSelectedProducts([...selectedProducts, productId]);
    } else {
      setSelectedProducts(selectedProducts.filter((id) => id !== productId));
    }
  };

  const handleBulkEdit = (updates: any) => {
    // Bulk editing products
    setSelectedProducts([]);
  };

  const handleBulkDelete = (ids: string[]) => {
    // Bulk deleting products
    setSelectedProducts([]);
  };

  const handleImport = (data: any[]) => {
    // Importing products
  };

  const selectedProductsData = products.filter((p) =>
    selectedProducts.includes(p.id.toString()),
  );

  // Pagination calculations
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterValues]);

  const formatDate = (dateString: string) => {
    // Return a placeholder if the date is invalid or missing
    if (!dateString) {
      return "N/A";
    }

    const date = new Date(dateString);

    // Check for an invalid date
    if (isNaN(date.getTime())) {
      return "Invalid Date";
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Inventory Management
          </h1>
          <p className="text-muted-foreground">
            Manage your product catalog, stock levels, and supplier information.
          </p>
        </div>
        <div className="flex space-x-3">
          {/* View Toggle */}
          <div className="flex items-center space-x-1 bg-muted p-1 rounded-lg">
            <Button
              variant={activeView === "table" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveView("table")}
            >
              <Grid3X3 className="w-4 h-4 mr-2" />
              Products
            </Button>
            <Button
              variant={activeView === "insights" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveView("insights")}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Insights
            </Button>
          </div>

          <ExportDropdown
            data={filteredProducts}
            options={{
              filename: "inventory_products",
              title: "Product Inventory Report",
              sheetName: "Products",
              columns: productColumns,
            }}
          />
          <EnhancedProductDialog
            trigger={
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            }
            onSave={(productData) => handleSaveProduct(productData)}
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Products</p>
                <p className="text-2xl font-bold">
                  {summaryData.totalProducts}
                </p>
              </div>
              <Package className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Categories</p>
                <p className="text-2xl font-bold">
                  {summaryData.totalCategories}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Low Stock Items</p>
                <p className="text-2xl font-bold text-red-600">
                  {summaryData.lowStockItems}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">
                  ₹{summaryData.totalValue.toLocaleString()}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {activeView === "table" && (
        <>
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, SKU, or barcode..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <AdvancedFilter
                    filters={productFilters}
                    values={filterValues}
                    onChange={setFilterValues}
                    onReset={() => setFilterValues({})}
                  />
                </div>

                {selectedProducts.length > 0 && (
                  <BulkOperations
                    selectedItems={selectedProductsData}
                    onBulkEdit={handleBulkEdit}
                    onBulkDelete={handleBulkDelete}
                    onImport={handleImport}
                  />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Products Table */}
          <Card>
            <CardHeader>
              <CardTitle>Product Catalog</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={
                          selectedProducts.length === filteredProducts.length &&
                          filteredProducts.length > 0
                            ? true
                            : selectedProducts.length > 0
                              ? "indeterminate"
                              : false
                        }
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all products"
                      />
                    </TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU/Barcode</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
                        <div className="flex flex-col items-center space-y-2">
                          <Package className="w-12 h-12 text-muted-foreground" />
                          <p className="text-muted-foreground">
                            No products found
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {searchTerm || Object.keys(filterValues).length > 0
                              ? "Try adjusting your search or filters"
                              : "Add your first product to get started"}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentProducts.map((product) => {
                      const currentStock = product.current_stock ?? 0;
                      const stockStatus = getStockStatus(
                        currentStock,
                        product.min_stock ?? 0,
                      );
                      const isSelected = selectedProducts.includes(
                        product.id.toString(),
                      );
                      return (
                        <TableRow key={product.id}>
                          <TableCell>
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={(checked) =>
                                handleSelectProduct(
                                  product.id.toString(),
                                  checked as boolean,
                                )
                              }
                              aria-label={`Select ${product.name}`}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                                {product.images && product.images.length > 0 ? (
                                  <img
                                    src={product.images[0]}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <Package className="w-6 h-6 text-muted-foreground m-2" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium">{product.name}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-mono text-sm">{product.sku}</p>
                              <p className="text-xs text-muted-foreground">
                                {product.barcode}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>{product.category}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{currentStock}</p>
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${stockStatus.color}`}
                              >
                                {stockStatus.status}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {product.unit_price
                              ? `₹${Number(product.unit_price.toString().replace(/₹|,/g, "")).toLocaleString()}`
                              : "₹0"}
                          </TableCell>
                          <TableCell>{product.supplierName}</TableCell>
                          <TableCell>
                            {formatDate(product.updated_at)}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  // Find the enriched product with supplier name
                                  const enrichedProduct = enrichedProducts.find(
                                    (p) => p.id === product.id,
                                  );
                                  setViewedProduct(enrichedProduct || product);
                                  setIsDetailViewOpen(true);
                                }}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <EnhancedProductDialog
                                product={product}
                                trigger={
                                  <Button variant="ghost" size="sm">
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                }
                                onSave={(productData) =>
                                  handleSaveProduct(productData, product.id)
                                }
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteProduct(product.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {startIndex + 1} to{" "}
                    {Math.min(endIndex, filteredProducts.length)} of{" "}
                    {filteredProducts.length} products
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => (
                          <Button
                            key={page}
                            variant={
                              currentPage === page ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className="w-8 h-8 p-0"
                          >
                            {page}
                          </Button>
                        ),
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {activeView === "insights" && (
        <div className="space-y-6">
          {/* Inventory Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Stock Status Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Stock Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm">In Stock</span>
                    </div>
                    <span className="font-medium">
                      {
                        products.filter(
                          (p) => (p.current_stock ?? 0) > (p.min_stock ?? 0),
                        ).length
                      }
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm">Low Stock</span>
                    </div>
                    <span className="font-medium">
                      {
                        products.filter((p) => {
                          const currentStock = p.current_stock ?? 0;
                          const minStock = p.min_stock ?? 0;
                          return currentStock <= minStock && currentStock > 0;
                        }).length
                      }
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-sm">Out of Stock</span>
                    </div>
                    <span className="font-medium">
                      {
                        products.filter((p) => (p.current_stock ?? 0) === 0)
                          .length
                      }
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Category Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Products by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(() => {
                    const categoryCount: Record<string, number> = {};
                    products.forEach((p) => {
                      const cat = p.category || "Uncategorized";
                      categoryCount[cat] = (categoryCount[cat] || 0) + 1;
                    });
                    return Object.entries(categoryCount).map(
                      ([category, count]) => (
                        <div
                          key={category}
                          className="flex items-center justify-between"
                        >
                          <span className="text-sm">{category}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-muted rounded-full h-2">
                              <div
                                className="bg-primary h-2 rounded-full"
                                style={{
                                  width: `${(count / products.length) * 100}%`,
                                }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">{count}</span>
                          </div>
                        </div>
                      ),
                    );
                  })()}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Products by Value */}
          <Card>
            <CardHeader>
              <CardTitle>Top Products by Inventory Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {products
                  .map((p) => ({
                    name: p.name,
                    value: (p.current_stock ?? 0) * (p.unit_price ?? 0),
                  }))
                  .sort((a, b) => b.value - a.value)
                  .slice(0, 5)
                  .map((product, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </div>
                        <span className="text-sm">{product.name}</span>
                      </div>
                      <span className="font-medium">
                        {formatCurrency(product.value)}
                      </span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Supplier Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Supplier Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(() => {
                  const supplierCount: Record<string, number> = {};
                  enrichedProducts.forEach((p) => {
                    const supplier = p.supplierName || "Unknown";
                    supplierCount[supplier] =
                      (supplierCount[supplier] || 0) + 1;
                  });
                  return Object.entries(supplierCount).map(
                    ([supplier, count]) => (
                      <div
                        key={supplier}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm">{supplier}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-muted rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{
                                width: `${(count / products.length) * 100}%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">
                            {count} products
                          </span>
                        </div>
                      </div>
                    ),
                  );
                })()}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      {viewedProduct && (
        <Dialog open={isDetailViewOpen} onOpenChange={setIsDetailViewOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{viewedProduct.name}</DialogTitle>
              <DialogDescription>SKU: {viewedProduct.sku}</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4 text-sm">
              <div>
                <p className="font-medium text-muted-foreground">Category</p>
                <p>{viewedProduct.category}</p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">Supplier</p>
                <p>{(viewedProduct as any)?.supplierName || "N/A"}</p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">Unit Price</p>
                <p>{formatCurrency(viewedProduct.unit_price)}</p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">
                  Current Stock
                </p>
                <p>{viewedProduct.current_stock} units</p>
              </div>
              <div className="col-span-2">
                <p className="font-medium text-muted-foreground">Description</p>
                <p>
                  {viewedProduct.description || "No description available."}
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
