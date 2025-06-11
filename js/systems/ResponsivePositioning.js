class ResponsivePositioning {
  constructor(designWidth = 1920, designHeight = 1080) {
    this.designWidth = designWidth;
    this.designHeight = designHeight;
    this.container = null;
    this.currentScale = 1;
    this.resizeObserver = null;

    this.setupResponsiveContainer();
    this.setupResizeHandling();

    console.log("📐 Responsive positioning initialized");
  }

  setupResponsiveContainer() {
    this.container = document.getElementById("game-container");
    if (!this.container) {
      console.error("Game container not found!");
      return;
    }

    // Set up main container for full viewport
    this.container.style.position = "relative";
    this.container.style.width = "100vw";
    this.container.style.height = "100vh";
    this.container.style.overflow = "hidden";
    this.container.style.backgroundColor = "#000"; // Black letterbox bars

    // Create a scaled inner container that maintains our design ratio
    this.scaledContainer = document.createElement("div");
    this.scaledContainer.className = "scaled-game-container";
    this.scaledContainer.style.position = "absolute";
    this.scaledContainer.style.width = this.designWidth + "px";
    this.scaledContainer.style.height = this.designHeight + "px";
    this.scaledContainer.style.transformOrigin = "0 0"; // Scale from top-left
    this.scaledContainer.style.backgroundColor = "transparent";

    // Move existing content to scaled container
    const existingChildren = Array.from(this.container.children);
    existingChildren.forEach((child) => {
      this.scaledContainer.appendChild(child);
    });

    this.container.appendChild(this.scaledContainer);

    this.updateScale();
  }

  setupResizeHandling() {
    // Use ResizeObserver for better performance
    this.resizeObserver = new ResizeObserver((entries) => {
      this.updateScale();
    });

    this.resizeObserver.observe(this.container);

    // Fallback for older browsers
    window.addEventListener("resize", () => {
      this.updateScale();
    });

    // Handle orientation change on mobile
    window.addEventListener("orientationchange", () => {
      setTimeout(() => this.updateScale(), 100);
    });
  }

  updateScale() {
    if (!this.container || !this.scaledContainer) return;

    // Get actual container dimensions
    const containerWidth = this.container.clientWidth;
    const containerHeight = this.container.clientHeight;

    // Calculate scale to fit while maintaining aspect ratio
    const scaleX = containerWidth / this.designWidth;
    const scaleY = containerHeight / this.designHeight;

    // Use the smaller scale to ensure everything fits (letterbox/pillarbox)
    this.currentScale = Math.min(scaleX, scaleY);

    // Calculate the actual scaled dimensions
    const scaledWidth = this.designWidth * this.currentScale;
    const scaledHeight = this.designHeight * this.currentScale;

    // Center the scaled container
    const offsetX = (containerWidth - scaledWidth) / 2;
    const offsetY = (containerHeight - scaledHeight) / 2;

    // Apply transform and positioning
    this.scaledContainer.style.transform = `scale(${this.currentScale})`;
    this.scaledContainer.style.left = offsetX + "px";
    this.scaledContainer.style.top = offsetY + "px";

    console.log(
      `📐 Scale updated: ${this.currentScale.toFixed(
        3
      )} | Container: ${containerWidth}x${containerHeight} | Scaled: ${scaledWidth.toFixed(
        0
      )}x${scaledHeight.toFixed(0)} | Offset: ${offsetX.toFixed(
        0
      )},${offsetY.toFixed(0)}`
    );
  }

  // Convert design coordinates to responsive coordinates
  getResponsivePosition(designX, designY) {
    return {
      x: (designX / this.designWidth) * 100, // Convert to percentage
      y: (designY / this.designHeight) * 100,
      unit: "%",
    };
  }

  // Convert percentage back to current pixel coordinates
  getPixelPosition(percentX, percentY) {
    const containerRect = this.scaledContainer.getBoundingClientRect();
    return {
      x: (percentX / 100) * containerRect.width,
      y: (percentY / 100) * containerRect.height,
    };
  }

  // Apply responsive positioning to an element
  applyResponsivePosition(element, designX, designY, scale = 1) {
    const responsive = this.getResponsivePosition(designX, designY);

    element.style.position = "absolute";
    element.style.left = responsive.x + "%";
    element.style.top = responsive.y + "%";

    // Apply responsive scaling to the element size too
    const baseSize = 64;
    const responsiveSize = baseSize * scale;
    element.style.width = responsiveSize + "px";
    element.style.height = responsiveSize + "px";

    // Adjust for element center positioning
    element.style.transform = "translate(-50%, -50%)";

    return responsive;
  }

  // Get the scaled container for direct access
  getScaledContainer() {
    return this.scaledContainer;
  }

  // Get current scale factor
  getCurrentScale() {
    return this.currentScale;
  }

  // Convert design coordinates to current screen coordinates (for UI positioning)
  designToScreen(designX, designY) {
    const scaledRect = this.scaledContainer.getBoundingClientRect();

    return {
      x: scaledRect.left + designX * this.currentScale,
      y: scaledRect.top + designY * this.currentScale,
    };
  }

  // Convert screen coordinates back to design coordinates
  screenToDesign(screenX, screenY) {
    const scaledRect = this.scaledContainer.getBoundingClientRect();

    return {
      x: (screenX - scaledRect.left) / this.currentScale,
      y: (screenY - scaledRect.top) / this.currentScale,
    };
  }

  // Cleanup
  destroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    window.removeEventListener("resize", this.updateScale);
    window.removeEventListener("orientationchange", this.updateScale);
  }
}
