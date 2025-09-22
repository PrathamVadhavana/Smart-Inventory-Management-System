import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useProducts } from "@/hooks/useSupabase";
import {
  Search,
  Plus,
  Package,
  Grid3X3,
  List,
  Filter,
  ShoppingCart,
  Star,
  Clock,
  Tag,
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  category: string;
  brand: string;
  price: number;
  stock: number;
  image?: string;
  description: string;
  status: 'active' | 'inactive';
}

// Products will be loaded from localStorage
const mockProducts: Product[] = [
  {
    id: "1",
    name: "iPhone 15 Pro",
    sku: "APL-IP15P-128",
    barcode: "1234567890123",
    category: "Electronics",
    brand: "Apple",
    price: 129900,
    stock: 45,
    description: "Latest iPhone with Pro features",
    status: "active",
  },
  {
    id: "2",
    name: "Samsung Galaxy S24",
    sku: "SAM-GS24-256",
    barcode: "2345678901234",
    category: "Electronics",
    brand: "Samsung",
    price: 89999,
    stock: 32,
    description: "Flagship Android smartphone",
    status: "active",
  },
  {
    id: "3",
    name: "MacBook Air M3",
    sku: "APL-MBA-M3-512",
    barcode: "3456789012345",
    category: "Laptops",
    brand: "Apple",
    price: 134900,
    stock: 8,
    description: "Apple Silicon M3 laptop",
    status: "active",
  },
  {
    id: "4",
    name: "AirPods Pro 2nd Gen",
    sku: "APL-APP-2G",
    barcode: "4567890123456",
    category: "Audio",
    brand: "Apple",
    price: 26900,
    stock: 3,
    description: "Wireless earbuds with ANC",
    status: "active",
  },
  {
    id: "5",
    name: "Dell XPS 13",
    sku: "DEL-XPS13-512",
    barcode: "5678901234567",
    category: "Laptops",
    brand: "Dell",
    price: 95999,
    stock: 15,
    description: "Premium ultrabook laptop",
    status: "active",
  },
  {
    id: "6",
    name: "Sony WH-1000XM5",
    sku: "SON-WH1000XM5",
    barcode: "6789012345678",
    category: "Audio",
    brand: "Sony",
    price: 29990,
    stock: 12,
    description: "Noise canceling headphones",
    status: "active",
  },
];

// Static fallbacks; real lists will be built from saved products
const defaultCategories = ["All", "Electronics", "Laptops", "Audio", "Accessories"];
const defaultBrands = ["All", "Apple", "Samsung", "Dell", "Sony", "HP", "Lenovo"];

const recentlyAddedProducts = ["1", "2", "4"]; // Product IDs
const favoriteProducts = ["1", "3", "4"]; // Product IDs

