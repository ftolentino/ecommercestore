import { describe, expect, it } from 'vitest';
import { formatPrice, unwrapProductList } from './products.js';

describe('unwrapProductList', () => {
  it('returns the products array from a list envelope', () => {
    const payload = {
      products: [{ id: 1, title: 'Essence Mascara Lash Princess' }],
      total: 194,
      skip: 0,
      limit: 8,
    };

    expect(unwrapProductList(payload)).toEqual([{ id: 1, title: 'Essence Mascara Lash Princess' }]);
  });

  it('returns an empty array when the API reports no matches', () => {
    expect(unwrapProductList({ products: [], total: 0, skip: 0, limit: 8 })).toEqual([]);
  });

  // The whole reason this helper exists: /products/{id} returns a bare product,
  // and passing that shape here is a real mistake worth failing loudly on.
  it('throws on a bare single-product response', () => {
    const bareProduct = { id: 1, title: 'Essence Mascara Lash Princess', price: 9.99 };

    expect(() => unwrapProductList(bareProduct)).toThrow(/products/i);
  });

  it('throws when the products key is missing', () => {
    expect(() => unwrapProductList({ total: 194, skip: 0, limit: 8 })).toThrow();
  });

  it('throws when products is present but not an array', () => {
    expect(() => unwrapProductList({ products: 'nope' })).toThrow();
  });

  it.each([[null], [undefined], ['a string'], [42]])('throws on %p', (payload) => {
    expect(() => unwrapProductList(payload)).toThrow();
  });
});

describe('formatPrice', () => {
  it.each([
    [9.99, '$9.99'],
    [129.99, '$129.99'],
    [0, '$0.00'],
    [8, '$8.00'],
  ])('formats %p as %p', (value, expected) => {
    expect(formatPrice(value)).toBe(expected);
  });

  // Avoids exact .005 ties on purpose: those land on whichever side the binary
  // float actually sits (1.005.toFixed(2) is "1.00"), which is a property of
  // IEEE 754, not of this function.
  it('rounds to two decimal places', () => {
    expect(formatPrice(10.006)).toBe('$10.01');
    expect(formatPrice(19.994)).toBe('$19.99');
  });

  it.each([[null], [undefined], ['9.99'], [NaN], [Infinity]])('throws on %p', (value) => {
    expect(() => formatPrice(value)).toThrow();
  });
});
