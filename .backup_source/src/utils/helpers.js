/**
 * Utility helper functions
 */

/**
 * Format price with currency symbol
 * @param {number} price 
 * @param {string} currency 
 * @returns {string}
 */
export const formatPrice = (price, currency = 'ETB ') => {
  const numPrice = Number(price);
  return `${currency}${numPrice.toLocaleString('en-US')}`;
};

/**
 * Format relative time (e.g., "2 hours ago")
 * @param {string} dateString 
 * @returns {string}
 */
export const timeAgo = (dateString) => {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now - date) / 1000);

  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'week', seconds: 604800 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
    }
  }

  return 'Just now';
};

/**
 * Format date for display
 * @param {string} dateString 
 * @returns {string}
 */
export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Truncate text with ellipsis
 * @param {string} text 
 * @param {number} maxLength 
 * @returns {string}
 */
export const truncateText = (text, maxLength = 100) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Generate initials from name
 * @param {string} name 
 * @returns {string}
 */
export const getInitials = (name) => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

/**
 * Debounce function
 * @param {Function} func 
 * @param {number} wait 
 * @returns {Function}
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Validate email format
 * @param {string} email 
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

/**
 * Validate password strength
 * @param {string} password 
 * @returns {{ valid: boolean, message: string }}
 */
export const validatePassword = (password) => {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  return { valid: true, message: 'Strong password' };
};

/**
 * Get category filter specs based on category type
 * @param {string} category 
 * @returns {Array} Available filter options for the category
 */
export const getCategorySpecs = (category) => {
  const commonSpecs = ['storage', 'ram', 'processor'];
  
  const categorySpecs = {
    phones: [...commonSpecs, 'screenSize', 'camera', 'battery'],
    laptops: [...commonSpecs, 'screenSize', 'camera', 'battery'],
    tablets: [...commonSpecs, 'screenSize', 'camera', 'battery'],
    headphones: ['battery', 'connectivity', 'driver', 'weight'],
    cameras: ['sensor', 'video', 'iso', 'fps', 'weight'],
    accessories: ['capacity', 'output', 'ports', 'weight'],
  };

  return categorySpecs[category] || commonSpecs;
};
