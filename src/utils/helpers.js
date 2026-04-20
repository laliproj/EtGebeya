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
