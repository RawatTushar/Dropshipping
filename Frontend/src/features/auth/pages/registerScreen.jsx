import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { goDashboardAfterAuth } from '../../../utils/goDashboardAfterAuth';
import { useDispatch } from 'react-redux';
import { authAPI } from '../../../api/api';
import { setCredentials } from '../authSlice';
import { persistUserSession } from '../../../utils/authSession';
import AuthPageLayout from '../../../components/auth/AuthPageLayout';
import '../../../login.css';
import { Link } from 'react-router-dom';
import HideAndShow from '../../../components/hideAndShow';
import SaveButton from '../../../components/saveButton';
import CustomInput from '../../../components/customInput';
import validatePassword from '../../../components/validatePassword';
import PasswordFields from '../../../components/passwordFields';
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
      const { _id, name, email, isAdmin } = response.data;
      await persistUserSession({ _id, name, email, isAdmin });
      dispatch(setCredentials({ _id, name, email, isAdmin }));
      goDashboardAfterAuth(navigate);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPageLayout title="Create account" subtitle="Join to save orders and checkout faster">
      <form className="login-form" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
        {error ? <div className="error-message">{error}</div> : null}

        <CustomInput
          type="text"
          label="Full name"
          name="name"
          id="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Your name"
          required
        />

        <CustomInput
          type="email"
          label="Email address"
          name="email"
          id="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="you@gmail.com"
          required
        />

        <PasswordFields formData={formData} handleChange={handleChange} />

        <SaveButton
          onClick={handleSave}
          disabled={loading}
          loading={loading}
          text="Create account"
          type="submit"
          className="login-btn"
        />
      </form>

      <div className="login-footer">
        <p>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </AuthPageLayout>
  );
};

export default Register;
