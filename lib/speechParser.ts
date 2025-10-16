// Intelligent task parsing from natural speech transcription

/**
 * Parses a speech transcript into individual task strings
 * Handles multiple tasks separated by conjunctions or punctuation
 * @param transcript - Raw speech-to-text output
 * @returns Array of individual task strings
 */
 export function parseTasksFromSpeech(transcript: string): string[] {
    if (!transcript || !transcript.trim()) {
      return [];
    }
  
    // Common task action verbs that indicate a new task
    const taskVerbs = [
      'buy', 'call', 'email', 'send', 'write', 'read', 'schedule', 
      'book', 'plan', 'organize', 'finish', 'complete', 'submit',
      'review', 'check', 'update', 'fix', 'create', 'delete',
      'prepare', 'make', 'do', 'get', 'pick', 'drop', 'take',
      'remind', 'contact', 'meet', 'visit', 'pay', 'order'
    ];
  
    // Step 1: Split on strong sentence boundaries (periods, semicolons, exclamation)
    const sentences = transcript
      .split(/[.!;]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);
  
    const tasks: string[] = [];
  
    sentences.forEach(sentence => {
      // Step 2: Check for coordinating conjunctions that might separate tasks
      // Look for patterns like "task1 and task2" where both start with action verbs
      
      // First, try to split on " and " or " also " or " plus " or " then "
      const conjunctionPattern = /\s+(and|also|plus|then)\s+/i;
      const potentialTasks = sentence.split(conjunctionPattern);
      
      // Filter out the conjunctions themselves (every odd index after split)
      const candidateTasks = potentialTasks.filter((_, index) => index % 2 === 0);
  
      if (candidateTasks.length === 1) {
        // No conjunctions found, add as single task
        tasks.push(cleanTask(sentence));
      } else {
        // Multiple potential tasks found via conjunctions
        // Validate each one starts with a task verb or is substantial enough
        candidateTasks.forEach(candidate => {
          const cleaned = cleanTask(candidate);
          if (cleaned && isLikelyTask(cleaned, taskVerbs)) {
            tasks.push(cleaned);
          } else if (tasks.length > 0) {
            // If it doesn't look like a separate task, append to previous
            // (handles cases like "apples and oranges" within a single task)
            tasks[tasks.length - 1] += ' and ' + cleaned;
          } else {
            // First item, add it anyway
            tasks.push(cleaned);
          }
        });
      }
    });
  
    // Step 3: Handle comma-separated lists (but be careful with commas in addresses, etc.)
    const expandedTasks: string[] = [];
    tasks.forEach(task => {
      // Only split on commas if we see multiple verb patterns
      const parts = task.split(',').map(p => p.trim()).filter(p => p.length > 0);
      if (parts.length > 1 && parts.filter(p => isLikelyTask(p, taskVerbs)).length > 1) {
        expandedTasks.push(...parts.map(p => cleanTask(p)));
      } else {
        expandedTasks.push(task);
      }
    });
  
    // Step 4: Final cleaning and deduplication
    return expandedTasks
      .map(t => cleanTask(t))
      .filter((t, index, self) => t.length > 0 && self.indexOf(t) === index);
  }
  
  /**
   * Determines if a text snippet is likely an independent task
   * @param text - Text to evaluate
   * @param taskVerbs - List of common task action verbs
   * @returns true if text starts with a task verb or is substantial enough
   */
  function isLikelyTask(text: string, taskVerbs: string[]): boolean {
    if (!text || text.length < 3) {
      return false;
    }
  
    const words = text.toLowerCase().split(/\s+/);
    const firstWord = words[0];
  
    // Check if starts with a task verb
    if (taskVerbs.includes(firstWord)) {
      return true;
    }
  
    // Check if it's a substantial phrase (more than 2 words usually indicates a task)
    if (words.length >= 3) {
      return true;
    }
  
    // Check for imperative mood indicators (commands without subjects)
    // If no pronoun at start and has a verb, likely a task
    const pronouns = ['i', 'you', 'he', 'she', 'it', 'we', 'they'];
    if (!pronouns.includes(firstWord) && words.length >= 2) {
      return true;
    }
  
    return false;
  }
  
  /**
   * Cleans and normalizes a task string
   * @param task - Raw task text
   * @returns Cleaned task string
   */
  function cleanTask(task: string): string {
    return task
      .trim()
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/^(and|also|plus|then)\s+/i, '') // Remove leading conjunctions
      .replace(/\s+(and|also|plus|then)$/i, '') // Remove trailing conjunctions
      .replace(/^[,;]\s*/, '') // Remove leading punctuation
      .replace(/\s*[,;]$/, '') // Remove trailing punctuation
      .trim()
      // Capitalize first letter
      .replace(/^./, (char) => char.toUpperCase());
  }
  
  /**
   * Extracts potential due dates from task text
   * @param taskText - Task description
   * @returns Date object if date found, null otherwise
   */
  export function extractDueDateFromText(taskText: string): Date | null {
    const today = new Date();
    const text = taskText.toLowerCase();
  
    // Today
    if (text.includes('today')) {
      return today;
    }
  
    // Tomorrow
    if (text.includes('tomorrow')) {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow;
    }
  
    // Next week
    if (text.includes('next week')) {
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      return nextWeek;
    }
  
    // This weekend / weekend
    if (text.includes('weekend') || text.includes('this weekend')) {
      const daysUntilSaturday = (6 - today.getDay() + 7) % 7;
      const saturday = new Date(today);
      saturday.setDate(saturday.getDate() + daysUntilSaturday);
      return saturday;
    }
  
    // Specific weekdays (e.g., "monday", "next friday")
    const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    for (let i = 0; i < weekdays.length; i++) {
      if (text.includes(weekdays[i])) {
        const targetDay = i;
        const currentDay = today.getDay();
        let daysUntil = targetDay - currentDay;
        if (daysUntil <= 0) daysUntil += 7; // Next occurrence
        const targetDate = new Date(today);
        targetDate.setDate(targetDate.getDate() + daysUntil);
        return targetDate;
      }
    }
  
    return null;
  }