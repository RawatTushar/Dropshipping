import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import DashboardLayout from '../components/DashboardLayout';
import ModalHome from '../components/modalHome';
import {
  fetchMyOrders,
  selectOrders,
  selectOrdersError,
  selectOrdersLoading,
} from '../features/orders/ordersSlice';
import { selectCurrentCurrency } from '../features/preferences/currencySlice';
import { formatCurrencyFromUSD } from '../utils/currency';
import { useSiteTheme } from '../utils/siteTheme';
import { Package, Truck, Info, Calendar } from 'lucide-react';
import '../productsScreen.css';
import '../checkoutScreen.css';

const OrdersScreen = () => {
  const dispatch = useDispatch();
  const orders = useSelector(selectOrders);
  const currency = useSelector(selectCurrentCurrency);
  const loading = useSelector(selectOrdersLoading);
  const error = useSelector(selectOrdersError);
  const theme = useSiteTheme();

  const [activeModalItem, setActiveModalItem] = useState(null);

  useEffect(() => {
    dispatch(fetchMyOrders());
  }, [dispatch]);

  const openItemDetails = (item) => {
    setActiveModalItem(item);
  };

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
              <article key={order._id} style={{ 
                background: 'var(--bg-panel)', 
                borderRadius: '16px', 
                border: '1px solid var(--border-color)',
                overflow: 'hidden',
                boxShadow: '0 4px 6px rgba(0,0,0,0.02)'
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
