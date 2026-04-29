// Utility functions for theme detection

export function isDarkMode(): boolean {
  // Check if the document has a dark theme attribute
  if (typeof document !== 'undefined') {
    return document.documentElement.dataset.theme === 'dark'
  }
  return false
}

export function getThemeAwareDefaultCover(): string {
  // Return the appropriate default cover based on current theme
  return isDarkMode() 
    ? new URL('../assets/default-event-cover-dark.svg', import.meta.url).href
    : new URL('../assets/default-event-cover.svg', import.meta.url).href
}
