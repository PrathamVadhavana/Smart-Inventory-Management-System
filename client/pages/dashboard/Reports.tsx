import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import {
  BarChart3,
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Users,
  ShoppingCart,
} from "lucide-react";
import ExportDropdown from "@/components/ExportDropdown";
import { salesColumns, inventoryColumns } from "@/lib/exportUtils";

// Reports data will be loaded from localStorage
const salesTrendData = [
  { month: "Jan", sales: 450000, profit: 135000, orders: 234 },
  { month: "Feb", sales: 520000, profit: 156000, orders: 287 },
  { month: "Mar", sales: 480000, profit: 144000, orders: 251 },
  { month: "Apr", sales: 610000, profit: 183000, orders: 321 },
  { month: "May", sales: 550000, profit: 165000, orders: 298 },
  { month: "Jun", sales: 670000, profit: 201000, orders: 367 },
];

const topProductsData = [
  { name: "iPhone 15 Pro", sales: 45, revenue: 5835000 },
  { name: "Samsung Galaxy S24", sales: 38, revenue: 3419620 },
  { name: "MacBook Air M3", sales: 25, revenue: 3372500 },
  { name: "iPad Air", sales: 32, revenue: 1920000 },
  { name: "AirPods Pro", sales: 67, revenue: 1802300 },
];

const categoryData = [
  { name: "Smartphones", value: 45, fill: "#3B82F6" },
  { name: "Laptops", value: 25, fill: "#10B981" },
  { name: "Tablets", value: 15, fill: "#F59E0B" },
  { name: "Audio", value: 10, fill: "#EF4444" },
  { name: "Accessories", value: 5, fill: "#8B5CF6" },
];

const inventoryReportData = [
  { product: "iPhone 15 Pro", current: 45, minimum: 10, status: "Good", value: 5835000 },
  { product: "Samsung Galaxy S24", current: 32, minimum: 15, status: "Good", value: 2879680 },
  { product: "MacBook Air M3", current: 8, minimum: 5, status: "Low", value: 1079200 },
  { product: "AirPods Pro", current: 3, minimum: 10, status: "Critical", value: 80700 },
  { product: "iPad Air", current: 25, minimum: 8, status: "Good", value: 1500000 },
];

const customerAnalyticsData = [
  { segment: "VIP Customers", count: 89, revenue: 2340000, avgOrder: 26292 },
  { segment: "Regular Customers", count: 567, revenue: 4567000, avgOrder: 8056 },
  { segment: "New Customers", count: 234, revenue: 1234000, avgOrder: 5274 },
  { segment: "Inactive", count: 456, revenue: 0, avgOrder: 0 },
];

