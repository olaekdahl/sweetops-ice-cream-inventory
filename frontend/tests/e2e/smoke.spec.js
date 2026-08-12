import { expect, test } from '@playwright/test';

test('dashboard and primary navigation render', async ({ page }) => {
  const apiPayloads = {
    dashboard: {
      summary: {
        total_ingredient_types: 4,
        total_product_types: 3,
        low_stock_ingredients: 1,
        low_stock_products: 2
      },
      low_stock_ingredients: [],
      low_stock_products: [],
      recent_transactions: []
    },
    ingredients: [
      {
        id: 1,
        name: 'Whole Milk',
        category: 'Dairy',
        quantity: 20,
        unit: 'L',
        reorder_level: 10,
        supplier: 'Farm',
        cost_per_unit: 1.5,
        low_stock: false
      }
    ],
    products: [
      {
        id: 1,
        name: 'Vanilla Pint',
        flavor: 'Vanilla',
        package_size: '473ml',
        quantity_in_stock: 12,
        reorder_level: 5,
        unit_price: 6.5,
        low_stock: false
      }
    ],
    transactions: [],
    flavorMixes: []
  };

  await page.route('**/api/**', async (route) => {
    const url = route.request().url();

    if (url.endsWith('/dashboard')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(apiPayloads.dashboard) });
      return;
    }

    if (url.endsWith('/ingredients')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(apiPayloads.ingredients) });
      return;
    }

    if (url.endsWith('/products')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(apiPayloads.products) });
      return;
    }

    if (url.endsWith('/transactions')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(apiPayloads.transactions) });
      return;
    }

    if (url.endsWith('/flavor-mixes')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(apiPayloads.flavorMixes) });
      return;
    }

    await route.fulfill({ status: 404, contentType: 'application/json', body: '{}' });
  });

  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1, name: 'Inventory Management' })).toBeVisible();
  await expect(page.getByText('API:')).toBeVisible();

  await page.getByRole('button', { name: 'Ingredients' }).click();
  await expect(page.getByRole('heading', { level: 2, name: 'Ingredients' })).toBeVisible();

  await page.getByRole('button', { name: 'Flavor Mixer' }).click();
  await expect(page.getByRole('heading', { level: 2, name: 'Mix New Flavor' })).toBeVisible();

  await page.getByRole('button', { name: 'Flavor Reviews' }).click();
  await expect(page.getByRole('heading', { level: 2, name: 'Customer Flavor Reviews' })).toBeVisible();

  await page.getByLabel('Customer name').fill('Playwright QA');
  await page.locator('#review-flavor').selectOption({ index: 1 });
  await page.getByLabel('Rating (1 to 5)').selectOption('5');
  await page.getByLabel('Review').fill('Great texture and classic finish.');
  await page.getByRole('button', { name: 'Submit Review' }).click();

  await expect(page.getByText('Great texture and classic finish.')).toBeVisible();
});
