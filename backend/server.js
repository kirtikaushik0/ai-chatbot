const express = require("express");
const cors = require("cors");
const Groq = require("groq-sdk");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  methods: ["GET", "POST"],
  credentials: true,
}));
app.use(express.json());

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Messages array is required." });
    }

    const systemMessage = {
      role: "system",
      content: "You are a helpful, friendly, and knowledgeable AI assistant.",
    };

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [systemMessage, ...messages],
      max_tokens: 1024,
    });

    const reply = completion.choices[0].message;
    const usage = completion.usage;

    res.json({
      message: reply,
      usage: {
        promptTokens: usage.prompt_tokens,
        completionTokens: usage.completion_tokens,
        totalTokens: usage.total_tokens,
      },
    });
  } catch (error) {
    console.error("Groq API error:", error);
    if (error.status === 401) return res.status(401).json({ error: "Invalid Groq API key." });
    if (error.status === 429) return res.status(429).json({ error: "Rate limit exceeded." });
    res.status(500).json({ error: "An unexpected error occurred." });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});