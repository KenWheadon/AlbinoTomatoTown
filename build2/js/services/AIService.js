class AIService {
  constructor() {
    this.apiUrl =
      CONFIG.AI_API_URL || "https://openrouter.ai/api/v1/chat/completions";
    this.apiKey = null; // Set this in your config or environment
    this.isAvailable = false;
    this.fallbackResponses = new Map();
    this.requestQueue = [];
    this.isProcessingQueue = false;

    this.setupFallbackResponses();
    this.checkServiceAvailability();

    console.log("🤖 AI Service initialized");
  }

  setupFallbackResponses() {
    // Generic fallback responses by character personality type
    this.fallbackResponses.set("shy", [
      "Oh... um... hello there. I don't really know what to say...",
      "I'm not very good at talking to people... sorry.",
      "Maybe we could just... sit quietly together?",
      "I hope I'm not bothering you...",
      "Sometimes I wish I could be braver...",
    ]);

    this.fallbackResponses.set("wise", [
      "Ah, my friend, wisdom comes to those who listen carefully.",
      "In my many years, I have learned that patience is a virtue.",
      "The garden teaches us many lessons, if we pay attention.",
      "Every season brings change, and with it, new understanding.",
      "Sometimes the most profound truths are found in silence.",
    ]);

    this.fallbackResponses.set("cheerful", [
      "Oh how wonderful to see you! What a beautiful day!",
      "I just love meeting new friends in the garden!",
      "Did you hear the latest news? The roses are blooming!",
      "There's always something exciting happening around here!",
      "You simply must tell me about your adventures!",
    ]);

    this.fallbackResponses.set("mysterious", [
      "Some secrets are meant to be discovered slowly...",
      "The garden holds many mysteries for those who seek them.",
      "Not all questions have simple answers, dear one.",
      "Perhaps you will understand in time...",
      "Listen carefully to what the wind whispers...",
    ]);

    // Default responses for unknown personalities
    this.fallbackResponses.set("default", [
      "Hello there! Nice to meet you.",
      "What brings you to our garden today?",
      "I hope you're enjoying your time here.",
      "Feel free to look around and explore.",
      "Is there anything you'd like to know?",
    ]);
  }

  async checkServiceAvailability() {
    if (!this.apiKey || !this.apiUrl) {
      console.warn("🤖 AI API not configured, using fallback responses only");
      this.isAvailable = false;
      return;
    }

    try {
      // Test API with a simple request
      const testResponse = await this.makeAPIRequest("test", "Hi", "test");
      this.isAvailable = true;
      console.log("🤖 AI Service is available");
    } catch (error) {
      console.warn(
        "🤖 AI Service unavailable, using fallbacks:",
        error.message
      );
      this.isAvailable = false;
    }
  }

  async generateResponse(characterKey, message, conversationHistory = []) {
    const character = characters[characterKey];
    if (!character) {
      return this.getFallbackResponse("default");
    }

    // Add to queue and process
    return new Promise((resolve) => {
      this.requestQueue.push({
        characterKey,
        character,
        message,
        conversationHistory,
        resolve,
      });

      this.processQueue();
    });
  }

  async processQueue() {
    if (this.isProcessingQueue || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    while (this.requestQueue.length > 0) {
      const request = this.requestQueue.shift();

      try {
        let response;

        if (this.isAvailable) {
          response = await this.makeAPIRequest(
            request.characterKey,
            request.message,
            request.character.prompt,
            request.conversationHistory
          );
        } else {
          response = this.getFallbackResponse(
            request.character,
            request.message
          );
        }

        request.resolve(response);

        // Rate limiting - wait between requests
        await this.delay(500);
      } catch (error) {
        console.warn(
          `🤖 AI request failed for ${request.characterKey}:`,
          error
        );
        const fallback = this.getFallbackResponse(
          request.character,
          request.message
        );
        request.resolve(fallback);
      }
    }

    this.isProcessingQueue = false;
  }

  async makeAPIRequest(
    characterKey,
    message,
    prompt,
    conversationHistory = []
  ) {
    const messages = [
      {
        role: "system",
        content: `${prompt}\n\nYou are in a cozy garden exploration game. Keep responses short (1-3 sentences), friendly, and in character. If the player asks about secrets or hidden things, be mysterious but give subtle hints.`,
      },
    ];

    // Add recent conversation history
    const recentHistory = conversationHistory.slice(-6); // Last 6 exchanges
    recentHistory.forEach((exchange) => {
      messages.push(
        { role: "user", content: exchange.player },
        { role: "assistant", content: exchange.character }
      );
    });

    // Add current message
    messages.push({ role: "user", content: message });

    const requestBody = {
      model: "anthropic/claude-3-haiku", // or your preferred model
      messages: messages,
      max_tokens: 150,
      temperature: 0.8,
      top_p: 0.9,
    };

    const response = await fetch(this.apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
        "HTTP-Referer": window.location.origin,
        "X-Title": "Albino Tomato Town",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(
        `API request failed: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    if (data.choices && data.choices[0] && data.choices[0].message) {
      return data.choices[0].message.content.trim();
    } else {
      throw new Error("Invalid API response format");
    }
  }

  getFallbackResponse(character, message = "") {
    // Try to match character personality to fallback type
    let personalityType = "default";

    if (character && character.prompt) {
      const prompt = character.prompt.toLowerCase();
      if (prompt.includes("shy") || prompt.includes("bashful")) {
        personalityType = "shy";
      } else if (
        prompt.includes("wise") ||
        prompt.includes("ancient") ||
        prompt.includes("old")
      ) {
        personalityType = "wise";
      } else if (
        prompt.includes("cheerful") ||
        prompt.includes("excited") ||
        prompt.includes("happy")
      ) {
        personalityType = "cheerful";
      } else if (
        prompt.includes("mysterious") ||
        prompt.includes("secret") ||
        prompt.includes("enigmatic")
      ) {
        personalityType = "mysterious";
      }
    }

    const responses = this.fallbackResponses.get(personalityType);

    // Simple context-aware response selection
    let selectedResponse;
    if (
      message.toLowerCase().includes("secret") ||
      message.toLowerCase().includes("hidden")
    ) {
      const mysteriousResponses = this.fallbackResponses.get("mysterious");
      selectedResponse =
        mysteriousResponses[
          Math.floor(Math.random() * mysteriousResponses.length)
        ];
    } else if (
      message.toLowerCase().includes("hello") ||
      message.toLowerCase().includes("hi")
    ) {
      selectedResponse = responses[0]; // Use first response for greetings
    } else {
      selectedResponse =
        responses[Math.floor(Math.random() * responses.length)];
    }

    return selectedResponse;
  }

  // Check for achievement triggers in the response
  checkAchievementTriggers(characterKey, response) {
    const characterAchievements = Object.values(achievements).filter(
      (achievement) => achievement.characterId === characterKey
    );

    const triggeredAchievements = [];

    characterAchievements.forEach((achievement) => {
      if (achievement.isUnlocked) return;

      const hasKeywords = achievement.triggerKeywords.some((keyword) =>
        response.toLowerCase().includes(keyword.toLowerCase())
      );

      if (hasKeywords) {
        triggeredAchievements.push(achievement.id);
      }
    });

    return triggeredAchievements;
  }

  // Generate context-aware response based on conversation history
  generateContextualResponse(characterKey, message, history) {
    const character = characters[characterKey];
    if (!character) return this.getFallbackResponse("default");

    // Simple contextual responses based on conversation patterns
    const recentMessages = history.slice(-3).map((h) => h.player.toLowerCase());

    // If player keeps asking similar questions
    if (
      recentMessages.length >= 2 &&
      recentMessages.every(
        (msg) => msg.includes("secret") || msg.includes("tell me")
      )
    ) {
      return "I can tell you're very curious! But some things are best discovered through patience and observation...";
    }

    // If player seems lost
    if (
      message.toLowerCase().includes("help") ||
      message.toLowerCase().includes("what should i do")
    ) {
      return "Try exploring the garden and talking to everyone you meet. Sometimes the most interesting discoveries come from unexpected conversations!";
    }

    return this.getFallbackResponse(character, message);
  }

  // Utility methods
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  setApiKey(key) {
    this.apiKey = key;
    this.checkServiceAvailability();
  }

  setApiUrl(url) {
    this.apiUrl = url;
    this.checkServiceAvailability();
  }

  getStats() {
    return {
      isAvailable: this.isAvailable,
      queueLength: this.requestQueue.length,
      fallbackResponseCount: Array.from(this.fallbackResponses.values()).reduce(
        (total, responses) => total + responses.length,
        0
      ),
    };
  }
}
