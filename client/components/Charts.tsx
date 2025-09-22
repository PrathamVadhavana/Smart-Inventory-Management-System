import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const defaultSalesData = [
  { date: "Jan 1", sales: 45000 },
  { date: "Jan 5", sales: 52000 },
  { date: "Jan 10", sales: 48000 },
  { date: "Jan 15", sales: 61000 },
  { date: "Jan 20", sales: 55000 },
  { date: "Jan 25", sales: 67000 },
  { date: "Jan 30", sales: 72000 },
];

const defaultTopProductsData = [
  { name: "iPhone 15 Pro", sales: 156 },
  { name: "Samsung S24", sales: 142 },
  { name: "iPad Air", sales: 98 },
  { name: "MacBook Air", sales: 87 },
  { name: "AirPods Pro", sales: 234 },
];

const defaultStockCategoryData = [
  { name: "Electronics", value: 45, fill: "#3B82F6" },
  { name: "Accessories", value: 30, fill: "#10B981" },
  { name: "Laptops", value: 15, fill: "#F59E0B" },
  { name: "Audio", value: 10, fill: "#EF4444" },
];

export function SalesTrendChart({ data }: { data?: { date: string; sales: number }[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales Trend (Last 30 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data && data.length > 0 ? data : defaultSalesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, "Sales"]} />
            <Line 
              type="monotone" 
              dataKey="sales" 
              stroke="#3B82F6" 
              strokeWidth={3}
              dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function TopProductsChart({ data }: { data?: { name: string; sales: number }[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Selling Products</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data && data.length > 0 ? data : defaultTopProductsData} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={100} />
            <Tooltip formatter={(value) => [`${value} units`, "Sales"]} />
            <Bar dataKey="sales" fill="#10B981" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function StockCategoryChart({ data }: { data?: { name: string; value: number; fill?: string }[] }) {
  const palette = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4"];
  const resolved = (data && data.length > 0 ? data : defaultStockCategoryData).map((d, i) => ({
    ...d,
    fill: d.fill || palette[i % palette.length],
  }));
  return (
    <Card>
      <CardHeader>
        <CardTitle>Stock by Category</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={resolved}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
            >
              {resolved.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`${value}%`, "Stock"]} />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex justify-center mt-4">
          <div className="grid grid-cols-2 gap-4">
            {resolved.map((entry, index) => (
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
  );
}
