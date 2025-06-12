class VictoryScreen {
  constructor(gameEngine) {
    this.gameEngine = gameEngine;
    this.victoryElement = null;
    this.isShowing = false;
    this.isUnlocked = false; // NEW: Track if victory has been achieved
    this.victoryButton = null; // NEW: Button to reopen victory screen

    this.createVictoryUI();
    this.createVictoryButton(); // NEW: Create the reopen button
  }

  // NEW: Create a button to reopen the victory screen
  createVictoryButton() {
    this.victoryButton = document.createElement("button");
    this.victoryButton.className = "victory-trigger";
    this.victoryButton.innerHTML = "🏆";
    this.victoryButton.title = "View Victory Screen (V)";
    this.victoryButton.style.display = "none"; // Hidden until victory is achieved

    document.body.appendChild(this.victoryButton);

    // Add click listener
    this.victoryButton.addEventListener("click", () => {
      this.show();
    });

    // Add keyboard shortcut (V key)
    document.addEventListener("keydown", (e) => {
      if (
        (e.key === "v" || e.key === "V") &&
        this.isUnlocked &&
        !this.isShowing
      ) {
        if (!this.gameEngine.conversationManager.isConversationActive) {
          e.preventDefault();
          this.show();
        }
      }
    });
  }

  createVictoryUI() {
    this.victoryElement = document.createElement("div");
    this.victoryElement.className = "victory-screen";
    this.victoryElement.innerHTML = `
      <div class="victory-content">
        <div class="victory-header">
          <div class="victory-icon">🏆</div>
          <h1>Congratulations!</h1>
          <h2>You've discovered all the secrets of Albino Tomato Town!</h2>
        </div>
        
        <div class="victory-stats">
          <div class="stat-card">
            <div class="stat-icon">🎯</div>
            <div class="stat-value">4/4</div>
            <div class="stat-label">Achievements</div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">👥</div>
            <div class="stat-value" id="characters-met">0</div>
            <div class="stat-label">Characters Met</div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">📦</div>
            <div class="stat-value" id="items-found">0</div>
            <div class="stat-label">Items Found</div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">⏱️</div>
            <div class="stat-value" id="play-time">0</div>
            <div class="stat-label">Minutes Played</div>
          </div>
        </div>
        
        <div class="victory-achievements">
          <h3>Your Discoveries</h3>
          <div class="achievement-showcase">
            <div class="showcase-achievement">
              <span class="achievement-emoji">🍅</span>
              <span class="achievement-name">Grilled Tomato</span>
            </div>
            <div class="showcase-achievement">
              <span class="achievement-emoji">🐕</span>
              <span class="achievement-name">Gal's Best Friend</span>
            </div>
            <div class="showcase-achievement">
              <span class="achievement-emoji">💚</span>
              <span class="achievement-name">The Color of Envy</span>
            </div>
            <div class="showcase-achievement">
              <span class="achievement-emoji">🎃</span>
              <span class="achievement-name">Pumpkin Pals</span>
            </div>
          </div>
        </div>
        
        <div class="victory-message">
          <p>🌟 You've helped each character share their story and overcome their challenges.</p>
          <p>💡 The vegetables of Albino Tomato Town will remember your kindness!</p>
          <p>🎮 Thank you for playing!</p>
        </div>
        
        <div class="victory-actions">
          <button class="victory-button continue-playing">Continue Exploring</button>
          <button class="victory-button restart-game">Start New Game</button>
        </div>
        
        <div class="victory-footer">
          <p>🎊 Congratulations on completing Albino Tomato Town! 🎊</p>
          <div class="celebration-emojis">
            <span>🍅</span><span>🥒</span><span>🫑</span><span>🎃</span>
            <span>✨</span><span>🎉</span><span>🏆</span><span>⭐</span>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(this.victoryElement);
    this.hide();
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Continue playing button
    this.victoryElement
      .querySelector(".continue-playing")
      .addEventListener("click", () => {
        this.hide();
      });

    // Restart game button
    this.victoryElement
      .querySelector(".restart-game")
      .addEventListener("click", () => {
        if (
          confirm(
            "Are you sure you want to start a new game? This will reset all progress."
          )
        ) {
          this.gameEngine.reset();
          this.hide();
          // NEW: Hide victory button and reset unlock status on game reset
          this.isUnlocked = false;
          this.victoryButton.style.display = "none";
        }
      });
  }

  show() {
    if (this.isShowing) return;

    this.isShowing = true;

    // Update stats
    this.updateStats();

    // Show the screen
    this.victoryElement.classList.add("visible");

    // FIXED: Prevent body scrollbars by setting overflow hidden on both html and body
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    // NEW: Only play victory sequence on first show (when unlocked)
    if (!this.isUnlocked) {
      this.playVictorySequence();
      this.isUnlocked = true; // Mark as unlocked
      this.victoryButton.style.display = "block"; // Show reopen button

      // Play victory sound
      if (this.gameEngine.renderer?.assetManager) {
        this.gameEngine.renderer.assetManager.playSound(
          "effects/achievement.mp3",
          0.8
        );
      }
    } else {
      // Just show without animations for reopened victory screen
      const content = this.victoryElement.querySelector(".victory-content");
      gsap.fromTo(
        content,
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.3, ease: "power2.out" }
      );
    }

    console.log("🎉 Victory screen shown!");
  }

  hide() {
    this.isShowing = false;
    this.victoryElement.classList.remove("visible");

    // FIXED: Restore body scrolling on both html and body
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
  }

  updateStats() {
    // Get game statistics
    const gameStats = this.gameEngine.gameState.getStats();
    const explorationStats = this.gameEngine.explorationDrawer.getStats();

    // Update character count
    const charactersMet = this.victoryElement.querySelector("#characters-met");
    if (charactersMet) {
      charactersMet.textContent = explorationStats.characters.discovered;
    }

    // Update items count
    const itemsFound = this.victoryElement.querySelector("#items-found");
    if (itemsFound) {
      itemsFound.textContent = explorationStats.items.discovered;
    }

    // Update play time
    const playTime = this.victoryElement.querySelector("#play-time");
    if (playTime) {
      playTime.textContent = gameStats.playTime;
    }
  }

  playVictorySequence() {
    const content = this.victoryElement.querySelector(".victory-content");
    const header = this.victoryElement.querySelector(".victory-header");
    const stats = this.victoryElement.querySelector(".victory-stats");
    const achievements = this.victoryElement.querySelector(
      ".victory-achievements"
    );
    const message = this.victoryElement.querySelector(".victory-message");
    const actions = this.victoryElement.querySelector(".victory-actions");
    const footer = this.victoryElement.querySelector(".victory-footer");

    // Initial state
    gsap.set([header, stats, achievements, message, actions, footer], {
      opacity: 0,
      y: 30,
    });

    // Animate content in
    gsap.fromTo(
      content,
      { scale: 0.8, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.6, ease: "back.out(1.7)" }
    );

    // Staggered entrance animation
    const timeline = gsap.timeline({ delay: 0.3 });

    timeline
      .to(header, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" })
      .to(
        stats,
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
        "-=0.3"
      )
      .to(
        achievements,
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
        "-=0.3"
      )
      .to(
        message,
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
        "-=0.3"
      )
      .to(
        actions,
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
        "-=0.3"
      )
      .to(
        footer,
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
        "-=0.3"
      );

    // Animate stat cards individually
    const statCards = this.victoryElement.querySelectorAll(".stat-card");
    statCards.forEach((card, index) => {
      gsap.fromTo(
        card,
        { scale: 0.8, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.4,
          delay: 1.2 + index * 0.1,
          ease: "back.out(1.7)",
        }
      );
    });

    // Animate achievement showcase
    const showcaseAchievements = this.victoryElement.querySelectorAll(
      ".showcase-achievement"
    );
    showcaseAchievements.forEach((achievement, index) => {
      gsap.fromTo(
        achievement,
        { x: -50, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.4,
          delay: 2 + index * 0.1,
          ease: "power2.out",
        }
      );
    });

    // FIXED: Improved confetti effect with better containment
    this.createConfetti();
  }

  createConfetti() {
    const colors = ["#FFD700", "#4CAF50", "#2196F3", "#FF9800", "#E91E63"];
    const emojis = ["🍅", "🥒", "🫑", "🎃", "⭐", "🎉", "✨"];

    // FIXED: Better confetti container positioning and overflow management
    const confettiContainer = document.createElement("div");
    confettiContainer.className = "victory-confetti-container";
    confettiContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      overflow: hidden;
      z-index: 10001;
    `;

    this.victoryElement.appendChild(confettiContainer);

    for (let i = 0; i < 30; i++) {
      setTimeout(() => {
        const confetti = document.createElement("div");
        const useEmoji = Math.random() > 0.7;

        if (useEmoji) {
          confetti.textContent =
            emojis[Math.floor(Math.random() * emojis.length)];
          confetti.style.fontSize = "20px";
        } else {
          confetti.style.cssText = `
            width: 10px;
            height: 10px;
            background-color: ${
              colors[Math.floor(Math.random() * colors.length)]
            };
            border-radius: 50%;
          `;
        }

        confetti.style.cssText += `
          position: absolute;
          left: ${Math.random() * 100}vw;
          top: -20px;
          pointer-events: none;
          z-index: 10002;
        `;

        confettiContainer.appendChild(confetti);

        // FIXED: Better confetti animation with proper cleanup
        gsap.to(confetti, {
          y: window.innerHeight + 50,
          x: `+=${Math.random() * 200 - 100}`,
          rotation: Math.random() * 360,
          duration: Math.random() * 3 + 2,
          ease: "power2.in",
          onComplete: () => {
            if (confetti.parentNode) {
              confetti.parentNode.removeChild(confetti);
            }
          },
        });
      }, i * 100);
    }

    // FIXED: Clean up confetti container after all animations with safety check
    setTimeout(() => {
      if (confettiContainer && confettiContainer.parentNode) {
        confettiContainer.parentNode.removeChild(confettiContainer);
      }
    }, 8000);
  }

  // Check if victory conditions are met
  static shouldTriggerVictory(achievementManager) {
    return achievementManager.hasUnlockedAll();
  }

  // NEW: Check if victory has been unlocked (for external use)
  isVictoryUnlocked() {
    return this.isUnlocked;
  }

  // NEW: Force unlock victory (for debugging or manual triggers)
  forceUnlock() {
    this.isUnlocked = true;
    this.victoryButton.style.display = "block";
  }

  destroy() {
    // FIXED: Restore body overflow when destroying
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";

    if (this.victoryElement && this.victoryElement.parentNode) {
      this.victoryElement.parentNode.removeChild(this.victoryElement);
    }

    // NEW: Clean up victory button
    if (this.victoryButton && this.victoryButton.parentNode) {
      this.victoryButton.parentNode.removeChild(this.victoryButton);
    }

    console.log("🗑️ Victory screen destroyed");
  }
}
