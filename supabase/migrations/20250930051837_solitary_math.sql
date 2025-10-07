/*
  # Belgian Perfume Consignment Management System - Initial Schema

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `name` (text)
      - `email` (text, unique)
      - `role` (text, check constraint for valid roles)
      - `area` (text)
      - `created_at` (timestamp)

    - `products`
      - `id` (uuid, primary key)
      - `name` (text)
      - `sku` (text, unique)
      - `price` (numeric)
      - `created_at` (timestamp)

    - `stores`
      - `id` (uuid, primary key)
      - `name` (text)
      - `area` (text)
      - `created_at` (timestamp)

    - `stock`
      - `id` (uuid, primary key)
      - `product_id` (uuid, foreign key to products)
      - `store_id` (uuid, foreign key to stores)
      - `quantity` (integer)
      - Unique constraint on (product_id, store_id)

    - `sales_transactions`
      - `id` (uuid, primary key)
      - `product_id` (uuid, foreign key to products)
      - `salesman_id` (uuid, foreign key to users)
      - `store_id` (uuid, foreign key to stores)
      - `quantity` (integer)
      - `total_price` (numeric)
      - `transaction_date` (timestamp)

    - `distribution`
      - `id` (uuid, primary key)
      - `product_id` (uuid, foreign key to products)
      - `from_store_id` (uuid, foreign key to stores)
      - `to_store_id` (uuid, foreign key to stores)
      - `quantity` (integer)
      - `distribution_date` (timestamp)
      - `status` (text, default 'pending')

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for each role
    - Users can only see data relevant to their role and area

  3. Sample Data
    - Demo users with different roles
    - Sample products (Belgian perfumes)
    - Sample stores in different areas
    - Initial stock data
*/

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'sales', 'outlet', 'gudang');
CREATE TYPE distribution_status AS ENUM ('pending', 'completed');

-- Create users table (extends auth.users)
CREATE TABLE IF NOT EXISTS users (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'sales',
  area text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  sku text UNIQUE NOT NULL,
  price numeric(12,2) NOT NULL CHECK (price >= 0),
  created_at timestamptz DEFAULT now()
);

-- Create stores table
CREATE TABLE IF NOT EXISTS stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  area text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create stock table
CREATE TABLE IF NOT EXISTS stock (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  store_id uuid REFERENCES stores(id) ON DELETE CASCADE NOT NULL,
  quantity integer NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  created_at timestamptz DEFAULT now(),
  UNIQUE(product_id, store_id)
);

-- Create sales_transactions table
CREATE TABLE IF NOT EXISTS sales_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE RESTRICT NOT NULL,
  salesman_id uuid REFERENCES users(id) ON DELETE RESTRICT NOT NULL,
  store_id uuid REFERENCES stores(id) ON DELETE RESTRICT NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  total_price numeric(12,2) NOT NULL CHECK (total_price > 0),
  transaction_date timestamptz DEFAULT now()
);

-- Create distribution table
CREATE TABLE IF NOT EXISTS distribution (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE RESTRICT NOT NULL,
  from_store_id uuid REFERENCES stores(id) ON DELETE RESTRICT NOT NULL,
  to_store_id uuid REFERENCES stores(id) ON DELETE RESTRICT NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  distribution_date timestamptz DEFAULT now(),
  status distribution_status DEFAULT 'pending',
  CHECK (from_store_id != to_store_id)
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE distribution ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can read own profile" ON users
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all users" ON users
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert users" ON users
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update users" ON users
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create policies for products table
CREATE POLICY "All authenticated users can read products" ON products
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins and warehouse can manage products" ON products
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('admin', 'gudang')
    )
  );

-- Create policies for stores table
CREATE POLICY "All authenticated users can read stores" ON stores
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins can manage stores" ON stores
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create policies for stock table
CREATE POLICY "Users can read relevant stock" ON stock
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() 
      AND (
        u.role = 'admin' OR
        (u.role = 'gudang') OR
        (u.role = 'outlet' AND EXISTS (
          SELECT 1 FROM stores s 
          WHERE s.id = stock.store_id AND s.area = u.area
        ))
      )
    )
  );

