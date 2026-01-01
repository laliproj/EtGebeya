import { forwardRef } from 'react';
import { Link } from 'react-router-dom';

/**
 * Reusable Button Component
 */
const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  icon: Icon,
  to,
  className = '',
  disabled,
  ...props
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:shadow-lg hover:shadow-primary-500/25 hover:-translate-y-0.5',
    secondary: 'bg-surface-100 text-surface-900 dark:bg-surface-800 dark:text-white hover:bg-surface-200 dark:hover:bg-surface-700',
    outline: 'border-2 border-surface-200 dark:border-surface-700 text-surface-700 dark:text-surface-300 hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400',
    ghost: 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-white',
    danger: 'bg-danger-500 text-white hover:bg-danger-600 hover:shadow-lg hover:shadow-danger-500/25',
  };

  const sizes = {
    sm: 'text-sm px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-6 py-3 gap-2',
    icon: 'p-2',
  };

  const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`;

  const content = (
    <>
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {!isLoading && Icon && <Icon className={size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} />}
      {children}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes} ref={ref} {...props}>
        {content}
      </Link>
    );
  }

  return (
    <button
      ref={ref}
      className={classes}
      disabled={disabled || isLoading}
      {...props}
    >
      {content}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
