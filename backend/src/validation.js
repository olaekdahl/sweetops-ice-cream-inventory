const inventoryTypes = new Set(['INGREDIENT', 'PRODUCT']);
const transactionTypes = new Set(['RECEIVED', 'USED', 'PRODUCED', 'SHIPPED', 'ADJUSTMENT']);

export function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export function requireString(value, field) {
  if (typeof value !== 'string' || value.trim() === '') {
    return `${field} is required`;
  }
  return null;
}

export function requireNumber(value, field, { integer = false, min = 0 } = {}) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < min || (integer && !Number.isInteger(number))) {
    return `${field} must be ${integer ? 'an integer' : 'a number'} greater than or equal to ${min}`;
  }
  return null;
}

export function validateIngredient(body) {
  return [
    requireString(body.name, 'name'),
    requireString(body.category, 'category'),
    requireNumber(body.quantity, 'quantity'),
    requireString(body.unit, 'unit'),
    requireNumber(body.reorder_level, 'reorder_level'),
    requireNumber(body.cost_per_unit, 'cost_per_unit'),
    requireString(body.supplier, 'supplier')
  ].filter(Boolean);
}

export function validateProduct(body) {
  return [
    requireString(body.name, 'name'),
    requireString(body.flavor, 'flavor'),
    requireString(body.package_size, 'package_size'),
    requireNumber(body.quantity_in_stock, 'quantity_in_stock', { integer: true }),
    requireNumber(body.reorder_level, 'reorder_level', { integer: true }),
    requireNumber(body.unit_price, 'unit_price')
  ].filter(Boolean);
}

export function validateTransaction(body) {
  const errors = [
    inventoryTypes.has(body.inventory_type) ? null : 'inventory_type must be INGREDIENT or PRODUCT',
    requireNumber(body.item_id, 'item_id', { integer: true, min: 1 }),
    transactionTypes.has(body.transaction_type) ? null : 'transaction_type is invalid',
    requireNumber(body.quantity, 'quantity', { min: 0.01 })
  ].filter(Boolean);

  if (body.notes !== undefined && body.notes !== null && typeof body.notes !== 'string') {
    errors.push('notes must be a string');
  }

  return errors;
}

export function validateFlavorMix(body) {
  const errors = [
    requireString(body.name, 'name'),
    requireNumber(body.estimated_cost, 'estimated_cost')
  ].filter(Boolean);

  if (!Array.isArray(body.ingredients) || body.ingredients.length === 0) {
    errors.push('ingredients must be a non-empty array');
  } else if (body.ingredients.some((item) => typeof item !== 'string' || item.trim() === '')) {
    errors.push('ingredients must only contain non-empty strings');
  }

  return errors;
}