import React from 'react';

const Button = ({
  as: Component = 'button',
  type = 'button',
  variant = 'primary',
  size = 'md',
  className = '',
  isLoading = false,
  children,
  ...props
}) => {
  const buttonProps = Component === 'button' ? { type, disabled: isLoading || props.disabled } : {};

  return (
    <Component
      className={`ui-btn ui-btn--${variant} ui-btn--${size} ${className}`.trim()}
      aria-busy={isLoading || undefined}
      {...props}
      {...buttonProps}
    >
      {children}
    </Component>
  );
};

export default Button;
