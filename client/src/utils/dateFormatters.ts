// dateFormatters.ts

/**
 * Formats an event time string into a full localized date and time
 * @param timeString Time string to format (ISO string or "YYYY-MM-DD HH:MM:SS")
 * @returns Formatted date and time string
 */
export const formatEventTime = (timeString: string): string => {
    try {
      // Try to parse the date - this handles ISO strings and properly formatted date strings
      const date = new Date(timeString);
      
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        // If not valid, try manual parsing for "YYYY-MM-DD HH:MM:SS" format
        const parts = timeString.split(' ');
        if (parts.length === 2) {
          const dateParts = parts[0].split('-');
          const timeParts = parts[1].split(':');
          
          if (dateParts.length === 3 && timeParts.length >= 2) {
            const year = parseInt(dateParts[0]);
            const month = parseInt(dateParts[1]) - 1; // JS months are 0-based
            const day = parseInt(dateParts[2]);
            const hour = parseInt(timeParts[0]);
            const minute = parseInt(timeParts[1]);
            const second = timeParts.length > 2 ? parseInt(timeParts[2]) : 0;
            
            const parsedDate = new Date(year, month, day, hour, minute, second);
            return parsedDate.toLocaleString();
          }
        }
        
        // If we couldn't parse it, return the original string
        return timeString;
      }
      
      // If date is valid, return formatted date
      return date.toLocaleString();
    } catch (e) {
      console.error("Error formatting date:", e);
      return timeString; // Return original on error
    }
  };
  
  /**
   * Formats an event time string into a compact format for display in cards
   * @param timeString Time string to format
   * @returns Compact formatted date and time (e.g., "Jan 15, 2:30 PM")
   */
  export const formatEventTimeCompact = (timeString: string): string => {
    try {
      // Use the same parsing logic as above
      const date = new Date(timeString);
      
      if (isNaN(date.getTime())) {
        // Manual parsing for "YYYY-MM-DD HH:MM:SS" format
        const parts = timeString.split(' ');
        if (parts.length === 2) {
          const dateParts = parts[0].split('-');
          const timeParts = parts[1].split(':');
          
          if (dateParts.length === 3 && timeParts.length >= 2) {
            const year = parseInt(dateParts[0]);
            const month = parseInt(dateParts[1]) - 1; // JS months are 0-based
            const day = parseInt(dateParts[2]);
            const hour = parseInt(timeParts[0]);
            const minute = parseInt(timeParts[1]);
            
            const parsedDate = new Date(year, month, day, hour, minute);
            return parsedDate.toLocaleString(undefined, {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });
          }
        }
        
        return timeString;
      }
      
      // Format with month, day, and time
      return date.toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      console.error("Error formatting compact date:", e);
      return timeString;
    }
  };
  
  /**
   * Determines if a date is today
   * @param dateString Date string to check
   * @returns True if the date is today
   */
  export const isToday = (dateString: string): boolean => {
    const today = new Date();
    const date = new Date(dateString);
    
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };
  
  /**
   * Checks if a date is within the specified time range
   * @param dateString Date string to check
   * @param timeRange Time range identifier (today, tomorrow, this_week, weekend, next_week)
   * @returns True if the date is within the time range
   */
  export const isInTimeRange = (dateString: string, timeRange: string): boolean => {
    if (!dateString || !timeRange) return true;
    
    const date = new Date(dateString);
    const today = new Date();
    
    // Get day of week (0 = Sunday, 6 = Saturday)
    const dayOfWeek = today.getDay();
    
    switch (timeRange) {
      case 'today':
        return isToday(dateString);
        
      case 'tomorrow': {
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);
        return date.getDate() === tomorrow.getDate() &&
               date.getMonth() === tomorrow.getMonth() &&
               date.getFullYear() === tomorrow.getFullYear();
      }
      
      case 'this_week': {
        const startOfWeek = new Date();
        const endOfWeek = new Date();
        
        // Set to start of current week (Sunday)
        startOfWeek.setDate(today.getDate() - dayOfWeek);
        startOfWeek.setHours(0, 0, 0, 0);
        
        // Set to end of current week (Saturday)
        endOfWeek.setDate(today.getDate() + (6 - dayOfWeek));
        endOfWeek.setHours(23, 59, 59, 999);
        
        return date >= startOfWeek && date <= endOfWeek;
      }
      
      case 'weekend': {
        const saturday = new Date();
        const sunday = new Date();
        
        // Calculate next Saturday
        saturday.setDate(today.getDate() + (6 - dayOfWeek));
        saturday.setHours(0, 0, 0, 0);
        
        // Calculate next Sunday
        sunday.setDate(today.getDate() + (7 - dayOfWeek));
        sunday.setHours(23, 59, 59, 999);
        
        return date >= saturday && date <= sunday;
      }
      
      case 'next_week': {
        const startOfNextWeek = new Date();
        const endOfNextWeek = new Date();
        
        // Start of next week (Sunday)
        startOfNextWeek.setDate(today.getDate() + (7 - dayOfWeek));
        startOfNextWeek.setHours(0, 0, 0, 0);
        
        // End of next week (Saturday)
        endOfNextWeek.setDate(today.getDate() + (13 - dayOfWeek));
        endOfNextWeek.setHours(23, 59, 59, 999);
        
        return date >= startOfNextWeek && date <= endOfNextWeek;
      }
      
      default:
        return true;
    }
  };