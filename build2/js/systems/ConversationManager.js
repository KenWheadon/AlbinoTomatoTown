class ConversationManager {
  constructor(gameEngine) {
    this.gameEngine = gameEngine;
    this.aiService = new AIService();
    this.currentCharacter = null;
    this.isConversationActive = false;
    this.conversationPanel = null;
    this.messageHistory = [];
    this.isWaitingForResponse = false;

    this.createConversationUI();
    this.setupEventListeners();

    console.log("💬 Conversation manager initialized");
  }

  createConversationUI() {
    // Create conversation panel
    this.conversationPanel = document.createElement("div");
    this.conversationPanel.className = "conversation-panel";
    this.conversationPanel.innerHTML = `
            <div class="conversation-header">
                <div class="character-info">
                    <div class="character-name"></div>
                    <div class="character-description"></div>
                </div>
                <button class="close-conversation">×</button>
            </div>
            <div class="conversation-messages"></div>
            <div class="conversation-input-area">
                <input type="text" class="conversation-input" placeholder="Type your message...">
                <button class="send-button">Send</button>
            </div>
            <div class="conversation-footer">
                <div class="typing-indicator">
                    <span class="typing-dots">
                        <span></span><span></span><span></span>
                    </span>
                    <span class="typing-text">Character is thinking...</span>
                </div>
            </div>
        `;

    document.body.appendChild(this.conversationPanel);
    this.hideConversation();
  }

  setupEventListeners() {
    // Close button - ONLY way to close conversation
    this.conversationPanel
      .querySelector(".close-conversation")
      .addEventListener("click", () => {
        this.endConversation();
      });

    // Send button
    this.conversationPanel
      .querySelector(".send-button")
      .addEventListener("click", () => {
        this.sendMessage();
      });

    // Enter key in input
    this.conversationPanel
      .querySelector(".conversation-input")
      .addEventListener("keypress", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage();
        }
      });

    // Stop propagation on conversation panel clicks to prevent outside clicks
    this.conversationPanel.addEventListener("click", (e) => {
      e.stopPropagation();
    });
  }

  async startConversation(characterKey, character) {
    console.log(
      `💬 START CONVERSATION - Current: ${this.currentCharacter}, New: ${characterKey}, Active: ${this.isConversationActive}`
    );

    if (this.isConversationActive) {
      console.log(
        `💬 Ending existing conversation with ${this.currentCharacter}`
      );
      this.endConversation();
    }

    this.currentCharacter = characterKey;
    this.isConversationActive = true;
    this.messageHistory = [];

    console.log(`💬 Setting up new conversation with ${characterKey}`);

    // Update UI
    this.updateCharacterInfo(character);
    this.clearMessages();
    this.showConversation();

    // Disable world interactions
    this.gameEngine.interactionHandler.setInteractionsEnabled(false);

    // Get conversation history
    const history =
      this.gameEngine.gameState.getConversationHistory(characterKey);
    console.log(
      `💬 Found ${history.length} previous messages with ${characterKey}`
    );

    // Generate greeting
    const greeting = await this.generateGreeting(character, history);
    console.log(`💬 Generated greeting: "${greeting}"`);
    this.addMessage("character", greeting);

    // Focus input
    this.conversationPanel.querySelector(".conversation-input").focus();

    // Emit event
    GameEvents.emit(GAME_EVENTS.CONVERSATION_STARTED, {
      characterKey,
      character,
    });

    console.log(`💬 Conversation with ${characterKey} fully initialized`);
  }

  async generateGreeting(character, history) {
    if (history.length === 0) {
      return this.getFirstMeetingGreeting(character);
    } else {
      // Returning visitor greeting
      const contextualGreeting = await this.aiService.generateResponse(
        this.currentCharacter,
        "The player has returned to talk to you again. Give a brief, friendly greeting acknowledging you've met before.",
        history
      );
      return contextualGreeting;
    }
  }

  getFirstMeetingGreeting(character) {
    // Simple greeting based on character personality
    const prompt = character.prompt.toLowerCase();

    if (prompt.includes("shy") || prompt.includes("bashful")) {
      return "Oh! H-hello there... I wasn't expecting visitors...";
    } else if (prompt.includes("wise") || prompt.includes("ancient")) {
      return "Welcome, young traveler. I sense you have questions to ask.";
    } else if (prompt.includes("cheerful") || prompt.includes("excited")) {
      return "Oh wonderful! A new friend has come to visit! How delightful!";
    } else if (prompt.includes("mysterious")) {
      return "Ah... so you've found me. I wondered when someone would come asking the right questions...";
    } else {
      return "Hello there! Nice to meet you. What brings you to our garden?";
    }
  }

  async sendMessage() {
    const input = this.conversationPanel.querySelector(".conversation-input");
    const message = input.value.trim();

    if (!message || this.isWaitingForResponse) {
      console.log(
        `💬 SEND MESSAGE BLOCKED - Message: "${message}", Waiting: ${this.isWaitingForResponse}`
      );
      return;
    }

    console.log(`💬 SENDING MESSAGE: "${message}" to ${this.currentCharacter}`);

    // Clear input and disable it
    input.value = "";
    input.disabled = true;
    this.conversationPanel.querySelector(".send-button").disabled = true;
    this.isWaitingForResponse = true;

    // Add player message
    this.addMessage("player", message);

    // Show typing indicator
    this.showTypingIndicator();

    try {
      // Get conversation history for context
      const history = this.gameEngine.gameState.getConversationHistory(
        this.currentCharacter
      );
      console.log(`💬 Using ${history.length} previous messages for context`);

      // Generate AI response
      console.log(`💬 Requesting AI response from ${this.currentCharacter}`);
      const response = await this.aiService.generateResponse(
        this.currentCharacter,
        message,
        history
      );
      console.log(`💬 AI RESPONSE RECEIVED: "${response}"`);

      // Hide typing indicator
      this.hideTypingIndicator();

      // Add character response
      this.addMessage("character", response);

      // Save to conversation history
      this.gameEngine.gameState.addConversation(
        this.currentCharacter,
        message,
        response
      );
      console.log(`💬 Conversation saved to game state`);

      // Check for achievement triggers
      this.checkAchievementTriggers(message, response);
    } catch (error) {
      console.error("💬 ERROR generating response:", error);
      this.hideTypingIndicator();
      this.addMessage(
        "character",
        "I'm sorry, I seem to have lost my words for a moment..."
      );
    }

    // Re-enable input
    input.disabled = false;
    this.conversationPanel.querySelector(".send-button").disabled = false;
    this.isWaitingForResponse = false;
    input.focus();

    console.log(`💬 Message send cycle completed`);
  }

  addMessage(sender, text) {
    const messagesContainer = this.conversationPanel.querySelector(
      ".conversation-messages"
    );

    const messageElement = document.createElement("div");
    messageElement.className = `message ${sender}`;

    const now = new Date();
    const timeString = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    messageElement.innerHTML = `
            <div class="message-bubble">${text}</div>
            <div class="message-time">${timeString}</div>
        `;

    messagesContainer.appendChild(messageElement);

    // Animate message in
    gsap.fromTo(
      messageElement,
      { opacity: 0, y: 20, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: "power2.out" }
    );

    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Store in local history
    this.messageHistory.push({ sender, text, timestamp: now });
  }

  showTypingIndicator() {
    const indicator = this.conversationPanel.querySelector(".typing-indicator");
    indicator.classList.add("active");
  }

  hideTypingIndicator() {
    const indicator = this.conversationPanel.querySelector(".typing-indicator");
    indicator.classList.remove("active");
  }

  checkAchievementTriggers(playerMessage, characterResponse) {
    console.log(`🏆 CHECKING ACHIEVEMENTS for ${this.currentCharacter}`);
    console.log(`🏆 Player message: "${playerMessage}"`);
    console.log(`🏆 Character response: "${characterResponse}"`);

    // Check if the response contains achievement trigger words using AchievementManager
    if (this.gameEngine.achievementManager) {
      this.gameEngine.achievementManager.checkTriggers(
        this.currentCharacter,
        playerMessage,
        characterResponse
      );
    } else {
      console.warn("🏆 AchievementManager not available");
    }
  }

  updateCharacterInfo(character) {
    const characterName = this.currentCharacter
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    this.conversationPanel.querySelector(".character-name").textContent =
      characterName;
    this.conversationPanel.querySelector(".character-description").textContent =
      character.description;
  }

  clearMessages() {
    const messagesContainer = this.conversationPanel.querySelector(
      ".conversation-messages"
    );
    messagesContainer.innerHTML = "";
  }

  showConversation() {
    this.conversationPanel.style.display = "flex";

    // Animate in
    gsap.fromTo(
      this.conversationPanel,
      {
        opacity: 0,
        scale: 0.8,
        y: 50,
      },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.4,
        ease: "back.out(1.7)",
      }
    );
  }

  hideConversation() {
    gsap.to(this.conversationPanel, {
      opacity: 0,
      scale: 0.8,
      y: 50,
      duration: 0.3,
      ease: "power2.in",
      onComplete: () => {
        this.conversationPanel.style.display = "none";
      },
    });
  }

  endConversation() {
    if (!this.isConversationActive) return;

    this.isConversationActive = false;
    this.hideConversation();

    // Re-enable world interactions
    this.gameEngine.interactionHandler.setInteractionsEnabled(true);

    // Emit event
    GameEvents.emit(GAME_EVENTS.CONVERSATION_ENDED, {
      characterKey: this.currentCharacter,
      messageCount: this.messageHistory.length,
    });

    // Clear current conversation data
    this.currentCharacter = null;
    this.messageHistory = [];
    this.isWaitingForResponse = false;

    console.log("💬 Conversation ended");
  }

  // Get current conversation status
  getStatus() {
    return {
      isActive: this.isConversationActive,
      currentCharacter: this.currentCharacter,
      messageCount: this.messageHistory.length,
      isWaiting: this.isWaitingForResponse,
    };
  }

  destroy() {
    // End any active conversation
    if (this.isConversationActive) {
      this.endConversation();
    }

    // Remove conversation panel
    if (this.conversationPanel && this.conversationPanel.parentNode) {
      this.conversationPanel.parentNode.removeChild(this.conversationPanel);
    }

    console.log("🗑️ Conversation manager destroyed");
  }
}
