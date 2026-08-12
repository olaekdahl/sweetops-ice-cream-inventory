import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { pool, query } from './db.js';
import {
  parseId,
  validateFlavorMix,
  validateIngredient,
  validateProduct,
  validateTransaction
} from './validation.js';

const app = express();
const port = Number(process.env.PORT || 3000);

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:4317' }));
app.use(express.json());

function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

function sendValidationErrors(res, errors) {
  return res.status(400).json({ error: 'Validation failed', details: errors });
}

app.get('/api/health', asyncHandler(async (_req, res) => {
  await query('SELECT 1');
  res.json({ status: 'ok', database: 'connected' });
}));

app.get('/api/ingredients', asyncHandler(async (_req, res) => {
  const result = await query(`
    SELECT *, quantity <= reorder_level AS low_stock
    FROM ingredients
    ORDER BY name
  `);
  res.json(result.rows);
}));

app.get('/api/ingredients/:id', asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid ingredient id' });

  const result = await query('SELECT *, quantity <= reorder_level AS low_stock FROM ingredients WHERE id = $1', [id]);
  if (result.rowCount === 0) return res.status(404).json({ error: 'Ingredient not found' });

  res.json(result.rows[0]);
}));

app.post('/api/ingredients', asyncHandler(async (req, res) => {
  const errors = validateIngredient(req.body);
  if (errors.length) return sendValidationErrors(res, errors);

  const { name, category, quantity, unit, reorder_level, cost_per_unit, supplier } = req.body;
  const result = await query(`
    INSERT INTO ingredients (name, category, quantity, unit, reorder_level, cost_per_unit, supplier)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *, quantity <= reorder_level AS low_stock
  `, [name.trim(), category.trim(), quantity, unit.trim(), reorder_level, cost_per_unit, supplier.trim()]);

  res.status(201).json(result.rows[0]);
}));

app.put('/api/ingredients/:id', asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid ingredient id' });

  const errors = validateIngredient(req.body);
  if (errors.length) return sendValidationErrors(res, errors);

  const { name, category, quantity, unit, reorder_level, cost_per_unit, supplier } = req.body;
  const result = await query(`
    UPDATE ingredients
    SET name = $1, category = $2, quantity = $3, unit = $4, reorder_level = $5, cost_per_unit = $6, supplier = $7
    WHERE id = $8
    RETURNING *, quantity <= reorder_level AS low_stock
  `, [name.trim(), category.trim(), quantity, unit.trim(), reorder_level, cost_per_unit, supplier.trim(), id]);

  if (result.rowCount === 0) return res.status(404).json({ error: 'Ingredient not found' });
  res.json(result.rows[0]);
}));

app.delete('/api/ingredients/:id', asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid ingredient id' });

  const result = await query('DELETE FROM ingredients WHERE id = $1 RETURNING id', [id]);
  if (result.rowCount === 0) return res.status(404).json({ error: 'Ingredient not found' });
  res.status(204).send();
}));

app.get('/api/products', asyncHandler(async (_req, res) => {
  const result = await query(`
    SELECT *, quantity_in_stock <= reorder_level AS low_stock
    FROM products
    ORDER BY name
  `);
  res.json(result.rows);
}));

app.get('/api/products/:id', asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid product id' });

  const result = await query('SELECT *, quantity_in_stock <= reorder_level AS low_stock FROM products WHERE id = $1', [id]);
  if (result.rowCount === 0) return res.status(404).json({ error: 'Product not found' });

  res.json(result.rows[0]);
}));

app.post('/api/products', asyncHandler(async (req, res) => {
  const errors = validateProduct(req.body);
  if (errors.length) return sendValidationErrors(res, errors);

  const { name, flavor, package_size, quantity_in_stock, reorder_level, unit_price } = req.body;
  const result = await query(`
    INSERT INTO products (name, flavor, package_size, quantity_in_stock, reorder_level, unit_price)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *, quantity_in_stock <= reorder_level AS low_stock
  `, [name.trim(), flavor.trim(), package_size.trim(), quantity_in_stock, reorder_level, unit_price]);

  res.status(201).json(result.rows[0]);
}));

app.put('/api/products/:id', asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid product id' });

  const errors = validateProduct(req.body);
  if (errors.length) return sendValidationErrors(res, errors);

  const { name, flavor, package_size, quantity_in_stock, reorder_level, unit_price } = req.body;
  const result = await query(`
    UPDATE products
    SET name = $1, flavor = $2, package_size = $3, quantity_in_stock = $4, reorder_level = $5, unit_price = $6
    WHERE id = $7
    RETURNING *, quantity_in_stock <= reorder_level AS low_stock
  `, [name.trim(), flavor.trim(), package_size.trim(), quantity_in_stock, reorder_level, unit_price, id]);

  if (result.rowCount === 0) return res.status(404).json({ error: 'Product not found' });
  res.json(result.rows[0]);
}));

app.delete('/api/products/:id', asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid product id' });

  const result = await query('DELETE FROM products WHERE id = $1 RETURNING id', [id]);
  if (result.rowCount === 0) return res.status(404).json({ error: 'Product not found' });
  res.status(204).send();
}));

