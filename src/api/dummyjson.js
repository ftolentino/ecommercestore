import {
  unwrapCategoryList,
  unwrapProduct,
  unwrapProductList,
  unwrapProductPage,
} from '../lib/products.js';

// Every fetch call in the app lives in this file. Keeping the boundary here is
// what makes "DummyJSON is the only data source" verifiable by grepping for
// `fetch(` outside src/api/.
const BASE_URL = 'https://dummyjson.com';

/**
 * @param {string} path Path beginning with `/`, e.g. `/products?limit=8`.
 * @param {AbortSignal} [signal] Lets the caller cancel on unmount.
 */
async function getJson(path, signal) {
  const response = await fetch(`${BASE_URL}${path}`, { signal });

  // fetch only rejects on network failure, so a 404 or 500 would otherwise fall
  // through and fail later as a confusing parse error.
  if (!response.ok) {
    const error = new Error(`DummyJSON ${path} failed: ${response.status} ${response.statusText}`);
    // Callers need to tell "this product doesn't exist" (404) apart from
    // "the API is broken", so the status rides along on the error.
    error.status = response.status;
    throw error;
  }

  return response.json();
}

/**
 * Featured products for the home page.
 *
 * @param {AbortSignal} [signal]
 * @returns {Promise<object[]>}
 */
export async function fetchFeaturedProducts(signal) {
  return unwrapProductList(await getJson('/products?limit=8', signal));
}

/**
 * Category options for the listing filter.
 *
 * @param {AbortSignal} [signal]
 * @returns {Promise<{ slug: string, name: string }[]>}
 */
export async function fetchCategories(signal) {
  return unwrapCategoryList(await getJson('/products/categories', signal));
}

/**
 * One page of the listing, optionally narrowed to a category.
 *
 * An unknown category slug is not an error here — DummyJSON answers 200 with
 * `{ products: [], total: 0 }`, which surfaces as an empty page.
 *
 * @param {{ category?: string, limit: number, skip: number }} options
 * @param {AbortSignal} [signal]
 * @returns {Promise<{ products: object[], total: number }>}
 */
export async function fetchProducts({ category, limit, skip }, signal) {
  const query = new URLSearchParams({ limit: String(limit), skip: String(skip) });
  const path = category
    ? `/products/category/${encodeURIComponent(category)}?${query}`
    : `/products?${query}`;

  return unwrapProductPage(await getJson(path, signal));
}

/**
 * A single product. Note this endpoint returns the product **bare** — no
 * envelope — unlike every list endpoint above.
 *
 * Rejects with an error carrying `status === 404` when the id doesn't exist.
 *
 * @param {string|number} id
 * @param {AbortSignal} [signal]
 * @returns {Promise<object>}
 */
export async function fetchProduct(id, signal) {
  return unwrapProduct(await getJson(`/products/${encodeURIComponent(id)}`, signal));
}
