class ExplorationDrawer {
  constructor(gameEngine) {
    this.gameEngine = gameEngine;
    this.drawerPanel = null;
    this.drawerButton = null;
    this.isOpen = false;
    this.discoveredCharacters = new Set();
    this.discoveredItems = new Set();
    this.currentFilter = "all"; // 'all', 'characters', 'items', 'discovered', 'undiscovered'

    this.createExplorationUI();
    this.createExplorationButton();
    this.setupEventListeners();

    console.log("🗺️ Exploration drawer initialized");
  }

  createExplorationButton() {
    // Create floating exploration button
    this.drawerButton = document.createElement("button");
    this.drawerButton.className = "exploration-trigger";
    this.drawerButton.innerHTML = "🔍";
    this.drawerButton.title = "Open Discovery Journal (D)";
    this.drawerButton.setAttribute("data-discovered", "0");

    document.body.appendChild(this.drawerButton);

    // Add click listener
    this.drawerButton.addEventListener("click", () => {
      this.toggleDrawer();
    });

    // Update discovery count
    this.updateButtonProgress();
  }

  updateButtonProgress() {
    if (this.drawerButton) {
      const discovered =
        this.discoveredCharacters.size + this.discoveredItems.size;
      const total = Object.keys(characters).length + Object.keys(items).length;
      this.drawerButton.setAttribute(
        "data-discovered",
        `${discovered}/${total}`
      );
    }
  }

  createExplorationUI() {
    // Create exploration drawer panel
    this.drawerPanel = document.createElement("div");
    this.drawerPanel.className = "exploration-drawer";
    this.drawerPanel.innerHTML = `
      <div class="exploration-header">
        <h2>🗺️ Discovery Journal</h2>
        <div class="exploration-progress">
          <div class="progress-bar">
            <div class="progress-fill"></div>
          </div>
          <span class="progress-text">0 / ${
            Object.keys(characters).length + Object.keys(items).length
          }</span>
        </div>
        <button class="close-exploration">×</button>
      </div>
      
      <div class="exploration-tabs">
        <button class="exploration-tab active" data-filter="all">All</button>
        <button class="exploration-tab" data-filter="characters">Characters</button>
        <button class="exploration-tab" data-filter="items">Items</button>
        <button class="exploration-tab" data-filter="discovered">Found</button>
      </div>
      
      <div class="exploration-content">
        <div class="exploration-list"></div>
      </div>
      
      <div class="exploration-footer">
        <p class="exploration-hint">💡 Interact with characters and items to discover them!</p>
      </div>
    `;

    document.body.appendChild(this.drawerPanel);
    this.hideDrawer();
  }

  setupEventListeners() {
    // Close button
    this.drawerPanel
      .querySelector(".close-exploration")
      .addEventListener("click", () => {
        this.hideDrawer();
      });

    // Tab buttons
    this.drawerPanel.querySelectorAll(".exploration-tab").forEach((tab) => {
      tab.addEventListener("click", (e) => {
        this.switchTab(e.target.dataset.filter);
      });
    });

    // Listen for character interactions
    GameEvents.on(GAME_EVENTS.CHARACTER_INTERACTION, (data) => {
      this.discoverCharacter(data.characterKey);
    });

    // Listen for item examinations
    GameEvents.on(GAME_EVENTS.ITEM_EXAMINED, (data) => {
      this.discoverItem(data.itemKey);
    });

    // Keyboard shortcut to open exploration drawer (D key)
    document.addEventListener("keydown", (e) => {
      if (
        (e.key === "d" || e.key === "D") &&
        !this.gameEngine.conversationManager.isConversationActive
      ) {
        e.preventDefault();
        this.toggleDrawer();
      }
    });
  }

  toggleDrawer() {
    if (this.isOpen) {
      this.hideDrawer();
    } else {
      this.showDrawer();
    }
  }

  showDrawer() {
    this.isOpen = true;
    this.drawerPanel.style.display = "flex";
    this.renderExplorationItems();
    this.updateProgress();

    // Animate in
    gsap.fromTo(
      this.drawerPanel,
      { opacity: 0, scale: 0.8, y: 50 },
      { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: "back.out(1.7)" }
    );
  }

  hideDrawer() {
    this.isOpen = false;
    gsap.to(this.drawerPanel, {
      opacity: 0,
      scale: 0.8,
      y: 50,
      duration: 0.3,
      ease: "power2.in",
      onComplete: () => {
        this.drawerPanel.style.display = "none";
      },
    });
  }

