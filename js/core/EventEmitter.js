class EventEmitter {
  constructor() {
    this.listeners = new Map();
  }

  // Add event listener
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }

    this.listeners.get(event).push(callback);

    // Return unsubscribe function
    return () => this.off(event, callback);
  }

  // Remove event listener
  off(event, callback) {
    if (!this.listeners.has(event)) {
      return;
    }

    const callbacks = this.listeners.get(event);
    const index = callbacks.indexOf(callback);

    if (index > -1) {
      callbacks.splice(index, 1);
    }

    // Clean up empty arrays
    if (callbacks.length === 0) {
      this.listeners.delete(event);
    }
  }

  // Add one-time event listener
  once(event, callback) {
    const onceCallback = (...args) => {
      callback(...args);
      this.off(event, onceCallback);
    };

    return this.on(event, onceCallback);
  }

  // Emit event to all listeners
  emit(event, ...args) {
    if (!this.listeners.has(event)) {
      return;
    }

    const callbacks = this.listeners.get(event);

    // Create a copy to avoid issues if listeners modify the array
    [...callbacks].forEach((callback) => {
      try {
        callback(...args);
      } catch (error) {
        console.error(`Error in event listener for '${event}':`, error);
      }
    });
  }

  // Remove all listeners for an event
  removeAllListeners(event) {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }

  // Get listener count for an event
  listenerCount(event) {
    if (!this.listeners.has(event)) {
      return 0;
    }
    return this.listeners.get(event).length;
  }

  // Get all events that have listeners
  eventNames() {
    return Array.from(this.listeners.keys());
  }
}

// Create global event bus
const GameEvents = new EventEmitter();

// Common game events
const GAME_EVENTS = {
  LOCATION_CHANGED: "location_changed",
  CHARACTER_INTERACTION: "character_interaction",
  ITEM_EXAMINED: "item_examined",
  CONVERSATION_STARTED: "conversation_started",
  CONVERSATION_ENDED: "conversation_ended",
  ACHIEVEMENT_UNLOCKED: "achievement_unlocked",
  GAME_SAVED: "game_saved",
  GAME_LOADED: "game_loaded",
  ASSET_LOADED: "asset_loaded",
  ASSET_FAILED: "asset_failed",
};
