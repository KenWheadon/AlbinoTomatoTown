class VictoryScreen {
  constructor(gameEngine) {
    this.gameEngine = gameEngine;
    this.victoryElement = null;
    this.isShowing = false;

    this.createVictoryUI();
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

    this.addVictoryStyles();
    document.body.appendChild(this.victoryElement);
    this.hide();
    this.setupEventListeners();
  }

  addVictoryStyles() {
    const style = document.createElement("style");
    style.textContent = `
      .victory-screen {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: linear-gradient(135deg, #1a5c1a, #2d3d2d);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.5s ease, visibility 0.5s ease;
        overflow-y: auto;
      }
      
      .victory-screen.visible {
        opacity: 1;
        visibility: visible;
      }
      
      .victory-content {
        max-width: 800px;
        width: 90%;
        background: rgba(255, 255, 255, 0.95);
        border-radius: 20px;
        padding: 40px;
        text-align: center;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(10px);
        border: 3px solid rgba(76, 175, 80, 0.5);
        position: relative;
        overflow: hidden;
        max-height: 90vh;
        overflow-y: auto;
      }
      
      .victory-content::before {
        content: '';
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: linear-gradient(45deg, transparent, rgba(255, 215, 0, 0.1), transparent);
        animation: victoryShimmer 3s infinite;
        pointer-events: none;
      }
      
      @keyframes victoryShimmer {
        0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
        100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
      }
      
      .victory-header {
        margin-bottom: 30px;
        position: relative;
        z-index: 1;
      }
      
      .victory-icon {
        font-size: 5rem;
        margin-bottom: 20px;
        animation: victoryBounce 2s ease-in-out infinite;
      }
      
      @keyframes victoryBounce {
        0%, 20%, 50%, 80%, 100% {
          transform: translateY(0);
        }
        40% {
          transform: translateY(-30px);
        }
        60% {
          transform: translateY(-15px);
        }
      }
      
      .victory-header h1 {
        font-size: 2.5rem;
        color: #2d3d2d;
        margin: 0 0 10px 0;
        text-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      
      .victory-header h2 {
        font-size: 1.2rem;
        color: #4a5d3a;
        margin: 0;
        font-weight: normal;
        opacity: 0.9;
      }
      
      .victory-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 20px;
        margin-bottom: 40px;
        position: relative;
        z-index: 1;
      }
      
      .stat-card {
        background: rgba(76, 175, 80, 0.1);
        border-radius: 16px;
        padding: 20px;
        border: 2px solid rgba(76, 175, 80, 0.3);
        transition: all 0.3s ease;
      }
      
      .stat-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 20px rgba(76, 175, 80, 0.2);
      }
      
      .stat-icon {
        font-size: 2rem;
        margin-bottom: 10px;
      }
      
      .stat-value {
        font-size: 1.8rem;
        font-weight: bold;
        color: #2d3d2d;
        margin-bottom: 5px;
      }
      
      .stat-label {
        font-size: 0.9rem;
        color: #666;
        font-weight: 500;
      }
      
      .victory-achievements {
        margin-bottom: 40px;
        position: relative;
        z-index: 1;
      }
      
      .victory-achievements h3 {
        font-size: 1.5rem;
        color: #2d3d2d;
        margin-bottom: 20px;
      }
      
      .achievement-showcase {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;
      }
      
      .showcase-achievement {
        background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 193, 7, 0.1));
        border-radius: 12px;
        padding: 16px;
        border: 2px solid rgba(255, 193, 7, 0.3);
        display: flex;
        align-items: center;
        gap: 12px;
        transition: all 0.3s ease;
      }
      
      .showcase-achievement:hover {
        transform: scale(1.05);
        box-shadow: 0 4px 12px rgba(255, 193, 7, 0.3);
      }
      
      .achievement-emoji {
        font-size: 1.5rem;
        flex-shrink: 0;
      }
      
      .achievement-name {
        font-weight: 600;
        color: #2d3d2d;
      }
      
      .victory-message {
        margin-bottom: 40px;
        position: relative;
        z-index: 1;
      }
      
      .victory-message p {
        font-size: 1.1rem;
        line-height: 1.6;
        color: #4a5d3a;
        margin: 10px 0;
      }
      
      .victory-actions {
        display: flex;
        gap: 20px;
        justify-content: center;
        margin-bottom: 30px;
        position: relative;
        z-index: 1;
        flex-wrap: wrap;
      }
      
      .victory-button {
        padding: 15px 30px;
        border: none;
        border-radius: 12px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        min-width: 160px;
      }
      
      .victory-button.continue-playing {
        background: linear-gradient(135deg, #4CAF50, #8BC34A);
        color: white;
        box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
      }
      
      .victory-button.continue-playing:hover {
        background: linear-gradient(135deg, #45a049, #7cb342);
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(76, 175, 80, 0.4);
      }
      
      .victory-button.restart-game {
        background: linear-gradient(135deg, #FF9800, #FFB74D);
        color: white;
        box-shadow: 0 4px 12px rgba(255, 152, 0, 0.3);
      }
      
      .victory-button.restart-game:hover {
        background: linear-gradient(135deg, #f57c00, #ffb300);
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(255, 152, 0, 0.4);
      }
      
      .victory-footer {
        position: relative;
        z-index: 1;
        border-top: 2px solid rgba(76, 175, 80, 0.2);
        padding-top: 20px;
      }
      
      .victory-footer p {
        font-size: 1.1rem;
        color: #4a5d3a;
        margin-bottom: 15px;
        font-weight: 600;
      }
      
      .celebration-emojis {
        display: flex;
        justify-content: center;
        gap: 15px;
        font-size: 1.5rem;
      }
      
      .celebration-emojis span {
        animation: celebrationFloat 3s ease-in-out infinite;
        display: inline-block;
      }
      
      .celebration-emojis span:nth-child(2n) {
        animation-delay: 0.5s;
      }
      
      .celebration-emojis span:nth-child(3n) {
        animation-delay: 1s;
      }
      
      .celebration-emojis span:nth-child(4n) {
        animation-delay: 1.5s;
      }
      
      @keyframes celebrationFloat {
        0%, 100% {
          transform: translateY(0) rotate(0deg);
        }
        25% {
          transform: translateY(-10px) rotate(5deg);
        }
        50% {
          transform: translateY(-5px) rotate(-5deg);
        }
        75% {
          transform: translateY(-15px) rotate(10deg);
        }
      }
      
      /* Mobile responsive */
      @media (max-width: 768px) {
        .victory-content {
          padding: 30px 20px;
          width: 95%;
        }
        
        .victory-header h1 {
          font-size: 2rem;
        }
        
        .victory-header h2 {
          font-size: 1rem;
        }
        
        .victory-icon {
          font-size: 4rem;
        }
        
        .victory-stats {
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
        }
        
        .stat-card {
          padding: 15px;
        }
        
        .stat-value {
          font-size: 1.5rem;
        }
        
        .achievement-showcase {
          grid-template-columns: 1fr;
        }
        
        .victory-actions {
          flex-direction: column;
          align-items: center;
        }
        
        .victory-button {
          min-width: 200px;
        }
        
        .celebration-emojis {
          gap: 10px;
          font-size: 1.2rem;
        }
      }
    `;
    document.head.appendChild(style);
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

    // Play victory sequence
    this.playVictorySequence();

    // Play victory sound
    if (this.gameEngine.renderer?.assetManager) {
      // Play a special victory sound or use achievement sound
      this.gameEngine.renderer.assetManager.playSound(
        "effects/achievement.mp3",
        0.8
      );
    }

    console.log("🎉 Victory screen shown!");
  }

  hide() {
    this.isShowing = false;
    this.victoryElement.classList.remove("visible");
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

    // Confetti effect
    this.createConfetti();
  }

  createConfetti() {
    const colors = ["#FFD700", "#4CAF50", "#2196F3", "#FF9800", "#E91E63"];
    const emojis = ["🍅", "🥒", "🫑", "🎃", "⭐", "🎉", "✨"];

    for (let i = 0; i < 50; i++) {
      setTimeout(() => {
        const confetti = document.createElement("div");
        const useEmoji = Math.random() > 0.7;

        if (useEmoji) {
          confetti.textContent =
            emojis[Math.floor(Math.random() * emojis.length)];
          confetti.style.fontSize = "20px";
        } else {
          confetti.style.width = "10px";
          confetti.style.height = "10px";
          confetti.style.backgroundColor =
            colors[Math.floor(Math.random() * colors.length)];
          confetti.style.borderRadius = "50%";
        }

        confetti.style.position = "fixed";
        confetti.style.left = Math.random() * 100 + "vw";
        confetti.style.top = "-20px";
        confetti.style.pointerEvents = "none";
        confetti.style.zIndex = "10001";

        document.body.appendChild(confetti);

        gsap.to(confetti, {
          y: window.innerHeight + 50,
          x: `+=${Math.random() * 200 - 100}`,
          rotation: Math.random() * 360,
          duration: Math.random() * 3 + 2,
          ease: "power2.in",
          onComplete: () => confetti.remove(),
        });
      }, i * 100);
    }
  }

  // Check if victory conditions are met
  static shouldTriggerVictory(achievementManager) {
    return achievementManager.hasUnlockedAll();
  }

  destroy() {
    if (this.victoryElement && this.victoryElement.parentNode) {
      this.victoryElement.parentNode.removeChild(this.victoryElement);
    }
    console.log("🗑️ Victory screen destroyed");
  }
}
