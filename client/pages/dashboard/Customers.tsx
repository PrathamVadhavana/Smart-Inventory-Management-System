import { useEffect, useMemo, useState } from "react";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import ExportDropdown from "@/components/ExportDropdown";
import { customerColumns } from "@/lib/exportUtils";
import { useCustomers } from "@/hooks/useSupabase";
import {
  Users,
  Plus,
  Search,
  Filter,
  Download,
  Edit,
  Trash2,
  Eye,
  Phone,
  Mail,
  MapPin,
  ShoppingBag,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  X,
  BarChart3,
  Grid3X3,
} from "lucide-react";

interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  gstNumber?: string;
  totalPurchases: number;
  totalSpent: number;
  lastPurchase: string;
  joinDate: string;
  loyaltyPoints: number;
}

export default function Customers() {
  const { customers, addCustomer, updateCustomer, deleteCustomer } = useCustomers();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    gstNumber: "",
  });

  // Filter states
  const [loyaltyFilter, setLoyaltyFilter] = useState("all");
  const [purchaseFilter, setPurchaseFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // View toggle state
  const [activeView, setActiveView] = useState<'table' | 'insights'>('table');

  // Customers are now loaded from Supabase via useCustomers hook

  const filteredCustomers = useMemo(() => {
    let filtered = customers;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(customer =>
        (customer.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (customer.phone || '').includes(searchTerm) ||
        (customer.email || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Loyalty points filter
    if (loyaltyFilter !== "all") {
      switch (loyaltyFilter) {
        case "vip":
          filtered = filtered.filter(c => (c.loyalty_points || 0) >= 1000);
          break;
        case "high":
          filtered = filtered.filter(c => (c.loyalty_points || 0) >= 500 && (c.loyalty_points || 0) < 1000);
          break;
        case "medium":
          filtered = filtered.filter(c => (c.loyalty_points || 0) >= 100 && (c.loyalty_points || 0) < 500);
          break;
        case "low":
          filtered = filtered.filter(c => (c.loyalty_points || 0) < 100);
          break;
      }
    }

    // Purchase count filter
    if (purchaseFilter !== "all") {
      switch (purchaseFilter) {
        case "high":
          filtered = filtered.filter(c => (c.total_purchases || 0) >= 10);
          break;
        case "medium":
          filtered = filtered.filter(c => (c.total_purchases || 0) >= 5 && (c.total_purchases || 0) < 10);
          break;
        case "low":
          filtered = filtered.filter(c => (c.total_purchases || 0) < 5);
          break;
      }
    }

    // Date filter (based on join date)
    if (dateFilter !== "all") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      filtered = filtered.filter(customer => {
        const joinDate = new Date(customer.join_date);
        if (isNaN(joinDate.getTime())) return false;

        switch (dateFilter) {
          case "today":
            return joinDate >= today;
          case "week":
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            return joinDate >= weekAgo;
          case "month":
            const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
            return joinDate >= monthAgo;
          case "year":
            const yearAgo = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000);
            return joinDate >= yearAgo;
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [customers, searchTerm, loyaltyFilter, purchaseFilter, dateFilter]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCustomers = filteredCustomers.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, loyaltyFilter, purchaseFilter, dateFilter]);

  // Dashboard metrics
  const today = useMemo(() => new Date(), []);
  const totalCustomers = customers.length;
  const activeThisMonth = useMemo(() => {
    return customers.filter(c => {
      const d = new Date(c.last_purchase);
      return !isNaN(d.getTime()) && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
    }).length;
  }, [customers, today]);
  const newThisMonth = useMemo(() => {
    return customers.filter(c => {
      const d = new Date(c.join_date);
      return !isNaN(d.getTime()) && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
    }).length;
  }, [customers, today]);
  const vipCustomers = useMemo(() => {
    return customers.filter(c => (c.loyalty_points || 0) >= 1000).length;
  }, [customers]);

  const handleSaveCustomer = async () => {
    try {
      const customerData = {
        name: newCustomer.name.trim(),
        phone: newCustomer.phone.trim(),
        email: newCustomer.email.trim() || undefined,
        address: newCustomer.address.trim() || undefined,
        gst_number: newCustomer.gstNumber.trim() || undefined,
      };

      if (editingId) {
        await updateCustomer(editingId, customerData);
      } else {
        await addCustomer(customerData);
      }

      setDialogOpen(false);
      setEditingId(null);
      setNewCustomer({ name: "", phone: "", email: "", address: "", gstNumber: "" });
    } catch (error) {
      console.error('Error saving customer:', error);
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditingId(customer.id);
    setNewCustomer({
      name: customer.name || "",
      phone: customer.phone || "",
      email: customer.email || "",
      address: customer.address || "",
      gstNumber: customer.gst_number || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCustomer(id);
    } catch (error) {
      console.error('Error deleting customer:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Customer Management</h1>
          <p className="text-muted-foreground">
            Manage customer profiles, purchase history, and loyalty programs.
          </p>
        </div>
        <div className="flex space-x-3">
          {/* View Toggle */}
          <div className="flex items-center space-x-1 bg-muted p-1 rounded-lg">
            <Button
              variant={activeView === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveView('table')}
            >
              <Grid3X3 className="w-4 h-4 mr-2" />
              Customers
            </Button>
            <Button
              variant={activeView === 'insights' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveView('insights')}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Insights
            </Button>
          </div>

          <ExportDropdown
            data={filteredCustomers}
            options={{
              filename: 'customer_database',
              title: 'Customer Database Report',
              sheetName: 'Customers',
              columns: customerColumns,
            }}
          />
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Customer
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingId ? 'Edit Customer' : 'Add New Customer'}</DialogTitle>
                <DialogDescription>
                  Create a new customer profile for better tracking and service.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      placeholder="Enter customer name"
                      value={newCustomer.name}
                      onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      placeholder="+91 XXXXX XXXXX"
                      value={newCustomer.phone}
                      onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="customer@example.com"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    placeholder="Enter customer address"
                    value={newCustomer.address}
                    onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gst">GST Number (Optional)</Label>
                  <Input
                    id="gst"
                    placeholder="22AAAAA0000A1Z5"
                    value={newCustomer.gstNumber}
                    onChange={(e) => setNewCustomer({ ...newCustomer, gstNumber: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveCustomer} disabled={!newCustomer.name || !newCustomer.phone}>
                  {editingId ? 'Save Changes' : 'Add Customer'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      

      {activeView === 'table' && (
        <>
          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Search & Filters</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  {showFilters ? 'Hide' : 'Show'} Filters
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, phone, or email..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Advanced Filters */}
                {showFilters && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-muted/50">
                    <div className="space-y-2">
                      <Label>Loyalty Points</Label>
                      <Select value={loyaltyFilter} onValueChange={setLoyaltyFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="All loyalty levels" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Levels</SelectItem>
                          <SelectItem value="vip">VIP (1000+)</SelectItem>
                          <SelectItem value="high">High (500-999)</SelectItem>
                          <SelectItem value="medium">Medium (100-499)</SelectItem>
                          <SelectItem value="low">Low (0-99)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Purchase Count</Label>
                      <Select value={purchaseFilter} onValueChange={setPurchaseFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="All purchase levels" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Levels</SelectItem>
                          <SelectItem value="high">High (10+)</SelectItem>
                          <SelectItem value="medium">Medium (5-9)</SelectItem>
                          <SelectItem value="low">Low (0-4)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Join Date</Label>
                      <Select value={dateFilter} onValueChange={setDateFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="All time periods" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Time</SelectItem>
                          <SelectItem value="today">Today</SelectItem>
                          <SelectItem value="week">Last 7 Days</SelectItem>
                          <SelectItem value="month">Last 30 Days</SelectItem>
                          <SelectItem value="year">Last Year</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="col-span-full flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSearchTerm("");
                          setLoyaltyFilter("all");
                          setPurchaseFilter("all");
                          setDateFilter("all");
                        }}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Clear All Filters
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Customers Table */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Database ({filteredCustomers.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredCustomers.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No customers found</p>
                  <p className="text-sm text-muted-foreground">
                    {customers.length === 0
                      ? "No customers have been added yet"
                      : "Try adjusting your filters"
                    }
                  </p>
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Purchases</TableHead>
                        <TableHead>Total Spent</TableHead>
                        <TableHead>Last Purchase</TableHead>
                        <TableHead>Loyalty Points</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentCustomers.map((customer) => (
                        <TableRow key={customer.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{customer.name}</p>
                              <p className="text-xs text-muted-foreground">
                                Member since {new Date(customer.join_date).toLocaleDateString()}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center text-sm">
                                <Phone className="w-3 h-3 mr-1" />
                                {customer.phone}
                              </div>
                              {customer.email && (
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <Mail className="w-3 h-3 mr-1" />
                                  {customer.email}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{customer.total_purchases}</TableCell>
                          <TableCell className="font-medium">{formatCurrency(customer.total_spent)}</TableCell>
                          <TableCell>{new Date(customer.last_purchase).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-sm">
                              {customer.loyalty_points}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedCustomer(customer);
                                  setHistoryDialogOpen(true);
                                }}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleEdit(customer)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDelete(customer.id)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4">
                      <div className="text-sm text-muted-foreground">
                        Showing {startIndex + 1} to {Math.min(endIndex, filteredCustomers.length)} of {filteredCustomers.length} customers
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="w-4 h-4" />
                          Previous
                        </Button>
                        <div className="flex items-center space-x-1">
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <Button
                              key={page}
                              variant={currentPage === page ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(page)}
                              className="w-8 h-8 p-0"
                            >
                              {page}
                            </Button>
                          ))}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                        >
                          Next
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Customer History Dialog */}
          <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Customer Purchase History</DialogTitle>
                <DialogDescription>
                  {selectedCustomer?.name} - Purchase history and details
                </DialogDescription>
              </DialogHeader>

              {selectedCustomer && (
                <div className="space-y-6">
                  {/* Customer Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Total Purchases</p>
                          <p className="text-2xl font-bold">{selectedCustomer.total_purchases}</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Total Spent</p>
                          <p className="text-2xl font-bold">{formatCurrency(selectedCustomer.total_spent)}</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Loyalty Points</p>
                          <p className="text-2xl font-bold text-primary">{selectedCustomer.loyalty_points}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Purchase History Table */}
                  <div>
                    <h4 className="text-lg font-semibold mb-4">Recent Purchases</h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Bill No</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Items</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(function () {
                          try {
                            const ordersRaw = localStorage.getItem('pos_orders');
                            const orders = ordersRaw ? JSON.parse(ordersRaw) : [];
                            const rows = orders
                              .filter((o: any) => o?.customer?.id === selectedCustomer.id)
                              .map((o: any) => ({
                                id: String(o.id),
                                billNo: `INV-${new Date(o.createdAt).getFullYear()}-${o.id}`,
                                date: o.createdAt,
                                amount: o.total,
                                items: Array.isArray(o.items) ? o.items.map((it: any) => it.name).join(', ') : ''
                              }));
                            return (rows.length > 0 ? rows : demoPurchaseHistory).map((purchase: any) => (
                              <TableRow key={purchase.id}>
                                <TableCell className="font-mono">{purchase.billNo}</TableCell>
                                <TableCell>{new Date(purchase.date).toLocaleDateString()}</TableCell>
                                <TableCell className="font-medium">{formatCurrency(purchase.amount)}</TableCell>
                                <TableCell>{purchase.items}</TableCell>
                              </TableRow>
                            ));
                          } catch {
                            return demoPurchaseHistory.map((purchase) => (
                              <TableRow key={purchase.id}>
                                <TableCell className="font-mono">{purchase.billNo}</TableCell>
                                <TableCell>{new Date(purchase.date).toLocaleDateString()}</TableCell>
                                <TableCell className="font-medium">{formatCurrency(purchase.amount)}</TableCell>
                                <TableCell>{purchase.items}</TableCell>
                              </TableRow>
                            ));
                          }
                        })()}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={() => setHistoryDialogOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}

      {activeView === 'insights' && (
        <div className="space-y-6">
          {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Customers</p>
                <p className="text-2xl font-bold">{totalCustomers.toLocaleString()}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active This Month</p>
                <p className="text-2xl font-bold">{activeThisMonth.toLocaleString()}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">New This Month</p>
                <p className="text-2xl font-bold">{newThisMonth.toLocaleString()}</p>
              </div>
              <Plus className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">VIP Customers</p>
                <p className="text-2xl font-bold">{vipCustomers.toLocaleString()}</p>
              </div>
              <ShoppingBag className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>
          {/* Customer Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Customer Segments */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Segments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span className="text-sm">VIP Customers</span>
                    </div>
                    <span className="font-medium">
                      {customers.filter(c => (c.loyalty_points || 0) >= 1000).length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">High Value</span>
                    </div>
                    <span className="font-medium">
                      {customers.filter(c => (c.total_spent || 0) >= 50000).length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Regular</span>
                    </div>
                    <span className="font-medium">
                      {customers.filter(c => (c.total_spent || 0) >= 10000 && (c.total_spent || 0) < 50000).length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm">New</span>
                    </div>
                    <span className="font-medium">
                      {customers.filter(c => (c.total_spent || 0) < 10000).length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Loyalty Points Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Loyalty Points Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(() => {
                    const loyaltyRanges = [
                      { label: '0-99', min: 0, max: 99, color: 'bg-red-500' },
                      { label: '100-499', min: 100, max: 499, color: 'bg-yellow-500' },
                      { label: '500-999', min: 500, max: 999, color: 'bg-blue-500' },
                      { label: '1000+', min: 1000, max: Infinity, color: 'bg-purple-500' },
                    ];

                    return loyaltyRanges.map((range, index) => {
                      const count = customers.filter(c => {
                        const points = c.loyalty_points || 0;
                        return points >= range.min && points <= range.max;
                      }).length;

                      return (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm">{range.label} points</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-muted rounded-full h-2">
                              <div
                                className={`${range.color} h-2 rounded-full`}
                                style={{ width: `${(count / customers.length) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">{count}</span>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Customers by Spending */}
          <Card>
            <CardHeader>
              <CardTitle>Top Customers by Spending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {customers
                  .sort((a, b) => (b.total_spent || 0) - (a.total_spent || 0))
                  .slice(0, 5)
                  .map((customer, index) => (
                    <div key={customer.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <div className="text-sm font-medium">{customer.name}</div>
                          <div className="text-xs text-muted-foreground">{customer.phone}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(customer.total_spent || 0)}</div>
                        <div className="text-xs text-muted-foreground">{customer.total_purchases || 0} purchases</div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Customer Acquisition Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Acquisition Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(() => {
                  const monthlyAcquisition: Record<string, number> = {};
                  const today = new Date();

                  // Initialize last 6 months
                  for (let i = 5; i >= 0; i--) {
                    const date = new Date(today);
                    date.setMonth(today.getMonth() - i);
                    const monthKey = date.toISOString().slice(0, 7); // YYYY-MM
                    monthlyAcquisition[monthKey] = 0;
                  }

                  customers.forEach(customer => {
                    const joinDate = new Date(customer.join_date);
                    const monthKey = joinDate.toISOString().slice(0, 7);
                    if (monthlyAcquisition[monthKey] !== undefined) {
                      monthlyAcquisition[monthKey]++;
                    }
                  });

                  return Object.entries(monthlyAcquisition).map(([month, count]) => (
                    <div key={month} className="flex items-center justify-between">
                      <span className="text-sm">
                        {new Date(month + '-01').toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                      </span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-muted rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${Math.min((count / Math.max(...Object.values(monthlyAcquisition))) * 100, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{count} customers</span>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
