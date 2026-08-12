import assert from 'node:assert/strict';
import test from 'node:test';
import {
  parseId,
  requireNumber,
  requireString,
  validateFlavorMix,
  validateIngredient,
  validateProduct,
  validateTransaction
} from '../validation.js';

test('parseId accepts positive integers and rejects invalid values', () => {
  assert.equal(parseId('5'), 5);
  assert.equal(parseId(12), 12);
  assert.equal(parseId('0'), null);
  assert.equal(parseId('-1'), null);
  assert.equal(parseId('abc'), null);
});

test('requireString validates non-empty string input', () => {
  assert.equal(requireString('Milk', 'name'), null);
  assert.equal(requireString('   ', 'name'), 'name is required');
  assert.equal(requireString(undefined, 'name'), 'name is required');
});

test('requireNumber enforces type, min, and integer options', () => {
  assert.equal(requireNumber(3.5, 'quantity'), null);
  assert.equal(requireNumber('2', 'quantity', { integer: true }), null);
  assert.equal(
    requireNumber(1.2, 'quantity', { integer: true }),
    'quantity must be an integer greater than or equal to 0'
  );
  assert.equal(
    requireNumber(-1, 'quantity', { min: 0 }),
    'quantity must be a number greater than or equal to 0'
  );
});

test('validateIngredient returns no errors for valid payload', () => {
  const errors = validateIngredient({
    name: 'Vanilla Bean',
    category: 'Dairy',
    quantity: 25,
    unit: 'kg',
    reorder_level: 10,
    cost_per_unit: 1.25,
    supplier: 'Sweet Farms'
  });

  assert.deepEqual(errors, []);
});

test('validateIngredient reports expected required field errors', () => {
  const errors = validateIngredient({});
  assert(errors.includes('name is required'));
  assert(errors.includes('category is required'));
  assert(errors.includes('quantity must be a number greater than or equal to 0'));
  assert(errors.includes('unit is required'));
});

test('validateProduct enforces integer stock and reorder levels', () => {
  const errors = validateProduct({
    name: 'Vanilla Pints',
    flavor: 'Vanilla',
    package_size: '473ml',
    quantity_in_stock: 5.5,
    reorder_level: 2,
    unit_price: 6.25
  });

  assert(errors.includes('quantity_in_stock must be an integer greater than or equal to 0'));
});

test('validateTransaction rejects invalid enum values and note type', () => {
  const errors = validateTransaction({
    inventory_type: 'RAW',
    item_id: 0,
    transaction_type: 'UNKNOWN',
    quantity: 0,
    notes: 42
  });

  assert(errors.includes('inventory_type must be INGREDIENT or PRODUCT'));
  assert(errors.includes('item_id must be an integer greater than or equal to 1'));
  assert(errors.includes('transaction_type is invalid'));
  assert(errors.includes('quantity must be a number greater than or equal to 0.01'));
  assert(errors.includes('notes must be a string'));
});

test('validateFlavorMix requires non-empty ingredients list', () => {
  const errors = validateFlavorMix({
    name: 'Toasted Coconut',
    ingredients: [],
    estimated_cost: 15
  });

  assert(errors.includes('ingredients must be a non-empty array'));
});