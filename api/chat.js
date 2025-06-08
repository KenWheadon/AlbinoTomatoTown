// api/chat.js - Vercel serverless function
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    console.log("🌐 CORS preflight request");
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== "POST") {
    console.log(`❌ Method ${req.method} not allowed`);
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    console.log("🤖 Proxying request to OpenRouter API");
    console.log("🔑 API Key present:", !!process.env.OPENROUTER_API_KEY);
    console.log("🌐 Site URL:", process.env.SITE_URL);
    console.log("📝 Site Title:", process.env.SITE_TITLE);

    // Validate that we have the required environment variables
    if (!process.env.OPENROUTER_API_KEY) {
      console.error("❌ OPENROUTER_API_KEY environment variable not set");
      return res.status(500).json({
        error: "Server configuration error: API key not configured",
      });
    }

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.SITE_URL || "https://your-game-site.com",
          "X-Title": process.env.SITE_TITLE || "Albino Tomato Town",
        },
        body: JSON.stringify(req.body),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ OpenRouter API Error:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });

      return res.status(response.status).json({
        error: `OpenRouter API error: ${response.statusText}`,
        details: errorText,
        status: response.status,
      });
    }

    const data = await response.json();
    console.log("✅ OpenRouter API Success - Response received");

    res.status(200).json(data);
  } catch (error) {
    console.error("💥 Server Error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
}
