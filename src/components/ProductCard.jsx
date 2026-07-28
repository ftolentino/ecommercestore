import { Link } from 'react-router-dom';
import { formatPrice } from '../lib/products.js';

// A Ply "card" is a utility combination, not a component: surface background,
// border, radius, padding. `no-link-style` stops the title link picking up the
// default link colour and underline.
export function ProductCard({ product }) {
  return (
    <article className="bg-surface border border-radius padding no-link-style">
      <Link to={`/products/${product.id}`}>
        {/* DummyJSON thumbnails are 300x300. Declaring the intrinsic size lets
            the browser reserve the aspect ratio before the lazy image arrives,
            so the grid doesn't reflow as thumbnails load. Ply's global
            `max-width:100%; height:auto` keeps the rendered size responsive. */}
        <img src={product.thumbnail} alt={product.title} width="300" height="300" loading="lazy" />
        {/* h2 keeps the heading level correct under the page h1; the h5 class
            only changes the size. */}
        <h2 className="h5">{product.title}</h2>
      </Link>

      {/* no-margin so the last line sits flush with the card's padding box. */}
      <p className="no-margin">
        <strong>{formatPrice(product.price)}</strong>{' '}
        <span className="text-secondary small">
          <span aria-hidden="true">★</span> {product.rating}
          <span className="sr-only"> out of 5 rating</span>
        </span>
      </p>
    </article>
  );
}
