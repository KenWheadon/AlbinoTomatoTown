class InteractionHandler {
  constructor(gameEngine) {
    this.gameEngine = gameEngine;
    this.isInteractionBlocked = false;
    this.activeTooltips = new Map(); // Track active tooltips
    this.setupEventListeners();

    console.log("🖱️ Interaction handler initialized");
  }

  setupEventListeners() {
    // Click handling
    document.addEventListener("click", (e) => this.handleClick(e));

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) => this.handleKeyPress(e));

    // Touch support for mobile
    document.addEventListener("touchstart", (e) => this.handleTouch(e));

    // Context menu prevention (right-click)
    document.addEventListener("contextmenu", (e) => {
      if (e.target.closest(".interactable")) {
        e.preventDefault();
        this.handleRightClick(e);
      }
    });
  }

  handleClick(event) {
    // Check if clicking on a tooltip to close it
    if (event.target.closest(".floating-text")) {
      const tooltip = event.target.closest(".floating-text");
      this.closeTooltip(tooltip);
      return;
    }

    if (this.isInteractionBlocked) {
      return;
    }

    const interactable = event.target.closest(".interactable");
    if (!interactable) {
      // Clicked on empty space - close any open panels but NOT tooltips
      GameEvents.emit("ui_click_outside");
      return;
    }

    const type = interactable.dataset.type;
    const key = interactable.dataset.key;

    console.log(`👆 Clicked ${type}: ${key}`);

    // Add click animation
    this.playClickAnimation(interactable);

    // Route to appropriate handler
    switch (type) {
      case "character":
        this.interactWithCharacter(key, interactable);
        break;
      case "item":
        this.examineItem(key, interactable);
        break;
      default:
        console.warn(`Unknown interactable type: ${type}`);
    }
  }

  handleRightClick(event) {
    const interactable = event.target.closest(".interactable");
    if (!interactable) return;

    const type = interactable.dataset.type;
    const key = interactable.dataset.key;

    // Right-click shows detailed description (toggle)
    this.showDetailedDescription(key, type, event.clientX, event.clientY);
  }

  handleKeyPress(event) {
    // ESC - Close conversations/panels
    if (event.key === "Escape") {
      GameEvents.emit("ui_escape_pressed");
    }

    // Space - Interact with nearest character
    if (event.key === " " || event.key === "Spacebar") {
      event.preventDefault();
      this.interactWithNearestCharacter();
    }

    // Numbers 1-9 - Quick navigation
    if (event.key >= "1" && event.key <= "9") {
      const index = parseInt(event.key) - 1;
      GameEvents.emit("quick_navigate", index);
    }
  }

  handleTouch(event) {
    // Convert touch to click for mobile
    const touch = event.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);

    if (element && element.closest(".interactable")) {
      // Prevent default touch behavior on interactables
      event.preventDefault();
    }
  }

  playClickAnimation(element) {
    // Quick scale animation on click
    gsap.to(element, {
      scale: 0.9,
      duration: 0.1,
      ease: "power2.out",
      yoyo: true,
      repeat: 1,
    });

    // Add ripple effect
    this.createRippleEffect(element);
  }

  createRippleEffect(element) {
    const ripple = document.createElement("div");
    ripple.className = "click-ripple";

    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);

    ripple.style.width = ripple.style.height = size + "px";
    ripple.style.position = "absolute";
    ripple.style.left = rect.left + rect.width / 2 - size / 2 + "px";
    ripple.style.top = rect.top + rect.height / 2 - size / 2 + "px";
    ripple.style.background = "rgba(255,255,255,0.6)";
    ripple.style.borderRadius = "50%";
    ripple.style.transform = "scale(0)";
    ripple.style.pointerEvents = "none";
    ripple.style.zIndex = "9999";

    document.body.appendChild(ripple);

    gsap.to(ripple, {
      scale: 1,
      opacity: 0,
      duration: 0.6,
      ease: "power2.out",
      onComplete: () => {
        if (ripple.parentNode) {
          ripple.parentNode.removeChild(ripple);
        }
      },
    });
  }

  interactWithCharacter(characterKey, element) {
    const character = characters[characterKey];
    if (!character) {
      console.error(`Character not found: ${characterKey}`);
      return;
    }

    // Block further interactions during conversation setup
    this.blockInteractions(500);

    // Emit interaction event
    GameEvents.emit(GAME_EVENTS.CHARACTER_INTERACTION, {
      characterKey,
      character,
      element,
    });

    // Start conversation
    this.gameEngine.conversationManager.startConversation(
      characterKey,
      character
    );

    // Play interaction sound
    this.gameEngine.renderer.assetManager.playSound(
      "effects/character_interact.mp3",
      0.5
    );

    console.log(`💬 Starting conversation with ${characterKey}`);
  }

  examineItem(itemKey, element) {
    const item = items[itemKey];
    if (!item) {
      console.error(`Item not found: ${itemKey}`);
      return;
    }

    // Check if this item already has a tooltip open
    const tooltipKey = `item_${itemKey}`;
    if (this.activeTooltips.has(tooltipKey)) {
      // Close existing tooltip
      const existingTooltip = this.activeTooltips.get(tooltipKey);
      this.closeTooltip(existingTooltip);
      return;
    }

    // Block rapid clicking
    this.blockInteractions(200);

    // Get element position for tooltip
    const rect = element.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top - 10;

    // Show item description as toggle
    const tooltip = this.gameEngine.renderer.showFloatingText(
      item.description,
      x,
      y,
      0
    ); // 0 duration = no auto-close
    this.activeTooltips.set(tooltipKey, tooltip);

    // Emit examination event
    GameEvents.emit(GAME_EVENTS.ITEM_EXAMINED, {
      itemKey,
      item,
      element,
    });

    // Check for clues in description
    this.checkForClues(item.description, itemKey);

    // Play examination sound
    this.gameEngine.renderer.assetManager.playSound(
      "effects/item_examine.mp3",
      0.3
    );

    console.log(`🔍 Examined item: ${itemKey}`);
  }

  closeTooltip(tooltip) {
    if (!tooltip || !tooltip.parentNode) return;

    // Find and remove from active tooltips
    for (const [key, activeTooltip] of this.activeTooltips.entries()) {
      if (activeTooltip === tooltip) {
        this.activeTooltips.delete(key);
        break;
      }
    }

    gsap.to(tooltip, {
      opacity: 0,
      y: -20,
      duration: 0.3,
      ease: "power2.in",
      onComplete: () => {
        if (tooltip.parentNode) {
          tooltip.parentNode.removeChild(tooltip);
        }
      },
    });
  }

  showDetailedDescription(key, type, x, y) {
    let data;
    if (type === "character") {
      data = characters[key];
    } else if (type === "item") {
      data = items[key];
    }

    if (!data) return;

    // Check if this detailed tooltip already exists
    const tooltipKey = `detailed_${type}_${key}`;
    if (this.activeTooltips.has(tooltipKey)) {
      const existingTooltip = this.activeTooltips.get(tooltipKey);
      this.closeTooltip(existingTooltip);
      return;
    }

    // Create detailed tooltip
    const tooltip = document.createElement("div");
    tooltip.className = "detailed-tooltip floating-text"; // Add floating-text class for click handling
    tooltip.innerHTML = `
            <div class="tooltip-header">${this.formatName(key)}</div>
            <div class="tooltip-description">${data.description}</div>
            <div class="tooltip-close-hint">Click to close</div>
        `;

    tooltip.style.position = "fixed";
    tooltip.style.left = x + "px";
    tooltip.style.top = y + "px";
    tooltip.style.backgroundColor = "rgba(0,0,0,0.9)";
    tooltip.style.color = "white";
    tooltip.style.padding = "12px";
    tooltip.style.borderRadius = "8px";
    tooltip.style.maxWidth = "250px";
    tooltip.style.fontSize = "12px";
    tooltip.style.zIndex = "10000";
    tooltip.style.cursor = "pointer";

    // Add close hint styling
    const closeHint = tooltip.querySelector(".tooltip-close-hint");
    if (closeHint) {
      closeHint.style.fontSize = "10px";
      closeHint.style.opacity = "0.7";
      closeHint.style.marginTop = "6px";
      closeHint.style.textAlign = "center";
      closeHint.style.fontStyle = "italic";
    }

    document.body.appendChild(tooltip);

    // Position adjustment if off-screen
    const rect = tooltip.getBoundingClientRect();
    if (rect.right > window.innerWidth) {
      tooltip.style.left = x - rect.width + "px";
    }
    if (rect.bottom > window.innerHeight) {
      tooltip.style.top = y - rect.height - 10 + "px";
    }

    // Store in active tooltips
    this.activeTooltips.set(tooltipKey, tooltip);

    // Fade in
    gsap.fromTo(
      tooltip,
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 0.2 }
    );
  }

  interactWithNearestCharacter() {
    const characters = document.querySelectorAll(
      '.interactable[data-type="character"]'
    );
    if (characters.length === 0) return;

    // For now, just interact with the first character
    // Could be enhanced to find truly nearest character
    const firstCharacter = characters[0];
    const key = firstCharacter.dataset.key;
    this.interactWithCharacter(key, firstCharacter);
  }

  checkForClues(description, itemKey) {
    // Simple keyword checking for clues
    const clueKeywords = [
      "secret",
      "hidden",
      "buried",
      "mystery",
      "ancient",
      "forgotten",
      "legend",
      "treasure",
      "magic",
      "curse",
    ];

    const foundKeywords = clueKeywords.filter((keyword) =>
      description.toLowerCase().includes(keyword)
    );

    if (foundKeywords.length > 0) {
      const clueKey = `${itemKey}_clue`;
      const wasNew = this.gameEngine.gameState.addClue(clueKey);

      if (wasNew) {
        // Show clue discovered notification
        this.showClueDiscovered(foundKeywords);
      }
    }
  }

  showClueDiscovered(keywords) {
    const notification = document.createElement("div");
    notification.className = "clue-notification";
    notification.innerHTML = `
            <div class="clue-icon">🔍</div>
            <div class="clue-text">Clue discovered!</div>
            <div class="clue-keywords">${keywords.join(", ")}</div>
        `;

    notification.style.position = "fixed";
    notification.style.top = "20px";
    notification.style.right = "20px";
    notification.style.backgroundColor = "rgba(255,215,0,0.9)";
    notification.style.color = "#333";
    notification.style.padding = "12px";
    notification.style.borderRadius = "8px";
    notification.style.fontSize = "14px";
    notification.style.zIndex = "10000";
    notification.style.textAlign = "center";

    document.body.appendChild(notification);

    // Animate in and out
    gsap.fromTo(
      notification,
      { opacity: 0, x: 100 },
      { opacity: 1, x: 0, duration: 0.5, ease: "back.out(1.7)" }
    );

    setTimeout(() => {
      gsap.to(notification, {
        opacity: 0,
        x: 100,
        duration: 0.3,
        onComplete: () => notification.remove(),
      });
    }, 3000);
  }

  blockInteractions(duration) {
    this.isInteractionBlocked = true;
    setTimeout(() => {
      this.isInteractionBlocked = false;
    }, duration);
  }

  formatName(key) {
    return key
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  // Enable/disable interactions (for conversation mode, etc.)
  setInteractionsEnabled(enabled) {
    this.isInteractionBlocked = !enabled;
  }

  // Close all active tooltips
  closeAllTooltips() {
    for (const [key, tooltip] of this.activeTooltips.entries()) {
      this.closeTooltip(tooltip);
    }
  }
}
