import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { User, Plus, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCustomers } from "@/hooks/useSupabase";

interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  totalPurchases: number;
}

const demoCustomers: Customer[] = [];

interface CustomerSelectorProps {
  selectedCustomer?: Customer | null;
  onCustomerSelect?: (customer: Customer | null) => void;
}

export default function CustomerSelector({ selectedCustomer, onCustomerSelect }: CustomerSelectorProps) {
  const { customers: supabaseCustomers, addCustomer } = useCustomers();
  const [open, setOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    phone: "",
    email: "",
  });

  useEffect(() => {
    try {
      const mapped = supabaseCustomers.map((c: any) => ({
        id: c.id,
        name: c.name,
        phone: c.phone,
        email: c.email,
        totalPurchases: c.total_purchases || 0,
      }));
      setCustomers(mapped);
    } catch {
      setCustomers([]);
    }
  }, [supabaseCustomers]);

  const handleCustomerSelect = (customer: Customer | null) => {
    onCustomerSelect?.(customer);
    setOpen(false);
  };

  const handleAddCustomer = async () => {
    if (newCustomer.name && newCustomer.phone) {
      try {
        const customerData = {
          name: newCustomer.name,
          phone: newCustomer.phone,
          email: newCustomer.email || undefined,
        };

        await addCustomer(customerData);

        // Create a temporary customer object for immediate selection
        const customer: Customer = {
          id: 'temp-' + Date.now(),
          name: newCustomer.name,
          phone: newCustomer.phone,
          email: newCustomer.email,
          totalPurchases: 0,
        };

        handleCustomerSelect(customer);
        setNewCustomer({ name: "", phone: "", email: "" });
        setDialogOpen(false);
      } catch (error) {
        console.error('Error adding customer:', error);
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <User className="w-5 h-5 mr-2" />
          Customer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Customer Selection */}
        <div className="space-y-2">
          <Label>Select Customer</Label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between h-12 text-left"
              >
                {selectedCustomer
                  ? selectedCustomer.name
                  : "Search customers..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" side="bottom" sideOffset={8} className="min-w-[14rem] w-[min(24rem,calc(100vw-2rem))] sm:w-[24rem] max-h-80 overflow-auto p-0">
              <Command>
                <CommandInput placeholder="Search customers..." />
                <CommandEmpty>No customer found.</CommandEmpty>
                <CommandGroup>
                  <CommandItem
                    onSelect={() => handleCustomerSelect(null)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        !selectedCustomer ? "opacity-100" : "opacity-0"
                      )}
                    />
                    Guest Customer
                  </CommandItem>
                  {customers.map((customer) => (
                    <CommandItem
                      key={customer.id}
                      onSelect={() => handleCustomerSelect(customer)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedCustomer?.id === customer.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex-1">
                        <p className="font-medium">{customer.name}</p>
                        <p className="text-xs text-muted-foreground">{customer.phone}</p>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Selected Customer Info */}
        {selectedCustomer && (
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between gap-4">
              <div className="font-medium text-base leading-6">{selectedCustomer.name}</div>
              <div className="flex-shrink-0 whitespace-nowrap text-sm">
                Purchases: <span className="font-semibold">{selectedCustomer.totalPurchases}</span>
              </div>
            </div>
            <div className="mt-1 text-sm text-muted-foreground break-words">
              {selectedCustomer.phone}
              {selectedCustomer.email && (
                <span>{` • ${selectedCustomer.email}`}</span>
              )}
            </div>
          </div>
        )}

        {/* Add New Customer */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add New Customer
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Customer</DialogTitle>
              <DialogDescription>
                Create a new customer profile for better tracking and service.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="customer-name">Full Name *</Label>
                <Input
                  id="customer-name"
                  placeholder="Enter customer name"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer-phone">Phone Number *</Label>
                <Input
                  id="customer-phone"
                  placeholder="+91 XXXXX XXXXX"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer-email">Email (Optional)</Label>
                <Input
                  id="customer-email"
                  type="email"
                  placeholder="customer@example.com"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAddCustomer}
                disabled={!newCustomer.name || !newCustomer.phone}
              >
                Add Customer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