interface ProductSearchDialogProps {
  trigger?: React.ReactNode;
  onAddToCart?: (product: Product, quantity: number) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function ProductSearchDialog({
  trigger,
  onAddToCart,
  open,
  onOpenChange
}: ProductSearchDialogProps) {
  const { products } = useProducts();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<string[]>(defaultCategories);
  const [brandOptions, setBrandOptions] = useState<string[]>(defaultBrands);

  const isDialogOpen = open !== undefined ? open : dialogOpen;
  const setIsDialogOpen = onOpenChange || setDialogOpen;

  // Load products from Supabase and build dynamic filters
  useEffect(() => {
    try {
      const mapped: Product[] = products.map((p: any, idx: number) => ({
        id: String(p.id ?? `supabase-${idx}`),
        name: p.name || '',
        sku: p.sku || '',
        barcode: p.barcode || '',
        category: p.category || 'Uncategorized',
        brand: p.brand || 'Unknown',
        price: Number(p.unit_price || 0),
        stock: Number(p.current_stock || 0),
        image: p.images?.[0],
        description: p.description || '',
        status: 'active' as const,
      }));
      setAllProducts(mapped);
      // Build unique categories/brands
      const cats = Array.from(new Set(['All', ...mapped.map(p => p.category).filter(Boolean)])).slice(0, 200);
      const brs = Array.from(new Set(['All', ...mapped.map(p => p.brand).filter(Boolean)])).slice(0, 200);
      setCategoryOptions(cats);
      setBrandOptions(brs);
    } catch {
      setAllProducts([]);
      setCategoryOptions(['All']);
      setBrandOptions(['All']);
    }
  }, [products]);

  const filteredProducts = useMemo(() => allProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barcode.includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    const matchesBrand = selectedBrand === "All" || product.brand === selectedBrand;

    const matchesPrice = (!priceRange.min || product.price >= parseFloat(priceRange.min)) &&
      (!priceRange.max || product.price <= parseFloat(priceRange.max));

    return matchesSearch && matchesCategory && matchesBrand && matchesPrice && product.status === "active";
  }), [allProducts, searchTerm, selectedCategory, selectedBrand, priceRange]);

  const recentProducts = allProducts.filter(p => recentlyAddedProducts.includes(p.id));
  const favoriteProductsList = allProducts.filter(p => favoriteProducts.includes(p.id));

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString()}`;
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { status: "Out of Stock", color: "bg-red-100 text-red-800" };
    if (stock <= 5) return { status: "Low Stock", color: "bg-yellow-100 text-yellow-800" };
    return { status: "In Stock", color: "bg-green-100 text-green-800" };
  };

  const handleAddToCart = (product: Product) => {
    onAddToCart?.(product, quantity);
    setSelectedProduct(null);
    setQuantity(1);
    setIsDialogOpen(false);
  };

  const ProductCard = ({ product }: { product: Product }) => {
    const stockStatus = getStockStatus(product.stock);

    return (
      <div
        className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => setSelectedProduct(product)}
      >
        <div className="space-y-3">
          {/* Product Image */}
          <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
            {product.image ? (
              <img src={product.image} alt={product.name} className="w-full h-full object-cover rounded-lg" />
            ) : (
              <Package className="w-12 h-12 text-muted-foreground" />
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-2">
            <h3 className="font-medium text-sm line-clamp-2">{product.name}</h3>
            <p className="text-xs text-muted-foreground">{product.brand}</p>
            <div className="flex items-center justify-between">
              <span className="font-bold text-primary">{formatCurrency(product.price)}</span>
              <Badge className={`text-xs ${stockStatus.color}`}>
                {stockStatus.status}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">Stock: {product.stock}</p>
          </div>

          {/* Quick Add Button */}
          <Button
            size="sm"
            className="w-full"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedProduct(product);
            }}
            disabled={product.stock === 0}
          >
            <Plus className="w-3 h-3 mr-1" />
            Add to Cart
          </Button>
        </div>
      </div>
    );
  };

  const ProductListItem = ({ product }: { product: Product }) => {
    const stockStatus = getStockStatus(product.stock);

    return (
      <div
        className="flex items-center space-x-4 p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => setSelectedProduct(product)}
      >
        <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
          {product.image ? (
            <img src={product.image} alt={product.name} className="w-full h-full object-cover rounded-lg" />
          ) : (
            <Package className="w-8 h-8 text-muted-foreground" />
          )}
        </div>

        <div className="flex-1 space-y-1">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-medium">{product.name}</h3>
              <p className="text-sm text-muted-foreground">{product.brand} • {product.sku}</p>
              <p className="text-xs text-muted-foreground line-clamp-1">{product.description}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-primary">{formatCurrency(product.price)}</p>
              <Badge className={`text-xs ${stockStatus.color}`}>
                {stockStatus.status}
              </Badge>
              <p className="text-xs text-muted-foreground mt-1">Stock: {product.stock}</p>
            </div>
          </div>
        </div>

        <Button
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedProduct(product);
          }}
          disabled={product.stock === 0}
        >
          <Plus className="w-3 h-3 mr-1" />
          Add
        </Button>
      </div>
    );
  };

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        {trigger && (
          <DialogTrigger asChild>
            {trigger}
          </DialogTrigger>
        )}
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Search className="w-5 h-5 mr-2" />
              Browse Products
            </DialogTitle>
            <DialogDescription>
              Search and add products to your cart manually
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col space-y-4">
            {/* Search and Filters */}
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products by name, SKU, or barcode..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex gap-4">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {brandOptions.map((brand) => (
                      <SelectItem key={brand} value={brand}>
                        {brand}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Min price"
                    type="number"
                    className="w-24"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                  />
                  <span>-</span>
                  <Input
                    placeholder="Max price"
                    type="number"
                    className="w-24"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Quick Access Tabs */}
            <Tabs defaultValue="all" className="flex-1 flex flex-col">
              <TabsList>
                <TabsTrigger value="all">All Products ({filteredProducts.length})</TabsTrigger>
                <TabsTrigger value="recent">
                  <Clock className="w-3 h-3 mr-1" />
                  Recent ({recentProducts.length})
                </TabsTrigger>
                <TabsTrigger value="favorites">
                  <Star className="w-3 h-3 mr-1" />
                  Favorites ({favoriteProductsList.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="flex-1 overflow-auto">
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredProducts.map((product) => (
                      <ProductListItem key={product.id} product={product} />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="recent" className="flex-1 overflow-auto">
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {recentProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentProducts.map((product) => (
                      <ProductListItem key={product.id} product={product} />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="favorites" className="flex-1 overflow-auto">
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {favoriteProductsList.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {favoriteProductsList.map((product) => (
                      <ProductListItem key={product.id} product={product} />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      {/* Product Detail Dialog */}
      <Dialog open={!!selectedProduct} onOpenChange={(open) => !open && setSelectedProduct(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add to Cart</DialogTitle>
            <DialogDescription>
              Configure quantity for {selectedProduct?.name}
            </DialogDescription>
          </DialogHeader>

          {selectedProduct && (
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center">
                  <Package className="w-10 h-10 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{selectedProduct.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedProduct.brand}</p>
                  <p className="text-sm text-muted-foreground">{selectedProduct.description}</p>
                  <p className="font-bold text-primary mt-2">{formatCurrency(selectedProduct.price)}</p>
                  <Badge className={`text-xs mt-1 ${getStockStatus(selectedProduct.stock).color}`}>
                    Stock: {selectedProduct.stock}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    -
                  </Button>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    max={selectedProduct.stock}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.min(selectedProduct.stock, Math.max(1, parseInt(e.target.value) || 1)))}
                    className="w-20 text-center"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.min(selectedProduct.stock, quantity + 1))}
                  >
                    +
                  </Button>
                </div>
              </div>

              <div className="p-3 bg-muted rounded-lg">
                <div className="flex justify-between">
                  <span>Total:</span>
                  <span className="font-bold">{formatCurrency(selectedProduct.price * quantity)}</span>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => setSelectedProduct(null)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={() => handleAddToCart(selectedProduct)} className="flex-1">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Add to Cart
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
