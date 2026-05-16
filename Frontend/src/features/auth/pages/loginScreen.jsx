import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { goDashboardAfterAuth } from '../../../utils/goDashboardAfterAuth';
import { useDispatch } from 'react-redux';
import { authAPI } from '../../../api/api';
import { persistUserSession } from '../../../utils/authSession';
import { setCredentials } from '../authSlice';
import '../../../login.css';
import { Link } from 'react-router-dom';
import HideAndShow from '../../../components/hideAndShow';
import SaveButton from '../../../components/saveButton';
import CustomInput from '../../../components/customInput';
import { API_BASE_URL } from '../../../shared/lib/api.js';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [magicEmail, setMagicEmail] = useState('');
  const [magicBusy, setMagicBusy] = useState(false);
  const [magicMsg, setMagicMsg] = useState('');

  useEffect(() => {
    // Cookie-based auth: if we have a remembered user session, try loading /me.
    const hasUser = Boolean(localStorage.getItem('userId') || localStorage.getItem('userEmail'));
    if (!hasUser) return;
    authAPI
      .me()
      .then(() => navigate('/home'))
      .catch(() => undefined);
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.login(formData);
      // Check if login requires email confirmation
      if (response.data.requiresConfirmation) {
        setError('Please confirm your email before logging in. Check your email for the confirmation link.');
        setLoading(false);
        return;
      }

      const { token, _id, name, email, isAdmin } = response.data;
      persistUserSession({ _id, name, email, isAdmin });
      dispatch(setCredentials({ token: '', _id, name, email, isAdmin }));
      goDashboardAfterAuth(navigate);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onSendMagicLink = async () => {
    const email = magicEmail.trim();
    if (!email) {
      setMagicMsg('Enter your email to receive a sign-in link.');
      return;
    }
    setMagicBusy(true);
    setMagicMsg('');
    try {
      const { data } = await authAPI.sendMagicLink(email);
      setMagicMsg(data?.message || 'Check your email for a sign-in link.');
    } catch (err) {
      setMagicMsg(err.response?.data?.message || 'Could not send sign-in link.');
    } finally {
      setMagicBusy(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Welcome Back</h1>
          <p>Please sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <CustomInput
            type="email"
            label="Email Address"
            name="email"
            id="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
          />

          <HideAndShow
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            label="Password"
          />

          
          <SaveButton onClick={handleSubmit} disabled={loading} loading={loading} text="Sign In" type="submit" className="login-btn"/> 
        </form>
     <div className="otp-login-option">
          <p><b>or</b></p>  
          <Link to="/login-otp" className="otp-link">Sign in with OTP</Link>
        </div>

        <div className="otp-login-option" style={{ marginTop: '0.75rem' }}>
          <p><b>or</b></p>
          <button
            type="button"
            className="login-btn"
            onClick={() => {
              window.location.assign(`${API_BASE_URL}/auth/google?next=/home`);
            }}
            style={{ width: '100%' }}
          >
            Continue with Google
          </button>
        </div>

        <div className="otp-login-option" style={{ marginTop: '0.75rem' }}>
          {/* <p><b>or</b></p> */}
          <div style={{ width: '100%', maxWidth: 420 }}>
            {/* <input
              type="email"
              value={magicEmail}
              onChange={(e) => {
                setMagicEmail(e.target.value);
                setMagicMsg('');
              }}
              placeholder="Email for sign-in link"
              className="login-input"
              style={{ width: '100%', marginBottom: '10px' }}
              autoComplete="email"
            /> */}
            {/* <button
              type="button"
              onClick={onSendMagicLink}
              disabled={magicBusy}
              className="login-btn"
              style={{ width: '100%' }}
            >
              {magicBusy ? 'Sending…' : 'Email me a sign-in link'}
            </button> */}
            {magicMsg ? (
              <div className="error-message" style={{ marginTop: '10px', background: 'transparent' }}>
                {magicMsg}
              </div>
            ) : null}
          </div>
        </div>
        <div className="login-footer">
          <p>Don't have an account? 
            <Link to="/Register">Sign up here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
