import { unwrapProductList } from '../lib/products.js';

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
    throw new Error(`DummyJSON ${path} failed: ${response.status} ${response.statusText}`);
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
