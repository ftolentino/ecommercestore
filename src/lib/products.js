// Pure helpers for DummyJSON product data. No imports from stores, components,
// or the API layer — this is the module the unit tests cover.

/**
 * DummyJSON list endpoints wrap results in `{ products, total, skip, limit }`,
 * but a single product (`/products/{id}`) comes back bare. Mixing the two up is
 * the easiest mistake to make against this API, so unwrapping happens here and
 * nowhere else.
 *
 * @param {unknown} payload Parsed JSON from a list endpoint.
 * @returns {object[]} The products array.
 */
export function unwrapProductList(payload) {
  if (!payload || typeof payload !== 'object' || !Array.isArray(payload.products)) {
    throw new Error(
      'Unexpected DummyJSON response: expected a { products: [...] } envelope. ' +
        'Single-product endpoints return a bare object and must not be passed here.'
    );
  }

  return payload.products;
}

/**
 * @param {number} value A price in USD.
 * @returns {string} e.g. `$9.99`
 */
export function formatPrice(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(`formatPrice expected a finite number, received: ${String(value)}`);
  }

  return `$${value.toFixed(2)}`;
}
