// api/chat.js - Place this file in an 'api' folder at your project root
export default async function handler(req, res) {
  // Enable CORS for your domain
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    console.log("🤖 Proxying request to OpenRouter API");

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
      console.error(
        "❌ OpenRouter API Error:",
        response.status,
        response.statusText
      );
      const errorData = await response.json().catch(() => ({}));
      return res.status(response.status).json({
        error: errorData.error?.message || "API request failed",
        status: response.status,
      });
    }

    const data = await response.json();
    console.log("✅ OpenRouter API Success");
    res.status(200).json(data);
  } catch (error) {
    console.error("💥 Server Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