export default function Reports() {
  const [dateRange, setDateRange] = useState("30");
  const [reportType, setReportType] = useState("sales");
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [summaryData, setSummaryData] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    profitMargin: 0,
  });

  const reloadData = () => {
    try {
      // Load orders
      const ordersRaw = localStorage.getItem('pos_orders');
      const ordersData = ordersRaw ? JSON.parse(ordersRaw) : [];
      setOrders(ordersData);

      // Load products
      const productsRaw = localStorage.getItem("dashboard_products");
      const productsData = productsRaw ? JSON.parse(productsRaw) : [];
      setProducts(Array.isArray(productsData) ? productsData : []);

      // Load customers
      const customersRaw = localStorage.getItem('app_customers');
      const customersData = customersRaw ? JSON.parse(customersRaw) : [];
      setCustomers(Array.isArray(customersData) ? customersData : []);

      // Calculate summary data
      const totalRevenue = ordersData.reduce((sum: number, order: any) => sum + (order.total || 0), 0);
      const totalOrders = ordersData.length;
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      const profitMargin = totalRevenue > 0 ? 30.2 : 0; // Simplified calculation

      setSummaryData({
        totalRevenue,
        totalOrders,
        avgOrderValue,
        profitMargin,
      });
    } catch (error) {
      console.error("Failed to load reports data:", error);
    }
  };

  // Load and auto-refresh data
  useEffect(() => {
    reloadData();
    const interval = setInterval(reloadData, 5000);
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'dashboard_products' || e.key === 'pos_orders') reloadData();
    };
    const onFocus = () => reloadData();
    window.addEventListener('storage', onStorage);
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString()}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Good": return "text-green-600 bg-green-50";
      case "Low": return "text-yellow-600 bg-yellow-50";
      case "Critical": return "text-red-600 bg-red-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  // Generate real sales trend data from orders
  const getSalesTrendData = () => {
    const days = parseInt(dateRange);
    const data = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().slice(0, 10);

      const dayOrders = orders.filter(order =>
        order.createdAt && order.createdAt.slice(0, 10) === dateKey
      );

      const sales = dayOrders.reduce((sum, order) => sum + (order.total || 0), 0);
      const profit = sales * 0.3; // Simplified 30% profit margin
      const orderCount = dayOrders.length;

      data.push({
        month: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        sales: Math.round(sales),
        profit: Math.round(profit),
        orders: orderCount,
      });
    }

    return data;
  };

  // Generate top products data from orders
  const getTopProductsData = () => {
    const productSales: Record<string, { sales: number; revenue: number }> = {};

    orders.forEach(order => {
      (order.items || []).forEach((item: any) => {
        const productName = item.name;
        if (!productSales[productName]) {
          productSales[productName] = { sales: 0, revenue: 0 };
        }
        productSales[productName].sales += item.quantity || 1;
        productSales[productName].revenue += (item.price * item.quantity) || 0;
      });
    });

    return Object.entries(productSales)
      .map(([name, data]) => ({ name, sales: data.sales, revenue: data.revenue }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 10);
  };

  // Generate category data from products (include all known categories even if empty)
  const getCategoryData = () => {
    const categoryCount: Record<string, number> = {};
    const knownCategories = [
      'Electronics', 'Mobile', 'Laptops', 'Tablets', 'Audio', 'Accessories', 'Cameras', 'Televisions', 'Wearables', 'Gaming',
      'Networking', 'Computer Components', 'Home Appliances', 'Kitchen Appliances', 'Air Conditioners', 'Refrigerators',
      'Washing Machines', 'Grocery', 'Fashion', 'Footwear', 'Beauty & Personal Care', 'Sports & Fitness', 'Automotive',
      'Tools & Hardware', 'Books & Stationery', 'Toys & Baby', 'Home & Furniture', 'Pet Supplies', 'Garden & Outdoors',
      'Health & Wellness', 'Watches', 'Jewelry', 'Bags & Luggage', 'Office Supplies', 'Uncategorized'
    ];
    // Initialize all to 0
    knownCategories.forEach(cat => { categoryCount[cat] = 0; });
    // Count from products
    products.forEach(product => {
      const category = product.category || 'Uncategorized';
      if (categoryCount[category] == null) categoryCount[category] = 0;
      categoryCount[category] += 1;
    });
    const colors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4"];
    const series = Object.entries(categoryCount).map(([name, value], index) => ({
      name,
      value: Number(value),
      fill: colors[index % colors.length]
    }));
    // Remove zero slices so chart renders meaningful data. If all zero, return empty for fallback.
    const nonZero = series.filter(s => s.value > 0);
    return nonZero.length > 0 ? nonZero : [];
  };

  // Generate inventory report data
  const getInventoryReportData = () => {
    return products.map(product => {
      const currentStock = product.currentStock || product.stock || 0;
      const minStock = product.minStock || 0;
      const unitPrice = parseFloat(product.unitPrice || product.price || '0');
      const value = currentStock * unitPrice;

      let status = "Good";
      if (currentStock <= minStock) status = "Critical";
      else if (currentStock <= minStock * 2) status = "Low";

      return {
        product: product.name,
        current: currentStock,
        minimum: minStock,
        status,
        value: Math.round(value),
      };
    });
  };

  // Build customer segmentation from real customers + orders
  const getCustomerSegmentationData = () => {
    // Map orders per customer
    const idToOrders: Record<string, any[]> = {};
    orders.forEach((o) => {
      const id = o?.customer?.id;
      if (!id) return;
      if (!idToOrders[id]) idToOrders[id] = [];
      idToOrders[id].push(o);
    });

    const days = parseInt(dateRange);
    const since = new Date(); since.setDate(since.getDate() - days);

    const segments = {
      vip: { segment: 'VIP Customers', count: 0, revenue: 0, orders: 0 },
      regular: { segment: 'Regular Customers', count: 0, revenue: 0, orders: 0 },
      newc: { segment: 'New Customers', count: 0, revenue: 0, orders: 0 },
      inactive: { segment: 'Inactive', count: 0, revenue: 0, orders: 0 },
    } as any;

    customers.forEach((c) => {
      const custOrders = (idToOrders[c.id] || []).filter((o) => new Date(o.createdAt) >= since);
      const revenue = custOrders.reduce((s, o) => s + (o.total || 0), 0);
      const orderCount = custOrders.length;
      const isNew = c.joinDate ? new Date(c.joinDate) >= since : false;
      const isVip = (c.loyaltyPoints || 0) >= 1000;

      if (orderCount === 0) {
        segments.inactive.count += 1;
        return;
      }
      if (isVip) {
        segments.vip.count += 1;
        segments.vip.revenue += revenue;
        segments.vip.orders += orderCount;
      } else if (isNew) {
        segments.newc.count += 1;
        segments.newc.revenue += revenue;
        segments.newc.orders += orderCount;
      } else {
        segments.regular.count += 1;
        segments.regular.revenue += revenue;
        segments.regular.orders += orderCount;
      }
    });

    const rows = [segments.vip, segments.regular, segments.newc, segments.inactive].map((s) => ({
      segment: s.segment,
      count: s.count,
      revenue: s.revenue,
      avgOrder: s.orders > 0 ? Math.round(s.revenue / s.orders) : 0,
    }));

    return rows.filter((r) => r.count > 0);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive business intelligence and reporting dashboard.
          </p>
        </div>
        <div className="flex space-x-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 3 months</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <ExportDropdown
            data={topProductsData}
            options={{
              filename: 'sales_analytics_report',
              title: 'Sales Analytics Report',
              sheetName: 'Analytics',
              columns: [
                { key: 'name', header: 'Product Name', width: 25 },
                { key: 'sales', header: 'Units Sold', width: 15 },
                { key: 'revenue', header: 'Revenue', width: 15 },
              ],
            }}
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(summaryData.totalRevenue)}</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 text-green-600 mr-1" />
                  <span className="text-sm text-green-600">
                    {summaryData.totalRevenue > 0 ? "+12.5%" : "No data"}
                  </span>
                </div>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold">{summaryData.totalOrders.toLocaleString()}</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 text-green-600 mr-1" />
                  <span className="text-sm text-green-600">
                    {summaryData.totalOrders > 0 ? "+8.2%" : "No orders"}
                  </span>
                </div>
              </div>
              <ShoppingCart className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Order Value</p>
                <p className="text-2xl font-bold">{formatCurrency(summaryData.avgOrderValue)}</p>
                <div className="flex items-center mt-1">
                  {summaryData.avgOrderValue > 0 ? (
                    <>
                      <TrendingUp className="w-3 h-3 text-green-600 mr-1" />
                      <span className="text-sm text-green-600">+2.1%</span>
                    </>
                  ) : (
                    <span className="text-sm text-muted-foreground">No data</span>
                  )}
                </div>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Profit Margin</p>
                <p className="text-2xl font-bold">{summaryData.profitMargin.toFixed(1)}%</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 text-green-600 mr-1" />
                  <span className="text-sm text-green-600">+1.5%</span>
                </div>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports Tabs */}
      <Tabs value={reportType} onValueChange={setReportType}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sales">Sales Analytics</TabsTrigger>
          <TabsTrigger value="inventory">Inventory Reports</TabsTrigger>
          <TabsTrigger value="customers">Customer Analytics</TabsTrigger>
          <TabsTrigger value="financial">Financial Reports</TabsTrigger>
        </TabsList>

        {/* Sales Analytics */}
        <TabsContent value="sales" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Sales & Profit Trend</CardTitle>
              </CardHeader>
              <CardContent>
                {getSalesTrendData().length > 0 || orders.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={getSalesTrendData().length > 0 ? getSalesTrendData() : salesTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, ""]} />
                      <Area
                        type="monotone"
                        dataKey="sales"
                        stackId="1"
                        stroke="#3B82F6"
                        fill="#3B82F6"
                        fillOpacity={0.3}
                      />
                      <Area
                        type="monotone"
                        dataKey="profit"
                        stackId="2"
                        stroke="#10B981"
                        fill="#10B981"
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No sales data available</p>
                      <p className="text-sm">Make some sales to see trends</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sales by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={getCategoryData().length > 0 ? getCategoryData() : categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {(getCategoryData().length > 0 ? getCategoryData() : categoryData).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, "Share"]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    {(getCategoryData().length > 0 ? getCategoryData() : categoryData).map((entry, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: entry.fill }}
                        />
                        <span className="text-sm">{entry.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Top Performing Products</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Units Sold</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Growth</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(getTopProductsData().length > 0 ? getTopProductsData() : topProductsData).map((product, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.sales}</TableCell>
                      <TableCell>{formatCurrency(product.revenue)}</TableCell>
                      <TableCell>
                        <span className="text-green-600 flex items-center">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          +{Math.floor(Math.random() * 20 + 5)}%
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inventory Reports */}
        <TabsContent value="inventory" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Status Report</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Current Stock</TableHead>
                    <TableHead>Min Level</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Inventory Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(getInventoryReportData().length > 0 ? getInventoryReportData() : inventoryReportData).map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.product}</TableCell>
                      <TableCell>{item.current}</TableCell>
                      <TableCell>{item.minimum}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                      </TableCell>
                      <TableCell>{formatCurrency(item.value)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Customer Analytics */}
        <TabsContent value="customers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Segmentation Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer Segment</TableHead>
                    <TableHead>Count</TableHead>
                    <TableHead>Total Revenue</TableHead>
                    <TableHead>Avg Order Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(getCustomerSegmentationData().length > 0 ? getCustomerSegmentationData() : []).map((segment, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{segment.segment}</TableCell>
                      <TableCell>{segment.count}</TableCell>
                      <TableCell>{formatCurrency(segment.revenue)}</TableCell>
                      <TableCell>{formatCurrency(segment.avgOrder)}</TableCell>
                    </TableRow>
                  ))}
                  {getCustomerSegmentationData().length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        No customer data yet. Add customers and record sales in POS to populate this section.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customer Acquisition Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={getSalesTrendData().length > 0 ? getSalesTrendData() : salesTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="orders"
                    stroke="#3B82F6"
                    strokeWidth={3}
                    dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financial Reports */}
        <TabsContent value="financial" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Profit & Loss Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Revenue</span>
                    <span className="font-medium">₹34,56,789</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cost of Goods Sold</span>
                    <span className="font-medium">₹24,19,752</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Gross Profit</span>
                    <span className="font-medium text-green-600">₹10,37,037</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Operating Expenses</span>
                    <span className="font-medium">₹3,45,679</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Net Profit</span>
                      <span className="font-bold text-green-600">₹6,91,358</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Profit Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={getSalesTrendData().length > 0 ? getSalesTrendData() : salesTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, "Profit"]} />
                    <Bar dataKey="profit" fill="#10B981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
