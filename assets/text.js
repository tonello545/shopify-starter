
/**
 * Auto-generated wrapper for text section
 * Each instance of the section will have its own class instance
 */
class TextSection {
  constructor(sectionId) {
    this.sectionId = sectionId;
    this.section = document.getElementById(sectionId);
    
    if (!this.section) {
      console.warn('Section not found:', sectionId);
      return;
    }
    
    this.init();
  }
  
  init() {
    // Original section code wrapped in init method
    
  }
  
  // Helper method to find elements within this section instance
  querySelector(selector) {
    return this.section.querySelector(selector);
  }
  
  querySelectorAll(selector) {
    return this.section.querySelectorAll(selector);
  }
  
  // Helper method to add event listeners scoped to this section
  addEventListener(element, event, handler) {
    if (typeof element === 'string') {
      element = this.querySelector(element);
    }
    if (element) {
      element.addEventListener(event, handler);
    }
  }
}

// Make the class available globally
window.TextSection = TextSection;
