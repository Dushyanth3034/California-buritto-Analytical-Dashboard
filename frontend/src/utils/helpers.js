export const formatCurrency = (value) => {
  if (value === undefined || value === null || isNaN(value)) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(value);
};

export const formatPercentage = (value) => {
  if (value === undefined || value === null || isNaN(value)) return '0.0%';
  const prefix = value > 0 ? '+' : '';
  return `${prefix}${value.toFixed(1)}%`;
};

export const formatLargeNumber = (value) => {
  if (value === undefined || value === null || isNaN(value)) return '0';
  const num = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  
  if (num >= 1.0e9) {
    return sign + (num / 1.0e9).toFixed(1).replace(/\.0$/, '') + 'B';
  }
  if (num >= 1.0e6) {
    return sign + (num / 1.0e6).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1.0e3) {
    return sign + (num / 1.0e3).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return sign + new Intl.NumberFormat('en-US').format(num);
};

export const formatNumber = (value) => {
  if (value === undefined || value === null || isNaN(value)) return '0';
  return new Intl.NumberFormat('en-US').format(value);
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr.replace(/-/g, '/')); // simple replace for browser compatibility with dates
    if (isNaN(date.getTime())) return dateStr;
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  } catch (e) {
    return dateStr;
  }
};
