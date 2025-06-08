class Renderer {
  constructor(assetManager = null) {
    this.container = document.getElementById("game-container");
    this.assetManager = assetManager || new AssetManager();
    this.currentLocationData = null;

    if (!this.container) {
      console.error("Game container not found!");
      return;
    }

    this.setupContainer();
  }

  setupContainer() {
    this.container.style.position = "relative";
    this.container.style.width = "100vw";
    this.container.style.height = "100vh";
    this.container.style.overflow = "hidden";
  }

  async renderLocation(locationData) {
    console.log(`🎨 Rendering location: ${locationData.description}`);

    this.currentLocationData = locationData;

    // Clear current content
    this.clearScreen();

    // Preload assets for this location
    await this.assetManager.preloadLocationAssets(locationData);

    // Set background
    await this.setBackground(locationData.background);

    // Render interactive elements
    this.renderCharacters(locationData.characters);
    this.renderItems(locationData.items);

    // Add location entrance animation
    this.playLocationTransition();
  }

  clearScreen() {
    // Remove all interactive elements but keep background
    const interactables = this.container.querySelectorAll(".interactable");
    interactables.forEach((element) => element.remove());
  }

  async setBackground(backgroundName) {
    try {
      const backgroundImg = await this.assetManager.loadBackground(
        backgroundName
      );

      if (backgroundImg.src.includes("data:")) {
        // It's a canvas-generated placeholder
        this.container.style.backgroundImage = `url(${backgroundImg.src})`;
      } else {
        // It's a real image
        this.container.style.backgroundImage = `url(${backgroundImg.src})`;
      }

      this.container.style.backgroundSize = "cover";
      this.container.style.backgroundPosition = "center";
      this.container.style.backgroundRepeat = "no-repeat";
    } catch (error) {
      console.warn("Failed to set background, using fallback color");
      this.container.style.background =
        "linear-gradient(to bottom, #87CEEB, #228B22)";
    }
  }

  async renderCharacters(characterKeys) {
    // Use Promise.all to properly handle async operations
    const promises = characterKeys.map(async (key) => {
      const char = characters[key];
      if (char) {
        return await this.createInteractable("character", key, char);
      }
    });

    await Promise.all(promises);
  }

  async renderItems(itemKeys) {
    // Use Promise.all to properly handle async operations
    const promises = itemKeys.map(async (key) => {
      const item = items[key];
      if (item) {
        return await this.createInteractable("item", key, item);
      }
    });

    await Promise.all(promises);
  }

  async createInteractable(type, key, data) {
    const element = document.createElement("div");
    element.className = `interactable ${type}`;
    element.dataset.type = type;
    element.dataset.key = key;
    element.title = data.description;

    // Get scale factor (default to 1 if not specified)
    const scale = data.scale || 1;
    const baseSize = 64;
    const scaledSize = baseSize * scale;

    // Position element
    element.style.position = "absolute";
    element.style.left = data.X + "px";
    element.style.top = data.Y + "px";
    element.style.width = scaledSize + "px";
    element.style.height = scaledSize + "px";
    element.style.cursor = "pointer";
    element.style.transition = "transform 0.2s ease";

    // Load and set image
    const imagePath =
      type === "character" ? `characters/${data.img}` : `items/${data.img}`;
    const image = await this.assetManager.loadImage(imagePath, type);

    if (image.src.includes("data:")) {
      // Canvas-generated placeholder
      element.style.backgroundImage = `url(${image.src})`;
    } else {
      // Real image
      element.style.backgroundImage = `url(${image.src})`;
    }

    element.style.backgroundSize = "contain";
    element.style.backgroundRepeat = "no-repeat";
    element.style.backgroundPosition = "center";

    // Add hover effects
    this.addHoverEffects(element);

    // Add to container with entrance animation
    this.container.appendChild(element);
    this.animateElementEntrance(element);
  }

  addHoverEffects(element) {
    element.addEventListener("mouseenter", () => {
      gsap.to(element, {
        scale: 1.1,
        duration: 0.2,
        ease: "power2.out",
      });

      // Remove the drop-shadow filter that creates the border
      // Replace with a subtle glow without hard edges
      element.style.filter = "brightness(1.2) saturate(1.1)";
    });

    element.addEventListener("mouseleave", () => {
      gsap.to(element, {
        scale: 1,
        duration: 0.2,
        ease: "power2.out",
      });

      element.style.filter = "none";
    });

    // Click animation
    element.addEventListener("mousedown", () => {
      gsap.to(element, {
        scale: 0.95,
        duration: 0.1,
      });
    });

    element.addEventListener("mouseup", () => {
      gsap.to(element, {
        scale: 1.1,
        duration: 0.1,
      });
    });
  }

  animateElementEntrance(element) {
    // Start invisible and small
    gsap.set(element, {
      opacity: 0,
      scale: 0.5,
    });

    // Animate in with bounce
    gsap.to(element, {
      opacity: 1,
      scale: 1,
      duration: 0.5,
      ease: "back.out(1.7)",
      delay: Math.random() * 0.3, // Stagger entrances
    });
  }

  playLocationTransition() {
    // Fade in the entire container
    gsap.fromTo(
      this.container,
      {
        opacity: 0,
        filter: "blur(5px)",
      },
      {
        opacity: 1,
        filter: "blur(0px)",
        duration: 0.8,
        ease: "power2.out",
      }
    );
  }

  // Show floating text (for item descriptions, etc.)
  // Modified to support duration = 0 for no auto-close
  showFloatingText(text, x, y, duration = 3000) {
    const textElement = document.createElement("div");
    textElement.className = "floating-text";
    textElement.textContent = text;
    textElement.style.position = "absolute";
    textElement.style.left = x + "px";
    textElement.style.top = y + "px";
    textElement.style.color = "white";
    textElement.style.backgroundColor = "rgba(0,0,0,0.8)";
    textElement.style.padding = "8px 12px";
    textElement.style.borderRadius = "8px";
    textElement.style.fontSize = "14px";
    textElement.style.pointerEvents = duration === 0 ? "auto" : "none"; // Allow clicks if permanent
    textElement.style.zIndex = "1000";
    textElement.style.maxWidth = "200px";
    textElement.style.wordWrap = "break-word";
    textElement.style.cursor = duration === 0 ? "pointer" : "default";

    // Add close hint for permanent tooltips
    if (duration === 0) {
      const closeHint = document.createElement("div");
      closeHint.textContent = "Click to close";
      closeHint.style.fontSize = "10px";
      closeHint.style.opacity = "0.7";
      closeHint.style.marginTop = "4px";
      closeHint.style.textAlign = "center";
      closeHint.style.fontStyle = "italic";
      textElement.appendChild(closeHint);
    }

    this.container.appendChild(textElement);

    // Position adjustment if off-screen
    const rect = textElement.getBoundingClientRect();
    if (rect.right > window.innerWidth) {
      textElement.style.left = x - rect.width + "px";
    }
    if (rect.bottom > window.innerHeight) {
      textElement.style.top = y - rect.height - 10 + "px";
    }

    // Animate in
    gsap.fromTo(
      textElement,
      {
        opacity: 0,
        y: 20,
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.3,
        ease: "power2.out",
      }
    );

    // Remove after duration only if duration > 0
    if (duration > 0) {
      setTimeout(() => {
        gsap.to(textElement, {
          opacity: 0,
          y: -20,
          duration: 0.3,
          ease: "power2.in",
          onComplete: () => {
            if (textElement.parentNode) {
              textElement.parentNode.removeChild(textElement);
            }
          },
        });
      }, duration);
    }

    return textElement; // Return element for manual management
  }

  // Highlight an interactable (for achievements, hints, etc.)
  highlightElement(key, type) {
    const element = this.container.querySelector(
      `[data-key="${key}"][data-type="${type}"]`
    );
    if (element) {
      // Add pulsing highlight
      gsap.to(element, {
        scale: 1.2,
        duration: 0.5,
        ease: "power2.inOut",
        yoyo: true,
        repeat: 3,
      });

      // Add glow effect
      element.style.filter = "drop-shadow(0 0 20px #FFD700)";
      setTimeout(() => {
        element.style.filter = "none";
      }, 2000);
    }
  }

  // Get element position for UI positioning
  getElementPosition(key, type) {
    const element = this.container.querySelector(
      `[data-key="${key}"][data-type="${type}"]`
    );
    if (element) {
      const rect = element.getBoundingClientRect();
      return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
    }
    return null;
  }

  update() {
    // Called each frame - can be used for animations, particle effects, etc.
    // Currently empty but ready for expansion
  }
}
