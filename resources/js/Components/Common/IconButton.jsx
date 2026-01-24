import React from 'react';

/**
 * Reusable Icon Button with consistent styling
 * @param {ReactNode} children - Icon component to render
 * @param {Function} onClick - Click handler
 * @param {String} variant - Color variant: 'blue', 'green', 'red', 'yellow', 'gray'
 * @param {String} title - Tooltip text
 * @param {String} className - Additional classes
 * @param {Boolean} disabled - Disabled state
 * @param {String} type - Button type (button, submit, reset)
 */
export default function IconButton({
  children,
  onClick,
  variant = 'blue',
  title,
  className = '',
  disabled = false,
  type = 'button',
  ...props
}) {
  const variants = {
    blue: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50',
    green: 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/50',
    red: 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/50',
    gray: 'bg-gray-50 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900/50',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-2 rounded-lg transition-colors ${variants[variant]} ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
