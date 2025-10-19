/**
 * Main lib barrel export
 * Central export point for all lib modules
 */

// ==========================================
// CONSTANTS
// ==========================================
export * from './constants'

// ==========================================
// TYPES
// ==========================================
export * from './types'

// ==========================================
// UTILS
// ==========================================
export * from './utils'

// NOTE: Explicit exports in utils
export { getDaysInMonth, formatDate, formatTime, formatDateVN } from './utils/date'
export { getPlatformIcon, needsInversion, getPlatformColor } from './utils/platform'
export { saveToLocalStorage, loadFromLocalStorage } from './utils/storage'

// ==========================================
// HELPERS
// ==========================================
export * from './helpers'
