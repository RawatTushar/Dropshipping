import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminInsights } from '../../../shared/lib/adminApi';
import { clearAdminInfo, getAdminInfo, isAdminUser } from '../../../utils/adminAuth';
import './DashboardScreen.css';
import { motion } from 'framer-motion';
import { RefreshCw, ArrowRight } from 'lucide-react';

const money = (n) =>
  n == null || Number.isNaN(n)
    ? '—'
    : new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 2,
      }).format(n);

const pct = (n) =>
  n == null || Number.isNaN(n)
    ? '—'
    : `${n.toFixed(1)}%`;

const stockPillClass = (level) => {
  if (level === 'out' || level === 'critical') return 'dashboard-pill dashboard-pill--critical';
  if (level === 'low') return 'dashboard-pill dashboard-pill--warn';
  return 'dashboard-pill dashboard-pill--low';
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const DashboardScreen = () => {
  const navigate = useNavigate();
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!isAdminUser(getAdminInfo())) {
      clearAdminInfo();
      navigate('/login');
      return;
    }
    try {
      setLoading(true);
      setError('');
      const { data } = await getAdminInsights();
      setInsights(data);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        clearAdminInfo();
        navigate('/login');
        return;
      }
      setError(
        err.response?.status === 502
          ? 'Server unavailable (502). Backend may be down — check docker logs on EC2.'
          : err.response?.data?.message || err.message,
      );
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    const userInfo = getAdminInfo();
    if (!isAdminUser(userInfo)) {
      clearAdminInfo();
      navigate('/login');
      return;
    }
    load();
  }, [load, navigate]);

  const s = insights?.summary;
  const threshold = insights?.meta?.lowStockThreshold ?? 10;

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Overview</h1>
          <p className="subtitle">
            Revenue, margin, and inventory signals in one place.
          </p>
        </div>
      </div>

      {loading && (
        <div className="card">
          <div className="empty-state">
            <RefreshCw className="animate-spin" style={{ margin: '0 auto 1rem', display: 'block', color: 'var(--primary)' }} size={24} />
            Loading insights…
          </div>
        </div>
      )}

      {!loading && error && (
        <div className="card">
          <div className="empty-state" style={{ color: 'var(--danger)' }}>
            {error}
          </div>
        </div>
      )}

      {!loading && !error && insights && (
        <>
          <motion.div 
            className="dashboard-kpi-grid"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            <motion.div variants={itemVariants} className="dashboard-kpi dashboard-kpi--accent">
              <div className="dashboard-kpi-label">Lifetime revenue</div>
              <div className="dashboard-kpi-value dashboard-mono">
                {money(s?.totalOrderRevenue ?? s?.revenueFromLineItems)}
              </div>
              <div className="dashboard-kpi-hint">
                {s?.orderCount ?? 0} orders · {s?.totalUnitsSold ?? 0} units sold
              </div>
            </motion.div>
            <motion.div variants={itemVariants} className="dashboard-kpi dashboard-kpi--positive">
              <div className="dashboard-kpi-label">Estimated profit (sold)</div>
              <div className="dashboard-kpi-value dashboard-mono">
                {s?.totalRealizedProfit == null ? '—' : money(s.totalRealizedProfit)}
              </div>
              <div className="dashboard-kpi-hint">
                Blended margin {pct(s?.blendedMarginPercent)}
                {s?.missingCostCount > 0 ? ` · ${s.missingCostCount} SKU(s) need cost` : ''}
              </div>
            </motion.div>
            <motion.div variants={itemVariants} className="dashboard-kpi dashboard-kpi--info">
              <div className="dashboard-kpi-label">Inventory value</div>
              <div className="dashboard-kpi-value dashboard-mono">
                {money(s?.totalInventoryValue)}
              </div>
              <div className="dashboard-kpi-hint">
                Retail value of all stock
              </div>
            </motion.div>
            <motion.div variants={itemVariants} className="dashboard-kpi dashboard-kpi--warn">
              <div className="dashboard-kpi-label">Inventory risk</div>
              <div className="dashboard-kpi-value">{s?.lowStockCount ?? 0}</div>
              <div className="dashboard-kpi-hint">
                SKUs at or below {threshold} units
              </div>
            </motion.div>
            <motion.div variants={itemVariants} className="dashboard-kpi">
              <div className="dashboard-kpi-label">Catalog</div>
              <div className="dashboard-kpi-value">{s?.productCount ?? 0}</div>
              <div className="dashboard-kpi-hint">Active products</div>
            </motion.div>
          </motion.div>

          <motion.div 
            className="dashboard-actions-row"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <button
              type="button"
              className="dashboard-action-chip"
              onClick={() => navigate('/sales')}
            >
              View all sales <ArrowRight size={16} />
            </button>
            <button
              type="button"
              className="dashboard-action-chip"
              onClick={() => navigate('/products')}
            >
              Manage catalog <ArrowRight size={16} />
            </button>
            <button type="button" className="dashboard-action-chip" onClick={load}>
              <RefreshCw size={16} /> Refresh
            </button>
          </motion.div>

          <motion.section 
            className="dashboard-section" 
            style={{ marginTop: '2.5rem' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="dashboard-section-head">
              <div>
                <h2 className="dashboard-section-title">Needs attention</h2>
                <p className="dashboard-section-desc">
                  Tackle out-of-stock and critical SKUs to avoid lost sales.
                </p>
              </div>
            </div>
            <div className="dashboard-card">
              {!(insights.lowStock || []).length ? (
                <p className="dashboard-empty-hint">
                  No SKUs at or below {threshold} units. Inventory buffer healthy.
                </p>
              ) : (
                (insights.lowStock || []).map((row) => (
                  <div key={row.id} className="dashboard-stock-row">
                    <div className="dashboard-stock-meta">
                      <div className="dashboard-stock-name" title={row.name}>
                        {row.name}
                      </div>
                      <div className="dashboard-stock-sub">
                        List {money(row.price)} · {row.countInStock} on hand
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexShrink: 0 }}>
                      <span className={stockPillClass(row.level)}>
                        {row.level === 'out'
                          ? 'Out of stock'
                          : row.level === 'critical'
                            ? 'Critical'
                            : 'Low'}
                      </span>
                      <button
                        type="button"
                        className="dashboard-link-btn"
                        onClick={() => navigate(`/products/${row.id}/edit`)}
                      >
                        Adjust
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.section>

          <div className="dashboard-two-col" style={{ marginTop: '2.5rem' }}>
            <motion.section
              className="dashboard-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
            >
              <div className="dashboard-section-head">
                <div>
                  <h2 className="dashboard-section-title">Recent store sales</h2>
                  <p className="dashboard-section-desc">
                    Latest orders from your storefront.
                  </p>
                </div>
                <button type="button" className="dashboard-link-btn" onClick={() => navigate('/sales')}>
                  See all
                </button>
              </div>
              <div className="dashboard-card">
                {!(insights.recentOrders || []).length ? (
                  <p className="dashboard-empty-hint">No sales recorded yet.</p>
                ) : (
                  <div className="dashboard-table-wrap">
                    <table className="dashboard-table">
                      <thead>
                        <tr>
                          <th>Customer</th>
                          <th className="dashboard-mono">Items</th>
                          <th className="dashboard-mono">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(insights.recentOrders || []).slice(0, 8).map((row) => (
                          <tr key={row.id}>
                            <td>
                              <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                                {row.customerName}
                              </div>
                              <div className="dashboard-stock-sub">{row.customerEmail}</div>
                            </td>
                            <td className="dashboard-mono">
                              {(row.items || []).reduce((n, i) => n + i.qty, 0)}
                            </td>
                            <td className="dashboard-mono">{money(row.totalPrice)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.section>
          </div>

          <div className="dashboard-two-col" style={{ marginTop: '2.5rem' }}>
            <motion.section 
              className="dashboard-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="dashboard-section-head">
                <div>
                  <h2 className="dashboard-section-title">Best sellers</h2>
                  <p className="dashboard-section-desc">
                    By units shipped. Double down on these SKUs.
                  </p>
                </div>
              </div>
              <div className="dashboard-card">
                {!(insights.bestSellers || []).length ? (
                  <p className="dashboard-empty-hint">
                    No sales recorded yet.
                  </p>
                ) : (
                  <div className="dashboard-table-wrap">
                    <table className="dashboard-table">
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th className="dashboard-mono">Units</th>
                          <th className="dashboard-mono">Margin</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(insights.bestSellers || []).map((row) => (
                          <tr key={row.id}>
                            <td>
                              <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{row.name}</div>
                              <button
                                type="button"
                                className="dashboard-link-btn"
                                onClick={() => navigate(`/products/${row.id}/edit`)}
                              >
                                View
                              </button>
                            </td>
                            <td className="dashboard-mono">{row.unitsSold}</td>
                            <td className="dashboard-mono">
                              {row.marginPercent == null ? 'Set cost' : pct(row.marginPercent)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.section>

            <motion.section 
              className="dashboard-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <div className="dashboard-section-head">
                <div>
                  <h2 className="dashboard-section-title">Profit leaderboard</h2>
                  <p className="dashboard-section-desc">
                    Estimated profit using current price and cost.
                  </p>
                </div>
              </div>
              <div className="dashboard-card">
                <div className="dashboard-table-wrap">
                  <table className="dashboard-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th className="dashboard-mono">$/unit</th>
                        <th className="dashboard-mono">Profit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(insights.profitability || []).slice(0, 10).map((row) => (
                        <tr key={row.id}>
                          <td>
                            <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{row.name}</div>
                            <div className="dashboard-stock-sub">
                              Sold {row.unitsSold} · Stock {row.countInStock}
                            </div>
                          </td>
                          <td className="dashboard-mono">
                            {row.unitProfit == null ? '—' : money(row.unitProfit)}
                          </td>
                          <td className="dashboard-mono">
                            {row.realizedProfit == null ? '—' : money(row.realizedProfit)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.section>
          </div>
        </>
      )}
    </>
  );
};

export default DashboardScreen;
