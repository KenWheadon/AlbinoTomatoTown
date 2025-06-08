class AssetManager {
  constructor() {
    this.images = new Map();
    this.sounds = new Map();
    this.loadedAssets = new Set();
    this.failedAssets = new Set();
    this.loadingPromises = new Map(); // Add promise cache for deduplication

    // Placeholder colors for different asset types
    this.placeholderColors = {
      character: "#4CAF50",
      item: "#2196F3",
      background: "#8BC34A",
      ui: "#FF9800",
    };
  }

  // Load image with fallback to colored placeholder
  async loadImage(path, type = "character") {
    const fullPath = `images/${path}.png`;

    if (this.images.has(fullPath)) {
      return this.images.get(fullPath);
    }

    // Check if already loading to prevent race conditions
    if (this.loadingPromises.has(fullPath)) {
      return this.loadingPromises.get(fullPath);
    }

    const loadPromise = this._loadImageInternal(fullPath, type, path);
    this.loadingPromises.set(fullPath, loadPromise);

    try {
      const result = await loadPromise;
      this.loadingPromises.delete(fullPath);
      return result;
    } catch (error) {
      this.loadingPromises.delete(fullPath);
      throw error;
    }
  }

  async _loadImageInternal(fullPath, type, originalPath) {
    try {
      const img = new Image();
      const loadPromise = new Promise((resolve, reject) => {
        img.onload = () => {
          console.log(`✅ Loaded image: ${fullPath}`);
          this.images.set(fullPath, img);
          this.loadedAssets.add(fullPath);
          resolve(img);
        };

        img.onerror = () => {
          console.warn(
            `❌ Failed to load image: ${fullPath}, using placeholder`
          );
          const placeholder = this.createPlaceholderImage(type, originalPath);
          this.images.set(fullPath, placeholder);
          this.failedAssets.add(fullPath);
          resolve(placeholder);
        };
      });

      img.src = fullPath;
      return await loadPromise;
    } catch (error) {
      console.warn(`Error loading image ${fullPath}:`, error);
      const placeholder = this.createPlaceholderImage(type, originalPath);
      this.images.set(fullPath, placeholder);
      this.failedAssets.add(fullPath);
      return placeholder;
    }
  }

  // Create colored placeholder image
  createPlaceholderImage(type, name) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = 64;
    canvas.height = 64;

    // Fill with type-specific color
    ctx.fillStyle = this.placeholderColors[type] || "#666666";
    ctx.fillRect(0, 0, 64, 64);

    // Add border
    ctx.strokeStyle = "#333333";
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, 62, 62);

    // Add text label
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "10px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Truncate long names
    const displayName = name.length > 8 ? name.substring(0, 6) + ".." : name;
    ctx.fillText(displayName, 32, 32);

    const img = new Image();
    img.src = canvas.toDataURL();
    return img;
  }

  // Load background image with fallback
  async loadBackground(name) {
    const path = `backgrounds/${name}`;
    try {
      return await this.loadImage(path, "background");
    } catch (error) {
      console.warn(`Failed to load background ${name}, using solid color`);
      return this.createPlaceholderBackground(name);
    }
  }

  // Create placeholder background
  createPlaceholderBackground(name) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = 800;
    canvas.height = 600;

    // Create gradient based on location name
    const gradient = ctx.createLinearGradient(0, 0, 0, 600);

    switch (name) {
      case "garden":
        gradient.addColorStop(0, "#87CEEB");
        gradient.addColorStop(1, "#228B22");
        break;
      case "greenhouse":
        gradient.addColorStop(0, "#98FB98");
        gradient.addColorStop(1, "#006400");
        break;
      case "shed":
        gradient.addColorStop(0, "#D2B48C");
        gradient.addColorStop(1, "#8B4513");
        break;
      default:
        gradient.addColorStop(0, "#87CEEB");
        gradient.addColorStop(1, "#4682B4");
    }

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 800, 600);

    // Add location name
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.font = "48px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(name.toUpperCase(), 400, 300);

    const img = new Image();
    img.src = canvas.toDataURL();
    return img;
  }

  // Load sound with existence check
  async loadSound(path) {
    const fullPath = `sounds/${path}`;

    if (this.sounds.has(fullPath)) {
      return this.sounds.get(fullPath);
    }

    try {
      // Check if file exists first
      const response = await fetch(fullPath, { method: "HEAD" });

      if (!response.ok) {
        console.warn(`🔇 Sound file not found: ${fullPath}`);
        this.failedAssets.add(fullPath);
        return null;
      }

      const audio = new Audio(fullPath);

      return new Promise((resolve) => {
        audio.addEventListener("canplaythrough", () => {
          console.log(`🔊 Loaded sound: ${fullPath}`);
          this.sounds.set(fullPath, audio);
          this.loadedAssets.add(fullPath);
          resolve(audio);
        });

        audio.addEventListener("error", () => {
          console.warn(`🔇 Failed to load sound: ${fullPath}`);
          this.failedAssets.add(fullPath);
          resolve(null);
        });

        audio.load();
      });
    } catch (error) {
      console.warn(`Error loading sound ${fullPath}:`, error);
      this.failedAssets.add(fullPath);
      return null;
    }
  }

  // Play sound safely
  playSound(path, volume = 1.0) {
    try {
      const audio = this.sounds.get(`sounds/${path}`);
      if (audio) {
        audio.volume = volume;
        audio.currentTime = 0;
        audio.play().catch((e) => {
          console.warn(`Failed to play sound ${path}:`, e);
        });
      }
    } catch (error) {
      console.warn(`Error playing sound ${path}:`, error);
    }
  }

  // Get image (returns placeholder if original failed)
  getImage(path) {
    const fullPath = `images/${path}.png`;
    return this.images.get(fullPath);
  }

  // Preload all assets for a location
  async preloadLocationAssets(locationData) {
    const promises = [];

    // Load background
    promises.push(this.loadBackground(locationData.background));

    // Load character images
    locationData.characters.forEach((charKey) => {
      const char = characters[charKey];
      if (char) {
        promises.push(this.loadImage(`characters/${char.img}`, "character"));
      }
    });

    // Load item images
    locationData.items.forEach((itemKey) => {
      const item = items[itemKey];
      if (item) {
        promises.push(this.loadImage(`items/${item.img}`, "item"));
      }
    });

    try {
      await Promise.all(promises);
      console.log(`📦 Preloaded assets for location`);
    } catch (error) {
      console.warn("Some assets failed to load, but placeholders are ready");
    }
  }

  // Get loading statistics
  getStats() {
    return {
      loaded: this.loadedAssets.size,
      failed: this.failedAssets.size,
      total: this.loadedAssets.size + this.failedAssets.size,
    };
  }
}
