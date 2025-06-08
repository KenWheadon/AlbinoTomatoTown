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

  start() {
    console.log("Starting Albino Tomato Town...");
    this.loadLocation(this.currentLocation);
    this.gameLoop();
  }

  loadLocation(locationKey) {
    this.currentLocation = locationKey;
    this.gameState.visitLocation(locationKey);
    this.renderer.renderLocation(locations[locationKey]);
    this.locationNavigator.renderNavigation(locationKey);
  }

  gameLoop() {
    // Main game loop
    requestAnimationFrame(() => this.gameLoop());
  }
}
