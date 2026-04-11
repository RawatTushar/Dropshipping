import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { clearAdminInfo, getAdminInfo, isAdminUser } from '../utils/adminAuth';
import SplashScreen from './SplashScreen';
import { LayoutDashboard, Package, LogOut, LayoutGrid, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentAdmin = getAdminInfo();
  const isAuthorized = isAdminUser(currentAdmin);
  const [showSplash, setShowSplash] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('adminTheme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('adminTheme', theme);
  }, [theme]);

  useEffect(() => {
    if (!isAuthorized) {
      clearAdminInfo();
      navigate('/login');
    } else {
      // Show splash only once per session
      if (!sessionStorage.getItem('splashShown')) {
        setShowSplash(true);
        sessionStorage.setItem('splashShown', 'true');
      }
    }
  }, [isAuthorized, navigate]);

  const logoutHandler = () => {
    clearAdminInfo();
    sessionStorage.removeItem('splashShown');
    navigate('/login');
  };

  if (!isAuthorized) {
    return null;
  }

  return (
    <>
      <SplashScreen isVisible={showSplash} onComplete={() => setShowSplash(false)} />
      
      {!showSplash && (
        <div className="admin-layout">
          <aside className="sidebar">
            <div className="sidebar-logo">
              <span><LayoutGrid size={20} strokeWidth={2.5}/></span> Admin
            </div>
            <nav style={{ flex: 1 }}>
              <NavLink to="/" end className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
                <LayoutDashboard size={20} /> Dashboard
              </NavLink>
              <NavLink to="/products" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
                <Package size={20} /> Products
              </NavLink>
            </nav>
            <div style={{ marginTop: 'auto' }}>
              <div style={{ display: 'flex', gap: '0.5rem', padding: '0.5rem', marginBottom: '1rem', background: 'var(--bg-panel)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <button 
                  onClick={() => setTheme('light')}
                  style={{ flex: 1, padding: '0.4rem', borderRadius: '6px', border: 'none', background: theme === 'light' ? 'var(--bg-hover)' : 'transparent', color: theme === 'light' ? 'var(--text-main)' : 'var(--text-muted)', cursor: 'pointer', display: 'flex', justifyContent: 'center', transition: 'all 0.2s' }}
                  title="Light Mode"
                >
                  <Sun size={18} />
                </button>
                <button 
                  onClick={() => setTheme('dark')}
                  style={{ flex: 1, padding: '0.4rem', borderRadius: '6px', border: 'none', background: theme === 'dark' ? 'var(--bg-hover)' : 'transparent', color: theme === 'dark' ? 'var(--text-main)' : 'var(--text-muted)', cursor: 'pointer', display: 'flex', justifyContent: 'center', transition: 'all 0.2s' }}
                  title="Dark Mode"
                >
                  <Moon size={18} />
                </button>
              </div>

              <button 
                onClick={logoutHandler} 
                className="nav-link" 
                style={{ width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', color: 'var(--danger)' }}
              >
                <LogOut size={20} /> Logout
              </button>
            </div>
          </aside>
          
          <main className="main-content">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      )}
    </>
  );
};

export default Layout;
