// Utility helper functions for Albino Tomato Town

class Utils {
  // Generate unique ID
  static generateId() {
    return "id_" + Math.random().toString(36).substr(2, 9) + "_" + Date.now();
  }

  // Deep clone an object
  static deepClone(obj) {
    if (obj === null || typeof obj !== "object") {
      return obj;
    }

    if (obj instanceof Date) {
      return new Date(obj.getTime());
    }

    if (obj instanceof Array) {
      return obj.map((item) => Utils.deepClone(item));
    }

    if (typeof obj === "object") {
      const cloned = {};
      for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
          cloned[key] = Utils.deepClone(obj[key]);
        }
      }
      return cloned;
    }
  }

  // Debounce function calls
  static debounce(func, delay) {
    let timeoutId;
    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  }

  // Throttle function calls
  static throttle(func, limit) {
    let inThrottle;
    return function (...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  // Sanitize user input
  static sanitizeInput(input) {
    if (typeof input !== "string") {
      return "";
    }

    return input
      .trim()
      .replace(/[<>]/g, "") // Remove potential HTML tags
      .substring(0, 500); // Limit length
  }

  // Format time duration
  static formatDuration(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  // Random choice from array
  static randomChoice(array) {
    if (!Array.isArray(array) || array.length === 0) {
      return null;
    }
    return array[Math.floor(Math.random() * array.length)];
  }

  // Shuffle array
  static shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Check if point is inside rectangle
  static isPointInRect(point, rect) {
    return (
      point.x >= rect.x &&
      point.x <= rect.x + rect.width &&
      point.y >= rect.y &&
      point.y <= rect.y + rect.height
    );
  }

  // Calculate distance between two points
  static distance(point1, point2) {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // Lerp (linear interpolation)
  static lerp(start, end, factor) {
    return start + (end - start) * factor;
  }

  // Clamp value between min and max
  static clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  // Convert snake_case to Title Case
  static toTitleCase(str) {
    return str
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  // Check if string contains any of the keywords
  static containsKeywords(text, keywords) {
    const lowerText = text.toLowerCase();
    return keywords.some((keyword) =>
      lowerText.includes(keyword.toLowerCase())
    );
  }

  // Wait for specified time
  static async wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Simple template string replacement
  static template(str, vars) {
    return str.replace(/\{(\w+)\}/g, (match, key) => {
      return vars.hasOwnProperty(key) ? vars[key] : match;
    });
  }

  // Check if device is mobile
  static isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  }

  // Check if device supports touch
  static isTouchDevice() {
    return "ontouchstart" in window || navigator.maxTouchPoints > 0;
  }

  // Get random integer between min and max (inclusive)
  static randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Get random float between min and max
  static randomFloat(min, max) {
    return Math.random() * (max - min) + min;
  }

  // Check if two arrays are equal
  static arraysEqual(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;

    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }

  // Remove duplicates from array
  static unique(array) {
    return [...new Set(array)];
  }

  // Group array by key
  static groupBy(array, key) {
    return array.reduce((groups, item) => {
      const group = item[key];
      groups[group] = groups[group] || [];
      groups[group].push(item);
      return groups;
    }, {});
  }
}

// Achievement helper functions
class AchievementUtils {
  // Check if message contains achievement triggers
  static checkTriggers(message, achievement) {
    if (
      !achievement.triggerKeywords ||
      achievement.triggerKeywords.length === 0
    ) {
      return false;
    }

    return Utils.containsKeywords(message, achievement.triggerKeywords);
  }

  // Calculate achievement completion percentage
  static getCompletionPercentage() {
    const totalAchievements = Object.keys(achievements).length;
    const unlockedCount = Object.values(achievements).filter(
      (a) => a.isUnlocked
    ).length;
    return totalAchievements > 0
      ? Math.round((unlockedCount / totalAchievements) * 100)
      : 0;
  }

  // Get achievements by category or status
  static filterAchievements(filter = "all") {
    const allAchievements = Object.entries(achievements);

    switch (filter) {
      case "unlocked":
        return allAchievements.filter(
          ([id, achievement]) => achievement.isUnlocked
        );
      case "locked":
        return allAchievements.filter(
          ([id, achievement]) => !achievement.isUnlocked
        );
      case "character":
        return allAchievements.filter(
          ([id, achievement]) => achievement.characterId
        );
      default:
        return allAchievements;
    }
  }
}

// Location helper functions
class LocationUtils {
  // Get all characters in a location
  static getCharactersInLocation(locationKey) {
    const location = locations[locationKey];
    if (!location) return [];

    return location.characters
      .map((charKey) => ({
        key: charKey,
        data: characters[charKey],
      }))
      .filter((char) => char.data);
  }

  // Get all items in a location
  static getItemsInLocation(locationKey) {
    const location = locations[locationKey];
    if (!location) return [];

    return location.items
      .map((itemKey) => ({
        key: itemKey,
        data: items[itemKey],
      }))
      .filter((item) => item.data);
  }

  // Get connected locations
  static getConnectedLocations(locationKey) {
    const location = locations[locationKey];
    if (!location) return [];

    return location.locations
      .map((locKey) => ({
        key: locKey,
        data: locations[locKey],
        name: Utils.toTitleCase(locKey),
      }))
      .filter((loc) => loc.data);
  }

  // Check if location has been visited
  static hasBeenVisited(locationKey, gameState) {
    return gameState.visitedLocations.has(locationKey);
  }

  // Get location exploration percentage
  static getExplorationPercentage(gameState) {
    const totalLocations = Object.keys(locations).length;
    const visitedCount = gameState.visitedLocations.size;
    return totalLocations > 0
      ? Math.round((visitedCount / totalLocations) * 100)
      : 0;
  }
}

// Conversation helper functions
class ConversationUtils {
  // Get conversation stats for a character
  static getCharacterStats(characterKey, gameState) {
    const history = gameState.getConversationHistory(characterKey);
    return {
      messageCount: history.length,
      firstContact: history.length > 0 ? history[0].timestamp : null,
      lastContact:
        history.length > 0 ? history[history.length - 1].timestamp : null,
      averageLength:
        history.length > 0
          ? history.reduce((sum, msg) => sum + msg.player.length, 0) /
            history.length
          : 0,
    };
  }

  // Get most talkative characters
  static getMostTalkativeCharacters(gameState) {
    const characterStats = Object.keys(characters).map((charKey) => ({
      key: charKey,
      name: Utils.toTitleCase(charKey),
      ...ConversationUtils.getCharacterStats(charKey, gameState),
    }));

    return characterStats.sort((a, b) => b.messageCount - a.messageCount);
  }

  // Extract keywords from conversation history
  static extractKeywords(history) {
    const commonWords = [
      "the",
      "and",
      "or",
      "but",
      "in",
      "on",
      "at",
      "to",
      "for",
      "of",
      "with",
      "by",
      "a",
      "an",
      "is",
      "are",
      "was",
      "were",
      "be",
      "been",
      "have",
      "has",
      "had",
      "will",
      "would",
      "could",
      "should",
      "i",
      "you",
      "he",
      "she",
      "it",
      "we",
      "they",
      "me",
      "him",
      "her",
      "us",
      "them",
    ];

    const allWords = history
      .map((msg) => msg.player.toLowerCase())
      .join(" ")
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter((word) => word.length > 3 && !commonWords.includes(word));

    // Count word frequency
    const wordCount = {};
    allWords.forEach((word) => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });

    // Return top 10 most frequent words
    return Object.entries(wordCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
  }
}

// Game data validation helpers
class ValidationUtils {
  // Validate location data structure
  static validateLocation(locationKey, locationData) {
    const errors = [];

    if (!locationData.description) {
      errors.push(`Location ${locationKey}: Missing description`);
    }

    if (!Array.isArray(locationData.characters)) {
      errors.push(`Location ${locationKey}: characters must be an array`);
    }

    if (!Array.isArray(locationData.items)) {
      errors.push(`Location ${locationKey}: items must be an array`);
    }

    if (!Array.isArray(locationData.locations)) {
      errors.push(`Location ${locationKey}: locations must be an array`);
    }

    if (!locationData.background) {
      errors.push(`Location ${locationKey}: Missing background`);
    }

    return errors;
  }

  // Validate character data structure
  static validateCharacter(characterKey, characterData) {
    const errors = [];

    if (!characterData.prompt) {
      errors.push(`Character ${characterKey}: Missing prompt`);
    }

    if (!characterData.description) {
      errors.push(`Character ${characterKey}: Missing description`);
    }

    if (typeof characterData.X !== "number") {
      errors.push(`Character ${characterKey}: X position must be a number`);
    }

    if (typeof characterData.Y !== "number") {
      errors.push(`Character ${characterKey}: Y position must be a number`);
    }

    if (!characterData.img) {
      errors.push(`Character ${characterKey}: Missing img`);
    }

    return errors;
  }

  // Validate item data structure
  static validateItem(itemKey, itemData) {
    const errors = [];

    if (!itemData.description) {
      errors.push(`Item ${itemKey}: Missing description`);
    }

    if (typeof itemData.X !== "number") {
      errors.push(`Item ${itemKey}: X position must be a number`);
    }

    if (typeof itemData.Y !== "number") {
      errors.push(`Item ${itemKey}: Y position must be a number`);
    }

    if (!itemData.img) {
      errors.push(`Item ${itemKey}: Missing img`);
    }

    return errors;
  }

  // Validate achievement data structure
  static validateAchievement(achievementKey, achievementData) {
    const errors = [];

    if (!achievementData.title) {
      errors.push(`Achievement ${achievementKey}: Missing title`);
    }

    if (!achievementData.description) {
      errors.push(`Achievement ${achievementKey}: Missing description`);
    }

    if (!achievementData.characterId) {
      errors.push(`Achievement ${achievementKey}: Missing characterId`);
    }

    if (!Array.isArray(achievementData.triggerKeywords)) {
      errors.push(
        `Achievement ${achievementKey}: triggerKeywords must be an array`
      );
    }

    return errors;
  }

  // Validate all game data
  static validateAllData() {
    const allErrors = [];

    // Validate locations
    Object.entries(locations).forEach(([key, data]) => {
      allErrors.push(...ValidationUtils.validateLocation(key, data));
    });

    // Validate characters
    Object.entries(characters).forEach(([key, data]) => {
      allErrors.push(...ValidationUtils.validateCharacter(key, data));
    });

    // Validate items
    Object.entries(items).forEach(([key, data]) => {
      allErrors.push(...ValidationUtils.validateItem(key, data));
    });

    // Validate achievements
    Object.entries(achievements).forEach(([key, data]) => {
      allErrors.push(...ValidationUtils.validateAchievement(key, data));
    });

    // Check for broken references
    Object.entries(locations).forEach(([locationKey, locationData]) => {
      locationData.characters.forEach((charKey) => {
        if (!characters[charKey]) {
          allErrors.push(
            `Location ${locationKey}: References unknown character ${charKey}`
          );
        }
      });

      locationData.items.forEach((itemKey) => {
        if (!items[itemKey]) {
          allErrors.push(
            `Location ${locationKey}: References unknown item ${itemKey}`
          );
        }
      });

      locationData.locations.forEach((locKey) => {
        if (!locations[locKey]) {
          allErrors.push(
            `Location ${locationKey}: References unknown location ${locKey}`
          );
        }
      });
    });

    return allErrors;
  }
}

// Performance monitoring helpers
class PerformanceUtils {
  static measureTime(name, fn) {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    console.log(`${name} took ${(end - start).toFixed(2)}ms`);
    return result;
  }

  static async measureTimeAsync(name, fn) {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    console.log(`${name} took ${(end - start).toFixed(2)}ms`);
    return result;
  }

  static getMemoryUsage() {
    if (performance.memory) {
      return {
        used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024),
      };
    }
    return null;
  }
}

// Debug helpers
class DebugUtils {
  static logGameState(gameState) {
    console.group("🎮 Game State Debug");
    console.log("Current Location:", gameState.currentLocation);
    console.log("Visited Locations:", Array.from(gameState.visitedLocations));
    console.log(
      "Unlocked Achievements:",
      Array.from(gameState.unlockedAchievements)
    );
    console.log("Game Stats:", gameState.getStats());
    console.groupEnd();
  }

  static logAssetStats(assetManager) {
    console.group("📦 Asset Manager Debug");
    console.log("Stats:", assetManager.getStats());
    console.log("Loaded Assets:", Array.from(assetManager.loadedAssets));
    console.log("Failed Assets:", Array.from(assetManager.failedAssets));
    console.groupEnd();
  }

  static logValidationErrors() {
    const errors = ValidationUtils.validateAllData();
    if (errors.length > 0) {
      console.group("❌ Data Validation Errors");
      errors.forEach((error) => console.error(error));
      console.groupEnd();
    } else {
      console.log("✅ All game data is valid");
    }
  }

  static enableDebugMode() {
    window.DEBUG_MODE = true;
    window.gameDebug = {
      utils: Utils,
      achievement: AchievementUtils,
      location: LocationUtils,
      conversation: ConversationUtils,
      validation: ValidationUtils,
      performance: PerformanceUtils,
      debug: DebugUtils,
    };
    console.log("🔧 Debug mode enabled. Access via window.gameDebug");
  }
}

// Initialize debug mode if CONFIG.DEBUG is true
if (typeof CONFIG !== "undefined" && CONFIG.DEBUG) {
  DebugUtils.enableDebugMode();
}
