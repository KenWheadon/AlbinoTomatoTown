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
        <button class="exploration-tab" data-filter="undiscovered">Missing</button>
      </div>
      
      <div class="exploration-content">
        <div class="exploration-list"></div>
      </div>
      
      <div class="exploration-footer">
        <p class="exploration-hint">💡 Interact with characters and items to discover them!</p>
      </div>
    `;

    this.addExplorationStyles();
    document.body.appendChild(this.drawerPanel);
    this.hideDrawer();
  }

  addExplorationStyles() {
    const style = document.createElement("style");
    style.textContent = `
      /* Exploration Drawer Styles */
      .exploration-trigger {
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #2196F3, #21CBF3);
        color: white;
        border: none;
        border-radius: 50%;
        width: 60px;
        height: 60px;
        font-size: 24px;
        cursor: pointer;
        z-index: 500;
        transition: all 0.3s ease;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: inherit;
      }

      .exploration-trigger:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
        background: linear-gradient(135deg, #1976D2, #00BCD4);
      }

      .exploration-trigger::after {
        content: attr(data-discovered);
        position: absolute;
        bottom: -8px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(255, 255, 255, 0.9);
        color: #2d3d2d;
        font-size: 10px;
        font-weight: bold;
        padding: 2px 6px;
        border-radius: 10px;
        min-width: 30px;
        text-align: center;
        line-height: 1;
      }

      .exploration-drawer {
        position: fixed;
        top: 5vh;
        right: 50%;
        transform: translateX(50%);
        width: 700px;
        max-width: 90vw;
        max-height: 90vh;
        background: rgba(255, 255, 255, 0.95);
        border-radius: 16px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
        z-index: 1500;
        backdrop-filter: blur(10px);
        border: 2px solid rgba(33, 150, 243, 0.3);
        display: none;
        flex-direction: column;
      }

      .exploration-header {
        padding: 20px;
        border-bottom: 2px solid rgba(0, 0, 0, 0.1);
        display: flex;
        align-items: center;
        gap: 20px;
        background: rgba(33, 150, 243, 0.1);
        border-radius: 14px 14px 0 0;
        flex-shrink: 0;
      }

      .exploration-header h2 {
        margin: 0;
        color: #2d3d2d;
        flex: 1;
      }

      .exploration-progress {
        display: flex;
        align-items: center;
        gap: 10px;
        flex: 2;
      }

      .exploration-progress .progress-bar {
        flex: 1;
        height: 8px;
        background: rgba(0, 0, 0, 0.1);
        border-radius: 4px;
        overflow: hidden;
      }

      .exploration-progress .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #2196F3, #21CBF3);
        width: 0%;
        transition: width 0.5s ease;
      }

      .exploration-progress .progress-text {
        font-size: 12px;
        color: #666;
        min-width: 80px;
      }

      .close-exploration {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #666;
        padding: 4px 8px;
        border-radius: 4px;
        transition: all 0.2s;
      }

      .close-exploration:hover {
        background: rgba(255, 0, 0, 0.1);
        color: #ff4444;
      }

      .exploration-tabs {
        display: flex;
        padding: 0 20px;
        background: rgba(0, 0, 0, 0.05);
        flex-shrink: 0;
        overflow-x: auto;
      }

      .exploration-tab {
        padding: 12px 16px;
        background: none;
        border: none;
        cursor: pointer;
        font-size: 13px;
        color: #666;
        border-bottom: 2px solid transparent;
        transition: all 0.2s;
        white-space: nowrap;
        flex-shrink: 0;
      }

      .exploration-tab.active {
        color: #2196F3;
        border-bottom-color: #2196F3;
        font-weight: 600;
      }

      .exploration-tab:hover:not(.active) {
        color: #333;
        background: rgba(0, 0, 0, 0.05);
      }

      .exploration-content {
        flex: 1;
        overflow-y: auto;
        padding: 20px;
        min-height: 0;
      }

      .exploration-list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 16px;
      }

      .exploration-item {
        background: white;
        border-radius: 12px;
        padding: 16px;
        border: 2px solid transparent;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
        cursor: pointer;
      }

      .exploration-item.discovered {
        border-color: rgba(76, 175, 80, 0.3);
        background: rgba(76, 175, 80, 0.05);
      }

      .exploration-item.undiscovered {
        border-color: rgba(0, 0, 0, 0.1);
        background: rgba(0, 0, 0, 0.02);
      }

      .exploration-item:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      .exploration-item-image {
        width: 60px;
        height: 60px;
        border-radius: 8px;
        margin: 0 auto 12px;
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        position: relative;
        border: 2px solid rgba(0, 0, 0, 0.1);
      }

      .exploration-item.undiscovered .exploration-item-image {
        background: #333;
        position: relative;
        overflow: hidden;
      }

      .exploration-item.undiscovered .exploration-item-image::before {
        content: '?';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: #666;
        font-size: 24px;
        font-weight: bold;
      }

      .exploration-item.undiscovered .exploration-item-image::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: repeating-linear-gradient(
          45deg,
          transparent,
          transparent 2px,
          rgba(0,0,0,0.1) 2px,
          rgba(0,0,0,0.1) 4px
        );
      }

      .exploration-item-type {
        position: absolute;
        top: 8px;
        right: 8px;
        background: rgba(0, 0, 0, 0.7);
        color: white;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 10px;
        font-weight: bold;
      }

      .exploration-item-type.character {
        background: rgba(76, 175, 80, 0.8);
      }

      .exploration-item-type.item {
        background: rgba(33, 150, 243, 0.8);
      }

      .exploration-item-name {
        font-size: 14px;
        font-weight: 600;
        margin-bottom: 4px;
        text-align: center;
      }

      .exploration-item.discovered .exploration-item-name {
        color: #2d3d2d;
      }

      .exploration-item.undiscovered .exploration-item-name {
        color: #999;
      }

      .exploration-item-description {
        font-size: 12px;
        color: #666;
        text-align: center;
        line-height: 1.3;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .exploration-item.undiscovered .exploration-item-description {
        color: #999;
        font-style: italic;
      }

      .exploration-item-location {
        font-size: 10px;
        color: #888;
        text-align: center;
        margin-top: 8px;
        padding-top: 8px;
        border-top: 1px solid rgba(0, 0, 0, 0.1);
      }

      .exploration-item.discovered .exploration-item-location {
        color: #4CAF50;
      }

      .exploration-footer {
        padding: 16px 20px;
        border-top: 1px solid rgba(0, 0, 0, 0.1);
        background: rgba(0, 0, 0, 0.02);
        border-radius: 0 0 14px 14px;
        flex-shrink: 0;
      }

      .exploration-hint {
        margin: 0;
        font-size: 12px;
        color: #666;
        text-align: center;
        font-style: italic;
      }

      /* Discovery notification */
      .discovery-notification {
        position: fixed;
        top: 80px;
        right: 20px;
        background: linear-gradient(135deg, #2196F3, #21CBF3);
        color: white;
        padding: 12px 16px;
        border-radius: 12px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
        z-index: 2000;
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 200px;
        max-width: 300px;
        animation: slideInRight 0.5s ease-out;
      }

      .discovery-notification-icon {
        font-size: 20px;
        flex-shrink: 0;
      }

      .discovery-notification-text {
        flex: 1;
        font-size: 13px;
      }

      @keyframes slideInRight {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      /* Exploration Detail Modal */
      .exploration-detail-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0,0,0,0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
      }

      .exploration-detail-content {
        background: white;
        border-radius: 16px;
        padding: 24px;
        max-width: 400px;
        width: 90%;
        box-shadow: 0 20px 40px rgba(0,0,0,0.3);
      }

      .exploration-detail-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding-bottom: 12px;
        border-bottom: 2px solid rgba(0,0,0,0.1);
      }

      .exploration-detail-header h3 {
        margin: 0;
        color: #2d3d2d;
        font-size: 1.4rem;
      }

      .close-detail {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #666;
        padding: 4px 8px;
        border-radius: 4px;
        transition: all 0.2s;
      }

      .close-detail:hover {
        background: rgba(255, 0, 0, 0.1);
        color: #ff4444;
      }

      .exploration-detail-body {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
      }

      .exploration-detail-image {
        width: 100px;
        height: 100px;
        background-size: cover;
        background-position: center;
        border-radius: 12px;
        border: 2px solid #ddd;
        flex-shrink: 0;
      }

      .exploration-detail-info {
        text-align: left;
        width: 100%;
      }

      .exploration-detail-info p {
        margin: 8px 0;
        line-height: 1.4;
      }

      .exploration-detail-info strong {
        color: #2d3d2d;
      }

      /* Mobile responsive */
      @media (max-width: 768px) {
        .exploration-trigger {
          width: 50px;
          height: 50px;
          font-size: 20px;
          top: 10px;
          right: 10px;
        }

        .exploration-trigger::after {
          font-size: 9px;
          min-width: 25px;
        }

        .exploration-drawer {
          top: 2vh;
          max-height: 96vh;
          width: 95vw;
        }

        .exploration-header {
          padding: 15px;
          flex-wrap: wrap;
          gap: 10px;
        }

        .exploration-progress {
          flex: auto;
          min-width: 150px;
        }

        .exploration-tabs {
          padding: 0 15px;
        }

        .exploration-tab {
          padding: 10px 12px;
          font-size: 12px;
        }

        .exploration-content {
          padding: 15px;
        }

        .exploration-list {
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 12px;
        }

        .exploration-item {
          padding: 12px;
        }

        .exploration-item-image {
          width: 50px;
          height: 50px;
        }

        .discovery-notification {
          top: 70px;
          right: 10px;
          left: 10px;
          min-width: auto;
          max-width: none;
        }

        .exploration-detail-content {
          padding: 20px;
          width: 95%;
        }

        .exploration-detail-image {
          width: 80px;
          height: 80px;
        }
      }
    `;
    document.head.appendChild(style);
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
      case "undiscovered":
        return items.filter((item) => !item.discovered);
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

    // Get image
    let imageStyle = "";
    if (item.discovered) {
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
    }

    element.innerHTML = `
      <div class="exploration-item-type ${item.type}">${item.type}</div>
      <div class="exploration-item-image" style="${imageStyle}"></div>
      <div class="exploration-item-name">${item.name}</div>
      <div class="exploration-item-description">
        ${item.discovered ? item.description : "Interact to discover..."}
      </div>
      <div class="exploration-item-location">📍 ${item.location}</div>
    `;

    // Add click handler for discovered items
    if (item.discovered) {
      element.addEventListener("click", () => {
        this.showItemDetails(item);
      });
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