  switchTab(filter) {
    this.currentFilter = filter;

    // Update tab states
    this.drawerPanel.querySelectorAll(".exploration-tab").forEach((tab) => {
      tab.classList.toggle("active", tab.dataset.filter === filter);
    });

    // Re-render items for this filter
    this.renderExplorationItems();
  }

  discoverCharacter(characterKey) {
    if (!this.discoveredCharacters.has(characterKey)) {
      this.discoveredCharacters.add(characterKey);
      console.log(`🔍 Character discovered: ${characterKey}`);

      // Show notification
      this.showDiscoveryNotification("character", characterKey);

      // Update progress
      this.updateProgress();
      this.updateButtonProgress();

      // Re-render if drawer is open
      if (this.isOpen) {
        this.renderExplorationItems();
      }
    }
  }

  discoverItem(itemKey) {
    if (!this.discoveredItems.has(itemKey)) {
      this.discoveredItems.add(itemKey);
      console.log(`🔍 Item discovered: ${itemKey}`);

      // Show notification
      this.showDiscoveryNotification("item", itemKey);

      // Update progress
      this.updateProgress();
      this.updateButtonProgress();

      // Re-render if drawer is open
      if (this.isOpen) {
        this.renderExplorationItems();
      }
    }
  }

  showDiscoveryNotification(type, key) {
    const data = type === "character" ? characters[key] : items[key];
    if (!data) return;

    const notification = document.createElement("div");
    notification.className = "discovery-notification";

    const icon = type === "character" ? "👤" : "📦";
    const name = key
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    notification.innerHTML = `
      <div class="discovery-notification-icon">${icon}</div>
      <div class="discovery-notification-text">
        <strong>Discovered!</strong><br>
        ${name}
      </div>
    `;

    document.body.appendChild(notification);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      gsap.to(notification, {
        opacity: 0,
        x: 100,
        duration: 0.3,
        onComplete: () => notification.remove(),
      });
    }, 3000);
  }

  renderExplorationItems() {
    const listContainer = this.drawerPanel.querySelector(".exploration-list");
    listContainer.innerHTML = "";

    const allItems = this.getAllExplorationItems();
    const filteredItems = this.filterItems(allItems);

    // Sort: discovered first, then by name
    filteredItems.sort((a, b) => {
      if (a.discovered !== b.discovered) {
        return b.discovered - a.discovered;
      }
      return a.name.localeCompare(b.name);
    });

    // Render each item
    filteredItems.forEach((item, index) => {
      const itemElement = this.createExplorationItemElement(item);
      listContainer.appendChild(itemElement);

      // Animate in with stagger
      gsap.fromTo(
        itemElement,
        { opacity: 0, y: 20, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.3,
          delay: index * 0.02,
          ease: "power2.out",
        }
      );
    });
  }

  getAllExplorationItems() {
    const allItems = [];

    // Add all characters
    Object.entries(characters).forEach(([key, data]) => {
      const location = this.findCharacterLocation(key);
      allItems.push({
        key,
        type: "character",
        name: key
          .split("_")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" "),
        description: data.description,
        discovered: this.discoveredCharacters.has(key),
        location: location
          ? location
              .split("_")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ")
          : "Unknown",
        image: data.img,
        data,
      });
    });

    // Add all items
    Object.entries(items).forEach(([key, data]) => {
      const location = this.findItemLocation(key);
      allItems.push({
        key,
        type: "item",
        name: key
          .split("_")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" "),
        description: data.description,
        discovered: this.discoveredItems.has(key),
        location: location
          ? location
              .split("_")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ")
          : "Unknown",
        image: data.img,
        data,
      });
    });

    return allItems;
  }

  findCharacterLocation(characterKey) {
    for (const [locationKey, locationData] of Object.entries(locations)) {
      if (locationData.characters.includes(characterKey)) {
        return locationKey;
      }
    }
    return null;
  }

  findItemLocation(itemKey) {
    for (const [locationKey, locationData] of Object.entries(locations)) {
      if (locationData.items.includes(itemKey)) {
        return locationKey;
      }
    }
    return null;
  }

  filterItems(items) {
    switch (this.currentFilter) {
      case "characters":
        return items.filter((item) => item.type === "character");
      case "items":
        return items.filter((item) => item.type === "item");
      case "discovered":
        return items.filter((item) => item.discovered);
      default:
        return items;
    }
  }

  createExplorationItemElement(item) {
    const element = document.createElement("div");
    element.className = `exploration-item ${
      item.discovered ? "discovered" : "undiscovered"
    }`;
    element.dataset.key = item.key;
    element.dataset.type = item.type;

    // Only show content for discovered items
    if (item.discovered) {
      // Get image
      let imageStyle = "";
      const imagePath = `images/${
        item.type === "character" ? "characters" : "items"
      }/${item.image}.png`;
      const preloadedImage = this.gameEngine.renderer.assetManager.getImage(
        `${item.type === "character" ? "characters" : "items"}/${item.image}`
      );

      if (preloadedImage) {
        imageStyle = `background-image: url(${preloadedImage.src})`;
      } else {
        imageStyle = `background-image: url(${imagePath})`;
      }

      element.innerHTML = `
        <div class="exploration-item-type ${item.type}">${item.type}</div>
        <div class="exploration-item-image" style="${imageStyle}"></div>
        <div class="exploration-item-name">${item.name}</div>
        <div class="exploration-item-description">${item.description}</div>
        <div class="exploration-item-location">📍 ${item.location}</div>
      `;

      // Add click handler for discovered items
      element.addEventListener("click", () => {
        this.showItemDetails(item);
      });
    } else {
      // Undiscovered items show only minimal info
      element.innerHTML = `
        <div class="exploration-item-type ${item.type}">${item.type}</div>
        <div class="exploration-item-image undiscovered-placeholder">?</div>
        <div class="exploration-item-name">???</div>
        <div class="exploration-item-description">Explore to discover...</div>
        <div class="exploration-item-location">📍 ???</div>
      `;
    }

    return element;
  }

  showItemDetails(item) {
    // Create detailed view popup
    const modal = document.createElement("div");
    modal.className = "exploration-detail-modal";
    modal.innerHTML = `
      <div class="exploration-detail-content">
        <div class="exploration-detail-header">
          <h3>${item.name}</h3>
          <button class="close-detail">×</button>
        </div>
        <div class="exploration-detail-body">
          <div class="exploration-detail-image" style="background-image: url(images/${
            item.type === "character" ? "characters" : "items"
          }/${item.image}.png)"></div>
          <div class="exploration-detail-info">
            <p><strong>Type:</strong> ${item.type}</p>
            <p><strong>Location:</strong> ${item.location}</p>
            <p><strong>Description:</strong> ${item.description}</p>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Close handlers
    const closeBtn = modal.querySelector(".close-detail");
    closeBtn.addEventListener("click", () => modal.remove());
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.remove();
    });

    // Animate in
    gsap.fromTo(modal, { opacity: 0 }, { opacity: 1, duration: 0.2 });
    gsap.fromTo(
      modal.querySelector(".exploration-detail-content"),
      { scale: 0.8 },
      { scale: 1, duration: 0.3, ease: "back.out(1.7)" }
    );
  }

  updateProgress() {
    const total = Object.keys(characters).length + Object.keys(items).length;
    const discovered =
      this.discoveredCharacters.size + this.discoveredItems.size;
    const percentage = total > 0 ? (discovered / total) * 100 : 0;

    const progressFill = this.drawerPanel.querySelector(".progress-fill");
    const progressText = this.drawerPanel.querySelector(".progress-text");

    if (progressFill) {
      progressFill.style.width = percentage + "%";
    }

    if (progressText) {
      progressText.textContent = `${discovered} / ${total}`;
    }
  }

  // Sync discoveries from game state on load
  syncFromGameState(gameState) {
    // You can extend this to save/load discovered items if needed
    console.log("🔍 Syncing exploration state");
  }

  // Get exploration statistics
  getStats() {
    const total = Object.keys(characters).length + Object.keys(items).length;
    const discovered =
      this.discoveredCharacters.size + this.discoveredItems.size;

    return {
      total,
      discovered,
      characters: {
        total: Object.keys(characters).length,
        discovered: this.discoveredCharacters.size,
      },
      items: {
        total: Object.keys(items).length,
        discovered: this.discoveredItems.size,
      },
      percentage: total > 0 ? Math.round((discovered / total) * 100) : 0,
    };
  }

  destroy() {
    if (this.drawerPanel && this.drawerPanel.parentNode) {
      this.drawerPanel.parentNode.removeChild(this.drawerPanel);
    }

    if (this.drawerButton && this.drawerButton.parentNode) {
      this.drawerButton.parentNode.removeChild(this.drawerButton);
    }

    console.log("🗑️ Exploration drawer destroyed");
  }
}
