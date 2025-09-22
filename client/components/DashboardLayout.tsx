import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    FileText,
    BarChart3,
    Settings,
    Menu,
    X,
    LogOut,
    Bell,
    Search,
} from "lucide-react";

interface DashboardLayoutProps {
    children: ReactNode;
}

const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Inventory", href: "/dashboard/inventory", icon: Package },
    { name: "POS", href: "/dashboard/pos", icon: ShoppingCart },
    { name: "Customers", href: "/dashboard/customers", icon: Users },
    { name: "Bills", href: "/dashboard/bills", icon: FileText },
    { name: "Reports", href: "/dashboard/reports", icon: BarChart3 },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const location = useLocation();
    const navigate = useNavigate();
    const { signOut, user } = useAuth();

    // Load notifications from Supabase
    useEffect(() => {
        // For now, we'll use localStorage but this should be replaced with Supabase activities
        try {
            const activityRaw = localStorage.getItem('recent_activity');
            const activity = activityRaw ? JSON.parse(activityRaw) : [];
            setNotifications(activity.slice(0, 3)); // Show last 3 notifications
        } catch (error) {
            console.error('Error loading notifications:', error);
        }
    }, []);

    // Global search functionality
    const performGlobalSearch = (term: string) => {
        if (!term.trim()) {
            setSearchResults([]);
            setShowSearchResults(false);
            return;
        }

        const results: any[] = [];
        const searchLower = term.toLowerCase();

        try {
            // Search products
            const productsRaw = localStorage.getItem('dashboard_products');
            const products = productsRaw ? JSON.parse(productsRaw) : [];
            products.forEach((product: any) => {
                if (
                    product.name?.toLowerCase().includes(searchLower) ||
                    product.sku?.toLowerCase().includes(searchLower) ||
                    product.barcode?.includes(term) ||
                    product.category?.toLowerCase().includes(searchLower)
                ) {
                    results.push({
                        type: 'product',
                        title: product.name,
                        subtitle: `${product.category} • ${product.sku}`,
                        href: '/dashboard/inventory',
                        icon: Package
                    });
                }
            });

            // Search customers
            const customersRaw = localStorage.getItem('app_customers');
            const customers = customersRaw ? JSON.parse(customersRaw) : [];
            customers.forEach((customer: any) => {
                if (
                    customer.name?.toLowerCase().includes(searchLower) ||
                    customer.phone?.includes(term) ||
                    customer.email?.toLowerCase().includes(searchLower)
                ) {
                    results.push({
                        type: 'customer',
                        title: customer.name,
                        subtitle: `${customer.phone} • ${customer.email || 'No email'}`,
                        href: '/dashboard/customers',
                        icon: Users
                    });
                }
            });

            // Search bills
            const ordersRaw = localStorage.getItem('pos_orders');
            const orders = ordersRaw ? JSON.parse(ordersRaw) : [];
            orders.forEach((order: any) => {
                const billNumber = `INV-${order.id}`;
                if (
                    billNumber.includes(term) ||
                    order.customer?.name?.toLowerCase().includes(searchLower)
                ) {
                    results.push({
                        type: 'bill',
                        title: billNumber,
                        subtitle: `${order.customer?.name || 'Guest'} • ₹${order.total?.toLocaleString() || '0'}`,
                        href: '/dashboard/bills',
                        icon: FileText
                    });
                }
            });
        } catch (error) {
            console.error('Error performing search:', error);
        }

        setSearchResults(results.slice(0, 10)); // Limit to 10 results
        setShowSearchResults(true);
    };

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            const term = (e.target as HTMLInputElement).value;
            performGlobalSearch(term);
        }
    };

    const handleLogout = async () => {
        await signOut();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                <div className="flex h-full flex-col">
                    {/* Logo */}
                    <div className="flex h-16 items-center justify-between px-6 border-b border-border">
                        <div className="flex items-center space-x-2">
                            <Package className="h-8 w-8 text-primary" />
                            <span className="text-xl font-bold">InMyStack</span>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="lg:hidden"
                            onClick={() => setSidebarOpen(false)}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-1 px-4 py-4">
                        {navigation.map((item) => {
                            const isActive = location.pathname === item.href;
                            const Icon = item.icon;

                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={`flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive
                                        ? "bg-primary text-primary-foreground"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                        }`}
                                    onClick={() => setSidebarOpen(false)}
                                >
                                    <Icon className="h-5 w-5" />
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User section */}
                    <div className="border-t border-border p-4">
                        <div className="flex items-center space-x-3 mb-3">
                            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                                <span className="text-sm font-medium text-primary-foreground">
                                    {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">
                                    {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                    {user?.email || 'user@example.com'}
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={handleLogout}
                        >
                            <LogOut className="h-4 w-4 mr-2" />
                            Logout
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="lg:pl-64">
                {/* Top bar */}
                <div className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background px-4 lg:px-6">
                    <div className="flex items-center space-x-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="lg:hidden"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu className="h-5 w-5" />
                        </Button>
                        <div className="hidden md:block">
                            <h1 className="text-lg font-semibold text-foreground">
                                {navigation.find(item => item.href === location.pathname)?.name || 'Dashboard'}
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        {/* Search */}
                        <div className="hidden md:block relative">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Search products, customers, bills..."
                                    className="w-64 pl-10 pr-4 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        performGlobalSearch(e.target.value);
                                    }}
                                    onKeyDown={handleSearch}
                                    onFocus={() => setShowSearchResults(true)}
                                    onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                                />
                            </div>

                            {/* Search Results Dropdown */}
                            {showSearchResults && searchResults.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                                    {searchResults.map((result, index) => {
                                        const IconComponent = result.icon;
                                        return (
                                            <button
                                                key={index}
                                                className="w-full px-4 py-3 text-left hover:bg-muted flex items-center space-x-3"
                                                onClick={() => {
                                                    navigate(result.href);
                                                    setShowSearchResults(false);
                                                    setSearchTerm("");
                                                }}
                                            >
                                                <IconComponent className="w-4 h-4 text-muted-foreground" />
                                                <div>
                                                    <div className="font-medium text-sm">{result.title}</div>
                                                    <div className="text-xs text-muted-foreground">{result.subtitle}</div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Notifications */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="relative">
                                    <Bell className="h-5 w-5" />
                                    {notifications.length > 0 && (
                                        <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-destructive text-xs text-destructive-foreground flex items-center justify-center">
                                            {notifications.length}
                                        </span>
                                    )}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-80">
                                <div className="p-2">
                                    <h4 className="font-medium text-sm mb-2">Recent Activity</h4>
                                    {notifications.length > 0 ? (
                                        <div className="space-y-2">
                                            {notifications.map((notification, index) => (
                                                <div key={index} className="p-2 rounded-md hover:bg-muted">
                                                    <div className="text-sm font-medium">{notification.message}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {notification.amount} • {notification.time}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-sm text-muted-foreground py-4 text-center">
                                            No recent activity
                                        </div>
                                    )}
                                </div>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Page content */}
                <main className="p-4 lg:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