app.get('/api/transactions', asyncHandler(async (_req, res) => {
  const result = await query(`
    SELECT
      t.id,
      t.inventory_type,
      t.item_id,
      COALESCE(i.name, p.name) AS item_name,
      t.transaction_type,
      t.quantity,
      t.notes,
      t.created_at
    FROM inventory_transactions t
    LEFT JOIN ingredients i ON t.ingredient_id = i.id
    LEFT JOIN products p ON t.product_id = p.id
    ORDER BY t.created_at DESC
    LIMIT 50
  `);
  res.json(result.rows);
}));

app.post('/api/transactions', asyncHandler(async (req, res) => {
  const errors = validateTransaction(req.body);
  if (errors.length) return sendValidationErrors(res, errors);

  const { inventory_type, item_id, transaction_type, quantity, notes } = req.body;
  const table = inventory_type === 'INGREDIENT' ? 'ingredients' : 'products';
  const item = await query(`SELECT id FROM ${table} WHERE id = $1`, [item_id]);
  if (item.rowCount === 0) return res.status(404).json({ error: `${inventory_type.toLowerCase()} item not found` });

  const params = [inventory_type, item_id, transaction_type, quantity, notes?.trim() || null];
  const result = await query(`
    INSERT INTO inventory_transactions (
      inventory_type,
      ${inventory_type === 'INGREDIENT' ? 'ingredient_id' : 'product_id'},
      transaction_type,
      quantity,
      notes
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, inventory_type, item_id, transaction_type, quantity, notes, created_at
  `, params);

  res.status(201).json(result.rows[0]);
}));

app.get('/api/dashboard', asyncHandler(async (_req, res) => {
  const [summary, lowIngredients, lowProducts, recentTransactions] = await Promise.all([
    query(`
      SELECT
        (SELECT COUNT(*)::int FROM ingredients) AS total_ingredient_types,
        (SELECT COUNT(*)::int FROM products) AS total_product_types,
        (SELECT COUNT(*)::int FROM ingredients WHERE quantity <= reorder_level) AS low_stock_ingredients,
        (SELECT COUNT(*)::int FROM products WHERE quantity_in_stock <= reorder_level) AS low_stock_products
    `),
    query(`
      SELECT id, name, category, quantity, unit, reorder_level
      FROM ingredients
      WHERE quantity <= reorder_level
      ORDER BY (reorder_level - quantity) DESC, name
    `),
    query(`
      SELECT id, name, flavor, package_size, quantity_in_stock, reorder_level
      FROM products
      WHERE quantity_in_stock <= reorder_level
      ORDER BY (reorder_level - quantity_in_stock) DESC, name
    `),
    query(`
      SELECT
        t.id,
        t.inventory_type,
        t.item_id,
        COALESCE(i.name, p.name) AS item_name,
        t.transaction_type,
        t.quantity,
        t.notes,
        t.created_at
      FROM inventory_transactions t
      LEFT JOIN ingredients i ON t.ingredient_id = i.id
      LEFT JOIN products p ON t.product_id = p.id
      ORDER BY t.created_at DESC
      LIMIT 8
    `)
  ]);

  res.json({
    summary: summary.rows[0],
    low_stock_ingredients: lowIngredients.rows,
    low_stock_products: lowProducts.rows,
    recent_transactions: recentTransactions.rows
  });
}));

app.get('/api/flavor-mixes', asyncHandler(async (_req, res) => {
  const result = await query(`
    SELECT id, name, ingredients, estimated_cost, created_at
    FROM flavor_mixes
    ORDER BY created_at DESC
  `);

  res.json(result.rows);
}));

app.post('/api/flavor-mixes', asyncHandler(async (req, res) => {
  const errors = validateFlavorMix(req.body);
  if (errors.length) return sendValidationErrors(res, errors);

  const ingredients = req.body.ingredients.map((item) => item.trim());
  const result = await query(`
    INSERT INTO flavor_mixes (name, ingredients, estimated_cost)
    VALUES ($1, $2, $3)
    RETURNING id, name, ingredients, estimated_cost, created_at
  `, [req.body.name.trim(), ingredients, req.body.estimated_cost]);

  res.status(201).json(result.rows[0]);
}));

app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  if (err.code === '23505') {
    return res.status(409).json({ error: 'A record with that name already exists' });
  }
  if (err.code === '23503') {
    return res.status(409).json({ error: 'Record is referenced by existing inventory data' });
  }
  return res.status(500).json({ error: 'Internal server error' });
});

async function ensureRuntimeTables() {
  await query(`
    CREATE TABLE IF NOT EXISTS flavor_mixes (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      ingredients TEXT[] NOT NULL,
      estimated_cost NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (estimated_cost >= 0),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

async function start() {
  await ensureRuntimeTables();

  const server = app.listen(port, '0.0.0.0', () => {
    console.log(`SweetOps API listening on port ${port}`);
  });

  process.on('SIGTERM', async () => {
    server.close(async () => {
      await pool.end();
      process.exit(0);
    });
  });
}

start().catch(async (err) => {
  console.error('Failed to start SweetOps API', err);
  await pool.end();
  process.exit(1);
});

