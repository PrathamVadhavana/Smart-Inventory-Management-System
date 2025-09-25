import { createClient } from "@supabase/supabase-js";

// These will be set via environment variables
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || "https://your-project.supabase.co";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || "your-anon-key";
const supabaseRedirectUrl =
  import.meta.env.VITE_SUPABASE_REDIRECT_URL ||
  (typeof window !== "undefined"
    ? window.location.origin + "/dashboard"
    : undefined);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Product {
  id: string;
  name: string;
  description?: string;
  sku: string;
  barcode?: string;
  category: string;
  unit_price: number;
  current_stock: number;
  min_stock: number;
  track_inventory: boolean;
  images?: string[];
  hsn_code?: string;
  created_at: string;
  updated_at: string;
  supplier_id?: string | null;
  supplier_name?: string | null;
  suppliers?: { name: string } | null; // For Supabase joins
}

export interface Supplier {
  id: string;
  name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  created_at: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  gst_number?: string;
  total_purchases: number;
  total_spent: number;
  last_purchase: string;
  join_date: string;
  loyalty_points: number;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  customer_id?: string;
  items: OrderItem[];
  subtotal: number;
  discount_percent: number;
  discount_amount: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  payment_method: string;
  payment_details?: any;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Activity {
  id: string;
  type:
    | "sale"
    | "product_added"
    | "low_stock"
    | "customer_registered"
    | "bulk_import";
  message: string;
  amount?: number;
  metadata?: any;
  created_at: string;
}
