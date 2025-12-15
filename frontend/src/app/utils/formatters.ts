import { format as dateFnsFormat, formatDistance, formatRelative, parseISO } from 'date-fns';
import { enUS, de, tr, fr } from 'date-fns/locale';

/**
 * Locale map for date-fns
 */
const localeMap: { [key: string]: Locale } = {
  en: enUS,
  de: de,
  tr: tr,
  fr: fr,
  az: enUS // Fallback to English for Azerbaijani as date-fns doesn't have it
};

/**
 * Get the current locale from localStorage or default
 */
export function getCurrentLocale(): string {
  return localStorage.getItem('preferred_language') || 'en';
}

/**
 * Get date-fns locale object for current language
 */
export function getDateFnsLocale(): Locale {
  const currentLocale = getCurrentLocale();
  return localeMap[currentLocale] || localeMap['en'];
}

/**
 * Format date according to locale
 * @param date - Date to format (Date object, string, or timestamp)
 * @param formatStr - Format string (e.g., 'PPP', 'PPpp', 'dd/MM/yyyy')
 * @returns Formatted date string
 */
export function formatDate(date: Date | string | number, formatStr: string = 'PPP'): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);
    return dateFnsFormat(dateObj, formatStr, { locale: getDateFnsLocale() });
  } catch (error) {
    console.error('Error formatting date:', error);
    return String(date);
  }
}

/**
 * Format date and time according to locale
 * @param date - Date to format
 * @returns Formatted date and time string
 */
export function formatDateTime(date: Date | string | number): string {
  return formatDate(date, 'PPpp');
}

/**
 * Format time only according to locale
 * @param date - Date to format
 * @returns Formatted time string
 */
export function formatTime(date: Date | string | number): string {
  return formatDate(date, 'p');
}

/**
 * Format short date according to locale
 * @param date - Date to format
 * @returns Formatted short date string (e.g., '12/15/2024' or '15.12.2024')
 */
export function formatShortDate(date: Date | string | number): string {
  return formatDate(date, 'P');
}

/**
 * Format relative time (e.g., "2 hours ago", "in 3 days")
 * @param date - Date to compare
 * @param baseDate - Base date to compare against (defaults to now)
 * @returns Relative time string
 */
export function formatRelativeTime(date: Date | string | number, baseDate: Date = new Date()): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);
    return formatDistance(dateObj, baseDate, { 
      addSuffix: true, 
      locale: getDateFnsLocale() 
    });
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return String(date);
  }
}

/**
 * Format date relative to now (e.g., "today at 3:00 PM", "yesterday at 5:30 PM")
 * @param date - Date to format
 * @returns Relative date string
 */
export function formatRelativeDate(date: Date | string | number): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);
    return formatRelative(dateObj, new Date(), { locale: getDateFnsLocale() });
  } catch (error) {
    console.error('Error formatting relative date:', error);
    return String(date);
  }
}

/**
 * Format number according to locale
 * @param value - Number to format
 * @param options - Intl.NumberFormatOptions
 * @returns Formatted number string
 */
export function formatNumber(value: number, options?: Intl.NumberFormatOptions): string {
  try {
    const locale = getCurrentLocale();
    const formatter = new Intl.NumberFormat(locale, options);
    return formatter.format(value);
  } catch (error) {
    console.error('Error formatting number:', error);
    return String(value);
  }
}

/**
 * Format currency according to locale
 * @param value - Amount to format
 * @param currency - Currency code (e.g., 'USD', 'EUR', 'TRY')
 * @returns Formatted currency string
 */
export function formatCurrency(value: number, currency: string = 'USD'): string {
  return formatNumber(value, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

/**
 * Format percentage according to locale
 * @param value - Value to format as percentage (0.15 = 15%)
 * @param decimals - Number of decimal places
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number, decimals: number = 0): string {
  return formatNumber(value, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

/**
 * Format file size in human-readable format
 * @param bytes - File size in bytes
 * @returns Formatted file size string
 */
export function formatFileSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, i);
  return `${formatNumber(value, { maximumFractionDigits: 2 })} ${sizes[i]}`;
}

/**
 * Parse date string to Date object
 * @param dateString - ISO date string
 * @returns Date object
 */
export function parseDate(dateString: string): Date {
  return parseISO(dateString);
}
