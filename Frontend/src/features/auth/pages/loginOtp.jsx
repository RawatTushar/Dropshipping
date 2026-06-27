import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { goDashboardAfterAuth } from '../../../utils/goDashboardAfterAuth';
import { useDispatch } from 'react-redux';
import { authAPI } from '../../../api/api';
import { persistUserSession } from '../../../utils/authSession';
import { verifyAuthSession } from '../../../utils/verifyAuthSession';
import { logout, setCredentials } from '../authSlice';
import AuthPageLayout from '../../../components/auth/AuthPageLayout';
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
      const response = await authAPI.verifyOTP({ email, otp });
      const { _id, name, email: accountEmail, isAdmin } = response.data;
      persistUserSession({ _id, name, email: accountEmail, isAdmin });
      dispatch(setCredentials({ _id, name, email: accountEmail, isAdmin }));

      const session = await verifyAuthSession();
      if (!session.ok) {
        dispatch(logout());
        setError(session.message);
        return;
      }

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
    <AuthPageLayout title="Sign in with OTP" subtitle="We will send a one-time code to your email">
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
    </AuthPageLayout>
  );
};

export default LoginOTP;
