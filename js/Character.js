// Character.js - Character data and behavior
class Character {
  constructor(id, name, imagePath, description, personality) {
    this.id = id;
    this.name = name;
    this.imagePath = imagePath;
    this.description = description;
    this.personality = personality;
    this.chatHistory = [];
  }

  getInfo() {
    return this.description;
  }

  addToChatHistory(sender, message) {
    this.chatHistory.push({ sender, message, timestamp: new Date() });
  }

  getChatHistory() {
    return this.chatHistory;
  }

  clearChatHistory() {
    this.chatHistory = [];
  }

  getPersonality() {
    return this.personality;
  }
}
