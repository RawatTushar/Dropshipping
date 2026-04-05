import React from 'react';
import '../Login.css'; // Assuming you want to keep this for styling, or change to a general button CSS

const SaveButton = ({
  onClick,
  disabled ,
  loading ,
  text ,
  type ,
  className  // Default class, can be overridden
}) => {
  return (
    <button
      type={type}
      className={className}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? 'Saving...' : text}
    </button>
  );
};

export default SaveButton;