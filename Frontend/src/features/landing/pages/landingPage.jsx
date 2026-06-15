import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ArrowRight, Shield, Truck, Sparkles } from 'lucide-react';
import StoreAuthHeader from '../../../components/store/StoreAuthHeader';
import { selectIsAuthenticated } from '../../auth/authSlice';
import '../../../landingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="landing">
      <div className="landing__glow-1" aria-hidden></div>
      <div className="landing__glow-2" aria-hidden></div>

      <StoreAuthHeader 
        variant="landing" 
        onSignIn={() => navigate('/login')} 
        onSignUp={() => navigate('/register')} 
      />

      <main className="landing__main">
        <div className="landing__hero-content">
          <div className="section-label landing__eyebrow">
            <div className="section-label__dot"></div>
            <div className="section-label__text">Modern dropshipping storefront</div>
          </div>
          
          <h1 className="landing__title">
            Shop smarter.<br />
            <span className="gradient-text">Run your store with confidence.</span>
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
              onClick={() => navigate('/login')}
              className="landing__cta landing__cta--secondary"
            >
              Sign in to your account
            </button>
          </div>

          <ul className="landing__features">
            <li>
              <div className="landing__feature-icon" aria-hidden>
                <Sparkles size={20} />
              </div>
              <div>
                <strong>Curated catalog</strong>
                <span > Discover products with fast search and filters</span>
              </div>
            </li>
            <li>
              <div className="landing__feature-icon" aria-hidden>
                <Truck size={20} />
              </div>
              <div>
                <strong>Order tracking</strong>
                <span>View history and status after you sign in</span>
              </div>
            </li>
            <li>
              <div className="landing__feature-icon" aria-hidden>
                <Shield size={20} />
              </div>
              <div>
                <strong>Secure checkout</strong>
                <span>Protected payments and account sessions</span>
              </div>
            </li>
          </ul>
        </div>

        <div className="landing__hero-graphic">
          <div className="hero-graphic__container">
            <div className="hero-graphic__ring"></div>
            <div className="hero-graphic__card hero-graphic__card-1">
              <div className="hero-graphic__card-bar"></div>
              <div className="hero-graphic__card-line"></div>
              <div className="hero-graphic__card-line hero-graphic__card-line--short"></div>
            </div>
            <div className="hero-graphic__card hero-graphic__card-2">
              <div className="hero-graphic__card-line"></div>
              <div className="hero-graphic__card-bar"></div>
            </div>
            <div className="hero-graphic__accent-block"></div>
          </div>
        </div>
      </main>

      <section className="inverted-section landing__stats">
        <div className="landing__stats-inner">
          <div className="landing__stat">
            <strong>500+</strong>
            <span>Curated products</span>
          </div>
          <div className="landing__stat">
            <strong>10K+</strong>
            <span>Happy customers</span>
          </div>
          <div className="landing__stat">
            <strong>99.9%</strong>
            <span>Secure transactions</span>
          </div>
        </div>
      </section>



      <footer className="landing__footer">
        <p>© {new Date().getFullYear()} ShipIt · Professional storefront demo</p>
      </footer>
    </div>
  );
};

export default LandingPage;
