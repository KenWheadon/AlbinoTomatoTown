class GameEngine {
  constructor() {
    this.currentLocation = TOWN_CENTER;
    this.gameState = new GameState();
    this.renderer = new Renderer();
    this.interactionHandler = new InteractionHandler(this);
    this.conversationManager = new ConversationManager(this);
    this.locationNavigator = new LocationNavigator(this);
    this.achievementManager = new AchievementManager(this);
  }

  async start() {
    console.log("Starting Albino Tomato Town...");

    // Try to load saved game first
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

    await this.loadLocation(this.currentLocation);
    this.gameLoop();
  }

  async loadLocation(locationKey) {
    this.currentLocation = locationKey;
    this.gameState.visitLocation(locationKey);
    await this.renderer.renderLocation(locations[locationKey]);
    this.locationNavigator.renderNavigation(locationKey);
  }

  gameLoop() {
    // Main game loop
    requestAnimationFrame(() => this.gameLoop());
  }
}
