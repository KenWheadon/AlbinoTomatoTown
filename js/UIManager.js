// UIManager.js - Handles all UI interactions and popups
class UIManager {
  constructor() {
    this.overlay = document.getElementById("overlay");
    this.menuPopup = document.getElementById("menu-popup");
    this.infoPopup = document.getElementById("info-popup");
    this.chatPopup = document.getElementById("chat-popup");
  }

  showOverlay() {
    this.overlay.style.display = "block";
  }

  hideOverlay() {
    this.overlay.style.display = "none";
  }

  showMenu() {
    this.hideAllPopups();
    this.showOverlay();
    this.menuPopup.style.display = "block";
  }

  showInfo(content) {
    this.hideAllPopups();
    this.showOverlay();
    document.getElementById("info-content").innerHTML = content;
    this.infoPopup.style.display = "block";
  }

  showChat() {
    this.hideAllPopups();
    this.showOverlay();
    this.chatPopup.style.display = "block";
  }

  hideAllPopups() {
    this.menuPopup.style.display = "none";
    this.infoPopup.style.display = "none";
    this.chatPopup.style.display = "none";
  }

  hideAll() {
    this.hideAllPopups();
    this.hideOverlay();
  }

  setupEventListeners(gameManager) {
    // Character click
    document
      .getElementById("character-container")
      .addEventListener("click", () => {
        gameManager.onCharacterClick();
      });

    // Menu buttons
    document.getElementById("info-button").addEventListener("click", () => {
      gameManager.onInfoClick();
    });

    document.getElementById("chat-button").addEventListener("click", () => {
      gameManager.onChatClick();
    });

    // Close buttons
    document.getElementById("info-close").addEventListener("click", () => {
      this.hideAll();
    });

    document.getElementById("chat-close").addEventListener("click", () => {
      this.hideAll();
    });

    // Overlay click
    this.overlay.addEventListener("click", () => {
      this.hideAll();
    });

    // Prevent popup clicks from closing
    this.menuPopup.addEventListener("click", (e) => e.stopPropagation());
    this.infoPopup.addEventListener("click", (e) => e.stopPropagation());
    this.chatPopup.addEventListener("click", (e) => e.stopPropagation());
  }
}
