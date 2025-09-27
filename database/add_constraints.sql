-- Add unique constraints to existing tables
-- Run this in your Supabase SQL Editor if you get constraint errors

-- Add supplier_name column to products if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'products' AND column_name = 'supplier_name'
    ) THEN
        ALTER TABLE products ADD COLUMN supplier_name VARCHAR(255);
    END IF;
END $$;

-- Add unique constraint to customers.phone if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'customers_phone_key' 
        AND conrelid = 'customers'::regclass
    ) THEN
        ALTER TABLE customers ADD CONSTRAINT customers_phone_key UNIQUE (phone);
    END IF;
END $$;

-- Add unique constraint to products.sku if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'products_sku_key' 
        AND conrelid = 'products'::regclass
    ) THEN
        ALTER TABLE products ADD CONSTRAINT products_sku_key UNIQUE (sku);
    END IF;
END $$;

-- Add unique constraint to products.barcode if it doesn't exist (optional)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'products_barcode_key' 
        AND conrelid = 'products'::regclass
    ) THEN
        ALTER TABLE products ADD CONSTRAINT products_barcode_key UNIQUE (barcode);
    END IF;
END $$;

-- Verify constraints were added
SELECT 
    tc.table_name, 
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name IN ('customers', 'products')
    AND tc.constraint_type = 'UNIQUE'
ORDER BY tc.table_name, tc.constraint_name;
