import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package } from 'lucide-react';
import './StoreAuthHeader.css';

const StoreAuthHeader = ({ variant = 'landing', onSignIn, onSignUp }) => {
  const navigate = useNavigate();

  return (
    <header className={`store-auth-header store-auth-header--${variant}`}>
      <button
        type="button"
        className="store-auth-header__brand"
        onClick={() => navigate('/')}
        aria-label="Go to home"
      >
        <span className="store-auth-header__logo" aria-hidden>
          <Package size={20} strokeWidth={2.25} />
        </span>
        <span className="store-auth-header__name">ShipIt</span>
      </button>

      <div className="store-auth-header__actions">
        {onSignIn ? (
          <button
            type="button"
            onClick={onSignIn}
            className="store-auth-header__btn store-auth-header__btn--ghost"
          >
            Sign In
          </button>
        ) : (
          <Link to="/login" className="store-auth-header__btn store-auth-header__btn--ghost">
            Sign In
          </Link>
        )}

        {onSignUp ? (
          <button
            type="button"
            onClick={onSignUp}
            className="store-auth-header__btn store-auth-header__btn--primary"
          >
            Sign Up
          </button>
        ) : (
          <Link to="/register" className="store-auth-header__btn store-auth-header__btn--primary">
            Sign Up
          </Link>
        )}
      </div>
    </header>
  );
};

export default StoreAuthHeader;
