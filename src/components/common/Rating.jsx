import { HiStar, HiOutlineStar } from 'react-icons/hi2';

/**
 * Reusable Rating Component - null-safe version
 */
const Rating = ({ value, count, size = 'sm', showValue = false }) => {
  // If count is explicitly 0, the value is effectively 0 for display purposes
  const safeValue = count === 0 ? 0 : (Number(value) || 0);

  const sizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const iconClass = sizes[size];
  const fullStars = Math.floor(safeValue);
  const hasHalfStar = safeValue % 1 >= 0.5;

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center text-warning-500">
        {[...Array(5)].map((_, i) => {
          if (i < fullStars) {
            return <HiStar key={i} className={iconClass} />;
          }
