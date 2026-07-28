import { describe, expect, it } from 'vitest';
import {
  clampQuantity,
  getDiscountedPrice,
  getFullPriceTotal,
  getItemCount,
  getLineTotal,
  getSavings,
  getSubtotal,
} from './cart.js';

const line = (overrides = {}) => ({
  id: 1,
  title: 'Essence Mascara Lash Princess',
  price: 9.99,
  discountPercentage: 10.48,
  quantity: 1,
  ...overrides,
});

describe('getDiscountedPrice', () => {
  it('applies a percentage discount and rounds to cents', () => {
    // 9.99 - 10.48% = 8.943...
    expect(getDiscountedPrice(9.99, 10.48)).toBe(8.94);
  });

  it('returns the full price when there is no discount', () => {
    expect(getDiscountedPrice(49.99, 0)).toBe(49.99);
  });

  it.each([[null], [undefined], ['10'], [NaN]])(
    'treats a non-numeric discount of %p as zero',
    (discount) => {
      expect(getDiscountedPrice(20, discount)).toBe(20);
    }
  );

  it('clamps a discount above 100% to free rather than negative', () => {
    expect(getDiscountedPrice(20, 150)).toBe(0);
  });

  it('clamps a negative discount to zero rather than inflating the price', () => {
    expect(getDiscountedPrice(20, -50)).toBe(20);
  });

  it.each([[-1], ['9.99'], [null], [NaN], [Infinity]])('throws on price %p', (price) => {
    expect(() => getDiscountedPrice(price, 10)).toThrow();
  });
});

describe('clampQuantity', () => {
  it('keeps a valid quantity', () => {
    expect(clampQuantity(3)).toBe(3);
  });

  it('parses a string from a number input', () => {
    expect(clampQuantity('5')).toBe(5);
  });

  it('caps at available stock', () => {
    expect(clampQuantity(50, 8)).toBe(8);
  });

  it('caps at 99 when stock is unknown', () => {
    expect(clampQuantity(5000)).toBe(99);
  });

  it('ignores a nonsensical stock value', () => {
    expect(clampQuantity(4, 0)).toBe(4);
    expect(clampQuantity(4, -3)).toBe(4);
  });

  it.each([['0'], ['-1'], ['abc'], [''], [null], [undefined], [NaN], [1.5]])(
    'falls back to 1 for %p',
    (quantity) => {
      expect(clampQuantity(quantity)).toBe(1);
    }
  );
});

describe('getLineTotal', () => {
  it('multiplies the discounted unit price by quantity', () => {
    expect(getLineTotal(line({ quantity: 3 }))).toBe(26.82); // 8.94 x 3
  });

  it('rounds per unit, so the line total matches the displayed unit price', () => {
    // 8.94 (shown) x 2 = 17.88, not 17.89 from rounding 8.943 x 2 late.
    expect(getLineTotal(line({ quantity: 2 }))).toBe(17.88);
  });

  it('respects stock when quantity exceeds it', () => {
    expect(getLineTotal(line({ price: 10, discountPercentage: 0, quantity: 99, stock: 2 }))).toBe(
      20
    );
  });
});

describe('getSubtotal', () => {
  it('sums line totals', () => {
    const lines = [
      line({ id: 1, price: 10, discountPercentage: 0, quantity: 2 }),
      line({ id: 2, price: 5.5, discountPercentage: 0, quantity: 1 }),
    ];

    expect(getSubtotal(lines)).toBe(25.5);
  });

  it('is 0 for an empty cart', () => {
    expect(getSubtotal([])).toBe(0);
  });

  it.each([[null], [undefined], ['nope']])('is 0 for %p', (lines) => {
    expect(getSubtotal(lines)).toBe(0);
  });

  it('avoids floating-point drift across many lines', () => {
    const lines = Array.from({ length: 3 }, (_, i) =>
      line({ id: i, price: 0.1, discountPercentage: 0, quantity: 1 })
    );

    // 0.1 + 0.1 + 0.1 would be 0.30000000000000004 unrounded.
    expect(getSubtotal(lines)).toBe(0.3);
  });
});

describe('getFullPriceTotal and getSavings', () => {
  const lines = [line({ id: 1, price: 100, discountPercentage: 25, quantity: 2 })];

  it('totals at full price, ignoring discounts', () => {
    expect(getFullPriceTotal(lines)).toBe(200);
  });

  it('reports the difference as savings', () => {
    expect(getSubtotal(lines)).toBe(150);
    expect(getSavings(lines)).toBe(50);
  });

  it('reports no savings when nothing is discounted', () => {
    expect(getSavings([line({ price: 10, discountPercentage: 0, quantity: 1 })])).toBe(0);
  });
});

describe('getItemCount', () => {
  it('sums quantities, not lines', () => {
    const lines = [line({ id: 1, quantity: 2 }), line({ id: 2, quantity: 3 })];

    expect(getItemCount(lines)).toBe(5);
  });

  it('is 0 for an empty cart', () => {
    expect(getItemCount([])).toBe(0);
  });

  it.each([[null], [undefined]])('is 0 for %p', (lines) => {
    expect(getItemCount(lines)).toBe(0);
  });
});
