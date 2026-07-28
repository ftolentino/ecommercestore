import { useCallback, useEffect, useState } from 'react';
import { fetchFeaturedProducts } from '../api/dummyjson.js';
import { ProductCard } from '../components/ProductCard.jsx';

export function HomePage() {
  const [products, setProducts] = useState([]);
  // Tracked explicitly rather than inferred from `products.length`, so an empty
  // result is distinguishable from a request still in flight.
  const [status, setStatus] = useState('loading');
  const [errorMessage, setErrorMessage] = useState('');
  // Bumped by the retry button to re-run the effect.
  const [attempt, setAttempt] = useState(0);

  // Resetting to `loading` happens here, in an event handler, rather than in
  // the effect body — react-hooks/set-state-in-effect forbids synchronous
  // setState inside an effect, and the initial render already starts loading.
  const retry = useCallback(() => {
    setStatus('loading');
    setErrorMessage('');
    setAttempt((n) => n + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    fetchFeaturedProducts(controller.signal)
      .then((list) => {
        setProducts(list);
        setStatus('success');
      })
      .catch((error) => {
        // An abort is our own cleanup unmounting the effect, not a failure.
        if (error.name === 'AbortError') return;
        setErrorMessage(error.message);
        setStatus('error');
      });

    return () => controller.abort();
  }, [attempt]);

  return (
    <>
      <h1 className="text-balance">Featured products</h1>

      {status === 'loading' && (
        <p role="status">
          <span className="loader" aria-hidden="true" /> Loading featured products…
        </p>
      )}

      {status === 'error' && (
        <div className="alert alert-red" role="alert">
          <p>
            <strong>Couldn&apos;t load featured products.</strong>
          </p>
          <p>{errorMessage}</p>
          <button type="button" className="btn btn-secondary btn-sm" onClick={retry}>
            Try again
          </button>
        </div>
      )}

      {status === 'success' && products.length === 0 && (
        <p className="text-secondary">No featured products are available right now.</p>
      )}

      {status === 'success' && products.length > 0 && (
        <div className="units-row equal-height">
          {products.map((product) => (
            // The unit-* class must be a direct child of units-row, which is
            // why it sits on this wrapper rather than inside ProductCard.
            <div key={product.id} className="unit-25 tablet-unit-50 phone-unit-100">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
    </>
  );
}
