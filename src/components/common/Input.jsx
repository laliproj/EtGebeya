import { forwardRef } from 'react';

/**
 * Reusable Input Component
 */
const Input = forwardRef(({
  label,
  error,
  icon: Icon,
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-surface-400" />
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full bg-surface-50 dark:bg-surface-800/50 
            border text-sm rounded-xl px-4 py-2.5 
            text-surface-900 dark:text-white 
            placeholder:text-surface-400 
            focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500
            transition-all duration-200
            ${Icon ? 'pl-10' : ''}
            ${error 
              ? 'border-danger-500 focus:ring-danger-500/30 focus:border-danger-500' 
              : 'border-surface-200 dark:border-surface-700 hover:border-surface-300 dark:hover:border-surface-600'
            }
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-danger-500 animate-fade-in">
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
