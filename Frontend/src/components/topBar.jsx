import React from 'react';
import '../topbar.css';

const TopBar = ({
  title = 'Dashboard',
  subtitle = 'A quick overview of your store activity.',
  userName,
  actions = [],
  settingsComponent,
  onLogout,
}) => {
  return (
    <header className="topbar">
      <div className="topbar__body">
        <div className="topbar__brand-group">
          <div className="topbar__logo">DS</div>
          <div className="topbar__text-group">
            <p className="topbar__eyebrow">Dropshipping</p>
            <h1 className="topbar__title">{title}</h1>
            {subtitle && <p className="topbar__subtitle">{subtitle}</p>}
          </div>
        </div>

        <div className="topbar__end-group">
          {userName && (
            <div className="topbar__user-chip">
              <span>Hi,</span>
              <strong>{userName}</strong>
            </div>
          )}
          <div className="topbar__actions">
            {actions.map((action, index) => (
              <button
                key={index}
                type="button"
                className="topbar__action"
                onClick={action.onClick}
              >
                {action.label}
              </button>
            ))}
            {settingsComponent && (
              <div className="topbar__settings">
                {settingsComponent}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
