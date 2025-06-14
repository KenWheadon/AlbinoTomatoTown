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
        typeof window !== "undefined" &&
        window.LOCAL_CONFIG &&
        window.LOCAL_CONFIG.OPENROUTER_API_KEY
      ) {
        return window.LOCAL_CONFIG.OPENROUTER_API_KEY;
      } else {
        // Don't warn immediately - local config might still be loading
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

  // Helper method to check if local config is available (for development)
  isLocalConfigReady() {
    return (
      !this.IS_DEVELOPMENT ||
      (typeof window !== "undefined" &&
        window.LOCAL_CONFIG &&
        window.LOCAL_CONFIG.OPENROUTER_API_KEY)
    );
  },

  // Helper method to wait for local config to load
  async waitForLocalConfig(timeoutMs = 5000) {
    if (!this.IS_DEVELOPMENT) return true;

    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
      if (window.LOCAL_CONFIG && window.LOCAL_CONFIG.OPENROUTER_API_KEY) {
        console.log("✅ Local config loaded successfully");
        return true;
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.warn("⚠️ LOCAL_CONFIG not found or missing API key after timeout.");
    console.warn(
      "⚠️ Create js/utils/local.config.js with your OPENROUTER_API_KEY."
    );
    console.warn("⚠️ Using fallback responses only.");
    return false;
  },

  // Helper method to log current environment - now async
  async logEnvironment() {
    console.log("🌍 Environment Info:");
    console.log("  - Development:", this.IS_DEVELOPMENT);
    console.log("  - API URL:", this.AI_API_URL);
    console.log("  - Site URL:", this.SITE_URL);

    if (this.IS_DEVELOPMENT) {
      // Wait for local config to load before logging
      const configReady = await this.waitForLocalConfig();
      console.log("  - Local Config Loaded:", configReady);
      console.log("  - Has API Key:", !!this.OPENROUTER_API_KEY);
    } else {
      console.log("  - Has API Key:", "Handled server-side");
    }
  },
};

// Don't log environment immediately - let the game engine handle it after local config loads
