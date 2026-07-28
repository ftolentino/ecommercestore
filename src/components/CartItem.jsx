import { Link } from 'react-router-dom';
import { getDiscountedPrice, getLineTotal } from '../lib/cart.js';
import { formatPrice } from '../lib/products.js';

export function CartItem({ line, onQuantityChange, onRemove }) {
  const unitPrice = getDiscountedPrice(line.price, line.discountPercentage);
  const discounted = unitPrice < line.price;

  return (
    <tr>
      <td>
        <Link to={`/products/${line.id}`} className="no-link-style">
          <img
            src={line.thumbnail}
            alt={line.title}
            width="300"
            height="300"
            className="width-10"
          />
        </Link>
      </td>

      <td>
        <Link to={`/products/${line.id}`}>{line.title}</Link>
      </td>

      <td>
        {formatPrice(unitPrice)}
        {discounted && (
          <>
            {' '}
            <s className="text-tertiary small">{formatPrice(line.price)}</s>
          </>
        )}
      </td>

      <td>
        <label className="sr-only" htmlFor={`quantity-${line.id}`}>
          Quantity for {line.title}
        </label>
        <input
          id={`quantity-${line.id}`}
          type="number"
          min="1"
          max={line.stock || 99}
          value={line.quantity}
          onChange={(event) => onQuantityChange(line.id, event.target.value)}
        />
      </td>

      <td>
        <strong>{formatPrice(getLineTotal(line))}</strong>
      </td>

      <td>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => onRemove(line.id)}
        >
          Remove
          <span className="sr-only"> {line.title} from cart</span>
        </button>
      </td>
    </tr>
  );
}
