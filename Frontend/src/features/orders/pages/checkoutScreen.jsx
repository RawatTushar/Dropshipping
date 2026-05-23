import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { CreditCard, Truck } from 'lucide-react';
import DashboardLayout from '../../../components/DashboardLayout';
import { clearCart, selectCartItems, selectCartSubtotal } from '../../cart/cartSlice';
import {
  selectCurrentUserId,
  selectIsAuthenticated,
  selectSessionReady,
  setCredentials,
} from '../../auth/authSlice';
import { authAPI } from '../../../api/api';
import { selectCurrentCurrency } from '../../preferences/currencySlice';
import {
  createOrder,
  selectOrderCreateError,
  selectOrderCreating,
} from '../ordersSlice';
import { fetchProducts } from '../../products/productsSlice';
import { formatCurrencyFromUSD } from '../../../utils/currency';
import { paymentsAPI, getApiErrorMessage } from '../../../api/api';
import '../../../checkoutScreen.css';

const CheckoutScreen = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const items = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartSubtotal);
  const userId = useSelector(selectCurrentUserId);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const sessionReady = useSelector(selectSessionReady);
  const currency = useSelector(selectCurrentCurrency);
  const creatingOrder = useSelector(selectOrderCreating);
  const createOrderError = useSelector(selectOrderCreateError);

  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [stripeReady, setStripeReady] = useState(false);
  const [stripeRedirecting, setStripeRedirecting] = useState(false);

  const canceled = searchParams.get('payment') === 'canceled';
  const shippingPrice = 0;
  const taxPrice = 0;
  const totalNum = useMemo(
    () => Number((subtotal + shippingPrice + taxPrice).toFixed(2)),
    [subtotal, shippingPrice, taxPrice],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await paymentsAPI.getConfig();
        if (!cancelled) setStripeReady(Boolean(data?.stripeEnabled));
      } catch {
        if (!cancelled) setStripeReady(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!sessionReady || isAuthenticated) return undefined;
    let cancelled = false;
    (async () => {
      try {
        const { data } = await authAPI.me();
        if (!cancelled) {
          dispatch(
            setCredentials({
              _id: data._id,
              name: data.name,
              email: data.email,
              isAdmin: data.isAdmin,
            }),
          );
        }
      } catch {
        /* banner + login link stay visible */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [dispatch, sessionReady, isAuthenticated]);

  useEffect(() => {
    if (canceled) {
      const t = window.setTimeout(() => {
        setSearchParams({}, { replace: true });
      }, 6000);
      return () => window.clearTimeout(t);
    }
    return undefined;
  }, [canceled, setSearchParams]);

  const canSubmit = useMemo(
    () =>
      sessionReady &&
      items.length > 0 &&
      address.trim().length > 8 &&
      isAuthenticated,
    [sessionReady, items.length, address, isAuthenticated],
  );

  const busy = creatingOrder || stripeRedirecting;

  const buildOrderPayload = () => {
    const itemsPrice = Number(subtotal.toFixed(2));
    return {
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
      paymentMethod: paymentMethod === 'stripe' ? 'stripe' : 'cod',
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice: Number((itemsPrice + shippingPrice + taxPrice).toFixed(2)),
    };
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!sessionReady) {
      setError('Checking your sign-in status…');
      return;
    }
    if (!isAuthenticated) {
      setError('Please sign in to place an order.');
      return;
    }
    if (!items.length) {
      setError('Your cart is empty.');
      return;
    }
    if (address.trim().length < 8) {
      setError('Please add a complete delivery address.');
      return;
    }

    if (paymentMethod === 'stripe') {
      if (!stripeReady) {
        setError('Card checkout is not available. Choose cash on delivery or configure Stripe on the server.');
        return;
      }
      setStripeRedirecting(true);
      try {
        const { data } = await paymentsAPI.createCheckoutSession(buildOrderPayload());
        if (data?.url) {
          window.location.assign(data.url);
          return;
        }
        setError('Could not start card checkout.');
      } catch (err) {
        setError(getApiErrorMessage(err, 'Could not start card checkout.'));
      } finally {
        setStripeRedirecting(false);
      }
      return;
    }

    const payload = buildOrderPayload();
    payload.paymentMethod = 'cod';

    const result = await dispatch(
      createOrder({
        ...payload,
        paymentMethod: 'cod',
      }),
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
    <DashboardLayout title="Checkout" subtitle="Review your bag, choose payment, and confirm delivery">
      <div className="checkout-page">
        {sessionReady && !isAuthenticated ? (
          <div className="checkout-banner checkout-banner--warn">
            <p>
              <strong>Sign in required</strong> to place an order.{' '}
              <Link to="/login">Go to login</Link>
            </p>
          </div>
        ) : null}

        {canceled ? (
          <div className="checkout-banner checkout-banner--info">
            Card checkout was canceled — your cart is unchanged. Choose a payment method below when you are ready.
          </div>
        ) : null}

        <div className="checkout-wrap">
          <form className="checkout-form checkout-form--elevated" onSubmit={onSubmit}>
            <div className="checkout-section">
              <h3 className="checkout-section__title">Payment</h3>
              <p className="checkout-section__hint">Pick how you want to pay. Card payments are processed securely by Stripe.</p>

              <div className="checkout-pay-grid">
                <button
                  type="button"
                  className={`checkout-pay-card${paymentMethod === 'cod' ? ' checkout-pay-card--active' : ''}`}
                  onClick={() => {
                    setPaymentMethod('cod');
                    setError('');
                  }}
                >
                  <span className="checkout-pay-card__icon" aria-hidden>
                    <Truck size={22} strokeWidth={2} />
                  </span>
                  <span className="checkout-pay-card__label">Cash on delivery</span>
                  <span className="checkout-pay-card__sub">Pay when your order arrives</span>
                </button>

                <button
                  type="button"
                  className={`checkout-pay-card${paymentMethod === 'stripe' ? ' checkout-pay-card--active' : ''}`}
                  onClick={() => {
                    if (!stripeReady) return;
                    setPaymentMethod('stripe');
                    setError('');
                  }}
                  disabled={!stripeReady}
                  title={!stripeReady ? 'Add STRIPE_SECRET_KEY on the server to enable' : 'Pay with card'}
                >
                  <span className="checkout-pay-card__icon" aria-hidden>
                    <CreditCard size={22} strokeWidth={2} />
                  </span>
                  <span className="checkout-pay-card__label">Card</span>
                  <span className="checkout-pay-card__sub">
                    {stripeReady ? 'Secure checkout via Stripe' : 'Unavailable — not configured'}
                  </span>
                </button>
              </div>
            </div>

            <div className="checkout-section">
              <h3 className="checkout-section__title">Delivery address</h3>
              <label className="checkout-label" htmlFor="checkout-address">
                Full address
              </label>
              <textarea
                id="checkout-address"
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  setError('');
                }}
                placeholder="Street, city, postal code, country"
                rows={4}
                autoComplete="street-address"
              />
            </div>

            {error ? <p className="catalog-error">{error}</p> : null}
            {!error && createOrderError ? <p className="catalog-error">{createOrderError}</p> : null}

            <button
              className="checkout-submit liquid-btn"
              type="submit"
              disabled={!canSubmit || busy}
            >
              {stripeRedirecting
                ? 'Opening secure checkout…'
                : creatingOrder
                  ? 'Placing order…'
                  : paymentMethod === 'stripe'
                    ? 'Continue to pay with card'
                    : 'Place order (COD)'}
            </button>
          </form>

          <aside className="checkout-summary checkout-summary--elevated">
            <h3 className="checkout-summary__title">Your cart</h3>
            <p className="checkout-summary__meta">
              {items.length} {items.length === 1 ? 'item' : 'items'} · saved on this device
            </p>
            {items.length === 0 ? (
              <p className="checkout-empty">
                No products yet.{' '}
                <Link to="/products">Browse catalog</Link>
              </p>
            ) : null}
            <div className="checkout-summary-list">
              {items.map((item) => (
                <div className="checkout-summary-item" key={item._id}>
                  <img src={item.image} alt="" />
                  <div>
                    <p>{item.name}</p>
                    <span>
                      Qty {item.qty} × {formatCurrencyFromUSD(item.price, currency)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="checkout-total checkout-total--stacked">
              <div className="checkout-total__row">
                <span>Subtotal</span>
                <span>{formatCurrencyFromUSD(subtotal, currency)}</span>
              </div>
              <div className="checkout-total__row checkout-total__row--muted">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="checkout-total__row checkout-total__row--grand">
                <span>Total</span>
                <strong>{formatCurrencyFromUSD(totalNum, currency)}</strong>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CheckoutScreen;
