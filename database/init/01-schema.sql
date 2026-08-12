CREATE TABLE ingredients (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  quantity NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  unit TEXT NOT NULL,
  reorder_level NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (reorder_level >= 0),
  cost_per_unit NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (cost_per_unit >= 0),
  supplier TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  flavor TEXT NOT NULL,
  package_size TEXT NOT NULL,
  quantity_in_stock INTEGER NOT NULL DEFAULT 0 CHECK (quantity_in_stock >= 0),
  reorder_level INTEGER NOT NULL DEFAULT 0 CHECK (reorder_level >= 0),
  unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (unit_price >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE inventory_transactions (
  id SERIAL PRIMARY KEY,
  inventory_type TEXT NOT NULL CHECK (inventory_type IN ('INGREDIENT', 'PRODUCT')),
  ingredient_id INTEGER REFERENCES ingredients(id) ON DELETE RESTRICT,
  product_id INTEGER REFERENCES products(id) ON DELETE RESTRICT,
  item_id INTEGER GENERATED ALWAYS AS (COALESCE(ingredient_id, product_id)) STORED,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('RECEIVED', 'USED', 'PRODUCED', 'SHIPPED', 'ADJUSTMENT')),
  quantity NUMERIC(12, 2) NOT NULL CHECK (quantity > 0),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT inventory_transaction_item_check CHECK (
    (inventory_type = 'INGREDIENT' AND ingredient_id IS NOT NULL AND product_id IS NULL)
    OR
    (inventory_type = 'PRODUCT' AND product_id IS NOT NULL AND ingredient_id IS NULL)
  )
);

CREATE TABLE flavor_mixes (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  ingredients TEXT[] NOT NULL,
  estimated_cost NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (estimated_cost >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ingredients_low_stock ON ingredients (quantity, reorder_level);
CREATE INDEX idx_products_low_stock ON products (quantity_in_stock, reorder_level);
CREATE INDEX idx_inventory_transactions_created_at ON inventory_transactions (created_at DESC);
CREATE INDEX idx_inventory_transactions_ingredient_id ON inventory_transactions (ingredient_id);
CREATE INDEX idx_inventory_transactions_product_id ON inventory_transactions (product_id);
CREATE INDEX idx_flavor_mixes_created_at ON flavor_mixes (created_at DESC);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_ingredients_updated_at
BEFORE UPDATE ON ingredients
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
