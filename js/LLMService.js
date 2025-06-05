// LLMService.js - Handles LLM communication via Vercel API proxy
class LLMService {
  constructor() {
    this.apiEndpoint = "/api/chat";
    this.model =
      window.CONFIG?.MODEL || "deepseek/deepseek-r1-0528-qwen3-8b:free";
    this.maxTokens = window.CONFIG?.MAX_TOKENS || 10000;
  }

  async getResponse(userMessage, chatHistory, personality) {
    try {
      const prompt = this.buildPrompt(userMessage, chatHistory, personality);
      const response = await this.callVercelAPI(prompt);
      return response;
    } catch (error) {
      console.error("LLM API Error:", error);
      // Fallback to mock response on error
      return this.getMockResponse(userMessage, personality);
    }
  }

  async callVercelAPI(messages) {
    const response = await fetch(this.apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        messages: messages,
        max_tokens: this.maxTokens,
        temperature: 0.7,
        top_p: 0.9,
        frequency_penalty: 0.1,
        presence_penalty: 0.1,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `API error: ${response.status} - ${errorData.error || "Unknown error"}`
      );
    }

    const data = await response.json();

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error("Invalid response format from API");
    }

    return data.choices[0].message.content;
  }

  buildPrompt(userMessage, chatHistory, personality) {
    const messages = [
      {
        role: "system",
        content: `You are an Albino Tomato character in a whimsical garden town game. Your personality: ${personality}

Key traits:
- You are a wise, gentle albino tomato who has been growing in this garden for years
- You speak thoughtfully about garden life and nature
- You have a cheerful but contemplative demeanor
- You sometimes reference your unique albino appearance and how it affects your perspective
- Keep responses conversational and in-character
- Respond in 1-3 sentences typically, staying engaging but concise
- Show curiosity about the player and their world outside the garden`,
      },
    ];

    // Add recent chat history (last 10 messages to stay within token limits)
    const recentHistory = chatHistory.slice(-10);
    for (const entry of recentHistory) {
      messages.push({
        role: entry.sender === "user" ? "user" : "assistant",
        content: entry.message,
      });
    }

    // Add current user message
    messages.push({
      role: "user",
      content: userMessage,
    });

    return messages;
  }

  getMockResponse(userMessage, personality) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const responses = this.generateMockResponses(userMessage, personality);
        const response =
          responses[Math.floor(Math.random() * responses.length)];
        resolve(response);
      }, 1000 + Math.random() * 2000);
    });
  }

  generateMockResponses(userMessage, personality) {
    const tomatoResponses = [
      `As an albino tomato, I see the world a bit differently than my red cousins. You mentioned "${
        userMessage.split(" ")[0]
      }" - that's fascinating!`,
      `I've been growing here for years, watching the seasons change. What you said about "${
        userMessage.split(" ")[0]
      }" reminds me of something...`,
      `My pale skin lets me see things others might miss. Tell me more about what brought that thought to your mind?`,
      `The garden has taught me patience and wisdom. Your words about "${
        userMessage.split(" ")[0]
      }" make me curious - what's your world like outside this garden?`,
      `Being different has its advantages - I glow softly under moonlight, you know! But enough about me, what made you think of that?`,
    ];

    if (personality.includes("cheerful")) {
      tomatoResponses.push(
        `Oh my vines! That sounds wonderful! I love hearing about ${
          userMessage.split(" ")[0]
        } from visitors like you!`
      );
    }

    if (personality.includes("wise")) {
      tomatoResponses.push(
        `In my seasons of growth, I've learned that ${
          userMessage.split(" ")[0]
        } often reveals deeper truths about life.`
      );
    }

    return tomatoResponses;
  }
}
