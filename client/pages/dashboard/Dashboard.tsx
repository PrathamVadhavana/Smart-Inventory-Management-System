import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SalesTrendChart, TopProductsChart, StockCategoryChart } from "@/components/Charts";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import EnhancedProductDialog from "@/components/EnhancedProductDialog";
import MigrationDialog from "@/components/MigrationDialog";
import { useProducts, useCustomers, useOrders, useActivities } from "@/hooks/useSupabase";
import {
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Users,
  Plus,
  ScanLine,
  FileText,
  ShoppingCart,
  Trash2,
  Database,
} from "lucide-react";

const recentActivities = [
  { id: 1, action: "New sale completed", amount: "₹2,350", time: "2 min ago" },
  { id: 2, action: "Product added to inventory", item: "iPhone 15 Pro", time: "5 min ago" },
  { id: 3, action: "Low stock alert", item: "Samsung Galaxy S24", time: "10 min ago" },
  { id: 4, action: "Customer registered", customer: "John Doe", time: "15 min ago" },
  { id: 5, action: "Bulk import completed", count: "150 products", time: "1 hour ago" },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { products, addProduct, deleteProduct } = useProducts();
  const { customers } = useCustomers();
  const { orders } = useOrders();
  const { activities } = useActivities();

  const [salesTrend, setSalesTrend] = useState<{ date: string; sales: number }[]>([]);
  const [topProducts, setTopProducts] = useState<{ name: string; sales: number }[]>([]);
  const [stockByCategory, setStockByCategory] = useState<{ name: string; value: number }[]>([]);
  const [kpis, setKpis] = useState({
    totalProducts: 0,
    lowStock: 0,
    todaysSales: 0,
    activeCustomers: 0,
  });

  const [previousKpis, setPreviousKpis] = useState({
    totalProducts: 0,
    lowStock: 0,
    todaysSales: 0,
    activeCustomers: 0,
  });

  const recompute = () => {
    try {
      // Build Sales Trend (sum totals per day, last 30 days)
      const byDay: Record<string, number> = {};
      const today = new Date();
      for (let i = 29; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        byDay[key] = 0;
      }
      orders.forEach((o: any) => {
        const key = new Date(o.created_at).toISOString().slice(0, 10);
        if (byDay[key] !== undefined) byDay[key] += o.total || 0;
      });
      setSalesTrend(Object.entries(byDay).map(([key, val]) => ({ date: new Date(key).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), sales: Math.round(val) })));

      // Top Products by quantity sold
      const productSales: Record<string, number> = {};
      orders.forEach((o: any) => {
        (o.items || []).forEach((it: any) => {
          productSales[it.product_name] = (productSales[it.product_name] || 0) + (it.quantity || 1);
        });
      });
      const top = Object.entries(productSales)
        .map(([name, qty]) => ({ name, sales: qty as number }))
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 10);
      setTopProducts(top);

      // Stock by category from products
      const categoryCount: Record<string, number> = {};
      products.forEach((p: any) => {
        const cat = p.category || 'Uncategorized';
        categoryCount[cat] = (categoryCount[cat] || 0) + 1;
      });
      setStockByCategory(Object.entries(categoryCount).map(([name, value]) => ({ name, value })));

      // KPIs
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const todaysSales = orders
        .filter((o: any) => new Date(o.created_at) >= startOfToday)
        .reduce((sum: number, o: any) => sum + (o.total || 0), 0);

      // Calculate yesterday's sales for comparison
      const startOfYesterday = new Date(startOfToday);
      startOfYesterday.setDate(startOfToday.getDate() - 1);
      const endOfYesterday = new Date(startOfYesterday);
      endOfYesterday.setHours(23, 59, 59, 999);
      const yesterdaysSales = orders
        .filter((o: any) => {
          const orderDate = new Date(o.created_at);
          return orderDate >= startOfYesterday && orderDate <= endOfYesterday;
        })
        .reduce((sum: number, o: any) => sum + (o.total || 0), 0);

      // Show total customers saved in database
      const activeCustomers = customers.length;
      const lowStock = products.filter((p: any) => p.track_inventory && p.current_stock <= p.min_stock).length;

      // Store previous KPIs for comparison
      setPreviousKpis(kpis);

      setKpis({
        totalProducts: products.length,
        lowStock,
        todaysSales,
        activeCustomers,
      });
    } catch { }
  };

  // Recompute when data changes
  useEffect(() => {
    recompute();
  }, [products, customers, orders, activities]);

  const handleAddProduct = async (product: any) => {
    try {
      const productData = {
        name: product.name,
        description: product.description || '',
        sku: product.sku || `SKU-${Date.now()}`,
        barcode: product.barcode || '',
        category: product.category || 'Uncategorized',
        unit_price: parseFloat(product.unitPrice || product.price || '0'),
        current_stock: parseInt(product.currentStock || product.stock || '0'),
        min_stock: parseInt(product.minStock || '0'),
        track_inventory: product.trackInventory !== false,
        images: product.images || [],
        hsn_code: product.hsnCode || '8517'
      };

      await addProduct(productData);
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  const handleDeleteProduct = async (id: number | string) => {
    try {
      await deleteProduct(id.toString());
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  // Calculate percentage change
  const calculateChange = (current: number, previous: number): { change: string; trend: 'up' | 'down' | 'neutral' } => {
    if (previous === 0) {
      return current > 0 ? { change: '+100%', trend: 'up' } : { change: '0%', trend: 'neutral' };
    }
    const percentage = ((current - previous) / previous) * 100;
    const rounded = Math.round(percentage);
    if (rounded > 0) {
      return { change: `+${rounded}%`, trend: 'up' };
    } else if (rounded < 0) {
      return { change: `${rounded}%`, trend: 'down' };
    } else {
      return { change: '0%', trend: 'neutral' };
    }
  };

  const kpiData = [
    {
      title: "Total Products",
      value: String(kpis.totalProducts),
      ...calculateChange(kpis.totalProducts, previousKpis.totalProducts),
      icon: Package,
      color: "text-blue-600",
    },
    {
      title: "Low Stock Alerts",
      value: String(kpis.lowStock),
      ...calculateChange(kpis.lowStock, previousKpis.lowStock),
      icon: AlertTriangle,
      color: "text-red-600",
    },
    {
      title: "Today's Sales",
      value: `₹${kpis.todaysSales.toLocaleString()}`,
      ...calculateChange(kpis.todaysSales, previousKpis.todaysSales),
      icon: TrendingUp,
      color: "text-green-600",
    },
    {
      title: "Active Customers",
      value: String(kpis.activeCustomers),
      ...calculateChange(kpis.activeCustomers, previousKpis.activeCustomers),
      icon: Users,
      color: "text-purple-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your inventory today.
          </p>
        </div>
        <div className="flex space-x-3">
          <EnhancedProductDialog
            trigger={
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            }
            onSave={handleAddProduct}
          />
          <MigrationDialog>
            <Button variant="outline">
              <Database className="w-4 h-4 mr-2" />
              Migrate to Supabase
            </Button>
          </MigrationDialog>
          <Button variant="outline" onClick={recompute}>Refresh</Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.title} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{kpi.title}</p>
                    <p className="text-2xl font-bold">{kpi.value}</p>
                    <p className={`text-sm ${kpi.trend === 'up' ? 'text-green-600' : kpi.trend === 'down' ? 'text-red-600' : 'text-muted-foreground'} flex items-center mt-1`}>
                      {kpi.trend === 'up' ? (
                        <TrendingUp className="w-3 h-3 mr-1" />
                      ) : kpi.trend === 'down' ? (
                        <TrendingDown className="w-3 h-3 mr-1" />
                      ) : (
                        <TrendingUp className="w-3 h-3 mr-1" />
                      )}
                      {kpi.change} from yesterday
                    </p>
                  </div>
                  <div className={`p-3 rounded-full bg-muted ${kpi.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              className="h-20 flex-col space-y-2"
              variant="outline"
              onClick={() => navigate('/dashboard/pos')}
            >
              <ShoppingCart className="w-8 h-8" />
              <span>Start New Sale</span>
            </Button>
            <EnhancedProductDialog
              trigger={
                <Button className="h-20 flex-col space-y-2" variant="outline">
                  <Plus className="w-8 h-8" />
                  <span>Add New Product</span>
                </Button>
              }
              onSave={handleAddProduct}
            />
            <Button
              className="h-20 flex-col space-y-2"
              variant="outline"
              onClick={() => navigate('/dashboard/reports')}
            >
              <FileText className="w-8 h-8" />
              <span>Generate Report</span>
            </Button>
            <Button
              className="h-20 flex-col space-y-2"
              variant="outline"
              onClick={() => navigate('/dashboard/pos')}
            >
              <ScanLine className="w-8 h-8" />
              <span>Scan Barcode</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <div className="lg:col-span-2">
          {salesTrend.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-sm text-muted-foreground">No sales yet. Complete a sale in POS to see trends.</CardContent>
            </Card>
          ) : (
            <SalesTrendChart data={salesTrend} />
          )}
        </div>

        {/* Stock by Category */}
        {stockByCategory.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-sm text-muted-foreground">No categories yet. Add products to see distribution.</CardContent>
          </Card>
        ) : (
          <StockCategoryChart data={stockByCategory} />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products Chart */}
        {topProducts.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-sm text-muted-foreground">No top products yet. Process some sales to populate this chart.</CardContent>
          </Card>
        ) : (
          <TopProductsChart data={topProducts} />
        )}

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(activities.length > 0 ? activities : recentActivities).slice(0, 3).map((activity: any) => (
                <div key={activity.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium">{activity.message || activity.action}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.amount || activity.item || activity.customer || activity.count}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Products Added (by you) */}
      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No products yet. Use "Add Product" to create your first product.
            </div>
          ) : (
            <div className="space-y-4">
              {products.map((product: any) => (
                <div key={product.id} className="flex items-center justify-between py-3 border-b last:border-0">
                  <div className="flex items-center space-x-3">
                    {product.images && product.images[0] ? (
                      <img src={product.images[0]} alt={product.name} className="w-10 h-10 rounded-lg object-cover border" />
                    ) : (
                      <div className="w-10 h-10 bg-muted rounded-lg" />
                    )}
                    <div>
                      <p className="font-medium">{product.name}</p>
                      {product.sku && (
                        <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    {product.unit_price != null && (
                      <div className="text-right">
                        <p className="font-medium">₹{Number(product.unit_price).toLocaleString()}</p>
                      </div>
                    )}
                    <button
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => handleDeleteProduct(product.id)}
                      aria-label="Delete product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
