import React from 'react';
import { fireEvent } from '@testing-library/react';
import { render, screen, waitFor } from '@testing-library/react';
import App from '../App.jsx';

function jsonResponse(payload, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => payload
  };
}

const dashboardPayload = {
  summary: {
    total_ingredient_types: 4,
    total_product_types: 3,
    low_stock_ingredients: 1,
    low_stock_products: 2
  },
  low_stock_ingredients: [],
  low_stock_products: [],
  recent_transactions: []
};

const ingredientsPayload = [
  { id: 1, name: 'Whole Milk', category: 'Dairy', quantity: 20, unit: 'L', reorder_level: 10, supplier: 'Farm', cost_per_unit: 1.5, low_stock: false }
];

const productsPayload = [
  { id: 1, name: 'Vanilla Pint', flavor: 'Vanilla', package_size: '473ml', quantity_in_stock: 12, reorder_level: 5, unit_price: 6.5, low_stock: false }
];

const transactionsPayload = [];
const flavorMixesPayload = [];

describe('App', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders dashboard after loading API data', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation((url) => {
      if (String(url).endsWith('/dashboard')) return Promise.resolve(jsonResponse(dashboardPayload));
      if (String(url).endsWith('/ingredients')) return Promise.resolve(jsonResponse(ingredientsPayload));
      if (String(url).endsWith('/products')) return Promise.resolve(jsonResponse(productsPayload));
      if (String(url).endsWith('/transactions')) return Promise.resolve(jsonResponse(transactionsPayload));
      if (String(url).endsWith('/flavor-mixes')) return Promise.resolve(jsonResponse(flavorMixesPayload));
      return Promise.resolve(jsonResponse({}, 404));
    });

    render(<App />);

    expect(screen.getByText('Loading factory inventory...')).toBeInTheDocument();

    await screen.findByText('Inventory Management');
    await screen.findByText('Low Stock Products');
    expect(fetchMock).toHaveBeenCalledTimes(5);
  });

  it('shows a user-facing error when an API call fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({}, 500));

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Unable to load inventory data/)).toBeInTheDocument();
    });
  });

  it('lets customers submit a flavor review', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation((url) => {
      if (String(url).endsWith('/dashboard')) return Promise.resolve(jsonResponse(dashboardPayload));
      if (String(url).endsWith('/ingredients')) return Promise.resolve(jsonResponse(ingredientsPayload));
      if (String(url).endsWith('/products')) return Promise.resolve(jsonResponse(productsPayload));
      if (String(url).endsWith('/transactions')) return Promise.resolve(jsonResponse(transactionsPayload));
      if (String(url).endsWith('/flavor-mixes')) return Promise.resolve(jsonResponse(flavorMixesPayload));
      return Promise.resolve(jsonResponse({}, 404));
    });

    render(<App />);

    await screen.findByRole('button', { name: 'Flavor Reviews' });
    fireEvent.click(screen.getByRole('button', { name: 'Flavor Reviews' }));

    await screen.findByRole('heading', { level: 2, name: 'Customer Flavor Reviews' });

    fireEvent.change(screen.getByLabelText('Customer name'), { target: { value: 'Ola' } });
    fireEvent.change(screen.getByLabelText('Flavor'), { target: { value: 'Vanilla' } });
    fireEvent.change(screen.getByLabelText('Rating (1 to 5)'), { target: { value: '4' } });
    fireEvent.change(screen.getByLabelText('Review'), { target: { value: 'Very creamy and smooth.' } });

    fireEvent.click(screen.getByRole('button', { name: 'Submit Review' }));

    expect(screen.getByText('Very creamy and smooth.')).toBeInTheDocument();
    expect(screen.getByText('4.0 / 5')).toBeInTheDocument();
  });
});