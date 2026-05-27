import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ArrowRight, Shield, Truck, Sparkles, X } from 'lucide-react';
import StoreAuthHeader from '../../../components/store/StoreAuthHeader';
import { selectIsAuthenticated } from '../../auth/authSlice';
import LoginScreen from '../../auth/pages/loginScreen';
import RegisterScreen from '../../auth/pages/registerScreen';
import LoginOtp from '../../auth/pages/loginOtp';
import '../../../landingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [authModal, setAuthModal] = useState(null); // 'login', 'register', 'login-otp', or null

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const showLogin = authModal === 'login';
  const showRegister = authModal === 'register';
  const showOtp = authModal === 'login-otp';
  const isAuthModalOpen = showLogin || showRegister || showOtp;

  const handleCloseModal = () => {
    setAuthModal(null);
  };

  const handleModalClick = (e) => {
    // Intercept clicks on links inside the modal to switch modal state instead of loading standalone pages
    const link = e.target.closest('a');
    if (link) {
      const href = link.getAttribute('href');
      if (href === '/register') {
        e.preventDefault();
        setAuthModal('register');
      } else if (href === '/login') {
        e.preventDefault();
        setAuthModal('login');
      } else if (href === '/login-otp') {
        e.preventDefault();
        setAuthModal('login-otp');
      }
    }
  };

  return (
    <div className={`landing ${isAuthModalOpen ? 'modal-open' : ''}`}>
      <div className="landing__bg" aria-hidden />
      <div className="landing__overlay" aria-hidden />

      <StoreAuthHeader 
        variant="landing" 
        onSignIn={() => setAuthModal('login')} 
        onSignUp={() => setAuthModal('register')} 
      />

      <main className="landing__main">
        <p className="landing__eyebrow">Modern dropshipping storefront</p>
        <h1 className="landing__title">
          Shop smarter.
          <br />
          <span>Run your store with confidence.</span>
        </h1>
        <p className="landing__lead">
          Browse curated products, track orders in one place, and check out securely —
          built for a clean, professional shopping experience.
        </p>

        <div className="landing__cta-row">
          <Link to="/products" className="landing__cta landing__cta--primary">
            Explore catalog
            <ArrowRight size={18} strokeWidth={2.25} />
          </Link>
          <button 
            type="button"
            onClick={() => setAuthModal('login')}
            className="landing__cta landing__cta--secondary"
          >
            Sign in to your account
          </button>
        </div>

        <ul className="landing__features">
          <li>
            <span className="landing__feature-icon" aria-hidden>
              <Sparkles size={18} />
            </span>
            <div>
              <strong>Curated catalog</strong>
              <span>Discover products with fast search and filters</span>
            </div>
          </li>
          <li>
            <span className="landing__feature-icon" aria-hidden>
              <Truck size={18} />
            </span>
            <div>
              <strong>Order tracking</strong>
              <span>View history and status after you sign in</span>
            </div>
          </li>
          <li>
            <span className="landing__feature-icon" aria-hidden>
              <Shield size={18} />
            </span>
            <div>
              <strong>Secure checkout</strong>
              <span>Protected payments and account sessions</span>
            </div>
          </li>
        </ul>
      </main>

      {/* Elegant Auth Modal Overlay */}
      {isAuthModalOpen && (
        <div className="auth-modal-overlay" onClick={handleCloseModal}>
          <div className="auth-modal-container" onClick={(e) => e.stopPropagation()}>
            <button className="auth-modal-close" onClick={handleCloseModal} aria-label="Close modal">
              <X size={18} strokeWidth={2.5} />
            </button>
            <div className="auth-modal-content" onClick={handleModalClick} key={authModal}>
              {showLogin && <LoginScreen />}
              {showRegister && <RegisterScreen />}
              {showOtp && <LoginOtp />}
            </div>
          </div>
        </div>
      )}

      <footer className="landing__footer">
        <p>© {new Date().getFullYear()} ShipIt · Professional storefront demo</p>
      </footer>
    </div>
  );
};

export default LandingPage;
