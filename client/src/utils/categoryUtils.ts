// categoryUtils.ts

// Category color mapping (shorter names for display)
export const categoryColors: Record<string, string> = {
    "Academic Calendar": "#8B2A2A", // Brown University's color
    "Advising": "#007bff",
    "Arts": "#e83e8c",
    "Athletics": "#28a745",
    "Biology": "#17a2b8",
    "Careers": "#fd7e14",
    "Education": "#6f42c1",
    "Entrepreneurship": "#20c997",
    "Faculty": "#6c757d",
    "Faith": "#ffc107",
    "Government": "#dc3545",
    "Graduate School": "#343a40",
    "Greek Houses": "#7952b3",
    "History": "#ff6b6b",
    "Housing": "#fd7e14",
    "Human Resources": "#6c757d",
    "Humanities": "#4dabf7",
    "Identity": "#cc5de8",
    "International": "#339af0",
    "Libraries": "#20c997",
    "Mathematics": "#845ef7",
    "Philosophy": "#adb5bd",
    "Physical Sciences": "#51cf66",
    "Psychology": "#ff922b",
    "Research": "#a5d8ff",
    "Service": "#69db7c",
    "Social Sciences": "#fcc419",
    "Student Clubs": "#748ffc",
    "Student Publications": "#9775fa",
    "Training": "#5c7cfa",
    "University Services": "#6c757d",
    "default": "#495057",
  };
  
  // Main categories list
  export const CATEGORIES = [
    "Academic Calendar, University Dates & Events",
    "Advising, Mentorship",
    "Arts, Performance",
    "Athletics, Sports, Wellness",
    "Biology, Medicine, Public Health",
    "Careers, Recruiting, Internships",
    "Education, Teaching, Instruction",
    "Entrepreneurship",
    "Faculty Governance",
    "Faith, Spirituality, Worship",
    "Government, Public & International Affairs",
    "Graduate School, Postgraduate Education",
    "Greek & Program Houses",
    "History, Cultural Studies, Languages",
    "Housing, Dining",
    "Human Resources, Benefits",
    "Humanities",
    "Identity, Culture, Inclusion",
    "International, Global Engagement",
    "Libraries",
    "Mathematics, Technology, Engineering",
    "Philosophy, Religious Studies",
    "Physical & Earth Sciences",
    "Psychology & Cognitive Sciences",
    "Research",
    "Service, Engagement, Volunteering",
    "Social Sciences",
    "Student Clubs, Organizations & Activities",
    "Student Publications",
    "Training, Professional Development",
    "University Services & Operations",
  ];
  
  /**
   * Extracts a shorter category name from a full category string
   * @param fullName Full category name (possibly with commas)
   * @returns Short category name (first part before comma)
   */
  export const getShortCategoryName = (fullName: string): string => {
    const parts = fullName.split(",");
    return parts[0].trim();
  };
  
  /**
   * Gets the color associated with a category
   * @param categories Array of category names
   * @returns Color hex code for the category
   */
  export const getCategoryColor = (categories: string[]): string => {
    if (!categories || categories.length === 0) {
      return categoryColors.default;
    }
  
    const shortName = getShortCategoryName(categories[0]);
    return categoryColors[shortName] || categoryColors.default;
  };
  
  /**
   * Formats category names for display
   * @param categories Array of category names
   * @returns Formatted string of categories
   */
  export const formatCategories = (categories: string[]): string => {
    if (!categories || categories.length === 0) {
      return "Uncategorized";
    }
    
    return categories
      .map(cat => getShortCategoryName(cat))
      .join(", ");
  };
  
