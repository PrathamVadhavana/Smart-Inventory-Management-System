import { useState, useEffect, useCallback } from 'react'
import { supabase, Product, Customer, Order, Activity, Supplier } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

// Products hook
export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('products')
        .select(`*,suppliers ( name )`)
        .order('created_at', { ascending: false })

      if (error) throw error
      setProducts(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products')
      toast({
        title: "Error",
        description: "Failed to fetch products",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const addProduct = async (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([product])
        .select()
        .single()

      if (error) throw error
      setProducts(prev => [data, ...prev])
      toast({
        title: "Success",
        description: "Product added successfully",
      })
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add product'
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      throw err
    }
  }

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setProducts(prev => prev.map(p => p.id === id ? data : p))
      toast({
        title: "Success",
        description: "Product updated successfully",
      })
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update product'
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      throw err
    }
  }

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)

      if (error) throw error
      setProducts(prev => prev.filter(p => p.id !== id))
      toast({
        title: "Success",
        description: "Product deleted successfully",
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete product'
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      throw err
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  return {
    products,
    loading,
    error,
    fetchProducts,
    addProduct,
    updateProduct,
    deleteProduct,
  }
}

// Suppliers hook
export function useSuppliers() {
  const { toast } = useToast();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSuppliers = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("suppliers")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching suppliers:", error);
      toast({
        title: "Error",
        description: "Could not fetch suppliers.",
        variant: "destructive",
      });
    } else {
      setSuppliers(data || []);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const addSupplier = async (supplierData: Omit<Supplier, "id" | "created_at">) => {
    const { data, error } = await supabase
      .from("suppliers")
      .insert([supplierData])
      .select()
      .single(); // .single() gets the new object back

    if (error) {
      console.error("Error adding supplier:", error);
      toast({
        title: "Error",
        description: "Could not add the new supplier.",
        variant: "destructive",
      });
      return null;
    }

    setSuppliers((currentSuppliers) => [...currentSuppliers, data]);
    toast({
      title: "Success",
      description: "Supplier added successfully.",
    });
    return data;
  };

  const updateSupplier = async (id: string, supplierData: Partial<Supplier>) => {
    const { data, error } = await supabase
      .from("suppliers")
      .update(supplierData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating supplier:", error);
      toast({
        title: "Error",
        description: "Could not update the supplier.",
        variant: "destructive",
      });
      return null;
    }

    setSuppliers((currentSuppliers) =>
      currentSuppliers.map((s) => (s.id === id ? data : s))
    );
    toast({
      title: "Success",
      description: "Supplier updated successfully.",
    });
    return data;
  };

  const deleteSupplier = async (id: string) => {
    const { error } = await supabase.from("suppliers").delete().eq("id", id);

    if (error) {
      console.error("Error deleting supplier:", error);
      toast({
        title: "Error",
        description: "Could not delete the supplier.",
        variant: "destructive",
      });
      return false;
    }

    setSuppliers((currentSuppliers) =>
      currentSuppliers.filter((s) => s.id !== id)
    );
    toast({
      title: "Success",
      description: "Supplier deleted successfully.",
    });
    return true;
  };

  return {
    suppliers,
    loading,
    fetchSuppliers,
    addSupplier,
    updateSupplier,
    deleteSupplier,
  };
}

// Customers hook
export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setCustomers(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch customers')
      toast({
        title: "Error",
        description: "Failed to fetch customers",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const addCustomer = async (customer: Omit<Customer, 'id' | 'created_at' | 'updated_at' | 'total_purchases' | 'total_spent' | 'last_purchase' | 'join_date' | 'loyalty_points'>) => {
    try {
      const now = new Date().toISOString()
      const customerData = {
        ...customer,
        total_purchases: 0,
        total_spent: 0,
        last_purchase: now,
        join_date: now,
        loyalty_points: 0,
      }

      const { data, error } = await supabase
        .from('customers')
        .insert([customerData])
        .select()
        .single()

      if (error) throw error
      setCustomers(prev => [data, ...prev])
      toast({
        title: "Success",
        description: "Customer added successfully",
      })
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add customer'
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      throw err
    }
  }

  const updateCustomer = async (id: string, updates: Partial<Customer>) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setCustomers(prev => prev.map(c => c.id === id ? data : c))
      toast({
        title: "Success",
        description: "Customer updated successfully",
      })
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update customer'
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      throw err
    }
  }

  const deleteCustomer = async (id: string) => {
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id)

      if (error) throw error
      setCustomers(prev => prev.filter(c => c.id !== id))
      toast({
        title: "Success",
        description: "Customer deleted successfully",
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete customer'
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      throw err
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [])

  return {
    customers,
    loading,
    error,
    fetchCustomers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
  }
}

// Orders hook
export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          customers (
            name,
            phone,
            email
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setOrders(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders')
      toast({
        title: "Error",
        description: "Failed to fetch orders",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const addOrder = async (order: Omit<Order, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert([order])
        .select(`
          *,
          customers (
            name,
            phone,
            email
          )
        `)
        .single()

      if (error) throw error
      setOrders(prev => [data, ...prev])
      toast({
        title: "Success",
        description: "Order created successfully",
      })
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create order'
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      throw err
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  return {
    orders,
    loading,
    error,
    fetchOrders,
    addOrder,
  }
}

// Activities hook
export const useActivities = () => {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchActivities = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      setActivities(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch activities')
    } finally {
      setLoading(false)
    }
  }

  const addActivity = async (activity: Omit<Activity, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('activities')
        .insert([activity])
        .select()
        .single()

      if (error) throw error
      setActivities(prev => [data, ...prev.slice(0, 49)]) // Keep only latest 50
      return data
    } catch (err) {
      console.error('Failed to add activity:', err)
      throw err
    }
  }

  useEffect(() => {
    fetchActivities()
  }, [])

  return {
    activities,
    loading,
    error,
    fetchActivities,
    addActivity,
  }
}


