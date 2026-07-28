import { describe, expect, it } from 'vitest';
import {
  clampPage,
  formatPrice,
  getBrand,
  getSkip,
  getTotalPages,
  unwrapCategoryList,
  unwrapProduct,
  unwrapProductList,
  unwrapProductPage,
} from './products.js';

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

describe('unwrapProductPage', () => {
  it('returns products and total together', () => {
    expect(unwrapProductPage({ products: [{ id: 1 }], total: 194, skip: 0, limit: 8 })).toEqual({
      products: [{ id: 1 }],
      total: 194,
    });
  });

  // An unknown category returns 200 with this shape rather than a 404, so it
  // has to read as a valid empty page, not an error.
  it('treats an empty envelope as a valid page with total 0', () => {
    expect(unwrapProductPage({ products: [], total: 0, skip: 0, limit: 0 })).toEqual({
      products: [],
      total: 0,
    });
  });

  it.each([[undefined], ['194'], [-1], [1.5], [null]])('throws when total is %p', (total) => {
    expect(() => unwrapProductPage({ products: [], total })).toThrow(/total/i);
  });
});

describe('unwrapCategoryList', () => {
  it('maps a bare array to slug/name pairs, dropping the url', () => {
    const payload = [
      { slug: 'beauty', name: 'Beauty', url: 'https://dummyjson.com/products/category/beauty' },
      { slug: 'laptops', name: 'Laptops', url: 'https://dummyjson.com/products/category/laptops' },
    ];

    expect(unwrapCategoryList(payload)).toEqual([
      { slug: 'beauty', name: 'Beauty' },
      { slug: 'laptops', name: 'Laptops' },
    ]);
  });

  it('drops malformed entries instead of failing the whole filter', () => {
    const payload = [{ slug: 'beauty', name: 'Beauty' }, { slug: 'no-name' }, null, { name: 'x' }];

    expect(unwrapCategoryList(payload)).toEqual([{ slug: 'beauty', name: 'Beauty' }]);
  });

  // The product list endpoints use an envelope; this one does not.
  it('throws on an enveloped payload', () => {
    expect(() => unwrapCategoryList({ categories: [] })).toThrow(/bare array/i);
  });

  it.each([[null], [undefined], ['beauty']])('throws on %p', (payload) => {
    expect(() => unwrapCategoryList(payload)).toThrow();
  });
});

describe('getTotalPages', () => {
  it.each([
    [194, 12, 17],
    [24, 12, 2],
    [12, 12, 1],
    [1, 12, 1],
  ])('total %p at pageSize %p is %p pages', (total, size, expected) => {
    expect(getTotalPages(total, size)).toBe(expected);
  });

  it('reports 1 page for an empty result so page 1 always exists', () => {
    expect(getTotalPages(0, 12)).toBe(1);
  });

  it.each([
    [-1, 12],
    [1.5, 12],
    [10, 0],
    [10, -5],
  ])('throws for total %p / pageSize %p', (total, size) => {
    expect(() => getTotalPages(total, size)).toThrow();
  });
});

describe('clampPage', () => {
  it('keeps an in-range page', () => {
    expect(clampPage(3, 17)).toBe(3);
  });

  it('parses a string page from the URL', () => {
    expect(clampPage('4', 17)).toBe(4);
  });

  it('clamps above the last page down', () => {
    expect(clampPage(999, 17)).toBe(17);
  });

  // Page numbers come straight from a user-editable query string.
  it.each([['0'], ['-2'], ['abc'], [''], [null], [undefined], [NaN]])(
    'falls back to page 1 for %p',
    (page) => {
      expect(clampPage(page, 17)).toBe(1);
    }
  );
});

describe('getSkip', () => {
  it.each([
    [1, 12, 0],
    [2, 12, 12],
    [17, 12, 192],
  ])('page %p at size %p skips %p', (page, size, expected) => {
    expect(getSkip(page, size)).toBe(expected);
  });
});

describe('unwrapProduct', () => {
  it('returns a bare product object', () => {
    const product = { id: 6, title: 'Calvin Klein CK One', price: 49.99 };

    expect(unwrapProduct(product)).toBe(product);
  });

  // The mirror of unwrapProductList's guard: passing a list payload here means
  // the wrong endpoint was called.
  it('throws when handed a list envelope', () => {
    expect(() => unwrapProduct({ products: [], total: 0 })).toThrow(/envelope/i);
  });

  it('throws when the id is missing or not numeric', () => {
    expect(() => unwrapProduct({ title: 'No id' })).toThrow(/id/i);
    expect(() => unwrapProduct({ id: '6', title: 'String id' })).toThrow(/id/i);
  });

  it.each([[null], [undefined], ['a string'], [42], [[]]])('throws on %p', (payload) => {
    expect(() => unwrapProduct(payload)).toThrow();
  });
});

describe('getBrand', () => {
  it('returns the brand when present', () => {
    expect(getBrand({ brand: 'Chanel' })).toBe('Chanel');
  });

  // Groceries return brand: null rather than omitting the key.
  it.each([[null], [undefined], [''], ['   '], [42]])(
    'returns an empty string for brand %p',
    (brand) => {
      expect(getBrand({ brand })).toBe('');
    }
  );

  it('tolerates a missing product', () => {
    expect(getBrand(undefined)).toBe('');
  });
});
