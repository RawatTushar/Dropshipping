import React, { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import '../login.css';

const menuItems = [
  { key: 'overview', label: 'Overview' },
  { key: 'myprofile', label: 'My Profile' },
  { key: 'settings', label: 'Settings' },
  { key: 'changePassword', label: 'Change Password' },
  { key: 'summary', label: 'Summary' },
  { key: 'orders', label: 'Your Orders' },
  { key: 'cart', label: 'My Cart' },
  { key: 'theme', label: 'Theme Change' },
  { key: 'signout', label: 'Sign Out' },
];

const SettingScreen = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [theme, setTheme] = useState('light');

  const section = searchParams.get('section') || 'overview';
  const userName = localStorage.getItem('userName') || 'User';
  const userEmail = localStorage.getItem('userEmail') || 'email@example.com';

  const handleSelect = (key) => {
    if (key === 'signout') {
      localStorage.clear();
      navigate('/login');
      return;
    }

    if (key === 'changePassword') {
      setSearchParams({ section: key });
      return;
    }

    setSearchParams({ section: key });
  };

  const toggleTheme = () => {
    setTheme((current) => (current === 'light' ? 'dark' : 'light'));
  };

  const sectionContent = useMemo(() => {
    switch (section) {
      case 'myprofile':
        return (
          <>
            <h2>My Profile</h2>
            <p>Manage your personal information and account contact details.</p>
            <div className="profile-card">
              <div>
                <strong>Name</strong>
                <p>{userName}</p>
              </div>
              <div>
                <strong>Email</strong>
                <p>{userEmail}</p>
              </div>
              <div>
                <strong>Account Status</strong>
                <p>Active</p>
              </div>
            </div>
          </>
        );
      case 'settings':
        return (
          <>
            <h2>Settings</h2>
            <p>Update your preferences, notification settings, and display options.</p>
            <div className="panel-grid">
              <div className="panel-card">
                <h3>Account Preferences</h3>
                <p>Customize how the application behaves and what you see on screen.</p>
              </div>
              <div className="panel-card">
                <h3>Notification Settings</h3>
                <p>Enable or disable email updates and order alerts.</p>
              </div>
            </div>
          </>
        );
      case 'changePassword':
        return (
          <>
            <h2>Change Password</h2>
            <p>Protect your account by updating your password regularly.</p>
            <button type="button" className="login-btn" onClick={() => navigate('/changePassword')}>
              Go to Change Password Screen
            </button>
          </>
        );
      case 'summary':
        return (
          <>
            <h2>Summary</h2>
            <p>Your latest activity and order insights in one place.</p>
            <div className="summary-grid">
              <div className="summary-card">
                <span>5</span>
                <p>Open Orders</p>
              </div>
              <div className="summary-card">
                <span>12</span>
                <p>Items in Cart</p>
              </div>
              <div className="summary-card">
                <span>$2,400</span>
                <p>Monthly Revenue</p>
              </div>
            </div>
          </>
        );
      case 'orders':
        return (
          <>
            <h2>Your Orders</h2>
            <p>Review the status of current and recent orders.</p>
            <div className="table-placeholder">
              <div className="table-row header">
                <span>Order</span>
                <span>Date</span>
                <span>Status</span>
                <span>Total</span>
              </div>
              <div className="table-row">
                <span>#1045</span>
                <span>Apr 1</span>
                <span>Shipped</span>
                <span>$129</span>
              </div>
              <div className="table-row">
                <span>#1046</span>
                <span>Apr 3</span>
                <span>Pending</span>
                <span>$89</span>
              </div>
            </div>
          </>
        );
      case 'cart':
        return (
          <>
            <h2>My Cart</h2>
            <p>Items you are planning to purchase soon.</p>
            <ul className="cart-list">
              <li>Wireless headphones</li>
              <li>Product sample pack</li>
              <li>Shipment packaging</li>
            </ul>
          </>
        );
      case 'theme':
        return (
          <>
            <h2>Theme Change</h2>
            <p>Switch between light and dark appearance instantly.</p>
            <button type="button" className="theme-toggle-btn" onClick={toggleTheme}>
              Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
            </button>
          </>
        );
      case 'overview':
      default:
        return (
          <>
            <h2>Overview</h2>
            <p>Welcome to your dashboard. Select a menu item to view more details.</p>
            <div className="overview-grid">
              <div className="overview-card">
                <h3>Profile</h3>
                <p>{userName}</p>
              </div>
              <div className="overview-card">
                <h3>Orders</h3>
                <p>Ready to manage your active orders.</p>
              </div>
              <div className="overview-card">
                <h3>Cart</h3>
                <p>Review your latest items before checkout.</p>
              </div>
            </div>
          </>
        );
    }
  }, [section, theme, userEmail, userName, navigate]);

  return (
    <div className={`settings-page theme-${theme}`}>
      <div className="settings-layout">
        <aside className="sidebar">
          <div className="sidebar-header">
            <h1>Navigation</h1>
            <p>Quick access to your account and store management.</p>
          </div>
          <div className="sidebar-list">
            {menuItems.map((item) => (
              <button
                key={item.key}
                type="button"
                className={`sidebar-item ${section === item.key ? 'sidebar-item--active' : ''}`}
                onClick={() => handleSelect(item.key)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </aside>

        <main className="section-panel">
          <div className="back-button-container">
            <button
              type="button"
              className="back-btn"
              onClick={() => navigate('/home')}
              aria-label="Back to Homepage"
            >
              ← Back to Dashboard
            </button>
          </div>
          {sectionContent}
        </main>
      </div>
    </div>
  );
};

export default SettingScreen;
