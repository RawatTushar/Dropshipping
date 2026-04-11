import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { goDashboardAfterAuth } from '../utils/goDashboardAfterAuth';
import { useDispatch } from 'react-redux';
import { authAPI } from '../api/api';
import { setCredentials } from '../features/auth/authSlice';
import { persistUserSession } from '../utils/authSession';
import '../login.css';
// import '../screens/login.css';
import HideAndShow from '../components/hideAndShow';
import SaveButton from '../components/saveButton';
import CustomInput from '../components/customInput';
import validatePassword from '../components/validatePassword';
import PasswordFields from '../components/passwordFields';
const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const validateEmail = (email) => {
    return email.endsWith('@gmail.com');
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');

    // Validate email address
    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address (must be @gmail.com)');
      setLoading(false);
      return;
    }

    // Validate password policy via helper
    if (!validatePassword(formData, setError, setLoading)) {
      return;
    }

    // Confirm password match
    if (formData.password !== formData.confirmPassword) {
      setError('Confirm password does not match new password. Try again');
      setLoading(false);
      return;
    }

    try {
      const response = await authAPI.register(formData);
      
      // Check if registration requires email confirmation
      if (response.data.requiresConfirmation) {
        // Redirect to waiting/confirmation screen
        navigate('/confirmation-pending', { state: { email: formData.email } });
        return;
      }

      // Fallback for direct registration (if email confirmation is disabled)
      const { token, _id, name, email, isAdmin } = response.data;
      persistUserSession({ token, _id, name, email, isAdmin });
      dispatch(setCredentials({ token, _id, name, email, isAdmin }));
      goDashboardAfterAuth(navigate);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Create Account</h1>
          <p>Please fill in your details to register</p>
        </div>

        <form className="login-form" onSubmit={(e) => { e.preventDefault(); handleSave(); }} >
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <CustomInput
            type="text"
            label="Full Name"
            name="name"
            id="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your full name"
            required
          />

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

          <PasswordFields formData={formData} handleChange={handleChange} />

          <SaveButton onClick={handleSave} disabled={loading} loading={loading} text="Register" type="submit" className="login-btn"/>
        </form>

        <div className="login-footer">
          <p>Already have an account? <a href="/login">Sign in here</a></p>
        </div>
      </div>
    </div>
  );
};

export default Register;
