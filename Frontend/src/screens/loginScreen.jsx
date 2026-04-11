import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { authAPI } from '../api/api';
import { persistUserSession } from '../utils/authSession';
import { setCredentials } from '../features/auth/authSlice';
import '../login.css';
import { Link } from 'react-router-dom';
import HideAndShow from '../components/hideAndShow';
import SaveButton from '../components/saveButton';
import CustomInput from '../components/customInput';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/home');
    }
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
      persistUserSession({ token, _id, name, email, isAdmin });
      dispatch(setCredentials({ token, _id, name, email, isAdmin }));
      navigate('/home');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
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
