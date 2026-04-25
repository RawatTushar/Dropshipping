import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../../components/DashboardLayout';
import ModalHome from '../../../components/modalHome';
import { authAPI } from '../../../api/api';
import { persistUserSession } from '../../../utils/authSession';
import { selectAuthUser, setCredentials } from '../../auth/authSlice';
import { selectCurrentCurrency } from '../../preferences/currencySlice';
import { fetchProducts } from '../../products/productsSlice';
import { fetchMyOrders, selectOrders, selectOrdersError, selectOrdersLoading } from '../../orders/ordersSlice';
import { formatCurrencyFromUSD } from '../../../utils/currency';
import '../../../homePage.css';

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const authUser = useSelector(selectAuthUser);
  const products = useSelector((state) => state.products.items);
  const productsLoading = useSelector((state) => state.products.loading);
  const orders = useSelector(selectOrders);
  const currency = useSelector(selectCurrentCurrency);
  const ordersLoading = useSelector(selectOrdersLoading);
  const ordersError = useSelector(selectOrdersError);
  const [activeModal, setActiveModal] = useState('');
  const [userName, setUserName] = useState(
    () => authUser?.name || localStorage.getItem('userName') || ''
  );

  const {
    totalRevenue,
    totalOrders,
    thisMonthOrders,
    avgOrderValue,
    loyaltyCredits,
    estimatedRewardsValue,
  } = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const total = Array.isArray(orders) ? orders : [];
    const revenue = total.reduce((sum, order) => sum + Number(order.totalPrice || 0), 0);
    const credits = total.reduce((sum, order) => {
      const value = Number(order.totalPrice || 0);
      return value > 20 ? sum + 5 : sum;
    }, 0);
    const monthOrders = total.filter((order) => {
      const dt = new Date(order.createdAt || Date.now());
      return dt.getMonth() === currentMonth && dt.getFullYear() === currentYear;
    });
    return {
      totalRevenue: revenue,
      totalOrders: total.length,
      thisMonthOrders: monthOrders.length,
      avgOrderValue: total.length ? revenue / total.length : 0,
      loyaltyCredits: credits,
      estimatedRewardsValue: Number(((credits / 20) * 10).toFixed(2)),
    };
  }, [orders]);

  const { totalProducts, stockUnits, lowStockProducts, topProductsByStock } = useMemo(() => {
    const allProducts = Array.isArray(products) ? products : [];
    const lowStock = allProducts.filter((p) => Number(p.countInStock || 0) <= 5);
    const totalStockUnits = allProducts.reduce((sum, p) => sum + Number(p.countInStock || 0), 0);
    const topStock = [...allProducts]
      .sort((a, b) => Number(b.countInStock || 0) - Number(a.countInStock || 0))
      .slice(0, 4);
    return {
      totalProducts: allProducts.length,
      stockUnits: totalStockUnits,
      lowStockProducts: lowStock,
      topProductsByStock: topStock,
    };
  }, [products]);

  const recentOrders = useMemo(
    () => (Array.isArray(orders) ? [...orders].slice(0, 5) : []),
    [orders]
  );

  const modalData = useMemo(() => {
    if (!activeModal) return null;

    if (activeModal === 'spend') {
      return {
        title: 'Your Spending Insight',
        content: (
          <p>
            You have spent <strong>{formatCurrencyFromUSD(totalRevenue, currency)}</strong> across{' '}
            <strong>{totalOrders}</strong> order(s).
          </p>
        ),
      };
    }

    if (activeModal === 'orders') {
      return {
        title: 'Your Order Activity',
        content: (
          <p>
            You placed <strong>{totalOrders}</strong> total orders, including{' '}
            <strong>{thisMonthOrders}</strong> this month.
          </p>
        ),
      };
    }

    if (activeModal === 'aov') {
      return {
        title: 'Average Basket Size',
        content: (
          <p>
            Your average order value is <strong>{formatCurrencyFromUSD(avgOrderValue, currency)}</strong>. Growing this
            metric usually improves store economics.
          </p>
        ),
      };
    }

    if (activeModal === 'credits') {
      return {
        title: 'Rewards Credits Program',
        content: (
          <>
            <p>
              You earn <strong>5 credits</strong> whenever an order is above <strong>$20</strong>.
            </p>
            <p>
              You currently have <strong>{loyaltyCredits}</strong> credits. At{' '}
              <strong>20 credits = up to $10</strong>, your current potential value is{' '}
              <strong>{formatCurrencyFromUSD(estimatedRewardsValue, currency)}</strong>.
            </p>
          </>
        ),
      };
    }

    if (activeModal === 'inventory') {
      return {
        title: 'Inventory Health',
        content: (
          <>
            <p>
              Total available units: <strong>{stockUnits}</strong>
            </p>
            <p>
              Low-stock products (5 or below): <strong>{lowStockProducts.length}</strong>
            </p>
          </>
        ),
      };
    }

    return null;
  }, [
    activeModal,
    avgOrderValue,
    estimatedRewardsValue,
    lowStockProducts.length,
    loyaltyCredits,
    stockUnits,
    thisMonthOrders,
    totalOrders,
    totalRevenue,
  ]);

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchMyOrders());
  }, [dispatch]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    let cancelled = false;
    (async () => {
      try {
        const { data } = await authAPI.me();
        if (cancelled) return;
        persistUserSession({
          token,
          _id: data._id,
          name: data.name,
          email: data.email,
          isAdmin: data.isAdmin,
        });
        dispatch(
          setCredentials({
            token,
            _id: data._id,
            name: data.name,
            email: data.email,
            isAdmin: data.isAdmin,
          })
        );
        if (data.name) setUserName(data.name);
      } catch {
        if (!cancelled) {
          setUserName(localStorage.getItem('userName') || '');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  return (
    <DashboardLayout 
      title="Command Center"
      subtitle={`Welcome back, ${userName || 'Seller'}. Here is your real-time store performance.`}
    >
      <div className="home-dashboard">
        <section className="stats-grid animate-slide-up delay-100">
          <article className="glass-panel stat-card clickable" onClick={() => setActiveModal('spend')}>
            <div className="stat-header">
              <p>Total Spent</p>
              <div className="stat-indicator indicator-primary"></div>
            </div>
            <h3>{formatCurrencyFromUSD(totalRevenue, currency)}</h3>
            <span className="stat-label">Your personal spend across placed orders</span>
          </article>
          <article className="glass-panel stat-card clickable" onClick={() => setActiveModal('orders')}>
            <div className="stat-header">
              <p>Orders Placed</p>
              <div className="stat-indicator indicator-blue"></div>
            </div>
            <h3>{totalOrders}</h3>
            <span className="stat-label">{thisMonthOrders} orders this month</span>
          </article>
          <article className="glass-panel stat-card clickable" onClick={() => setActiveModal('aov')}>
            <div className="stat-header">
              <p>Average Order Value</p>
              <div className="stat-indicator indicator-green"></div>
            </div>
            <h3>{formatCurrencyFromUSD(avgOrderValue, currency)}</h3>
            <span className="stat-label">Higher AOV means better margin efficiency</span>
          </article>
          <article className="glass-panel stat-card clickable" onClick={() => setActiveModal('credits')}>
            <div className="stat-header">
              <p>Reward Credits</p>
              <div className="stat-indicator indicator-orange"></div>
            </div>
            <h3>{loyaltyCredits}</h3>
            <span className="stat-label">5 credits on each order above $20</span>
          </article>
        </section>

        <section className="dashboard-grid animate-slide-up delay-200">
          <div className="glass-panel rewards-panel clickable" onClick={() => setActiveModal('credits')}>
            <div className="card-header">
              <h3>Loyalty Rewards Wallet</h3>
              <span className="badge badge-success">Active</span>
            </div>
            <div className="rewards-content">
              <div className="reward-metric">
                <p>Credits Available</p>
                <strong>{loyaltyCredits}</strong>
              </div>
              <div className="reward-metric">
                <p>Estimated Redeem Value</p>
                <strong>{formatCurrencyFromUSD(estimatedRewardsValue, currency)}</strong>
              </div>
              <div className="reward-metric">
                <p>Rule</p>
                <strong>20 credits = up to $10 product value</strong>
              </div>
            </div>
          </div>

          <div className="glass-panel rewards-panel clickable" onClick={() => setActiveModal('inventory')}>
            <div className="card-header">
              <h3>Inventory Snapshot</h3>
              <span>{totalProducts} SKUs</span>
            </div>
            <div className="rewards-content">
              <div className="reward-metric">
                <p>Total Units Available</p>
                <strong>{stockUnits}</strong>
              </div>
              <div className="reward-metric">
                <p>Low Stock Products</p>
                <strong>{lowStockProducts.length}</strong>
              </div>
              <div className="reward-metric">
                <p>Tip</p>
                <strong>Keep low-stock under 10% for smooth fulfillment</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="dashboard-grid animate-slide-up delay-300">
          <div className="glass-panel card-large">
            <div className="card-header">
              <h3>Recent Orders Pipeline</h3>
              <button className="btn-text" onClick={() => navigate('/orders')}>View all</button>
            </div>
            {ordersLoading ? <p className="dashboard-empty">Loading your latest orders...</p> : null}
            {!ordersLoading && ordersError ? <p className="dashboard-error">{ordersError}</p> : null}
            {!ordersLoading && !ordersError && recentOrders.length === 0 ? (
              <p className="dashboard-empty">No orders yet. Start by adding products to cart and checkout.</p>
            ) : null}
            {!ordersLoading && !ordersError && recentOrders.length > 0 ? (
              <div className="modern-table">
                <div className="table-row head">
                  <span>Order ID</span>
                  <span>Items</span>
                  <span>Date</span>
                  <span>Status</span>
                  <span className="text-right">Total</span>
                </div>
                {recentOrders.map((order) => (
                  <div className="table-row" key={order._id}>
                    <span className="mono">#{String(order._id || '').slice(-6).toUpperCase()}</span>
                    <span>{(order.orderItems || []).length} product(s)</span>
                    <span>{new Date(order.createdAt || Date.now()).toLocaleDateString()}</span>
                    <span className="badge badge-success">Placed</span>
                    <span className="text-right fw-600">
                      {formatCurrencyFromUSD(order.totalPrice, currency)}
                    </span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div className="glass-panel card-small">
            <div className="card-header">
              <h3>Inventory Focus</h3>
              <span>{totalProducts} SKUs tracked</span>
            </div>
            {productsLoading ? <p className="dashboard-empty">Loading inventory data...</p> : null}
            {!productsLoading && topProductsByStock.length === 0 ? (
              <p className="dashboard-empty">No products available yet.</p>
            ) : null}
            {!productsLoading && topProductsByStock.length > 0 ? (
              <div className="todo-list">
                {topProductsByStock.map((product) => {
                  const stock = Number(product.countInStock || 0);
                  const stockClass =
                    stock <= 5 ? 'bg-danger-soft' : stock <= 15 ? 'bg-warning' : 'bg-success';
                  return (
                    <div className="todo-item" key={product._id} onClick={() => navigate('/products')}>
                      <div className={`todo-icon ${stockClass}`}>{stock}</div>
                      <div className="todo-content">
                        <strong>{product.name}</strong>
                        <span>
                          {stock <= 5
                            ? 'Low stock: restock soon'
                            : stock <= 15
                              ? 'Moderate stock level'
                              : 'Healthy stock level'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        </section>
      </div>

      <ModalHome
        open={Boolean(modalData)}
        title={modalData?.title || 'Insight'}
        onClose={() => setActiveModal('')}
      >
        {modalData?.content}
      </ModalHome>
    </DashboardLayout>
  );
};

export default Home;
