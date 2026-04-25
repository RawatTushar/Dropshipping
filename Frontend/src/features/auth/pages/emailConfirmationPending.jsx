import React, { useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';

const EmailConfirmationPending = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const email = location.state?.email || 'your email';

  useEffect(() => {
    if (searchParams.get('confirmed') === 'true') {
      navigate('/login');
    }
  }, [searchParams, navigate]);

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Confirm Your Email</h1>
          <p>We sent a confirmation link to <strong>{email}</strong>.</p>
          <p>Click the link in your inbox to activate your account.</p>
          <p>If it does not arrive soon, please check spam folder or retry.</p>
        </div>

        <div className="login-form" style={{ textAlign: 'center' }}>
          <button
            type="button"
            className="login-btn"
            onClick={() => navigate('/login')}
          >
            Back to Login
          </button>
          <button
            type="button"
            className="login-btn"
            style={{ marginLeft: '10px', backgroundColor: '#28a745' }}
            onClick={() => window.location.reload()}
          >
            I Got the Link, Refresh Status
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailConfirmationPending;
