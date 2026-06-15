import React from 'react';

const Card = ({
  as: Component = 'section',
  className = '',
  padded = true,
  interactive = false,
  texture = false,
  children,
  ...props
}) => (
  <Component
    className={[
      'ui-card',
      padded ? 'ui-card--padded' : '',
      interactive ? 'ui-card--interactive' : '',
      texture ? 'ui-card--texture' : '',
      className,
    ].filter(Boolean).join(' ')}
    {...props}
  >
    {children}
  </Component>
);

export default Card;
