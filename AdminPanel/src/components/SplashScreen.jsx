import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard } from 'lucide-react';

const SplashScreen = ({ isVisible, onComplete }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        if (onComplete) onComplete();
      }, 1500); // Fast splash
      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'var(--bg-dark)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: -15 }}
            transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
            style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}
          >
            <div style={{
              width: '54px', height: '54px', borderRadius: '16px',
              background: 'var(--primary)', color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)'
            }}>
              <LayoutDashboard size={28} strokeWidth={2.5} />
            </div>
            <h1 style={{ margin: 0, fontSize: '2.5rem', letterSpacing: '-0.04em', color: 'var(--text-main)' }}>DropAdmin</h1>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;
