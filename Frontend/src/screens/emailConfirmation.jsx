import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { authAPI } from '../api/api';
import '../login.css';

const EmailConfirmation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    const confirmEmail = async () => {
      const token = searchParams.get('token');

      if (!token) {
        setStatus('error');
        setMessage('Invalid confirmation link. No token provided.');
        return;
      }

      try {
        const response = await authAPI.confirmEmail(token);
        setStatus('success');
        setMessage(response.data.message);

        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } catch (error) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Failed to confirm email. The link may be expired.');
      }
    };

    confirmEmail();
  }, [searchParams, navigate]);

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Email Confirmation</h1>
        </div>

        <div className="confirmation-content" style={{ textAlign: 'center', padding: '20px' }}>
          {status === 'loading' && (
            <div>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
              <h3>Confirming your email...</h3>
              <p>Please wait while we verify your email address.</p>
            </div>
          )}

          {status === 'success' && (
            <div>
              <div style={{ fontSize: '48px', marginBottom: '20px', color: '#28a745' }}>✅</div>
              <h3 style={{ color: '#28a745' }}>Email Confirmed!</h3>
              <p>{message}</p>
              <p style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
                You will be redirected to the login page in a few seconds...
              </p>
            </div>
          )}

          {status === 'error' && (
            <div>
              <div style={{ fontSize: '48px', marginBottom: '20px', color: '#dc3545' }}>❌</div>
              <h3 style={{ color: '#dc3545' }}>Confirmation Failed</h3>
              <p>{message}</p>
              <div style={{ marginTop: '20px' }}>
                <button
                  onClick={() => navigate('/login')}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  Go to Login
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailConfirmation;