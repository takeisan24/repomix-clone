/**
 * LocalStorage Utility Functions
 * Handles saving and loading data with error handling
 */

/**
 * Save data to localStorage with error handling
 * @param key - The localStorage key
 * @param data - The data to save (will be JSON stringified)
 * @returns True if successful, false otherwise
 */
export function saveToLocalStorage(key: string, data: any): boolean {
  try {
    if (typeof window === 'undefined') return false
    localStorage.setItem(key, JSON.stringify(data))
    return true
  } catch (error) {
    console.error('Error saving to localStorage:', error)
    return false
  }
}

/**
 * Load data from localStorage with error handling
 * @param key - The localStorage key
 * @param defaultValue - Default value to return if key doesn't exist or parsing fails
 * @returns The parsed data or default value
 */
export function loadFromLocalStorage<T = any>(key: string, defaultValue: T): T {
  try {
    if (typeof window === 'undefined') return defaultValue
    const saved = localStorage.getItem(key)
    return saved ? JSON.parse(saved) : defaultValue
  } catch (error) {
    console.error('Error loading from localStorage:', error)
    return defaultValue
  }
}

/**
 * Remove item from localStorage
 * @param key - The localStorage key
 * @returns True if successful, false otherwise
 */
export function removeFromLocalStorage(key: string): boolean {
  try {
    if (typeof window === 'undefined') return false
    localStorage.removeItem(key)
    return true
  } catch (error) {
    console.error('Error removing from localStorage:', error)
    return false
  }
}

/**
 * Clear all localStorage
 * @returns True if successful, false otherwise
 */
export function clearLocalStorage(): boolean {
  try {
    if (typeof window === 'undefined') return false
    localStorage.clear()
    return true
  } catch (error) {
    console.error('Error clearing localStorage:', error)
    return false
  }
}

/**
 * Check if key exists in localStorage
 * @param key - The localStorage key
 * @returns True if key exists
 */
export function hasLocalStorageKey(key: string): boolean {
  try {
    if (typeof window === 'undefined') return false
    return localStorage.getItem(key) !== null
  } catch (error) {
    console.error('Error checking localStorage key:', error)
    return false
  }
}

/**
 * Get all localStorage keys
 * @returns Array of all keys
 */
export function getAllLocalStorageKeys(): string[] {
  try {
    if (typeof window === 'undefined') return []
    return Object.keys(localStorage)
  } catch (error) {
    console.error('Error getting localStorage keys:', error)
    return []
  }
}

/**
 * Get localStorage size in bytes
 * @returns Size in bytes
 */
export function getLocalStorageSize(): number {
  try {
    if (typeof window === 'undefined') return 0
    let total = 0
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length
      }
    }
    return total
  } catch (error) {
    console.error('Error getting localStorage size:', error)
    return 0
  }
}
