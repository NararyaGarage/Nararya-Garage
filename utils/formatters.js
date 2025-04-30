/**
 * Formatter Utility
 * 
 * Contains utility functions for formatting various types of data
 * such as dates, times, numbers, and text.
 */

/**
 * Format a duration in seconds to a human-readable string
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration string (e.g., "1h 30m 45s")
 */
function formatDuration(seconds) {
  if (!seconds || isNaN(seconds)) return "0s";
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  let result = "";
  
  if (hours > 0) {
    result += `${hours}h `;
  }
  
  if (minutes > 0 || hours > 0) {
    result += `${minutes}m `;
  }
  
  result += `${remainingSeconds}s`;
  
  return result.trim();
}

/**
 * Format a date string to Indonesia format
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string (e.g., "23 September 2023")
 */
function formatDateIndonesia(date) {
  if (!date) return "";
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const monthsIndonesia = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  
  const day = dateObj.getDate();
  const month = monthsIndonesia[dateObj.getMonth()];
  const year = dateObj.getFullYear();
  
  return `${day} ${month} ${year}`;
}

/**
 * Format a time string to 24h format
 * @param {string} timeStr - Time string to format
 * @returns {string} Formatted time string (e.g., "19:30")
 */
function formatTime(timeStr) {
  if (!timeStr) return "";
  
  // If it's already in the correct format, return as is
  if (/^\d{1,2}:\d{2}$/.test(timeStr)) {
    return timeStr;
  }
  
  try {
    // Create a date object with the time string
    const now = new Date();
    const timeParts = timeStr.split(/[.: ]/);
    
    let hours = parseInt(timeParts[0], 10);
    let minutes = timeParts.length > 1 ? parseInt(timeParts[1], 10) : 0;
    
    // Handle AM/PM
    if (timeStr.toLowerCase().includes('pm') && hours < 12) {
      hours += 12;
    } else if (timeStr.toLowerCase().includes('am') && hours === 12) {
      hours = 0;
    }
    
    // Format the time
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  } catch (error) {
    console.error('Error formatting time:', error);
    return timeStr;
  }
}

/**
 * Convert a string price to a number
 * @param {string} priceStr - Price string (e.g., "Rp 50.000")
 * @returns {number} Numeric price value
 */
function parsePrice(priceStr) {
  if (!priceStr) return 0;
  
  // Remove currency symbol and non-numeric characters
  const numericString = priceStr.replace(/[^\d.,]/g, '');
  
  // Handle different decimal and thousand separators
  const normalizedString = numericString
    .replace(/\./g, '')   // Remove thousand separators
    .replace(/,/g, '.');  // Convert decimal separator to a dot
    
  return parseFloat(normalizedString) || 0;
}

/**
 * Format a number as a currency string
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: 'IDR')
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount, currency = 'IDR') {
  if (amount === undefined || amount === null) return '';
  
  try {
    const formatter = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    });
    
    return formatter.format(amount);
  } catch (error) {
    console.error('Error formatting currency:', error);
    
    // Fallback formatting for IDR
    if (currency === 'IDR') {
      return `Rp ${formatNumber(amount)}`;
    } else {
      return `${currency} ${formatNumber(amount)}`;
    }
  }
}

/**
 * Format a number with thousands separators
 * @param {number} num - Number to format
 * @returns {string} Formatted number string
 */
function formatNumber(num) {
  if (num === undefined || num === null) return '';
  
  try {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  } catch (error) {
    console.error('Error formatting number:', error);
    return num.toString();
  }
}

/**
 * Convert gold/points to IDR estimate
 * @param {number} gold - Gold amount
 * @param {number} conversionRate - Conversion rate (default: 100)
 * @returns {string} Formatted IDR value
 */
function convertGoldToIDR(gold, conversionRate = 100) {
  if (!gold || isNaN(gold)) return 'Rp 0';
  
  const idrValue = gold * conversionRate;
  return formatCurrency(idrValue, 'IDR');
}

/**
 * Calculate percentage
 * @param {number} part - Part value
 * @param {number} total - Total value
 * @returns {string} Formatted percentage
 */
function calculatePercentage(part, total) {
  if (!part || !total || isNaN(part) || isNaN(total)) return '0%';
  
  const percentage = (part / total) * 100;
  return `${percentage.toFixed(1)}%`;
}

/**
 * Truncate text to a maximum length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
function truncateText(text, maxLength = 100) {
  if (!text) return '';
  
  if (text.length <= maxLength) {
    return text;
  }
  
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Clean text for safe display (remove mentions, etc.)
 * @param {string} text - Text to clean
 * @returns {string} Cleaned text
 */
function cleanText(text) {
  if (!text) return '';
  
  // Remove Discord mentions
  return text
    .replace(/<@!?(\d+)>/g, '@user')
    .replace(/<@&(\d+)>/g, '@role')
    .replace(/<#(\d+)>/g, '#channel');
}

/**
 * Get time-appropriate greeting based on current hour
 * @returns {string} Greeting appropriate for the current time
 */
function getTimeGreeting() {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 12) {
    return "Selamat Pagi";
  } else if (hour >= 12 && hour < 15) {
    return "Selamat Siang";
  } else if (hour >= 15 && hour < 18) {
    return "Selamat Sore";
  } else {
    return "Selamat Malam";
  }
}

module.exports = {
  formatDuration,
  formatDateIndonesia,
  formatTime,
  parsePrice,
  formatCurrency,
  formatNumber,
  convertGoldToIDR,
  calculatePercentage,
  truncateText,
  cleanText,
  getTimeGreeting
};