CREATE POLICY "Admins and warehouse can manage stock" ON stock
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('admin', 'gudang')
    )
  );

-- Create policies for sales_transactions table
CREATE POLICY "Users can read relevant transactions" ON sales_transactions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() 
      AND (
        u.role = 'admin' OR
        (u.role = 'sales' AND u.id = sales_transactions.salesman_id) OR
        (u.role = 'outlet' AND EXISTS (
          SELECT 1 FROM stores s 
          WHERE s.id = sales_transactions.store_id AND s.area = u.area
        ))
      )
    )
  );

CREATE POLICY "Sales and outlets can create transactions" ON sales_transactions
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() 
      AND (
        u.role = 'admin' OR
        u.role = 'sales' OR
        (u.role = 'outlet' AND EXISTS (
          SELECT 1 FROM stores s 
          WHERE s.id = sales_transactions.store_id AND s.area = u.area
        ))
      )
    )
  );

-- Create policies for distribution table
CREATE POLICY "Admins and warehouse can read distributions" ON distribution
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('admin', 'gudang')
    )
  );

CREATE POLICY "Admins and warehouse can manage distributions" ON distribution
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('admin', 'gudang')
    )
  );

-- Insert sample data
INSERT INTO products (name, sku, price) VALUES
  ('Belgian Rose Parfum', 'BRP-001', 150000),
  ('Brussels Lavender Eau de Toilette', 'BLE-002', 120000),
  ('Antwerp Vanilla Cologne', 'AVC-003', 180000),
  ('Ghent Jasmine Perfume', 'GJP-004', 200000),
  ('Bruges Sandalwood Essence', 'BSE-005', 220000),
  ('Leuven Citrus Fresh', 'LCF-006', 110000),
  ('Mechelen Amber Musk', 'MAM-007', 190000),
  ('Namur Berry Bliss', 'NBB-008', 160000);

INSERT INTO stores (name, area) VALUES
  ('Central Warehouse', 'Jakarta Pusat'),
  ('North Jakarta Outlet', 'Jakarta Utara'),
  ('South Jakarta Outlet', 'Jakarta Selatan'),
  ('Surabaya Branch', 'Surabaya'),
  ('Bandung Store', 'Bandung'),
  ('Medan Outlet', 'Medan'),
  ('Makassar Branch', 'Makassar');

-- Note: User data will be inserted via the application when users sign up
-- The following would be inserted through the app's user creation process:

-- Demo users (these will be created through the auth system):
-- admin@example.com / 123456 (admin, Jakarta Pusat)
-- sales@example.com / 123456 (sales, Jakarta)  
-- outlet@example.com / 123456 (outlet, Jakarta Utara)
-- gudang@example.com / 123456 (gudang, Jakarta Pusat)

-- Insert initial stock for central warehouse
DO $$
DECLARE
    warehouse_id uuid;
    product_record RECORD;
BEGIN
    -- Get warehouse ID
    SELECT id INTO warehouse_id FROM stores WHERE name = 'Central Warehouse';
    
    -- Insert stock for each product
    FOR product_record IN SELECT id FROM products LOOP
        INSERT INTO stock (product_id, store_id, quantity) 
        VALUES (product_record.id, warehouse_id, 100);
    END LOOP;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sales_transactions_date ON sales_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_sales_transactions_salesman ON sales_transactions(salesman_id);
CREATE INDEX IF NOT EXISTS idx_sales_transactions_store ON sales_transactions(store_id);
CREATE INDEX IF NOT EXISTS idx_stock_product_store ON stock(product_id, store_id);
CREATE INDEX IF NOT EXISTS idx_distribution_date ON distribution(distribution_date);
CREATE INDEX IF NOT EXISTS idx_distribution_status ON distribution(status);