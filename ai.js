// ai.js

import express from "express";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 6969;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.send("🧠 ZEX Chat API is running.");
});

// Main chat endpoint
app.post("/api/chat", async (req, res) => {
  const { prompt } = req.body;

  if (!OPENROUTER_API_KEY) {
    return res.status(500).json({ error: "Missing OpenRouter API key." });
  }

  if (!prompt || typeof prompt !== "string" || prompt.trim() === "") {
    return res.status(400).json({ error: "Missing or invalid prompt." });
  }

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openrouter/cypher-alpha:free",
        messages: [{ role: "user", content: prompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://zex.dortz.zone",
          "X-Title": "ZEX-Core",
        },
      }
    );

    const reply = response.data.choices?.[0]?.message?.content;
    if (!reply) throw new Error("Empty response from model.");

    res.json({ reply });
  } catch (err) {
    console.error("ZEX Error:", err?.response?.data || err.message);
    res.status(500).json({ error: "ZEX brain fried. Try again later." });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 ZEX Chat API running at http://localhost:${PORT}`);
});