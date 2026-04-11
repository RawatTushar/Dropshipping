import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Store } from 'lucide-react';

/**
 * Full-viewport splash after login. Renders via portal above the app shell.
 */
const StoreSplashScreen = ({ visible, durationMs = 1650, onComplete }) => {
  useEffect(() => {
    if (!visible) return undefined;
    const t = window.setTimeout(() => {
      onComplete?.();
    }, durationMs);
    return () => window.clearTimeout(t);
  }, [visible, durationMs, onComplete]);

  if (!visible || typeof document === 'undefined') return null;

  return createPortal(
    <div className="store-splash" role="status" aria-live="polite" aria-label="Loading your store">
      <div className="store-splash__inner">
        <div className="store-splash__mark">
          <Store size={30} strokeWidth={2.25} />
        </div>
        <h2 className="store-splash__title">Welcome</h2>
        <p className="store-splash__sub">Preparing your dashboard…</p>
        <div className="store-splash__bar" aria-hidden>
          <div className="store-splash__bar-fill" />
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default StoreSplashScreen;
