import React, { useEffect, useState } from 'react';
import TopBar from '../components/topBar';
import Settings from '../components/settings';
import { authAPI } from '../api/api';
import { persistUserSession } from '../utils/authSession';

const Home = () => {
  const [userName, setUserName] = useState(
    () => localStorage.getItem('userName') || ''
  );

  const logout=() => {
    localStorage.clear();
    window.location.href = '/login';
  }
 const topBarActions = [
  {
    label: "Add Product",
    onClick: () => console.log("Add clicked"),
  },
  {
    label: "Logout",
    onClick: () => logout(),
  },
];
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
        userName={userName || "User000"}
        actions={topBarActions}
        settingsComponent={<Settings onLogout={logout} />}
      />

      <div className="home-container">
        <h1>Welcome to the Home Screen!</h1>
        <p>You have successfully logged in.</p>
      </div>
    </div>
  );
};

export default Home;
