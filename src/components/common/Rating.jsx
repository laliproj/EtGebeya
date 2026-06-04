import { HiStar, HiOutlineStar } from 'react-icons/hi2';

/**
 * Reusable Rating Component - null-safe version
 */
const Rating = ({ value, count, size = 'sm', showValue = false }) => {
  // If count is explicitly 0, the value is effectively 0 for display purposes
  const safeValue = count === 0 ? 0 : (Number(value) || 0);

  const sizes = {
    sm: 'w-3.5 h-3.5',
