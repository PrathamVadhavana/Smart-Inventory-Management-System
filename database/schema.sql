-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sku VARCHAR(100) UNIQUE NOT NULL,
    barcode VARCHAR(100),
    category VARCHAR(100) NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    current_stock INTEGER DEFAULT 0,
    min_stock INTEGER DEFAULT 0,
    track_inventory BOOLEAN DEFAULT true,
    images TEXT[], -- Array of image URLs
    hsn_code VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255),
    address TEXT,
    gst_number VARCHAR(20),
    total_purchases INTEGER DEFAULT 0,
    total_spent DECIMAL(12,2) DEFAULT 0,
    last_purchase TIMESTAMP WITH TIME ZONE,
    join_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    loyalty_points INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    items JSONB NOT NULL, -- Array of order items
    subtotal DECIMAL(12,2) NOT NULL,
    discount_percent DECIMAL(5,2) DEFAULT 0,
    discount_amount DECIMAL(12,2) DEFAULT 0,
    tax_rate DECIMAL(5,2) DEFAULT 18,
    tax_amount DECIMAL(12,2) NOT NULL,
    total DECIMAL(12,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_details JSONB, -- Store payment-specific details
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create activities table for tracking system events
CREATE TABLE IF NOT EXISTS activities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    type VARCHAR(50) NOT NULL, -- 'sale', 'product_added', 'low_stock', 'customer_registered', 'bulk_import'
    message TEXT NOT NULL,
    amount DECIMAL(12,2), -- For sales and financial activities
    metadata JSONB, -- Additional data specific to activity type
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_low_stock ON products(current_stock, min_stock) WHERE track_inventory = true;

CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_loyalty ON customers(loyalty_points);

CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_payment_method ON orders(payment_method);

CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(type);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to update customer stats after order
CREATE OR REPLACE FUNCTION update_customer_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update customer's total purchases and spent amount
    UPDATE customers 
    SET 
        total_purchases = total_purchases + 1,
        total_spent = total_spent + NEW.total,
        last_purchase = NEW.created_at,
        loyalty_points = loyalty_points + FLOOR(NEW.total / 100) -- 1 point per ₹100
    WHERE id = NEW.customer_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to update customer stats
CREATE TRIGGER update_customer_stats_trigger 
    AFTER INSERT ON orders
    FOR EACH ROW 
    WHEN (NEW.customer_id IS NOT NULL)
    EXECUTE FUNCTION update_customer_stats();

-- Create function to log activities
CREATE OR REPLACE FUNCTION log_activity()
RETURNS TRIGGER AS $$
BEGIN
    -- Log order creation
    IF TG_TABLE_NAME = 'orders' AND TG_OP = 'INSERT' THEN
        INSERT INTO activities (type, message, amount, metadata)
        VALUES (
            'sale',
            'New sale completed - Order #' || NEW.id,
            NEW.total,
            jsonb_build_object('order_id', NEW.id, 'customer_id', NEW.customer_id, 'payment_method', NEW.payment_method)
        );
    END IF;
    
    -- Log product addition
    IF TG_TABLE_NAME = 'products' AND TG_OP = 'INSERT' THEN
        INSERT INTO activities (type, message, metadata)
        VALUES (
            'product_added',
            'Product added to inventory: ' || NEW.name,
            jsonb_build_object('product_id', NEW.id, 'product_name', NEW.name, 'category', NEW.category)
        );
    END IF;
    
    -- Log customer registration
    IF TG_TABLE_NAME = 'customers' AND TG_OP = 'INSERT' THEN
        INSERT INTO activities (type, message, metadata)
        VALUES (
            'customer_registered',
            'New customer registered: ' || NEW.name,
            jsonb_build_object('customer_id', NEW.id, 'customer_name', NEW.name, 'phone', NEW.phone)
        );
    END IF;
    
    -- Log low stock alerts
    IF TG_TABLE_NAME = 'products' AND TG_OP = 'UPDATE' THEN
        IF OLD.current_stock > OLD.min_stock AND NEW.current_stock <= NEW.min_stock AND NEW.track_inventory = true THEN
            INSERT INTO activities (type, message, metadata)
            VALUES (
                'low_stock',
                'Low stock alert: ' || NEW.name || ' (' || NEW.current_stock || ' left)',
                jsonb_build_object('product_id', NEW.id, 'product_name', NEW.name, 'current_stock', NEW.current_stock, 'min_stock', NEW.min_stock)
            );
        END IF;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Create triggers for activity logging
CREATE TRIGGER log_order_activity 
    AFTER INSERT ON orders
    FOR EACH ROW EXECUTE FUNCTION log_activity();

CREATE TRIGGER log_product_activity 
    AFTER INSERT OR UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION log_activity();

CREATE TRIGGER log_customer_activity 
    AFTER INSERT ON customers
    FOR EACH ROW EXECUTE FUNCTION log_activity();

-- Insert some sample data
INSERT INTO products (name, description, sku, barcode, category, unit_price, current_stock, min_stock, track_inventory, hsn_code) VALUES
('iPhone 15 Pro', 'Latest iPhone with advanced features', 'IPH15PRO', '1234567890123', 'Electronics', 99999.00, 10, 5, true, '8517'),
('Samsung Galaxy S24', 'Premium Android smartphone', 'SGS24', '1234567890124', 'Electronics', 89999.00, 8, 3, true, '8517'),
('MacBook Pro M3', 'Professional laptop for creators', 'MBPM3', '1234567890125', 'Laptops', 199999.00, 5, 2, true, '8471'),
('AirPods Pro', 'Wireless earbuds with noise cancellation', 'APP', '1234567890126', 'Audio', 24999.00, 15, 5, true, '8518'),
('Magic Mouse', 'Wireless mouse for Mac', 'MM', '1234567890127', 'Accessories', 8999.00, 20, 10, true, '8471')
ON CONFLICT (sku) DO NOTHING;

INSERT INTO customers (name, phone, email, address, gst_number) VALUES
('John Doe', '+91 98765 43210', 'john@example.com', '123 Main St, City, State', '22AAAAA0000A1Z5'),
('Jane Smith', '+91 98765 43211', 'jane@example.com', '456 Oak Ave, City, State', '22BBBBB0000B2Z6'),
('Bob Johnson', '+91 98765 43212', 'bob@example.com', '789 Pine Rd, City, State', NULL)
ON CONFLICT DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (you can modify these based on your auth requirements)
CREATE POLICY "Allow all operations on products" ON products FOR ALL USING (true);
CREATE POLICY "Allow all operations on customers" ON customers FOR ALL USING (true);
CREATE POLICY "Allow all operations on orders" ON orders FOR ALL USING (true);
CREATE POLICY "Allow all operations on activities" ON activities FOR ALL USING (true);

