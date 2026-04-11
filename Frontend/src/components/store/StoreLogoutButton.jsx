import React from 'react';
import { LogOut } from 'lucide-react';

/** Sidebar logout — same visual weight as admin nav + danger tone. */
const StoreLogoutButton = ({ onClick }) => (
  <button type="button" className="store-logout" onClick={onClick}>
    <LogOut size={20} strokeWidth={2} />
    <span>Log out</span>
  </button>
);

export default StoreLogoutButton;
