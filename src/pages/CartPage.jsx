import { Link } from 'react-router-dom';
import { CartItem } from '../components/CartItem.jsx';
import { getItemCount, getSavings, getSubtotal } from '../lib/cart.js';
import { formatPrice } from '../lib/products.js';
import { useCartStore } from '../stores/useCartStore.js';

export function CartPage() {
  const items = useCartStore((state) => state.items);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clear = useCartStore((state) => state.clear);

  const subtotal = getSubtotal(items);
  const savings = getSavings(items);
  const count = getItemCount(items);

  if (items.length === 0) {
    return (
      <>
        <h1 className="text-balance">Cart</h1>
        <p className="text-secondary">Your cart is empty.</p>
        <p>
          <Link to="/products">Browse products</Link>
        </p>
      </>
    );
  }

  return (
    <>
      <h1 className="text-balance">Cart</h1>
      <p className="text-secondary small" aria-live="polite">
        {count} item{count === 1 ? '' : 's'}
      </p>

      {/* Ply auto-styles <table>, so no classes are needed here. */}
      <table>
        <thead>
          <tr>
            <th>
              <span className="sr-only">Image</span>
            </th>
            <th>Product</th>
            <th>Unit price</th>
            <th>Quantity</th>
            <th>Line total</th>
            <th>
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((line) => (
            <CartItem
              key={line.id}
              line={line}
              onQuantityChange={setQuantity}
              onRemove={removeItem}
            />
          ))}
        </tbody>
      </table>

      <div className="units-row">
        <div className="unit-50 tablet-unit-100">
          <button type="button" className="btn btn-secondary btn-sm" onClick={clear}>
            Clear cart
          </button>
        </div>

        <div className="unit-50 tablet-unit-100 text-right">
          {savings > 0 && (
            <p className="no-margin text-secondary">
              You save <strong>{formatPrice(savings)}</strong>
            </p>
          )}
          <p className="h3">Subtotal {formatPrice(subtotal)}</p>
        </div>
      </div>
    </>
  );
}
