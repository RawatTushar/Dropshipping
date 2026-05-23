import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { authAPI, getApiErrorMessage } from '../../../api/api';
import { setAccessToken } from '../../../utils/authMemory';
import { persistUserSession } from '../../../utils/authSession';
import { verifyAuthSession } from '../../../utils/verifyAuthSession';
import { logout, setCredentials } from '../authSlice';
import '../../../login.css';

const MagicLogin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading'); // loading | success | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const linkToken = searchParams.get('token');
    const email = searchParams.get('email');
    if (!linkToken || !email) {
      setStatus('error');
      setMessage('Invalid sign-in link. Please request a new one.');
      return;
    }

    (async () => {
      try {
        const { data } = await authAPI.verifyMagicLink(email, linkToken);
        const { _id, name, isAdmin, token } = data || {};
        if (token) setAccessToken(token);
        persistUserSession({ _id, name, email, isAdmin });
        dispatch(setCredentials({ _id, name, email, isAdmin }));

        const session = await verifyAuthSession();
        if (!session.ok) {
          dispatch(logout());
          setStatus('error');
          setMessage(session.message);
          return;
        }

        setStatus('success');
        setMessage('Signed in successfully. Redirecting…');
        window.setTimeout(() => navigate('/home', { replace: true }), 600);
      } catch (err) {
        setStatus('error');
        setMessage(getApiErrorMessage(err, 'Sign-in link is invalid or expired.'));
      }
    })();
  }, [dispatch, navigate, searchParams]);

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Email sign-in</h1>
          <p>{status === 'loading' ? 'Verifying your link…' : message}</p>
        </div>

        {status === 'error' ? (
          <div className="login-form" style={{ textAlign: 'center' }}>
            <Link className="login-btn" to="/login">
              Back to login
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default MagicLogin;

