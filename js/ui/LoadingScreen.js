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
