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
    this.styleConversationPanel();
    this.hideConversation();
  }

  styleConversationPanel() {
    const style = document.createElement("style");
    style.textContent = `
            .conversation-panel {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 500px;
                max-width: 90vw;
                max-height: 80vh;
                background: rgba(255,255,255,0.95);
                border-radius: 16px;
                padding: 0;
                box-shadow: 0 20px 40px rgba(0,0,0,0.4);
                z-index: 1000;
                backdrop-filter: blur(10px);
                border: 2px solid rgba(74,93,58,0.3);
                display: flex;
                flex-direction: column;
            }
            
            .conversation-header {
                padding: 16px 20px;
                border-bottom: 1px solid rgba(0,0,0,0.1);
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: rgba(74,93,58,0.1);
                border-radius: 14px 14px 0 0;
            }
            
            .character-info {
                flex: 1;
            }
            
            .character-name {
                font-size: 18px;
                font-weight: bold;
                color: #2d3d2d;
                margin-bottom: 4px;
            }
            
            .character-description {
                font-size: 12px;
                color: #666;
                font-style: italic;
            }
            
            .close-conversation {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #666;
                padding: 4px 8px;
                border-radius: 4px;
                transition: all 0.2s;
            }
            
            .close-conversation:hover {
                background: rgba(255,0,0,0.1);
                color: #ff4444;
            }
            
            .conversation-messages {
                flex: 1;
                overflow-y: auto;
                padding: 20px;
                min-height: 200px;
                max-height: 300px;
            }
            
            .message {
                margin-bottom: 16px;
                display: flex;
                flex-direction: column;
            }
            
            .message.player {
                align-items: flex-end;
            }
            
            .message.character {
                align-items: flex-start;
            }
            
            .message-bubble {
                max-width: 80%;
                padding: 12px 16px;
                border-radius: 18px;
                font-size: 14px;
                line-height: 1.4;
                word-wrap: break-word;
            }
            
            .message.player .message-bubble {
                background: #4a5d3a;
                color: white;
                border-bottom-right-radius: 6px;
            }
            
            .message.character .message-bubble {
                background: #f0f0f0;
                color: #333;
                border-bottom-left-radius: 6px;
            }
            
            .message-time {
                font-size: 10px;
                color: #999;
                margin-top: 4px;
                padding: 0 8px;
            }
            
            .conversation-input-area {
                padding: 16px 20px;
                border-top: 1px solid rgba(0,0,0,0.1);
                display: flex;
                gap: 10px;
                background: rgba(255,255,255,0.8);
                border-radius: 0 0 14px 14px;
            }
            
            .conversation-input {
                flex: 1;
                padding: 12px 16px;
                border: 2px solid #ddd;
                border-radius: 24px;
                font-size: 14px;
                outline: none;
                transition: border-color 0.2s;
            }
            
            .conversation-input:focus {
                border-color: #4a5d3a;
            }
            
            .send-button {
                padding: 12px 20px;
                background: #4a5d3a;
                color: white;
                border: none;
                border-radius: 24px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 600;
                transition: all 0.2s;
                min-width: 70px;
            }
            
            .send-button:hover {
                background: #5d7a4a;
                transform: translateY(-1px);
            }
            
            .send-button:disabled {
                background: #ccc;
                cursor: not-allowed;
                transform: none;
            }
            
            .conversation-footer {
                padding: 8px 20px;
                min-height: 20px;
            }
            
            .typing-indicator {
                display: none;
                align-items: center;
                gap: 8px;
                color: #666;
                font-size: 12px;
            }
            
            .typing-indicator.active {
                display: flex;
            }
            
            .typing-dots {
                display: flex;
                gap: 2px;
            }
            
            .typing-dots span {
                width: 4px;
                height: 4px;
                background: #4a5d3a;
                border-radius: 50%;
                animation: typing 1.4s infinite;
            }
            
            .typing-dots span:nth-child(2) {
                animation-delay: 0.2s;
            }
            
            .typing-dots span:nth-child(3) {
                animation-delay: 0.4s;
            }
            
            @keyframes typing {
                0%, 60%, 100% { transform: translateY(0); }
                30% { transform: translateY(-10px); }
            }
        `;
    document.head.appendChild(style);
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

    // REMOVED: Escape key to close - now only X button closes
    // REMOVED: Click outside to close - now only X button closes

    // Stop propagation on conversation panel clicks to prevent outside clicks
    this.conversationPanel.addEventListener("click", (e) => {
      e.stopPropagation();
    });
  }

  async startConversation(characterKey, character) {
    if (this.isConversationActive) {
      this.endConversation();
    }

    this.currentCharacter = characterKey;
    this.isConversationActive = true;
    this.messageHistory = [];

    // Update UI
    this.updateCharacterInfo(character);
    this.clearMessages();
    this.showConversation();

    // Disable world interactions
    this.gameEngine.interactionHandler.setInteractionsEnabled(false);

    // Get conversation history
    const history =
      this.gameEngine.gameState.getConversationHistory(characterKey);

    // Generate greeting
    const greeting = await this.generateGreeting(character, history);
    this.addMessage("character", greeting);

    // Focus input
    this.conversationPanel.querySelector(".conversation-input").focus();

    // Emit event
    GameEvents.emit(GAME_EVENTS.CONVERSATION_STARTED, {
      characterKey,
      character,
    });

    console.log(`💬 Started conversation with ${characterKey}`);
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
      return;
    }

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

      // Generate AI response
      const response = await this.aiService.generateResponse(
        this.currentCharacter,
        message,
        history
      );

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

      // Check for achievement triggers
      this.checkAchievementTriggers(message, response);
    } catch (error) {
      console.error("Error generating response:", error);
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
    // Check if the response contains achievement trigger words
    const triggeredAchievements = this.aiService.checkAchievementTriggers(
      this.currentCharacter,
      characterResponse
    );

    // Also check player message for secrets they might have uncovered
    const playerTriggeredAchievements = this.aiService.checkAchievementTriggers(
      this.currentCharacter,
      playerMessage
    );

    const allTriggered = [
      ...triggeredAchievements,
      ...playerTriggeredAchievements,
    ];

    allTriggered.forEach((achievementId) => {
      this.gameEngine.gameState.unlockAchievement(achievementId);
    });
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
