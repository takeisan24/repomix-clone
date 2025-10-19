/**
 * Calendar Types
 * TypeScript interfaces for calendar-related data
 */

/**
 * Calendar event types
 */
export type CalendarEventType = 'green' | 'yellow' | 'red'

/**
 * Calendar event interface
 */
export interface CalendarEvent {
  id: string // Unique identifier for each event
  platform: string
  time: string
  status: string
  noteType: CalendarEventType
  content?: string // For checking if content is written
  hasScheduledTime?: boolean // For checking if time is set
  isPublished?: boolean // For published posts
  isFailed?: boolean // For failed posts
  url?: string // URL for published posts (green notes)
}
