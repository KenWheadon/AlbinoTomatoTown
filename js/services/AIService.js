class AIService {
  constructor() {
    this.apiUrl = CONFIG.AI_API_URL;
    this.apiKey = null;
    this.isAvailable = false;
    this.isInitialized = false;
    this.fallbackResponses = new Map();
    this.requestQueue = [];
    this.isProcessingQueue = false;

    this.setupFallbackResponses();

    console.log("🤖 AI Service created (will initialize when first used)");
  }

  // Initialize the service when first needed
  async initialize() {
    if (this.isInitialized) return;

    console.log("🤖 Initializing AI Service...");

    // Wait for local config if in development
    if (CONFIG.IS_DEVELOPMENT) {
      await CONFIG.waitForLocalConfig(2000);
    }

    await this.checkServiceAvailability();
    this.isInitialized = true;

    console.log("🤖 AI Service initialization complete");
  }

  setupFallbackResponses() {
    // JSON format fallback responses
    this.fallbackResponses.set("shy", [
      {
        internal_monologue:
          "Someone's talking to me... I feel nervous and don't know what to say.",
        dialogue: "Oh... um... hello there. I don't really know what to say...",
      },
      {
        internal_monologue:
          "I wish I was braver, but talking to people makes me anxious.",
        dialogue: "I'm not very good at talking to people... sorry.",
      },
    ]);

    this.fallbackResponses.set("wise", [
      {
        internal_monologue:
          "Another seeker of wisdom has come. I should share some guidance.",
        dialogue: "Ah, my friend, wisdom comes to those who listen carefully.",
      },
      {
        internal_monologue: "The garden has taught me much over the years.",
        dialogue: "In my many years, I have learned that patience is a virtue.",
      },
    ]);

    this.fallbackResponses.set("cheerful", [
      {
        internal_monologue:
          "Oh wonderful, a new friend! I love meeting people!",
        dialogue: "Oh how wonderful to see you! What a beautiful day!",
      },
      {
        internal_monologue: "There's so much excitement in the garden today!",
        dialogue: "I just love meeting new friends in the garden!",
      },
    ]);

    this.fallbackResponses.set("mysterious", [
      {
        internal_monologue:
          "They seek answers, but some truths must be earned.",
        dialogue: "Some secrets are meant to be discovered slowly...",
      },
      {
        internal_monologue:
          "The garden holds many mysteries for those who truly seek.",
        dialogue: "The garden holds many mysteries for those who seek them.",
      },
    ]);

    this.fallbackResponses.set("default", [
      {
        internal_monologue: "A new visitor has arrived. I should be welcoming.",
        dialogue: "Hello there! Nice to meet you.",
      },
      {
        internal_monologue: "I wonder what brings them to our garden today.",
        dialogue: "What brings you to our garden today?",
      },
    ]);
  }

  async checkServiceAvailability() {
    this.apiKey = CONFIG.OPENROUTER_API_KEY;

    if (CONFIG.IS_DEVELOPMENT) {
      if (!this.apiKey || !this.apiUrl) {
        if (!this.apiKey) {
          console.warn(
            "🤖 No API key found in local config - using fallback responses"
          );
          console.log(
            "🤖 To enable AI responses: add OPENROUTER_API_KEY to js/utils/local.config.js"
          );
        }
        this.isAvailable = false;
        return;
      }
      this.isAvailable = true;
      console.log(
        "🤖 AI Service configured for development with local API key"
      );
    } else {
      this.isAvailable = true;
      console.log("🤖 AI Service configured for production (using Vercel API)");
    }

    console.log("🤖 Service available:", this.isAvailable);
  }

  async generateResponse(characterKey, message, conversationHistory = []) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const character = characters[characterKey];
    if (!character) {
      return this.getFallbackResponse("default");
    }

    console.log(`🤖 Generating response for ${characterKey}: "${message}"`);

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
          console.log(`🤖 Making API request for ${request.characterKey}`);
          response = await this.makeAPIRequest(
            request.characterKey,
            request.message,
            request.character.prompt,
            request.conversationHistory
          );
          console.log(`🤖 API response received:`, response);
        } else {
          console.log(`🤖 Using fallback response for ${request.characterKey}`);
          response = this.getFallbackResponse(
            request.character,
            request.message
          );
        }

        request.resolve(response);
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
        console.log(`🤖 Using fallback response:`, fallback);
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
        content: `${prompt}\n\nIMPORTANT: You must respond in valid JSON format with this exact structure:
{
  "internal_monologue": "Your private thoughts about the situation",
  "dialogue": "What you say to the player (1-4 sentences maximum)"
}

Keep responses short and in character. Include achievement keywords naturally in dialogue when appropriate.`,
      },
    ];

    // Add recent conversation history
    const recentHistory = conversationHistory.slice(-6);
    recentHistory.forEach((exchange) => {
      messages.push(
        { role: "user", content: exchange.player },
        { role: "assistant", content: exchange.character }
      );
    });

    messages.push({ role: "user", content: message });

    const requestBody = {
      model: CONFIG.MODEL,
      messages: messages,
      max_tokens: CONFIG.MAX_TOKENS,
      temperature: 0.8,
      top_p: 0.9,
    };

    console.log("🤖 API Request:", {
      url: this.apiUrl,
      model: CONFIG.MODEL,
      messageCount: messages.length,
      isProduction: !CONFIG.IS_DEVELOPMENT,
    });

    const headers = {
      "Content-Type": "application/json",
    };

    if (CONFIG.IS_DEVELOPMENT && this.apiKey) {
      headers["Authorization"] = `Bearer ${this.apiKey}`;
      headers["HTTP-Referer"] = CONFIG.SITE_URL;
      headers["X-Title"] = CONFIG.SITE_TITLE;
    }

    const response = await fetch(this.apiUrl, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("🤖 API Error Response:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      throw new Error(
        `API request failed: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    const data = await response.json();
    console.log("🤖 Raw API Response Data:", data);

    if (data.choices && data.choices[0] && data.choices[0].message) {
      const content = data.choices[0].message.content.trim();

      // Parse JSON response with flexible parsing
      try {
        const jsonResponse = JSON.parse(content);

        // Validate JSON structure
        if (!jsonResponse.dialogue) {
          console.warn("🤖 Invalid JSON structure, missing dialogue field");
          throw new Error("Invalid JSON structure");
        }

        console.log("🤖 Parsed JSON response:", jsonResponse);
        return jsonResponse;
      } catch (parseError) {
        console.warn(
          "🤖 Failed to parse as JSON, attempting flexible parsing:",
          parseError
        );
        console.log("🤖 Raw content:", content);

        // Return raw content and let ConversationManager handle the parsing
        return content;
      }
    } else {
      console.error("🤖 Invalid API response format:", data);
      throw new Error("Invalid API response format");
    }
  }

  getFallbackResponse(character, message = "") {
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
      selectedResponse = responses[0];
    } else {
      selectedResponse =
        responses[Math.floor(Math.random() * responses.length)];
    }

    return selectedResponse;
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
      isInitialized: this.isInitialized,
      queueLength: this.requestQueue.length,
      fallbackResponseCount: Array.from(this.fallbackResponses.values()).reduce(
        (total, responses) => total + responses.length,
        0
      ),
      environment: CONFIG.IS_DEVELOPMENT ? "development" : "production",
      apiUrl: this.apiUrl,
      hasApiKey: !!this.apiKey,
    };
  }
}
