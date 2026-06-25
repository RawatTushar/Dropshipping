import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import DashboardLayout from '../../../components/DashboardLayout';
import ModalHome from '../../../components/modalHome';
import {
  cancelOrder,
  fetchMyOrders,
  updateOrder,
  selectOrders,
  selectOrdersError,
  selectOrdersLoading,
} from '../ordersSlice';
import { selectCurrentCurrency } from '../../preferences/currencySlice';
import { formatCurrencyFromUSD } from '../../../utils/currency';
import { useSiteTheme } from '../../../utils/siteTheme';
import { Package, Truck, Info, Calendar, Ban, Pencil } from 'lucide-react';
import '../../../productsScreen.css';
import '../../../checkoutScreen.css';

const CANCEL_CONFIRM_PHRASE = 'Delete';

/** Must match backend ORDER_EDIT_WINDOW_MS (24 hours). */
const ORDER_EDIT_WINDOW_MS = 24 * 60 * 60 * 1000;

const ORDER_EDIT_EXPIRED_TITLE =
  "You can't change this order — the 24-hour edit window has closed.";
const ORDER_DELETE_EXPIRED_TITLE =
  "You can't delete this order — the 24-hour delete window has closed.";

function isOrderWithinEditWindow(order) {
  if (!order?.createdAt) return false;
  const t = new Date(order.createdAt).getTime();
  if (!Number.isFinite(t)) return false;
  return Date.now() - t <= ORDER_EDIT_WINDOW_MS;
}

function isOrderWithinDeleteWindow(order) {
  if (!order?.createdAt) return false;
  const t = new Date(order.createdAt).getTime();
  if (!Number.isFinite(t)) return false;
  return Date.now() - t <= ORDER_EDIT_WINDOW_MS;
}

