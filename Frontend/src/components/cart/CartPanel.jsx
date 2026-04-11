import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  clearCart,
  removeFromCart,
  selectCartCountByUser,
  selectCartItemsByUser,
  selectCartSubtotalByUser,
  updateCartQty,
} from '../../features/cart/cartSlice';
import { selectCurrentUserId } from '../../features/auth/authSlice';
import { selectCurrentCurrency } from '../../features/preferences/currencySlice';
import { formatCurrencyFromUSD } from '../../utils/currency';

const CartPanel = () => {
  const dispatch = useDispatch();
  const userId = useSelector(selectCurrentUserId);
  const currency = useSelector(selectCurrentCurrency);
  const items = useSelector((state) => selectCartItemsByUser(state, userId));
  const cartCount = useSelector((state) => selectCartCountByUser(state, userId));
  const subtotal = useSelector((state) => selectCartSubtotalByUser(state, userId));

  return (
    <aside className="cart-panel">
      <div className="cart-header">
        <h3>Your Cart</h3>
        <span>{cartCount} item(s)</span>
      </div>

      {items.length === 0 ? (
        <p className="cart-empty">No items in cart yet.</p>
      ) : (
        <>
          <div className="cart-items">
            {items.map((item) => (
              <div className="cart-item" key={item._id}>
                <img src={item.image} alt={item.name} className="cart-thumb" />
                <div className="cart-info">
                  <p className="cart-name">{item.name}</p>
                  <p className="cart-price">{formatCurrencyFromUSD(item.price, currency)}</p>

                  <div className="cart-actions">
                    <input
                      type="number"
                      min={1}
                      max={Math.max(1, Number(item.countInStock || 1))}
                      value={item.qty}
                      onChange={(e) =>
                        dispatch(
                          updateCartQty({
                            productId: item._id,
                            qty: Number(e.target.value),
                            userId,
                          })
                        )
                      }
                    />
                    <button
                      className="cart-remove-btn"
                      onClick={() => dispatch(removeFromCart({ productId: item._id, userId }))}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-footer">
            <p>Subtotal</p>
            <strong>{formatCurrencyFromUSD(subtotal, currency)}</strong>
          </div>

          <button className="cart-clear-btn" onClick={() => dispatch(clearCart({ userId }))}>
            Clear cart
          </button>
        </>
      )}
    </aside>
  );
};

export default CartPanel;
