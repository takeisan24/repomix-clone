/**
 * Date Utility Functions
 * Pure functions for date calculations and formatting
 */

/**
 * Get the number of days in a specific month
 * @param year - The year
 * @param month - The month (0-11)
 * @returns Number of days in the month
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

/**
 * Format date to Vietnamese locale
 * @param date - Date string or Date object
 * @param locale - Locale string (default: 'vi-VN')
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export function formatDateVN(
  date: string | Date,
  options?: Intl.DateTimeFormatOptions
): string {
  try {
    const d = new Date(date)
    if (isNaN(d.getTime())) {
      return String(date)
    }
    return d.toLocaleDateString('vi-VN', options || {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  } catch {
    return String(date)
  }
}

/**
 * Format date with custom locale and options
 * @param date - Date string or Date object
 * @param locale - Locale string
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export function formatDate(
  date: string | Date,
  locale: string = 'vi-VN',
  options?: Intl.DateTimeFormatOptions
): string {
  try {
    const d = new Date(date)
    if (isNaN(d.getTime())) {
      // If invalid date, try to extract date part from string
      return String(date).split('T')[0] || String(date)
    }
    return d.toLocaleDateString(locale, options || {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  } catch {
    return String(date)
  }
}

/**
 * Format time with custom locale and options
 * @param time - Time string or Date object
 * @param locale - Locale string
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted time string
 */
export function formatTime(
  time: string | Date,
  locale: string = 'vi-VN',
  options?: Intl.DateTimeFormatOptions
): string {
  try {
    const d = new Date(time)
    if (isNaN(d.getTime())) {
      return String(time)
    }
    return d.toLocaleTimeString(locale, options || {
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return String(time)
  }
}

/**
 * Format time to 12-hour format
 * @param time24 - Time in 24-hour format (HH:mm)
 * @returns Time in 12-hour format with AM/PM
 */
export function formatTimeTo12Hour(time24: string): string {
  const [hours, minutes] = time24.split(':').map(Number)
  const period = hours >= 12 ? 'CH' : 'SA'
  const hours12 = hours % 12 || 12
  return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`
}

/**
 * Convert 12-hour format to 24-hour format
 * @param time12 - Time in 12-hour format
 * @returns Time in 24-hour format (HH:mm)
 */
export function convertTo24Hour(time12: string): string {
  const match = time12.match(/(\d+):(\d+)\s*(SA|CH|AM|PM)/i)
  if (!match) return time12

  let [, hours, minutes, period] = match
  let hour = parseInt(hours)

  if ((period === 'CH' || period === 'PM') && hour !== 12) {
    hour += 12
  } else if ((period === 'SA' || period === 'AM') && hour === 12) {
    hour = 0
  }

  return `${hour.toString().padStart(2, '0')}:${minutes}`
}

/**
 * Parse time string to hours and minutes
 * @param timeStr - Time string in HH:mm format
 * @returns Object with hours and minutes
 */
export function parseTime(timeStr: string): { hours: number; minutes: number } {
  const [hours, minutes] = timeStr.split(':').map(Number)
  return { hours, minutes }
}
