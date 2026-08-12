import React, { useEffect, useMemo, useState } from 'react';
import FlavorReviews from './components/FlavorReviews.jsx';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4318/api';

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const number = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });
const dateTime = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short'
});

function StatusBadge({ lowStock }) {
  return <span className={`badge ${lowStock ? 'danger' : 'success'}`}>{lowStock ? 'Low Stock' : 'Healthy'}</span>;
}

function TransactionType({ type }) {
  return <span className={`transaction-type ${type.toLowerCase()}`}>{type}</span>;
}

function SummaryCard({ label, value, tone = 'default' }) {
  return (
    <article className={`summary-card ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function LoadingOrError({ loading, error }) {
  if (loading) return <div className="panel message">Loading factory inventory...</div>;
  if (error) return <div className="panel message error">{error}</div>;
  return null;
}

function Dashboard({ dashboard, loading, error }) {
  if (loading || error || !dashboard) return <LoadingOrError loading={loading} error={error || 'Dashboard data is unavailable.'} />;

  const summary = dashboard.summary;
  const lowStockAlerts = [
    ...dashboard.low_stock_ingredients.map((item) => ({
      id: `ingredient-${item.id}`,
      label: item.name,
      detail: `${number.format(item.quantity)} ${item.unit} available, reorder at ${number.format(item.reorder_level)}`
    })),
    ...dashboard.low_stock_products.map((item) => ({
      id: `product-${item.id}`,
      label: item.name,
      detail: `${number.format(item.quantity_in_stock)} units available, reorder at ${number.format(item.reorder_level)}`
    }))
  ];

  return (
    <section className="page-grid">
      <div className="summary-grid">
        <SummaryCard label="Ingredients" value={summary.total_ingredient_types} />
        <SummaryCard label="Finished Products" value={summary.total_product_types} />
        <SummaryCard label="Low Stock Ingredients" value={summary.low_stock_ingredients} tone="warning" />
        <SummaryCard label="Low Stock Products" value={summary.low_stock_products} tone="warning" />
      </div>

      <div className="split-grid">
        <section className="panel">
          <div className="panel-heading">
            <h2>Recent inventory transactions</h2>
            <span>Latest factory movements</span>
          </div>
          <TransactionList transactions={dashboard.recent_transactions} compact />
        </section>

        <section className="panel">
          <div className="panel-heading">
            <h2>Low-stock alerts</h2>
            <span>Items needing attention</span>
          </div>
          <div className="alert-list">
            {lowStockAlerts.map((alert) => (
              <div className="alert-item" key={alert.id}>
                <strong>{alert.label}</strong>
                <span>{alert.detail}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}

function IngredientsPage({ ingredients, loading, error }) {
  if (loading || error) return <LoadingOrError loading={loading} error={error} />;

  return (
    <section className="panel">
      <div className="panel-heading">
        <h2>Ingredients</h2>
        <span>Raw materials for production</span>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Ingredient</th>
              <th>Category</th>
              <th>Quantity</th>
              <th>Unit</th>
              <th>Reorder Level</th>
              <th>Supplier</th>
              <th>Cost</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {ingredients.map((ingredient) => (
              <tr className={ingredient.low_stock ? 'low-stock-row' : ''} key={ingredient.id}>
                <td>{ingredient.name}</td>
                <td>{ingredient.category}</td>
                <td>{number.format(ingredient.quantity)}</td>
                <td>{ingredient.unit}</td>
                <td>{number.format(ingredient.reorder_level)}</td>
                <td>{ingredient.supplier}</td>
                <td>{currency.format(ingredient.cost_per_unit)}</td>
                <td><StatusBadge lowStock={ingredient.low_stock} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ProductsPage({ products, loading, error }) {
  if (loading || error) return <LoadingOrError loading={loading} error={error} />;

  return (
    <section className="panel">
      <div className="panel-heading">
        <h2>Finished Products</h2>
        <span>Packaged ice cream ready for shipment</span>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Flavor</th>
              <th>Package Size</th>
              <th>Quantity</th>
              <th>Reorder Level</th>
              <th>Unit Price</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr className={product.low_stock ? 'low-stock-row' : ''} key={product.id}>
                <td>{product.name}</td>
                <td>{product.flavor}</td>
                <td>{product.package_size}</td>
                <td>{number.format(product.quantity_in_stock)}</td>
                <td>{number.format(product.reorder_level)}</td>
                <td>{currency.format(product.unit_price)}</td>
                <td><StatusBadge lowStock={product.low_stock} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function TransactionList({ transactions, compact = false }) {
  return (
    <div className="transaction-list">
      {transactions.map((transaction) => (
        <article className="transaction-card" key={transaction.id}>
          <div>
            <strong>{transaction.item_name || `Item #${transaction.item_id}`}</strong>
            <span>{dateTime.format(new Date(transaction.created_at))}</span>
          </div>
          <div>
            <TransactionType type={transaction.transaction_type} />
            <span>{number.format(transaction.quantity)} {transaction.inventory_type.toLowerCase()}</span>
          </div>
          {!compact && <p>{transaction.notes || 'No notes provided.'}</p>}
        </article>
      ))}
    </div>
  );
}