const OrdersScreen = () => {
  const dispatch = useDispatch();
  const orders = useSelector(selectOrders);
  const currency = useSelector(selectCurrentCurrency);
  const loading = useSelector(selectOrdersLoading);
  const error = useSelector(selectOrdersError);
  const theme = useSiteTheme();

  const [activeModalItem, setActiveModalItem] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelPhrase, setCancelPhrase] = useState('');
  const [cancelBusy, setCancelBusy] = useState(false);
  const [cancelErr, setCancelErr] = useState('');

  const [editTarget, setEditTarget] = useState(null);
  const [editAddress, setEditAddress] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editPostal, setEditPostal] = useState('');
  const [editCountry, setEditCountry] = useState('');
  const [editBusy, setEditBusy] = useState(false);
  const [editErr, setEditErr] = useState('');

  useEffect(() => {
    dispatch(fetchMyOrders());
  }, [dispatch]);

  const openItemDetails = (item) => {
    setActiveModalItem(item);
  };

  const openCancelOrder = (order) => {
    setCancelTarget(order);
    setCancelPhrase('');
    setCancelErr('');
  };

  const closeCancelOrder = () => {
    if (cancelBusy) return;
    setCancelTarget(null);
    setCancelPhrase('');
    setCancelErr('');
  };

  const openEditOrder = (order) => {
    const sa = order.shippingAddress || {};
    setEditTarget(order);
    setEditAddress(String(sa.address || '').trim());
    setEditCity(String(sa.city || '').trim());
    setEditPostal(String(sa.postalCode || '').trim());
    setEditCountry(String(sa.country || '').trim());
    setEditErr('');
  };

  const closeEditOrder = () => {
    if (editBusy) return;
    setEditTarget(null);
    setEditErr('');
  };

  const onSaveEditOrder = async () => {
    if (!editTarget?._id) return;
    const address = editAddress.trim();
    if (address.length < 8) {
      setEditErr('Please enter a complete delivery address (at least 8 characters).');
      return;
    }
    setEditBusy(true);
    setEditErr('');
    const result = await dispatch(
      updateOrder({
        orderId: editTarget._id,
        shippingAddress: {
          address,
          city: editCity.trim(),
          postalCode: editPostal.trim(),
          country: editCountry.trim(),
        },
      })
    );
    setEditBusy(false);
    if (updateOrder.fulfilled.match(result)) {
      setEditTarget(null);
      return;
    }
    setEditErr(result.payload || 'Could not update this order.');
  };

  const onConfirmCancelOrder = async () => {
    if (!cancelTarget?._id) return;
    if (cancelPhrase.trim() !== CANCEL_CONFIRM_PHRASE) {
      setCancelErr(`Type ${CANCEL_CONFIRM_PHRASE} exactly to confirm.`);
      return;
    }
    setCancelBusy(true);
    setCancelErr('');
    const result = await dispatch(cancelOrder(cancelTarget._id));
    console.log("resultttt cancel",result)
    setCancelBusy(false);
    if (cancelOrder.fulfilled.match(result)) {
      setCancelTarget(null);
      setCancelPhrase('');
      return;
    }
    setCancelErr(result.payload || 'Could not cancel this order.');
  };

  const canSubmitCancel = cancelPhrase.trim() === CANCEL_CONFIRM_PHRASE;

  return (
    <DashboardLayout
      title="Orders History"
      subtitle="Track your placed orders and delivery status"
    >
      <div className="catalog-wrap" style={{ maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
        {loading ? <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading your orders...</div> : null}
        {!loading && error ? <p style={{ color: 'var(--danger)', textAlign: 'center', padding: '2rem' }}>{error}</p> : null}
        
        {!loading && !error && orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'var(--bg-panel)', borderRadius: '16px', border: '1px solid var(--border-color)', marginTop: '2rem' }}>
            <Package size={48} style={{ color: 'var(--border-color)', marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No orders found</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>You haven't placed any orders yet.</p>
            <Link to="/products" className="btn-primary" style={{ display: 'inline-flex', padding: '0.75rem 1.5rem', borderRadius: '8px', textDecoration: 'none' }}>
              Browse Products
            </Link>
          </div>
        ) : null}

        {!loading && !error && orders.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1.5rem' }}>
            {orders.map((order) => (
              <article  className="order-card" key={order._id} style={{ 
                background: 'var(--bg-panel)', 
                borderRadius: '16px', 
                border: '1px solid var(--border-color)',
                overflow: 'hidden',
                boxShadow:
  theme === "dark"
    ? "0 12px 30px rgba(0,0,0,.45)"
    : "0 10px 28px rgba(15,23,42,.10)",

border:
  theme === "dark"
    ? "1px solid rgba(255,255,255,.08)"
    : "1px solid rgba(15,23,42,.08)",

transition: "all .35s ease",

transform: "translateZ(0)",

overflow: "hidden",
              }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '1.25rem 1.5rem', 
                  background: 'var(--bg-hover)',
                  borderBottom: '1px solid var(--border-color)',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}>
                  <div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Order ID</span>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontFamily: 'monospace', fontWeight: 700 }}>#{String(order._id || '').slice(-8).toUpperCase()}</h3>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    {!order.isDelivered ? (
                      <>
                        {isOrderWithinEditWindow(order) ? (
                          <button
                            type="button"
                            className="order-btn"
                            onClick={() => openEditOrder(order)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.4rem',
                              padding: '0.45rem 0.85rem',
                              borderRadius: '8px',
                              border: '1px solid var(--primary)',
                              background: 'transparent',
                              color: 'var(--primary)',
                              fontWeight: 600,
                              fontSize: '0.85rem',
                              cursor: 'pointer',
                            }}
                          >
                            <Pencil size={16} strokeWidth={2.25} />
                            Edit order
                          </button>
                        ) : (
                          <div
                            className="order-edit-expired"
                            role="note"
                            tabIndex={0}
                            title={ORDER_EDIT_EXPIRED_TITLE}
                            aria-label={ORDER_EDIT_EXPIRED_TITLE}
                          >
                            <span className="order-edit-expired__label" aria-hidden>
                              <Pencil size={16} strokeWidth={2.25} />
                              Edit order
                            </span>
                          </div>
                        )}
                        {isOrderWithinDeleteWindow(order) ? (
                          <button
                          className="order-btn"
                            type="button"
                            onClick={() => openCancelOrder(order)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.4rem',
                              padding: '0.45rem 0.85rem',
                              borderRadius: '8px',
                              border: '1px solid rgba(220, 38, 38, 0.45)',
                              background: 'rgba(220, 38, 38, 0.08)',
                              color: '#dc2626',
                              fontWeight: 600,
                              fontSize: '0.85rem',
                              cursor: 'pointer',
                            }}
                          >
                            <Ban size={16} strokeWidth={2.25} />
                            Delete order
                          </button>
                        ) : (
                          <div
                            className="order-edit-expired"
                            role="note"
                            tabIndex={0}
                            title={ORDER_DELETE_EXPIRED_TITLE}
                            aria-label={ORDER_DELETE_EXPIRED_TITLE}
                          >
                            <span className="order-edit-expired__label" aria-hidden>
                              <Ban size={16} strokeWidth={2.25} />
                              Delete order
                            </span>
                          </div>
                        )}
                      </>
                    ) : null}
                  </div>
                  <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                    <div>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Calendar size={14}/> Date</span>
                      <div style={{ fontWeight: 500 }}>{new Date(order.createdAt || Date.now()).toLocaleDateString()}</div>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Total</span>
                      <div style={{ fontWeight: 600, color: 'var(--success)' }}>{formatCurrencyFromUSD(order.totalPrice, currency)}</div>
                    </div>
                  </div>
                </div>

                <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: 'var(--bg-hover)' }}>
                  <Truck size={18} style={{ color: 'var(--primary)' }} />
                  <span style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-main)' }}>Delivery to: {order.shippingAddress?.address || 'Standard Address'}</span>
                  <span
                    className="order-track-status order-track-status--confirmed"
                    style={{
                      marginLeft: 'auto',
                      background: 'var(--success)',
                      color: theme === 'dark' ? '#ffffff' : '#0f172a',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                    }}
                  >
                    Confirmed
                  </span>
                </div>

                <div style={{ padding: '0.5rem 1.5rem' }}>
                  {(order.orderItems || []).map((item) => (
                    <div key={`${order._id}-${item.product || item._id}`} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '1.25rem', 
                      padding: '1rem 0',
                      borderBottom: '1px solid var(--border-color)',
                    }}>
                      <img src={item.image} alt={item.name} style={{ width: '64px', height: '64px', borderRadius: '10px', objectFit: 'cover', background: 'var(--bg-hover)' }} />
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: '0 0 0.25rem 0', fontWeight: 600, fontSize: '1.05rem', color: 'var(--text-main)' }}>{item.name}</p>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                          Qty: {item.qty} × {formatCurrencyFromUSD(item.price, currency)}
                        </span>
                      </div>
                      <button 
                        onClick={() => openItemDetails(item)}
                        title="View item description"
                        style={{ 
                          display: 'flex', alignItems: 'center', gap: '0.5rem',
                          background: 'transparent', border: '1px solid var(--primary)', 
                          color: 'var(--primary)', padding: '0.5rem 0.85rem', 
                          borderRadius: '8px', cursor: 'pointer', fontWeight: 500,
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.color = 'white'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--primary)'; }}
                      >
                        <Info size={16} /> Details
                      </button>
                    </div>
                  ))}
                  <style>{`article > div:last-child > div:last-child { border-bottom: none !important; }`}</style>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </div>

      <ModalHome
        open={Boolean(editTarget)}
        title="Edit delivery details"
        onClose={closeEditOrder}
      >
        {editTarget ? (
          <div className="order-edit-modal">
            <p className="order-cancel-modal__hint" style={{ marginTop: 0 }}>
              You can update the delivery address for order{' '}
              <strong>#{String(editTarget._id || '').slice(-8).toUpperCase()}</strong> within 24 hours of
              placing it.
            </p>
            <div className="order-edit-modal__field">
              <label htmlFor="order-edit-address">Street address</label>
              <textarea
                id="order-edit-address"
                value={editAddress}
                onChange={(e) => {
                  setEditAddress(e.target.value);
                  setEditErr('');
                }}
                rows={3}
                autoComplete="street-address"
              />
            </div>
            <div className="order-edit-modal__field">
              <label htmlFor="order-edit-city">City</label>
              <input
                id="order-edit-city"
                type="text"
                value={editCity}
                onChange={(e) => {
                  setEditCity(e.target.value);
                  setEditErr('');
                }}
                autoComplete="address-level2"
              />
            </div>
            <div className="order-edit-modal__field">
              <label htmlFor="order-edit-postal">Postal code</label>
              <input
                id="order-edit-postal"
                type="text"
                value={editPostal}
                onChange={(e) => {
                  setEditPostal(e.target.value);
                  setEditErr('');
                }}
                autoComplete="postal-code"
              />
            </div>
            <div className="order-edit-modal__field">
              <label htmlFor="order-edit-country">Country</label>
              <input
                id="order-edit-country"
                type="text"
                value={editCountry}
                onChange={(e) => {
                  setEditCountry(e.target.value);
                  setEditErr('');
                }}
                autoComplete="country-name"
              />
            </div>
            {editErr ? <p className="order-edit-modal__err">{editErr}</p> : null}
            <div className="order-edit-modal__actions">
              <button
                type="button"
                className="order-edit-modal__btn order-edit-modal__btn--ghost"
                onClick={closeEditOrder}
                disabled={editBusy}
              >
                Close
              </button>
              <button
                type="button"
                className="order-edit-modal__btn order-edit-modal__btn--primary"
                onClick={onSaveEditOrder}
                disabled={editBusy}
              >
                {editBusy ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </div>
        ) : null}
      </ModalHome>

      <ModalHome
        open={Boolean(cancelTarget)}
        title="Cancel confirmed order?"
        onClose={closeCancelOrder}
      >
        {cancelTarget ? (
          <div className="order-cancel-modal">
            <p className="order-cancel-modal__warn">
              This will permanently remove order{' '}
              <strong>#{String(cancelTarget._id || '').slice(-8).toUpperCase()}</strong> from your history.
             
            </p>
            <p className="order-cancel-modal__hint">
              To confirm, type <strong>{CANCEL_CONFIRM_PHRASE}</strong> below (case-sensitive).
            </p>
            <input
              type="text"
              className="order-cancel-modal__input"
              value={cancelPhrase}
              onChange={(e) => {
                setCancelPhrase(e.target.value);
                setCancelErr('');
              }}
              placeholder={CANCEL_CONFIRM_PHRASE}
              autoComplete="off"
              aria-label="Type Delete to confirm cancellation"
            />
            {cancelErr ? <p className="catalog-error order-cancel-modal__err">{cancelErr}</p> : null}
            <div className="order-cancel-modal__actions">
              <button type="button" className="order-cancel-modal__btn order-cancel-modal__btn--ghost" onClick={closeCancelOrder} disabled={cancelBusy}>
                Keep order
              </button>
              <button
                type="button"
                className="order-cancel-modal__btn order-cancel-modal__btn--danger"
                onClick={onConfirmCancelOrder}
                disabled={!canSubmitCancel || cancelBusy}
              >
                {cancelBusy ? 'Cancelling…' : 'Cancel order'}
              </button>
            </div>
          </div>
        ) : null}
      </ModalHome>

      <ModalHome
        open={Boolean(activeModalItem)}
        title={activeModalItem?.name || 'Product Details'}
        onClose={() => setActiveModalItem(null)}
      >
        {activeModalItem && (
          <div style={{ padding: '0.5rem 0' }}>
            <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', alignItems: 'flex-start' }}>
              <img src={activeModalItem.image} alt={activeModalItem.name} style={{ width: '120px', height: '120px', borderRadius: '12px', objectFit: 'cover', background: 'var(--bg-hover)' }} />
              <div>
                <h4 style={{ fontSize: '1.1rem', margin: '0 0 0.5rem 0' }}>Order Item Details</h4>
                <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem' }}><strong>Item ID:</strong> {activeModalItem.product || activeModalItem._id}</p>
                <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem' }}><strong>Unit Price:</strong> {formatCurrencyFromUSD(activeModalItem.price, currency)}</p>
                <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem' }}><strong>Total for this item:</strong> {formatCurrencyFromUSD(activeModalItem.price * activeModalItem.qty, currency)}</p>
              </div>
            </div>
            <div style={{ background: 'var(--bg-hover)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '1rem' }}>
              <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>Description</p>
              <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.5 }}>
                {activeModalItem.description || "Premium product shipped securely. We guarantee the quality and condition of this item upon arrival."}
              </p>
            </div>
          </div>
        )}
      </ModalHome>

    </DashboardLayout>
  );
};

export default OrdersScreen;
