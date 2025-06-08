class GameState {
  constructor() {
    this.currentLocation = TOWN_CENTER;
    this.visitedLocations = new Set();
    this.conversationHistories = new Map();
    this.unlockedAchievements = new Set();
    this.discoveredClues = new Set();
    this.gameProgress = {
      startTime: Date.now(),
      playTime: 0,
      conversationCount: 0,
      locationsVisited: 0,
    };

    // Auto-save every 30 seconds
    this.autoSaveInterval = setInterval(() => {
      this.save();
    }, 30000);
  }

  // Visit a location
  visitLocation(locationKey) {
    const wasNew = !this.visitedLocations.has(locationKey);
    this.visitedLocations.add(locationKey);
    this.currentLocation = locationKey;

    if (wasNew) {
      this.gameProgress.locationsVisited++;
      console.log(`📍 First visit to: ${locationKey}`);
      GameEvents.emit(GAME_EVENTS.LOCATION_CHANGED, {
        location: locationKey,
        isFirstVisit: true,
      });
    } else {
      GameEvents.emit(GAME_EVENTS.LOCATION_CHANGED, {
        location: locationKey,
        isFirstVisit: false,
      });
    }
  }

  // Add conversation to history
  addConversation(characterKey, playerMessage, characterResponse) {
    if (!this.conversationHistories.has(characterKey)) {
      this.conversationHistories.set(characterKey, []);
    }

    const history = this.conversationHistories.get(characterKey);
    history.push({
      timestamp: Date.now(),
      player: playerMessage,
      character: characterResponse,
      location: this.currentLocation,
    });

    this.gameProgress.conversationCount++;

    // Keep only last 20 conversations per character
    if (history.length > 20) {
      history.splice(0, history.length - 20);
    }
  }

  // Get conversation history for character
  getConversationHistory(characterKey) {
    return this.conversationHistories.get(characterKey) || [];
  }

  // Unlock achievement
  unlockAchievement(achievementKey) {
    if (!this.unlockedAchievements.has(achievementKey)) {
      this.unlockedAchievements.add(achievementKey);
      console.log(`🏆 Achievement unlocked: ${achievementKey}`);
      GameEvents.emit(GAME_EVENTS.ACHIEVEMENT_UNLOCKED, achievementKey);
      return true;
    }
    return false;
  }

  // Check if achievement is unlocked
  hasAchievement(achievementKey) {
    return this.unlockedAchievements.has(achievementKey);
  }

  // Add discovered clue
  addClue(clueKey) {
    const wasNew = !this.discoveredClues.has(clueKey);
    this.discoveredClues.add(clueKey);

    if (wasNew) {
      console.log(`🔍 Clue discovered: ${clueKey}`);
    }

    return wasNew;
  }

  // Get game statistics
  getStats() {
    return {
      locationsVisited: this.visitedLocations.size,
      totalLocations: Object.keys(locations).length,
      achievementsUnlocked: this.unlockedAchievements.size,
      totalAchievements: Object.keys(achievements).length,
      conversationCount: this.gameProgress.conversationCount,
      cluesFound: this.discoveredClues.size,
      playTime: this.getPlayTime(),
    };
  }

  // Get play time in minutes
  getPlayTime() {
    const currentSession = Date.now() - this.gameProgress.startTime;
    return Math.round((this.gameProgress.playTime + currentSession) / 60000);
  }

  // Update play time (called from game loop)
  updatePlayTime() {
    // Update play time every minute to avoid constant calculations
    const now = Date.now();
    if (!this.lastPlayTimeUpdate || now - this.lastPlayTimeUpdate > 60000) {
      this.gameProgress.playTime =
        this.gameProgress.playTime + (now - this.gameProgress.startTime);
      this.gameProgress.startTime = now;
      this.lastPlayTimeUpdate = now;
    }
  }

  // Save game state to localStorage
  save() {
    try {
      const saveData = {
        currentLocation: this.currentLocation,
        visitedLocations: Array.from(this.visitedLocations),
        conversationHistories: Object.fromEntries(this.conversationHistories),
        unlockedAchievements: Array.from(this.unlockedAchievements),
        discoveredClues: Array.from(this.discoveredClues),
        gameProgress: {
          ...this.gameProgress,
          playTime:
            this.gameProgress.playTime +
            (Date.now() - this.gameProgress.startTime),
        },
        saveTime: Date.now(),
      };

      localStorage.setItem(CONFIG.SAVE_KEY, JSON.stringify(saveData));
      console.log("💾 Game saved");
      console.log(
        "💾 Saved achievements:",
        Array.from(this.unlockedAchievements)
      );
      GameEvents.emit(GAME_EVENTS.GAME_SAVED);
    } catch (error) {
      console.error("Failed to save game:", error);
    }
  }

  // Load game state from localStorage
  load() {
    try {
      const saveData = localStorage.getItem(CONFIG.SAVE_KEY);
      if (!saveData) {
        console.log("No save data found, starting new game");
        return false;
      }

      const parsed = JSON.parse(saveData);

      this.currentLocation = parsed.currentLocation || TOWN_CENTER;
      this.visitedLocations = new Set(parsed.visitedLocations || []);
      this.conversationHistories = new Map(
        Object.entries(parsed.conversationHistories || {})
      );
      this.unlockedAchievements = new Set(parsed.unlockedAchievements || []);
      this.discoveredClues = new Set(parsed.discoveredClues || []);
      this.gameProgress = {
        ...this.gameProgress,
        ...parsed.gameProgress,
        startTime: Date.now(), // Reset start time for current session
      };

      console.log("📂 Game loaded");
      console.log(
        "📂 Loaded achievements:",
        Array.from(this.unlockedAchievements)
      );

      GameEvents.emit(GAME_EVENTS.GAME_LOADED);
      return true;
    } catch (error) {
      console.error("Failed to load game:", error);
      return false;
    }
  }

  // Reset game state
  reset() {
    this.currentLocation = TOWN_CENTER;
    this.visitedLocations.clear();
    this.conversationHistories.clear();
    this.unlockedAchievements.clear();
    this.discoveredClues.clear();
    this.gameProgress = {
      startTime: Date.now(),
      playTime: 0,
      conversationCount: 0,
      locationsVisited: 0,
    };

    // Clear save data
    localStorage.removeItem(CONFIG.SAVE_KEY);
    console.log("🔄 Game reset");
  }

  // Cleanup when game ends
  destroy() {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }
    this.save(); // Final save
  }
}
