/**
 * Format a date string to a more readable format
 * @param dateString ISO date string
 * @returns Formatted date string
 */
export const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
  
    // Get today and tomorrow for comparison
    const today = new Date()
    today.setHours(0, 0, 0, 0)
  
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
  
    // Check if date is today or tomorrow
    if (date.toDateString() === today.toDateString()) {
      return `Today at ${formatTime(date)}`
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow at ${formatTime(date)}`
    } else {
      // Format date as "Mon, Jan 1 at 12:00 PM"
      return `${date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      })} at ${formatTime(date)}`
    }
  }
  
  /**
   * Format a Date object to a time string (12-hour format)
   * @param date Date object
   * @returns Formatted time string (e.g., "12:00 PM")
   */
  export const formatTime = (date: Date): string => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }
  
  /**
   * Check if a date is in the past
   * @param dateString ISO date string
   * @returns Boolean indicating if date is in the past
   */
  export const isDatePast = (dateString: string): boolean => {
    const date = new Date(dateString)
    const now = new Date()
    return date < now
  }
  