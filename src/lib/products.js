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
 * The mirror of `unwrapProductList`: `/products/{id}` returns the product
 * bare, so an enveloped payload here means the wrong endpoint was called.
 *
 * @param {unknown} payload
 * @returns {object} The product.
 */
export function unwrapProduct(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new Error(
      `Unexpected DummyJSON response: expected a bare product object, received ${typeof payload}`
    );
  }

  if (Array.isArray(payload.products)) {
    throw new Error(
      'Unexpected DummyJSON response: received a { products: [...] } envelope where a ' +
        'bare product was expected. List endpoints must not be passed here.'
    );
  }

  if (typeof payload.id !== 'number') {
    throw new Error('Unexpected DummyJSON response: product is missing a numeric id.');
  }

  return payload;
}

/**
 * Some products (groceries, for example) carry `brand: null` rather than
 * omitting the key, so a plain `product.brand &&` check is what callers need
 * and this normalises it to a single falsy shape.
 *
 * @returns {string} The brand, or '' when absent.
 */
export function getBrand(product) {
  return typeof product?.brand === 'string' && product.brand.trim() ? product.brand : '';
}

/**
 * Same envelope as `unwrapProductList`, but also returns `total` so a listing
 * can paginate. `total` is the count for the *whole* query, not the page.
 *
 * @param {unknown} payload
 * @returns {{ products: object[], total: number }}
 */
export function unwrapProductPage(payload) {
  const products = unwrapProductList(payload);
  const { total } = payload;

  if (!Number.isInteger(total) || total < 0) {
    throw new Error(
      `Unexpected DummyJSON response: total must be a non-negative integer, received ${String(total)}`
    );
  }

  return { products, total };
}

/**
 * `/products/categories` returns a *bare array* of `{ slug, name, url }` —
 * no envelope. Entries missing slug or name are dropped rather than thrown on,
 * so one malformed category can't take down the whole filter.
 *
 * @param {unknown} payload
 * @returns {{ slug: string, name: string }[]}
 */
export function unwrapCategoryList(payload) {
  if (!Array.isArray(payload)) {
    throw new Error(
      `Unexpected DummyJSON response: /products/categories returns a bare array, received ${typeof payload}`
    );
  }

  return payload
    .filter((entry) => entry && typeof entry.slug === 'string' && typeof entry.name === 'string')
    .map(({ slug, name }) => ({ slug, name }));
}

/**
 * @returns {number} Page count, at least 1 so an empty result still has page 1.
 */
export function getTotalPages(total, pageSize) {
  if (!Number.isInteger(total) || total < 0) {
    throw new Error(`getTotalPages expected a non-negative integer total, received ${total}`);
  }
  if (!Number.isInteger(pageSize) || pageSize < 1) {
    throw new Error(`getTotalPages expected a positive integer pageSize, received ${pageSize}`);
  }

  return Math.max(1, Math.ceil(total / pageSize));
}

/**
 * Page numbers come from the URL, so they can be anything a user types.
 * Anything unparseable collapses to page 1.
 */
export function clampPage(page, totalPages) {
  const parsed = Number.parseInt(page, 10);

  if (!Number.isInteger(parsed) || parsed < 1) return 1;

  return Math.min(parsed, Math.max(1, totalPages));
}

/**
 * @returns {number} The `skip` value for a 1-based page number.
 */
export function getSkip(page, pageSize) {
  return (Math.max(1, page) - 1) * pageSize;
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
