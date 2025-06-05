// ChatSystem.js - Manages chat interface and history
class ChatSystem {
  constructor(character, llmService) {
    this.character = character;
    this.llmService = llmService;
    this.chatHistory = document.getElementById("chat-history");
    this.chatInput = document.getElementById("chat-input");
    this.sendButton = document.getElementById("send-button");

    this.setupEventListeners();
  }

  setupEventListeners() {
    this.sendButton.addEventListener("click", () => {
      this.sendMessage();
    });

    this.chatInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        this.sendMessage();
      }
    });
  }

  async sendMessage() {
    const message = this.chatInput.value.trim();
    if (!message) return;

    // Disable input while processing
    this.setInputEnabled(false);

    // Add user message to history
    this.addMessage("user", message);
    this.character.addToChatHistory("user", message);

    // Clear input
    this.chatInput.value = "";

    try {
      // Get LLM response
      const response = await this.llmService.getResponse(
        message,
        this.character.getChatHistory(),
        this.character.getPersonality()
      );

      // Add character response to history
      this.addMessage("character", response);
      this.character.addToChatHistory("character", response);
    } catch (error) {
      console.error("LLM Error:", error);
      this.addMessage(
        "character",
        "I'm having trouble thinking right now... could you try again?"
      );
    } finally {
      this.setInputEnabled(true);
    }
  }

  addMessage(sender, message) {
    const messageDiv = document.createElement("div");
    messageDiv.className = `chat-message ${sender}-message`;
    messageDiv.textContent = message;
    this.chatHistory.appendChild(messageDiv);
    this.chatHistory.scrollTop = this.chatHistory.scrollHeight;
  }

  setInputEnabled(enabled) {
    this.chatInput.disabled = !enabled;
    this.sendButton.disabled = !enabled;
    this.sendButton.textContent = enabled ? "Send" : "Thinking...";
  }

  clearChat() {
    this.chatHistory.innerHTML = "";
    this.character.clearChatHistory();
  }
}
