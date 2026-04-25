import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import DashboardLayout from '../../../components/DashboardLayout';
import { selectAuthUser, selectCurrentUserId, setCredentials } from '../../auth/authSlice';
import {
  selectCurrentCurrency,
  setCurrencyForUser,
} from '../../preferences/currencySlice';
import '../../../settingScreen.css';
import {
  DEFAULT_STORE_NAME,
  readSavedStoreName,
  storeNameStorageKey,
} from '../../../utils/storePreferences';

const tabs = [
  { id: 'profile', label: 'My Details' },
  { id: 'storeSetup', label: 'Store Setup' },
  { id: 'suppliers', label: 'Suppliers' },
  { id: 'security', label: 'Security' },
  { id: 'notifications', label: 'Notifications' },
];

const SettingScreen = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const userId = useSelector(selectCurrentUserId);
  const authUser = useSelector(selectAuthUser);
  const selectedCurrency = useSelector(selectCurrentCurrency);
  const [currency, setCurrency] = useState(selectedCurrency);
  const [storeName, setStoreName] = useState('');
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [savedMessage, setSavedMessage] = useState('');

  useEffect(() => {
    setCurrency(selectedCurrency);
  }, [selectedCurrency]);

  useEffect(() => {
    setStoreName(readSavedStoreName(userId));
  }, [userId]);

  useEffect(() => {
    setProfileName(authUser?.name || localStorage.getItem('userName') || 'User');
    setProfileEmail(authUser?.email || localStorage.getItem('userEmail') || 'user@dropship.co');
  }, [authUser]);

  const currentTab = searchParams.get('tab') || 'storeSetup';

  const handleTabChange = (id) => {
    setSearchParams({ tab: id });
    setSavedMessage('');
  };

  const handleSaveChanges = () => {
    dispatch(setCurrencyForUser({ userId, currency }));
    localStorage.setItem(storeNameStorageKey(userId), storeName.trim() || DEFAULT_STORE_NAME);
    window.dispatchEvent(new Event('shipit-store-prefs'));

    if (authUser?.token) {
      dispatch(
        setCredentials({
          token: authUser.token,
          _id: authUser._id,
          name: profileName.trim() || authUser.name,
          email: profileEmail.trim() || authUser.email,
          isAdmin: authUser.isAdmin,
        }),
      );
      setSavedMessage('Profile, storefront name, and currency saved.');
    } else {
      setSavedMessage('Storefront name and currency saved. Sign in to update your profile.');
    }
  };

  const showSaveBar = currentTab === 'storeSetup' || currentTab === 'profile';

  const renderContent = () => {
    switch(currentTab) {
      case 'profile':
        return (
          <div className="tab-pane animate-fade-in delay-100">
            <h3>Personal Information</h3>
            <p className="subtitle">Update your personal details and public profile.</p>
            
            <div className="form-grid">
              <div className="input-group">
                <label>Full Name</label>
                <input
                  type="text"
                  className="premium-input"
                  value={profileName}
                  onChange={(e) => {
                    setProfileName(e.target.value);
                    setSavedMessage('');
                  }}
                />
              </div>
              <div className="input-group">
                <label>Contact Email</label>
                <input
                  type="email"
                  className="premium-input"
                  value={profileEmail}
                  onChange={(e) => {
                    setProfileEmail(e.target.value);
                    setSavedMessage('');
                  }}
                />
              </div>
            </div>
            <p className="settings-hint mt-24">
              <strong>Save changes</strong> below updates your name and/or email together with your storefront name and currency in one step (change only what you need).
            </p>
          </div>
        );
        
      case 'storeSetup':
        return (
          <div className="tab-pane animate-fade-in delay-100">
            <h3>Store Information</h3>
            <p className="subtitle">Manage your dropshipping store details and preferences.</p>
            
            <div className="form-group mb-32">
              <label htmlFor="settings-store-display-name">{DEFAULT_STORE_NAME}</label>
              <input
                id="settings-store-display-name"
                type="text"
                className="premium-input"
                value={storeName}
                onChange={(e) => {
                  setStoreName(e.target.value);
                  setSavedMessage('');
                }}
              />
              <span className="input-hint">This will be displayed on your storefront and invoices.</span>
            </div>

            <div className="form-group mb-32">
              <label>Primary Currency</label>
              <select
                className="premium-input"
                value={currency}
                onChange={(e) => {
                  setCurrency(e.target.value);
                  setSavedMessage('');
                }}
              >
                <option value="USD">USD ($) - United States Dollar</option>
                <option value="EUR">EUR (€) - Euro</option>
                <option value="GBP">GBP (£) - British Pound</option>
                <option value="INR">INR (₹) - Indian Rupee</option>
              </select>
            </div>

            <p className="settings-hint mb-32">
              Edit your storefront name and/or currency here; <strong>Save changes</strong> below also keeps your profile in sync if you are signed in.
            </p>

            <div className="settings-card">
              <div className="settings-card-text">
                <strong>Custom Domain</strong>
                <span>Connect a custom domain to your store.</span>
              </div>
              <button className="btn-outline">Add Domain</button>
            </div>
          </div>
        );

      case 'suppliers':
        return (
          <div className="tab-pane animate-fade-in delay-100">
            <h3>Supplier Integrations</h3>
            <p className="subtitle">Manage connections to your dropshipping suppliers.</p>

            <div className="integration-list">
              <div className="integration-item">
                <div className="integration-info">
                  <div className="icon-box bg-purple">AE</div>
                  <div>
                    <strong>AliExpress Sync</strong>
                    <span>Status: <span className="text-success">Connected</span></span>
                  </div>
                </div>
                <button className="btn-icon">⚙️</button>
              </div>

              <div className="integration-item">
                <div className="integration-info">
                  <div className="icon-box bg-orange">CJ</div>
                  <div>
                    <strong>CJ Dropshipping</strong>
                    <span>Status: <span className="text-warning">Action Required</span></span>
                  </div>
                </div>
                <button className="btn-icon">⚙️</button>
              </div>
            </div>
          </div>
        );
        
      case 'security':
        return (
          <div className="tab-pane animate-fade-in delay-100">
            <h3>Password & Security</h3>
            <p className="subtitle">Keep your account secure.</p>
            <div className="settings-card">
              <div className="settings-card-text">
                <strong>Change Password</strong>
                <span>Update your password regularly to keep your account secure.</span>
              </div>
              <button className="btn-outline" onClick={() => navigate('/changePassword')}>Update</button>
            </div>
          </div>
        );

      default:
        return (
          <div className="tab-pane animate-fade-in delay-100">
            <h3>Coming Soon</h3>
            <p className="subtitle">This section is under construction.</p>
          </div>
        );
    }
  };

  return (
    <DashboardLayout 
      title="Settings" 
      subtitle="Manage your store settings and preferences."
    >
      <div className="settings-container glass-panel animate-slide-up delay-200">
        <div className="settings-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab-btn ${currentTab === tab.id ? 'active' : ''}`}
              onClick={() => handleTabChange(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="settings-content">
          {renderContent()}
          {showSaveBar ? (
            <div className="settings-save-bar">
              <button type="button" className="btn-save" onClick={handleSaveChanges}>
                Save changes
              </button>
              {savedMessage ? <p className="settings-saved-msg">{savedMessage}</p> : null}
            </div>
          ) : null}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SettingScreen;
