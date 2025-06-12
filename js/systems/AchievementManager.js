class AchievementManager {
  constructor(gameEngine) {
    this.gameEngine = gameEngine;
    this.achievements = new Map();
    this.unlockedAchievements = new Set();
    this.achievementPanel = null;
    this.achievementButton = null;
    this.notificationQueue = [];
    this.isShowingNotification = false;
    this.hasNewAchievements = false;
    this.onAllAchievementsUnlocked = null; // Callback function

    this.loadAchievements();
    this.createAchievementUI();
    this.createAchievementButton();
    this.setupEventListeners();

    console.log("🏆 Achievement manager initialized");
  }

  // Set callback for when all achievements are unlocked
  setAllAchievementsUnlockedCallback(callback) {
    this.onAllAchievementsUnlocked = callback;
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

  createAchievementButton() {
    // Create floating achievements button
    this.achievementButton = document.createElement("button");
    this.achievementButton.className = "achievements-trigger";
    this.achievementButton.innerHTML = "🏆";
    this.achievementButton.title = "View Achievements (A)";
    this.achievementButton.setAttribute("data-progress", "0/4");

    document.body.appendChild(this.achievementButton);

    // Add click listener
    this.achievementButton.addEventListener("click", () => {
      this.showAchievementPanel();
    });

    // Update progress indicator
    this.updateButtonProgress();
  }

  updateButtonProgress() {
    if (this.achievementButton) {
      const unlocked = this.unlockedAchievements.size;
      const total = this.achievements.size;
      this.achievementButton.setAttribute(
        "data-progress",
        `${unlocked}/${total}`
      );

      // Add pulse animation for new achievements
      if (this.hasNewAchievements) {
        this.achievementButton.classList.add("has-new");
        // Remove the animation after a few seconds
        setTimeout(() => {
          this.achievementButton.classList.remove("has-new");
          this.hasNewAchievements = false;
        }, 5000);
      }
    }
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
    this.hideAchievementPanel();
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

    // Keyboard shortcut to open achievements
    document.addEventListener("keydown", (e) => {
      if (e.key === "a" || e.key === "A") {
        if (!this.gameEngine.conversationManager.isConversationActive) {
          e.preventDefault();
          this.showAchievementPanel();
        }
      }
    });
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
    this.hasNewAchievements = true;

    // Update game state
    this.gameEngine.gameState.unlockAchievement(achievementId);

    // Show notification
    this.queueNotification(achievement);

    // Update progress
    this.updateProgress();
    this.updateButtonProgress();

    // Check for victory condition and call callback if provided
    if (this.hasUnlockedAll() && this.onAllAchievementsUnlocked) {
      console.log("🎉 All achievements unlocked! Calling victory callback...");
      setTimeout(() => {
        this.onAllAchievementsUnlocked();
      }, 2000); // Delay to let the achievement notification show first
    }

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

    // Only show title and description for unlocked achievements
    // For locked achievements, only show hint
    let contentHtml;
    if (achievement.isUnlocked) {
      contentHtml = `
        <div class="achievement-title">${achievement.title}</div>
        <div class="achievement-description">${achievement.description}</div>
        ${unlockTimeHtml}
      `;
    } else {
      contentHtml = `
        <div class="achievement-title">???</div>
        <div class="achievement-hint">${
          achievement.hint || "Keep exploring to unlock this achievement!"
        }</div>
      `;
    }

    element.innerHTML = `
            <div class="achievement-icon">
                ${achievement.isUnlocked ? "🏆" : "🔒"}
            </div>
            <div class="achievement-content">
                ${contentHtml}
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

  // Sync achievements from game state on load
  syncFromGameState(unlockedSet) {
    console.log("🏆 Syncing achievements from game state");
    this.unlockedAchievements = new Set(unlockedSet);

    // Update achievement objects
    this.achievements.forEach((achievement, id) => {
      if (this.unlockedAchievements.has(id)) {
        achievement.isUnlocked = true;
        // Note: We don't have unlockedAt time from save, but that's ok
      }
    });

    this.updateProgress();
    this.updateButtonProgress();
    console.log("🏆 Achievement sync complete");
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
    this.updateButtonProgress();
    console.log("🏆 All achievements reset");
  }
}
