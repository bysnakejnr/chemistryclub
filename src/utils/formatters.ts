/**
 * Utility functions for formatting dates and text
 * Centralized to avoid duplication across components
 */

/**
 * Formats a date string consistently across the application
 * Uses UTC methods to prevent timezone shifts
 * @param dateString - ISO date string from Notion API
 * @returns Formatted date string (e.g., "April 1, 2026")
 */
export function formatDate(dateString: string): string {
  if (!dateString) return 'No date'
  try {
    const date = new Date(dateString)
    // Use UTC methods to avoid timezone shifts
    const year = date.getUTCFullYear()
    const month = date.toLocaleDateString(undefined, { month: 'long', timeZone: 'UTC' })
    const day = date.getUTCDate()
    return `${month} ${day}, ${year}`
  } catch {
    return 'Invalid date'
  }
}

/**
 * Formats a date string in short format for cards
 * @param dateString - ISO date string from Notion API
 * @returns Short formatted date (e.g., "Apr 1, 2026")
 */
export function formatDateShort(dateString: string): string {
  if (!dateString) return 'No date'
  try {
    const date = new Date(dateString)
    // Use UTC methods to avoid timezone shifts
    const year = date.getUTCFullYear()
    const month = date.toLocaleDateString(undefined, { month: 'short', timeZone: 'UTC' })
    const day = date.getUTCDate()
    return `${month} ${day}, ${year}`
  } catch {
    return 'Invalid date'
  }
}

/**
 * Creates a summary fallback from details text
 * Used when no explicit summary is provided in Notion
 * @param detailsText - Full details content
 * @param maxLength - Maximum length for summary (default: 150)
 * @returns Truncated summary with ellipsis
 */
export function createSummaryFallback(detailsText: string, maxLength: number = 150): string {
  if (!detailsText) return ''
  return detailsText.length > maxLength 
    ? detailsText.substring(0, maxLength).trim() + '...'
    : detailsText.trim()
}

/**
 * Checks if an image URL is in an unsupported format
 * Currently checks for .heic and .heif formats
 * @param url - Image URL to check
 * @returns True if format is unsupported
 */
export function isUnsupportedImageFormat(url: string): boolean {
  if (!url) return false
  return url.toLowerCase().endsWith('.heic') || url.toLowerCase().endsWith('.heif')
}
