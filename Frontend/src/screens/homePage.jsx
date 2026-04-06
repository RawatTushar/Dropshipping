import React, { useEffect, useMemo, useState } from 'react';
import TopBar from '../components/topBar';
import Settings from '../components/settings';
import { authAPI } from '../api/api';
import { persistUserSession } from '../utils/authSession';
import './homePage.css';

const Home = () => {
  const [userName, setUserName] = useState(
    () => localStorage.getItem('userName') || ''
  );

  const logout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  const topBarActions = [
    {
      label: 'Add Product',
      onClick: () => window.location.href = '/register',
    },
    {
      label: 'Logout',
      onClick: () => logout(),
    },
  ];

  const stats = useMemo(() => [
    {
      title: 'Total Sales',
      value: '$14.2K',
      label: 'This month',
      accent: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    {
      title: 'Orders',
      value: '128',
      label: 'Open orders',
      accent: 'linear-gradient(135deg, #f97316 0%, #f59e0b 100%)',
    },
    {
      title: 'Customers',
      value: '3.2K',
      label: 'Active users',
      accent: 'linear-gradient(135deg, #10b981 0%, #22c55e 100%)',
    },
    {
      title: 'Cart Value',
      value: '$4.8K',
      label: 'Current value',
      accent: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
    },
  ], []);

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
          name: data.name,
          email: data.email,
          isAdmin: data.isAdmin,
        });
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
  }, []);

  return (
    <div className="home-page">
      <TopBar
        title="Dashboard"
        subtitle="Manage your store, view quick metrics, and stay ahead of orders."
        userName={userName || 'User000'}
        actions={topBarActions}
        settingsComponent={<Settings onLogout={logout} />}
      />

      <main className="home-page__main">
        <section className="panel hero-panel">
          <div>
            <p className="eyebrow">Good morning, {userName || 'seller'}</p>
            <h2>Welcome back to your Dropshipping dashboard</h2>
            <p>
              Track your latest orders, revenue, and store performance all from one
              place.
            </p>
          </div>
          <div className="hero-actions">
            <button type="button" className="primary-btn" onClick={() => window.location.href = '/register'}>
              Add New Product
            </button>
            <button type="button" className="secondary-btn" onClick={() => window.location.href = '/settings'}>
              View Settings
            </button>
          </div>
        </section>

        <section className="panel stats-panel">
          {stats.map((stat) => (
            <article className="stat-card" key={stat.title} style={{ background: stat.accent }}>
              <p>{stat.title}</p>
              <h3>{stat.value}</h3>
              <span>{stat.label}</span>
            </article>
          ))}
        </section>

        <section className="panel split-panel">
          <div className="card card--large">
            <div className="card-header">
              <h3>Recent Orders</h3>
              <span>Last 7 days</span>
            </div>
            <div className="orders-table">
              <div className="orders-row orders-row--head">
                <span>Order ID</span>
                <span>Date</span>
                <span>Status</span>
                <span>Total</span>
              </div>
              <div className="orders-row">
                <span>#A1098</span>
                <span>Apr 03</span>
                <span className="status status--shipped">Shipped</span>
                <span>$129.00</span>
              </div>
              <div className="orders-row">
                <span>#A1102</span>
                <span>Apr 04</span>
                <span className="status status--processing">Processing</span>
                <span>$89.00</span>
              </div>
              <div className="orders-row">
                <span>#A1115</span>
                <span>Apr 05</span>
                <span className="status status--pending">Pending</span>
                <span>$205.00</span>
              </div>
            </div>
          </div>

          <div className="card card--small">
            <div className="card-header">
              <h3>Today’s Highlights</h3>
              <span>Snapshot</span>
            </div>
            <div className="highlight-list">
              <div className="highlight-item">
                <strong>New visitors</strong>
                <span>1,120</span>
              </div>
              <div className="highlight-item">
                <strong>Pending deliveries</strong>
                <span>5</span>
              </div>
              <div className="highlight-item">
                <strong>Customer messages</strong>
                <span>12</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;
