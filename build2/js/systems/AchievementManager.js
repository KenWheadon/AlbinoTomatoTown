class AchievementManager {
  constructor(gameEngine) {
    this.gameEngine = gameEngine;
    this.achievements = new Map();
    this.unlockedAchievements = new Set();
    this.achievementPanel = null;
    this.notificationQueue = [];
    this.isShowingNotification = false;

    this.loadAchievements();
    this.createAchievementUI();
    this.setupEventListeners();

    console.log("🏆 Achievement manager initialized");
  }

  loadAchievements() {
    // Load achievements from data file
    Object.entries(achievements).forEach(([key, achievementData]) => {
      this.achievements.set(key, {
        ...achievementData,
        id: key,
        unlockedAt: null,
        progress: 0,
      });
    });

    console.log(`🏆 Loaded ${this.achievements.size} achievements`);
  }

  createAchievementUI() {
    // Create achievement panel
    this.achievementPanel = document.createElement("div");
    this.achievementPanel.className = "achievement-panel";
    this.achievementPanel.innerHTML = `
            <div class="achievement-header">
                <h2>🏆 Achievements</h2>
                <div class="achievement-progress">
                    <div class="progress-bar">
                        <div class="progress-fill"></div>
                    </div>
                    <span class="progress-text">0 / ${this.achievements.size}</span>
                </div>
                <button class="close-achievements">×</button>
            </div>
            <div class="achievement-tabs">
                <button class="achievement-tab active" data-filter="all">All</button>
                <button class="achievement-tab" data-filter="unlocked">Unlocked</button>
                <button class="achievement-tab" data-filter="locked">Locked</button>
            </div>
            <div class="achievement-list"></div>
        `;

    document.body.appendChild(this.achievementPanel);
    this.styleAchievementPanel();
    this.hideAchievementPanel();
  }

  styleAchievementPanel() {
    const style = document.createElement("style");
    style.textContent = `
            .achievement-panel {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 600px;
                max-width: 90vw;
                max-height: 80vh;
                background: rgba(255,255,255,0.95);
                border-radius: 16px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.4);
                z-index: 1500;
                backdrop-filter: blur(10px);
                border: 2px solid rgba(74,93,58,0.3);
                display: none;
                flex-direction: column;
            }
            
            .achievement-header {
                padding: 20px;
                border-bottom: 2px solid rgba(0,0,0,0.1);
                display: flex;
                align-items: center;
                gap: 20px;
                background: rgba(74,93,58,0.1);
                border-radius: 14px 14px 0 0;
            }
            
            .achievement-header h2 {
                margin: 0;
                color: #2d3d2d;
                flex: 1;
            }
            
            .achievement-progress {
                display: flex;
                align-items: center;
                gap: 10px;
                flex: 2;
            }
            
            .progress-bar {
                flex: 1;
                height: 8px;
                background: rgba(0,0,0,0.1);
                border-radius: 4px;
                overflow: hidden;
            }
            
            .progress-fill {
                height: 100%;
                background: linear-gradient(90deg, #4CAF50, #8BC34A);
                width: 0%;
                transition: width 0.5s ease;
            }
            
            .progress-text {
                font-size: 12px;
                color: #666;
                min-width: 60px;
            }
            
            .close-achievements {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #666;
                padding: 4px 8px;
                border-radius: 4px;
                transition: all 0.2s;
            }
            
            .close-achievements:hover {
                background: rgba(255,0,0,0.1);
                color: #ff4444;
            }
            
            .achievement-tabs {
                display: flex;
                padding: 0 20px;
                background: rgba(0,0,0,0.05);
            }
            
            .achievement-tab {
                padding: 12px 20px;
                background: none;
                border: none;
                cursor: pointer;
                font-size: 14px;
                color: #666;
                border-bottom: 2px solid transparent;
                transition: all 0.2s;
            }
            
            .achievement-tab.active {
                color: #4a5d3a;
                border-bottom-color: #4a5d3a;
                font-weight: 600;
            }
            
            .achievement-list {
                flex: 1;
                overflow-y: auto;
                padding: 20px;
                max-height: 400px;
            }
            
            .achievement-item {
                display: flex;
                align-items: center;
                gap: 15px;
                padding: 15px;
                margin-bottom: 10px;
                border-radius: 12px;
                border: 2px solid transparent;
                transition: all 0.3s ease;
                position: relative;
                overflow: hidden;
            }
            
            .achievement-item.unlocked {
                background: rgba(76,175,80,0.1);
                border-color: rgba(76,175,80,0.3);
            }
            
            .achievement-item.locked {
                background: rgba(0,0,0,0.05);
                border-color: rgba(0,0,0,0.1);
            }
            
            .achievement-item:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            }
            
            .achievement-icon {
                width: 48px;
                height: 48px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                flex-shrink: 0;
            }
            
            .achievement-item.unlocked .achievement-icon {
                background: linear-gradient(135deg, #4CAF50, #8BC34A);
                color: white;
            }
            
            .achievement-item.locked .achievement-icon {
                background: #ccc;
                color: #999;
            }
            
            .achievement-content {
                flex: 1;
            }
            
            .achievement-title {
                font-size: 16px;
                font-weight: 600;
                margin: 0 0 4px 0;
            }
            
            .achievement-item.unlocked .achievement-title {
                color: #2d3d2d;
            }
            
            .achievement-item.locked .achievement-title {
                color: #999;
            }
            
            .achievement-description {
                font-size: 13px;
                color: #666;
                margin: 0 0 8px 0;
                line-height: 1.4;
            }
            
            .achievement-hint {
                font-size: 12px;
                color: #888;
                font-style: italic;
            }
            
            .achievement-item.unlocked .achievement-hint {
                display: none;
            }
            
            .achievement-unlock-time {
                font-size: 11px;
                color: #4CAF50;
                margin-top: 4px;
            }
            
            .achievement-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, #4CAF50, #8BC34A);
                color: white;
                padding: 16px 20px;
                border-radius: 12px;
                box-shadow: 0 8px 24px rgba(0,0,0,0.3);
                z-index: 2000;
                display: flex;
                align-items: center;
                gap: 12px;
                min-width: 300px;
                max-width: 400px;
            }
            
            .notification-icon {
                font-size: 32px;
                animation: bounce 0.6s ease-out;
            }
            
            .notification-content {
                flex: 1;
            }
            
            .notification-title {
                font-size: 16px;
                font-weight: 600;
                margin: 0 0 4px 0;
            }
            
            .notification-description {
                font-size: 13px;
                opacity: 0.9;
                margin: 0;
            }
            
            @keyframes bounce {
                0%, 20%, 53%, 80%, 100% {
                    transform: translateY(0);
                }
                40%, 43% {
                    transform: translateY(-20px);
                }
                70% {
                    transform: translateY(-10px);
                }
                90% {
                    transform: translateY(-4px);
                }
            }
        `;
    document.head.appendChild(style);
  }

  setupEventListeners() {
    // Close button
    this.achievementPanel
      .querySelector(".close-achievements")
      .addEventListener("click", () => {
        this.hideAchievementPanel();
      });

    // Tab buttons
    this.achievementPanel
      .querySelectorAll(".achievement-tab")
      .forEach((tab) => {
        tab.addEventListener("click", (e) => {
          this.switchTab(e.target.dataset.filter);
        });
      });

    // Listen for achievement unlocks
    GameEvents.on(GAME_EVENTS.ACHIEVEMENT_UNLOCKED, (achievementId) => {
      this.handleAchievementUnlock(achievementId);
    });

    // Keyboard shortcut to open achievements (disabled for now, but ready)
    // document.addEventListener("keydown", (e) => {
    //   if (e.key === "A" && e.ctrlKey) {
    //     e.preventDefault();
    //     this.showAchievementPanel();
    //   }
    // });
  }

  checkTriggers(characterKey, message, response) {
    console.log(`🏆 AchievementManager.checkTriggers called`);
    console.log(`🏆 Character: ${characterKey}`);
    console.log(`🏆 Message: "${message}"`);
    console.log(`🏆 Response: "${response}"`);

    const characterAchievements = Array.from(this.achievements.values()).filter(
      (achievement) => {
        console.log(
          `🏆 Checking achievement ${achievement.id}: characterId=${achievement.characterId}, target=${characterKey}`
        );
        return (
          achievement.characterId === characterKey && !achievement.isUnlocked
        );
      }
    );

    console.log(
      `🏆 Found ${characterAchievements.length} possible achievements for ${characterKey}`
    );

    characterAchievements.forEach((achievement) => {
      console.log(`🏆 Checking achievement: ${achievement.id}`);
      console.log(
        `🏆 Trigger keywords: ${JSON.stringify(achievement.triggerKeywords)}`
      );

      // Normalize the response text: lowercase and replace underscores with spaces
      const normalizedResponse = response.toLowerCase().replace(/_/g, " ");
      console.log(`🏆 Normalized response: "${normalizedResponse}"`);

      // Check if the character's response contains the trigger keyword
      const responseHasTrigger = achievement.triggerKeywords.some((keyword) => {
        // Normalize the keyword the same way
        const normalizedKeyword = keyword.toLowerCase().replace(/_/g, " ");
        const found = normalizedResponse.includes(normalizedKeyword);
        console.log(
          `🏆 Checking normalized keyword "${normalizedKeyword}" in response: ${found}`
        );
        return found;
      });

      if (responseHasTrigger) {
        console.log(
          `🏆 TRIGGER FOUND! Unlocking achievement: ${achievement.id}`
        );
        this.unlockAchievement(achievement.id);
      } else {
        console.log(`🏆 No trigger found for ${achievement.id}`);
      }
    });
  }

  unlockAchievement(achievementId) {
    const achievement = this.achievements.get(achievementId);
    if (!achievement || achievement.isUnlocked) {
      return false;
    }

    // Mark as unlocked
    achievement.isUnlocked = true;
    achievement.unlockedAt = new Date();
    this.unlockedAchievements.add(achievementId);

    // Update game state
    this.gameEngine.gameState.unlockAchievement(achievementId);

    // Show notification
    this.queueNotification(achievement);

    // Update progress
    this.updateProgress();

    console.log(`🏆 Achievement unlocked: ${achievement.title}`);
    return true;
  }

  queueNotification(achievement) {
    this.notificationQueue.push(achievement);
    if (!this.isShowingNotification) {
      this.showNextNotification();
    }
  }

  async showNextNotification() {
    if (this.notificationQueue.length === 0) {
      this.isShowingNotification = false;
      return;
    }

    this.isShowingNotification = true;
    const achievement = this.notificationQueue.shift();

    // Create notification element
    const notification = document.createElement("div");
    notification.className = "achievement-notification";
    notification.innerHTML = `
            <div class="notification-icon">🏆</div>
            <div class="notification-content">
                <div class="notification-title">Achievement Unlocked!</div>
                <div class="notification-description">${achievement.title}</div>
            </div>
        `;

    document.body.appendChild(notification);

    // Play sound (if available)
    if (this.gameEngine.renderer && this.gameEngine.renderer.assetManager) {
      this.gameEngine.renderer.assetManager.playSound(
        "effects/achievement.mp3",
        0.6
      );
    }

    // Animate in
    gsap.fromTo(
      notification,
      { opacity: 0, x: 100, scale: 0.8 },
      { opacity: 1, x: 0, scale: 1, duration: 0.5, ease: "back.out(1.7)" }
    );

    // Wait and animate out
    await Utils.wait(4000);

    gsap.to(notification, {
      opacity: 0,
      x: 100,
      scale: 0.8,
      duration: 0.3,
      ease: "power2.in",
      onComplete: () => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
        this.showNextNotification();
      },
    });
  }

  showAchievementPanel() {
    this.achievementPanel.style.display = "flex";
    this.renderAchievements("all");
    this.updateProgress();

    // Animate in
    gsap.fromTo(
      this.achievementPanel,
      { opacity: 0, scale: 0.8, y: 50 },
      { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: "back.out(1.7)" }
    );
  }

  hideAchievementPanel() {
    gsap.to(this.achievementPanel, {
      opacity: 0,
      scale: 0.8,
      y: 50,
      duration: 0.3,
      ease: "power2.in",
      onComplete: () => {
        this.achievementPanel.style.display = "none";
      },
    });
  }

  switchTab(filter) {
    // Update tab states
    this.achievementPanel
      .querySelectorAll(".achievement-tab")
      .forEach((tab) => {
        tab.classList.toggle("active", tab.dataset.filter === filter);
      });

    // Render achievements for this filter
    this.renderAchievements(filter);
  }

  renderAchievements(filter = "all") {
    const listContainer =
      this.achievementPanel.querySelector(".achievement-list");
    listContainer.innerHTML = "";

    // Filter achievements
    let achievementsToShow = Array.from(this.achievements.values());

    switch (filter) {
      case "unlocked":
        achievementsToShow = achievementsToShow.filter((a) => a.isUnlocked);
        break;
      case "locked":
        achievementsToShow = achievementsToShow.filter((a) => !a.isUnlocked);
        break;
    }

    // Sort: unlocked first, then by title
    achievementsToShow.sort((a, b) => {
      if (a.isUnlocked !== b.isUnlocked) {
        return b.isUnlocked - a.isUnlocked;
      }
      return a.title.localeCompare(b.title);
    });

    // Render each achievement
    achievementsToShow.forEach((achievement) => {
      const achievementElement = this.createAchievementElement(achievement);
      listContainer.appendChild(achievementElement);
    });

    // Animate in
    const items = listContainer.querySelectorAll(".achievement-item");
    items.forEach((item, index) => {
      gsap.fromTo(
        item,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.3,
          delay: index * 0.05,
          ease: "power2.out",
        }
      );
    });
  }

  createAchievementElement(achievement) {
    const element = document.createElement("div");
    element.className = `achievement-item ${
      achievement.isUnlocked ? "unlocked" : "locked"
    }`;

    const unlockTimeHtml =
      achievement.isUnlocked && achievement.unlockedAt
        ? `<div class="achievement-unlock-time">Unlocked: ${achievement.unlockedAt.toLocaleDateString()}</div>`
        : "";

    element.innerHTML = `
            <div class="achievement-icon">
                ${achievement.isUnlocked ? "🏆" : "🔒"}
            </div>
            <div class="achievement-content">
                <div class="achievement-title">${achievement.title}</div>
                <div class="achievement-description">${
                  achievement.description
                }</div>
                <div class="achievement-hint">${
                  achievement.hint ||
                  "Keep exploring to unlock this achievement!"
                }</div>
                ${unlockTimeHtml}
            </div>
        `;

    return element;
  }

  updateProgress() {
    const total = this.achievements.size;
    const unlocked = this.unlockedAchievements.size;
    const percentage = total > 0 ? (unlocked / total) * 100 : 0;

    const progressFill = this.achievementPanel.querySelector(".progress-fill");
    const progressText = this.achievementPanel.querySelector(".progress-text");

    if (progressFill) {
      progressFill.style.width = percentage + "%";
    }

    if (progressText) {
      progressText.textContent = `${unlocked} / ${total}`;
    }
  }

  // Handle achievement unlock event
  handleAchievementUnlock(achievementId) {
    // This method can be used for additional logic when achievements are unlocked
    // Currently the unlocking is handled directly in unlockAchievement()
    console.log(`🏆 Achievement unlock event received: ${achievementId}`);
  }

  // Get achievement statistics
  getStats() {
    return {
      total: this.achievements.size,
      unlocked: this.unlockedAchievements.size,
      locked: this.achievements.size - this.unlockedAchievements.size,
      percentage:
        this.achievements.size > 0
          ? Math.round(
              (this.unlockedAchievements.size / this.achievements.size) * 100
            )
          : 0,
    };
  }

  // Get achievements by character
  getAchievementsByCharacter(characterId) {
    return Array.from(this.achievements.values()).filter(
      (achievement) => achievement.characterId === characterId
    );
  }

  // Check if player has unlocked all achievements
  hasUnlockedAll() {
    return this.unlockedAchievements.size === this.achievements.size;
  }

  // Reset all achievements (for debugging/testing)
  resetAll() {
    this.achievements.forEach((achievement) => {
      achievement.isUnlocked = false;
      achievement.unlockedAt = null;
    });
    this.unlockedAchievements.clear();
    this.updateProgress();
    console.log("🏆 All achievements reset");
  }
}
