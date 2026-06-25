import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  LayoutDashboard,
  Package,
  Store,
  Truck,
  Settings,
  Menu,
  X,
  ShoppingCart,
  ChevronRight,
} from 'lucide-react';
import { selectCartCount } from '../features/cart/cartSlice';
import { logout, selectCurrentUserId, selectIsAuthenticated } from '../features/auth/authSlice';
import { authAPI } from '../api/api';
import { clearUserSession } from '../utils/authSession';
import { fetchProducts } from '../features/products/productsSlice';
import {
  fetchMyOrders,
  selectOrders,
  selectOrdersLoading,
} from '../features/orders/ordersSlice';
import { selectCurrentCurrency } from '../features/preferences/currencySlice';
import { readSavedStoreName } from '../utils/storePreferences';
import { getStoredThemeForUser } from '../utils/siteTheme';
import { usePersistedSiteTheme } from '../hooks/usePersistedSiteTheme';
import {
  clearStoreSplash,
  isStoreSplashPending,
} from '../utils/storeSplashSession';
import StoreSplashScreen from './store/StoreSplashScreen';
import StoreThemeToggle from './store/StoreThemeToggle';
import StoreLogoutButton from './store/StoreLogoutButton';
import StorePulseCard from './store/StorePulseCard';
import ModalHome from './modalHome';
import CartPanel from './cart/CartPanel';
import '../productsScreen.css';
import '../DashboardLayout.css';

const navLinkClass = ({ isActive }) =>
  `store-nav-link${isActive ? ' active' : ''}`;

const MOBILE_SIDEBAR_MAX_PX = 959;
const DESKTOP_CLOSE_DELAY_MS = 400;

