import React from 'react';
import HideAndShow from './hideAndShow';

const PasswordFields = ({ formData, handleChange }) => {
  return (
    <>
      <HideAndShow
        name="password"
        value={formData.password}
        onChange={handleChange}
        placeholder="Enter your New password"
        label="New Password"
        isshownalways='false'
      />
      <HideAndShow
        name="confirmPassword"
        value={formData.confirmPassword}
        onChange={handleChange}
        placeholder="Enter your Confirm password"
        label="Confirm Password"
      />
    </>
  );
};

export default PasswordFields;