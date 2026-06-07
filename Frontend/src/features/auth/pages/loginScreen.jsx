import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { goDashboardAfterAuth } from '../../../utils/goDashboardAfterAuth';
import { useDispatch } from 'react-redux';
import { authAPI } from '../../../api/api';
import { setAccessToken } from '../../../utils/authMemory';
import { persistUserSession } from '../../../utils/authSession';
import { verifyAuthSession } from '../../../utils/verifyAuthSession';
import { logout, setCredentials } from '../authSlice';
import AuthPageLayout from '../../../components/auth/AuthPageLayout';
import '../../../login.css';
import HideAndShow from '../../../components/hideAndShow';
import SaveButton from '../../../components/saveButton';
import CustomInput from '../../../components/customInput';
import { API_BASE_URL } from '../../../shared/lib/api.js';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [magicMsg, setMagicMsg] = useState('');

  useEffect(() => {
    const hasUser = Boolean(localStorage.getItem('userId') || localStorage.getItem('userEmail'));
    if (!hasUser) return;
    authAPI
      .me()
      .then(() => navigate('/home', { replace: true }))
      .catch(() => undefined);
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.login(formData);
      if (response.data.requiresConfirmation) {
        setError('Please confirm your email before logging in. Check your email for the confirmation link.');
        setLoading(false);
        return;
      }

      const { _id, name, email, isAdmin, token } = response.data;
      if (token) setAccessToken(token);
      persistUserSession({ _id, name, email, isAdmin });
      dispatch(setCredentials({ _id, name, email, isAdmin }));

      const session = await verifyAuthSession();
      if (!session.ok) {
        dispatch(logout());
        setError(session.message);
        return;
      }

      goDashboardAfterAuth(navigate);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPageLayout title="Welcome back" subtitle="Sign in to access your orders and checkout">
      <form onSubmit={handleSubmit} className="login-form">
        {error ? <div className="error-message">{error}</div> : null}

        <CustomInput
          type="email"
          label="Email address"
          name="email"
          id="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="you@example.com"
          required
        />

        <HideAndShow
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Your password"
          label="Password"
        />

        <SaveButton
          onClick={handleSubmit}
          disabled={loading}
          loading={loading}
          text="Signing you in cmonnn..."
          type="submit"
          className="login-btn"
        />
      </form>

      <div className="otp-login-option">
        <p className="auth-divider">
          <span>or</span>
        </p>
        <Link to="/login-otp" className="otp-link">
          Sign in with OTP
        </Link>
      </div>

      <div className="otp-login-option">
        <p className="auth-divider">
          <span>or</span>
        </p>
        <button
          type="button"
          className="login-btn login-btn--outline"
          onClick={() => {
            window.location.assign(`${API_BASE_URL}/auth/google?next=/home`);
          }}
        >
          Continue with Google
        </button>
      </div>

      {magicMsg ? (
        <div className="error-message auth-msg--muted">{magicMsg}</div>
      ) : null}

      <div className="login-footer">
        <p>
          Create an Account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </AuthPageLayout>
  );
};

export default Login;
