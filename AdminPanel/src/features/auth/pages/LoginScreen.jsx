import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminApiErrorMessage, login } from '../../../shared/lib/adminApi';
import { getAdminInfo, isAdminUser, setAdminInfo } from '../../../utils/adminAuth';
import { verifyAdminSession } from '../../../utils/verifyAdminSession';
import { Mail, Lock, LogIn } from 'lucide-react';
import { motion } from 'framer-motion';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const existing = getAdminInfo();
      if (isAdminUser(existing)) {
        navigate('/dashboard', { replace: true });
      }
    } catch {
      localStorage.removeItem('adminInfo');
    }
  }, [navigate]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');

      const data = await login(email, password);

      if (data?.requiresConfirmation) {
        setError('Please confirm your email before logging in.');
        setLoading(false);
        return;
      }

      if (!isAdminUser(data)) {
        setError(
          'Login succeeded but this account is not an admin. On EC2 run: docker compose exec backend node src/scripts/promoteAdmin.js your@email.com',
        );
        setLoading(false);
        return;
      }

      setAdminInfo({
        _id: data._id,
        name: data.name,
        email: data.email,
        isAdmin: true,
      });

      const session = await verifyAdminSession();
      if (!session.ok) {
        setError(session.message);
        setLoading(false);
        return;
      }

      navigate('/dashboard', { replace: true });
      setLoading(false);
    } catch (err) {
      setError(getAdminApiErrorMessage(err, 'Invalid email or password'));
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh', 
      backgroundColor: 'var(--bg-dark)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background soft glow decoration */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '20%',
        width: '400px',
        height: '400px',
        background: 'rgba(99, 102, 241, 0.15)',
        filter: 'blur(100px)',
        borderRadius: '50%',
        pointerEvents: 'none'
      }}></div>
      
      <motion.form 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        onSubmit={submitHandler} 
        style={{ 
          width: '100%',
          maxWidth: '420px', 
          backgroundColor: 'var(--bg-panel)',
          border: '1px solid var(--border-color)',
          borderRadius: '24px',
          padding: '2.5rem',
          boxShadow: 'var(--shadow-md)',
          position: 'relative',
          zIndex: 1
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ 
            width: '48px', height: '48px', borderRadius: '12px', 
            background: 'var(--primary)', color: 'white', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            margin: '0 auto 1rem', boxShadow: '0 8px 16px rgba(99, 102, 241, 0.3)'
          }}>
            <Lock size={24} />
          </div>
          <h2 style={{ fontWeight: 600, fontSize: '1.75rem', letterSpacing: '-0.03em', color: 'var(--text-main)', margin: 0 }}>Admin Access</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.4rem' }}>Enter your credentials to continue</p>
        </div>
        
        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ 
              color: '#fca5a5', backgroundColor: 'rgba(239, 68, 68, 0.1)', 
              border: '1px solid rgba(239, 68, 68, 0.2)',
              padding: '0.8rem', borderRadius: '10px',
              marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.9rem' 
            }}
          >
            {error}
          </motion.div>
        )}
        
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>Email Address</label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
              <Mail size={18} />
            </span>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ 
                width: '100%', padding: '0.85rem 1rem 0.85rem 2.5rem', 
                borderRadius: '10px', border: '1px solid var(--border-color)', 
                backgroundColor: 'var(--bg-dark)', color: 'var(--text-main)', 
                boxSizing: 'border-box', fontSize: '0.95rem'
              }}
              placeholder="admin@example.com"
              required
            />
          </div>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>Password</label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
              <Lock size={18} />
            </span>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ 
                width: '100%', padding: '0.85rem 1rem 0.85rem 2.5rem', 
                borderRadius: '10px', border: '1px solid var(--border-color)', 
                backgroundColor: 'var(--bg-dark)', color: 'var(--text-main)', 
                boxSizing: 'border-box', fontSize: '0.95rem'
              }}
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.85rem' }} disabled={loading}>
          {loading ? 'Authenticating...' : (
            <>
              Login IN <LogIn size={18} style={{ marginLeft: '4px' }} />
            </>
          )}
        </button>
      </motion.form>
    </div>
  );
};

export default LoginScreen;
