-- =====================================================
-- RESTAURANT ORDERING SYSTEM - DATABASE SCHEMA
-- =====================================================
-- Database: PostgreSQL (Supabase)
-- Security: Row Level Security (RLS) enabled
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ORDERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Order identification
  order_number TEXT UNIQUE NOT NULL,
  
  -- Razorpay IDs
  razorpay_order_id TEXT UNIQUE NOT NULL,
  razorpay_payment_id TEXT UNIQUE,
  
  -- Customer information
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  
  -- Order details
  items JSONB NOT NULL, -- Array of items with {id, name, price, quantity, total}
  total_amount DECIMAL(10, 2) NOT NULL,
  
  -- Status tracking
  payment_status TEXT NOT NULL DEFAULT 'pending',
    -- pending | paid | failed | refunded
  
  order_status TEXT NOT NULL DEFAULT 'awaiting_payment',
    -- awaiting_payment | paid | preparing | ready | delivered | cancelled
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  paid_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_payment_status CHECK (
    payment_status IN ('pending', 'paid', 'failed', 'refunded')
  ),
  CONSTRAINT valid_order_status CHECK (
    order_status IN (
      'awaiting_payment',
      'paid',
      'preparing',
      'ready',
      'delivered',
      'cancelled'
    )
  ),
  CONSTRAINT valid_amount CHECK (total_amount >= 50 AND total_amount <= 10000),
  CONSTRAINT valid_phone CHECK (customer_phone ~ '^[6-9][0-9]{9}$')
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_razorpay_order_id ON orders(razorpay_order_id);
CREATE INDEX idx_orders_razorpay_payment_id ON orders(razorpay_payment_id);
CREATE INDEX idx_orders_customer_phone ON orders(customer_phone);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_order_status ON orders(order_status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================
-- Enable RLS on orders table
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Policy: Customers can view their own orders (by phone number)
CREATE POLICY "Customers can view own orders"
  ON orders
  FOR SELECT
  USING (
    customer_phone = current_setting('request.jwt.claims', true)::json->>'phone'
    OR auth.role() = 'service_role' -- Backend service role has full access
  );

-- Policy: Only service role can insert orders
CREATE POLICY "Only service role can insert orders"
  ON orders
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- Policy: Only service role can update orders
CREATE POLICY "Only service role can update orders"
  ON orders
  FOR UPDATE
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Policy: No deletion allowed (soft delete with status changes)
CREATE POLICY "No deletion allowed"
  ON orders
  FOR DELETE
  USING (false);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function: Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-update updated_at on orders table
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- MENU ITEMS TABLE (Optional - for dynamic menu)
-- =====================================================
CREATE TABLE IF NOT EXISTS menu_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_price CHECK (price > 0)
);

-- Enable RLS on menu_items
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can view available menu items
CREATE POLICY "Anyone can view available menu items"
  ON menu_items
  FOR SELECT
  USING (is_available = true);

-- Policy: Only service role can modify menu
CREATE POLICY "Only service role can modify menu"
  ON menu_items
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Index for menu items
CREATE INDEX idx_menu_items_category ON menu_items(category);
CREATE INDEX idx_menu_items_available ON menu_items(is_available);

-- =====================================================
-- SEED DATA - SAMPLE MENU ITEMS
-- =====================================================
INSERT INTO menu_items (id, name, description, price, category, image_url) VALUES
  ('paneer-tikka', 'Paneer Tikka', 'Grilled cottage cheese marinated in spices', 299.00, 'Appetizers', '/images/paneer-tikka.jpg'),
  ('butter-chicken', 'Butter Chicken', 'Creamy tomato-based chicken curry', 349.00, 'Main Course', '/images/butter-chicken.jpg'),
  ('dal-makhani', 'Dal Makhani', 'Black lentils cooked in butter and cream', 249.00, 'Main Course', '/images/dal-makhani.jpg'),
  ('biryani', 'Chicken Biryani', 'Aromatic basmati rice with chicken', 399.00, 'Main Course', '/images/biryani.jpg'),
  ('naan', 'Butter Naan', 'Soft flatbread brushed with butter', 49.00, 'Breads', '/images/naan.jpg'),
  ('gulab-jamun', 'Gulab Jamun', 'Sweet milk dumplings in sugar syrup', 99.00, 'Desserts', '/images/gulab-jamun.jpg')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- ANALYTICS VIEWS (Optional)
-- =====================================================

-- View: Daily sales summary
CREATE OR REPLACE VIEW daily_sales AS
SELECT
  DATE(created_at) as date,
  COUNT(*) as total_orders,
  SUM(CASE WHEN payment_status = 'paid' THEN 1 ELSE 0 END) as paid_orders,
  SUM(CASE WHEN payment_status = 'paid' THEN total_amount ELSE 0 END) as revenue
FROM orders
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- View: Popular items
CREATE OR REPLACE VIEW popular_items AS
SELECT
  item->>'name' as item_name,
  COUNT(*) as order_count,
  SUM((item->>'quantity')::int) as total_quantity,
  SUM((item->>'total')::decimal) as total_revenue
FROM orders,
  jsonb_array_elements(items) as item
WHERE payment_status = 'paid'
GROUP BY item->>'name'
ORDER BY total_quantity DESC;

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE orders IS 'Stores all customer orders with payment and status tracking';
COMMENT ON TABLE menu_items IS 'Restaurant menu items with prices and availability';
COMMENT ON COLUMN orders.items IS 'JSONB array of order items with verified server-side prices';
COMMENT ON COLUMN orders.payment_status IS 'Payment status: pending, paid, failed, refunded';
COMMENT ON COLUMN orders.order_status IS 'Order fulfillment status';
