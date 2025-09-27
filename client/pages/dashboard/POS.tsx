import { useEffect, useState } from "react";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import BarcodeScanner from "@/components/BarcodeScanner";
import CustomerSelector from "@/components/CustomerSelector";
import ProductSearchDialog from "@/components/ProductSearchDialog";
import { BillGenerator, createBillData } from "@/lib/billGenerator";
import { useToast } from "@/hooks/use-toast";
import { useProducts, useCustomers, useOrders } from "@/hooks/useSupabase";
import {
  ScanLine,
  Plus,
  Minus,
  Trash2,
  Camera,
  User,
  CreditCard,
  FileText,
  ShoppingCart,
  Printer,
  Download,
  Search,
  Package,
} from "lucide-react";

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  barcode?: string;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  totalPurchases: number;
}

const defaultProducts = [
  {
    id: 1,
    name: "iPhone 15 Pro",
    price: 129900,
    barcode: "1234567890123",
    stock: 45,
    minStock: 10,
    trackInventory: true,
  },
  {
    id: 2,
    name: "Samsung Galaxy S24",
    price: 89999,
    barcode: "2345678901234",
    stock: 32,
    minStock: 15,
    trackInventory: true,
  },
  {
    id: 3,
    name: "MacBook Air M3",
    price: 134900,
    barcode: "3456789012345",
    stock: 8,
    minStock: 5,
    trackInventory: true,
  },
  {
    id: 4,
    name: "AirPods Pro 2nd Gen",
    price: 26900,
    barcode: "4567890123456",
    stock: 3,
    minStock: 10,
    trackInventory: true,
  },
];

