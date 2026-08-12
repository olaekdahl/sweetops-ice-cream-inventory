INSERT INTO ingredients (name, category, quantity, unit, reorder_level, cost_per_unit, supplier) VALUES
  ('Whole Milk', 'Dairy', 620, 'gallons', 200, 2.85, 'North Valley Dairy Co.'),
  ('Heavy Cream', 'Dairy', 135, 'gallons', 150, 4.40, 'North Valley Dairy Co.'),
  ('Sugar', 'Dry Goods', 920, 'pounds', 300, 0.72, 'SweetSource Distributors'),
  ('Vanilla Extract', 'Flavoring', 18, 'gallons', 25, 39.50, 'Madagascar Flavor Imports'),
  ('Cocoa Powder', 'Flavoring', 260, 'pounds', 120, 3.95, 'Cacao Works'),
  ('Strawberries', 'Fruit', 74, 'pounds', 100, 2.60, 'Berry Ridge Farms'),
  ('Chocolate Chips', 'Mix-ins', 420, 'pounds', 125, 2.25, 'Cascade Candy Supply'),
  ('Salt', 'Dry Goods', 80, 'pounds', 40, 0.30, 'SweetSource Distributors'),
  ('Waffle Cones', 'Packaging', 680, 'cases', 250, 8.75, 'CrunchCraft Bakery');

INSERT INTO products (name, flavor, package_size, quantity_in_stock, reorder_level, unit_price) VALUES
  ('Vanilla Bean Pint', 'Vanilla Bean', '1 pint', 540, 180, 5.99),
  ('Chocolate Fudge Pint', 'Chocolate Fudge', '1 pint', 92, 160, 6.49),
  ('Strawberry Pint', 'Strawberry', '1 pint', 315, 150, 6.29),
  ('Mint Chocolate Chip Pint', 'Mint Chocolate Chip', '1 pint', 76, 140, 6.49),
  ('Vanilla Bean Gallon', 'Vanilla Bean', '1 gallon', 118, 45, 19.99),
  ('Chocolate Fudge Gallon', 'Chocolate Fudge', '1 gallon', 32, 40, 21.99);

INSERT INTO inventory_transactions (inventory_type, ingredient_id, transaction_type, quantity, notes, created_at) VALUES
  ('INGREDIENT', 1, 'RECEIVED', 240, 'Morning dairy delivery received and chilled.', NOW() - INTERVAL '5 days'),
  ('INGREDIENT', 2, 'USED', 80, 'Used for vanilla and chocolate production runs.', NOW() - INTERVAL '4 days 6 hours'),
  ('INGREDIENT', 4, 'USED', 9, 'Vanilla extract batch drawdown for pint line.', NOW() - INTERVAL '3 days 3 hours'),
  ('INGREDIENT', 6, 'RECEIVED', 120, 'Fresh strawberries delivered from Berry Ridge.', NOW() - INTERVAL '2 days 8 hours'),
  ('INGREDIENT', 6, 'USED', 95, 'Strawberry puree production.', NOW() - INTERVAL '1 day 7 hours');

INSERT INTO inventory_transactions (inventory_type, product_id, transaction_type, quantity, notes, created_at) VALUES
  ('PRODUCT', 1, 'PRODUCED', 240, 'Completed vanilla pint production run.', NOW() - INTERVAL '3 days 2 hours'),
  ('PRODUCT', 2, 'SHIPPED', 180, 'Distributor shipment to northwest retail route.', NOW() - INTERVAL '2 days 5 hours'),
  ('PRODUCT', 3, 'PRODUCED', 160, 'Packed strawberry pints after puree run.', NOW() - INTERVAL '1 day 6 hours'),
  ('PRODUCT', 4, 'SHIPPED', 90, 'Restaurant group weekly order.', NOW() - INTERVAL '15 hours'),
  ('PRODUCT', 6, 'ADJUSTMENT', 8, 'Cycle count correction after cold room audit.', NOW() - INTERVAL '4 hours');

