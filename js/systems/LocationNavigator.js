class LocationNavigator {
  constructor(gameEngine) {
    this.gameEngine = gameEngine;
    this.navContainer = null;
    this.currentButtons = [];
    this.isNavigating = false;

    this.setupNavigationBar();
    this.setupEventListeners();

    console.log("🧭 Location navigator initialized");
  }

  setupNavigationBar() {
    // Create the navigation container at the bottom
    this.navContainer = document.createElement("div");
    this.navContainer.className = "location-navigator";
    this.navContainer.innerHTML = `
            <div class="nav-buttons-container"></div>
            <div class="nav-info">
                <span class="current-location"></span>
            </div>
        `;

    document.body.appendChild(this.navContainer);
  }

  setupEventListeners() {
    // Quick navigation with number keys
    GameEvents.on("quick_navigate", (index) => {
      if (index < this.currentButtons.length) {
        const button = this.currentButtons[index];
        button.click();
      }
    });

    // Listen for location changes to update current location display
    GameEvents.on(GAME_EVENTS.LOCATION_CHANGED, (data) => {
      this.updateCurrentLocationDisplay(data.location);
    });
  }

  renderNavigation(currentLocationKey) {
    const location = locations[currentLocationKey];
    if (!location) {
      console.error(`Location not found: ${currentLocationKey}`);
      return;
    }

    const buttonsContainer = this.navContainer.querySelector(
      ".nav-buttons-container"
    );

    // Clear existing buttons
    buttonsContainer.innerHTML = "";
    this.currentButtons = [];

    // Create button for each accessible location
    location.locations.forEach((locationKey, index) => {
      const targetLocation = locations[locationKey];
      if (targetLocation) {
        const button = this.createLocationButton(
          locationKey,
          targetLocation,
          index + 1
        );
        buttonsContainer.appendChild(button);
        this.currentButtons.push(button);
      }
    });

    // Update current location display
    this.updateCurrentLocationDisplay(currentLocationKey);

    // Animate buttons in
    this.animateButtonsIn();

    console.log(`🧭 Navigation updated for ${currentLocationKey}`);
  }

  createLocationButton(locationKey, locationData, shortcutNumber) {
    const button = document.createElement("button");
    button.className = "location-nav-button";
    button.dataset.locationKey = locationKey;

    const displayName = this.getLocationDisplayName(locationKey);
    button.innerHTML = `
            ${displayName}
            <span class="nav-shortcut">${shortcutNumber}</span>
        `;

    // Hover tooltip
    button.title = locationData.description;

    // Click handler with navigation logic
    button.addEventListener("click", () => {
      this.navigateToLocation(locationKey);
    });

    // Enhanced hover effects
    button.addEventListener("mouseenter", () => {
      this.showLocationPreview(locationData, button);
      this.gameEngine.renderer.assetManager.playSound(
        "effects/ui_hover.mp3",
        0.2
      );
    });

    button.addEventListener("mouseleave", () => {
      this.hideLocationPreview();
    });

    return button;
  }

  navigateToLocation(locationKey) {
    if (this.isNavigating) {
      return; // Prevent rapid clicking
    }

    if (locationKey === this.gameEngine.currentLocation) {
      console.log("Already at this location");
      return;
    }

    // CLEAR any open location previews
    this.hideLocationPreview();

    this.isNavigating = true;

    // Visual feedback
    const button = this.navContainer.querySelector(
      `[data-location-key="${locationKey}"]`
    );
    if (button) {
      button.style.background = "rgba(139,195,74,0.8)";
      button.style.color = "white";
    }

    // Play navigation sound
    this.gameEngine.renderer.assetManager.playSound(
      "effects/location_change.mp3",
      0.4
    );

    // Navigate with delay for feedback
    setTimeout(() => {
      this.gameEngine.loadLocation(locationKey);
      this.isNavigating = false;
    }, 200);

    console.log(`🚶 Navigating to: ${locationKey}`);
  }

  showLocationPreview(locationData, button) {
    // Remove any existing preview
    this.hideLocationPreview();

    const preview = document.createElement("div");
    preview.className = "location-preview";
    preview.textContent = locationData.description;

    document.body.appendChild(preview);

    // Position above the button
    const buttonRect = button.getBoundingClientRect();
    const previewRect = preview.getBoundingClientRect();

    let left = buttonRect.left + buttonRect.width / 2 - previewRect.width / 2;
    let top = buttonRect.top - previewRect.height - 10;

    // Keep preview on screen
    if (left < 10) left = 10;
    if (left + previewRect.width > window.innerWidth - 10) {
      left = window.innerWidth - previewRect.width - 10;
    }
    if (top < 10) {
      top = buttonRect.bottom + 10;
    }

    preview.style.left = left + "px";
    preview.style.top = top + "px";

    // Animate in
    gsap.fromTo(
      preview,
      { opacity: 0, scale: 0.8, y: 10 },
      { opacity: 1, scale: 1, y: 0, duration: 0.2, ease: "power2.out" }
    );
  }

  hideLocationPreview() {
    const preview = document.querySelector(".location-preview");
    if (preview) {
      gsap.to(preview, {
        opacity: 0,
        scale: 0.8,
        duration: 0.15,
        onComplete: () => preview.remove(),
      });
    }
  }

  updateCurrentLocationDisplay(locationKey) {
    const currentLocationSpan =
      this.navContainer.querySelector(".current-location");
    if (currentLocationSpan) {
      currentLocationSpan.textContent =
        this.getLocationDisplayName(locationKey);
    }

    // Update button states
    this.currentButtons.forEach((button) => {
      button.classList.remove("current");
      if (button.dataset.locationKey === locationKey) {
        button.classList.add("current");
      }
    });
  }

  animateButtonsIn() {
    this.currentButtons.forEach((button, index) => {
      gsap.fromTo(
        button,
        {
          opacity: 0,
          y: 20,
          scale: 0.8,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.4,
          delay: index * 0.1,
          ease: "back.out(1.7)",
        }
      );
    });
  }

  getLocationDisplayName(locationKey) {
    // Convert snake_case to Title Case
    return locationKey
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  // Show/hide navigation bar
  show() {
    gsap.to(this.navContainer, {
      y: 0,
      duration: 0.3,
      ease: "power2.out",
    });
  }

  hide() {
    gsap.to(this.navContainer, {
      y: 70,
      duration: 0.3,
      ease: "power2.in",
    });
  }

  // Highlight a specific navigation button (for tutorials/hints)
  highlightButton(locationKey) {
    const button = this.navContainer.querySelector(
      `[data-location-key="${locationKey}"]`
    );
    if (button) {
      gsap.to(button, {
        scale: 1.1,
        duration: 0.5,
        ease: "power2.inOut",
        yoyo: true,
        repeat: 3,
      });

      button.style.boxShadow = "0 0 20px #FFD700";
      setTimeout(() => {
        button.style.boxShadow = "";
      }, 2000);
    }
  }

  // Get current navigation options (for achievements, etc.)
  getCurrentOptions() {
    return this.currentButtons.map((button) => ({
      key: button.dataset.locationKey,
      name: this.getLocationDisplayName(button.dataset.locationKey),
    }));
  }
}