function TransactionsPage({ transactions, loading, error }) {
  if (loading || error) return <LoadingOrError loading={loading} error={error} />;

  return (
    <section className="panel">
      <div className="panel-heading">
        <h2>Transactions</h2>
        <span>Recent inventory movements</span>
      </div>
      <TransactionList transactions={transactions} />
    </section>
  );
}

function OrdersPage({ products, loading, error, orders, onCreateOrder }) {
  const [form, setForm] = useState({
    productId: '',
    quantity: 12,
    customer: '',
    priority: 'Standard'
  });

  if (loading || error) return <LoadingOrError loading={loading} error={error} />;

  function handleSubmit(event) {
    event.preventDefault();
    if (!form.productId || !form.customer.trim()) return;

    const selected = products.find((product) => String(product.id) === form.productId);
    if (!selected) return;

    onCreateOrder({
      id: `order-${Date.now()}`,
      customer: form.customer.trim(),
      priority: form.priority,
      quantity: Number(form.quantity),
      created_at: new Date().toISOString(),
      product_name: selected.name,
      package_size: selected.package_size,
      total: Number(form.quantity) * Number(selected.unit_price)
    });

    setForm((current) => ({ ...current, customer: '', quantity: 12 }));
  }

  return (
    <section className="page-grid">
      <section className="panel">
        <div className="panel-heading">
          <h2>Create Order</h2>
          <span>Queue outgoing shipments</span>
        </div>

        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            Product
            <select
              value={form.productId}
              onChange={(event) => setForm((current) => ({ ...current, productId: event.target.value }))}
              required
            >
              <option value="">Select a product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} ({currency.format(product.unit_price)})
                </option>
              ))}
            </select>
          </label>

          <label>
            Quantity
            <input
              min="1"
              step="1"
              type="number"
              value={form.quantity}
              onChange={(event) => setForm((current) => ({ ...current, quantity: event.target.value }))}
              required
            />
          </label>

          <label>
            Customer
            <input
              type="text"
              value={form.customer}
              onChange={(event) => setForm((current) => ({ ...current, customer: event.target.value }))}
              placeholder="Northwind Grocers"
              required
            />
          </label>

          <label>
            Priority
            <select
              value={form.priority}
              onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value }))}
            >
              <option>Standard</option>
              <option>Rush</option>
              <option>VIP</option>
            </select>
          </label>

          <button type="submit">Create Order</button>
        </form>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <h2>Order Queue</h2>
          <span>{orders.length} pending orders</span>
        </div>
        <div className="transaction-list">
          {orders.length === 0 && <div className="message">No orders yet. Create your first order above.</div>}
          {orders.map((order) => (
            <article className="transaction-card" key={order.id}>
              <div>
                <strong>{order.customer}</strong>
                <span>{dateTime.format(new Date(order.created_at))}</span>
              </div>
              <div>
                <span>{order.product_name} ({order.package_size})</span>
                <span>{number.format(order.quantity)} units</span>
              </div>
              <div>
                <span className={`priority-pill ${order.priority.toLowerCase()}`}>{order.priority}</span>
                <strong>{currency.format(order.total)}</strong>
              </div>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}

function FlavorMixerPage({ ingredients, loading, error, mixes, onCreateMix }) {
  const [mixName, setMixName] = useState('');
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [saveError, setSaveError] = useState('');

  if (loading || error) return <LoadingOrError loading={loading} error={error} />;

  const selectedItems = ingredients.filter((item) => selectedIngredients.includes(String(item.id)));
  const estimatedCost = selectedItems.reduce((total, item) => total + Number(item.cost_per_unit), 0) * 0.5;

  function toggleIngredient(id) {
    setSelectedIngredients((current) =>
      current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id]
    );
  }

  async function handleCreateMix(event) {
    event.preventDefault();
    if (!mixName.trim() || selectedItems.length === 0) return;

    setSaveError('');

    try {
      await onCreateMix({
        name: mixName.trim(),
        ingredients: selectedItems.map((item) => item.name),
        estimatedCost
      });

      setMixName('');
      setSelectedIngredients([]);
    } catch (err) {
      setSaveError(err.message || 'Unable to save flavor mix.');
    }
  }

  return (
    <section className="page-grid">
      <section className="panel">
        <div className="panel-heading">
          <h2>Mix New Flavor</h2>
          <span>Build custom flavor prototypes</span>
        </div>

        <form className="form-grid" onSubmit={handleCreateMix}>
          <label>
            Flavor name
            <input
              type="text"
              placeholder="Toasted Coconut Caramel"
              value={mixName}
              onChange={(event) => setMixName(event.target.value)}
              required
            />
          </label>

          <fieldset className="ingredient-pool">
            <legend>Ingredient blend</legend>
            <div className="ingredient-list">
              {ingredients.map((ingredient) => {
                const id = String(ingredient.id);
                return (
                  <label key={ingredient.id} className="ingredient-option">
                    <input
                      checked={selectedIngredients.includes(id)}
                      onChange={() => toggleIngredient(id)}
                      type="checkbox"
                    />
                    <span>{ingredient.name}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <div className="mix-summary">
            <strong>Estimated base cost</strong>
            <span>{currency.format(estimatedCost)} per test batch</span>
          </div>

          <button type="submit">Save Flavor Mix</button>
          {saveError && <p className="message error">{saveError}</p>}
        </form>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <h2>Flavor Lab Book</h2>
          <span>{mixes.length} saved prototypes</span>
        </div>
        <div className="transaction-list">
          {mixes.length === 0 && <div className="message">No flavor prototypes yet.</div>}
          {mixes.map((mix) => (
            <article className="transaction-card" key={mix.id}>
              <div>
                <strong>{mix.name}</strong>
                <span>{dateTime.format(new Date(mix.created_at))}</span>
              </div>
              <p>{mix.ingredients.join(', ')}</p>
              <div>
                <span>Estimated batch cost</span>
                <strong>{currency.format(Number(mix.estimated_cost ?? mix.estimatedCost ?? 0))}</strong>
              </div>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}

export default function App() {
  const [activePage, setActivePage] = useState('Dashboard');
  const [data, setData] = useState({
    dashboard: null,
    ingredients: [],
    products: [],
    transactions: [],
    flavor_mixes: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    async function loadInventory() {
      try {
        const [dashboard, ingredients, products, transactions, flavorMixes] = await Promise.all([
          fetch(`${API_BASE_URL}/dashboard`),
          fetch(`${API_BASE_URL}/ingredients`),
          fetch(`${API_BASE_URL}/products`),
          fetch(`${API_BASE_URL}/transactions`),
          fetch(`${API_BASE_URL}/flavor-mixes`)
        ]);

        const responses = [dashboard, ingredients, products, transactions, flavorMixes];
        const failed = responses.find((response) => !response.ok);
        if (failed) {
          throw new Error(`API request failed with status ${failed.status}`);
        }

        setData({
          dashboard: await dashboard.json(),
          ingredients: await ingredients.json(),
          products: await products.json(),
          transactions: await transactions.json(),
          flavor_mixes: await flavorMixes.json()
        });
      } catch (err) {
        setError(`Unable to load inventory data from ${API_BASE_URL}. ${err.message}`);
      } finally {
        setLoading(false);
      }
    }

    loadInventory();
  }, []);

  const navItems = useMemo(
    () => ['Dashboard', 'Ingredients', 'Finished Products', 'Transactions', 'Orders', 'Flavor Mixer', 'Flavor Reviews'],
    []
  );

  return (
    <div className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">SweetOps Ice Cream Factory</p>
          <h1>Inventory Management</h1>
        </div>
        <div className="api-pill">API: {API_BASE_URL}</div>
      </header>

      <nav className="nav-tabs" aria-label="Main navigation">
        {navItems.map((item) => (
          <button
            className={activePage === item ? 'active' : ''}
            key={item}
            onClick={() => setActivePage(item)}
            type="button"
          >
            {item}
          </button>
        ))}
      </nav>

      <main>
        {activePage === 'Dashboard' && (
          <Dashboard dashboard={data.dashboard} loading={loading} error={error} />
        )}
        {activePage === 'Ingredients' && (
          <IngredientsPage ingredients={data.ingredients} loading={loading} error={error} />
        )}
        {activePage === 'Finished Products' && (
          <ProductsPage products={data.products} loading={loading} error={error} />
        )}
        {activePage === 'Transactions' && (
          <TransactionsPage transactions={data.transactions} loading={loading} error={error} />
        )}
        {activePage === 'Orders' && (
          <OrdersPage
            products={data.products}
            loading={loading}
            error={error}
            orders={orders}
            onCreateOrder={(order) => setOrders((current) => [order, ...current])}
          />
        )}
        {activePage === 'Flavor Mixer' && (
          <FlavorMixerPage
            ingredients={data.ingredients}
            loading={loading}
            error={error}
            mixes={data.flavor_mixes}
            onCreateMix={async (mix) => {
              const response = await fetch(`${API_BASE_URL}/flavor-mixes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  name: mix.name,
                  ingredients: mix.ingredients,
                  estimated_cost: Number(mix.estimatedCost)
                })
              });

              if (!response.ok) {
                throw new Error(`Save failed with status ${response.status}`);
              }

              const savedMix = await response.json();
              setData((current) => ({
                ...current,
                flavor_mixes: [savedMix, ...current.flavor_mixes]
              }));
            }}
          />
        )}
        {activePage === 'Flavor Reviews' && (
          <FlavorReviews
            products={data.products}
            reviews={reviews}
            onCreateReview={(review) => setReviews((current) => [review, ...current])}
          />
        )}
      </main>
    </div>
  );
}
