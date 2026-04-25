import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import DashboardLayout from '../../../components/DashboardLayout';
import { paymentsAPI, getApiErrorMessage } from '../../../api/api';
import { clearCart } from '../../cart/cartSlice';
import { selectCurrentUserId } from '../../auth/authSlice';
import { fetchProducts } from '../../products/productsSlice';
import { fetchMyOrders } from '../ordersSlice';
import '../../../checkoutScreen.css';

const CheckoutSuccessScreen = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const userId = useSelector(selectCurrentUserId);
  const ran = useRef(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!sessionId) return;
    if (ran.current) return;
    ran.current = true;

    (async () => {
      try {
        await paymentsAPI.completeStripeCheckout(sessionId);
        await dispatch(fetchProducts());
        await dispatch(fetchMyOrders());
        dispatch(clearCart({ userId }));
        navigate('/orders', { replace: true });
      } catch (err) {
        setError(getApiErrorMessage(err, 'Could not confirm your payment.'));
        ran.current = false;
      }
    })();
  }, [sessionId, dispatch, navigate, userId]);

  if (!sessionId) {
    return (
      <DashboardLayout title="Checkout" subtitle="Payment session">
        <div className="checkout-success">
          <p className="checkout-success__msg">Missing payment session. Return to checkout and try again.</p>
          <Link className="checkout-success__link" to="/checkout">
            Back to checkout
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Payment" subtitle="Securing your order">
      <div className="checkout-success">
        {error ? (
          <>
            <p className="catalog-error">{error}</p>
            <Link className="checkout-success__link" to="/checkout">
              Back to checkout
            </Link>
          </>
        ) : (
          <div className="checkout-success__pending">
            <div className="checkout-success__spinner" aria-hidden />
            <p className="checkout-success__title">Confirming payment…</p>
            <p className="checkout-success__hint">Almost done — do not close this tab.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CheckoutSuccessScreen;