export default function POS() {
  const { products: availableProducts } = useProducts();
  const { customers } = useCustomers();
  const { addOrder } = useOrders();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [cardDetails, setCardDetails] = useState({
    holder: "",
    number: "",
    expiry: "",
    cvv: "",
  });
  const [upiDetails, setUpiDetails] = useState({
    vpa: "",
  });
  const [lastOrder, setLastOrder] = useState<any>(null);
  const [showLastBill, setShowLastBill] = useState(false);
  const [showPaymentConfirmation, setShowPaymentConfirmation] = useState(false);

  // Toast hook
  const { toast } = useToast();

  // Load last order from localStorage
  useEffect(() => {
    try {
      const ordersRaw = localStorage.getItem("pos_orders");
      const orders = ordersRaw ? JSON.parse(ordersRaw) : [];
      if (orders.length > 0) {
        setLastOrder(orders[orders.length - 1]); // Get the most recent order
      }
    } catch (error) {
      console.error("Error loading last order:", error);
    }
  }, []);

  // Products are now loaded from Supabase via useProducts hook
  // Load last order from localStorage for now
  useEffect(() => {
    try {
      const ordersRaw = localStorage.getItem("pos_orders");
      const orders = ordersRaw ? JSON.parse(ordersRaw) : [];
      if (orders.length > 0) {
        setLastOrder(orders[0]);
      }
    } catch {}
  }, []);

  const handleBarcodeScanned = (barcode: string) => {
    const product = availableProducts.find((p) => p.barcode === barcode);
    if (product) {
      addProductToCart(product, 1);
    } else {
      toast({
        title: "Product Not Found",
        description: `Product with barcode ${barcode} not found in inventory.`,
        variant: "destructive",
      });
    }
  };

  const addProductToCart = (product: any, quantity: number) => {
    const existingItem = cartItems.find(
      (item) => item.barcode === product.barcode,
    );
    const currentStock = product.current_stock || 0;

    // Check if product has stock tracking enabled
    const trackInventory = product.track_inventory === true; // Only enforce if explicitly enabled

    if (trackInventory && currentStock <= 0) {
      toast({
        title: "Out of Stock",
        description: `${product.name} is out of stock!`,
        variant: "destructive",
      });
      return;
    }

    if (existingItem) {
      const newTotalQuantity = existingItem.quantity + quantity;

      // Check if adding this quantity would exceed available stock
      if (trackInventory && newTotalQuantity > currentStock) {
        const availableToAdd = currentStock - existingItem.quantity;
        if (availableToAdd <= 0) {
          toast({
            title: "Stock Limit Reached",
            description: `Cannot add more ${product.name}. Only ${currentStock} items available in stock.`,
            variant: "destructive",
          });
          return;
        } else {
          toast({
            title: "Limited Stock",
            description: `Only ${availableToAdd} more ${product.name} can be added. Adding ${availableToAdd} instead of ${quantity}.`,
            variant: "default",
          });
          updateQuantity(
            existingItem.id,
            existingItem.quantity + availableToAdd,
          );
          return;
        }
      }

      updateQuantity(existingItem.id, newTotalQuantity);
    } else {
      // Check if requested quantity exceeds available stock
      if (trackInventory && quantity > currentStock) {
        toast({
          title: "Limited Stock",
          description: `Only ${currentStock} ${product.name} available in stock. Adding ${currentStock} instead of ${quantity}.`,
          variant: "default",
        });
        quantity = currentStock;
      }

      const newItem: CartItem = {
        id: Date.now(),
        name: product.name,
        price: product.unit_price || 0,
        quantity: quantity,
        barcode: product.barcode,
        image: product.images?.[0],
      };
      setCartItems((items) => [...items, newItem]);
    }
  };

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(id);
      return;
    }

    // Find the cart item and check stock
    const cartItem = cartItems.find((item) => item.id === id);
    if (cartItem) {
      const product = availableProducts.find(
        (p) => p.barcode === cartItem.barcode,
      );
      if (product) {
        const currentStock = product.current_stock || 0;
        const trackInventory = product.track_inventory === true;

        // Check if new quantity exceeds available stock
        if (trackInventory && newQuantity > currentStock) {
          toast({
            title: "Stock Limit Exceeded",
            description: `Cannot set quantity to ${newQuantity}. Only ${currentStock} ${product.name} available in stock.`,
            variant: "destructive",
          });
          return;
        }
      }
    }

    setCartItems((items) =>
      items.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item,
      ),
    );
  };

  const removeItem = (id: number) => {
    setCartItems((items) => items.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCartItems([]);
    setDiscount(0);
    setPaymentMethod("");
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const discountAmount = (subtotal * discount) / 100;
  const taxRate = 18; // GST 18%
  const taxAmount = ((subtotal - discountAmount) * taxRate) / 100;
  const total = subtotal - discountAmount + taxAmount;

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString()}`;
  };

  const viewLastBill = () => {
    if (lastOrder) {
      setShowLastBill(true);
    }
  };

  const reprintLastBill = () => {
    if (lastOrder) {
      try {
        // Validate and format bill data
        const billData = {
          billNumber: `INV-${lastOrder.id}`,
          date: new Date(lastOrder.createdAt).toLocaleDateString("en-IN"),
          customer: {
            name: lastOrder.customer?.name || "Guest Customer",
            phone: lastOrder.customer?.phone || "-",
            email: lastOrder.customer?.email || undefined,
            address: lastOrder.customer?.address || undefined,
            gstNumber: lastOrder.customer?.gstNumber || undefined,
          },
          items: (lastOrder.items || []).map((item: any) => ({
            name: item.name || "Unknown Product",
            quantity: Number(item.quantity) || 1,
            price: Number(item.price) || 0,
            total: Number(item.price) * Number(item.quantity) || 0,
            hsnCode: item.hsnCode || "8517",
          })),
          subtotal: Number(lastOrder.subtotal) || 0,
          discount: Number(lastOrder.discountPercent) || 0,
          taxRate: Number(lastOrder.taxRate) || 18,
          taxAmount: Number(lastOrder.taxAmount) || 0,
          total: Number(lastOrder.total) || 0,
          paymentMethod: lastOrder.paymentMethod || "Cash",
        };

        // Validate required data
        if (!billData.items.length) {
          throw new Error("No items found in the bill");
        }

        if (billData.total <= 0) {
          throw new Error("Invalid total amount");
        }

        // Debug: Log the bill data
        console.log("Bill data for printing:", billData);

        const billGenerator = new BillGenerator();

        // Add a small delay to ensure the generator is ready
        setTimeout(() => {
          try {
            billGenerator.printBill(billData);
          } catch (printError) {
            console.error("Print error in setTimeout:", printError);
            throw printError;
          }
        }, 100);

        toast({
          title: "Bill Printed",
          description: "Bill has been sent to printer successfully.",
        });
      } catch (error) {
        console.error("Error printing bill:", error);
        toast({
          title: "Print Error",
          description:
            error instanceof Error
              ? error.message
              : "Failed to print bill. Please try again.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "No Bill Found",
        description: "No previous bill found to reprint.",
        variant: "destructive",
      });
    }
  };

  const downloadLastBill = () => {
    if (lastOrder) {
      try {
        // Validate and format bill data
        const billData = {
          billNumber: `INV-${lastOrder.id}`,
          date: new Date(lastOrder.createdAt).toLocaleDateString("en-IN"),
          customer: {
            name: lastOrder.customer?.name || "Guest Customer",
            phone: lastOrder.customer?.phone || "-",
            email: lastOrder.customer?.email || undefined,
            address: lastOrder.customer?.address || undefined,
            gstNumber: lastOrder.customer?.gstNumber || undefined,
          },
          items: (lastOrder.items || []).map((item: any) => ({
            name: item.name || "Unknown Product",
            quantity: Number(item.quantity) || 1,
            price: Number(item.price) || 0,
            total: Number(item.price) * Number(item.quantity) || 0,
            hsnCode: item.hsnCode || "8517",
          })),
          subtotal: Number(lastOrder.subtotal) || 0,
          discount: Number(lastOrder.discountPercent) || 0,
          taxRate: Number(lastOrder.taxRate) || 18,
          taxAmount: Number(lastOrder.taxAmount) || 0,
          total: Number(lastOrder.total) || 0,
          paymentMethod: lastOrder.paymentMethod || "Cash",
        };

        // Validate required data
        if (!billData.items.length) {
          throw new Error("No items found in the bill");
        }

        if (billData.total <= 0) {
          throw new Error("Invalid total amount");
        }

        // Debug: Log the bill data
        console.log("Bill data for download:", billData);

        const billGenerator = new BillGenerator();

        // Add a small delay to ensure the generator is ready
        setTimeout(() => {
          try {
            billGenerator.downloadBill(billData);
          } catch (downloadError) {
            console.error("Download error in setTimeout:", downloadError);
            throw downloadError;
          }
        }, 100);

        toast({
          title: "Bill Downloaded",
          description: "Bill PDF has been downloaded successfully.",
        });
      } catch (error) {
        console.error("Error downloading bill:", error);
        toast({
          title: "Download Error",
          description:
            error instanceof Error
              ? error.message
              : "Failed to download bill. Please try again.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "No Bill Found",
        description: "No previous bill found to download.",
        variant: "destructive",
      });
    }
  };

  const processPayment = () => {
    if (cartItems.length === 0 || !paymentMethod) {
      toast({
        title: "Missing Information",
        description: "Please add items and select payment method",
        variant: "destructive",
      });
      return;
    }

    // Show payment confirmation dialog
    setShowPaymentConfirmation(true);
  };

  const confirmPayment = async () => {
    setShowPaymentConfirmation(false);

    // Basic validation per payment method
    if (paymentMethod === "card") {
      const cleanNum = cardDetails.number.replace(/\s+/g, "");
      if (
        !cardDetails.holder ||
        cleanNum.length < 12 ||
        !cardDetails.expiry ||
        cardDetails.cvv.length < 3
      ) {
        toast({
          title: "Invalid Card Details",
          description: "Please enter valid card details",
          variant: "destructive",
        });
        return;
      }
    }
    if (paymentMethod === "upi") {
      if (!upiDetails.vpa || !/^[\w.\-]+@[\w.\-]+$/.test(upiDetails.vpa)) {
        toast({
          title: "Invalid UPI ID",
          description: "Please enter a valid UPI ID (e.g., name@bank)",
          variant: "destructive",
        });
        return;
      }
    }

    // Process the actual payment
    const billData = createBillData(
      cartItems,
      selectedCustomer,
      discount,
      18, // GST rate
      paymentMethod,
    );

    const billGenerator = new BillGenerator();

    // Save order to Supabase database first
    const saveOrderToDatabase = async () => {
      try {
        const orderItems = cartItems.map((item) => ({
          product_id: item.id.toString(),
          product_name: item.name,
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity,
        }));

        const orderData = {
          customer_id: selectedCustomer?.id || null,
          items: orderItems,
          subtotal,
          discount_percent: discount,
          discount_amount: discountAmount,
          tax_rate: taxRate,
          tax_amount: taxAmount,
          total,
          payment_method: paymentMethod,
          payment_details:
            paymentMethod === "card"
              ? {
                  holder: cardDetails.holder,
                  last4: cardDetails.number.replace(/\s+/g, "").slice(-4),
                  expiry: cardDetails.expiry,
                }
              : paymentMethod === "upi"
                ? {
                    vpa: upiDetails.vpa,
                  }
                : null,
        };

        // Save to Supabase database
        const savedOrder = await addOrder(orderData);
        console.log("Order saved to database:", savedOrder);

        return savedOrder;
      } catch (error) {
        console.error("Error saving order to database:", error);
        toast({
          title: "Database Save Warning",
          description:
            "Order completed but may not appear in Bills immediately. Data saved locally.",
          variant: "destructive",
        });
        return null;
      }
    };

    // Save to database
    const savedOrder = await saveOrderToDatabase();

    // Persist order for dashboard analytics (localStorage backup)
    try {
      const ordersRaw = localStorage.getItem("pos_orders");
      const orders = ordersRaw ? JSON.parse(ordersRaw) : [];
      const order = {
        id: savedOrder?.id || Date.now(),
        createdAt: new Date().toISOString(),
        items: cartItems,
        subtotal,
        discountPercent: discount,
        discountAmount,
        taxRate,
        taxAmount,
        total,
        paymentMethod,
        paymentDetails:
          paymentMethod === "card"
            ? {
                holder: cardDetails.holder,
                last4: cardDetails.number.replace(/\s+/g, "").slice(-4),
                expiry: cardDetails.expiry,
              }
            : paymentMethod === "upi"
              ? {
                  vpa: upiDetails.vpa,
                }
              : undefined,
        customer: selectedCustomer,
      };
      localStorage.setItem(
        "pos_orders",
        JSON.stringify([order, ...orders].slice(0, 200)),
      );

      // Update lastOrder state
      setLastOrder(order);

      // Append recent activity
      const activityRaw = localStorage.getItem("recent_activity");
      const activity = activityRaw ? JSON.parse(activityRaw) : [];
      activity.unshift({
        id: order.id,
        type: "sale",
        message: `Sale completed - ${cartItems.length} item(s)`,
        amount: `₹${total.toLocaleString()}`,
        time: new Date().toLocaleTimeString(),
      });
      localStorage.setItem(
        "recent_activity",
        JSON.stringify(activity.slice(0, 50)),
      );

      // Persist/update customer in customer database
      if (selectedCustomer) {
        try {
          const customersRaw = localStorage.getItem("app_customers");
          const customers = customersRaw ? JSON.parse(customersRaw) : [];

          const existingIndex = customers.findIndex(
            (c: any) =>
              c.id === selectedCustomer.id ||
              c.phone === selectedCustomer.phone,
          );
          const today = new Date().toISOString().split("T")[0];
          const loyaltyEarned = Math.floor(total / 100); // 1 point per ₹100

          if (existingIndex >= 0) {
            const existing = customers[existingIndex] || {};
            const updated = {
              ...existing,
              id: selectedCustomer.id,
              name: selectedCustomer.name,
              phone: selectedCustomer.phone,
              email: selectedCustomer.email || existing.email,
              totalPurchases: (existing.totalPurchases || 0) + 1,
              totalSpent: (existing.totalSpent || 0) + total,
              lastPurchase: new Date().toISOString(),
              joinDate: existing.joinDate || today,
              loyaltyPoints: (existing.loyaltyPoints || 0) + loyaltyEarned,
            };
            customers[existingIndex] = updated;
          } else {
            customers.unshift({
              id: selectedCustomer.id,
              name: selectedCustomer.name,
              phone: selectedCustomer.phone,
              email: selectedCustomer.email,
              totalPurchases: 1,
              totalSpent: total,
              lastPurchase: new Date().toISOString(),
              joinDate: today,
              loyaltyPoints: loyaltyEarned,
            });
          }

          localStorage.setItem("app_customers", JSON.stringify(customers));
        } catch {}
      }
    } catch {}

    // Generate and download the bill
    billGenerator.downloadBill(billData);

    // Clear cart and reset form
    setCartItems([]);
    setSelectedCustomer(null);
    setDiscount(0);
    setPaymentMethod("");
    setCardDetails({ holder: "", number: "", expiry: "", cvv: "" });
    setUpiDetails({ vpa: "" });

    toast({
      title: "Payment Successful",
      description: "Payment processed successfully! Bill has been generated.",
    });
  };

  const previewBill = () => {
    if (cartItems.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add items to generate bill preview",
        variant: "destructive",
      });
      return;
    }

    const billData = createBillData(
      cartItems,
      selectedCustomer,
      discount,
      18, // GST rate
      paymentMethod || "Cash",
    );

    const billGenerator = new BillGenerator();
    billGenerator.printBill(billData);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.06),transparent_45%),radial-gradient(ellipse_at_bottom_left,rgba(139,92,246,0.06),transparent_40%)] dark:bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.08),transparent_45%),radial-gradient(ellipse_at_bottom_left,rgba(139,92,246,0.08),transparent_40%)]">
      <div className="space-y-6 p-4 lg:p-6 max-w-[1400px] mx-auto">
        {/* Modern Header */}
        <div className="bg-white/80 dark:bg-slate-800/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Point of Sale
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Scan products, manage cart, and process payments seamlessly
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {lastOrder && (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={viewLastBill}
                    className="border-slate-300 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    View Last Bill
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={reprintLastBill}
                    className="border-slate-300 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    Reprint
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadLastBill}
                    className="border-slate-300 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              )}
              {cartItems.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearCart}
                  className="border-red-300 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Cart
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Main POS Interface */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 lg:gap-7">
          {/* Left Sidebar - Scanner & Search */}
          <div className="xl:col-span-1 space-y-6 lg:space-y-7 lg:sticky lg:top-24 self-start">
            {/* Barcode Scanner */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4">
                <h3 className="text-white font-semibold flex items-center">
                  <ScanLine className="w-5 h-5 mr-2" />
                  Barcode Scanner
                </h3>
              </div>
              <div className="p-4">
                <BarcodeScanner onScan={handleBarcodeScanned} />
              </div>
            </div>

            {/* Customer Selection */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-slate-200 dark:border-slate-700 relative">
              <div className="bg-gradient-to-r from-green-500 to-teal-600 p-4">
                <h3 className="text-white font-semibold flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Customer
                </h3>
              </div>
              <div className="p-4">
                <CustomerSelector
                  selectedCustomer={selectedCustomer}
                  onCustomerSelect={setSelectedCustomer}
                />
              </div>
            </div>

            {/* Product Search */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-slate-200 dark:border-slate-700 relative">
              <div className="bg-gradient-to-r from-orange-500 to-red-600 p-4">
                <h3 className="text-white font-semibold flex items-center">
                  <Search className="w-5 h-5 mr-2" />
                  Product Search
                </h3>
              </div>
              <div className="p-4">
                <div className="space-y-4">
                  <ProductSearchDialog
                    trigger={
                      <Button
                        variant="outline"
                        className="w-full h-12 rounded-lg border-slate-300 hover:bg-slate-50 transition-colors"
                      >
                        <Search className="w-5 h-5 mr-2" />
                        Browse Products
                      </Button>
                    }
                    onAddToCart={addProductToCart}
                  />

                  <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-3 border border-slate-200/60 dark:border-slate-600/60">
                    <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                      <p className="flex items-center">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                        Search by name, SKU, or barcode
                      </p>
                      <p className="flex items-center">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>
                        Browse by category and brand
                      </p>
                      <p className="flex items-center">
                        <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2"></span>
                        Add directly to cart
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - Cart & Billing */}
          <div className="xl:col-span-3 space-y-6 lg:space-y-7">
            {/* Shopping Cart */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-500 to-blue-600 p-4">
                <CardTitle className="text-white flex items-center justify-between">
                  <div className="flex items-center">
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Shopping Cart
                  </div>
                  {cartItems.length > 0 && (
                    <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                      {cartItems.length} item{cartItems.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </CardTitle>
              </div>
              <div className="p-4 lg:p-6">
                {cartItems.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 mx-auto mb-4 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
                      <ShoppingCart className="w-10 h-10 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-400 mb-2">
                      Your cart is empty
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-500">
                      Start scanning products or browse our catalog to add items
                    </p>
                  </div>
                ) : (
                  <div className="overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-slate-200 dark:border-slate-700">
                          <TableHead className="font-semibold">
                            Product
                          </TableHead>
                          <TableHead className="font-semibold text-right">
                            Price
                          </TableHead>
                          <TableHead className="font-semibold text-center">
                            Quantity
                          </TableHead>
                          <TableHead className="font-semibold text-right">
                            Total
                          </TableHead>
                          <TableHead className="w-12"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {cartItems.map((item) => (
                          <TableRow
                            key={item.id}
                            className="border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                          >
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                {item.image ? (
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-12 h-12 rounded-lg object-cover border border-slate-200"
                                  />
                                ) : (
                                  <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                                    <Package className="w-6 h-6 text-slate-400" />
                                  </div>
                                )}
                                <div>
                                  <span className="font-medium text-slate-900 dark:text-slate-100">
                                    {item.name}
                                  </span>
                                  {(() => {
                                    const product = availableProducts.find(
                                      (p) => p.barcode === item.barcode,
                                    );
                                    if (product) {
                                      const currentStock =
                                        product.current_stock || 0;
                                      const trackInventory =
                                        product.track_inventory === true;
                                      if (
                                        trackInventory &&
                                        currentStock <= (product.min_stock || 0)
                                      ) {
                                        return (
                                          <div className="text-xs text-red-600 font-medium">
                                            {currentStock === 0
                                              ? "Out of stock"
                                              : `Only ${currentStock} left`}
                                          </div>
                                        );
                                      } else if (
                                        trackInventory &&
                                        currentStock <=
                                          (product.min_stock || 0) * 2
                                      ) {
                                        return (
                                          <div className="text-xs text-yellow-600 font-medium">
                                            Low stock ({currentStock} left)
                                          </div>
                                        );
                                      }
                                    }
                                    return null;
                                  })()}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-medium text-slate-900 dark:text-slate-100">
                              {formatCurrency(item.price)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center justify-center space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    updateQuantity(item.id, item.quantity - 1)
                                  }
                                  className="w-8 h-8 p-0 border-slate-300 hover:bg-slate-100 rounded-md"
                                >
                                  <Minus className="w-3 h-3" />
                                </Button>
                                <span className="w-8 text-center font-medium text-slate-900 dark:text-slate-100">
                                  {item.quantity}
                                </span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    updateQuantity(item.id, item.quantity + 1)
                                  }
                                  className="w-8 h-8 p-0 border-slate-300 hover:bg-slate-100 rounded-md"
                                >
                                  <Plus className="w-3 h-3" />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-semibold text-slate-900 dark:text-slate-100">
                              {formatCurrency(item.price * item.quantity)}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeItem(item.id)}
                                className="w-8 h-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </div>

            {/* Billing Summary */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500 to-green-600 p-4">
                <CardTitle className="text-white flex items-center justify-between">
                  <div className="flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" />
                    Billing Summary
                  </div>
                  <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-semibold">
                    {formatCurrency(total)}
                  </span>
                </CardTitle>
              </div>
              <div className="p-4 lg:p-6 space-y-6">
                {/* Bill Breakdown */}
                <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4 space-y-3 border border-slate-200/60 dark:border-slate-600/60">
                  <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                    <span>Subtotal</span>
                    <span className="font-medium">
                      {formatCurrency(subtotal)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <Label
                      htmlFor="discount"
                      className="text-slate-600 dark:text-slate-400"
                    >
                      Discount (%)
                    </Label>
                    <Input
                      id="discount"
                      type="number"
                      placeholder="0"
                      className="w-20 text-right border-slate-300 focus:border-blue-500"
                      value={discount}
                      onChange={(e) => setDiscount(Number(e.target.value))}
                    />
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-green-600 font-medium">
                      <span>Discount Amount</span>
                      <span>-{formatCurrency(discountAmount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                    <span>GST (18%)</span>
                    <span className="font-medium">
                      {formatCurrency(taxAmount)}
                    </span>
                  </div>

                  <div className="border-t border-slate-300 dark:border-slate-600 pt-3">
                    <div className="flex justify-between text-xl font-bold text-slate-900 dark:text-slate-100">
                      <span>Total Amount</span>
                      <span className="text-emerald-600">
                        {formatCurrency(total)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment Method Selection */}
                <div className="space-y-4">
                  <Label className="text-slate-700 dark:text-slate-300 font-semibold">
                    Payment Method
                  </Label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      {
                        id: "card",
                        label: "Card",
                        icon: CreditCard,
                        color: "from-blue-500 to-blue-600",
                      },
                      {
                        id: "cash",
                        label: "Cash",
                        icon: null,
                        color: "from-green-500 to-green-600",
                      },
                      {
                        id: "upi",
                        label: "UPI",
                        icon: null,
                        color: "from-purple-500 to-purple-600",
                      },
                    ].map((method) => {
                      const Icon = method.icon;
                      const isSelected = paymentMethod === method.id;
                      return (
                        <Button
                          key={method.id}
                          variant={isSelected ? "default" : "outline"}
                          className={`h-14 rounded-xl relative overflow-hidden transition-all ${
                            isSelected
                              ? `bg-gradient-to-r ${method.color} text-white border-0 shadow-lg`
                              : "border-slate-300 hover:bg-slate-50"
                          }`}
                          onClick={() => setPaymentMethod(method.id)}
                        >
                          {Icon && <Icon className="w-5 h-5 mr-2" />}
                          {method.label}
                          {isSelected && (
                            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
                          )}
                        </Button>
                      );
                    })}
                  </div>
                </div>

                {/* Payment Details */}
                {paymentMethod === "card" && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 space-y-4">
                    <Label className="text-blue-700 dark:text-blue-300 font-semibold">
                      Card Details
                    </Label>
                    <div className="space-y-3">
                      <Input
                        placeholder="Cardholder Name"
                        value={cardDetails.holder}
                        onChange={(e) =>
                          setCardDetails({
                            ...cardDetails,
                            holder: e.target.value,
                          })
                        }
                        className="border-blue-300 focus:border-blue-500"
                      />
                      <Input
                        placeholder="Card Number"
                        inputMode="numeric"
                        value={cardDetails.number}
                        onChange={(e) =>
                          setCardDetails({
                            ...cardDetails,
                            number: e.target.value.replace(/[^0-9\s]/g, ""),
                          })
                        }
                        className="border-blue-300 focus:border-blue-500"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          placeholder="MM/YY"
                          value={cardDetails.expiry}
                          onChange={(e) =>
                            setCardDetails({
                              ...cardDetails,
                              expiry: e.target.value,
                            })
                          }
                          className="border-blue-300 focus:border-blue-500"
                        />
                        <Input
                          placeholder="CVV"
                          inputMode="numeric"
                          value={cardDetails.cvv}
                          onChange={(e) =>
                            setCardDetails({
                              ...cardDetails,
                              cvv: e.target.value.replace(/[^0-9]/g, ""),
                            })
                          }
                          className="border-blue-300 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === "upi" && (
                  <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-4 space-y-4">
                    <Label className="text-purple-700 dark:text-purple-300 font-semibold">
                      UPI Payment
                    </Label>
                    <div className="space-y-4">
                      <Input
                        placeholder="UPI ID (e.g., name@bank)"
                        value={upiDetails.vpa}
                        onChange={(e) =>
                          setUpiDetails({ ...upiDetails, vpa: e.target.value })
                        }
                        className="border-purple-300 focus:border-purple-500"
                      />
                      <div className="flex items-center gap-4">
                        <div className="p-3 border border-purple-300 rounded-lg bg-white">
                          <img
                            alt="UPI QR"
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent("upi://pay?pa=" + (upiDetails.vpa || "example@upi") + "&am=" + total + "&tn=POS%20Payment")}`}
                            className="rounded"
                          />
                        </div>
                        <div className="text-sm text-purple-600 dark:text-purple-400">
                          <p className="font-medium mb-1">
                            Scan QR with your UPI app
                          </p>
                          <p>Or pay directly to the UPI ID above</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                <Button
                  variant="outline"
                  className="w-full h-12 rounded-lg border-slate-300 hover:bg-slate-50 transition-colors"
                  onClick={previewBill}
                  disabled={cartItems.length === 0}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Preview Bill
                </Button>

                <Button
                  className="w-full h-14 text-lg font-semibold rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-lg shadow-emerald-500/20"
                  disabled={cartItems.length === 0 || !paymentMethod}
                  onClick={processPayment}
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  Process Payment - {formatCurrency(total)}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Last Bill Dialog */}
      <Dialog open={showLastBill} onOpenChange={setShowLastBill}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Last Bill - {lastOrder ? `INV-${lastOrder.id}` : ""}
            </DialogTitle>
          </DialogHeader>
          {lastOrder && (
            <div className="space-y-6">
              {/* Bill Header */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Bill Information</h3>
                  <div className="space-y-1 text-sm">
                    <div>
                      <strong>Bill Number:</strong> INV-{lastOrder.id}
                    </div>
                    <div>
                      <strong>Date:</strong>{" "}
                      {new Date(lastOrder.createdAt).toLocaleDateString(
                        "en-IN",
                      )}
                    </div>
                    <div>
                      <strong>Time:</strong>{" "}
                      {new Date(lastOrder.createdAt).toLocaleTimeString(
                        "en-IN",
                      )}
                    </div>
                    <div>
                      <strong>Payment Method:</strong> {lastOrder.paymentMethod}
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Customer Information</h3>
                  <div className="space-y-1 text-sm">
                    <div>
                      <strong>Name:</strong>{" "}
                      {lastOrder.customer?.name || "Guest Customer"}
                    </div>
                    <div>
                      <strong>Phone:</strong> {lastOrder.customer?.phone || "-"}
                    </div>
                    {lastOrder.customer?.email && (
                      <div>
                        <strong>Email:</strong> {lastOrder.customer.email}
                      </div>
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
                    {lastOrder.items?.map((item: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{formatCurrency(item.price)}</TableCell>
                        <TableCell>
                          {formatCurrency(
                            item.total || item.price * item.quantity,
                          )}
                        </TableCell>
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
                    <span>{formatCurrency(lastOrder.subtotal || 0)}</span>
                  </div>
                  {lastOrder.discountPercent > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({lastOrder.discountPercent}%):</span>
                      <span>
                        -{formatCurrency(lastOrder.discountAmount || 0)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>GST ({lastOrder.taxRate || 18}%):</span>
                    <span>{formatCurrency(lastOrder.taxAmount || 0)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>{formatCurrency(lastOrder.total || 0)}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button variant="outline" onClick={reprintLastBill}>
                  <Printer className="w-4 h-4 mr-2" />
                  Reprint
                </Button>
                <Button onClick={downloadLastBill}>
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Payment Confirmation Dialog */}
      <Dialog
        open={showPaymentConfirmation}
        onOpenChange={setShowPaymentConfirmation}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
              <h4 className="font-medium mb-2">Order Summary</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Items:</span>
                  <span>{cartItems.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({discount}%):</span>
                    <span>-{formatCurrency(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>GST (18%):</span>
                  <span>{formatCurrency(taxAmount)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Payment Method</h4>
              <div className="flex items-center space-x-2">
                <CreditCard className="w-4 h-4" />
                <span className="capitalize">{paymentMethod}</span>
              </div>
            </div>

            {selectedCustomer && (
              <div className="space-y-2">
                <h4 className="font-medium">Customer</h4>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  <div>{selectedCustomer.name}</div>
                  <div>{selectedCustomer.phone}</div>
                </div>
              </div>
            )}
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowPaymentConfirmation(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={confirmPayment}
            >
              Confirm Payment
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
