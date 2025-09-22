import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
    FileText,
    Search,
    Filter,
    Download,
    Printer,
    Eye,
    Calendar,
    User,
    CreditCard,
    MoreHorizontal,
    ChevronLeft,
    ChevronRight,
    BarChart3,
    Grid3X3,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BillGenerator, createBillData } from "@/lib/billGenerator";

interface Bill {
    id: number;
    billNumber: string;
    date: string;
    customer: {
        name: string;
        phone: string;
        email?: string;
    };
    items: Array<{
        name: string;
        quantity: number;
        price: number;
        total: number;
    }>;
    subtotal: number;
    discount: number;
    discountAmount: number;
    taxRate: number;
    taxAmount: number;
    total: number;
    paymentMethod: string;
    paymentDetails?: any;
    createdAt: string;
}

export default function Bills() {
    const [bills, setBills] = useState<Bill[]>([]);
    const [filteredBills, setFilteredBills] = useState<Bill[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [dateFilter, setDateFilter] = useState("all");
    const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    // View toggle state
    const [activeView, setActiveView] = useState<'table' | 'insights'>('table');

    // Toast hook
    const { toast } = useToast();

    // Load bills from localStorage
    useEffect(() => {
        try {
            const ordersRaw = localStorage.getItem('pos_orders');
            const orders = ordersRaw ? JSON.parse(ordersRaw) : [];

            // Transform orders to bills format
            const billsData: Bill[] = orders.map((order: any) => ({
                id: order.id,
                billNumber: `INV-${order.id}`,
                date: new Date(order.createdAt).toLocaleDateString('en-IN'),
                customer: order.customer || { name: 'Guest Customer', phone: '-' },
                items: order.items || [],
                subtotal: order.subtotal || 0,
                discount: order.discountPercent || 0,
                discountAmount: order.discountAmount || 0,
                taxRate: order.taxRate || 18,
                taxAmount: order.taxAmount || 0,
                total: order.total || 0,
                paymentMethod: order.paymentMethod || 'Cash',
                paymentDetails: order.paymentDetails,
                createdAt: order.createdAt,
            }));

            setBills(billsData);
            setFilteredBills(billsData);
        } catch (error) {
            console.error('Error loading bills:', error);
        }
    }, []);

    // Filter bills based on search and filters
    useEffect(() => {
        let filtered = bills;

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(bill =>
                bill.billNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                bill.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                bill.customer.phone.includes(searchTerm)
            );
        }

        // Status filter (payment method)
        if (statusFilter !== "all") {
            filtered = filtered.filter(bill => bill.paymentMethod === statusFilter);
        }

        // Date filter
        if (dateFilter !== "all") {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

            filtered = filtered.filter(bill => {
                const billDate = new Date(bill.createdAt);

                switch (dateFilter) {
                    case "today":
                        return billDate >= today;
                    case "week":
                        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                        return billDate >= weekAgo;
                    case "month":
                        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                        return billDate >= monthAgo;
                    default:
                        return true;
                }
            });
        }

        setFilteredBills(filtered);
    }, [bills, searchTerm, statusFilter, dateFilter]);

    const formatCurrency = (amount: number) => {
        return `₹${amount.toLocaleString('en-IN')}`;
    };

    const getPaymentMethodIcon = (method: string) => {
        switch (method) {
            case 'card':
                return <CreditCard className="w-4 h-4" />;
            case 'upi':
                return <CreditCard className="w-4 h-4" />;
            default:
                return <CreditCard className="w-4 h-4" />;
        }
    };

    const getPaymentMethodColor = (method: string) => {
        switch (method) {
            case 'card':
                return 'bg-blue-100 text-blue-800';
            case 'upi':
                return 'bg-purple-100 text-purple-800';
            case 'cash':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const reprintBill = (bill: Bill) => {
        try {
            const billData = {
                billNumber: bill.billNumber,
                date: bill.date,
                customer: bill.customer,
                items: bill.items,
                subtotal: bill.subtotal,
                discount: bill.discount,
                taxRate: bill.taxRate,
                taxAmount: bill.taxAmount,
                total: bill.total,
                paymentMethod: bill.paymentMethod,
            };

            const billGenerator = new BillGenerator();
            billGenerator.printBill(billData);
        } catch (error) {
            console.error('Error printing bill:', error);
            toast({
                title: "Error",
                description: "Error printing bill. Please try again.",
                variant: "destructive",
            });
        }
    };

    const downloadBill = (bill: Bill) => {
        try {
            const billData = {
                billNumber: bill.billNumber,
                date: bill.date,
                customer: bill.customer,
                items: bill.items,
                subtotal: bill.subtotal,
                discount: bill.discount,
                taxRate: bill.taxRate,
                taxAmount: bill.taxAmount,
                total: bill.total,
                paymentMethod: bill.paymentMethod,
            };

            const billGenerator = new BillGenerator();
            billGenerator.downloadBill(billData);
        } catch (error) {
            console.error('Error downloading bill:', error);
            toast({
                title: "Error",
                description: "Error downloading bill. Please try again.",
                variant: "destructive",
            });
        }
    };

    // Pagination calculations
    const totalPages = Math.ceil(filteredBills.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentBills = filteredBills.slice(startIndex, endIndex);

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter, dateFilter]);

    const totalRevenue = filteredBills.reduce((sum, bill) => sum + bill.total, 0);
    const totalBills = filteredBills.length;
    const averageOrderValue = totalBills > 0 ? totalRevenue / totalBills : 0;

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Bills & Invoices</h1>
                    <p className="text-muted-foreground">
                        View and manage all generated bills and invoices.
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
                            Bills
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

                    <Button variant="outline" onClick={() => window.location.reload()}>
                        <FileText className="w-4 h-4 mr-2" />
                        Refresh
                    </Button>
                </div>
            </div>



            {activeView === 'table' && (
                <>
                    {/* Filters */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Filter className="w-5 h-5 mr-2" />
                                Filters & Search
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="search">Search</Label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="search"
                                            placeholder="Search bills..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Payment Method</Label>
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="All methods" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Methods</SelectItem>
                                            <SelectItem value="cash">Cash</SelectItem>
                                            <SelectItem value="card">Card</SelectItem>
                                            <SelectItem value="upi">UPI</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Date Range</Label>
                                    <Select value={dateFilter} onValueChange={setDateFilter}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="All time" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Time</SelectItem>
                                            <SelectItem value="today">Today</SelectItem>
                                            <SelectItem value="week">Last 7 Days</SelectItem>
                                            <SelectItem value="month">Last 30 Days</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Actions</Label>
                                    <div className="flex space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setSearchTerm("");
                                                setStatusFilter("all");
                                                setDateFilter("all");
                                            }}
                                        >
                                            Clear Filters
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Bills Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Bills ({filteredBills.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {filteredBills.length === 0 ? (
                                <div className="text-center py-8">
                                    <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                                    <p className="text-muted-foreground">No bills found</p>
                                    <p className="text-sm text-muted-foreground">
                                        {bills.length === 0
                                            ? "No bills have been generated yet"
                                            : "Try adjusting your filters"
                                        }
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Bill Number</TableHead>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Customer</TableHead>
                                                <TableHead>Items</TableHead>
                                                <TableHead>Total</TableHead>
                                                <TableHead>Payment</TableHead>
                                                <TableHead>Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {currentBills.map((bill) => (
                                                <TableRow key={bill.id}>
                                                    <TableCell className="font-medium">
                                                        {bill.billNumber}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center space-x-2">
                                                            <Calendar className="w-4 h-4 text-muted-foreground" />
                                                            <span>{bill.date}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div>
                                                            <div className="font-medium">{bill.customer.name}</div>
                                                            <div className="text-sm text-muted-foreground">
                                                                {bill.customer.phone}
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="text-sm">
                                                            {bill.items.length} item{bill.items.length !== 1 ? 's' : ''}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="font-medium">
                                                        {formatCurrency(bill.total)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge className={getPaymentMethodColor(bill.paymentMethod)}>
                                                            <div className="flex items-center space-x-1">
                                                                {getPaymentMethodIcon(bill.paymentMethod)}
                                                                <span className="capitalize">{bill.paymentMethod}</span>
                                                            </div>
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center space-x-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => {
                                                                    setSelectedBill(bill);
                                                                    setIsDetailsOpen(true);
                                                                }}
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => reprintBill(bill)}
                                                            >
                                                                <Printer className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => downloadBill(bill)}
                                                            >
                                                                <Download className="w-4 h-4" />
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
                                                Showing {startIndex + 1} to {Math.min(endIndex, filteredBills.length)} of {filteredBills.length} bills
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

                    {/* Bill Details Dialog */}
                    <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Bill Details - {selectedBill?.billNumber}</DialogTitle>
                            </DialogHeader>
                            {selectedBill && (
                                <div className="space-y-6">
                                    {/* Bill Header */}
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <h3 className="font-semibold mb-2">Bill Information</h3>
                                            <div className="space-y-1 text-sm">
                                                <div><strong>Bill Number:</strong> {selectedBill.billNumber}</div>
                                                <div><strong>Date:</strong> {selectedBill.date}</div>
                                                <div><strong>Payment Method:</strong> {selectedBill.paymentMethod}</div>
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold mb-2">Customer Information</h3>
                                            <div className="space-y-1 text-sm">
                                                <div><strong>Name:</strong> {selectedBill.customer.name}</div>
                                                <div><strong>Phone:</strong> {selectedBill.customer.phone}</div>
                                                {selectedBill.customer.email && (
                                                    <div><strong>Email:</strong> {selectedBill.customer.email}</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Items Table */}
                                    <div>
                                        <h3 className="font-semibold mb-3">Items</h3>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Product</TableHead>
                                                    <TableHead>Quantity</TableHead>
                                                    <TableHead>Price</TableHead>
                                                    <TableHead>Total</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {selectedBill.items.map((item, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell>{item.name}</TableCell>
                                                        <TableCell>{item.quantity}</TableCell>
                                                        <TableCell>{formatCurrency(item.price)}</TableCell>
                                                        <TableCell>{formatCurrency(item.total)}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>

                                    {/* Bill Summary */}
                                    <div className="border-t pt-4">
                                        <div className="max-w-sm ml-auto space-y-2">
                                            <div className="flex justify-between">
                                                <span>Subtotal:</span>
                                                <span>{formatCurrency(selectedBill.subtotal)}</span>
                                            </div>
                                            {selectedBill.discount > 0 && (
                                                <div className="flex justify-between text-green-600">
                                                    <span>Discount ({selectedBill.discount}%):</span>
                                                    <span>-{formatCurrency(selectedBill.discountAmount)}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between">
                                                <span>GST ({selectedBill.taxRate}%):</span>
                                                <span>{formatCurrency(selectedBill.taxAmount)}</span>
                                            </div>
                                            <div className="flex justify-between font-bold text-lg border-t pt-2">
                                                <span>Total:</span>
                                                <span>{formatCurrency(selectedBill.total)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex justify-end space-x-3 pt-4 border-t">
                                        <Button
                                            variant="outline"
                                            onClick={() => reprintBill(selectedBill)}
                                        >
                                            <Printer className="w-4 h-4 mr-2" />
                                            Reprint
                                        </Button>
                                        <Button
                                            onClick={() => downloadBill(selectedBill)}
                                        >
                                            <Download className="w-4 h-4 mr-2" />
                                            Download PDF
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </DialogContent>
                    </Dialog>
                </>
            )}

            {activeView === 'insights' && (
                <div className="space-y-6">
                    {/* Bills Insights */}
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Bills</CardTitle>
                                <FileText className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{totalBills}</div>
                                <p className="text-xs text-muted-foreground">
                                    {bills.length - filteredBills.length} filtered out
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                                <CreditCard className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
                                <p className="text-xs text-muted-foreground">
                                    From {totalBills} bills
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
                                <User className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{formatCurrency(averageOrderValue)}</div>
                                <p className="text-xs text-muted-foreground">
                                    Per transaction
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Revenue Trends */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Revenue Trends</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Today's Revenue</span>
                                        <span className="font-medium">
                                            {formatCurrency(
                                                filteredBills
                                                    .filter(bill => {
                                                        const billDate = new Date(bill.createdAt);
                                                        const today = new Date();
                                                        return billDate.toDateString() === today.toDateString();
                                                    })
                                                    .reduce((sum, bill) => sum + bill.total, 0)
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">This Week</span>
                                        <span className="font-medium">
                                            {formatCurrency(
                                                filteredBills
                                                    .filter(bill => {
                                                        const billDate = new Date(bill.createdAt);
                                                        const weekAgo = new Date();
                                                        weekAgo.setDate(weekAgo.getDate() - 7);
                                                        return billDate >= weekAgo;
                                                    })
                                                    .reduce((sum, bill) => sum + bill.total, 0)
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">This Month</span>
                                        <span className="font-medium">
                                            {formatCurrency(
                                                filteredBills
                                                    .filter(bill => {
                                                        const billDate = new Date(bill.createdAt);
                                                        const monthAgo = new Date();
                                                        monthAgo.setDate(monthAgo.getDate() - 30);
                                                        return billDate >= monthAgo;
                                                    })
                                                    .reduce((sum, bill) => sum + bill.total, 0)
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Payment Method Distribution */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Payment Methods</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {(() => {
                                        const paymentMethods: Record<string, { count: number; total: number }> = {};
                                        filteredBills.forEach(bill => {
                                            const method = bill.paymentMethod || 'Unknown';
                                            if (!paymentMethods[method]) {
                                                paymentMethods[method] = { count: 0, total: 0 };
                                            }
                                            paymentMethods[method].count++;
                                            paymentMethods[method].total += bill.total;
                                        });
                                        return Object.entries(paymentMethods).map(([method, data]) => (
                                            <div key={method} className="flex items-center justify-between">
                                                <span className="text-sm capitalize">{method}</span>
                                                <div className="flex items-center space-x-2">
                                                    <div className="w-20 bg-muted rounded-full h-2">
                                                        <div
                                                            className="bg-primary h-2 rounded-full"
                                                            style={{ width: `${(data.count / filteredBills.length) * 100}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-sm font-medium">{data.count} bills</span>
                                                </div>
                                            </div>
                                        ));
                                    })()}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Top Customers by Revenue */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Top Customers by Revenue</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {(() => {
                                    const customerRevenue: Record<string, { name: string; total: number; bills: number }> = {};
                                    filteredBills.forEach(bill => {
                                        const customerName = bill.customer?.name || 'Guest Customer';
                                        if (!customerRevenue[customerName]) {
                                            customerRevenue[customerName] = { name: customerName, total: 0, bills: 0 };
                                        }
                                        customerRevenue[customerName].total += bill.total;
                                        customerRevenue[customerName].bills++;
                                    });
                                    return Object.values(customerRevenue)
                                        .sort((a, b) => b.total - a.total)
                                        .slice(0, 5)
                                        .map((customer, index) => (
                                            <div key={index} className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-medium">
                                                        {index + 1}
                                                    </div>
                                                    <span className="text-sm">{customer.name}</span>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-medium">{formatCurrency(customer.total)}</div>
                                                    <div className="text-xs text-muted-foreground">{customer.bills} bills</div>
                                                </div>
                                            </div>
                                        ));
                                })()}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Daily Sales Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Daily Sales (Last 7 Days)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {(() => {
                                    const dailySales: Record<string, number> = {};
                                    const today = new Date();
                                    for (let i = 6; i >= 0; i--) {
                                        const date = new Date(today);
                                        date.setDate(today.getDate() - i);
                                        const dateKey = date.toISOString().split('T')[0];
                                        dailySales[dateKey] = 0;
                                    }

                                    filteredBills.forEach(bill => {
                                        const billDate = new Date(bill.createdAt).toISOString().split('T')[0];
                                        if (dailySales[billDate] !== undefined) {
                                            dailySales[billDate] += bill.total;
                                        }
                                    });

                                    return Object.entries(dailySales).map(([date, total]) => (
                                        <div key={date} className="flex items-center justify-between">
                                            <span className="text-sm">
                                                {new Date(date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
                                            </span>
                                            <div className="flex items-center space-x-2">
                                                <div className="w-32 bg-muted rounded-full h-2">
                                                    <div
                                                        className="bg-green-500 h-2 rounded-full"
                                                        style={{ width: `${Math.min((total / Math.max(...Object.values(dailySales))) * 100, 100)}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm font-medium">{formatCurrency(total)}</span>
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
