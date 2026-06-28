import Button from './Button';

/**
 * Reusable Empty State Component
 */
const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  actionTo,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center animate-fade-in ${className}`}>
      <div className="w-20 h-20 bg-surface-100 dark:bg-surface-800 rounded-full flex items-center justify-center mb-6">
        {Icon ? (
          <Icon className="w-10 h-10 text-surface-400 dark:text-surface-500" />
        ) : (
          <span className="text-4xl">📭</span>
        )}
      </div>
      
      <h3 className="text-xl font-bold text-surface-900 dark:text-white mb-2">
        {title}
      </h3>
      
      <p className="text-surface-500 max-w-sm mb-8">
        {description}
      </p>

      {actionLabel && (onAction || actionTo) && (
        <Button
          onClick={onAction}
          to={actionTo}
          variant="primary"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
