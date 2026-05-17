import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { goDashboardAfterAuth } from '../../../utils/goDashboardAfterAuth';
import { useDispatch } from 'react-redux';
import { authAPI, getApiErrorMessage } from '../../../api/api';
import { persistUserSession } from '../../../utils/authSession';
import { setCredentials } from '../authSlice';
import '../../../login.css';
import SaveButton from '../../../components/saveButton';
import CustomInput from '../../../components/customInput';

const EnterOTP = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const emailFromState = location.state?.email;

  const [email, setEmail] = useState(emailFromState || '');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (emailFromState) {
      setEmail(emailFromState);
      setError('');
    } else {
      setError('Start from the OTP login screen to receive a code.');
    }
  }, [emailFromState]);

  const handleOtpChange = (e) => {
    const v = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(v);
    if (error) setError('');
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Email is missing. Go back and request a new OTP.');
      return;
    }
    if (otp.length !== 6) {
      setError('Enter the 6-digit code from your email.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await authAPI.verifyOTP({ email: email.trim(), otp });
      const { _id, name, email: accountEmail, isAdmin } = response.data;
      await persistUserSession({ _id, name, email: accountEmail, isAdmin });
      dispatch(setCredentials({ _id, name, email: accountEmail, isAdmin }));
      goDashboardAfterAuth(navigate);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Invalid OTP. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Enter OTP</h1>
          <p>
            Code sent to{' '}
            <strong>{email || 'your email'}</strong>
          </p>
        </div>

        <form onSubmit={handleVerifyOTP} className="login-form">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <CustomInput
            type="text"
            inputMode="numeric"
            label="One-time code"
            name="otp"
            id="otp"
            value={otp}
            onChange={handleOtpChange}
            placeholder="6-digit code"
            maxLength={6}
            required
            autoComplete="one-time-code"
          />

          <SaveButton
            onClick={handleVerifyOTP}
            disabled={loading}
            loading={loading}
            text="Verify & sign in"
            type="submit"
            className="login-btn"
          />

          <p style={{ textAlign: 'center', marginTop: '1rem' }}>
            <Link to="/login-otp">Resend OTP / change email</Link>
          </p>
        </form>

        <div className="login-footer">
          <Link to="/login">Sign in with password</Link>
        </div>
      </div>
    </div>
  );
};

export default EnterOTP;
