import React from 'react';

const CustomInput = ({
  type = 'text',
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  id,
  maxLength,
  inputMode,
  autoComplete,
}) => {
  return (
    <div className="form-group">
      {label && <label htmlFor={id || name}>{label}</label>}
      <input
        type={type}
        id={id || name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        maxLength={maxLength}
        inputMode={inputMode}
        autoComplete={autoComplete}
      />
    </div>
  );
};

export default CustomInput;
