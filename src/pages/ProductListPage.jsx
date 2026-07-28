import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchCategories, fetchProducts } from '../api/dummyjson.js';
import { CategoryFilter } from '../components/CategoryFilter.jsx';
import { ProductCard } from '../components/ProductCard.jsx';
import { clampPage, getSkip, getTotalPages } from '../lib/products.js';

const PAGE_SIZE = 12;

export function ProductListPage() {
  // Category and page live in the URL so the view is shareable and the back
  // button works — the reason react-router is an approved dependency.
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get('category') ?? '';
  // Total isn't known until the response lands, so this only sanitises junk
  // like `?page=abc` to 1; the upper bound is applied after the fetch.
  const page = clampPage(searchParams.get('page'), Number.MAX_SAFE_INTEGER);

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [attempt, setAttempt] = useState(0);

  const totalPages = getTotalPages(total, PAGE_SIZE);

  // Categories are fetched once; a failure here is non-fatal, since the
  // listing itself still works without the filter.
  useEffect(() => {
    const controller = new AbortController();

    fetchCategories(controller.signal)
      .then(setCategories)
      .catch((error) => {
        if (error.name !== 'AbortError') setCategories([]);
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    fetchProducts(
      { category: category || undefined, limit: PAGE_SIZE, skip: getSkip(page, PAGE_SIZE) },
      controller.signal
    )
      .then((result) => {
        setProducts(result.products);
        setTotal(result.total);
        setStatus('success');
      })
      .catch((error) => {
        if (error.name === 'AbortError') return;
        setErrorMessage(error.message);
        setStatus('error');
      });

    return () => controller.abort();
  }, [category, page, attempt]);

  const goToPage = useCallback(
    (next) => {
      setStatus('loading');
      setSearchParams((params) => {
        const updated = new URLSearchParams(params);
        if (next <= 1) updated.delete('page');
        else updated.set('page', String(next));
        return updated;
      });
    },
    [setSearchParams]
  );

  const changeCategory = useCallback(
    (slug) => {
      setStatus('loading');
      setSearchParams(() => {
        const updated = new URLSearchParams();
        if (slug) updated.set('category', slug);
        // Page deliberately resets: page 7 of "all" rarely exists in a category.
        return updated;
      });
    },
    [setSearchParams]
  );

  const retry = useCallback(() => {
    setStatus('loading');
    setErrorMessage('');
    setAttempt((n) => n + 1);
  }, []);

  return (
    <>
      <h1 className="text-balance">Products</h1>

      <CategoryFilter
        categories={categories}
        value={category}
        onChange={changeCategory}
        disabled={status === 'loading'}
      />

      {status === 'loading' && (
        <p role="status">
          <span className="loader" aria-hidden="true" /> Loading products…
        </p>
      )}

      {status === 'error' && (
        <div className="alert alert-red" role="alert">
          <p>
            <strong>Couldn&apos;t load products.</strong>
          </p>
          <p>{errorMessage}</p>
          <button type="button" className="btn btn-secondary btn-sm" onClick={retry}>
            Try again
          </button>
        </div>
      )}

      {status === 'success' && products.length === 0 && (
        <p className="text-secondary">
          {page > 1
            ? 'That page is past the end of the results.'
            : 'No products match this category.'}
          {page > 1 && (
            <>
              {' '}
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => goToPage(1)}
              >
                Back to page 1
              </button>
            </>
          )}
        </p>
      )}

      {status === 'success' && products.length > 0 && (
        <>
          <p className="text-secondary small" aria-live="polite">
            {total} product{total === 1 ? '' : 's'}
            {category ? ' in this category' : ''} · page {page} of {totalPages}
          </p>

          <div className="units-row equal-height">
            {products.map((product) => (
              // unit-* must be a direct child of units-row.
              <div key={product.id} className="unit-25 tablet-unit-50 phone-unit-100">
                <ProductCard product={product} />
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <nav className="btn-group" aria-label="Pagination">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => goToPage(page - 1)}
                disabled={page <= 1}
              >
                Previous
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => goToPage(page + 1)}
                disabled={page >= totalPages}
              >
                Next
              </button>
            </nav>
          )}
        </>
      )}
    </>
  );
}
