import React from 'react';

const SectionShell = ({ as: Component = 'section', className = '', children, contained = true, ...props }) => (
  <Component className={`ui-section ${className}`.trim()} {...props}>
    {contained ? <div className="ui-section__inner">{children}</div> : children}
  </Component>
);

export default SectionShell;
