import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminOrders } from '../../../shared/lib/adminApi';
import { clearAdminInfo, getAdminInfo, isAdminUser } from '../../../utils/adminAuth';
import { motion } from 'framer-motion';
import { RefreshCw, Search, ShoppingBag } from 'lucide-react';
// import '../admin/pages/DashboardScreen.css';

const money = (n) =>
  n == null || Number.isNaN(Number(n))
    ? '—'
    : new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 2,
      }).format(Number(n));

const fmtDate = (d) => {
  if (!d) return '—';
  try {
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(d));
  } catch {
    return '—';
  }
};

const SalesScreen = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

  const load = useCallback(async () => {
    if (!isAdminUser(getAdminInfo())) {
      clearAdminInfo();
      navigate('/login');
      return;
    }
    try {
      setLoading(true);
      setError('');
      const { data } = await getAdminOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        clearAdminInfo();
        navigate('/login');
        return;
      }
      const status = err.response?.status;
      setError(
        status === 502
          ? 'Server unavailable (502). Backend may be restarting — try again in a moment.'
          : err.response?.data?.message || err.message,
      );
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter((o) => {
      const haystack = [
        o.id,
        o.user?.name,
        o.user?.email,
        o.paymentMethod,
        ...(o.orderItems || []).map((i) => i.name),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [orders, query]);

  const totals = useMemo(() => {
    const revenue = filtered.reduce((sum, o) => sum + Number(o.totalPrice || 0), 0);
    const units = filtered.reduce(
      (sum, o) =>
        sum + (o.orderItems || []).reduce((s, i) => s + Number(i.qty || 0), 0),
      0,
    );
    return { revenue, units, count: filtered.length };
  }, [filtered]);

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Store sales</h1>
          <p className="subtitle">All orders placed on your storefront</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={load} disabled={loading}>
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      <motion.div
        className="card"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        {loading ? (
          <div className="empty-state">Loading sales data…</div>
        ) : error ? (
          <div className="empty-state" style={{ color: 'var(--danger)' }}>
            {error}
          </div>
        ) : (
          <>
            <div className="dashboard-kpi-grid" style={{ marginBottom: '1.5rem' }}>
              <div className="dashboard-kpi dashboard-kpi--accent">
                <div className="dashboard-kpi-label">Total revenue</div>
                <div className="dashboard-kpi-value dashboard-mono">{money(totals.revenue)}</div>
                <div className="dashboard-kpi-hint">{totals.count} orders shown</div>
              </div>
              <div className="dashboard-kpi">
                <div className="dashboard-kpi-label">Units sold</div>
                <div className="dashboard-kpi-value">{totals.units}</div>
                <div className="dashboard-kpi-hint">Across filtered orders</div>
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem', position: 'relative', maxWidth: 420 }}>
              <Search
                size={18}
                style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                  pointerEvents: 'none',
                }}
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search customer, product, order ID…"
                style={{
                  width: '100%',
                  padding: '0.75rem 2.5rem',
                  borderRadius: 10,
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-dark)',
                  color: 'var(--text-main)',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {filtered.length === 0 ? (
              <div className="empty-state">
                <ShoppingBag size={48} style={{ margin: '0 auto 1rem', color: 'var(--border-color)' }} />
                {orders.length === 0 ? 'No sales yet.' : 'No orders match your search.'}
              </div>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Customer</th>
                      <th>Items</th>
                      <th>Payment</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((order) => {
                      const items = order.orderItems || [];
                      const itemSummary = items
                        .map((i) => `${i.name} × ${i.qty}`)
                        .join(', ');
                      return (
                        <tr key={order.id}>
                          <td style={{ whiteSpace: 'nowrap', fontSize: '0.85rem' }}>
                            {fmtDate(order.createdAt)}
                          </td>
                          <td>
                            <div style={{ fontWeight: 500 }}>{order.user?.name || '—'}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              {order.user?.email || '—'}
                            </div>
                          </td>
                          <td style={{ maxWidth: 280, fontSize: '0.85rem' }} title={itemSummary}>
                            {itemSummary || '—'}
                          </td>
                          <td style={{ textTransform: 'capitalize' }}>
                            {order.paymentMethod || '—'}
                          </td>
                          <td>
                            <span
                              className={`dashboard-pill ${
                                order.isPaid ? 'dashboard-pill--low' : 'dashboard-pill--warn'
                              }`}
                            >
                              {order.isPaid ? 'Paid' : 'Pending'}
                            </span>
                          </td>
                          <td
                            style={{
                              textAlign: 'right',
                              fontFamily: 'ui-monospace, monospace',
                              fontWeight: 600,
                            }}
                          >
                            {money(order.totalPrice)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </motion.div>
    </>
  );
};

export default SalesScreen;
