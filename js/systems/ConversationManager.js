class ConversationManager {
  constructor(gameEngine) {
    this.gameEngine = gameEngine;
    this.aiService = new AIService();
    this.currentCharacter = null;
    this.isConversationActive = false;
    this.conversationPanel = null;
    this.messageHistory = [];
    this.isWaitingForResponse = false;
    this.isClosing = false;

    this.createConversationUI();
    this.setupEventListeners();

    console.log("💬 Conversation manager initialized");
  }

  createConversationUI() {
    this.conversationPanel = document.createElement("div");
    this.conversationPanel.className = "conversation-panel";
    this.conversationPanel.innerHTML = `
      <div class="conversation-header">
        <div class="character-info">
          <div class="character-avatar"></div>
          <div class="character-details">
            <div class="character-name"></div>
            <div class="character-description"></div>
          </div>
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
    // Close button
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

    // Stop propagation on conversation panel clicks
    this.conversationPanel.addEventListener("click", (e) => {
      e.stopPropagation();
    });

    // Listen for location changes to close conversations
    GameEvents.on(GAME_EVENTS.LOCATION_CHANGED, () => {
      if (this.isConversationActive) {
        console.log("💬 Closing conversation due to location change");
        this.endConversation();
      }
    });
  }

  async startConversation(characterKey, character) {
    console.log(
      `💬 START CONVERSATION - Current: ${this.currentCharacter}, New: ${characterKey}, Active: ${this.isConversationActive}, Closing: ${this.isClosing}`
    );

    // If clicking the same character while conversation is active, do nothing
    if (
      this.isConversationActive &&
      this.currentCharacter === characterKey &&
      !this.isClosing
    ) {
      console.log(`💬 Already talking to ${characterKey}, ignoring click`);
      return;
    }

    // If currently closing a conversation, wait for it to complete
    if (this.isClosing) {
      console.log(`💬 Currently closing conversation, waiting...`);
      await this.waitForClose();
    }

    // If a different conversation is active, end it properly first
    if (this.isConversationActive && this.currentCharacter !== characterKey) {
      console.log(
        `💬 Switching conversation from ${this.currentCharacter} to ${characterKey}`
      );
      await this.endConversationAndWait();
    }

    // Double-check we're not in a closing state after waiting
    if (this.isClosing) {
      await this.waitForClose();
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
    const greetingResponse = await this.generateGreeting(character, history);
    console.log(`💬 Generated greeting response:`, greetingResponse);

    // Extract dialogue from JSON response
    const greetingText = this.extractDialogue(greetingResponse);
    this.addMessage("character", greetingText);

    // Focus input
    this.conversationPanel.querySelector(".conversation-input").focus();

    // Emit event
    GameEvents.emit(GAME_EVENTS.CONVERSATION_STARTED, {
      characterKey,
      character,
    });

    console.log(`💬 Conversation with ${characterKey} fully initialized`);
  }

  // Helper method to wait for conversation to finish closing
  async waitForClose() {
    return new Promise((resolve) => {
      const checkClosed = () => {
        if (!this.isClosing && !this.isConversationActive) {
          resolve();
        } else {
          setTimeout(checkClosed, 50);
        }
      };
      checkClosed();
    });
  }

  // End conversation and wait for it to complete
  async endConversationAndWait() {
    this.endConversation();
    await this.waitForClose();
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
    // Simple JSON greeting based on character personality
    const prompt = character.prompt.toLowerCase();

    if (prompt.includes("shy") || prompt.includes("bashful")) {
      return {
        internal_monologue:
          "Oh no, someone's here. I wasn't expecting visitors and I feel so nervous.",
        dialogue: "Oh! H-hello there... I wasn't expecting visitors...",
      };
    } else if (prompt.includes("wise") || prompt.includes("ancient")) {
      return {
        internal_monologue:
          "Another seeker has found their way to me. I sense they have questions.",
        dialogue: "Welcome, young traveler. I sense you have questions to ask.",
      };
    } else if (prompt.includes("cheerful") || prompt.includes("excited")) {
      return {
        internal_monologue:
          "Oh wonderful! A new friend has come to visit! This is so exciting!",
        dialogue:
          "Oh wonderful! A new friend has come to visit! How delightful!",
      };
    } else if (prompt.includes("mysterious")) {
      return {
        internal_monologue:
          "So they've found me at last. I wondered when someone would come with the right questions.",
        dialogue:
          "Ah... so you've found me. I wondered when someone would come asking the right questions...",
      };
    } else {
      return {
        internal_monologue:
          "A new visitor has arrived in our garden. I should be welcoming.",
        dialogue:
          "Hello there! Nice to meet you. What brings you to our garden?",
      };
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
      const responseData = await this.aiService.generateResponse(
        this.currentCharacter,
        message,
        history
      );
      console.log(`💬 AI RESPONSE RECEIVED:`, responseData);

      // Hide typing indicator
      this.hideTypingIndicator();

      // Extract dialogue and ignore internal monologue
      const dialogueText = this.extractDialogue(responseData);

      // Add character response
      this.addMessage("character", dialogueText);

      // Save to conversation history (save the dialogue text, not the full JSON)
      this.gameEngine.gameState.addConversation(
        this.currentCharacter,
        message,
        dialogueText
      );
      console.log(`💬 Conversation saved to game state`);

      // Check for achievement triggers using the dialogue text
      this.checkAchievementTriggers(message, dialogueText);
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

  // Extract dialogue text from various response formats
  extractDialogue(responseData) {
    // If it's already a proper object with dialogue property
    if (
      typeof responseData === "object" &&
      responseData &&
      responseData.dialogue
    ) {
      return responseData.dialogue;
    }

    // If it's a string, try to extract dialogue from various formats
    if (typeof responseData === "string") {
      const text = responseData.trim();

      // Try to parse as JSON first
      try {
        const parsed = JSON.parse(text);
        if (parsed.dialogue) {
          return parsed.dialogue;
        }
      } catch (e) {
        // Not valid JSON, continue with string parsing
      }

      // Handle format: (internal_monologue: ...) (dialogue: ...)
      const dialogueMatch = text.match(/\(dialogue:\s*([^)]+)\)/);
      if (dialogueMatch) {
        return dialogueMatch[1].trim();
      }

      // Handle format: "dialogue": "text"
      const quotedDialogueMatch = text.match(/"dialogue":\s*"([^"]+)"/);
      if (quotedDialogueMatch) {
        return quotedDialogueMatch[1].trim();
      }

      // Handle format: dialogue: text (without quotes or parentheses)
      const simpleDialogueMatch = text.match(
        /dialogue:\s*(.+?)(?:\n|$|internal_monologue)/i
      );
      if (simpleDialogueMatch) {
        return simpleDialogueMatch[1].trim().replace(/[",]/g, "");
      }

      // Handle format where dialogue comes after internal_monologue
      const afterMonologueMatch = text.match(
        /internal_monologue:.*?dialogue:\s*(.+?)(?:\}|$)/is
      );
      if (afterMonologueMatch) {
        return afterMonologueMatch[1].trim().replace(/[",]/g, "");
      }

      // If no dialogue pattern found but it looks like it contains dialogue markers
      if (text.includes("dialogue:")) {
        // Extract everything after 'dialogue:' until end or next field
        const afterDialogue = text.split("dialogue:")[1];
        if (afterDialogue) {
          return afterDialogue
            .trim()
            .replace(/^[",\s]+|[",\s]+$/g, "")
            .split(/[}\n]/)[0]
            .trim();
        }
      }

      // If none of the above patterns match, check if it's just plain dialogue text
      // (no internal_monologue markers)
      if (!text.includes("internal_monologue") && !text.includes("dialogue:")) {
        return text;
      }
    }

    console.warn("💬 Could not extract dialogue from response:", responseData);
    return "I'm having trouble finding the right words...";
  }

  // Update character thoughts display (internal use only - not shown to player)
  updateCharacterThoughts(thoughts) {
    // This method exists for potential future use or debugging
    // The internal monologue is not displayed to the player
    if (CONFIG.DEBUG && thoughts) {
      console.log(`💭 ${this.currentCharacter} thinks: ${thoughts}`);
    }
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

    // Update character avatar
    const avatar = this.conversationPanel.querySelector(".character-avatar");
    const imagePath = `images/characters/${character.img}.png`;
    const preloadedImage = this.gameEngine.renderer.assetManager.getImage(
      `characters/${character.img}`
    );

    if (preloadedImage) {
      avatar.style.backgroundImage = `url(${preloadedImage.src})`;
    } else {
      avatar.style.backgroundImage = `url(${imagePath})`;
    }

    avatar.style.backgroundSize = "cover";
    avatar.style.backgroundPosition = "center";
    avatar.style.backgroundRepeat = "no-repeat";
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
      { opacity: 0, scale: 0.8, y: 50 },
      { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: "back.out(1.7)" }
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
        this.isClosing = false;
      },
    });
  }

  endConversation() {
    if (!this.isConversationActive || this.isClosing) return;

    console.log(`💬 Ending conversation with ${this.currentCharacter}`);

    this.isClosing = true;
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
      isClosing: this.isClosing,
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
