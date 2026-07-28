// Pure cart math. Stores call into this; it never imports from a store, which
// is what keeps the Phase 6 swap to Firestore confined to the store layer.
//
// A "line" is `{ id, title, price, discountPercentage, thumbnail, quantity }`.

const MAX_QUANTITY = 99;

/** Round to whole cents. Money must not carry floating-point tails. */
function toCents(value) {
  return Math.round(value * 100) / 100;
}

/**
 * Unit price after the product's discount, rounded to cents.
 *
 * Rounding happens per unit rather than per line so the price shown next to a
 * line always multiplies out to the line total the customer is charged.
 */
export function getDiscountedPrice(price, discountPercentage) {
  if (typeof price !== 'number' || !Number.isFinite(price) || price < 0) {
    throw new Error(`getDiscountedPrice expected a non-negative price, received ${String(price)}`);
  }

  const discount =
    typeof discountPercentage === 'number' && Number.isFinite(discountPercentage)
      ? Math.min(Math.max(discountPercentage, 0), 100)
      : 0;

  return toCents(price * (1 - discount / 100));
}

/**
 * Quantity is user-editable (typed into an input), so anything unparseable
 * collapses to 1. `stock` caps it when the product reports one.
 */
export function clampQuantity(quantity, stock) {
  const parsed = Number.parseInt(quantity, 10);
  const ceiling =
    Number.isInteger(stock) && stock > 0 ? Math.min(stock, MAX_QUANTITY) : MAX_QUANTITY;

  if (!Number.isInteger(parsed) || parsed < 1) return 1;

  return Math.min(parsed, ceiling);
}

/** Discounted unit price × quantity. */
export function getLineTotal(line) {
  const unit = getDiscountedPrice(line?.price, line?.discountPercentage);

  return toCents(unit * clampQuantity(line?.quantity, line?.stock));
}

/** Sum of every line total, i.e. what the customer pays. */
export function getSubtotal(lines) {
  if (!Array.isArray(lines)) return 0;

  return toCents(lines.reduce((sum, line) => sum + getLineTotal(line), 0));
}

/** Sum of line totals before any discount, for showing what was saved. */
export function getFullPriceTotal(lines) {
  if (!Array.isArray(lines)) return 0;

  return toCents(
    lines.reduce((sum, line) => sum + line.price * clampQuantity(line.quantity, line.stock), 0)
  );
}

/** How much the discounts are worth across the whole cart. */
export function getSavings(lines) {
  return toCents(getFullPriceTotal(lines) - getSubtotal(lines));
}

/** Total units in the cart — the number shown on the nav badge. */
export function getItemCount(lines) {
  if (!Array.isArray(lines)) return 0;

  return lines.reduce((sum, line) => sum + clampQuantity(line.quantity, line.stock), 0);
}
