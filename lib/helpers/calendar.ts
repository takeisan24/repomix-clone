/**
 * Calendar Helper Functions
 * Business logic for calendar operations
 */

import { CalendarEvent } from '../types/calendar'

/**
 * Get calendar events for a specific day
 * @param year - The year
 * @param month - The month (0-11)
 * @param day - The day
 * @param calendarEvents - The calendar events object
 * @returns Array of events for the day
 */
export function getCalendarEventsForDay(
  year: number,
  month: number,
  day: number,
  calendarEvents: Record<string, CalendarEvent[]>
): CalendarEvent[] {
  // Use year-month-day as unique key to avoid cross-month collisions
  const key = `${year}-${month}-${day}`
  return calendarEvents[key] || []
}

/**
 * Add event to calendar
 * @param year - The year
 * @param month - The month (0-11)
 * @param day - The day
 * @param event - The event to add
 * @param calendarEvents - The calendar events object
 * @returns Updated calendar events object
 */
export function addCalendarEvent(
  year: number,
  month: number,
  day: number,
  event: CalendarEvent,
  calendarEvents: Record<string, CalendarEvent[]>
): Record<string, CalendarEvent[]> {
  const key = `${year}-${month}-${day}`
  const updatedEvents = { ...calendarEvents }
  
  if (!updatedEvents[key]) {
    updatedEvents[key] = []
  }
  
  updatedEvents[key] = [...updatedEvents[key], event]
  return updatedEvents
}

/**
 * Remove event from calendar
 * @param year - The year
 * @param month - The month (0-11)
 * @param day - The day
 * @param eventId - The event ID to remove
 * @param calendarEvents - The calendar events object
 * @returns Updated calendar events object
 */
export function removeCalendarEvent(
  year: number,
  month: number,
  day: number,
  eventId: string,
  calendarEvents: Record<string, CalendarEvent[]>
): Record<string, CalendarEvent[]> {
  const key = `${year}-${month}-${day}`
  const updatedEvents = { ...calendarEvents }
  
  if (updatedEvents[key]) {
    updatedEvents[key] = updatedEvents[key].filter(event => event.id !== eventId)
    
    // Remove empty day entries
    if (updatedEvents[key].length === 0) {
      delete updatedEvents[key]
    }
  }
  
  return updatedEvents
}
