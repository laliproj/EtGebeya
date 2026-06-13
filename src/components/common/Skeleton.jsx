/**
 * Reusable Skeleton loader component
 */
const Skeleton = ({ className = '', variant = 'rectangular' }) => {
  const variants = {
    rectangular: 'rounded-xl',
    circular: 'rounded-full',
    text: 'rounded',
  };

  return (
    <div className={`skeleton ${variants[variant]} ${className}`} />
  );
};
