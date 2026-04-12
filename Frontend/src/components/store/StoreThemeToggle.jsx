import React from 'react';
import { Sun, Moon } from 'lucide-react';

/** AdminPanel-style light/dark control (icon buttons in a bordered panel). */
const StoreThemeToggle = ({ theme, onChange }) => (
  <div className="store-theme-panel" role="group" aria-label="Color theme">
    <button
      type="button"
      className={`store-theme-panel__btn${theme === 'light' ? ' is-active' : ''}`}
      onClick={() => onChange('light')}
      title="Light mode"
      aria-pressed={theme === 'light'}
      aria-label="Light mode"
    >
      <Sun size={18} strokeWidth={2} aria-hidden />
    </button>
    <button
      type="button"
      className={`store-theme-panel__btn${theme === 'dark' ? ' is-active' : ''}`}
      onClick={() => onChange('dark')}
      title="Dark mode"
      aria-pressed={theme === 'dark'}
      aria-label="Dark mode"
    >
      <Moon size={18} strokeWidth={2} aria-hidden />
    </button>
  </div>
);

export default StoreThemeToggle;
