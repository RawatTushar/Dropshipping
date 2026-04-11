import React from 'react';
import { Sun, Moon } from 'lucide-react';

/** AdminPanel-style light/dark control (icon buttons in a bordered panel). */
const StoreThemeToggle = ({ theme, onChange }) => (
  <div className="store-theme-panel">
    <button
      type="button"
      className={`store-theme-panel__btn${theme === 'light' ? ' is-active' : ''}`}
      onClick={() => onChange('light')}
      title="Light mode"
    >
      <Sun size={18} strokeWidth={2} />
    </button>
    <button
      type="button"
      className={`store-theme-panel__btn${theme === 'dark' ? ' is-active' : ''}`}
      onClick={() => onChange('dark')}
      title="Dark mode"
    >
      <Moon size={18} strokeWidth={2} />
    </button>
  </div>
);

export default StoreThemeToggle;
