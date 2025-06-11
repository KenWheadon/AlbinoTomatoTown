class LoadingScreen {
  constructor() {
    this.loadingElement = null;
    this.progressBar = null;
    this.progressText = null;
    this.statusText = null;
    this.isVisible = false;

    this.createLoadingUI();
  }

  createLoadingUI() {
    // Create loading overlay
    this.loadingElement = document.createElement("div");
    this.loadingElement.className = "loading-screen";
    this.loadingElement.innerHTML = `
      <div class="loading-content">
        <div class="loading-logo">
          <div class="tomato-icon">🍅</div>
          <h1>Albino Tomato Town</h1>
        </div>
        
        <div class="loading-progress">
          <div class="progress-bar-container">
            <div class="progress-bar">
              <div class="progress-fill"></div>
            </div>
            <div class="progress-text">0%</div>
          </div>
          <div class="loading-status">Loading assets...</div>
        </div>
        
        <div class="loading-tips">
          <p>💡 <span class="tip-text">Click on characters and items to interact with them</span></p>
        </div>
      </div>
    `;

    // Add styles
    this.addLoadingStyles();

    // Get references
    this.progressBar = this.loadingElement.querySelector(".progress-fill");
    this.progressText = this.loadingElement.querySelector(".progress-text");
    this.statusText = this.loadingElement.querySelector(".loading-status");

    // Add to DOM but hide initially
    document.body.appendChild(this.loadingElement);
    this.hide();

    // Rotate tips
    this.startTipRotation();
  }

  addLoadingStyles() {
    const style = document.createElement("style");
    style.textContent = `
      .loading-screen {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: linear-gradient(135deg, #2d3d2d, #1a2a1a);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.5s ease, visibility 0.5s ease;
      }
      
      .loading-screen.visible {
        opacity: 1;
        visibility: visible;
      }
      
      .loading-content {
        text-align: center;
        color: white;
        max-width: 400px;
        width: 90%;
      }
      
      .loading-logo {
        margin-bottom: 40px;
      }
      
      .tomato-icon {
        font-size: 4rem;
        margin-bottom: 16px;
        animation: bounce 2s ease-in-out infinite;
      }
      
      .loading-logo h1 {
        font-size: 2rem;
        margin: 0;
        color: #8bc34a;
        text-shadow: 0 2px 4px rgba(0,0,0,0.5);
      }
      
      .loading-progress {
        margin-bottom: 40px;
      }
      
      .progress-bar-container {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 12px;
      }
      
      .progress-bar {
        flex: 1;
        height: 8px;
        background: rgba(255,255,255,0.2);
        border-radius: 4px;
        overflow: hidden;
        position: relative;
      }
      
      .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #4caf50, #8bc34a);
        width: 0%;
        transition: width 0.3s ease;
        position: relative;
      }
      
      .progress-fill::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
        animation: shimmer 2s infinite;
      }
      
      .progress-text {
        font-weight: bold;
        min-width: 40px;
        color: #8bc34a;
      }
      
      .loading-status {
        font-size: 14px;
        color: rgba(255,255,255,0.8);
        font-style: italic;
      }
      
      .loading-tips {
        padding: 20px;
        background: rgba(255,255,255,0.1);
        border-radius: 12px;
        border: 1px solid rgba(255,255,255,0.2);
      }
      
      .loading-tips p {
        margin: 0;
        font-size: 14px;
        color: rgba(255,255,255,0.9);
      }
      
      .tip-text {
        font-weight: 500;
      }
      
      @keyframes bounce {
        0%, 20%, 50%, 80%, 100% {
          transform: translateY(0);
        }
        40% {
          transform: translateY(-20px);
        }
        60% {
          transform: translateY(-10px);
        }
      }
      
      @keyframes shimmer {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
      
      @keyframes fadeInOut {
        0%, 100% { opacity: 0.7; }
        50% { opacity: 1; }
      }
      
      /* Mobile responsive */
      @media (max-width: 768px) {
        .loading-logo h1 {
          font-size: 1.5rem;
        }
        
        .tomato-icon {
          font-size: 3rem;
        }
        
        .loading-content {
          width: 95%;
        }
        
        .progress-bar-container {
          gap: 12px;
        }
        
        .loading-tips {
          padding: 16px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  startTipRotation() {
    const tips = [
      "Click on characters and items to interact with them",
      "Look for clues in item descriptions to unlock achievements",
      "Each character has a secret waiting to be discovered",
      "Try asking characters about different topics",
      "Some achievements require specific conversations",
      "Explore all locations to find hidden items",
      "Press 'A' to open your achievements panel anytime",
    ];

    let currentTip = 0;
    const tipElement = this.loadingElement.querySelector(".tip-text");

    setInterval(() => {
      if (this.isVisible) {
        currentTip = (currentTip + 1) % tips.length;

        // Fade out
        gsap.to(tipElement, {
          opacity: 0,
          duration: 0.3,
          onComplete: () => {
            tipElement.textContent = tips[currentTip];
            // Fade in
            gsap.to(tipElement, {
              opacity: 1,
              duration: 0.3,
            });
          },
        });
      }
    }, 3000);
  }

  show() {
    this.isVisible = true;
    this.loadingElement.classList.add("visible");

    // Animate logo
    const logo = this.loadingElement.querySelector(".loading-logo");
    gsap.fromTo(
      logo,
      { opacity: 0, y: -30 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
    );

    // Animate progress bar
    const progressContainer =
      this.loadingElement.querySelector(".loading-progress");
    gsap.fromTo(
      progressContainer,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, delay: 0.2, ease: "power2.out" }
    );

    // Animate tips
    const tips = this.loadingElement.querySelector(".loading-tips");
    gsap.fromTo(
      tips,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, delay: 0.4, ease: "power2.out" }
    );
  }

  hide() {
    this.isVisible = false;
    this.loadingElement.classList.remove("visible");
  }

  updateProgress(progress) {
    if (!this.progressBar || !this.progressText || !this.statusText) return;

    // Update progress bar
    this.progressBar.style.width = progress.percentage + "%";
    this.progressText.textContent = progress.percentage + "%";

    // Update status text based on progress
    let status = "Loading assets...";
    if (progress.percentage < 25) {
      status = "Loading backgrounds...";
    } else if (progress.percentage < 50) {
      status = "Loading characters...";
    } else if (progress.percentage < 75) {
      status = "Loading items...";
    } else if (progress.percentage < 100) {
      status = "Loading sounds...";
    } else {
      status = "Ready to explore!";
    }

    this.statusText.textContent = status;

    // Add completion effect
    if (progress.percentage === 100) {
      setTimeout(() => {
        this.showReadyAnimation();
      }, 500);
    }
  }

  showReadyAnimation() {
    const content = this.loadingElement.querySelector(".loading-content");

    // Pulse effect
    gsap.to(content, {
      scale: 1.05,
      duration: 0.3,
      yoyo: true,
      repeat: 1,
      ease: "power2.inOut",
      onComplete: () => {
        // Ready message
        this.statusText.textContent = "🌟 Ready to explore Albino Tomato Town!";
        this.statusText.style.color = "#8bc34a";
        this.statusText.style.fontWeight = "bold";

        // Auto-hide after a moment
        setTimeout(() => {
          this.fadeOut();
        }, 1500);
      },
    });
  }

  fadeOut() {
    gsap.to(this.loadingElement, {
      opacity: 0,
      duration: 0.8,
      ease: "power2.inOut",
      onComplete: () => {
        this.hide();
      },
    });
  }

  // Force hide (for debugging or immediate start)
  forceHide() {
    this.hide();
  }

  destroy() {
    if (this.loadingElement && this.loadingElement.parentNode) {
      this.loadingElement.parentNode.removeChild(this.loadingElement);
    }
  }
}
