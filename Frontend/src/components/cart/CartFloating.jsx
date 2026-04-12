import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  clearCart,
  removeOneFromCart,
  selectCartCountByUser,
  selectCartItemsByUser,
  selectCartSubtotalByUser,
  updateCartQty,
} from '../../features/cart/cartSlice';
import { selectCurrentUserId } from '../../features/auth/authSlice';
import { selectCurrentCurrency } from '../../features/preferences/currencySlice';
import { formatCurrencyFromUSD } from '../../utils/currency';

const CartFloating = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userId = useSelector(selectCurrentUserId);
  const currency = useSelector(selectCurrentCurrency);
  const items = useSelector((state) => selectCartItemsByUser(state, userId));
  const cartCount = useSelector((state) => selectCartCountByUser(state, userId));
  const subtotal = useSelector((state) => selectCartSubtotalByUser(state, userId));
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    const onPointerDown = (event) => {
      if (!open) return;
      if (wrapRef.current && !wrapRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open]);

  if (cartCount < 1) return null;

  const tree = (
    <div className="cart-floating-wrap" ref={wrapRef}>
      <aside className={`cart-popover ${open ? 'open' : 'closed'}`}>
        <div className="cart-header">
          <h3>Your Cart</h3>
          <span>{cartCount} item(s)</span>
        </div>

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
                    type="button"
                    className="cart-remove-btn liquid-btn"
                    title="Remove one unit"
                    onClick={() =>
                      dispatch(removeOneFromCart({ productId: item._id, userId }))
                    }
                  >
                    −1
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

        <button className="cart-clear-btn liquid-btn" onClick={() => dispatch(clearCart({ userId }))}>
          Clear cart
        </button>
        <button
          className="cart-checkout-btn liquid-btn"
          onClick={() => {
            setOpen(false);
            navigate('/checkout');
          }}
        >
          Proceed to checkout
        </button>
      </aside>

      <button
        type="button"
        className="cart-fab liquid-btn"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Open shopping cart"
        title="Shopping cart"
      >
        <span className="cart-fab__icon" role="img" aria-hidden="true">
          🛒
        </span>
        <span className="cart-fab__count">{cartCount}</span>
      </button>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(tree, document.body)
    : null;
};

export default CartFloating;
