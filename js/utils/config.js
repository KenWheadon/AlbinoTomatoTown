// js/utils/Config.js - Environment-aware configuration
const CONFIG = {
  GAME_WIDTH: 800,
  GAME_HEIGHT: 600,

  // Detect if we're in development (localhost) or production
  IS_DEVELOPMENT:
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname.includes("localhost"),

  // AI Configuration - Use different endpoints for dev vs production
  get AI_API_URL() {
    if (this.IS_DEVELOPMENT) {
      // In development, you can use OpenRouter directly
      return "https://openrouter.ai/api/v1/chat/completions";
    } else {
      // In production, use your Vercel API endpoint
      return "/api/chat";
    }
  },

  // API Key - loaded from local.config.js in development, handled server-side in production
  get OPENROUTER_API_KEY() {
    if (this.IS_DEVELOPMENT) {
      // Check if local config has been loaded
      if (
        typeof LOCAL_CONFIG !== "undefined" &&
        LOCAL_CONFIG.OPENROUTER_API_KEY
      ) {
        return LOCAL_CONFIG.OPENROUTER_API_KEY;
      } else {
        console.warn(
          "⚠️ LOCAL_CONFIG not found or missing API key. Create js/utils/local.config.js with your API key."
        );
        return null;
      }
    } else {
      // In production, the API key is handled server-side, so return null
      return null;
    }
  },

  // Site configuration
  get SITE_URL() {
    if (this.IS_DEVELOPMENT) {
      return "http://localhost:3000";
    } else {
      return window.location.origin; // Use current domain in production
    }
  },

  SITE_TITLE: "Albino Tomato Town",
  MODEL: "deepseek/deepseek-r1-0528-qwen3-8b:free", // Free model - change as needed
  MAX_TOKENS: 10000, // Maximum tokens for AI responses

  // Game Configuration
  SAVE_KEY: "albino-tomato-town-save",
  ANIMATION_SPEED: 0.3,
  DEBUG: true, // Set to false for production

  // Helper method to log current environment
  logEnvironment() {
    console.log("🌍 Environment Info:");
    console.log("  - Development:", this.IS_DEVELOPMENT);
    console.log("  - API URL:", this.AI_API_URL);
    console.log("  - Site URL:", this.SITE_URL);
    console.log("  - Has API Key:", !!this.OPENROUTER_API_KEY);
    if (this.IS_DEVELOPMENT) {
      console.log(
        "  - Local Config Loaded:",
        typeof LOCAL_CONFIG !== "undefined"
      );
    }
  },
};

// Log environment on load
CONFIG.logEnvironment();
