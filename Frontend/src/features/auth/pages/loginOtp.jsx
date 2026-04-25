import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { goDashboardAfterAuth } from '../../../utils/goDashboardAfterAuth';
import { useDispatch } from 'react-redux';
import { authAPI } from '../../../api/api';
import { setCredentials } from '../authSlice';
import { persistUserSession } from '../../../utils/authSession';
import '../../../login.css';
import SaveButton from '../../../components/saveButton';
import CustomInput from '../../../components/customInput';

const LoginOTP = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [step, setStep] = useState('email'); // 'email' or 'otp'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (error) setError('');
  };

  const handleOtpChange = (e) => {
    setOtp(e.target.value);
    if (error) setError('');
  };

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Call API to send OTP
      await authAPI.sendOTP({ email });
      setOtpSent(true);
      setStep('otp');
      navigate('/EnterOTP', { state: { email } });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Call API to verify OTP
      const response = await authAPI.verifyOTP({ email, otp });
      const { token, _id, name, email: accountEmail, isAdmin } = response.data;
      persistUserSession({ token, _id, name, email: accountEmail, isAdmin });
      dispatch(setCredentials({ token, _id, name, email: accountEmail, isAdmin }));
      goDashboardAfterAuth(navigate);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToEmail = () => {
    setStep('email');
    setOtp('');
    setOtpSent(false);
    setError('');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Login with OTP</h1>
          <p>Sign in using a one-time password</p>
        </div>

        {step === 'email' ? (
          <form onSubmit={handleRequestOTP} className="login-form">
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
              value={email}
              onChange={handleEmailChange}
              placeholder="Enter your email"
              required
            />

            <SaveButton
              onClick={handleRequestOTP}
              disabled={loading}
              loading={loading}
              text="Send OTP"
              type="submit"
              className="login-btn"
            />
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="login-form">
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <div className="otp-info">
              <p>Enter the OTP sent to <strong>{email}</strong></p>
            </div>

            <CustomInput
              type="text"
              label="One-Time Password"
              name="otp"
              id="otp"
              value={otp}
              onChange={handleOtpChange}
              placeholder="Enter 6-digit OTP"
              maxLength="6"
              required
            />

            <SaveButton
              onClick={handleVerifyOTP}
              disabled={loading}
              loading={loading}
              text="Verify OTP"
              type="submit"
              className="login-btn"
            />

            <button
              type="button"
              onClick={handleBackToEmail}
              className="back-btn"
            >
              Change Email
            </button>
          </form>
        )}

        <div className="login-footer">
          <p>Don't have an account?
            <Link to="/register">Sign up here</Link>
          </p>
          <div className="login-method-toggle">
            <span>Prefer password login?</span>
            <Link to="/login">Sign in with password</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginOTP;
