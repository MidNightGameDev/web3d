import React from 'react';

/**
 * Reusable neon-glow button.
 * @param {{ variant?: 'primary'|'secondary'|'danger', size?: 'small'|'icon', active?: boolean }} props
 */
export default function NeonButton({
  children,
  variant = 'primary',
  size,
  active,
  className = '',
  ...rest
}) {
  const cls = [
    'neon-btn',
    `neon-btn--${variant}`,
    size === 'small' ? 'neon-btn--small' : '',
    size === 'icon' ? 'neon-btn--icon' : '',
    active ? 'neon-btn--active' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}
