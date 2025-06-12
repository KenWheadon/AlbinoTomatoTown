class GameEngine {
  constructor() {
    this.currentLocation = TOWN_CENTER;
    this.gameState = new GameState();
    this.loadingScreen = new LoadingScreen();
    this.renderer = new Renderer();
    this.interactionHandler = new InteractionHandler(this);
    this.conversationManager = new ConversationManager(this);
    this.locationNavigator = new LocationNavigator(this);
    this.achievementManager = new AchievementManager(this);
    this.explorationDrawer = new ExplorationDrawer(this);
    this.victoryScreen = new VictoryScreen(this);
    this.isReady = false;

    // Set up the callback for when all achievements are unlocked
    this.achievementManager.setAllAchievementsUnlockedCallback(() => {
      this.victoryScreen.show();
    });
  }

  async start() {
    console.log("Starting Albino Tomato Town...");

    // Show loading screen
    this.loadingScreen.show();

    // FIXED: Wait for local config to load in development
    if (CONFIG.IS_DEVELOPMENT) {
      console.log("🔧 Development mode detected, waiting for local config...");
      await CONFIG.waitForLocalConfig();
    }

    // Log environment info after config is ready
    await CONFIG.logEnvironment();

    // Set up asset manager progress callback
    this.renderer.assetManager.setProgressCallback((progress) => {
      this.loadingScreen.updateProgress(progress);
    });

    try {
      // Preload all assets
      console.log("📦 Preloading assets...");
      await this.renderer.assetManager.preloadAllAssets();

      // Try to load saved game
      const gameLoaded = this.gameState.load();

      if (gameLoaded) {
        // Load the saved location
        this.currentLocation = this.gameState.currentLocation;
        console.log(`Loading saved location: ${this.currentLocation}`);

        // Sync achievements with the achievement manager
        this.achievementManager.syncFromGameState(
          this.gameState.unlockedAchievements
        );
      } else {
        // Start new game
        this.currentLocation = TOWN_CENTER;
      }

      // Set up event listeners for cleanup
      this.setupEventListeners();

      // Mark as ready before loading location
      this.isReady = true;
      console.log("✅ Game initialization complete!");

      // Load initial location
      await this.loadLocation(this.currentLocation);

      // Hide loading screen after everything is ready
      setTimeout(() => {
        this.loadingScreen.fadeOut();
      }, 500);

      // Start game loop
      this.gameLoop();
    } catch (error) {
      console.error("❌ Failed to start game:", error);
      this.handleStartupError(error);
    }
  }

  setupEventListeners() {
    // Listen for location changes to close open descriptions
    GameEvents.on(GAME_EVENTS.LOCATION_CHANGED, () => {
      this.closeAllOpenDescriptions();
    });
  }

  closeAllOpenDescriptions() {
    // Close all floating tooltips
    if (this.interactionHandler) {
      this.interactionHandler.closeAllTooltips();
    }

    // Close location previews
    if (this.locationNavigator) {
      this.locationNavigator.hideLocationPreview();
    }

    // Close exploration drawer
    if (this.explorationDrawer && this.explorationDrawer.isOpen) {
      this.explorationDrawer.hideDrawer();
    }

    console.log("🧹 Closed all open descriptions due to location change");
  }

  handleStartupError(error) {
    // Show error message on loading screen
    const statusElement =
      this.loadingScreen.loadingElement?.querySelector(".loading-status");
    if (statusElement) {
      statusElement.textContent =
        "Failed to load game. Please refresh the page.";
      statusElement.style.color = "#ff4444";
    }

    // Log detailed error
    console.error("Game startup failed:", error);

    // Try to continue with minimal functionality
    setTimeout(() => {
      console.log("Attempting to continue with reduced functionality...");
      this.loadingScreen.hide();
      this.startMinimalMode();
    }, 3000);
  }

  async startMinimalMode() {
    // Minimal game start without full preloading
    try {
      this.currentLocation = TOWN_CENTER;
      this.isReady = true; // Mark as ready for minimal mode
      await this.loadLocation(this.currentLocation);
      this.gameLoop();
      console.log("⚠️ Game started in minimal mode");
    } catch (error) {
      console.error("❌ Even minimal mode failed:", error);
    }
  }

  async loadLocation(locationKey) {
    if (!this.isReady) {
      console.log("⏳ Game not ready, queuing location load...");
      // Wait for game to be ready
      await new Promise((resolve) => {
        const checkReady = () => {
          if (this.isReady) {
            resolve();
          } else {
            setTimeout(checkReady, 100);
          }
        };
        checkReady();
      });
    }

    console.log(`🗺️ Loading location: ${locationKey}`);

    // Validate location exists
    if (!locations[locationKey]) {
      console.error(`❌ Location not found: ${locationKey}`);
      locationKey = TOWN_CENTER; // Fallback to town center
    }

    this.currentLocation = locationKey;
    this.gameState.visitLocation(locationKey);

    // Close any open descriptions when changing locations
    this.closeAllOpenDescriptions();

    try {
      // Render location (assets should already be preloaded)
      await this.renderer.renderLocation(locations[locationKey]);
      this.locationNavigator.renderNavigation(locationKey);

      console.log(`✅ Location loaded: ${locationKey}`);
    } catch (error) {
      console.error(`❌ Failed to load location ${locationKey}:`, error);
      // Try to load a fallback location
      if (locationKey !== TOWN_CENTER) {
        console.log("🔄 Attempting to load fallback location...");
        await this.loadLocation(TOWN_CENTER);
      }
    }
  }

  gameLoop() {
    // Main game loop
    if (this.renderer) {
      this.renderer.update();
    }

    // Update game state timing
    if (this.gameState) {
      this.gameState.updatePlayTime();
    }

    requestAnimationFrame(() => this.gameLoop());
  }

  // Get detailed game status
  getStatus() {
    return {
      isReady: this.isReady,
      currentLocation: this.currentLocation,
      assetStats: this.renderer?.assetManager?.getStats(),
      gameStats: this.gameState?.getStats(),
      achievementStats: this.achievementManager?.getStats(),
      explorationStats: this.explorationDrawer?.getStats(),
      conversationStatus: this.conversationManager?.getStatus(),
    };
  }

  // Save game state
  save() {
    if (this.gameState) {
      this.gameState.save();
    }
  }

  // Reset game
  reset() {
    // Close all open UIs
    this.closeAllOpenDescriptions();

    if (
      this.conversationManager &&
      this.conversationManager.isConversationActive
    ) {
      this.conversationManager.endConversation();
    }

    // Reset game state
    if (this.gameState) {
      this.gameState.reset();
    }

    // Reset achievements
    if (this.achievementManager) {
      this.achievementManager.resetAll();
    }

    // Reload first location
    this.currentLocation = TOWN_CENTER;
    this.loadLocation(this.currentLocation);

    console.log("🔄 Game reset complete");
  }

  // Cleanup on page unload
  destroy() {
    if (this.gameState) {
      this.gameState.destroy();
    }

    if (this.conversationManager) {
      this.conversationManager.destroy();
    }

    if (this.explorationDrawer) {
      this.explorationDrawer.destroy();
    }

    if (this.victoryScreen) {
      this.victoryScreen.destroy();
    }

    if (this.renderer) {
      this.renderer.destroy();
    }

    if (this.loadingScreen) {
      this.loadingScreen.destroy();
    }

    console.log("🗑️ Game engine destroyed");
  }
}
