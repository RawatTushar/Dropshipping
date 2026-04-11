import React, { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { clearCart, selectCartItems, selectCartSubtotal } from '../features/cart/cartSlice';
import { selectCurrentUserId } from '../features/auth/authSlice';
import { selectCurrentCurrency } from '../features/preferences/currencySlice';
import {
  createOrder,
  selectOrderCreateError,
  selectOrderCreating,
} from '../features/orders/ordersSlice';
import { fetchProducts } from '../features/products/productsSlice';
import { formatCurrencyFromUSD } from '../utils/currency';
import '../checkoutScreen.css';

const CheckoutScreen = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const items = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartSubtotal);
  const userId = useSelector(selectCurrentUserId);
  const currency = useSelector(selectCurrentCurrency);
  const creatingOrder = useSelector(selectOrderCreating);
  const createOrderError = useSelector(selectOrderCreateError);
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const paymentMethod = 'cash';

  const canPlaceOrder = useMemo(() => items.length > 0 && address.trim().length > 8, [items.length, address]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!items.length) {
      setError('Your cart is empty.');
      return;
    }
    if (address.trim().length < 8) {
      setError('Please add a complete delivery address.');
      return;
    }

    const itemsPrice = Number(subtotal.toFixed(2));
    const shippingPrice = 0;
    const taxPrice = 0;
    const totalPrice = Number((itemsPrice + shippingPrice + taxPrice).toFixed(2));

    const result = await dispatch(
      createOrder({
        userId,
        orderItems: items.map((item) => ({
          name: item.name,
          qty: Number(item.qty || 0),
          image: item.image,
          price: Number(item.price || 0),
          product: item._id,
        })),
        shippingAddress: {
          address: address.trim(),
          city: '',
          postalCode: '',
          country: '',
        },
        paymentMethod,
        itemsPrice,
        shippingPrice,
        taxPrice,
        totalPrice,
      })
    );

    if (createOrder.fulfilled.match(result)) {
      await dispatch(fetchProducts());
      dispatch(clearCart({ userId }));
      navigate('/orders');
      return;
    }

    setError(result.payload || 'Failed to place order.');
  };

  return (
    <DashboardLayout title="Checkout" subtitle="Confirm address and place your order">
      <div className="checkout-wrap">
        <form className="checkout-form" onSubmit={onSubmit}>
          <h3>Payment Method</h3>
          <label className="checkout-radio">
            <input type="radio" checked readOnly />
            <span>Cash on Delivery (only option)</span>
          </label>

          <h3>Delivery Address</h3>
          <textarea
            value={address}
            onChange={(e) => {
              setAddress(e.target.value);
              setError('');
            }}
            placeholder="Enter full delivery address"
            rows={4}
          />

          {error ? <p className="catalog-error">{error}</p> : null}
          {!error && createOrderError ? <p className="catalog-error">{createOrderError}</p> : null}

          <button className="btn-primary" type="submit" disabled={!canPlaceOrder || creatingOrder}>
            {creatingOrder ? 'Placing order...' : 'Place Order'}
          </button>
        </form>

        <aside className="checkout-summary">
          <h3>Order Summary</h3>
          {items.length === 0 ? <p>No products in cart.</p> : null}
          <div className="checkout-summary-list">
            {items.map((item) => (
              <div className="checkout-summary-item" key={item._id}>
                <img src={item.image} alt={item.name} />
                <div>
                  <p>{item.name}</p>
                  <span>Qty {item.qty} x {formatCurrencyFromUSD(item.price, currency)}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="checkout-total">
            <p>Total</p>
            <strong>{formatCurrencyFromUSD(subtotal, currency)}</strong>
          </div>
        </aside>
      </div>
    </DashboardLayout>
  );
};

export default CheckoutScreen;
