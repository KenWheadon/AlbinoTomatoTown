// GameManager.js - Main game controller
class GameManager {
  constructor() {
    this.character = new Character(
      "albino-tomato",
      "Albino Tomato",
      "img/albinotomato.png",
      `<h2>🍅 Meet the Albino Tomato!</h2>
            <p>This rare and mysterious albino tomato has been growing in the garden for years. 
            Unlike its red cousins, this pale beauty has developed a unique personality and 
            wisdom from watching the seasons change.</p>
            <p>Local gardeners say it glows softly under moonlight and whispers ancient 
            plant secrets to those who listen carefully.</p>
            <p><strong>Special Traits:</strong> Moonlight sensitivity, Ancient wisdom, 
            Gentle nature</p>`,
      "A wise and gentle albino tomato who speaks thoughtfully about garden life and nature. Cheerful but contemplative."
    );

    this.uiManager = new UIManager();
    this.llmService = new LLMService();
    this.chatSystem = new ChatSystem(this.character, this.llmService);

    this.init();
  }

  init() {
    this.setupImageLoading();
    this.setupBackgroundImage();
    this.uiManager.setupEventListeners(this);
  }

  setupBackgroundImage() {
    const scene = document.getElementById("main-scene");

    // Test if background image loads
    const testBg = new Image();
    testBg.onload = () => {
      console.log("Background image loaded successfully");
      // Image loaded successfully, CSS will handle the display
    };

    testBg.onerror = () => {
      console.log("Background image failed to load, keeping gradient fallback");
      // Remove the background-image so gradient fallback shows
      scene.style.backgroundImage = "none";
    };

    testBg.src = "img/background.png";
  }

  setupImageLoading() {
    const mainImage = document.getElementById("character-image");
    const chatImage = document.getElementById("chat-character-image");
    const mainFallback = document.getElementById("character-fallback");
    const chatFallback = document.getElementById("chat-character-fallback");

    // Function to show fallbacks when images fail
    const showFallbacks = () => {
      console.log("Images failed to load, showing emoji fallbacks");
      mainImage.style.display = "none";
      mainFallback.style.display = "flex";
      chatImage.style.display = "none";
      chatFallback.style.display = "flex";
    };

    // Set up error handlers for both images
    mainImage.onerror = showFallbacks;
    chatImage.onerror = showFallbacks;

    // Log successful loading
    mainImage.onload = () => {
      console.log("Character image loaded successfully");
    };

    // The images will show by default (no display:none in HTML)
    // Only hide them if they fail to load
  }

  onCharacterClick() {
    this.uiManager.showMenu();
  }

  onInfoClick() {
    this.uiManager.showInfo(this.character.getInfo());
  }

  onChatClick() {
    this.uiManager.showChat();
  }
}
