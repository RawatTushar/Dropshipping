import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { selectCartCount } from '../features/cart/cartSlice';
import { logout, selectCurrentUserId } from '../features/auth/authSlice';
import { clearUserSession } from '../utils/authSession';
import { fetchProducts } from '../features/products/productsSlice';
import {
  fetchMyOrders,
  selectOrders,
  selectOrdersLoading,
} from '../features/orders/ordersSlice';
import { selectCurrentCurrency } from '../features/preferences/currencySlice';
import { formatCurrencyFromUSD } from '../utils/currency';
import { readSavedStoreName } from '../utils/storePreferences';
import shoppingCartImage from '../assets/images/shopping-cart.png';
import lightModeImage from '../assets/images/lightmode.png';
import nightModeImage from '../assets/images/nightmode.png';
import '../DashboardLayout.css';

const DashboardLayout = ({ children, title = 'Overview', subtitle = 'Manage your store activities.' }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const cartCount = useSelector(selectCartCount);
  const userId = useSelector(selectCurrentUserId);
  const currency = useSelector(selectCurrentCurrency);
  const products = useSelector((state) => state.products.items);
  const productsLoading = useSelector((state) => state.products.loading);
  const orders = useSelector(selectOrders);
  const ordersLoading = useSelector(selectOrdersLoading);
  const [theme, setTheme] = useState('dark');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeInsight, setActiveInsight] = useState('profit');
  const [storePrefsTick, setStorePrefsTick] = useState(0);
  const sidebarRef = useRef(null);
  const storefrontName = useMemo(
    () => readSavedStoreName(userId),
    [userId, storePrefsTick],
  );

  useEffect(() => {
    const onStorePrefs = () => setStorePrefsTick((t) => t + 1);
    window.addEventListener('shipit-store-prefs', onStorePrefs);
    return () => window.removeEventListener('shipit-store-prefs', onStorePrefs);
  }, []);

  useEffect(() => {
    const userThemeKey = `theme:${userId}`;
    const savedTheme = localStorage.getItem(userThemeKey) || localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
  }, [userId]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    localStorage.setItem(`theme:${userId}`, theme);
  }, [theme, userId]);

  useEffect(() => {
    if (!isSidebarOpen) return undefined;

    const closeOnOutsideScroll = (event) => {
      if (sidebarRef.current?.contains(event.target)) return;
      setIsSidebarOpen(false);
    };

    window.addEventListener('wheel', closeOnOutsideScroll, {
      passive: true,
      capture: true,
    });
    window.addEventListener('touchmove', closeOnOutsideScroll, {
      passive: true,
      capture: true,
    });

    return () => {
      window.removeEventListener('wheel', closeOnOutsideScroll, true);
      window.removeEventListener('touchmove', closeOnOutsideScroll, true);
    };
  }, [isSidebarOpen]);

  useEffect(() => {
    const openFromLeftEdge = (event) => {
      if (isSidebarOpen) return;
      if (event.clientX <= 10) {
        setIsSidebarOpen(true);
      }
    };

    window.addEventListener('mousemove', openFromLeftEdge, { passive: true });
    return () => window.removeEventListener('mousemove', openFromLeftEdge);
  }, [isSidebarOpen]);

  useEffect(() => {
    if (!isSidebarOpen) return;
    if (!products.length && !productsLoading) {
      dispatch(fetchProducts());
    }
    if (!orders.length && !ordersLoading) {
      dispatch(fetchMyOrders());
    }
  }, [dispatch, isSidebarOpen, orders.length, ordersLoading, products.length, productsLoading]);

  const isActive = (path) => location.pathname === path;

  const handleNavClick = (path) => {
    setIsSidebarOpen(false);
    if (path) navigate(path);
  };

  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.totalPrice || 0), 0);
  const todayOrders = orders.filter((order) => {
    const d = new Date(order.createdAt || Date.now());
    const n = new Date();
    return (
      d.getDate() === n.getDate() &&
      d.getMonth() === n.getMonth() &&
      d.getFullYear() === n.getFullYear()
    );
  }).length;
  const lowStockCount = products.filter((p) => Number(p.countInStock || 0) <= 5).length;
  const totalStockUnits = products.reduce((sum, p) => sum + Number(p.countInStock || 0), 0);

  const sidebarLayer =
    typeof document !== 'undefined'
      ? createPortal(
          <>
            <div
              className="sidebar-hover-trigger"
              onMouseEnter={() => setIsSidebarOpen(true)}
            />

            {isSidebarOpen ? (
              <div
                className="sidebar-backdrop show"
                onClick={() => setIsSidebarOpen(false)}
              />
            ) : null}

            <aside
              ref={sidebarRef}
              className={`dashboard-sidebar ${isSidebarOpen ? 'open' : ''}`}
              onMouseLeave={() => setIsSidebarOpen(false)}
            >
        <div className="sidebar-brand" >
          <div className="brand-icon brand-icon--pulse" aria-hidden="true">
            <img src={shoppingCartImage} alt="" className={theme==='dark'?'icon-dark':'icon-light'}/>
          </div>
          <div className="brand-info">
            <h2 className="storefront-title">
              <span className="storefront-title__text">{storefrontName}</span>
            </h2>
            <span className="brand-tagline">
              <span className="brand-tagline__dot" aria-hidden="true" />
              SHIP PRODUCTS LIKE A PRO
            </span>
          </div>
        </div>

        <div className="sidebar-section">
          <div className="sidebar-section-title">Insights</div>
          <ul className="sidebar-nav">
            <li>
              <button
                className={`nav-item ${activeInsight === 'profit' ? 'active-soft' : ''}`}
                onClick={() => setActiveInsight('profit')}
              >
                Profit Pulse <span className="nav-badge">Live</span>
              </button>
            </li>
            <li>
              <button
                className={`nav-item ${activeInsight === 'inventory' ? 'active-soft' : ''}`}
                onClick={() => setActiveInsight('inventory')}
              >
                Inventory Watch <span className="nav-badge">Now</span>
              </button>
            </li>
          </ul>
          <div className="insight-card">
            {activeInsight === 'profit' ? (
              <>
                <p className="insight-card-title">Profit Pulse</p>
                <p className="insight-card-value">{formatCurrencyFromUSD(totalRevenue, currency)}</p>
                <p className="insight-card-meta">
                  {ordersLoading ? 'Refreshing orders...' : `${todayOrders} order(s) today`}
                </p>
              </>
            ) : (
              <>
                <p className="insight-card-title">Inventory Watch</p>
                <p className="insight-card-value">{totalStockUnits}</p>
                <p className="insight-card-meta">
                  {productsLoading ? 'Refreshing stock...' : `${lowStockCount} low-stock SKU(s)`}
                </p>
              </>
            )}
          </div>
        </div>

        <div className="sidebar-section">
          <div className="sidebar-section-title">Menu</div>
          <ul className="sidebar-nav">
            <li>
              <button
                className={`nav-item ${isActive('/home') ? 'active' : ''}`}
                onClick={() => handleNavClick('/home')}
              >
                Command Center
              </button>
            </li>
            <li>
              <button
                className={`nav-item ${isActive('/orders') ? 'active' : ''}`}
                onClick={() => handleNavClick('/orders')}
              >
                Track your orders
              </button>
            </li>
            <li>
              <button
                className={`nav-item ${isActive('/products') ? 'active' : ''}`}
                onClick={() => handleNavClick('/products')}
              >
                Products
              </button>
            </li>
            <li>
              <button className="nav-item" onClick={() => setIsSidebarOpen(false)}>Analytics</button>
            </li>
            {cartCount > 0 ? (
              <li>
                <button
                  className={`nav-item ${isActive('/checkout') ? 'active' : ''}`}
                  onClick={() => handleNavClick('/checkout')}
                >
                  Checkout
                </button>
              </li>
            ) : null}
            <li>
              <button
                className={`nav-item ${isActive('/settings') ? 'active' : ''}`}
                onClick={() => handleNavClick('/settings')}
              >
                Settings
              </button>
            </li>
          </ul>
        </div>

        <div className="sidebar-footer">
          <div className="theme-switcher">
            <button
              className={`theme-btn ${theme === 'light' ? 'active' : ''}`}
              onClick={() => setTheme('light')}
            >
              <img src={lightModeImage} alt="" aria-hidden="true" className="theme-btn-icon" />
              Light
            </button>
            <button
              className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}
              onClick={() => setTheme('dark')}
            >
              <img src={nightModeImage} alt="" aria-hidden="true" className="theme-btn-icon" />
              Dark
            </button>
          </div>

          <button className="nav-item logout-btn" onClick={() => {
            dispatch(logout());
            clearUserSession();
            navigate('/login');
          }}>
            Log Out
          </button>
        </div>
      </aside>
          </>,
          document.body,
        )
      : null;

  return (
    <div className="dashboard-layout">
      {sidebarLayer}

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div className="header-left">
            <button
              className="btn-icon btn-hamburger"
              onClick={() => setIsSidebarOpen(true)}
              title="Open Menu"
            >
              ☰
            </button>
            <div className="header-title-group header-title-group--enter">
              <h1 className="dashboard-page-heading">{title}</h1>
              <p className="dashboard-page-subtitle">{subtitle}</p>
            </div>
          </div>

          <div className="header-actions header-actions--enter">
            <button className="btn-primary" onClick={() => navigate('/products')}>
              + Add Product
            </button>
          </div>
        </header>

        <div className="content-container">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
