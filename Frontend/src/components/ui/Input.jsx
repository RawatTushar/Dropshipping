import React from 'react';

const Input = React.forwardRef(({ label, helperText, error, className = '', ...props }, ref) => (
  <label className={`ui-input ${className}`.trim()}>
    {label ? <span className="ui-input__label">{label}</span> : null}
    <input
      ref={ref}
      className="ui-input__field"
      aria-invalid={error ? 'true' : undefined}
      {...props}
    />
    {error ? <span className="ui-input__message ui-input__message--error">{error}</span> : null}
    {!error && helperText ? <span className="ui-input__message">{helperText}</span> : null}
  </label>
));

Input.displayName = 'Input';
export default Input;
