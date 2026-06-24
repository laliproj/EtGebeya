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