const DashboardLayout = ({
  children,
  title = 'Overview',
  subtitle = 'Manage your store activities.',
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const cartCount = useSelector(selectCartCount);
  const userId = useSelector(selectCurrentUserId);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const currency = useSelector(selectCurrentCurrency);
  const products = useSelector((state) => state.products.items);
  const productsLoading = useSelector((state) => state.products.loading);
  const orders = useSelector(selectOrders);
  const ordersLoading = useSelector(selectOrdersLoading);
  const [theme, setTheme] = useState(() => getStoredThemeForUser(userId));
  const [navOpen, setNavOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia(`(min-width: ${MOBILE_SIDEBAR_MAX_PX + 1}px)`).matches,
  );
  const [activeInsight, setActiveInsight] = useState('profit');
  const [storePrefsTick, setStorePrefsTick] = useState(0);
  const [showSplash, setShowSplash] = useState(isStoreSplashPending);
  const [headerCartModalOpen, setHeaderCartModalOpen] = useState(false);
  const lastWindowScrollY = useRef(0);
  const sidebarRef = useRef(null);
  const desktopCloseTimerRef = useRef(null);

  const storefrontName = useMemo(
    () => readSavedStoreName(userId),
    [userId, storePrefsTick],
  );

  const clearDesktopCloseTimer = useCallback(() => {
    if (desktopCloseTimerRef.current != null) {
      window.clearTimeout(desktopCloseTimerRef.current);
      desktopCloseTimerRef.current = null;
    }
  }, []);

  const handleSplashComplete = useCallback(() => {
    clearStoreSplash();
    setShowSplash(false);
  }, []);

  usePersistedSiteTheme(theme, userId);

  useEffect(() => {
    const onStorePrefs = () => setStorePrefsTick((t) => t + 1);
    window.addEventListener('shipit-store-prefs', onStorePrefs);
    return () => window.removeEventListener('shipit-store-prefs', onStorePrefs);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${MOBILE_SIDEBAR_MAX_PX + 1}px)`);
    const onChange = () => setIsDesktop(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    return () => clearDesktopCloseTimer();
  }, [clearDesktopCloseTimer]);

  useEffect(() => {
    setTheme(getStoredThemeForUser(userId));
  }, [userId]);

  useEffect(() => {
    setNavOpen(false);
    clearDesktopCloseTimer();
  }, [location.pathname, clearDesktopCloseTimer]);

  useEffect(() => {
    setHeaderCartModalOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!headerCartModalOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setHeaderCartModalOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [headerCartModalOpen]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setNavOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (navOpen) {
      lastWindowScrollY.current = window.scrollY;
    }
  }, [navOpen]);

  // Only auto-close sidebar on scroll for mobile, not desktop
  useEffect(() => {
    if (!navOpen || isDesktop) return undefined;

    const onWindowScroll = () => {
      setNavOpen(false);
      clearDesktopCloseTimer();
    };

    const onWheel = (e) => {
      const bar = sidebarRef.current;
      if (bar && e.target instanceof Node && bar.contains(e.target)) return;
      setNavOpen(false);
      clearDesktopCloseTimer();
    };

    let touchStartY = 0;

    const onTouchStart = (e) => {
      const bar = sidebarRef.current;
      if (bar && e.target instanceof Node && bar.contains(e.target)) return;
      touchStartY = e.touches[0]?.clientY ?? 0;
    };

    const onTouchMove = (e) => {
      const bar = sidebarRef.current;
      if (bar && e.target instanceof Node && bar.contains(e.target)) return;
      const y = e.touches[0]?.clientY;
      if (y == null) return;
      if (Math.abs(touchStartY - y) > 28) {
        setNavOpen(false);
        clearDesktopCloseTimer();
      }
    };

    window.addEventListener('scroll', onWindowScroll, { passive: true });
    window.addEventListener('wheel', onWheel, { passive: true });
    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchmove', onTouchMove, { passive: true });

    return () => {
      window.removeEventListener('scroll', onWindowScroll);
      window.removeEventListener('wheel', onWheel);
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchmove', onTouchMove);
    };
  }, [navOpen, clearDesktopCloseTimer, isDesktop]);

  const totalRevenue = orders.reduce(
    (sum, order) => sum + Number(order.totalPrice || 0),
    0,
  );
  const todayOrders = orders.filter((order) => {
    const d = new Date(order.createdAt || Date.now());
    const n = new Date();
    return (
      d.getDate() === n.getDate() &&
      d.getMonth() === n.getMonth() &&
      d.getFullYear() === n.getFullYear()
    );
  }).length;
  const lowStockCount = products.filter(
    (p) => Number(p.countInStock || 0) <= 5,
  ).length;
  const totalStockUnits = products.reduce(
    (sum, p) => sum + Number(p.countInStock || 0),
    0,
  );

  useEffect(() => {
    if (!orders.length && !ordersLoading) dispatch(fetchMyOrders());
    if (!products.length && !productsLoading) dispatch(fetchProducts());
  }, [dispatch, orders.length, ordersLoading, products.length, productsLoading]);

  const handleLogout = useCallback(async () => {
    clearStoreSplash();
    setShowSplash(false);
    try {
      await authAPI.logout();
    } catch {
      /* clear client state even if the request fails */
    }
    dispatch(logout());
    clearUserSession();
    navigate('/login');
  }, [dispatch, navigate]);

  // Keep sidebar open on desktop until explicitly closed
  const onSidebarPointerEnter = useCallback(() => {
    clearDesktopCloseTimer();
  }, [clearDesktopCloseTimer]);

  const sidebar = (
    <aside
      ref={sidebarRef}
      className={`store-sidebar${navOpen ? ' is-open' : ''}`}
      onMouseEnter={onSidebarPointerEnter}
    >
      <div className="store-sidebar__brand">
        <div className="store-sidebar__logo-mark" aria-hidden>
          <Store size={20} strokeWidth={2.25} />
        </div>
        <div className="store-sidebar__titles">
          <h2>{storefrontName}</h2>
          <span>Storefront</span>
        </div>
      </div>

      <div className="store-sidebar__scroll">
        <StorePulseCard
          activeInsight={activeInsight}
          onInsightChange={setActiveInsight}
          currency={currency}
          totalRevenue={totalRevenue}
          todayOrders={todayOrders}
          ordersLoading={ordersLoading}
          totalStockUnits={totalStockUnits}
          lowStockCount={lowStockCount}
          productsLoading={productsLoading}
        />

        <p className="store-sidebar__section-label">Navigate</p>
        <nav className="store-nav" aria-label="Main">
          <NavLink to="/home" end className={navLinkClass}>
            <LayoutDashboard size={20} strokeWidth={2} />
            <span>Home</span>
          </NavLink>
          <NavLink
            to="/products"
            className={({ isActive }) =>
              `store-nav-link${
                isActive || location.pathname.startsWith('/products/') ? ' active' : ''
              }`
            }
          >
            <Package size={20} strokeWidth={2} />
            <span>Catalog</span>
          </NavLink>
          <NavLink to="/orders" className={navLinkClass}>
            <Truck size={20} strokeWidth={2} />
            <span>My Orders</span>
          </NavLink>
          {cartCount > 0 ? (
            <NavLink to="/checkout" className={navLinkClass}>
              <ShoppingCart size={20} strokeWidth={2} />
              <span>Checkout</span>
              <span className="store-nav-badge">{cartCount}</span>
            </NavLink>
          ) : null}
          <NavLink to="/settings" className={navLinkClass}>
            <Settings size={20} strokeWidth={2} />
            <span>Settings</span>
          </NavLink>
        </nav>
      </div>

      <div className="store-sidebar__footer">
        <StoreThemeToggle theme={theme} onChange={setTheme} />
        <StoreLogoutButton onClick={handleLogout} />
      </div>
    </aside>
  );

  return (
    <>
      <StoreSplashScreen visible={showSplash} onComplete={handleSplashComplete} />

      <div
        className={`store-shell${showSplash ? ' store-shell--behind-splash' : ''}${navOpen ? ' store-shell--sidebar-open' : ''}`}
        aria-hidden={showSplash}
      >
        {/* Render Desktop Drawer Indicator, Sidebar & Backdrop directly to body using Portal! */}
        {createPortal(
          <>
            {isDesktop ? (
              <button
                type="button"
                className={`store-desktop-drawer-indicator ${navOpen ? 'is-hidden' : ''}`}
                onClick={() => {
                  clearDesktopCloseTimer();
                  setNavOpen(true);
                }}
                aria-label="Open sidebar menu"
              >
                <Menu size={16} strokeWidth={2.5} />
              </button>
            ) : null}

            <div
              className={`store-sidebar-backdrop${navOpen ? ' is-visible' : ''}`}
              onClick={() => {
                clearDesktopCloseTimer();
                setNavOpen(false);
              }}
              aria-hidden={!navOpen}
            />
            {sidebar}
          </>,
          document.body
        )}

        <div className="store-shell-main">
          <header className="store-header">
            <div className="store-header__left">
              <button
                type="button"
                className="store-icon-btn store-icon-btn--menu"
                onClick={() => {
                  clearDesktopCloseTimer();
                  setNavOpen((o) => !o);
                }}
                aria-expanded={navOpen}
                aria-label={navOpen ? 'Close menu' : 'Open menu'}
              >
                {navOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
              <div
                className="store-header__titles store-header__titles--route"
                key={location.pathname}
              >
                <h1 className="store-page-title">{title}</h1>
                <p className="store-page-subtitle">{subtitle}</p>
              </div>
            </div>
            <div className="store-header__actions">
              {!isAuthenticated ? (
                <div className="store-header-auth">
                  <Link to="/login" className="store-header-auth__link">
                    Sign In
                  </Link>
                  <Link to="/register" className="store-header-auth__btn">
                    Sign Up
                  </Link>
                </div>
              ) : null}
              {cartCount > 0 ? (
                <button
                  type="button"
                  className="store-header-cart"
                  onClick={() => {
                    if (location.pathname === '/checkout') {
                      setHeaderCartModalOpen(true);
                      return;
                    }
                    navigate('/checkout');
                  }}
                  aria-haspopup="dialog"
                  aria-expanded={headerCartModalOpen && location.pathname === '/checkout'}
                >
                  <ShoppingCart size={18} strokeWidth={2} />
                  <span>Cart</span>
                  <span className="store-header-cart__badge">{cartCount}</span>
                </button>
              ) : null}
              <button
                type="button"
                className="store-header-cta"
                onClick={() => navigate('/products')}
              >
                <span>Browse catalog</span>
                <ChevronRight size={18} strokeWidth={2.25} />
              </button>
            </div>
          </header>

          <div className="store-content store-content--route-enter" key={location.pathname}>
            {children}
          </div>
        </div>
      </div>

      <ModalHome
        open={headerCartModalOpen && location.pathname === '/checkout'}
        title="Your cart"
        onClose={() => setHeaderCartModalOpen(false)}
      >
        <CartPanel showHeader={false} />
      </ModalHome>
    </>
  );
};

export default DashboardLayout;
