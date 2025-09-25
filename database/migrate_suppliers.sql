-- Migration script to update existing products with supplier IDs
-- This script assigns suppliers to existing products based on product names/brands

-- Update iPhone 15 Pro to Apple
UPDATE products 
SET supplier_id = (SELECT id FROM suppliers WHERE name = 'Apple Inc.' LIMIT 1)
WHERE name LIKE '%iPhone%' OR name LIKE '%MacBook%' OR name LIKE '%AirPods%' OR name LIKE '%Magic Mouse%';

-- Update Samsung products to Samsung Electronics
UPDATE products 
SET supplier_id = (SELECT id FROM suppliers WHERE name = 'Samsung Electronics' LIMIT 1)
WHERE name LIKE '%Samsung%' OR name LIKE '%Galaxy%';

-- Update other products to Tech Distributors Ltd. as a general supplier
UPDATE products 
SET supplier_id = (SELECT id FROM suppliers WHERE name = 'Tech Distributors Ltd.' LIMIT 1)
WHERE supplier_id IS NULL AND (
    name LIKE '%HP%' OR 
    name LIKE '%Dell%' OR 
    name LIKE '%Lenovo%' OR
    category = 'Laptops' OR
    category = 'Accessories' OR
    category = 'Audio'
);

-- For any remaining products without suppliers, assign to Electronics Wholesale Co.
UPDATE products 
SET supplier_id = (SELECT id FROM suppliers WHERE name = 'Electronics Wholesale Co.' LIMIT 1)
WHERE supplier_id IS NULL;