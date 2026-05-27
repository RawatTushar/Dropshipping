import React from 'react';
import StoreAuthHeader from '../store/StoreAuthHeader';
import './AuthPageLayout.css';

const AuthPageLayout = ({ title, subtitle, children }) => (
  <div className="auth-shell">
    <div className="auth-shell__bg" aria-hidden />
    <div className="auth-shell__overlay" aria-hidden />
    <StoreAuthHeader variant="auth" />
    <div className="auth-shell__body">
      <div className="auth-card">
        {(title || subtitle) && (
          <div className="auth-card__head">
            {title ? <h1>{title}</h1> : null}
            {subtitle ? <p>{subtitle}</p> : null}
          </div>
        )}
        {children}
      </div>
    </div>
  </div>
);

export default AuthPageLayout;
