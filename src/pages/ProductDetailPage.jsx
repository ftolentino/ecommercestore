import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchProduct } from '../api/dummyjson.js';
import { getDiscountedPrice } from '../lib/cart.js';
import { formatPrice, getBrand } from '../lib/products.js';
import { useCartStore } from '../stores/useCartStore.js';

export function ProductDetailPage() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  // 'notFound' is separate from 'error': a product that doesn't exist is a
  // normal outcome, not a broken API.
  const [status, setStatus] = useState('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [activeImage, setActiveImage] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const [justAdded, setJustAdded] = useState(false);

  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    const controller = new AbortController();

    fetchProduct(id, controller.signal)
      .then((result) => {
        setProduct(result);
        // Reset the gallery: navigating between products reuses this
        // component, so the previous product's index would otherwise stick.
        setActiveImage(0);
        setJustAdded(false);
        setStatus('success');
      })
      .catch((error) => {
        if (error.name === 'AbortError') return;
        if (error.status === 404) {
          setStatus('notFound');
          return;
        }
        setErrorMessage(error.message);
        setStatus('error');
      });

    return () => controller.abort();
  }, [id, attempt]);

  const retry = useCallback(() => {
    setStatus('loading');
    setErrorMessage('');
    setAttempt((n) => n + 1);
  }, []);

  if (status === 'loading') {
    return (
      <p role="status">
        <span className="loader" aria-hidden="true" /> Loading product…
      </p>
    );
  }

  if (status === 'notFound') {
    return (
      <>
        <h1 className="text-balance">Product not found</h1>
        <p className="text-secondary">No product exists with the id “{id}”.</p>
        <p>
          <Link to="/products">Browse all products</Link>
        </p>
      </>
    );
  }

  if (status === 'error') {
    return (
      <div className="alert alert-red" role="alert">
        <p>
          <strong>Couldn&apos;t load this product.</strong>
        </p>
        <p>{errorMessage}</p>
        <button type="button" className="btn btn-secondary btn-sm" onClick={retry}>
          Try again
        </button>
      </div>
    );
  }

  const brand = getBrand(product);
  const images = product.images?.length ? product.images : [product.thumbnail];
  const inStock = product.stock > 0;

  return (
    <>
      <p className="small">
        <Link to="/products">All products</Link>
        {' · '}
        <Link to={`/products?category=${encodeURIComponent(product.category)}`}>
          {product.category}
        </Link>
      </p>

      <div className="units-row">
        <div className="unit-50 tablet-unit-100">
          <img src={images[activeImage]} alt={product.title} width="300" height="300" />

          {images.length > 1 && (
            <div className="btn-group" role="group" aria-label="Product images">
              {images.map((image, index) => (
                <button
                  key={image}
                  type="button"
                  className={`btn btn-sm ${index === activeImage ? 'btn-primary' : 'btn-secondary'}`}
                  aria-pressed={index === activeImage}
                  onClick={() => setActiveImage(index)}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="unit-50 tablet-unit-100">
          <h1 className="text-balance">{product.title}</h1>

          {/* brand is null on some products (groceries), so it is guarded. */}
          {brand && <p className="text-secondary no-margin">{brand}</p>}

          <p>
            <strong className="h3">
              {formatPrice(getDiscountedPrice(product.price, product.discountPercentage))}
            </strong>{' '}
            {product.discountPercentage > 0 && (
              <>
                <s className="text-tertiary">{formatPrice(product.price)}</s>{' '}
                <span className="label label-red">{product.discountPercentage}% off</span>
              </>
            )}
          </p>

          <p className="text-secondary small">
            <span aria-hidden="true">★</span> {product.rating}
            <span className="sr-only"> out of 5 rating</span>
            {' · '}
            <span className={inStock ? '' : 'text-tertiary'}>
              {product.availabilityStatus ?? (inStock ? 'In Stock' : 'Out of Stock')}
              {inStock ? ` (${product.stock} left)` : ''}
            </span>
          </p>

          <p>{product.description}</p>

          <p>
            <button
              type="button"
              className="btn btn-primary"
              disabled={!inStock}
              onClick={() => {
                addItem(product, 1);
                setJustAdded(true);
              }}
            >
              {inStock ? 'Add to cart' : 'Out of stock'}
            </button>
          </p>

          {justAdded && (
            <div className="alert alert-green" role="status">
              Added to your cart. <Link to="/cart">View cart</Link>
            </div>
          )}

          <dl>
            {product.sku && (
              <>
                <dt>SKU</dt>
                <dd>{product.sku}</dd>
              </>
            )}
            {product.shippingInformation && (
              <>
                <dt>Shipping</dt>
                <dd>{product.shippingInformation}</dd>
              </>
            )}
            {product.warrantyInformation && (
              <>
                <dt>Warranty</dt>
                <dd>{product.warrantyInformation}</dd>
              </>
            )}
            {product.returnPolicy && (
              <>
                <dt>Returns</dt>
                <dd>{product.returnPolicy}</dd>
              </>
            )}
          </dl>
        </div>
      </div>
    </>
  );
}
