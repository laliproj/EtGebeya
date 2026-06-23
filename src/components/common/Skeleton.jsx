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

export const ProductCardSkeleton = () => (
  <div className="bg-white dark:bg-surface-800 rounded-2xl p-3 border border-surface-200 dark:border-surface-700">
    <Skeleton className="w-full aspect-[4/3] mb-4" />
    <Skeleton className="w-3/4 h-5 mb-2" />
    <Skeleton className="w-1/2 h-4 mb-4" />
    <div className="flex justify-between items-end">
      <Skeleton className="w-1/3 h-6" />
      <Skeleton className="w-8 h-8 circular" />
    </div>
  </div>
);

export default Skeleton;
