import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import settingsIcon from '../assets/images/settings.png';
import changePassword from '../screens/changePassword';
const Settings = ({ onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  const handleMyProfile = () => {
    closeModal();
    navigate('/profile');
  };

  const handleSettings = () => {
    closeModal();
    navigate('/settings');
  };

  const handleLogout = () => {
    closeModal();
    if (onLogout) onLogout();
  };

  const handleChangePassword = () => {
    closeModal();
    navigate('/changePassword');
  };

  return (
    <>
      <button
        type="button"
        className="settings-button"
        onClick={openModal}
        aria-label="Open settings"
      >
        <img src={settingsIcon} alt="Settings" className="settings-button__icon" />
      </button>

      {isOpen && (
        <div className="settings-modal-overlay" onClick={(event) => event.target === event.currentTarget && closeModal()}>
          <div className="settings-modal">
            <div className="settings-modal__header">
              <h2>Settings</h2>
              <button
                type="button"
                className="settings-modal__close"
                onClick={closeModal}
                aria-label="Close settings"
              >
                ×
              </button>
            </div>

            <div className="settings-modal__content">
              <div className="settings-options">
                <button type="button" className="settings-option" onClick={handleMyProfile}>
                  My Profile
                </button>
                <button type="button" className="settings-option" onClick={handleSettings}>
                  Settings
                </button>
                <button type="button" className="settings-option" onClick={handleChangePassword}>
                  Change Password
                </button>
                <button type="button" className="settings-option settings-option--logout" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            </div>

            <div className="settings-modal__footer">
              <button type="button" className="settings-modal__close-btn" onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Settings;
